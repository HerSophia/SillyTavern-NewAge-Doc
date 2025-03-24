---
title: SillyTavern-NewAge 服务器架构概述
---

# SillyTavern-NewAge 服务器架构概述

SillyTavern-NewAge 服务器是一个基于 Node.js、Express 和 Socket.IO 构建的实时通信服务器，旨在为 SillyTavern 及其扩展提供一个灵活、可扩展且安全的后端。

## 1. 核心技术

* **Node.js:**  服务器端 JavaScript 运行环境，提供非阻塞 I/O 和事件驱动的特性。
* **Express:**  轻量级的 Web 应用程序框架，用于处理 HTTP 请求、构建 RESTful API 和管理路由。
* **Socket.IO:**  实时通信库，基于 WebSocket，实现服务器与客户端之间的全双工、低延迟、事件驱动的持久连接通信，支持命名空间和房间。
* **bcryptjs:** 密码哈希库，用于单向哈希处理敏感信息如客户端密钥和密码，提高安全性。
* **winston:**  功能丰富的日志记录库，支持多级别、多传输方式的日志记录，用于记录服务器运行时信息、错误和警告，便于监控和调试。
* **uuid:**  通用唯一标识符 (UUID) 生成库，用于生成唯一的客户端密钥、请求 ID 和输出 ID。
* **lodash:**  JavaScript 实用工具库，提供模块化的、高性能的函数，简化常见的编程任务，例如对象合并、类型检查和集合操作。
* **dayjs:**  轻量级的日期时间处理库，提供易于使用的 API 来解析、格式化和操作日期和时间。
* **`node-socketio-stream`:**  Socket.IO 的流式传输扩展，允许在 Socket.IO 连接上进行二进制流数据传输，用于高效传输 LLM 响应等大型数据。

## 2. 设计思想

* **模块化:**  服务器代码被高度模块化，划分为多个独立的模块和类（例如 `ChatModule`, `MemberManagement`, `RelationsManage`, `Keys`, `Rooms`, `logger`, `stream`, `non_stream`, `function_call`, `debug`），每个模块专注于特定的功能领域，降低了代码的复杂性，提高了可维护性、可测试性和可重用性，方便团队协作开发。
* **命名空间 (Namespaces):**  Socket.IO 的命名空间被系统地用于隔离不同的功能模块和客户端类型（`/auth`, `/llm`, `/function_call`, `/rooms`, `/clients`, `/sillytavern`, `/debug`, `/`），实现了请求和事件的路由隔离，避免了命名冲突，提高了服务器的组织性和可扩展性，使得服务器可以同时处理多种类型的客户端和请求。
* **事件驱动:**  服务器核心逻辑基于事件驱动编程模型，无论是客户端请求、服务器内部状态变化还是外部事件，都被抽象为事件进行处理，通过监听和触发预定义的事件 (`EVENTS`, `STREAM_EVENTS`, `MSG_TYPE`) 来响应客户端操作和服务器内部流程，实现了异步、非阻塞的架构，提高了服务器的并发处理能力和响应速度。
* **安全性:**  服务器设计中融入了多层安全机制，从连接认证到数据处理都考虑了安全性：
  * **客户端身份验证 (基于密钥和密码):**  客户端连接时需要提供有效的 `clientId` 和 `key` 进行身份验证，密钥通过 bcrypt 哈希存储，防止密钥泄露；SillyTavern 客户端还支持密码验证。
  * **密码哈希 (bcryptjs):**  敏感信息如客户端密钥和 SillyTavern 密码在存储时都经过 bcrypt 哈希处理，即使数据库泄露，也难以还原原始密码。
  * **路径安全检查:**  通过 `path` 模块进行路径处理，防止路径遍历攻击，限制客户端对服务器文件系统的访问范围。
  * **可信客户端列表 (白名单机制):**  服务器维护可信客户端列表 (`trustedClients`, `trustedSillyTaverns`)，只允许白名单中的客户端连接和访问特定功能，增强了访问控制。
  * **网络安全模式 (`networkSafe`):**  通过 `networkSafe` 配置项，可以限制某些 API 的访问，进一步提高服务器的安全性。
* **可扩展性:**  服务器架构设计注重可扩展性，通过模块化设计、命名空间隔离和事件驱动模型，可以方便地添加新的功能模块、命名空间和事件处理程序，以应对不断变化的需求和增加的功能，例如可以轻松添加新的消息类型、新的 Socket.IO 命名空间或新的服务器功能模块。
* **灵活性:**  服务器提供了多种机制来增强灵活性：
    * **函数调用机制 (`/function_call`):**  允许客户端动态调用服务器端预先注册的函数，扩展了客户端的功能，实现了高度灵活的客户端-服务器交互模式。
    * **静态资源服务:**  服务器可以动态地通过 `addStaticResources` 函数添加和提供静态资源 (HTML, CSS, JavaScript, 图像等)，方便客户端动态加载资源，实现更丰富的前端功能。
    * **多种连接策略 (`RelationsManage`):**  支持多种扩展端连接策略 ('Free', 'Manual', 'Balanced', 'Broadcast', 'Random')，管理员可以根据实际需求灵活配置扩展端的分配方式。
    * **消息请求模式 (`ChatModule`):**  支持多种消息请求模式 ('Default', 'Immediate', 'MasterOnly', 'Separate')，可以灵活控制 LLM 请求的处理方式，适应不同的应用场景。
* **易用性：** 服务器提供了简洁的 API 和默认实现，降低了开发和集成难度：
    * **便捷的日志记录函数 (`logger.js`):**  提供了 `info`, `warn`, `error`, `debug` 等简洁的日志记录函数，方便开发者在代码中快速添加日志。
    * **默认的连接策略和消息请求模式:**  提供了合理的默认连接策略 ('Free') 和消息请求模式 ('Default')，降低了初始配置的复杂度。
    * **清晰的模块划分和命名空间组织:**  代码结构清晰，模块划分合理，命名空间使用规范，方便开发者理解和维护代码。

## 3. 架构

### 3.1. 整体架构

服务器采用典型的客户端-服务器架构，基于 Socket.IO 实现实时双向通信，并使用 Express 构建 HTTP 服务，整体架构清晰分层：

* **客户端:**  可以是 SillyTavern 扩展、Web 应用程序、移动应用程序、监控前端或其他任何支持 Socket.IO 协议的客户端。客户端通过 Socket.IO 连接到服务器，发送请求、接收响应和实时数据。
* **服务器 (SillyTavern-NewAge 服务器):**  作为核心组件，负责处理所有客户端连接、身份验证和业务逻辑。服务器主要由 Express HTTP 服务器和 Socket.IO 服务器两部分组成，协同工作：
    * **Express HTTP 服务器:**  处理静态资源服务和 HTTP API 请求 (虽然代码中 HTTP API 较少，主要用于静态资源服务)。
    * **Socket.IO 服务器:**  处理实时的双向通信，通过命名空间划分功能模块，处理客户端连接、消息路由、事件处理、房间管理、LLM 请求转发、函数调用和调试功能。

```mermaid
graph LR
    subgraph Clients
        A[SillyTavern 扩展] -->|Socket.IO| C(SillyTavern-NewAge 服务器)
        B[Web/移动应用] -->|Socket.IO| C
        Monitor[监控前端] -->|Socket.IO| C
    end
    subgraph Server[SillyTavern-NewAge 服务器]
        C --> D(Express HTTP Server)
        C --> E[Socket.IO Server]
        E --> F[/auth]
        E --> G[/llm]
        E --> H[/function_call]
        E --> I[/rooms]
        E --> J[/clients]
        E --> K[/sillytavern]
        E --> L[/debug]
        E --> M[/ (默认)]
        D --> N[静态资源服务]
        N -- 提供 --> Clients
        F -- 认证/密钥管理 --> E
        G -- LLM 请求处理 --> E
        H -- 函数调用处理 --> E
        I -- 房间管理 --> E
        J -- 客户端管理 --> E
        K -- SillyTavern 集成 --> E
        L -- 调试功能 --> E
        M -- 监控/通用连接 --> E
    end

    style Server fill:#f9f,stroke:#333,stroke-width:2px
```

### 3.2. 命名空间 (Namespaces)

服务器利用 Socket.IO 命名空间实现了功能模块的隔离和组织，每个命名空间负责处理特定类型的功能和客户端交互：

* **`/` (默认):**  主要用于通用的客户端连接管理和监控客户端 (`monitor`) 的连接，处理客户端连接和断开连接事件，以及监控房间 `monitor-room` 的管理。
* **`/auth`:**  负责客户端的身份验证和密钥管理，处理客户端的认证请求，验证客户端身份，颁发和管理客户端密钥，提供获取客户端密钥和 SillyTavern 扩展列表的接口。
* **`/llm`:**  专门用于处理 LLM (大型语言模型) 相关的请求和响应，接收客户端的 LLM 请求，转发给 SillyTavern 扩展端，处理来自扩展端的 LLM 响应，并支持流式和非流式数据传输。
* **`/function_call`:**  处理客户端发起的函数调用请求，客户端可以调用服务器端预先注册的函数，实现灵活的功能扩展和服务器端逻辑调用。
* **`/rooms`:**  提供房间管理功能，允许客户端进行房间的创建、删除、加入、离开和查询操作，以及管理房间内的客户端成员和角色。
* **`/clients`:**  用于客户端管理，主要供管理前端使用，提供获取所有客户端密钥、单个客户端密钥、生成客户端密钥、移除客户端密钥和获取客户端列表等管理功能。
* **`/sillytavern`:**  专门用于服务器与 SillyTavern 扩展之间的通信，处理 SillyTavern 扩展的身份标识 (`IDENTIFY_SILLYTAVERN`)，用于扩展端注册和密钥分配。
* **`/debug`:**  提供服务器端的调试功能，允许管理员或授权客户端切换调试模式、读取服务器日志、查询服务器状态等，方便问题排查和系统监控。

### 3.3. 模块

服务器代码被组织成以下几个主要模块：

* **`server.js`:**  服务器的主入口文件，负责：
  * 初始化 Express 和 Socket.IO 服务器。
  * 加载服务器设置 (`loadServerSettings`)。
  * 设置 Express 中间件（例如，`express.json()` 用于解析 JSON 请求体）。
  * 设置静态资源目录（允许客户端访问 `/lib`, `/dist`, `/exampleClient`, `/public` 目录下的文件）。
  * 处理客户端连接和身份验证 (`checkAuth`, `isValidKey`)。
  * 为每个 Socket.IO 命名空间设置事件监听器 (`setupSocketListenersOn...Nsp`)。
  * 将客户端请求路由到相应的命名空间和处理程序。
  * 定义通用函数，如 `cleanUpClient` (客户端断开连接时清理数据) 和 `readLogFile` (读取日志文件)。
  * 初始化静态资源 (`initializeStaticResources`)。

* **`lib/`:** 包含一些库函数和常量定义, 这些模块通常不直接处理 Socket.IO 事件，而是提供辅助功能：
  * **`constants.js`:**  定义常量，包括：
    * `NAMESPACES`: Socket.IO 命名空间。
    * `MSG_TYPE`: 消息类型 (用于 `socket.emit` 和 `socket.on` 的事件名称)。
    * `EVENTS`: 服务器内部事件名称（用于日志记录和调试）。
    * `STREAM_EVENTS`: 流式消息事件名称。

* **`dist/`:** 包含服务器的核心逻辑，这些模块通常直接处理 Socket.IO 事件：
  * **`debug.js`:**  包含 `addDebugClients` 和 `removeDebugClients` 函数（当前似乎未使用），用于调试客户端管理。
  * **`function_call.js`:**  提供可供客户端通过 `/function_call` 命名空间远程调用的函数。主要函数：
    * `readJsonFromFile`: 读取 JSON 文件。
    * `saveJsonToFile`: 保存 JSON 文件。
    * `addStaticResources`: 动态添加静态资源。
  * **`Keys.js`:**  管理客户端密钥。主要函数：
    * `generateAndStoreClientKey`: 生成并存储客户端密钥。
    * `getClientKey`: 获取客户端密钥。
    * `isValidClientKey`: 验证客户端密钥。
    * `removeClientKey`: 移除客户端密钥。
    * `getAllClientKeys`: 获取所有客户端密钥。
  * **`logger.js`:**  提供日志记录功能，使用 `winston` 库。主要函数：
    * `logger`: winston 日志记录器实例。
    * `log`, `error`, `warn`, `info`, `debug`: 方便的日志记录函数。
  * **`Rooms.js`:**  提供与 Socket.IO 房间 API 交互的函数。主要函数：
    * `createRoom`: 创建房间 (如果房间不存在，Socket.IO 会自动创建)。
    * `deleteRoom`: 删除房间 (将所有客户端移出房间)。
    * `addClientToRoom`: 将客户端添加到房间。
    * `removeClientFromRoom`: 将客户端从房间移除。
  * **`non_stream.js`**:  处理非流式 Socket.IO 事件。主要函数：
    * `sendNonStreamMessage`: 客户端/服务器发送非流式消息。
    * `setupServerNonStreamHandlers`: 服务器端设置非流式消息处理器。
  * **`stream.js`**:  处理流式 Socket.IO 事件。主要函数：
    * `setupServerStreamHandlers`:  服务器端设置流式消息处理程序 (SillyTavern -> 服务器)。
    * `forwardStreamData`: 将流式数据从服务器转发到客户端 (服务器 -> 客户端)。
  * **`uuid/uuid.js`**:  提供 `uuidv4` 函数，用于生成 UUID (通用唯一标识符)。
  * **`chat.js`:** 定义了 `ChatModule` 类，这是服务器的核心模块之一，负责：
    * 房间管理 (创建、删除、加入、离开房间)。
    * 成员管理 (添加、移除成员，获取成员信息，设置成员角色等)。
    * 消息队列管理 (添加、编辑、删除、清空消息)。
    * LLM 请求和响应处理 (`handleLlmRequest`, `handleLlmResponse`)。
    * 连接策略管理 (与 `RelationsManage` 模块交互)。
    * 处理离线消息。
  * **`memberManagement.js`:** 定义了 `MemberManagement` 类。负责管理客户端成员信息：
    * 添加、移除成员
    * 获取成员信息
    * 设置成员角色
    * 踢出成员
    * 禁言成员
    * 通知房间的 master 和 manager
  * **`relationsManage.js`:** 定义了 `RelationsManage` 类。负责管理客户端房间和 SillyTavern 扩展之间的关系：
    * 设置连接策略
    * 手动分配扩展
    * 更新分配
    * 广播可用扩展列表
    * 添加/移除已连接的扩展和客户端房间

### 3.4. 核心概念

* **客户端 ID (`clientId`):**  每个连接到服务器的客户端的唯一标识符，通常由客户端在连接时生成或分配，用于服务器端区分和管理不同的客户端连接。
* **客户端类型 (`clientType`):**  标识客户端的类型，例如 `'extension'` (SillyTavern 扩展), `'monitor'` (监控客户端), `'SillyTavern'` (SillyTavern 客户端), `'client'` (普通客户端) 等，用于服务器端根据客户端类型进行不同的处理和权限控制。
* **密钥 (`key`):**  用于客户端身份验证的字符串，客户端在连接 `/auth`, `/llm`, `/function_call`, `/rooms`, `/clients`, `/sillytavern`, `/debug` 等命名空间时需要提供有效的密钥，服务器端验证密钥的有效性，确保连接的安全性。
* **房间 (`room`):**  Socket.IO 的核心概念，服务器端使用房间将客户端分组，实现消息的定向广播和群组通信，例如，可以创建聊天房间、监控房间等，只有加入特定房间的客户端才能接收到发送到该房间的消息。
* **可信客户端 (`trustedClients`):**  服务器维护的可信客户端 ID 集合，只有在 `trustedClients` 列表中的客户端才被认为是可信的普通客户端，可以连接到服务器并访问受限功能。
* **可信 SillyTavern (`trustedSillyTaverns`):**  服务器维护的可信 SillyTavern 扩展 ID 集合，只有在 `trustedSillyTaverns` 列表中的 SillyTavern 扩展才被认为是可信的，可以连接到服务器并访问特定功能。
* **函数调用 (`function_call`):**  一种客户端-服务器交互模式，客户端可以通过 `/function_call` 命名空间调用服务器端预先注册的函数，并接收函数执行结果，实现了客户端动态扩展服务器功能的机制。
* **静态资源 (`static resources`):**  服务器可以通过 `addStaticResources` 函数动态注册的静态文件资源，包括 HTML, CSS, JavaScript, 图像等，客户端可以通过 HTTP 请求访问这些静态资源，用于构建 Web 界面和前端功能。
* **连接策略 (`connectionPolicy`):**  服务器端配置的扩展端连接策略，决定了如何将可用的 SillyTavern 扩展端分配给客户端房间，支持多种策略 ('Free', 'Manual', 'Balanced', 'Broadcast', 'Random')，管理员可以根据需求灵活配置。
* **消息请求模式 (`messageRequestMode`):**  服务器端配置的消息请求模式，决定了如何处理客户端的 LLM 请求，例如是否需要等待 Master 客户端的请求、是否立即转发请求等，支持多种模式 ('Default', 'Immediate', 'MasterOnly', 'Separate')，可以适应不同的 LLM 请求处理场景。

## 4. 工作流程

SillyTavern-NewAge 服务器支持多种工作流程，包括客户端连接、身份验证、LLM 请求、房间管理、函数调用等。下面描述几个典型的工作流程：

### 4.1. 客户端连接和身份验证

1. **客户端连接:** 客户端 (SillyTavern 扩展、Web/移动应用、监控前端) 通过 Socket.IO 连接到服务器。客户端可以连接到不同的命名空间（`/`, `/auth`, `/llm` 等），具体取决于客户端类型和所需功能。
2. **发送认证信息:** 客户端在连接时，通过 `socket.handshake.auth` 对象发送认证信息，包括 `clientId` (客户端 ID) 和 `key` (密钥)。
3. **服务器验证:** 服务器在 `/auth` 命名空间处理身份验证请求。
    * 检查 `clientId` 是否在 `trustedClients` 或 `trustedSillyTaverns` 列表中（客户端是否受信任）。
    * 如果客户端是 SillyTavern 扩展，服务器会比较客户端提供的 `key` 与存储的哈希密钥。
    * 如果客户端是普通客户端，服务器会使用 `Keys.js` 模块验证密钥。
4. **认证结果:**
    * 如果认证成功，服务器允许客户端连接到相应的命名空间，并触发后续的事件处理。
    * 如果认证失败，服务器会断开与客户端的连接，并发送错误消息。

### 4.2. LLM 请求 (非流式)

这个流程展示了客户端如何通过服务器向 SillyTavern 扩展发送 LLM 请求并接收响应：

1. **客户端发送请求:** 客户端连接到 `/llm` 命名空间，并发送 `LLM_REQUEST` 消息，消息中包含：
    * `requestId`:  唯一请求 ID。
    * `target`: 目标 SillyTavern 扩展的 `clientId` (或 `clientId` 数组)。
    * `data`:  LLM 请求数据 (例如，用户输入、上下文信息等)。
    * `role`: 客户端的角色。
2. **服务器路由:** 服务器接收到 `LLM_REQUEST` 消息后：
    * 验证客户端是否有权限向目标 SillyTavern 发送请求。
    * 将请求信息存储在 `ChatModule` 的 `llmRequests` 映射中，用于后续响应路由。
    * 根据`messageRequestMode` 和 `role`决定如何处理：
        * `Default`: 如果是`guest`，请求会被加入队列；如果是`master`则合并请求，并转发给 SillyTavern 扩展。
        * `Immediate`: 立即转发所有请求 (无需区分角色)
        * `MasterOnly`: 只有 `master`的请求会被转发。
        * `Separate`: 立即转发所有请求
3. **SillyTavern 处理:** 目标 SillyTavern 扩展接收到 `LLM_REQUEST` 消息后：
    * 处理 LLM 请求 (例如，调用语言模型 API)。
    * 将 LLM 响应发送回服务器。
4. **服务器转发响应:** 服务器接收到来自 SillyTavern 的响应后，根据 `requestId` 查找原始请求信息 (包括原始客户端的 `clientId` 和 `room`)，并将响应转发回原始客户端所在的房间。
5. **客户端处理响应:** 客户端接收到LLM响应后进行处理。

### 4.3. LLM 请求 (流式)

1. **客户端发送请求:** 客户端连接到 `/llm` 命名空间，并发送 `LLM_REQUEST` 消息，指定消息类型为流式。
2. **服务器转发:** 服务器根据上述流程，将请求转发给目标 SillyTavern 扩展端
3. **SillyTavern发送流式数据:**

   * SillyTavern 通过 `CLIENT_STREAM_START`事件开始流式传输，通过`CLIENT_STREAM_DATA_FIRST`，`CLIENT_STREAM_DATA_MIDDLE` 和 `CLIENT_STREAM_DATA_LAST`事件发送流式数据

4. **服务器处理和转发:**

   * 服务器通过`setupServerStreamHandlers`接收SillyTavern的流式事件。
   * 通过`forwardStreamData`函数将流式数据通过`SERVER_STREAM_DATA`转发给原始客户端所在的房间。

5. **SillyTavern 发送结束信号:** SillyTavern 通过 `CLIENT_STREAM_END` 事件结束流式传输。
6. **服务器处理结束信号:** 服务器通过`setupServerStreamHandlers`接收SillyTavern的流式结束事件，并调用 `chatModule.handleLlmResponse`收集完整响应。

### 4.4. 聊天系统工作流程 (房间、成员、消息)

这是更详细的聊天系统工作流程，涵盖了房间管理、成员管理和消息交互：

1. **房间创建 (通常由管理员):**
    * 管理员客户端连接到 `/rooms` 命名空间。
    * 发送 `CREATE_ROOM` 消息，指定房间名称 (`roomName`)。
    * 服务器调用 `ChatModule` 的 `createRoom` 方法创建房间。
    * 如果房间创建成功，服务器将创建者客户端添加到房间，并将其角色设置为 `master`。
    * 服务器向管理员客户端发送成功响应。

2. **客户端加入房间:**
    * 客户端连接到 `/rooms` 命名空间（或默认命名空间，然后加入房间）。
    * 发送 `JOIN_ROOM` 消息 (通过 `ChatModule` 间接调用)，指定要加入的房间名称 (`roomName`)。
    * 服务器调用 `ChatModule` 的 `joinRoom` 方法将客户端添加到房间。
    * 服务器将客户端添加到房间的成员列表中，并设置其角色 (默认为 `guest`)。
    * 服务器向房间内的 `master` 和 `managers` 发送 `MEMBER_JOINED` 事件通知。

3. **成员管理 (管理员操作):**
    * **设置成员角色:** 管理员客户端发送 `SET_MEMBER_ROLE` 消息，指定目标客户端 ID (`targetClientId`)、房间名称 (`roomName`) 和新角色 (`role`)。 服务器调用 `ChatModule` 的 `memberManagement.setMemberRole` 方法更新成员角色。
    * **踢出成员:** 管理员客户端发送 `KICK_MEMBER` 消息，指定目标客户端 ID 和房间名称。服务器调用 `ChatModule` 的 `memberManagement.kickMember` 方法将成员踢出房间。
    * **禁言成员:** 管理员客户端发送 `MUTE_MEMBER` 消息，指定目标客户端 ID、房间名称和禁言时长。服务器调用 `ChatModule` 的 `memberManagement.muteMember` 方法禁言成员 (需要在 `MemberManagement.js` 中实现禁言逻辑)。

4. **消息交互:**
    * **发送消息:** 客户端 (通常在 `/llm` 命名空间) 发送 LLM 请求 (如 4.2 和 4.3 所述)。
    * **编辑消息:** 客户端 (可以在 `/llm` 命名空间) 发送 `EDIT_MESSAGE` 消息，指定房间名称、消息 ID 和更新后的消息内容。服务器调用 `ChatModule` 的 `editMessage` 方法编辑消息。
    * **删除消息:** 客户端发送 `DELETE_MESSAGE` 消息，指定房间名称和消息 ID。服务器调用 `ChatModule` 的 `deleteMessage` 方法删除消息。
    * **清空消息:** 管理员客户端发送 `CLEAR_MESSAGES` 消息，指定房间名称。服务器调用 `ChatModule` 的 `clearMessages` 方法清空房间消息。

5. **断开连接:** 客户端断开连接后，服务器通过`cleanUpClient` 函数清理客户端信息。

### 4.5. 函数调用

1. **客户端请求:** 客户端连接到 `/function_call` 命名空间，并发送 `FUNCTION_CALL` 消息，消息中包含：
    * `requestId`: 唯一请求 ID。
    * `functionName`: 要调用的服务器端函数名称。
    * `args`: 函数参数。
    * `target`: 目标 ('server' 或客户端 ID)。
2. **服务器处理:**
    * 如果 `target` 是 'server'，服务器在 `functionRegistry` 中查找函数并调用，然后将结果通过回调函数返回给客户端。
    * 如果 `target` 是客户端 ID，服务器将请求转发给指定客户端。

## 5. 安全性

服务器在多个层面实施了安全措施，保障系统和数据的安全：

* **严格的身份验证:**  所有客户端连接到 `/auth`, `/llm`, `/function_call`, `/rooms`, `/clients`, `/sillytavern`, `/debug` 等命名空间时，都必须通过身份验证，提供有效的 `clientId` 和 `key`，密钥验证过程使用 bcrypt 哈希比较，防止密钥泄露和未授权访问。SillyTavern 客户端还支持密码验证，增强了 SillyTavern 扩展连接的安全性。
* **安全的密钥管理:**  客户端密钥在服务器端使用 bcrypt 哈希算法进行单向哈希处理后存储，数据库泄露也不会泄露原始密钥。密钥生成和管理逻辑集中在 `Keys.js` 模块，方便维护和审计。
* **基于白名单的可信客户端机制:**  服务器维护 `trustedClients` 和 `trustedSillyTaverns` 两个白名单集合，只有在白名单中的客户端 ID 才被认为是可信的，可以成功通过身份验证并访问服务器提供的功能，有效防止了未授权客户端的接入。
* **网络安全模式 (`networkSafe`):**  通过 `networkSafe` 配置项，可以启用网络安全模式，限制部分敏感 API (例如客户端管理、密钥管理等) 的访问，进一步提高服务器的安全性，防止潜在的恶意操作。
* **输入验证和过滤:**  虽然文档中没有明确提及，但在实际开发中，服务器端代码应进行输入验证和过滤，防止恶意代码注入和跨站脚本攻击 (XSS)，例如对客户端提交的消息内容、房间名称、客户端 ID 等进行安全检查和过滤。
* **日志记录和审计:**  服务器使用 `winston` 库记录详细的日志信息，包括用户操作、系统事件、错误和警告，方便管理员进行安全审计和异常排查。
* **定期安全审查和更新:**  为了应对新的安全威胁，服务器代码应定期进行安全审查，及时修复潜在的安全漏洞，并更新依赖库到最新版本，保持系统的安全性。

## 6. 总结

SillyTavern-NewAge 服务器构建了一个健壮、灵活且安全的实时通信平台，为 SillyTavern 扩展和相关应用提供了强大的后端支持。其模块化的架构、命名空间隔离、事件驱动模型、全面的安全机制和多样的扩展功能，使其成为构建可扩展、高性能、安全可靠的实时交互应用的理想选择。服务器的设计充分考虑了灵活性和易用性，为开发者提供了便捷的开发体验和强大的功能支撑。
