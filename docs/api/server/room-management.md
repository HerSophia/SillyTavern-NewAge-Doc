---
title: 房间管理
layout: doc
---

# 房间管理 (Room Management)

SillyTavern-NewAge 服务器使用 Socket.IO 的房间 (Room) 概念来组织客户端。 房间允许服务器向特定组的客户端广播消息，或将消息限制在特定组内。

> [!IMPORTANT]
> 在当前的服务器实现中，房间管理功能完全由管理前端（即监控前端，`clientType` 为 `'monitor'` 的客户端）负责。 其他类型的客户端（包括 SillyTavern 扩展）不能直接创建、删除或修改房间。

## 1. 房间概念

* **房间 (Room):**  一个逻辑上的分组，用于将客户端组织在一起。
* **客户端 (Client):**  连接到服务器的任何实体 (例如，SillyTavern 扩展、Web 应用程序、监控前端等)。
* **加入房间 (Join Room):**  将客户端添加到房间。
* **离开房间 (Leave Room):**  将客户端从房间移除。
* **广播 (Broadcast):**  向房间内的所有客户端发送消息。

## 2. 房间管理 API

房间管理 API 通过 `/rooms` 命名空间提供。 所有房间管理操作都**仅限管理前端**执行。

### 2.1. 获取房间列表

* **事件:** `GET_ROOMS`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** 无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      rooms: string[]; // 房间名数组
    }
    ```

### 2.2. 获取房间内的客户端

* **事件:** `GET_CLIENTS_IN_ROOM`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      success: boolean;
      clients: {
        id: string; // 客户端 ID
        description: string; // 客户端描述
        // ... 其他信息 ...
      }[];
    }
    ```

### 2.3. 创建房间

* **事件:** `CREATE_ROOM`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

### 2.4. 删除房间

* **事件:** `DELETE_ROOM`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** `{ roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

### 2.5. 将客户端添加到房间

* **事件:** `ADD_CLIENT_TO_ROOM`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** `{ clientId: string, roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

### 2.6. 将客户端从房间移除

* **事件:** `REMOVE_CLIENT_FROM_ROOM`
* **发送方:** 客户端 (管理前端)
* **接收方:** 服务器
* **数据:** `{ clientId: string, roomName: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

## 3. `Rooms.js` 模块

`server/dist/Rooms.js` 模块提供了服务器端房间管理功能的辅助函数。 这些函数主要供服务器内部使用，但管理前端的事件处理程序会调用它们。

* **`addClientToRoom(clientId, roomName)`:** 将客户端添加到房间。
* **`createRoom(roomName)`:** 创建房间 (Socket.IO 会自动创建房间，此函数主要用于记录日志和检查房间是否已存在)。
* **`deleteRoom(roomName)`:** 删除房间 (将房间内的所有客户端移出房间)。
* **`getAllRooms()`:** 获取所有房间的列表。
* **`getClientRooms(clientId)`:** (可选) 获取客户端所在的房间列表。
* **`isClientInRoom(clientId, roomName)`:** 检查客户端是否在房间内。
* **`removeClientFromRoom(clientId, roomName)`:** 将客户端从房间移除。

## 4. 权限控制

服务器通过以下方式确保只有管理前端才能执行房间管理操作：

1. **命名空间:** 房间管理 API 位于 `/rooms` 命名空间。
2. **`checkPermission` 函数:** 在 `/rooms` 命名空间的 `connection` 事件处理程序中，会调用 `checkPermission('admin', clientType)` 函数。 此函数检查客户端类型是否为 `'monitor'` (管理前端)。 如果不是，则拒绝连接。
3. **事件处理程序中的检查:** 每个房间管理事件的处理程序都会再次检查客户端类型是否为`'monitor'`。

## 5. 注意事项

* Socket.IO 会自动创建和删除房间。 当客户端加入一个不存在的房间时，Socket.IO 会自动创建该房间。 当房间内没有客户端时，Socket.IO 会自动删除该房间。
* `Rooms.js` 中的 `createRoom` 和 `deleteRoom` 函数主要用于记录日志和提供额外的错误检查 (例如，防止创建同名房间)。
* 服务器不会阻止客户端自行加入或离开房间 (使用 `socket.join()` 和 `socket.leave()`)。 但是，服务器提供的房间管理 API (创建、删除、添加/移除客户端) 仅限管理前端使用。

## 6. 总结

SillyTavern-NewAge 服务器的房间管理功能完全由管理前端控制。 这简化了服务器的设计，并允许管理前端对客户端分组和消息传递进行集中管理。 其他客户端 (例如 SillyTavern 扩展) 可以通过向管理前端发送请求来间接执行房间管理操作，但不能直接操作房间。