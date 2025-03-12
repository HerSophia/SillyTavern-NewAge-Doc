---
title: 快速开始(客户端)
---

# 快速开始 (客户端 API)

本指南将引导您快速创建一个可以与 SillyTavern-NewAge 服务器交互的客户端（例如，独立的 Web 应用、桌面应用、移动应用）。

> [!NOTE]
> 本指南假设您的客户端运行在**内部服务器**上（即与 SillyTavern-NewAge 服务器在同一台机器或局域网内）。如果您的客户端运行在外部服务器上，请参考[外部服务器开发文档](待补充)。

## 1. 概述

SillyTavern-NewAge 服务器是一个基于 Node.js 和 Socket.IO 的实时通信服务器。它通过不同的**命名空间 (namespaces)** 来组织功能，客户端需要连接到相应的命名空间才能使用特定功能。

## 2. 客户端设置

在开始编写客户端代码之前，您需要在服务器上为您的客户端创建一个设置文件。

* **位置:**  `server/settings` 文件夹
* **文件名:**  应与您的客户端 ID (`clientId`) 相同 (例如 `my-client.json`)。
* **内容:**

    ```json
    {
      "clientId": "my-client",
      "isTrust": true
    }
    ```

  * `clientId`: 客户端的唯一标识符 (自定义，但要确保唯一性)。
  * `isTrust`: **必须设置为 `true`**，否则服务器将拒绝连接。

> [!IMPORTANT]
> 您可以通过手动创建此文件，或在您的客户端代码中调用 `/server/dist/function_call.js` 文件中的 `saveJsonToFile` 函数来自动创建。

## 3. 连接到服务器 (JavaScript 示例)

以下是一个使用 JavaScript 和 Socket.IO 客户端库连接到服务器的示例：

```javascript
import { io } from 'socket.io-client';
// 请确保你已经安装了 socket.io-client:  npm install socket.io-client
// 如果使用CDN，请参考：https://socket.io/zh-CN/docs/v4/cdn/

const serverAddress = 'http://localhost';
const serverPort = 4000;
const clientId = 'my-client'; // 与 settings.json 中的 clientId 相同
const clientType = 'web-app'; // 自定义客户端类型
const clientKey = 'your-secret-key'; // 从SillyTavern扩展处复制

// 认证信息
const authData = {
  clientType: clientType,
  clientId: clientId,
  key: clientKey, // 最好从服务器安全地获取，而不是硬编码
};

// 连接到默认命名空间
const socket = io(`${serverAddress}:${serverPort}`, {
  auth: authData,
});

socket.on('connect', () => {
  console.log('Connected to server!');

  // 连接成功后，可以连接到其他命名空间
  connectToLLMNamespace();
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server. Reason:', reason);
});

// 连接到 /llm 命名空间
function connectToLLMNamespace() {
  const llmSocket = io(`${serverAddress}:${serverPort}/llm`, {
    auth: authData,
  });

  llmSocket.on('connect', () => {
    console.log('Connected to /llm namespace!');
    // 现在可以发送 LLM 请求了
    sendLLMRequest('Hello, world!');
  });

  llmSocket.on('connect_error', (error) => {
    console.error('LLM connection error:', error);
  });
}

// 发送 LLM 请求 (示例)
function sendLLMRequest(message) {
    const llmSocket = io(`${serverAddress}:${serverPort}/llm`, {
        auth: authData,
    });
  const requestId = generateUniqueId(); // 您需要自己实现 generateUniqueId() 函数
  llmSocket.emit('MSG_TYPE.LLM_REQUEST', {
    target: 'targetSillyTavernClientId', // 目标 SillyTavern 扩展的 clientId
    requestId: requestId,
    message: message,
    requestType: 'newMessage'
  });
}
import { v4 as uuidv4 } from 'uuid';
// 请确保你已经安装了 uuid:  npm install uuid
// 生成唯一 ID 的函数 (示例)
function generateUniqueId() {
 // 使用uuid库
  return uuidv4();
}
```

**代码解释:**

* **导入:**  导入 `socket.io-client` 库。
* **常量:** 定义服务器地址、端口、客户端 ID、客户端类型、客户端key和认证信息。
* **`io()`:**  创建 Socket.IO 连接实例。
  * 第一个参数是服务器地址和端口。
  * 第二个参数是选项对象，包含 `auth` 属性 (认证数据)。
* **事件监听:**
  * `connect`:  连接成功时触发。
  * `connect_error`:  连接错误时触发。
  * `disconnect`:  断开连接时触发。
* **`connectToLLMNamespace`函数**：连接到`/llm`命名空间
* **`sendLLMRequest`函数**：发送LLM请求
* **`generateUniqueId`函数**：生成唯一的请求ID
* **导入**：展示了如何通过`import`导入并使用第三方依赖

**关键步骤:**

1. **安装依赖:**  确保您已安装了 `socket.io-client` 库 (以及其他需要的库，如上面例子中的 `uuid`)。
2. **连接:**  使用 `io()` 函数连接到服务器。
3. **认证:**  在连接选项中提供 `auth` 数据。
4. **监听事件:**  监听 `connect`、`connect_error` 和 `disconnect` 事件。
5. **连接到命名空间:** 连接到所需的命名空间 (例如 `/llm`)。
6. **发送请求:** 使用 `socket.emit()` 发送请求。
7. **接收响应:** 监听服务器发送的事件 (例如 `streamed_data`、`message` 或自定义事件)。

## 4. 命名空间

以下是 SillyTavern-NewAge 服务器提供的一些常用命名空间：

* `/` (默认命名空间): 主要用于 `monitor` 客户端。
* `/auth`: 用于客户端认证。
* `/llm`: 用于与 LLM 交互。
* `/function_call`: 用于函数调用。
* `/clients`: 用于客户端管理 (通常由服务器或管理员使用)。
* `/rooms`: 用于房间管理 (通常由服务器使用)。
* `/sillytavern`：主要用于服务器和 SillyTavern 扩展之间的通讯

## 5.错误处理
客户端应该监听 `MSG_TYPE.ERROR` 事件来处理服务器发送的错误消息：

```javascript
socket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 下一步
你可以参考如下内容，来获取更多信息：
* [通用事件](#通用事件)
* [LLM 交互 ( /llm 命名空间)](#llm-交互--llm-命名空间)
* [函数调用 ( /function_call 命名空间)](#函数调用--function_call-命名空间)
