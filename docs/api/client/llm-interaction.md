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
  * `target`: `string | string[]`，目标 SillyTavern 扩展的 `clientId`（或 `clientId` 数组，用于多目标请求）。
  * `requestId`: `string`，唯一的请求 ID (由客户端生成)。
  * `message`: `string`，发送给 LLM 的消息文本。
  * `role`: `string`，客户端的角色
  * ... (其他 LLM 请求参数, 取决于您使用的 LLM 接口和 SillyTavern 扩展的设置, 当前仅支持文本消息)

```javascript
import { v4 as uuidv4 } from 'uuid';

function sendLLMRequest(message, targetClientIds, role) { // 修改：targetClientIds 可以是数组
  const requestId = uuidv4();
  const target = Array.isArray(targetClientIds) ? targetClientIds : [targetClientIds]; // 确保 target 是数组

  llmSocket.emit(
    MSG_TYPE.LLM_REQUEST,
    {
      target: target,
      requestId: requestId,
      message: message,
      role: role,
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

// 示例：发送给单个 SillyTavern
sendLLMRequest('Tell me a joke.', 'sillytavern-client-id', 'guest');

// 示例：发送给多个 SillyTavern
sendLLMRequest('Tell me a joke.', ['st-client-1', 'st-client-2'], 'guest');
```

> [!TIP]
> `target`:  在发送 LLM 请求时，需要指定目标 SillyTavern 的 `clientId`（或 `clientId` 数组）。

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
    * `streamId`: `string`，流 ID。
    * `outputId`: `string`，输出 ID。（当前未使用）
    * `requestId`: `string`，请求 ID。
    * `source`: `string`，消息来源 (通常是 'server')。
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
> 建议使用`streamToElement` 函数来处理流式数据，并实时更新到 HTML 元素，具有缓冲区功能。具体用法请参考[最佳实践](./best-practices)

### 3.2. 非流式响应 (`message` 事件)

* **事件名:** `message`
* **命名空间:** `/llm`
* **数据:**  一个对象，其结构取决于消息类型 (通常是 `MSG_TYPE.NON_STREAM`)。

```javascript
llmSocket.on('message', (data) => {
  if (data.type === MSG_TYPE.NON_STREAM) {
    // 处理非流式 LLM 响应
     console.log('Received non-stream message:', data.data);
  }
});
```

## 4. 监听其他客户端的消息 (`NEW_MESSAGE`)

除了 LLM 响应，您可能还想监听房间内其他客户端发送的消息。

* **事件名:** `NEW_MESSAGE`
* **命名空间：**  `/llm`（或其他任何命名空间）
* **数据:**  一个消息对象，包含消息内容、发送者、时间戳等信息。

```javascript
    llmSocket.on(MSG_TYPE.NEW_MESSAGE, (data) => {
        console.log('Received new message from another client:', data);
        // 在这里处理/显示消息
    });
```

## 5. 编辑和删除消息

客户端可以发送 `EDIT_MESSAGE` 和 `DELETE_MESSAGE` 事件来编辑或删除消息（包括 LLM 的响应消息）。注意，编辑消息只能同时编辑一条消息，但删除消息可以删除多条消息。

* **`EDIT_MESSAGE`:**
  * **事件名:**  `MSG_TYPE.EDIT_MESSAGE`
  * **数据:**

      ```
      {
        roomName: string;
        messageId: string;
        updatedMessage: object; // 更新后的消息内容 (部分更新)
        fromLlm: boolean;
        responseId?: string; // 如果编辑的是 LLM 响应，则需要提供
      }
      ```

* **`DELETE_MESSAGE`:**
  * **事件名:**  `MSG_TYPE.DELETE_MESSAGE`
  * **数据:**
  
      ```
      {
        roomName: string;
        messageId: string | string[];
        responseId?: string | string[]; // 如果删除的是 LLM 响应，则需要提供
      }
      ```

## 6.上下文结构

* 一个典型的消息对象可能包含以下字段：

```javascript
{
  messageId: string;     // 消息的唯一 ID (无论来自客户端还是 LLM，都有)
  timestamp: Date;       // 消息的时间戳
  fromClient?: boolean;   // 可选, 标记消息是否来自客户端
  fromLlm?: boolean;      // 可选, 标记消息是否来自 LLM
  clientId?: string;      // 如果来自客户端，则有 clientId
  responseId?: string;   // 如果来自 LLM，则有 responseId (用于区分同一请求的不同响应)
  requestId?: string;    // 如果来自 LLM，则有 requestId (标识原始请求)
  // ... 其他消息内容字段 (例如 message, role, name, is_streaming, delta, ...)，根据你的具体需求而定
}
```

**示例：**

```javascript
[
  {
    messageId: "msg-1",
    timestamp: "2024-07-24T10:00:00.000Z",
    fromClient: true,
    clientId: "user-123",
    message: "你好！",
    role: "user",
  },
  {
    messageId: "msg-2",
    timestamp: "2024-07-24T10:00:05.000Z",
    fromLlm: true,
    requestId: "req-1",
    responseId: "resp-1",
    message: "你好！我是 AI 助手。",
    role: "assistant",
  },
  {
    messageId: "msg-3",
    timestamp: "2024-07-24T10:00:10.000Z",
    fromClient: true,
    clientId: "user-123",
    message: "请介绍一下你自己。",
    role: "user",
  },
  {
    messageId: "msg-4",
    timestamp: "2024-07-24T10:00:15.000Z",
    fromLlm: true,
    requestId: "req-2",  // 注意：这里是 req-2，假设这是另一个请求
    responseId: "resp-2",
    message: "我是一个大型语言模型...",
    role: "assistant",// 不一定会有
   },
  {
    messageId: "msg-5",
    timestamp: "2024-07-24T10:00:17.000Z",
    fromLlm: true,
    requestId: "req-2", // 和上一个响应属于同一个请求
    responseId: "resp-3", // 但是 responseId 不同，通常是 重新生成 或者 发送请求至多个扩展 这两种情况
    message: "...经过大量文本数据训练...",
    role: "assistant", // 不一定会有
  }
]
```

## 7. 错误处理

请监听`MSG_TYPE.ERROR`事件

```javascript
llmSocket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 注意事项

* **请求 ID:** 对于每个 LLM 请求，都应该生成一个唯一的 `requestId`，以便将响应与请求正确地关联起来。
* **响应 ID:**  对于每个 LLM 响应，服务器会生成一个唯一的`responseId`。
* **流式 vs. 非流式:** 根据您的需求选择合适的响应方式。流式响应可以提供更好的用户体验（逐步显示文本），但处理起来更复杂。
* **`@sap_oss/node-socketio-stream`:** 如果您使用流式响应，您需要安装 `@sap_oss/node-socketio-stream` 库。
* **目标 SillyTavern:** 在发送 LLM 请求或函数调用时，需要指定目标 SillyTavern 的 `clientId` (除非你调用的是服务器端函数)。
* **消息类型和常量:** 请参考`lib/constants.js`的内容。
* **重要逻辑:** 在接受 LLM 响应时，客户端应当不允许发送/编辑/删除任何消息，否则容易出现消息记录混乱的问题。如果确实需要这样的操作，那么可以在接受完LLM响应后再发送对应的消息事件，即延迟发送。
