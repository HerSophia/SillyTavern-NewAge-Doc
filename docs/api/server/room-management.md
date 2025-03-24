---
title: 房间管理
layout: doc
---

# 房间管理 (Room Management)

SillyTavern-NewAge 服务器利用 [Socket.IO 的房间 (Room)](https://socket.io/docs/v4/rooms/) 概念来组织和管理客户端连接。 房间允许服务器选择性地向特定组的客户端广播消息，或将消息限制在特定组内，从而实现更灵活和高效的消息传递。

> [!IMPORTANT]
> 服务器的房间管理功能主要由 **`ChatModule`** 模块实现。`ChatModule` 提供了创建、删除、管理房间成员、处理房间相关事件等核心功能。 管理前端 (即 `clientType` 为 `'monitor'` 的客户端) 可以通过 `/rooms` 命名空间与 `ChatModule` 交互，执行房间管理操作。 其他类型的客户端 (包括 SillyTavern 扩展) 不能直接创建或删除房间，但可以通过管理前端或服务器端代码间接参与房间管理 (例如加入/离开房间)。

## 1. 房间核心概念

* **房间 (Room):**  一个逻辑分组，用于在服务器端组织客户端连接。每个房间都有一个唯一的名称。
* **客户端 (Client):**  任何连接到服务器的实体，例如 SillyTavern 扩展、Web 应用程序、监控前端等，每个客户端都有一个唯一的 `clientId`。
* **加入房间 (Join Room):**  客户端通过 `clientId` 被添加到指定的房间中，成为房间的成员。
* **离开房间 (Leave Room):**  客户端从指定的房间中移除，不再接收发送到该房间的消息。
* **广播 (Broadcast):**  服务器可以向房间内的所有成员客户端发送消息，实现群发通知或数据同步。
* **角色 (Role):** 房间成员可以拥有不同的角色，例如 `master` (房主), `manager` (管理员), `guest` (访客)。 角色可以用于权限控制和消息路由。

## 2. 房间管理 API ( `/rooms` 命名空间 )

房间管理 API 通过 Socket.IO 的 `/rooms` 命名空间提供，并通过消息类型 (`MSG_TYPE`) 定义了各种房间管理相关的事件。 **`ChatModule` 负责处理这些事件，并提供相应的房间管理功能**。 管理前端通过发送这些事件与 `ChatModule` 交互，执行房间管理操作。

### 2.1. 获取房间列表 (`GET_ROOMS`)

* **事件:** `GET_ROOMS`
* **消息类型:** `MSG_TYPE.GET_ROOMS`
* **发送方:** 客户端 (任何已认证的客户端)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** 无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      rooms?: string[]; // 房间名数组 (当 status 为 'ok' 时)
      message?: string; // 错误消息 (当 status 为 'error' 时)
    }
    ```

### 2.2. 获取房间内的客户端列表 (`GET_CLIENTS_IN_ROOM`)

* **事件:** `GET_CLIENTS_IN_ROOM`
* **消息类型:** `MSG_TYPE.GET_CLIENTS_IN_ROOM`
* **发送方:** 客户端 (任何已认证的客户端)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      clients?: {
        clientId: string; // 客户端 ID
        clientType: string; // 客户端类型
        // ... 其他客户端信息 ...
      }[]; // 客户端信息数组 (当 status 为 'ok' 时)
      message?: string; // 错误消息 (当 status 为 'error' 时)
    }
    ```

### 2.3. 创建房间 (`CREATE_ROOM`)

* **事件:** `CREATE_ROOM`
* **消息类型:** `MSG_TYPE.CREATE_ROOM`
* **发送方:** 客户端 (通常是管理前端, 但 `ChatModule` 内部也可能创建房间)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      message?: string; // 错误消息 (当 status 为 'error' 时，例如 "Room already exists")
    }
    ```

### 2.4. 删除房间 (`DELETE_ROOM`)

* **事件:** `DELETE_ROOM`
* **消息类型:** `MSG_TYPE.DELETE_ROOM`
* **发送方:** 客户端 (通常是管理前端)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      message?: string; // 错误消息 (当 status 为 'error' 时，例如 "Room not found")
    }
    ```

### 2.5. 将客户端添加到房间 (`ADD_CLIENT_TO_ROOM`)

* **事件:** `ADD_CLIENT_TO_ROOM`
* **消息类型:** `MSG_TYPE.ADD_CLIENT_TO_ROOM`
* **发送方:** 客户端 (通常是管理前端, 但 `ChatModule` 内部也可能添加成员)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** `{ clientId: string, roomName: string, role?: string }`
  * `role`: 可选参数，指定客户端在房间中的角色，例如 `'manager'`, `'guest'`。 默认为 `'guest'`。
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      message?: string; // 错误消息 (当 status 为 'error' 时，例如 "Failed to add client to room")
    }
    ```

### 2.6. 将客户端从房间移除 (`REMOVE_CLIENT_FROM_ROOM`)

* **事件:** `REMOVE_CLIENT_FROM_ROOM`
* **消息类型:** `MSG_TYPE.REMOVE_CLIENT_FROM_ROOM`
* **发送方:** 客户端 (通常是管理前端, 但 `ChatModule` 内部也可能移除成员)
* **接收方:** 服务器 (`ChatModule`)
* **数据:** `{ clientId: string, roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      message?: string; // 错误消息 (当 status 为 'error' 时，例如 "Failed to remove client from room")
    }
    ```

## 3. `ChatModule` 和 `Rooms.js` (服务器端)

* **`ChatModule` (`lib/chat.js`):**  SillyTavern-NewAge 服务器的核心模块之一，负责房间管理的**主要逻辑**。
  * `createRoom(roomName, creatorClientId)`: 创建房间。如果房间已存在，则返回 `false`。 调用 `Rooms.js` 的 `createRoom` 函数创建 Socket.IO 房间，并在 `ChatModule` 内部维护房间信息 (包括成员列表、角色等)。
  * `deleteRoom(roomName)`: 删除房间。如果房间不存在，则返回 `false`。 调用 `Rooms.js` 的 `deleteRoom` 函数删除 Socket.IO 房间，并清除 `ChatModule` 内部的房间信息。
  * `joinRoom(clientId, roomName, role = 'guest')`: 将客户端添加到房间。如果房间不存在，则返回 `false`。 调用 `Rooms.js` 的 `addClientToRoom` 函数将客户端添加到 Socket.IO 房间，并在 `ChatModule` 内部维护房间成员列表和角色。
  * `leaveRoom(clientId, roomName)`: 将客户端从房间移除。如果房间不存在，则返回 `false`。 调用 `Rooms.js` 的 `removeClientFromRoom` 函数将客户端从 Socket.IO 房间移除，并更新 `ChatModule` 内部的房间成员列表。
  * `getRoomMembers(roomName)`: 获取房间内的成员列表 (返回 `clientId` 数组)。
  * `getRoomList()`: 获取所有房间的列表。

* **`Rooms.js` (`dist/Rooms.js`):**  提供与 Socket.IO 房间 API 交互的**底层辅助函数**。
  * `addClientToRoom(clientId, roomName)`: 将客户端 (通过 `clientId`) 添加到指定的 Socket.IO 房间 (`roomName`)。
  * `createRoom(roomName, creatorClientId)`: 创建一个 Socket.IO 房间。
  * `deleteRoom(roomName)`: 删除指定的 Socket.IO 房间。
  * `getAllRooms()`: 获取当前服务器上所有 Socket.IO 房间的名称列表。
  * `getClientRooms(clientId)`: 获取指定客户端 (`clientId`) 当前所属的所有 Socket.IO 房间的名称列表。
  * `isClientInRoom(clientId, roomName)`: 检查指定的客户端 (`clientId`) 是否是指定 Socket.IO 房间 (`roomName`) 的成员。
  * `removeClientFromRoom(clientId, roomName)`: 将客户端 (通过 `clientId`) 从指定的 Socket.IO 房间 (`roomName`) 移除。

## 4. 房间操作的权限控制

服务器通过多重机制来确保房间管理 API 的安全：

1. **命名空间限制:** 房间管理 API 相关的事件监听器和处理逻辑都注册在 `/rooms` 命名空间下，客户端需要连接到 `/rooms` 命名空间才能进行房间管理操作。
2. **连接认证:** 客户端连接到 `/rooms` 命名空间时，服务器会执行 `checkAuth` 函数进行身份验证。 只有通过身份验证的客户端才能成功连接。
3. **`ChatModule` 内部的权限检查:** `ChatModule` 在处理房间管理相关的事件 (例如 `CREATE_ROOM`, `DELETE_ROOM`, `ADD_CLIENT_TO_ROOM`, `REMOVE_CLIENT_FROM_ROOM` 等) 时，会进行内部的权限检查。 例如，`CREATE_ROOM` 和 `DELETE_ROOM` 通常只允许管理员 (`clientType` 为 `'monitor'`) 或 `ChatModule` 自身 (例如在服务器启动时自动创建房间) 执行。

## 5. 重要注意事项

* **`ChatModule` 的核心作用:** SillyTavern-NewAge 服务器的房间管理功能主要由 `ChatModule` 模块实现。
* **客户端的间接参与:** SillyTavern 扩展端等客户端不能直接创建、删除房间，但是可以通过管理端间接参与房间管理。

## 6. 总结

SillyTavern-NewAge 服务器的房间管理功能提供了一种强大的客户端组织和消息分发机制。`ChatModule` 模块负责房间管理的核心逻辑，`Rooms.js` 模块提供底层的 Socket.IO 房间操作辅助函数。 管理前端可以通过 `/rooms` 命名空间与 `ChatModule` 交互，执行房间管理操作。 通过多重权限控制机制，服务器确保了房间管理操作的安全性。
