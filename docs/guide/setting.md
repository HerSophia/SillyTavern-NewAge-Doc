---
title: 设置
---

# 设置 (Setting)

本指南将介绍 SillyTavern-NewAge 扩展的服务器和客户端设置。正确配置这些设置对于扩展的正常运行至关重要。

## 1. 服务器设置

服务器设置存储在 `server/settings/server_settings.json` 文件中。以下是对各个设置项的解释：

```json
{
  "serverPort": 4000,
  "serverAddress": "http://localhost",
  "reconnectAttempts": 5,
  "reconnectDelay": 1000,
  "timeout": 5000,
  "autoConnect": true,
  "socketIOPath": "/socket.io",
  "queryParameters": {},
  "transport": "websocket",
  "extensionRooms": {},
  "clientKeys": {},
  "networkSafe": true
}
```

* **`serverPort`:** 服务器监听的端口号。默认值为 `4000`。
* **`serverAddress`:** 服务器的地址。默认值为 `http://localhost`。您通常不需要修改此项，除非您将服务器部署在远程计算机上。
* **`reconnectAttempts`:**  客户端尝试重新连接服务器的最大次数。默认值为 `5`。
* **`reconnectDelay`:**  客户端在两次重新连接尝试之间的等待时间（毫秒）。默认值为 `1000` (1 秒)。
* **`timeout`:**  Socket.IO 连接超时时间（毫秒）。默认值为 `5000` (5 秒)。
* **`autoConnect`:**  客户端是否在页面加载后自动连接到服务器。默认值为 `true`。
* **`socketIOPath`:**  Socket.IO 服务器的路径。默认值为 `/socket.io`。通常不需要修改此项。
* **`queryParameters`:**  连接 Socket.IO 时传递的查询参数 (键值对)。 默认值为空对象 `{}`。
* **`transport`:**  Socket.IO 使用的传输协议。默认值为 `"websocket"`。
  * 您也可以将其设置为`"polling"`，但是这可能会导致跨域问题。
* **`networkSafe`:** 是否开启网络安全模式。默认值为 `true`。开启后，服务器会跳过严格的认证流程。
* **`extensionRooms`:**  (自动管理) 存储已连接的扩展房间信息。**无需手动设置**。
* **`clientKeys`:**  (自动管理) 存储客户端的密钥信息。**无需手动设置**。

> \[!WARNING]
> 大多数情况下，您只需要修改 `serverPort` (如果 4000 端口被占用) 和 `networkSafe` (如果您不需要安全的 https 连接)。其他设置通常保持默认值即可。

## 2. 客户端设置

客户端设置用于服务器验证客户端的身份。**您必须在服务器启动之前创建好客户端的设置文件。**

**创建客户端设置文件:**

* **手动创建:**
  * 在 `server/settings` 文件夹中创建一个 JSON 文件。
  * 文件名应与客户端的 `clientId` 相同 (例如 `frontendExample.json`)。

* **自动创建 (推荐):**
  * 在您的代码中调用 `/server/dist/function_call.js` 文件中的 `saveJsonToFile` 函数来自动创建 JSON 文件。 (具体实现方式取决于您的客户端代码)

**客户端设置文件示例 (`frontendExample.json`):**

```json
{
  "clientId": "frontendExample",
  "isTrust": true
}
```

* **`clientId`:** 客户端的唯一标识符。**这个值非常重要，它必须与客户端代码中使用的 `clientId` 一致。**
* **`isTrust`:**  一个布尔值，指示服务器是否信任此客户端。**必须设置为 `true`**，否则服务器将拒绝连接。

> \[!IMPORTANT]
> 确保客户端设置文件已创建，并且 `isTrust` 设置为 `true`，否则服务器将无法连接到您的客户端。