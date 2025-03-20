---
title: 房间管理
layout: doc
---

# 房间管理 (Room Management)

SillyTavern-NewAge 服务器利用 [Socket.IO 的房间 (Room)](https://socket.io/docs/v4/rooms/) 概念来组织和管理客户端连接。 房间允许服务器选择性地向特定组的客户端广播消息，或将消息限制在特定组内，从而实现更灵活和高效的消息传递。

> [!IMPORTANT]
> 在当前的服务器实现中，房间管理功能主要由**管理前端** (即 `clientType` 为 `'monitor'` 的客户端) 和服务器端代码共同协作完成。 **只有管理前端** 能够通过特定的 API 创建、删除和管理房间的成员。 其他类型的客户端 (包括 SillyTavern 扩展) 不能直接创建、删除或修改房间，但可以被管理前端添加到房间中。

## 1. 房间核心概念

* **房间 (Room):**  一个逻辑分组，用于在服务器端组织客户端连接。每个房间都有一个唯一的名称。
* **客户端 (Client):**  任何连接到服务器的实体，例如 SillyTavern 扩展、Web 应用程序、监控前端等，每个客户端都有一个唯一的 `clientId`。
* **加入房间 (Join Room):**  客户端通过 `clientId` 被添加到指定的房间中，成为房间的成员。
* **离开房间 (Leave Room):**  客户端从指定的房间中移除，不再接收发送到该房间的消息。
* **广播 (Broadcast):**  服务器可以向房间内的所有成员客户端发送消息，实现群发通知或数据同步。
* **角色 (Role):** 房间成员可以拥有不同的角色，例如 `master` (房主), `manager` (管理员), `guest` (访客)。 角色可以用于权限控制和消息路由。

## 2. 房间管理 API ( `/rooms` 命名空间 )

房间管理 API 通过 Socket.IO 的 `/rooms` 命名空间提供，并通过消息类型 (`MSG_TYPE`) 定义了各种房间管理相关的事件。 **所有房间管理操作主要由管理前端发起和控制**，SillyTavern 扩展端可以通过管理前端间接参与房间管理。

### 2.1. 获取房间列表 (`GET_ROOMS`)

* **事件:** `GET_ROOMS`
* **消息类型:** `MSG_TYPE.GET_ROOMS`
* **发送方:** 客户端 (管理前端, 或 SillyTavern 扩展端等具有查看房间列表权限的客户端)
* **接收方:** 服务器
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
* **发送方:** 客户端 (管理前端, 或 SillyTavern 扩展端等具有查看房间成员列表权限的客户端)
* **接收方:** 服务器
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
* **发送方:** 客户端 (**仅限管理前端**)
* **接收方:** 服务器
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
* **发送方:** 客户端 (**仅限管理前端**)
* **接收方:** 服务器
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
* **发送方:** 客户端 (**仅限管理前端**)
* **接收方:** 服务器
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
* **发送方:** 客户端 (**仅限管理前端**)
* **接收方:** 服务器
* **数据:** `{ clientId: string, roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      message?: string; // 错误消息 (当 status 为 'error' 时，例如 "Failed to remove client from room")
    }
    ```

## 3. `Rooms.js` 模块 (服务器端)

`server/dist/Rooms.js` 模块在服务器端提供了房间管理功能的底层辅助函数。 这些函数直接与 Socket.IO 房间适配器交互，处理 Socket.IO 房间的创建、删除和成员管理等操作。 `ChatModule` 和房间管理 API 的事件处理程序会调用 `Rooms.js` 模块中的函数来完成具体的房间操作。

* **`addClientToRoom(clientId, roomName)`:** 将客户端 (通过 `clientId`) 添加到指定的 Socket.IO 房间 (`roomName`)。
* **`createRoom(roomName, creatorClientId)`:** 创建一个 Socket.IO 房间，并记录房间创建日志。 `creatorClientId` 参数用于记录房间创建者。
* **`deleteRoom(roomName)`:** 删除指定的 Socket.IO 房间。 此函数负责将房间内的所有客户端先移除房间，然后 Socket.IO 会自动删除空房间。
* **`getAllRooms()`:** 获取当前服务器上所有 Socket.IO 房间的名称列表。
* **`getClientRooms(clientId)`:** 获取指定客户端 (`clientId`) 当前所属的所有 Socket.IO 房间的名称列表。
* **`isClientInRoom(clientId, roomName)`:** 检查指定的客户端 (`clientId`) 是否是指定 Socket.IO 房间 (`roomName`) 的成员。
* **`removeClientFromRoom(clientId, roomName)`:** 将客户端 (通过 `clientId`) 从指定的 Socket.IO 房间 (`roomName`) 移除。

## 4. 房间操作的权限控制

服务器通过多重机制来确保房间管理 API 只能由具有管理权限的客户端 (目前主要是管理前端) 调用：

1. **命名空间限制:** 房间管理 API 相关的事件监听器和处理逻辑都注册在 `/rooms` 命名空间下，客户端需要连接到 `/rooms` 命名空间才能进行房间管理操作。
2. **连接认证和权限检查:** 客户端连接到 `/rooms` 命名空间时，服务器会执行 `checkAuth` 函数进行身份验证和权限检查。 只有通过身份验证且被识别为可信客户端 (例如 管理前端) 才能成功连接。
3. **事件处理程序中的权限验证:** 在每个房间管理事件 (例如 `CREATE_ROOM`, `DELETE_ROOM` 等) 的服务器端处理程序中，都会再次进行权限检查，验证当前 Socket 连接的客户端类型是否为 `'monitor'` (管理前端)。 如果不是，则拒绝执行操作，并返回错误响应。

通过以上多重权限控制机制，服务器确保了房间管理操作的安全性，防止未经授权的客户端随意创建、删除或修改房间。

## 5. 重要注意事项

* **房间的显式创建和删除:**  与之前的版本不同，服务器现在**显式地创建和删除** Socket.IO 房间。  `Rooms.js` 模块的 `createRoom` 和 `deleteRoom` 函数会直接调用 Socket.IO API 来管理房间的生命周期。
* **基于 `creatorClientId` 的房间命名:** 房间的名称**不再由管理前端随意指定，而是固定使用创建者的 `clientId` 作为房间名称**。 当管理前端或其他客户端创建房间时，服务器会自动使用创建者的 `clientId` 作为房间的唯一名称.
* **管理前端的中心控制:**  SillyTavern-NewAge 服务器的房间管理功能被设计为主要由管理前端进行中心控制。 这种设计简化了服务器端的房间管理逻辑，并将房间管理的权限集中在管理前端，方便管理员进行统一管理。

## 6. 总结

SillyTavern-NewAge 服务器的房间管理功能提供了一种强大的客户端组织和消息分发机制。 通过管理前端提供的房间管理 API 和服务器端 `Rooms.js` 模块的辅助函数，服务器实现了安全、灵活和可扩展的房间管理，为构建多客户端、实时交互的聊天应用提供了坚实的基础。 管理前端在房间管理中扮演着核心角色，负责创建、删除和管理房间成员，而其他类型的客户端则通过房间加入和离开操作参与到房间协作中。
