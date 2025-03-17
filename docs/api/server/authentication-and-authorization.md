---
title: 认证和授权
layout: doc
---

# 认证和授权 (Authentication and Authorization)

SillyTavern-NewAge 服务器采用了一套基于密钥 (Key) 的认证和授权机制，以确保只有经过授权的客户端才能访问服务器资源和功能。

## 1. 概述

服务器区分两种类型的客户端：

* **SillyTavern 扩展:**  SillyTavern 的扩展程序，通常运行在 SillyTavern 内部。
* **普通客户端:**  其他类型的客户端，例如 Web 应用程序、移动应用程序或独立的桌面应用程序。

服务器维护了两个集合：

* **`trustedSillyTaverns`:**  存储受信任的 SillyTavern 扩展的 `clientId`。
* **`trustedClients`:**  存储受信任的普通客户端的 `clientId`。

客户端在连接到服务器时，必须提供有效的 `clientId` 和 `key` 进行身份验证。 服务器会根据客户端类型和存储的密钥验证客户端的身份。

## 2. 认证流程

### 2.1. 客户端连接

1. 客户端尝试连接到服务器的 `/auth` 命名空间。
2. 客户端在连接时，通过 `socket.handshake.auth` 对象提供以下信息：
    * `clientId`:  客户端的唯一标识符。
    * `clientType`:  客户端类型 (`'extension'`、`'monitor'`、`'SillyTavern'` 等)。
    * `key`:  客户端的密钥 (或 `'getKey'`，表示请求获取密钥)。
    * `desc`: (可选) 客户端的描述信息。

### 2.2. 服务器验证

1. 服务器接收到连接请求后，会调用 `checkAuth(socket)` 函数进行身份验证。
2. `checkAuth` 函数执行以下检查：
    * **`networkSafe` 模式检查:**  如果启用了 `networkSafe` 模式 (默认启用)，并且 `skipNetworkSafeCheck` 参数为 `true`，则跳过身份验证 (主要用于 `'getKey'` 的情况)。
    * **客户端信任检查:**  检查 `clientId` 是否存在于 `trustedClients` 或 `trustedSillyTaverns` 集合中。 如果不存在，则拒绝连接。
    * **密钥验证:**  如果 `clientKey` 不是 `'getKey'`，则调用 `isValidKey(clientId, clientKey)` 函数验证密钥。
        * `isValidKey` 函数根据客户端类型执行不同的验证：
            * **SillyTavern 扩展:**  从 `Keys` 模块中获取存储的密钥，并使用 `bcrypt.compare` 比较客户端提供的密钥和存储的哈希密钥。
            * **普通客户端:**  使用 `Keys.isValidClientKey` 验证密钥 (该函数内部也使用 `bcrypt.compare`)。
        * 如果密钥无效，则拒绝连接。
3. 如果所有检查都通过，则认证成功。

### 2.3. 密钥获取 (`getKey`)

1. 客户端可以在首次连接时，将 `key` 设置为 `'getKey'`，向服务器请求获取密钥。
2. 服务器处理 `'getKey'` 请求的逻辑如下：
    * **SillyTavern 扩展:**
        * 如果 `clientId` 存在于 `trustedSillyTaverns` 集合中，则表示 SillyTavern 已连接。
            * 如果已设置密钥，则将密钥发送给客户端。
            * 否则，不进行任何操作 (理论上，如果 SillyTavern 已连接，则应该已经设置了密钥)。
        * 如果 `clientId` 不存在于 `trustedSillyTaverns` 集合中：
            * 将 SillyTavern 添加到 `trustedSillyTaverns`。
            * 调用 `Keys.generateAndStoreClientKey()` 生成并存储密钥。
            * 将生成的密钥发送给客户端。
    * **普通客户端:**
        * 如果 `clientId` 存在于 `trustedClients` 集合中:
            * 调用 `Keys.generateAndStoreClientKey()` 生成并存储密钥。
            * 如果启用了 `networkSafe` 模式，则将生成的密钥发送给客户端。
    * **监控客户端:**
            * 如果 `clientId`是`'monitor'`，则为其生成密钥，并返回给客户端。

## 3. 授权机制

服务器的授权机制主要基于以下几个方面：

### 3.1. 可信客户端列表

* `trustedSillyTaverns` 和 `trustedClients` 集合用于区分受信任的客户端和不受信任的客户端。
* 只有受信任的客户端才能连接到服务器。

### 3.2. 命名空间

* 不同的命名空间用于隔离不同的功能和客户端类型。
* 客户端只能访问其有权限访问的命名空间。

### 3.3. `canSendMessage` 函数

* `canSendMessage(senderClientId, targetRoom)` 函数用于检查客户端是否有权限向指定房间发送消息。
* 该函数执行以下检查：
  * 如果目标房间是 `'server'`，则始终允许发送。
  * 如果目标房间名称等于发送者的 `clientId`，并且发送者是 SillyTavern，允许发送。
  * 使用 `Rooms.isClientInRoom()` 检查发送者是否在目标房间内。

### 3.4. 事件处理程序中的权限检查

* 在某些事件处理程序中 (例如 `/clients` 和 `/rooms` 命名空间中的事件)，会进行额外的权限检查。
* 通常使用 `checkPermission(requiredClientType, clientId)` 或 `checkPermission(requiredClientType, clientType)` 函数检查客户端类型或 `clientId` 是否满足特定要求。
  * 例如，只有 SillyTavern 客户端才能调用 `GET_ALL_CLIENT_KEYS` 事件。
  * 例如，只有管理前端 (`monitor`) 才能调用 `/rooms` 命名空间中的房间管理事件 (创建、删除等)。

## 4. 密钥管理

* 客户端密钥由 `Keys` 模块管理。
* `Keys` 模块提供以下功能：
  * `generateAndStoreClientKey(clientId)`:  生成并存储客户端密钥 (使用 UUID 作为密钥，并使用 bcrypt 进行哈希)。
  * `getAllClientKeys()`:  获取所有客户端密钥。
  * `getClientKey(clientId)`:  获取指定客户端的密钥。
  * `isValidClientKey(clientId, key)`:  验证客户端密钥。
  * `removeClientKey(clientId)`:  移除客户端密钥。
* 密钥存储在 `server/keys/clients.json` 文件中。

## 5. `checkAuth` 函数

`checkAuth(socket, skipNetworkSafeCheck = false)` 函数是服务器认证的核心。

* **参数:**
  * `socket`:  Socket.IO 的 socket 对象。
  * `skipNetworkSafeCheck`: 是否跳过 `networkSafe` 检查 (默认为 `false`，通常为`true`，用于 `'getKey'` 的情况)。
* **返回值:**
  * `true`:  如果认证通过。
  * `{ status: 'error', message: string }`:  如果认证失败，返回一个包含错误信息的对象。
* **内部逻辑：** 见2.2节

## 6.总结

服务器的认证和授权机制结合了多种方法，以确保只有经过授权的客户端才能访问服务器资源和功能。 这包括客户端密钥、可信客户端列表、命名空间隔离、`canSendMessage` 函数以及事件处理程序中的权限检查。 `Keys` 模块负责密钥的生成、存储和验证。 `checkAuth` 函数是认证的核心，负责执行所有必要的检查。