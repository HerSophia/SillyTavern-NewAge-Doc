---
title: 函数调用
---

# 函数调用 (Function Call)

本指南将详细介绍客户端如何通过 `/function_call` 命名空间调用 SillyTavern-NewAge 服务器或其他客户端（通常是 SillyTavern 扩展）上注册的函数。

## 1. 连接到 /function_call 命名空间

在进行函数调用之前，您需要先连接到 `/function_call` 命名空间。

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

const functionCallSocket = io(`${serverAddress}:${serverPort}/function_call`, {
  auth: authData,
});

functionCallSocket.on('connect', () => {
  console.log('Connected to /function_call namespace!');
});

functionCallSocket.on('connect_error', (error) => {
  console.error('Function call connection error:', error);
});
```

## 2. 发送函数调用请求 (`MSG_TYPE.FUNCTION_CALL`)

要调用一个函数，您需要发送 `MSG_TYPE.FUNCTION_CALL` 事件。

* **事件名:** `MSG_TYPE.FUNCTION_CALL`
* **命名空间:** `/function_call`
* **数据:**  一个对象，包含以下字段：
  * `requestId`:  `string`，唯一的请求 ID (由客户端生成)。
  * `functionName`:  `string`，要调用的函数的名称。
  * `args`:  `array`，传递给函数的参数数组。
  * `target`:  `string`，函数调用的目标。可以是：
    * `'server'`：调用服务器端注册的函数。
    * SillyTavern 扩展的 `clientId`：调用该扩展注册的函数。

```javascript
import { v4 as uuidv4 } from 'uuid';

function callFunction(functionName, args, target) {
  const requestId = uuidv4();
  functionCallSocket.emit(
    MSG_TYPE.FUNCTION_CALL,
    {
      requestId: requestId,
      functionName: functionName,
      args: args,
      target: target,
    },
    (response) => {
      // 处理响应 (回调函数)
      if (response.success) {
        console.log('Function call result:', response.result);
      } else {
        console.error('Function call error:', response.error);
      }
    }
  );
}

// 示例：调用服务器端的 'add' 函数
callFunction('add', [1, 2], 'server');

// 示例：调用 SillyTavern 扩展的 'sendMessage' 函数
// callFunction('sendMessage', ['Hello!'], 'sillytavern-extension-client-id');
```

## 3. 接收函数调用响应 (回调函数)

`MSG_TYPE.FUNCTION_CALL` 事件支持回调函数，您可以在回调函数中处理函数调用的结果。

* **响应数据:**  一个对象，包含以下字段：
  * `success`:  `boolean`，指示函数调用是否成功。
  * `result`:  `any`，函数调用的返回值 (如果 `success` 为 `true`)。
  * `error`:  `string`，错误消息 (如果 `success` 为 `false`)。

```javascript
// ... (上面的 callFunction 函数) ...
 (response) => {
      // 处理响应 (回调函数)
      if (response.success) {
        console.log('Function call result:', response.result);
      } else {
        console.error('Function call error:', response.error);
      }
    }
```

## 4. 注册客户端函数 (可选)

> [!NOTE]
> 客户端通常是调用函数的一方，而不是提供函数的一方。但如果您确实需要让客户端也能被其他客户端或服务器调用函数，您可以参考服务器端的相关文档来实现。

## 5. 错误处理

请监听`MSG_TYPE.ERROR`事件

```javascript
functionCallSocket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 注意事项

* **请求 ID:**  对于每个函数调用请求，都应该生成一个唯一的 `requestId`。
* **目标:**  `target` 字段指定了函数调用的目标。确保您提供了正确的目标（`'server'` 或 SillyTavern 扩展的 `clientId`）。
* **回调函数:**  利用回调函数来处理函数调用的结果。
* **参数:**  确保传递给函数的参数与函数期望的参数类型和数量相匹配。
* **消息类型和常量**：请参考`lib/constants.js`的内容。
