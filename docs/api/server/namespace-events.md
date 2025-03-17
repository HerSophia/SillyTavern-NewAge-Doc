---
title: 命名空间与事件
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
| `/` (默认)      | 主要用于监控客户端 (`monitor`) 的连接、断线重连。                       | `monitor`                                  |
| `/auth`         | 处理客户端身份验证、密钥获取、客户端信息同步。                         | `other`, `SillyTavern`, `monitor`      |
| `/llm`          | 处理 LLM (大型语言模型) 请求的路由和转发。                            | `other`, `SillyTavern`                  |
| `/function_call` | 处理客户端发起的函数调用请求。                                        | `other`, `SillyTavern`                  |
| `/rooms`        | 处理房间管理 (创建、删除、加入、离开、获取房间/客户端列表等)。        | `monitor`, `SillyTavern`, `other` |
| `/clients`      | 处理客户端管理 (获取客户端列表、密钥管理等)。                        | `SillyTavern`, `monitor`                    |
| `/sillytavern`  | 用于服务器与 SillyTavern 扩展之间的通信 (身份标识)。                   | `SillyTavern`                              |
| `/debug`        | 提供调试相关的功能 (切换调试模式、读取日志、获取服务器状态)。           | `SillyTavern`, `monitor`                    |

* 客户端类型中的 `other` 指的是其他类型的客户端，统括所有开发者开发的客户端类型。

## 事件 (Events)

### `/` (默认命名空间)

| 事件名             | 发送方     | 接收方  | 数据                                    | 描述                                                                |
| ------------------ | ---------- | ------- | --------------------------------------- | ------------------------------------------------------------------- |
| `connection`       | 客户端/SillyTavern     | 服务器  | `socket.handshake.auth`                  | 客户端连接到服务器。                                                 |
| `disconnect`       | 客户端/SillyTavern     | 服务器  | `reason` (断开连接的原因)                | 客户端断开与服务器的连接。                                           |
| `connection_error` | 服务器/SillyTavern     | N/A    | `err` (错误对象)                       | 发生连接错误 (全局事件，非特定命名空间)。                           |

### `/auth` 命名空间

| 事件名                    | 发送方          | 接收方             | 数据                                                                | 描述                                                                                   |
| :------------------------ | :-------------- | :----------------- | :------------------------------------------------------------------ | :------------------------------------------------------------------------------------- |
| `connection`              | 客户端/SillyTavern          | 服务器             | `socket.handshake.auth`                                              | 客户端/SillyTavern 连接到 `/auth` 命名空间。                                                        |
| `GET_CLIENT_KEY`         | 客户端/SillyTavern   | 服务器/客户端       | `{ clientId: string }`                                       | 获取指定客户端的密钥, 如果是'monitor'或者是受信的SillyTavern 扩展，生成密钥，然后返回。如果不是受信的SillyTavern客户端，则返回错误。 |
| `GET_SILLYTAVERN_EXTENSION` | 客户端        | 服务器              |   `callback({ status: 'ok', allTheSTSocket: STSocket })`                            | 客户端获取所有已连接SillyTavern 扩展的clientId。                                       |
| `LOGIN`                   | SillyTavern         | 服务器             | `{ clientId: string, password: string }` (已废弃)               | SillyTavern 扩展尝试登录 (已废弃)。                                                               |
| `CLIENT_DISCONNECTED`     | 客户端/SillyTavern   | 服务器/客户端       | `reason` (断开连接的原因)                                          | 客户端/SillyTavern 主动断开连接。                                                                  |
| `disconnect`              | 客户端/SillyTavern   | 服务器/客户端       | `reason`                                                           | 客户端/SillyTavern 断开与 `/auth` 命名空间的连接。                                                    |
| `error`                   | 客户端/SillyTavern         | 服务器             | `error`                                                           | 发生错误。                                                                             |
|`UPDATE_CONNECTED_CLIENTS`| 服务器 | 管理前端 |  `allClients`| 向管理前端发送客户端列表更新                                                       |
|`CONNECTED_CLIENTS_UPDATE`| 服务器 |  SillyTavern  |  `nonSillyTavernClients`  | 向所有可信的 SillyTavern 扩展发送 connectedClients (数据不包含 SillyTavern 客户端)                                           |

### `/llm` 命名空间

| 事件名               | 发送方          | 接收方      | 数据                                                                     | 描述                                                                                                       |
| -------------------- | --------------- | ----------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `connection`         | 客户端/SillyTavern          | 服务器      | `socket.handshake.auth`                                                   | 客户端/SillyTavern连接到 `/llm` 命名空间。                                                                           |
| `LLM_REQUEST`        | 客户端/服务器    | 服务器/客户端 | `{ target: string, requestId: string, ... }`                         | 客户端发送 LLM 请求，服务器将请求转发给 SillyTavern 扩展。                                                |
| `CLIENT_DISCONNECTED` | 客户端/SillyTavern   | 服务器/客户端 | `reason`                                                        | 客户端/SillyTavern 主动断开连接。                                                                                       |
| `disconnect`         | 客户端/SillyTavern    | 服务器/客户端 | `reason`                                                              | 客户端/SillyTavern 断开与 `/llm` 命名空间连接。                                                                           |
| `STREAM_DATA`          | 服务器 |  客户端      |   和`LLM_REQUEST`的`data`一致                      | 服务器发送流式数据。                         |
| `NON_STREAM`          |  客户端/SillyTavern/服务器 |  客户端/服务器   |   和`LLM_REQUEST`的`data`一致    |  用于传输非流式消息         |
| `STREAM_START`          | SillyTavern |  服务器   |  和`LLM_REQUEST`的`data`一致     | 扩展端发起流式传输。 |
| `STREAM_END`          | SillyTavern |  服务器  |   和`LLM_REQUEST`的`data`一致      | 扩展端结束流式传输。                                                                |
|`STREAM_DATA_FIRST`|SillyTavern|服务器|和`LLM_REQUEST`的`data`一致|SillyTavern发送第一段流式数据。|
|`STREAM_DATA_MIDDLE`|SillyTavern|服务器|和`LLM_REQUEST`的`data`一致|SillyTavern发送中间段流式数据。|
|`STREAM_DATA_LAST`|SillyTavern|服务器|和`LLM_REQUEST`的`data`一致|SillyTavern发送最后一段流式数据。|
|`STREAM_DATA_RETRY`|SillyTavern|服务器|和`LLM_REQUEST`的`data`一致|SillyTavern尝试重发流式数据。|
|`STREAM_DATA_FAILED`|SillyTavern|服务器|和`LLM_REQUEST`的`data`一致|SillyTavern流式数据发送失败。|

### `/function_call` 命名空间

| 事件名          | 发送方   | 接收方   | 数据                                                                 | 描述                                                       |
| --------------- | -------- | -------- | ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `connection`    | SillyTavern/客户端   | 服务器   | `socket.handshake.auth`                                              | SillyTavern/客户端连接到 `/function_call` 命名空间。                   |
| `FUNCTION_CALL` | SillyTavern/客户端   | 服务器   | `{ requestId: string, functionName: string, args: any[], target: string }` | SillyTavern扩展端/客户端请求调用服务器端函数, 客户端的请求也可转发给 SillyTavern 扩展。   |
| `disconnect`    | SillyTavern/客户端   | 服务器   | `reason`                                                           | SillyTavern/客户端断开与 `/function_call` 命名空间的连接。             |
| `CLIENT_DISCONNETED` |  SillyTavern/客户端  | 服务器    |   NULL                                                   | SillyTavern/客户端主动断开连接。   |

### `/rooms` 命名空间

| 事件名                   | 发送方   | 接收方   | 数据                                       | 描述                                                                     |
| :----------------------- | :------- | :------- | :----------------------------------------- | :----------------------------------------------------------------------- |
| `connection`             | 管理前端   | 服务器   | `socket.handshake.auth`                     | 管理前端连接到 `/rooms` 命名空间。                                          |
| `GET_ROOMS`              | 管理前端   | 服务器   | `callback({ status: 'ok', rooms: string[] })` | 获取所有房间的列表。                                                   |
| `GET_CLIENTS_IN_ROOM`    | 管理前端   | 服务器   | `roomName: string, callback(...)`          | 获取指定房间内的客户端列表。                                             |
| `CREATE_ROOM`            | 管理前端   | 服务器   | `roomName: string, callback(...)`          | 创建一个新房间 (仅限管理前端)。                                         |
| `DELETE_ROOM`            | 管理前端   | 服务器   | `roomName: string, callback(...)`          | 删除一个房间 (仅限管理前端)。                                            |
| `ADD_CLIENT_TO_ROOM`     | 管理前端   | 服务器   | `{ clientId: string, roomName: string }, callback(...)` | 将客户端添加到指定房间 (仅限管理前端)。                                |
| `REMOVE_CLIENT_FROM_ROOM` | 管理前端   | 服务器   | `{ clientId: string, roomName: string }, callback(...)` | 将客户端从指定房间移除 (仅限管理前端)。                                |
| `disconnect`             | 管理前端   | 服务器   | `reason`                                  | 管理前端断开与 `/rooms` 命名空间的连接。                                    |
| `CLIENT_DISCONNETED` |  管理前端  | 服务器    |   NULL                                                   | 管理前端主动断开连接。   |

### `/clients` 命名空间

| 事件名                     | 发送方     | 接收方     | 数据                                                                | 描述                                                                                 |
| :------------------------- | :--------- | :--------- | :------------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| `connection`               | 客户端     | 服务器     | `socket.handshake.auth`                                              | 客户端连接到 `/clients` 命名空间。                                                    |
| `GET_ALL_CLIENT_KEYS`      | 管理前端/SillyTavern     | 服务器     | `callback({ status: 'ok', keys: object })`                         | 获取所有客户端的密钥 (仅限 SillyTavern和管理前端)。                                            |
| `GET_CLIENT_KEY`           | 客户端/SillyTavern    | 服务器     | `{ clientId: string }, callback(...)`                              | 获取指定客户端的密钥。                                                               |
| `GENERATE_CLIENT_KEY`      | SillyTavern     | 服务器     | `{ targetClientId: string }, callback(...)`                        | 生成并存储指定客户端的密钥 (仅限 SillyTavern)。                                      |
| `REMOVE_CLIENT_KEY`        | SillyTavern     | 服务器     | `{ targetClientId: string }, callback(...)`                        | 移除指定客户端的密钥 (仅限 SillyTavern)。                                            |
| `GET_CLIENT_LIST`       | 管理前端/SillyTavern        | 服务器              |   `callback({ success: true, clients })`                            | 客户端获取所有客户端。                                       |
| `UPDATE_CONNECTED_CLIENTS` | 管理前端/SillyTavern     | 服务器     | `callback({ status: 'ok' })`                         | SillyTavern 和管理前端用于更新客户端列表。                                            |
| `disconnect`               | 管理前端/SillyTavern     | 服务器     | `reason`                                                           | 客户端断开与 `/clients` 命名空间的连接。                                                  |
| `CLIENT_DISCONNETED` |  管理前端/SillyTavern  | 服务器    |   NULL                                                   | 客户端主动断开连接。   |

### `/sillytavern` 命名空间

| 事件名                | 发送方       | 接收方   | 数据                                                  | 描述                                                                   |
| --------------------- | ------------ | -------- | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| `connection`          | SillyTavern       | 服务器   | `socket.handshake.auth`                                | SillyTavern 扩展连接到 `/sillytavern` 命名空间。                                 |
| `IDENTIFY_SILLYTAVERN` | SillyTavern | 服务器   | `{ clientId: string }, callback(...)`                | SillyTavern 扩展向服务器标识自身。                                      |
| `disconnect`          | SillyTavern      | 服务器   | `reason`                                             | SillyTavern 扩展断开与 `/sillytavern` 命名空间的连接。                            |
| `CLIENT_DISCONNETED` |  SillyTavern  | 服务器    |   NULL                                                   | SillyTavern 扩展主动断开连接。   |

### `/debug` 命名空间

| 事件名               | 发送方   | 接收方     | 数据                                    | 描述                                                                        |
| -------------------- | -------- | ---------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `connection`         | 管理前端   | 服务器     | `socket.handshake.auth`                  | 管理前端连接到 `/debug` 命名空间。                                           |
| `TOGGLE_DEBUG_MODE`  | 管理前端   | 服务器     | `callback(...)`                         | 切换调试模式。                                                              |
| `DEBUG_MODE_CHANGED` | 服务器   | 管理前端     | `debugMode: boolean`                    | 服务器通知管理前端调试模式已更改。                                            |
| `SERVER_STATUS` | 管理前端  | 服务器     | NULL                        | 管理前端通知服务器当前状态。                                                              |
|`READ_LOG`|管理前端|服务器|`{ filename, level, page, pageSize }, callback(...)`|管理前端获取日志文件。|
| `disconnect`         | 管理前端   | 服务器     | `reason`                               | 管理前端断开与 `/debug` 命名空间的连接。                                      |
| `CLIENT_DISCONNETED` |  管理前端  | 服务器    |   NULL                                                   | 管理前端主动断开连接。   |

**注意:**

* `callback(...)` 表示事件处理程序可以接受一个回调函数，用于向客户端发送响应。
* 数据列中的 `...` 表示事件可以携带其他数据字段。
* `socket.handshake.auth` 对象通常包含客户端的 `clientId`、`clientType`、`key` 和其他认证信息。