---
title: 通用事件 
---

# 通用事件 (Common Events)

这些事件在多个命名空间中都可能触发，是客户端与服务器交互的基础。

## 1. `connect`

* **命名空间:** 所有
* **描述:**  当客户端成功连接到服务器（或特定命名空间）时触发。
* **数据:** 无
* **示例:**

    ```javascript
    socket.on('connect', () => {
      console.log('Connected to the server!');
    });
    ```

## 2. `connect_error`

* **命名空间:** 所有
* **描述:**  当客户端连接到服务器（或特定命名空间）发生错误时触发。
* **数据:**
  * `error`:  `Error` 对象，包含错误信息。
* **示例:**

    ```javascript
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      if (error.message === 'xhr poll error') {
        // 处理 xhr poll error
        console.error('xhr poll error. Please check your network status');
      }
    });
    ```

## 3. `disconnect`

* **命名空间:** 所有
* **描述:**  当客户端与服务器（或特定命名空间）断开连接时触发。
* **数据:**
  * `reason`:  `string` 类型，表示断开连接的原因。 常见的原因包括：
    * `'io server disconnect'`：服务器主动断开连接。
    * `'io client disconnect'`：客户端主动断开连接。
    * `'ping timeout'`：连接超时。
    * `'transport close'`：传输层关闭。
    * `'transport error'`：传输层错误。
* **示例:**

    ```javascript
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server. Reason:', reason);
    });
    ```

## 4. `message`

* **命名空间:** 多个 (取决于消息类型)
* **描述:**  当客户端收到非流式消息时触发。这是一个通用事件，用于接收各种类型的非流式数据。
* **数据:**  一个对象，其结构取决于消息类型。通常包含以下字段：
  * `type`:  `string`，消息类型 (例如 `MSG_TYPE.LLM_REQUEST`, `MSG_TYPE.FUNCTION_CALL` 等)。
  * `data`:  `any`，消息的具体数据 (内容、参数等)。
  * `source`:  `string`，消息来源 ('server' 或客户端 ID)。
  * `requestId`:  `string`，请求 ID (如果消息与某个请求相关)。
  * `outputId`: `string`，输出Id。
  * `clientId`:  `string`，发送消息的客户端 ID。
  * ... (其他字段，取决于消息类型)
* **示例:**

    ```javascript
     // 接收非流式响应
    socket.on('message', (data) => {
        console.log(data)
    }
    ```

## 5. `MSG_TYPE.ERROR`

* **命名空间:** 多个 (取决于消息类型)
* **描述**: 客户端应该监听 `MSG_TYPE.ERROR` 事件来处理服务器发送的错误消息
* **数据**：
  * `type`: `string`，消息类型 (通常为`MSG_TYPE.ERROR`)。
  * `message`: `string`, 错误消息
  * `requestId`: `string`, 请求ID

```javascript
socket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 注意事项

* **错误处理:** 务必监听 `connect_error` 和 `MSG_TYPE.ERROR` 事件，并进行适当的错误处理。
* **消息类型:**  `message` 事件的数据结构取决于消息类型 (`type` 字段)。您需要根据不同的消息类型解析数据。
* **`disconnect` 原因:**  `disconnect` 事件的 `reason` 字段可以帮助您诊断连接问题。
* **常量引用**: 建议从`../../lib/constants.js`中导入`MSG_TYPE`，而不是直接硬编码
