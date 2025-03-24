---
title: 命名空间与响应事件
layout: doc  # 确保你使用的是 doc 布局
pageClass: wider-content # 添加自定义类名
---

<style scoped>
.wider-content .vp-doc { /* 或者 .wider-content .content  */
  max-width: 1200px; /* 你想要的宽度 */
  margin-left: auto;
  margin-right: auto;
}
</style>

# 命名空间与事件 (Namespace and Events)

SillyTavern-NewAge 服务器使用 Socket.IO 的命名空间来组织不同的功能和客户端类型。每个命名空间下定义了一组事件，用于服务器和客户端之间的通信。

## 命名空间 (Namespaces)

| 命名空间         | 描述                                                                  | 主要客户端类型                             |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| `/` (默认)      | 处理客户端的连接和断开连接事件。                                       | `monitor`, `SillyTavern`, `other`          |
| `/auth`         | 处理客户端身份验证、密钥获取。                                        | `other`, `SillyTavern`, `monitor`      |
| `/llm`          | 处理 LLM (大型语言模型) 请求的路由和转发 (包括流式和非流式消息)。      | `other`, `SillyTavern`                  |
| `/function_call` | 处理客户端发起的函数调用请求。                                        | `other`, `SillyTavern`                  |
| `/rooms`        | 处理房间管理 (创建、删除、加入、离开、获取房间/客户端列表等)。        | `monitor`, `SillyTavern`, `other` |
| `/clients`      | 处理客户端管理 (获取客户端列表、密钥管理等)。                        | `monitor`, `other`, `SillyTavern` |
| `/sillytavern`  | 用于服务器与 SillyTavern 扩展之间的通信 (身份标识)。                   | `SillyTavern`                              |
| `/debug`        | 提供调试相关的功能 (切换调试模式、读取日志、获取服务器状态)。           | `SillyTavern`, `monitor`                    |

* 客户端类型中的 `other` 指的是其他类型的客户端，统括所有开发者开发的客户端类型。

## 响应事件 (Events)

### `/` (默认命名空间)

| 事件名             | 发送方       | 接收方   | 数据                               | 描述                                          |
| ------------------ | ------------ | -------- | ---------------------------------- | --------------------------------------------- |
| `connection`       | 客户端       | 服务器   | `socket.handshake.auth`             | 客户端连接到服务器。                          |
| `disconnect`       | 客户端       | 服务器   | `reason` (断开连接的原因)          | 客户端断开与服务器的连接。                    |
| `connection_error` | 服务器/客户端 | N/A     | `err` (错误对象)                    | 发生连接错误 (全局事件，非特定命名空间)。      |

### `/auth` 命名空间

| 事件名                    | 发送方      | 接收方   | 数据                     | 描述                                                                        |
| :------------------------ | :---------- | :------- | :----------------------- | :-------------------------------------------------------------------------- |
| `connection`              | 客户端      | 服务器   | `socket.handshake.auth`   | 客户端连接到 `/auth` 命名空间。                                               |
| `GET_CLIENT_KEY`         | 客户端      | 服务器   | `{ clientId: string }`   | 获取指定客户端的密钥。                                                      |
| `GET_SILLYTAVERN_EXTENSION` | 客户端    | 服务器    | 无 | 获取所有已连接 SillyTavern 扩展的 clientId。                                            |
| `CLIENT_DISCONNECTED`     | 客户端      | 服务器   | `reason`                 | 客户端主动断开连接。                                                        |
| `disconnect`              | 客户端      | 服务器   | `reason`                 | 客户端断开与 `/auth` 命名空间的连接。                                        |
| `error`                   | 服务器/客户端 | N/A     | `error`                  | 发生错误。                                                                  |

### `/llm` 命名空间

| 事件名               | 发送方            | 接收方          | 数据                                         | 描述                                                                            |
| -------------------- | ----------------- | --------------- | -------------------------------------------- | ------------------------------------------------------------------------------- |
| `connection`         | 客户端            | 服务器          | `socket.handshake.auth`                       | 客户端连接到 `/llm` 命名空间。                                                  |
| `LLM_REQUEST`        | 客户端            | 服务器          | `{ target: string, requestId: string, ... }` | 客户端发送 LLM 请求。                                                           |
| `message`            | 服务器            | 客户端          | `{ type: MSG_TYPE.NON_STREAM, ... }`          | 服务器向客户端发送非流式消息 (LLM 响应)。                                   |
| `CLIENT_DISCONNECTED` | 客户端            | 服务器          | `reason`                                     | 客户端主动断开连接。                                                            |
| `disconnect`         | 客户端            | 服务器          | `reason`                                     | 客户端断开与 `/llm` 命名空间连接。                                                |
| `STREAM_START`        | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_START, ... }`        | SillyTavern 扩展发起流式传输。                                              |
| `STREAM_END`          | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_END, ... }`          | SillyTavern 扩展结束流式传输。                                                  |
| `STREAM_DATA_FIRST`   | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_DATA_FIRST, ... }`   | SillyTavern 扩展发送第一段流式数据。                                          |
| `STREAM_DATA_MIDDLE`  | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_DATA_MIDDLE, ... }`  | SillyTavern 扩展发送中间段流式数据。                                          |
| `STREAM_DATA_LAST`    | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_DATA_LAST, ... }`    | SillyTavern 扩展发送最后一段流式数据。                                          |
| `STREAM_DATA_RETRY`   | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_DATA_RETRY, ... }`   | SillyTavern 扩展尝试重发流式数据。                                              |
| `STREAM_DATA_FAILED`  | SillyTavern 扩展 | 服务器          | `{ type: MSG_TYPE.STREAM_DATA_FAILED, ... }`  | SillyTavern 扩展流式数据发送失败。                                              |
| `streamed_data`    | 服务器            | 客户端          | `{ streamId: string, outputId: string, requestId: string, source: 'server', data:string }` | 服务器向客户端发送流式数据。             |
| `streamed_end`        | 服务器             |    客户端       |   `{ streamId: string, outputId: string, requestId: string, source: 'server'}`                                                         |    服务器向客户端发送流结束。                                                         |

### `/function_call` 命名空间

| 事件名             | 发送方   | 接收方   | 数据                                                                 | 描述                                                                 |
| ------------------ | -------- | -------- | ------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `connection`       | 客户端   | 服务器   | `socket.handshake.auth`                                              | 客户端连接到 `/function_call` 命名空间。                               |
| `FUNCTION_CALL`    | 客户端   | 服务器   | `{ requestId: string, functionName: string, args: any[], target: string }` | 客户端请求调用服务器端函数, 或将请求转发给 SillyTavern 扩展。      |
| `disconnect`       | 客户端   | 服务器   | `reason`                                                           | 客户端断开与 `/function_call` 命名空间的连接。                        |
| `CLIENT_DISCONNECTED` | 客户端 | 服务器 | NULL                                                                 | 客户端主动断开连接。                                                   |

### `/rooms` 命名空间

| 事件名                   | 发送方       | 接收方   | 数据                                                                 | 描述                                                        |
| :----------------------- | :----------- | :------- | :------------------------------------------------------------------- | :---------------------------------------------------------- |
| `connection`             | 客户端       | 服务器   | `socket.handshake.auth`                                              | 客户端连接到 `/rooms` 命名空间。                              |
| `GET_ROOMS`              | 客户端       | 服务器   | 无                                                 | 获取所有房间的列表。                                        |
| `GET_CLIENTS_IN_ROOM`    | 客户端       | 服务器   | `{ roomName: string }`                                               | 获取指定房间内的客户端列表。                                |
| `CREATE_ROOM`            | 客户端 (通常是 `monitor`)       | 服务器   | `{ roomName: string }`                                               | 创建一个新房间。                                            |
| `DELETE_ROOM`            | 客户端 (通常是 `monitor`)       | 服务器   | `{ roomName: string }`                                               | 删除一个房间。                                              |
| `ADD_CLIENT_TO_ROOM`     | 客户端 (通常是 `monitor`)       | 服务器   | `{ clientId: string, roomName: string, role?: string }`              | 将客户端添加到指定房间。                                    |
| `REMOVE_CLIENT_FROM_ROOM` | 客户端 (通常是 `monitor`)       | 服务器   | `{ clientId: string, roomName: string }`              | 将客户端从指定房间移除。                                    |
| `SET_MEMBER_ROLE`        | 客户端 (通常是 `monitor`)    | 服务器    |`{ targetClientId: string, roomName: string, role: string }`      | 设置房间内成员的角色。     |
| `KICK_MEMBER`            | 客户端 (通常是 `monitor`)    | 服务器    | `{ targetClientId: string, roomName: string }`              | 将成员踢出房间。       |
| `MUTE_MEMBER`             | 客户端 (通常是 `monitor`)      |  服务器  | `{ targetClientId: string, roomName: string, duration: number }`              |禁言成员。         |
|`EDIT_MESSAGE`|客户端|服务器|`{ roomName: string, messageId: string, updatedMessage: object, fromLlm:boolean }`|客户端发送消息编辑请求。|
|`DELETE_MESSAGE`|客户端|服务器|`{ roomName: string, messageId: string, fromLlm:boolean }`|客户端发送消息删除请求。|
|`CLEAR_MESSAGES`|客户端|服务器|`{ roomName: string, fromLlm:boolean }`|管理员或房主清空房间内的消息历史记录。|
| `disconnect`             | 客户端       | 服务器   | `reason`                                                             | 客户端断开与 `/rooms` 命名空间的连接。                        |
| `CLIENT_DISCONNECTED`    | 客户端    |  服务器  | NULL                                                    |客户端主动断开连接。      |

### `/clients` 命名空间

| 事件名               | 发送方              | 接收方   | 数据                      | 描述                                                        |
| :------------------- | :------------------ | :------- | :------------------------ | :---------------------------------------------------------- |
| `connection`         | 客户端              | 服务器   | `socket.handshake.auth`    | 客户端连接到 `/clients` 命名空间。                          |
| `GET_ALL_CLIENT_KEYS` | `monitor` 客户端    | 服务器   | 无               | 获取所有客户端的密钥 (仅限 `monitor` 客户端)。          |
| `GET_CLIENT_KEY`      | 客户端              | 服务器   | `{ clientId: string }`    | 获取指定客户端的密钥。                                    |
| `GENERATE_CLIENT_KEY` | `monitor` 客户端    | 服务器   | `{ targetClientId: string }` | 生成并存储指定客户端的密钥 (仅限 `monitor` 客户端)。    |
| `REMOVE_CLIENT_KEY`   | `monitor` 客户端    | 服务器   | `{ targetClientId: string }` | 移除指定客户端的密钥 (仅限 `monitor` 客户端)。            |
| `GET_CLIENT_LIST`    | 客户端              | 服务器   | 无     | 获取所有已连接客户端的列表。                                |
| `disconnect`         | 客户端              | 服务器   | `reason`                  | 客户端断开与 `/clients` 命名空间的连接。                    |
| `CLIENT_DISCONNECTED` | 客户端    |  服务器  | NULL                                                    |客户端主动断开连接。      |

### `/sillytavern` 命名空间

| 事件名                | 发送方        | 接收方   | 数据                      | 描述                                              |
| --------------------- | ------------- | -------- | ------------------------- | ------------------------------------------------- |
| `connection`          | SillyTavern 扩展 | 服务器   | `socket.handshake.auth`    | SillyTavern 扩展连接到 `/sillytavern` 命名空间。    |
| `IDENTIFY_SILLYTAVERN` | SillyTavern 扩展 | 服务器   | `{ clientId: string }`    | SillyTavern 扩展向服务器标识自身。               |
| `disconnect`          | SillyTavern 扩展 | 服务器   | `reason`                  | SillyTavern 扩展断开与 `/sillytavern` 命名空间的连接。 |
| `CLIENT_DISCONNECTED` | SillyTavern 扩展    |  服务器  | NULL                                                    |SillyTavern 扩展主动断开连接。      |

### `/debug` 命名空间

| 事件名               | 发送方              | 接收方   | 数据                                        | 描述                                              |
| -------------------- | ------------------- | -------- | ------------------------------------------- | ------------------------------------------------- |
| `connection`         | 客户端              | 服务器   | `socket.handshake.auth`                      | 客户端连接到 `/debug` 命名空间。                   |
| `TOGGLE_DEBUG_MODE`  | 客户端 (通常是 `monitor` 或 SillyTavern) | 服务器   | 无                          | 切换调试模式。                                    |
| `DEBUG_MODE_CHANGED` | 服务器              | 客户端   | `{ debugMode: boolean }`                     | 服务器通知客户端调试模式已更改。                  |
| `SERVER_STATUS`      | 客户端              | 服务器   | 无                    | 客户端请求获取服务器状态。                       |
| `READ_LOG`           | 客户端              | 服务器   | `{ filename, level, page, pageSize }`        | 客户端请求读取日志文件。                            |
| `disconnect`         | 客户端              | 服务器   | `reason`                                    | 客户端断开与 `/debug` 命名空间的连接。             |
| `CLIENT_DISCONNECTED` | 客户端     |  服务器  | NULL                                                    |客户端主动断开连接。      |

**注意:**

* `callback(...)` 表示事件处理程序可以接受一个回调函数，用于向客户端发送响应 (文档中省略了回调函数的具体参数，以简化表格)。
* 数据列中的 `...` 表示事件可以携带其他数据字段。
* `socket.handshake.auth` 对象通常包含客户端的 `clientId`、`clientType`、`key` 和其他认证信息。
* `MSG_TYPE.NON_STREAM` 等常量指的是在`lib/constants.js`文件中定义的常量。
