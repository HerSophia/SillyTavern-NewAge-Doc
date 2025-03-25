---
title: 快速开始(客户端)
---

# 快速开始 (客户端 API)

本指南将引导您快速创建一个可以与 SillyTavern-NewAge 服务器交互的客户端（例如，独立的 Web 应用、桌面应用、移动应用）。

> [!IMPORTANT]
> 本指南假设您的客户端运行在**内部服务器**上（即与 SillyTavern-NewAge 服务器在同一台机器或局域网内）。理论上运行在外部网络上的客户端也可以连接到服务器，但**请一定要确保您的网络环境是安全的，尤其务必设置好防火墙**

## 1. 概述

SillyTavern-NewAge 服务器是一个基于 Node.js 和 Socket.IO 的实时通信服务器。它通过不同的**命名空间 (namespaces)** 来组织功能，客户端需要连接到相应的命名空间才能使用特定功能。

## 2. 客户端设置

在开始编写客户端代码之前，您需要在服务器上为您的客户端创建一个设置文件。

* **位置:** `server/settings` 文件夹
* **文件名:** 应与您的客户端 ID (`clientId`) 相同 (例如 `my-client.json`)。
* **内容:**

    ```json
    {
      "clientId": "my-client",
      "isTrust": true
    }
    ```

  * `clientId`: 客户端的唯一标识符 (自定义，但要确保唯一性)。
  * `isTrust`: **必须设置为 `true`**，否则服务器将拒绝连接。

> [!IMPORTANT]
> 您可以通过手动创建此文件，或在您的客户端代码中调用 `/server/dist/function_call.js` 文件中的 `saveJsonToFile` 函数来自动创建。

## 3. 客户端生命周期

### 3.1 连接到默认命名空间 (/)

当客户端连接到服务器的默认命名空间 (`/`) 时，服务器会自动执行以下操作：

1. **创建/加入房间：** 服务器会创建一个以客户端 ID (`clientId`) 命名的房间（客户端房间），并将客户端添加到该房间。
    * 如果客户端是 `monitor` 类型，还会额外加入 `monitor-room` 房间。
2. **添加成员：** 服务器会将客户端添加到内部的成员列表中，记录客户端的类型和其他信息。
    * 如果客户端是`SillyTavern` 类型，则会额外添加到已连接扩展端列表中。
    * 如果客户端既不是`monitor`类型也不是`SillyTavern`类型，则会额外添加到已连接客户端房间列表中。
3. **广播更新：** 服务器会向 `/clients` 命名空间广播一个 `update_connected_clients` 事件，通知管理前端客户端列表已更新。

当客户端断开连接时，服务器会自动清理相关信息，包括从成员列表和房间中移除客户端，并广播 `update_connected_clients` 事件。

### 3.2 客户端认证 (/auth)

客户端通常需要连接到 `/auth` 命名空间进行身份验证。

1. **连接：** 客户端连接到 `/auth`，并在 `auth` 对象中提供 `clientId`、`clientType`、`identity` 和 `key`。
2. **验证：** 服务器验证客户端的身份。
3. **结果：**
    * **成功：** 服务器广播客户端列表更新，并为客户端设置事件监听器。
    * **失败：** 服务器发送错误消息，清理客户端信息，并断开连接。

在 `/auth` 命名空间中，客户端可以：

* 获取客户端密钥 (`GET_CLIENT_KEY`)。
* 获取已连接的 SillyTavern 扩展列表 (`GET_SILLYTAVERN_EXTENSION`)。

> [!IMPORTANT]
> 为什么需要 `identity` ？因为我们考虑到一种可能性：**服务器上同一个客户端启动了不同的客户端实例。**
> 
> 具体原因：每个独立的浏览器标签页/窗口（或独立的客户端应用程序实例）都会被视为一个**独立的客户端实例。**
> 
> 这是Socket.IO 的工作方式所决定的，而又考虑到clientId是直接决定了一个客户端是否可信，clientId不能随机化（特别地当前我们还不想改变这样的机制），使用 `identity` 即可保证不同客户端实例的正常工作。

### 3.3 获取和监听可用扩展分配

客户端需要知道哪些 SillyTavern 扩展端可供其使用。

* **主动获取 (`GET_ASSIGNMENTS_FOR_ROOM`):**
  * 客户端可以发送 `GET_ASSIGNMENTS_FOR_ROOM` 请求到 `/rooms` 命名空间，获取当前分配给它的扩展列表。
* **被动监听 (`AVAILABLE_EXTENSIONS`):**
  * 客户端可以监听 `/rooms` 命名空间中的 `AVAILABLE_EXTENSIONS` 事件。
  * 当扩展分配发生变化时（例如，连接策略更改、手动分配、扩展连接/断开），服务器会触发此事件，并在事件数据中提供更新后的扩展列表。

### 3.4 监听角色变更

客户端应该监听 `MEMBER_ROLE_CHANGED` 事件，以便在角色发生变化时更新 UI 或执行其他操作。

> [!IMPORTANT]
> 这一步在单人游玩的情况中可以不需要，因为在这时客户端的 `role` 都固定是 `master` ，无论是什么对话模式都不会受到影响；而如果是多人游戏的情况下，则这一步为必要。

* **`MEMBER_ROLE_CHANGED` 事件：**
  * 当客户端的角色在服务器端被更改时触发。
  * 事件数据包含 `clientId`、`roomName` 和新的 `role`。

### 3.5 LLM 交互和消息同步

* **发送 LLM 请求:**
  * 客户端连接到 `/llm` 命名空间。
  * 构造请求数据 (包括 `target`, `requestId`, `message` 等)。
  * 通过 `llmSocket.emit(MSG_TYPE.LLM_REQUEST, ...)` 发送请求。
* **监听 LLM 响应:**
  * **流式响应:** 监听 `streamed_data` 和 `streamed_end` 事件.
  * **非流式响应:** 监听 `message` 事件.
* **监听其他客户端的消息:**
  * 客户端监听 `UPDATE_CONTEXT` 事件来监听上下文更新

### 3.6 函数调用 (可选)

客户端可以通过 `/function_call` 命名空间调用服务器端预先注册的函数。

1. **连接：** 客户端连接到 `/function_call` 命名空间。
2. **发送请求：** 客户端发送 `FUNCTION_CALL` 请求，提供 `requestId`、`functionName`、`args` 和 `target`。
3. **接收结果：** 客户端在回调函数中接收函数调用的结果。

## 4. 连接到服务器 (JavaScript 示例)

以下是一个使用 JavaScript 和 Socket.IO 客户端库连接到服务器的示例：

```javascript
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
// 请确保你已经安装了 socket.io-client:  npm install socket.io-client
// 如果使用CDN，请参考：https://socket.io/zh-CN/docs/v4/cdn/

const serverAddress = 'http://localhost';
const serverPort = 4000;
const clientId = 'my-client'; // 与 settings.json 中的 clientId 相同
const clientType = 'web-app'; // 自定义客户端类型
const clientKey = 'your-secret-key'; // 从SillyTavern扩展处复制
const identity = `${clientId}` + uuidv4(); // 我们使用identity来识别同一种客户端但不同的客户端实例。强烈建议添加一个更具有可读性的后缀，例如让用户自行输入，而不是uuidv4。

// 认证信息
const authData = {
  clientType: clientType,
  clientId: clientId,
  key: clientKey, // 最好从服务器安全地获取，而不是硬编码
  identity: identity,
};

// 连接到默认命名空间
const socket = io(`${serverAddress}:${serverPort}`, {
  auth: authData,
});

socket.on('connect', () => {
  console.log('Connected to server!');

  // 示例：向服务器提出请求以自动获取密钥，但前提是网络环境为相对安全
  /*
  const authData = = {
    clientType: clientType,
    clientId: clientId,
    identity: identity,
    key: 'getKey',
    desc: '服务器监控网页',
    clienthtml: clientHTML;
  } 
  const authSocket = newSocket(NAMESPACES.AUTH, authData, true, true);

  authSocket.on(MSG_TYPE.GET_CLIENT_KEY , (data) =>){
    const key = data.Key;
    authData.key = key;
  }
  */

  // 连接成功后，可以连接到其他命名空间
    connectToLLMNamespace();
    // 连接到 /rooms 命名空间以获取和监听分配
    connectToRoomsNamespace();
    // 连接到 /function_call 命名空间 (可选)
    connectToFunctionCallNamespace();
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server. Reason:', reason);
});

// 连接到 /llm 命名空间
function connectToLLMNamespace() {
  const llmSocket = io(`${serverAddress}:${serverPort}/llm`, {
    auth: authData,
  });

  llmSocket.on('connect', () => {
    console.log('Connected to /llm namespace!');
    // 现在可以发送 LLM 请求了
    sendLLMRequest('Hello, world!');
  });
  // 监听流式响应 (示例)
  llmSocket.on('streamed_data', (data) => {
    console.log('Received streamed data:', data);
    // 处理流式数据...
  });

  llmSocket.on('streamed_end', () => {
    console.log('Stream ended');
    // 流式传输结束...
  });
  // 监听非流式响应
  llmSocket.on('message', (data) => {
    if (data.type === MSG_TYPE.NON_STREAM) {
      console.log('Received non-stream message:', data.data);
    }
  });
  // 监听上下文更新 
  llmSocket.on(MSG_TYPE.UPDATE_CONTEXT, (data) => {
    console.log('Received updated context:', data.context);
    // 在这里更新你的聊天记录显示 (直接用 data.context 替换)
    // 例如：
    //   displayChatContext(data.context);
  });
  llmSocket.on('connect_error', (error) => {
    console.error('LLM connection error:', error);
  });
}

// 发送 LLM 请求 (示例)
function sendLLMRequest(message) {
  const llmSocket = io(`${serverAddress}:${serverPort}/llm`, {
    auth: authData,
  });
  const requestId = generateUniqueId(); // 您需要自己实现 generateUniqueId() 函数
  const llmRequestData = {
    target: 'targetSillyTavernClientId', // 目标 SillyTavern 扩展的 clientId，可以是一个数组
    requestId: requestId,
    role: 'master',// 默认为master，可替换为实际的角色
    message: message,
  };
  llmSocket.emit(MSG_TYPE.LLM_REQUEST, llmRequestData, (response) => {
    if (response.status === 'ok') {
      console.log('LLM request sent successfully.');
    } else {
      console.error('LLM request failed:', response.message);
    }
  });
}
import { v4 as uuidv4 } from 'uuid';
// 请确保你已经安装了 uuid:  npm install uuid
// 生成唯一 ID 的函数 (示例)
function generateUniqueId() {
 // 使用uuid库
  return uuidv4();
}
// 连接到 /rooms 命名空间
function connectToRoomsNamespace() {
  const roomsSocket = io(`${serverAddress}:${serverPort}/rooms`, { // 使用 /rooms
    auth: authData,
  });

  roomsSocket.on('connect', () => {
    console.log('Connected to /rooms namespace!');

    // 1. 主动获取当前分配
    roomsSocket.emit(MSG_TYPE.GET_ASSIGNMENTS_FOR_ROOM, { roomName: clientId }, (response) => {
      if (response.status === 'ok') {
        console.log('My assigned extensions:', response.assignments);
          // 在这里保存/更新你的扩展列表
      } else {
        console.error('Failed to get assigned extensions:', response.message);
      }
    });
  });

  // 2. 监听分配更新
  roomsSocket.on(MSG_TYPE.AVAILABLE_EXTENSIONS, (data) => {
    console.log('Available extensions updated:', data.extensions);
      // 在这里更新你的扩展列表
  });
  // 3. 监听角色变更
  roomsSocket.on(MSG_TYPE.MEMBER_ROLE_CHANGED, (data) => {
    console.log(`My role in room ${data.roomName} changed to ${data.role}`);
      // 更新 UI ，更新全局的role属性，或执行其他操作
  });

  roomsSocket.on('connect_error', (error) => {
    console.error('Rooms connection error:', error);
  });
}

// 连接到 /function_call 命名空间 (可选)
function connectToFunctionCallNamespace() {
  const functionCallSocket = io(`${serverAddress}:${serverPort}/function_call`, {
    auth: authData,
  });

  functionCallSocket.on('connect', () => {
    console.log('Connected to /function_call namespace!');

    // 示例：调用 addStaticResources 函数
    const initialResources = {
      '/my-client/index.html': './exampleClient/your_client_name/index.html',
      '/my-client/script.js': './exampleClient/your_client_name/script.js',
      '/my-client/style.css': './exampleClient/your_client_name/style.css',
      // 添加更多资源...
    };

    const requestId = generateUniqueId();

    functionCallSocket.emit(MSG_TYPE.FUNCTION_CALL, {
      requestId: requestId,
      functionName: 'addStaticResources',
      args: initialResources,
      target: 'server'
      }, (response) => {
        if (response.success) {
          console.log('addStaticResources call successful:', response.result);
        } else {
          console.error('addStaticResources call failed:', response.error);
        }
      }
    );
  });

  functionCallSocket.on('connect_error', (error) => {
    console.error('Function call connection error:', error);
  });
}
```

**代码解释:**

* **导入:** 导入 `socket.io-client` 库。
* **常量:** 定义服务器地址、端口、客户端 ID、客户端类型、客户端key和认证信息。
* **`io()`:** 创建 Socket.IO 连接实例。
  * 第一个参数是服务器地址和端口。
  * 第二个参数是选项对象，包含 `auth` 属性 (认证数据)。
* **事件监听:**
  * `connect`: 连接成功时触发。
  * `connect_error`: 连接错误时触发。
  * `disconnect`: 断开连接时触发。
* **`connectToLLMNamespace`函数**：连接到`/llm`命名空间
* **`sendLLMRequest`函数`：发送LLM请求
* **`generateUniqueId`函数**：生成唯一的请求ID
* **`connectToRoomsNamespace` 函数：**
  * 连接到 `/rooms` 命名空间。
  * 在 `connect` 事件处理程序中：
    * **主动获取：** 发送 `GET_ASSIGNMENTS_FOR_ROOM` 请求。
    * **被动监听：** 监听 `AVAILABLE_EXTENSIONS` 事件。
    * **监听角色变更：** 监听 `MEMBER_ROLE_CHANGED` 事件。
* **`connectToFunctionCallNamespace` 函数:**
  * 连接到`/function_call`命名空间
  * 在`connect`事件处理程序中：
    * 调用了`addStaticResources`作为示例
* **导入**：展示了如何通过`import`导入并使用第三方依赖

**关键步骤:**

1. **安装依赖:** 确保您已安装了 `socket.io-client` 库 (以及其他需要的库，如上面例子中的 `uuid`)。
2. **连接:** 使用 `io()` 函数连接到服务器。
3. **认证:** 在连接选项中提供 `auth` 数据。
4. **监听事件:** 监听 `connect`、`connect_error` 和 `disconnect` 事件。
5. **连接到命名空间:** 连接到所需的命名空间 (例如 `/llm`)。
6. **发送请求:** 使用 `socket.emit()` 发送请求。
7. **接收响应:** 监听服务器发送的事件 (例如 `streamed_data`、`message` 或自定义事件)。

## 5. 向服务器申请加载静态资源

客户端可以通过向服务器发送函数调用请求来加载静态资源。这允许客户端按需加载所需的资源，例如 HTML、JavaScript、CSS 文件或图像等。

> [!NOTE]
如果您的客户端在 `server/client` 或者 `server/exampleClient` 文件夹下，那么客户端无需主动申请加载这些已经存在的静态资源。但如果需要保存网络资源并加载，则可以保存后再申请加载这些新的静态资源。

**请求方法:**

1. **使用 `/function_call` 命名空间。**
2. **调用 `addStaticResources` 函数。**
3. **传递 `initialResources` 参数:**
    * `initialResources` 是一个对象。
    * 对象的**键**是您希望客户端访问资源的 URL 路径 (例如 `/my-client/script.js`)。
    * 对象的**值**是该资源相对于 `server.js` 文件的相对路径 (例如 `./client/my-client/script.js`)。

**示例代码 (在已连接的 Socket.IO 连接上):**

```javascript
// 假设您已经有了一个名为 functionCallSocket 的 /function_call` 命名空间的连接

// 定义您要加载的资源
const initialResources = {
  '/my-client/index.html': './exampleClient/your_client_name/index.html',
  '/my-client/script.js': './exampleClient/your_client_name/script.js',
  '/my-client/style.css': './exampleClient/your_client_name/style.css',
  // 添加更多资源...
};

// 生成一个唯一的请求 ID
const requestId = generateUniqueId();

// 发送函数调用请求
functionCallSocket.emit(MSG_TYPE.FUNCTION_CALL, {
  requestId: requestId,
  functionName: 'addStaticResources',
  args: initialResources,
  target: 'server' // 目标是服务器
}, (response) => {
  if (response.success) {
    console.log('静态资源加载成功:', response.result);
    // 现在可以通过 URL 访问这些资源了，例如：
    // http://localhost:4000/my-client/index.html
  } else {
    console.error('静态资源加载失败:', response.error);
  }
});
```

**重要说明:**

* 确保 `initialResources` 对象中的路径正确。
* 服务器会将 URL 路径映射到相应的文件系统路径。服务器在启动时就已经把部分资源自动加载好了(包括 `/client` 和 `/exampleClient`)，请注意尽量不要重复加载。
* 成功加载后，您可以通过浏览器或其他客户端代码访问这些资源。
* 您可以在需要时多次调用 `addStaticResources` 来加载不同的资源。
* 您也可以参考`server.js`文件中的`initializeStaticResources()`函数来了解服务器加载静态资源的详细机制。

## 6. 命名空间

以下是 SillyTavern-NewAge 服务器提供的一些常用命名空间：

* `/` (默认命名空间): 主要用于 `monitor` 客户端。
* `/auth`: 用于客户端认证。
* `/llm`: 用于与 LLM 交互。
* `/function_call`: 用于函数调用。
* `/clients`: 用于客户端管理 (通常由服务器或管理员使用)。
* `/rooms`: 用于房间管理 (通常由服务器使用)。
* `/sillytavern`：主要用于服务器和 SillyTavern 扩展之间的通讯

## 7.错误处理

客户端应该监听 `MSG_TYPE.ERROR` 事件来处理服务器发送的错误消息：

```javascript
socket.on(MSG_TYPE.ERROR, (error) => {
  console.error('Server error:', error.message);
  // 根据错误类型和 requestId 进行处理
});
```

## 注意事项

* **请求 ID:** 对于每个 LLM 请求，都应该生成一个唯一的 `requestId`，以便将响应与请求正确地关联起来。
* **响应 ID:**  对于每个 LLM 响应，服务器会生成一个唯一的`responseId`。
* **流式 vs. 非流式:** 根据您的需求选择合适的响应方式。流式响应可以提供更好的用户体验（逐步显示文本），但处理起来更复杂。
* **`@sap_oss/node-socketio-stream`:** 如果您使用流式响应，您需要安装 `@sap_oss/node-socketio-stream` 库。
* **目标 SillyTavern:** 在发送 LLM 请求或函数调用时，需要指定目标 SillyTavern 的 `clientId` (除非你调用的是服务器端函数)。
* **消息类型和常量:** 请参考`lib/constants.js`的内容。
* **重要逻辑:** 在接受 LLM 响应时，客户端应当不允许发送/编辑/删除任何消息，否则容易出现消息记录混乱的问题。如果确实需要这样的操作，那么可以在接受完LLM响应后再发送对应的消息事件，即延迟发送。
