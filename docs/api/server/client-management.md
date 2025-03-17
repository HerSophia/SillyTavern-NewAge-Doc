# 客户端管理 (Client Management)

SillyTavern-NewAge 服务器提供了一套机制来管理连接的客户端，包括获取客户端列表、密钥管理、以及在调试模式下模拟客户端。

## 1. 客户端信息

服务器维护了以下关于客户端的信息：

* **`clientId`:** 客户端的唯一标识符 (字符串)。
* **`clientType`:** 客户端类型 (字符串)，例如：
  * `'extension'`： 普通扩展
  * `'SillyTavern'`： SillyTavern 扩展
  * `'monitor'`： 监控前端
* **`key`:** 客户端的密钥 (字符串, 用于身份验证)。
* **`desc`:** 客户端的描述信息 (字符串, 可选)。
* **`clientHTML`:** 客户端的URL (字符串, 可选)。

## 2. 存储

服务器使用以下数据结构存储客户端信息：

* **`trustedClients`:**  一个 `Set`，存储受信任的普通客户端的 `clientId`。
* **`trustedSillyTaverns`:**  一个 `Set`，存储受信任的 SillyTavern 扩展的 `clientId`。
* **`connectedClients`:** 一个 `Map`， 存储已连接客户端的`clientId`。
* **`clients`:** 一个数组，储存客户端信息。

## 3. 密钥管理

客户端密钥由 `server/dist/Keys.js` 模块管理。 该模块提供以下功能：

* **`generateAndStoreClientKey(clientId)`:**
  * 为指定的客户端生成一个唯一的密钥 (UUID)。
  * 使用 bcrypt 对密钥进行哈希。
  * 将哈希后的密钥存储在 `server/keys/clients.json` 文件中。
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
* **发送方:**  客户端 (SillyTavern 或管理前端)
* **接收方:**  服务器
* **数据:**  无
* **响应 (`callback`):**

    ```typescript
    {
      success: boolean;
      clients: {
        clientId: string;
        clientType: string;
        clientDesc: string;
        clientHTML?: string;
      }[];
    }
    ```

### 4.2. 获取所有客户端密钥

* **事件:**  `GET_ALL_CLIENT_KEYS`  (`/clients` 命名空间)
* **发送方:**  客户端 (仅 SillyTavern)
* **接收方:**  服务器
* **数据:**  无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
      keys: {
        [clientId: string]: {
          key: string; // 哈希后的密钥
          rooms: string[]; // (此字段可能已不再使用)
        };
      };
    }
    ```

### 4.3. 获取单个客户端密钥

* **事件:**  `GET_CLIENT_KEY`  (`/clients` 和 `/auth` 命名空间)
* **发送方:**  客户端
* **接收方:**  服务器
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
* **发送方:**  客户端 (仅 SillyTavern)
* **接收方:**  服务器
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
* **发送方:**  客户端 (仅 SillyTavern)
* **接收方:**  服务器
* **数据:**  `{ targetClientId: string }`
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok';
    }
    ```

### 4.6. 获取SillyTavern 扩展

* **事件:**  `GET_SILLYTAVERN_EXTENSION`  (`/auth` 命名空间)
* **发送方:**  客户端
* **接收方:**  服务器
* **数据:**  无
* **响应 (`callback`):**

    ```typescript
    {
      status: 'ok' | 'error';
      allTheSTSocket: STSocket;
    }
    ```

### 4.7. 更新客户端列表

* **事件:**  `UPDATE_CONNECTED_CLIENTS`
* **发送方:**  服务器
* **接收方:**  管理前端
* **数据:**  无
* **响应 (`callback`):**

  ```typescript
  {
    status: 'ok';
  }
  ```

### 4.8. 发送给 SillyTavern (仅非 SillyTavern 客户端)

* **事件:**  `CONNECTED_CLIENTS_UPDATE`
* **发送方:**  服务器
* **接收方:**  SillyTavern
* **数据:**  

    ```typescript
      {
        nonSillyTavernClients: Array;
      }
    ```

## 5. 调试模式

在调试模式下，服务器会自动添加两个模拟客户端：

* **`SillyTavern-debug`:**  模拟的 SillyTavern 扩展。
* **`client-debug`:**  模拟的普通客户端。

这可以通过 `server/dist/debug.js` 模块中的 `addDebugClients` 和 `removeDebugClients` 函数进行控制。

## 6. 总结

服务器提供了一套完整的客户端管理机制，包括：

* 存储客户端信息 (ID、类型、密钥、描述)。
* 使用 `Keys` 模块管理客户端密钥。
* 提供 API 获取客户端列表、密钥等信息。
* 调试模式下自动添加模拟客户端。

这些功能使服务器能够有效地跟踪和管理连接的客户端，并确保只有经过授权的客户端才能访问服务器资源。