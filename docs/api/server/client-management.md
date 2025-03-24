---
title: 客户端管理
layout: doc
---

# 客户端管理 (Client Management)

SillyTavern-NewAge 服务器提供了一套机制来管理连接的客户端，包括获取客户端列表、密钥管理。这些功能主要由 `MemberManagement` 模块和 `Keys.js` 模块实现，并与 `ChatModule` 模块紧密协作。

## 1. 客户端信息

服务器主要维护以下关于客户端的信息：

* **`clientId`:** 客户端的唯一标识符 (字符串)。
* **`clientType`:** 客户端类型 (字符串)，例如：
  * `'extension'`： 普通扩展
  * `'SillyTavern'`： SillyTavern 扩展
  * `'monitor'`： 监控前端
* **`key`:** 客户端的密钥 (字符串, 用于身份验证)。

`MemberManagement` 模块还可以存储其他可选的成员信息，例如昵称、头像等 (这些信息目前主要用于聊天系统)。

## 2. 存储

服务器使用以下数据结构存储客户端信息：

* **`trustedClients`:**  一个 `Set`，存储受信任的普通客户端的 `clientId` (主要用于身份验证)。
* **`trustedSillyTaverns`:**  一个 `Set`，存储受信任的 SillyTavern 扩展的 `clientId` (主要用于身份验证)。
* **`MemberManagement.members`:**  一个对象 (`{ [clientId]: Member }`)，存储所有已连接客户端的信息。 `Member` 对象包含 `clientId`、`clientType` 以及其他可选的成员数据。 这是客户端信息的主要存储位置。

## 3. 密钥管理

客户端密钥由 `server/dist/Keys.js` 模块管理。 该模块提供以下功能：

* **`generateAndStoreClientKey(clientId)`:**
  * 为指定的客户端生成一个唯一的密钥 (UUID)。
  * 使用 bcrypt 对密钥进行哈希。
  * 将哈希后的密钥存储在 `server/keys/clients.json` 文件中 (此文件路径在代码中是硬编码的，可能需要根据实际情况调整)。
  * 返回生成的密钥 (未哈希)。
* **`getAllClientKeys()`:**
  * 返回一个包含所有客户端密钥的对象。
  * 对象格式：`{ [clientId]: { key: hashedPassword, rooms: [] } }`  (注意：`rooms` 字段可能已不再使用)。
* **`getClientKey(clientId)`:**
  * 返回指定客户端的哈希密钥 (如果存在)。
  * 如果客户端不存在，则返回 `undefined`。
* **`isValidClientKey(clientId, key)`:**
  * 验证提供的密钥是否与存储的哈希密钥匹配。
  * 返回 `true` (如果匹配) 或 `false` (如果不匹配)。
* **`removeClientKey(clientId)`:**
  * 删除指定客户端的密钥。

## 4. API

服务器提供了以下 API 用于客户端管理 (主要通过 `/clients` 和 `/auth` 命名空间)：

### 4.1. 获取客户端列表

* **事件:**  `GET_CLIENT_LIST`  (`/clients` 命名空间)
* **发送方:**  客户端 (任何已认证的客户端)
* **接收方:**  服务器 (`MemberManagement` 模块)
* **数据:**  无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      clients: {
        clientId: string;
        clientType: string;
        // ... 其他成员信息 ...
      }[];
    }
    ```

### 4.2. 获取所有客户端密钥

* **事件:**  `GET_ALL_CLIENT_KEYS`  (`/clients` 命名空间)
* **发送方:**  客户端 (仅 `monitor` 客户端)
* **接收方:**  服务器 (`Keys.js` 模块)
* **数据:**  无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      keys: {
        [clientId: string]: {
          key: string; // 哈希后的密钥
        };
      };
    }
    ```

### 4.3. 获取单个客户端密钥

* **事件:**  `GET_CLIENT_KEY`  (`/clients` 和 `/auth` 命名空间)
* **发送方:**  客户端 (任何已认证的客户端)
* **接收方:**  服务器 (`Keys.js` 模块)
* **数据:**  `{ clientId: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      key: string | null; // 哈希后的密钥 (如果存在) 或 null
    }
    ```

### 4.4. 生成客户端密钥

* **事件:**  `GENERATE_CLIENT_KEY`  (`/clients` 命名空间)
* **发送方:**  客户端 (仅 `monitor` 客户端)
* **接收方:**  服务器 (`Keys.js` 模块)
* **数据:**  `{ targetClientId: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      key: string; // 生成的密钥 (未哈希)
    }
    ```

### 4.5. 移除客户端密钥

* **事件:**  `REMOVE_CLIENT_KEY`  (`/clients` 命名空间)
* **发送方:**  客户端 (仅 `monitor` 客户端)
* **接收方:**  服务器 (`Keys.js` 模块)
* **数据:**  `{ targetClientId: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

### 4.6. 获取已连接的 SillyTavern 扩展列表

* **事件:** `GET_SILLYTAVERN_EXTENSION` (`/auth` 命名空间)
* **发送方:** 客户端 (任何已认证的客户端)
* **接收方:** 服务器 (`ChatModule` 模块)
* **数据:** 无
* **响应 (`callback`):**
```typescript
{
  status: 'ok' | 'error';
  extensions: string[]; // 已连接的 SillyTavern 扩展的 clientId 数组
}
```

## 5. `MemberManagement` 模块 (`lib/memberManagement.js`)

`MemberManagement` 模块负责管理所有已连接客户端的信息：

* **`addMember(clientId, clientType, memberData = {})`:** 添加客户端。
* **`removeMember(clientId)`:** 移除客户端。
* **`getMember(clientId)`:** 获取客户端信息。
* **`getAllMembers()`:** 获取所有客户端信息。
* **`setMemberRole(clientId, roomName, role)`:** 设置客户端在房间中的角色。
* **`kickMember(clientId, roomName)`:** 将客户端踢出房间。
* **`muteMember(clientId, roomName, duration)`:** 禁言客户端 (TODO: 需要实现禁言逻辑)。
* **`notifyRoomMasterAndManagers(roomName, eventName, data)`:** 向房间的 `master` 和 `manager` 发送通知。

## 6. 与 `ChatModule` 的协作

客户端管理与 `ChatModule` 模块密切相关：

* `ChatModule` 使用 `MemberManagement` 来管理房间成员。
* 客户端连接和断开连接时，`ChatModule` 会调用 `MemberManagement` 的 `addMember` 和 `removeMember` 方法来更新客户端列表。
* `ChatModule` 的 `RelationsManage` 会记录客户端和扩展端的连接信息。

## 7. 总结

服务器提供了一套完整的客户端管理机制，包括：

* 使用 `MemberManagement` 模块存储和管理所有已连接客户端的信息。
* 使用 `Keys.js` 模块管理客户端密钥。
* 提供 API 获取客户端列表、密钥等信息。
* 与 `ChatModule` 模块紧密协作，实现房间成员管理等功能。

这些功能使服务器能够有效地跟踪和管理连接的客户端，并确保只有经过授权的客户端才能访问服务器资源。
