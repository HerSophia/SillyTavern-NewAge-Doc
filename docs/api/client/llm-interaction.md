---
title: LLM 交互
---

# LLM 交互 (LLM Interaction)

本指南将详细介绍客户端如何通过 `/llm` 命名空间与 SillyTavern-NewAge 服务器连接的 LLM 进行交互。

## 1. 连接到 /llm 命名空间

在与 LLM 交互之前，您需要先连接到 `/llm` 命名空间。

```javascript
import { io } from 'socket.io-client';

const serverAddress = 'http://localhost';
const serverPort = 4000;
const clientId = 'my-client';
const clientType = 'web-app';
const clientKey = 'your-secret-key';

const authData = {
  clientType: clientType,
  clientId: clientId,
  key: clientKey,
};

const llmSocket = io(`${serverAddress}:${serverPort}/llm`, {
  auth: authData,
});

llmSocket.on('connect', () => {
  console.log('Connected to /llm namespace!');
});

llmSocket.on('connect_error', (error) => {
  console.error('LLM connection error:', error);
});
```

## 2. 发送 LLM 请求 (`MSG_TYPE.LLM_REQUEST`)

要向 LLM 发送请求，您需要发送 `MSG_TYPE.LLM_REQUEST` 事件。

* **事件名:** `MSG_TYPE.LLM_REQUEST`
* **命名空间:** `/llm`
* **数据:**  一个对象，包含以下字段：
  * `target`:  `string`，目标 SillyTavern 扩展的 `clientId`。
  * `requestId`:  `string`，唯一的请求 ID (由客户端生成)。
  * `message`:  `string`，发送给 LLM 的消息文本。
  * `requestType`: `string`，请求类型，用于控制生成文本的行为。目前有两种类型：
    * `newMessage`:  指示生成新的文本。
    * `regenerateMessage`: 指示重新生成文本 (通常用于“重试”功能)。
  * ... (其他 LLM 请求参数，取决于您使用的 LLM 接口和 SillyTavern 扩展的设置，当前仅支持文本消息)

```javascript
import { v4 as uuidv4 } from 'uuid';

function sendLLMRequest(message, targetClientId, requestType) {
  const requestId = uuidv4();
  llmSocket.emit(
    'MSG_TYPE.LLM_REQUEST',
    {
      target: targetClientId,
      requestId: requestId,
      message: message,
      requestType: requestType, // 'newMessage' 或 'regenerateMessage'
      // ... 其他 LLM 参数 ...
    },
    (response) => {
      // (可选) 处理同步响应
      if (response && response.status === 'error') {
        console.error('LLM request error:', response.message);
      }
    }
  );
}

// 示例：发送新消息
sendLLMRequest('Tell me a joke.', 'sillytavern-client-id', 'newMessage');

// 示例：重新生成消息
// sendLLMRequest('', 'sillytavern-client-id', 'regenerateMessage'); // 通常不需要消息内容
```

> [!TIP]
> `target`:  在发送 LLM 请求或函数调用时，需要指定目标 SillyTavern 的 `clientId` (除非你调用的是服务器端函数)。

## 3. 接收 LLM 响应

LLM 的响应可以通过两种方式接收：流式响应和非流式响应。

### 3.1. 流式响应 (`streamed_data` 事件)

* **事件名:** `streamed_data`
* **命名空间:** `/llm`
* **导入：**

    ```javascript
    import * as ss from '../../lib/@sap_oss/node-socketio-stream.js';
    import { io } from '../../lib/Socket.io/socket.io.js';
    ```

* **数据:**  一个对象和一个可读流。
* **必须的依赖：**`@sap_oss/node-socketio-stream`
  * 对象包含以下字段：
    * `streamId`:  `string`，流 ID。
    * `outputId`:  `string`，输出 ID。
    * `requestId`:  `string`，请求 ID。
    * `source`:  `string`，消息来源 (通常是 'server')。
    * ... (其他字段)
  * 可读流: 用于接收流式数据。

```javascript
import ss from '@sap_oss/node-socketio-stream';

ss(llmSocket).on('streamed_data', (stream, data) => {
  console.log(
    `Received stream for request ${data.requestId}, stream ${data.streamId}`
  );

  stream.on('data', (chunk) => {
    // 处理接收到的数据块 (通常是文本片段)
    console.log('Received chunk:', chunk.toString());
    // 将 chunk 显示在界面上
  });

  stream.on('end', () => {
    // 流结束
    console.log('Stream ended');
  });

  stream.on('error', (error) => {
    // 流错误
    console.error('Stream error:', error);
  });
});

```

> [!TIP]
> 建议使用`streamToElement` 函数来处理流式数据，并实时更新到 HTML 元素，具有缓冲区功能。具体用法请参考[最佳实践](#最佳实践javascript)

### 3.2. 非流式响应 (`message` 事件)

* **事件名:** `message`
* **命名空间:** `/llm`
* **数据:**  一个对象，其结构取决于消息类型 (通常是 `MSG_TYPE.LLM_RESPONSE` 或类似的消息)。

```javascript
llmSocket.on('message', (data) => {
  if (data.type === 'MSG_TYPE.LLM_RESPONSE') {
    // 处理非流式 LLM 响应
    console.log('Received LLM response:', data.response);
  }
});
```

## 4. 错误处理

请监听`MSG_TYPE.ERROR`事件

```javascript
llmSocket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 注意事项

* **请求 ID:**  对于每个 LLM 请求，都应该生成一个唯一的 `requestId`，以便将响应与请求正确地关联起来。
* **流式 vs. 非流式:**  根据您的需求选择合适的响应方式。流式响应可以提供更好的用户体验（逐步显示文本），但处理起来更复杂。
* **`@sap_oss/node-socketio-stream`:**  如果您使用流式响应，您需要安装 `@sap_oss/node-socketio-stream` 库。
* **目标 SillyTavern**:  在发送 LLM 请求或函数调用时，需要指定目标 SillyTavern 的 `clientId` (除非你调用的是服务器端函数)。
* **消息类型和常量**：请参考`lib/constants.js`的内容。
