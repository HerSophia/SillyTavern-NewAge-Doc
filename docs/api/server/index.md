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

服务器代码被组织成清晰的模块结构，每个模块负责特定的功能，提高了代码的可维护性和可扩展性：

* **`server.js`:**  服务器主程序入口文件，负责：
  * 初始化 Express 应用和 HTTP 服务器。
  * 初始化 Socket.IO 服务器并配置 CORS。
  * 加载服务器配置 (`serverSettings`)，包括从配置文件加载和默认配置合并。
  * 启动 HTTP 和 Socket.IO 服务器监听指定端口。
  * 配置静态资源服务，将 `/lib`, `/dist`, `/exampleClient`, `/public` 目录映射为静态资源路由。
  * 定义根路径 `/` 和 `/index.html` 路由，返回 `monitor.html`。
  * 配置 404 错误处理。
  * 调用 `initializeStaticResources` 函数初始化静态资源缓存。
  * 调用 `loadServerSettings` 加载服务器配置和初始化可信客户端/SillyTavern。
  * 定义 `reinitializeSocketIO` 函数，用于重新初始化 Socket.IO 服务器。
  * 注册 `function_call` 功能的服务器端函数。
* **`lib/`:** 存放服务器核心库模块和常量定义，包含多个子模块：
  * **`constants.js`:**  定义了整个服务器应用中使用的常量，包括 `MSG_TYPE` (消息类型常量)、`STREAM_EVENTS` (流事件名称常量) 和 `NAMESPACES` (Socket.IO 命名空间常量) 和 `EVENTS` (服务器内部事件名称常量)，是整个服务器的常量字典。
  * **`uuid/uuid.js`**: 自定义模块, 封装了 UUID v4 生成函数 `uuidv4`，用于生成唯一 ID。
  * **`chat.js`**:  核心模块 `ChatModule` 的定义，封装了聊天功能的主要逻辑，包括房间管理、成员管理、消息处理、LLM 请求和响应的处理、消息队列管理和消息请求模式管理，是服务器的核心业务逻辑模块。
  * **`memberManagement.js`**:  定义了 `MemberManagement` 类，负责聊天应用的成员管理功能，包括成员信息维护、成员生命周期管理、成员角色管理和房间操作，与 `ChatModule` 协同工作，处理成员相关的业务逻辑。
  * **`relationsManage.js`**:  定义了 `RelationsManage` 类，负责客户端房间和 SillyTavern 扩展端之间的关系管理，核心功能是根据不同的连接策略，将可用的 SillyTavern 扩展端分配给客户端房间，并动态更新和广播分配结果，实现扩展端资源的有效管理和分配。
  * **`stream.js`**:  定义了流式数据处理相关的函数，包括 `setupServerStreamHandlers` (设置服务器端流式处理程序) 和 `forwardStreamData` (流式转发数据)，用于处理 SillyTavern 扩展端向服务器发送的流式 LLM 响应，以及服务器向客户端转发流式数据。
  * **`non_stream.js`**:  定义了非流式消息处理相关的函数，包括 `sendNonStreamMessage` (发送非流式消息) 和 `setupServerNonStreamHandlers` (设置服务器端非流式消息处理器)，用于处理客户端和服务器之间传统的、一次性发送完整消息的非流式通信。
  * **`logger.js`**:  定义了日志记录模块，封装了 `winston` 库，提供了 `logger` 实例和 `log`, `error`, `warn`, `info`, `debug` 等便捷的日志记录函数，用于服务器端的日志记录。
* **`dist/`:**  存放服务器核心模块的编译输出，包含以下模块：
  * **`debug.js`:**  定义了调试功能相关的函数，包括 `addDebugClients`, `removeDebugClients` (调试客户端管理) 和 `setupSocketListenersOnDebugNsp`, `setupServerStreamHandlers` (调试命名空间事件监听器设置) 等，用于处理服务器端的调试模式切换、服务器状态查询、日志读取等功能。
  * **`function_call.js`:**  定义了可供远程调用的服务器端函数，例如 `readJsonFromFile`, `saveJsonToFile`, `addStaticResources` 等，这些函数可以通过 `/function_call` 命名空间被客户端动态调用，扩展服务器功能。
  * **`Keys.js`:**  定义了客户端密钥管理模块，包括 `generateAndStoreClientKey` (生成和存储客户端密钥), `isValidClientKey` (验证客户端密钥), `removeClientKey` (移除客户端密钥), `getClientKey` (获取客户端密钥), `getAllClientKeys` (获取所有客户端密钥) 等函数，负责客户端密钥的生成、存储、验证和管理。
  * **`logger.js`:**  日志记录模块的编译输出，与 `lib/logger.js` 功能相同，提供日志记录功能。
  * **`Rooms.js`:**  房间管理模块的编译输出，定义了 `addClientToRoom`, `createRoom`, `deleteRoom`, `getAllRooms`, `getClientRooms`, `isClientInRoom`, `removeClientFromRoom` 等函数，封装了与 Socket.IO 房间管理相关的底层操作，提供房间管理 API。
  * **`non_stream.js`**:  非流式消息处理模块的编译输出，与 `lib/non_stream.js` 功能相同。
  * **`stream.js`**:  流式数据处理模块的编译输出，与 `lib/stream.js` 功能相同。

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

## 4. 工作流程 (示例：LLM 请求 - 流式响应)

1. **客户端发起 LLM 请求:** 客户端 (例如 Web 应用程序) 通过 Socket.IO 连接到 `/llm` 命名空间，并发送 `LLM_REQUEST` 消息，消息中包含目标 SillyTavern 扩展的 `clientId` (`target`)、请求 ID (`requestId`)、客户端角色 (`role`) 和 LLM 请求数据。
2. **服务器接收和路由请求:** 服务器的 `/llm` 命名空间事件处理程序接收到 `LLM_REQUEST` 消息，根据消息请求模式 (`messageRequestMode`) 和客户端角色 (`role`)，将请求路由到目标 SillyTavern 扩展端。对于流式请求，服务器会创建流缓冲区和输出缓冲区，并记录请求状态。
3. **服务器转发请求到 SillyTavern:** 服务器通过 `/llm` 命名空间将 `LLM_REQUEST` 消息转发给目标 SillyTavern 扩展端。
4. **SillyTavern 处理请求并返回流式响应:** SillyTavern 扩展端接收到 `LLM_REQUEST` 后，调用 LLM 模型进行推理，并将 LLM 的流式响应数据通过 Socket.IO 流式事件 (`CLIENT_STREAM_START`, `CLIENT_STREAM_DATA_FIRST`, `CLIENT_STREAM_DATA_MIDDLE`, `CLIENT_STREAM_DATA_LAST`, `CLIENT_STREAM_END`) 发送回服务器的 `/llm` 命名空间。
5. **服务器接收和缓存流式数据:** 服务器的 `/llm` 命名空间流式事件处理程序 (`setupServerStreamHandlers`) 接收到来自 SillyTavern 的流式数据块，将数据块缓存到流缓冲区和输出缓冲区，并更新请求状态。
6. **服务器转发流式数据到客户端:** 服务器的流式转发处理器 (`forwardStreamData`) 将接收到的流式数据块通过 `SERVER_STREAM_DATA` 事件转发回原始客户端所在的房间 (通过 `ChatModule` 的 `llmRequests` 映射找到原始请求房间)。客户端接收到 `SERVER_STREAM_DATA` 事件后，即可实时显示 LLM 的流式响应。
7. **服务器处理完整响应:** 当 SillyTavern 扩展端发送 `CLIENT_STREAM_END` 事件表示流式响应结束时，服务器将流缓冲区中的数据组装成完整的 LLM 响应消息，并调用 `ChatModule.handleLlmResponse` 函数，将完整的响应数据传递给 `ChatModule` 进行后续处理 (例如，添加到聊天记录队列)。
8. **客户端接收完整响应 (可选):**  客户端可以监听非流式消息事件，接收服务器在流式传输结束后发送的完整 LLM 响应消息 (虽然在流式传输场景下，客户端通常已经通过流式事件接收到完整的数据，非流式完整响应消息可能是冗余的，取决于具体实现)。

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
