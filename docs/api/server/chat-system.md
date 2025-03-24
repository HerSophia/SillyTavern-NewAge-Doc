---
title: 聊天系统
layout: doc
---

# 聊天系统 (Chat System)

SillyTavern-NewAge 服务器的聊天系统构建在 Socket.IO 之上，提供了一个灵活、可扩展且安全的实时通信框架。 聊天系统支持多种消息类型 (包括流式和非流式消息)、房间管理、成员管理、权限控制等功能。 本文档详细描述了聊天系统中从 LLM 请求到最终响应的完整流程。

## 1. 核心组件

聊天系统的核心组件包括：

* **客户端 (Client):**
  * **普通客户端 (Other):** 连接到服务器的 Web 应用程序、移动应用程序或其他任何支持 Socket.IO 的客户端。
  * **SillyTavern 扩展 (SillyTavern):** SillyTavern 扩展，负责与 LLM (大型语言模型) API 交互。
  * **管理前端 (Monitor):** 用于管理服务器、房间和客户端的特殊客户端。
* **服务器 (Server):**
  * **`ChatModule` (lib/chat.js):** 聊天系统的核心模块，负责处理消息路由、房间管理、成员管理、LLM 请求和响应处理等。
  * **`MemberManagement` (lib/memberManagement.js):** 管理客户端成员信息 (例如，`clientId`、`clientType`、角色等)。
  * **`RelationsManage` (lib/relationsManage.js):** 管理客户端房间和 SillyTavern 扩展之间的连接关系。
  * **`Rooms.js` (dist/Rooms.js):** 提供与 Socket.IO 房间 API 交互的底层函数。
  * **`stream.js` (lib/stream.js):** 处理流式消息的接收和转发。
  * **`non_stream.js` (lib/non_stream.js):** 处理非流式消息的接收和转发。
  * **`Keys.js` (dist/Keys.js):** 管理客户端密钥。
  * **`logger.js` (dist/logger.js):** 记录服务器日志。
* **Socket.IO 命名空间 (Namespace):**
  * **`/llm`:** 用于处理 LLM 请求和响应。
  * **`/rooms`:** 用于房间管理。
  * **`/clients`:** 用于客户端管理。
  * **`/auth`:** 用于客户端身份验证。
  * **`/sillytavern`:** 用于服务器与 SillyTavern 扩展之间的通信。
  * **`/function_call`:** 用于函数调用。
  * **`/` (默认):** 用于通用连接。
  * **`/debug`:** 用于调试。

## 2. 消息类型

聊天系统支持以下主要消息类型 (定义在 `lib/constants.js` 的 `MSG_TYPE` 中)：

* **`LLM_REQUEST`:**  客户端发送给服务器的 LLM 请求。
* **`NON_STREAM`:** 非流式消息 (例如，简单的文本消息、命令等)。
* **`STREAM_START`、`STREAM_END`、`STREAM_DATA_FIRST`、`STREAM_DATA_MIDDLE`、`STREAM_DATA_LAST`、`STREAM_DATA_RETRY`、`STREAM_DATA_FAILED`:**  流式消息相关的事件。
* **`FUNCTION_CALL`**: 函数调用
* **`EDIT_MESSAGE`**: 编辑消息。
* **`DELETE_MESSAGE`:**  删除消息。

## 3. 完整流程 (LLM 请求 -> 响应)

以下是聊天系统中处理 LLM 请求并返回响应的详细流程：

### 3.1. 客户端发起 LLM 请求

1. **客户端连接:** 客户端 (例如 Web 应用) 连接到服务器的 `/llm` 命名空间。
2. **身份验证:** 客户端通过 `/auth` 命名空间进行身份验证 (提供 `clientId` 和 `key`)。
3. **发送 LLM 请求:** 客户端向服务器发送 `LLM_REQUEST` 消息，消息数据包含：
    * `requestId`:  唯一请求 ID (由客户端生成)。
    * `target`:  目标 SillyTavern 扩展的 `clientId` (或 `clientId` 数组, 用于广播)。
    * `data`:  LLM 请求数据 (例如，用户输入、上下文信息、模型参数等)。
    * `role`: 客户端在房间中的角色（`guest`, `manager`, `master` 或 `special`）。
    * `isStreaming`: 一个布尔值，指示是否请求流式响应。

    ```javascript
    // 示例 (非流式请求)
    socket.emit(MSG_TYPE.LLM_REQUEST, {
      requestId: 'unique_request_id',
      target: 'SillyTavern_extension_client_id',
      data: {
        prompt: '你好，世界！',
        // ... 其他 LLM 请求参数 ...
      },
      role: 'guest',
      isStreaming: false,
    });

    // 示例 (流式请求)
      socket.emit(MSG_TYPE.LLM_REQUEST, {
        requestId: 'unique_request_id_stream',
        target: 'SillyTavern_extension_client_id',
        data: {
          prompt: '生成一个故事：',
           // ... 其他 LLM 请求参数 ...
        },
        role: 'guest',
        isStreaming: true,
    });
    ```

### 3.2. 服务器处理 LLM 请求

1. **接收请求:** 服务器在 `/llm` 命名空间接收到 `LLM_REQUEST` 消息。
2. **身份验证和权限检查:** 服务器验证客户端的身份 (通过 `checkAuth` 函数) 以及客户端是否有权限向目标 SillyTavern 扩展发送请求。
3. **存储请求信息:** 服务器将请求信息存储在 `ChatModule` 的 `llmRequests` 对象中，用于后续响应路由。

    ```javascript
    // ChatModule.js (简化示例)
    this.llmRequests[requestId] = {
      originalClient: clientId, // 发起请求的客户端 ID
      room: roomName,          // 客户端所在的房间
      target: target,          // 目标 SillyTavern 扩展的 clientId (或 clientId 数组)
    };
    ```

4. **消息请求模式判断:** 根据配置的`messageRequestMode`来判断消息的处理方式:
    * `Default`:
        * 如果客户端角色是`guest`，请求会被加入到房间的`guestRequestQueues`中。
        * 如果客户端角色是`master`，服务器会检查`guestRequestQueues`，如果存在就将请求合并，然后转发给 SillyTavern 扩展。
        * 如果客户端角色是`special`，会加入到`guestRequestQueues`。
    * `Immediate`: 立即转发所有请求 (无需区分角色)。
    * `MasterOnly`: 只有 `master`的请求会被转发。
    * `Separate`: 立即转发所有请求。
5. **转发请求:** 服务器将 `LLM_REQUEST` 消息转发给目标 SillyTavern 扩展 (通过 `target` 字段指定的 `clientId`)。

    ```javascript
    // 转发给单个 SillyTavern 扩展
    this.io.of(NAMESPACES.LLM).to(target).emit(MSG_TYPE.LLM_REQUEST, request);

    // 转发给多个 SillyTavern 扩展 (广播)
    for (const t of target) {
      this.io.of(NAMESPACES.LLM).to(t).emit(MSG_TYPE.LLM_REQUEST, request);
    }
    ```

### 3.3. SillyTavern 扩展处理 LLM 请求

1. **接收请求:** SillyTavern 扩展在 `/llm` 命名空间接收到 `LLM_REQUEST` 消息。
2. **调用 LLM API:** SillyTavern 扩展根据请求数据 (`data`) 调用 LLM API (例如，OpenAI、Anthropic Claude 等)。
3. **发送响应 (非流式):**
    * SillyTavern 扩展将完整的 LLM 响应作为 `message` 事件 (类型为 `MSG_TYPE.NON_STREAM`) 发送回服务器。

        ```javascript
        // SillyTavern 扩展 (非流式响应示例)
        socket.emit('message', {
          type: MSG_TYPE.NON_STREAM,
          data: 'LLM 响应的完整文本。',
          source: 'server', // 消息来源 (这里是 SillyTavern 扩展，但服务器会将其标记为 'server')
          requestId: originalRequestId, // 原始请求 ID
          outputId: 'unique_output_id',
        });
        ```

4. **发送响应 (流式):**
    * SillyTavern 扩展发送 `STREAM_START` 事件，表示流式传输开始。
    * SillyTavern 扩展将 LLM 响应分割成多个数据块 (chunk)，并通过 `STREAM_DATA_FIRST`、`STREAM_DATA_MIDDLE`、`STREAM_DATA_LAST` 事件按顺序发送这些数据块。
    * SillyTavern 扩展发送 `STREAM_END` 事件，表示流式传输结束。
    * 如果发生错误，SillyTavern 扩展可能会发送 `STREAM_DATA_RETRY` 或 `STREAM_DATA_FAILED` 事件。

    ```javascript
     // SillyTavern 扩展 (流式响应示例)
    // 1. 开始流式传输
    socket.emit(STREAM_EVENTS.START, {
      type: MSG_TYPE.STREAM_START,
      streamId: 'unique_stream_id',
      outputId: 'unique_output_id',
      requestId: originalRequestId, // 原始请求 ID
      target: originalClient,
    });

    // 2. 发送数据块
    socket.emit(STREAM_EVENTS.DATA_FIRST, {
      type: MSG_TYPE.STREAM_DATA_FIRST,
      streamId: 'unique_stream_id',
      outputId: 'unique_output_id',
      requestId: originalRequestId,
      chunkIndex: 0, // 数据块索引
      data: 'LLM 响应的第一个数据块',
    });

    // ... 发送更多 STREAM_DATA_MIDDLE 数据块 ...

    socket.emit(STREAM_EVENTS.DATA_LAST, {
      type: MSG_TYPE.STREAM_DATA_LAST,
      streamId: 'unique_stream_id',
      outputId: 'unique_output_id',
      requestId: originalRequestId,
      chunkIndex: 10, // 最后一个数据块的索引
      data: 'LLM 响应的最后一个数据块',
    });

    // 3. 结束流式传输
    socket.emit(STREAM_EVENTS.END, {
      type: MSG_TYPE.STREAM_END,
      streamId: 'unique_stream_id',
      outputId: 'unique_output_id',
      requestId: originalRequestId,
    });
    ```

### 3.4. 服务器处理 LLM 响应 (转发给客户端)

> [!NOTE]
> 更多详细信息可见[消息传输](./data-transmission)

1. **接收响应 (非流式):**
    * 服务器在 `/llm` 命名空间接收到来自 SillyTavern 扩展的 `message` 事件 (类型为 `MSG_TYPE.NON_STREAM`)。
    * 服务器根据 `requestId` 从 `ChatModule.llmRequests` 中查找原始请求信息。
    * 服务器调用 `ChatModule.handleLlmResponse` 方法将完整的 LLM 响应存储到消息队列中。
    * 服务器将 `message` 事件转发给原始客户端所在的房间 (通过 `originalRequest.room` 定位)。

2. **接收响应 (流式):**
    * 服务器通过 `setupServerStreamHandlers` (`lib/stream.js`) 监听来自 SillyTavern 扩展的流式事件 (`STREAM_START`, `STREAM_DATA_*`, `STREAM_END`)。
    * 服务器使用 `streamBuffers` 对象存储每个流的数据块，使用 `outputBuffers` 对象存储每个输出的完整数据。
    * 对于每个接收到的数据块，服务器立即通过 `forwardStreamData` 函数 (`lib/stream.js`) 将其转发给原始客户端 (通过创建的 Socket.IO 流)。
        * `forwardStreamData` 函数会根据 `requestId` 查找原始请求信息, 确定目标房间, 向目标房间发送 `streamed_data` 事件。
    * 当服务器接收到 `STREAM_END` 事件时：
        * 服务器将 `streamBuffers` 中存储的数据块按索引排序，并拼接成完整的消息。
        * 服务器调用 `ChatModule.handleLlmResponse` 方法将完整的 LLM 响应存储到消息队列中。

    ```javascript
    // ChatModule.handleLlmResponse (简化示例)
    handleLlmResponse(roomName, data) {
      const { requestId } = data;
      const originalRequest = this.llmRequests[requestId];

      if (!originalRequest) {
        console.warn(`No matching request found for requestId: ${requestId}`);
        return;
      }

      // 将响应添加到对应房间的 llmResponseQueues 中
      const messageId = this.addMessage(roomName, data, true);
    }
    ```

### 3.5. 客户端接收 LLM 响应

1. **接收响应 (非流式):** 客户端在 `/llm` 命名空间监听 `message` 事件，接收来自服务器的 LLM 响应。
2. **接收响应 (流式):** 客户端监听 `streamed_data` 事件，接收来自服务器的流式数据块，并在客户端进行拼接和渲染。

### 3.6 消息的编辑与删除

1. **编辑消息**

* 客户端 (可以在 `/llm` 命名空间) 发送 `EDIT_MESSAGE` 消息，指定房间名称、消息 ID 和更新后的消息内容。
* 服务器调用 `ChatModule` 的 `editMessage` 方法编辑消息。

1. **删除与清空消息:** 客户端(可以在 `/llm` 命名空间) 发送 `DELETE_MESSAGE` 或 `CLEAR_MESSAGES` 消息，指定房间名称和消息 ID。服务器调用 `ChatModule` 的 `deleteMessage` 方法删除消息。

## 4. 总结

SillyTavern-NewAge 服务器的聊天系统提供了一个完整的实时通信框架，支持非流式和流式消息、房间管理、成员管理等功能。`ChatModule` 是聊天系统的核心，负责处理消息路由、LLM 请求和响应、房间和成员管理等。 通过 Socket.IO 命名空间和事件，服务器和客户端可以进行高效、灵活的通信。 上述流程详细描述了从客户端发起 LLM 请求到最终接收到响应的整个过程，包括了服务器和 SillyTavern 扩展之间的交互，以及流式和非流式消息的处理。
