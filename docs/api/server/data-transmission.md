---
title: 消息传输
layout: doc
---

# 消息传输 (Message Transmission)

SillyTavern-NewAge 服务器支持两种主要的消息传输方式：

1. **非流式传输 (Non-streaming):**  一次性发送完整的消息数据。
2. **流式传输 (Streaming):**  将消息数据分割成多个块 (chunk)，按顺序发送。 主要用于 LLM (大型语言模型) 的响应，以提供更快的响应速度和更好的用户体验。

> [!IMPORTANT]
> 服务器主要负责 **接收 SillyTavern 扩展端发送的流式/非流式数据，并将其转发给发起请求的客户端**。`ChatModule` 在此过程中扮演关键角色：**查找原始 LLM 请求** (根据 `requestId`)，并将 **LLM 响应 (无论是流式还是非流式) 存储到内存中的消息队列**。

## 1. 非流式传输

### 1.1. 消息格式

非流式消息通过 `'message'` 事件发送和接收，数据格式如下：

```typescript
{
  type: MSG_TYPE.NON_STREAM; // 消息类型 (常量)
  data: string;             // 消息内容
  source: string;           // 消息来源 ('server' 或客户端的标识符)
  requestId: string;        // 请求 ID (用于关联请求和响应)
  outputId: string;         // 输出 ID (用于区分同一请求的多个输出)
  clientId: string;        // 客户端的ID
}
```

### 1.2. 服务器端处理 (`lib/non_stream.js` 和 `lib/chat.js`)

`setupServerNonStreamHandlers(io, namespace, chatModule)` 函数用于设置服务器端的非流式消息处理程序。

* **参数:**
  * `io`:  Socket.IO 服务器实例。
  * `namespace`:  命名空间 (字符串)。
  * `chatModule`: `ChatModule` 实例。
* **工作流程:**
    1. 监听指定命名空间的 `'connection'` 事件。
    2. 对于每个连接的客户端 (`socket`)：
        * 监听 `'message'` 事件。
        * 如果 `data.type` 为 `MSG_TYPE.NON_STREAM`：
            * 记录收到的消息。
            * 根据`data.data`的内容进行回应。
            * 根据 `data.requestId` 从 `chatModule.llmRequests` 中查找原始请求信息。
            * 如果找到原始请求：
                * 向发起请求的客户端 (通过 `originalRequest.room` 定位) 发送 `'message'` 事件, 并将 `data` 设置为服务器消息, `source` 设置为 `'server'`, 以及原始请求的 `requestId` 和 `outputId`。
                * **调用 `chatModule.handleLlmResponse(roomName, responseData)` 将完整的非流式响应数据存储到 `ChatModule` 的消息队列中。**  `responseData` 包含 `requestId` 和消息内容。
            * 如果未找到原始请求，则记录警告。

## 2. 流式传输

### 2.1. 消息格式

流式传输涉及多个事件：

* **`STREAM_START`:**  表示流式传输开始。
* **`STREAM_DATA_FIRST`:**  第一个数据块。
* **`STREAM_DATA_MIDDLE`:**  中间的数据块。
* **`STREAM_DATA_LAST`:**  最后一个数据块。
* **`STREAM_DATA_RETRY`:** 数据块重试。
* **`STREAM_DATA_FAILED`:** 数据块传输失败。
* **`STREAM_END`:**  表示流式传输结束。
* **`streamed_data`:** 服务器 -> 客户端, 数据主体。
* **`streamed_end`:** 服务器 -> 客户端, 传输结束。

数据格式 (以 `STREAM_START` 为例，其他 `STREAM_DATA_*` 事件类似):

```typescript
{
  type: MSG_TYPE.STREAM_START; // 消息类型 (常量)
  streamId: string;          // 流的唯一 ID (由 SillyTavern 扩展生成)
  outputId: string;          //流的输出 ID (由 SillyTavern 扩展生成)
  requestId: string;          // 请求ID (来自发出请求的客户端)
  target: string;          //转发目标
  // ... 其他可选字段 ...
}
```

`streamed_data`的数据格式：

```typescript
{
    streamId: string;          // 流的唯一 ID (由 SillyTavern 扩展生成)
    outputId: string;          //流的输出 ID (由 SillyTavern 扩展生成)
    requestId: string;          // 请求ID (来自发出请求的客户端)
    source: string;         //'server'
}
```

### 2.2. 服务器端处理 (`lib/stream.js` 和 `lib/chat.js`)

#### 2.2.1. `setupServerStreamHandlers(io, namespace, chatModule)`

* **功能:**  设置服务器端的流式处理程序。
* **参数:**
  * `io`:  Socket.IO 服务器实例。
  * `namespace`:  命名空间 (字符串)。
  * `chatModule`: `ChatModule` 实例。
* **工作流程:**
    1. **初始化:**
        * `streamBuffers`:  一个对象，用于存储每个流的数据块 (`{ [streamId]: { [chunkIndex]: chunkData } }`)。
        * `outputBuffers`:  一个对象，用于存储每个输出的数据 (`{ [outputId]: string }`)。
        * `requestStatus`: 一个对象, 存储请求ID和状态。
        * `clientStreams`：一个对象，用来储存每个`streamId`对应的流。
    2. **监听连接:**  监听指定命名空间的 `'connection'` 事件。
    3. **事件处理:**  对于每个连接的客户端 (`socket`)，监听以下事件：
        * **`STREAM_START`:**
            * 如果 `data.type` 是 `MSG_TYPE.STREAM_START`：
                * 记录流开始信息。
                * 初始化 `streamBuffers[data.streamId]` 和 `outputBuffers[data.outputId]`。
                * 如果提供了 `requestId`：
                    * 将 `requestStatus[requestId]` 设置为 `'started'`。
                    * 更新 `chatModule.llmRequests` (存储请求信息)。
                * 调用 `forwardStreamData` 函数创建并存储客户端流 (`clientStreams[data.streamId]`)。
        * **`STREAM_DATA_FIRST`、`STREAM_DATA_MIDDLE`、`STREAM_DATA_LAST`、`STREAM_DATA_RETRY`、`STREAM_DATA_FAILED`:**
            * 调用 `handleStreamData` 函数处理数据块。
        * **`STREAM_END`:**
            * 如果 `data.type` 是 `MSG_TYPE.STREAM_END`：
                * 记录流结束信息。
                * 如果 `streamBuffers[data.streamId]` 存在：
                    * 将数据块按 `chunkIndex` 排序。
                    * 将排序后的数据块拼接成完整的消息。
                    * 删除 `streamBuffers[data.streamId]`。
                    * **调用 `chatModule.handleLlmResponse(roomName, responseData)` 将完整的流式响应数据存储到 `ChatModule` 的消息队列中。** `responseData` 包含 `requestId` 和完整的消息内容。
                * 如果提供了 `requestId` 且 `requestStatus[data.requestId]` 存在：
                    * 将 `requestStatus[data.requestId]` 设置为 `'completed'`。
                    * 删除 `llmRequests[data.requestId]` (可选, 取决于是否需要在接收到完整响应后立即删除)。
                * 如果存在对应的客户端流 (`clientStreams[data.streamId]`)，则将其关闭。
        * **`disconnect`:**  记录客户端断开连接的信息。
        * **`connect_error`、`reconnect_attempt`、`reconnect`、`reconnect_failed`:**  记录连接相关的事件。

#### 2.2.2. `handleStreamData(socket, data, chatModule, clientStreams)`

* **功能:**  处理接收到的流式数据块。
* **参数:**
  * `socket`:  Socket.IO 的 socket 对象。
  * `data`:  数据对象。
  * `chatModule`: `ChatModule` 实例。
  * `clientStreams`: 存储客户端流的对象。
* **工作流程:**
    1. 记录收到的数据块信息。
    2. 如果 `streamBuffers[data.streamId]` 不存在，则记录警告并返回。
    3. 将数据块存储到 `streamBuffers[data.streamId][data.chunkIndex]`。
    4. 将数据添加到 `outputBuffers[data.outputId]`。
    5. 如果提供了 `requestId` 且 `requestStatus[data.requestId]` 存在，则将 `requestStatus[data.requestId]` 设置为 `'processing'`。
    6. 立即将数据块写入客户端流 (如果 `clientStreams[data.streamId]` 存在)。

#### 2.2.3. `forwardStreamData(io, namespace, chatModule, originalData)`

* **功能:**  创建并返回一个流，将从 SillyTavern 接收到的流式数据转发给发起请求的客户端。
* **参数:**
  * `io`:  Socket.IO 服务器实例。
  * `namespace`:  命名空间 (字符串)。
  * `chatModule`: `ChatModule` 实例。
    * `originalData`:  原始的 `STREAM_START` 事件的数据。
* **返回值:** 一个流对象, 用于写入从 SillyTavern 接收到的数据。
* **工作流程:**
    1. 创建一个新的流 (`ss.createStream()`)。
    2. 根据 `originalData.requestId` 从 `chatModule.llmRequests` 中查找原始请求信息。
    3. 如果找到原始请求：
            *  向 `originalRequest.room` 房间发送 `streamed_data` 事件，并传递流和相关数据 (使用 `originalData` 中的 `streamId`、`outputId` 和 `requestId`)。
    4. 如果未找到原始请求，则记录警告。
    5. 返回创建的流。

## 3. 总结

SillyTavern-NewAge 服务器支持非流式和流式两种数据传输方式。 非流式传输用于一次性发送完整的数据，而流式传输用于将数据分割成多个块并按顺序发送。 服务器主要负责接收 SillyTavern 扩展端发送的数据，并将其转发给发起请求的客户端。 `lib/stream.js` 和 `lib/non_stream.js` 模块提供了服务器端处理这两种传输方式的函数。 **`ChatModule` 在消息传输过程中起着关键作用，负责查找原始 LLM 请求，并将 LLM 响应 (无论是流式还是非流式) 存储到内存中的消息队列。**
