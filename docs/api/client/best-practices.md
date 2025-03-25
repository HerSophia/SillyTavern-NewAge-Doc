---
title: 最佳实践 (客户端)
---

# 最佳实践 (Best Practices)

本指南将提供一些开发 SillyTavern-NewAge 客户端的最佳实践，并提供详细的代码示例和解释。我们将结合“快速开始”文档中的客户端生命周期，逐步构建一个模块化、健壮且安全的客户端。

## 1. 概述

SillyTavern-NewAge 客户端通常是一个 Web 应用程序（但也可以是桌面应用、移动应用等），它通过 Socket.IO 与 SillyTavern-NewAge 服务器进行实时通信。客户端可以：

* 连接到服务器并进行身份验证。
* 获取和监听可用的 SillyTavern 扩展列表。
* 向 SillyTavern 扩展发送 LLM 请求。
* 接收 LLM 的流式或非流式响应。
* 监听其他客户端发送的消息。
* 调用服务器端函数。
* 监听`role`的变更。
* 向服务器申请加载静态资源

## 2. 模块化

将您的客户端代码组织成模块，以便更好地管理和维护。以下是一种推荐的目录结构：

```
client/
├── index.html        # 主 HTML 文件
├── app.js          # 应用入口点
├── constants.js    # 常量定义 (最好是导入 lib/constants.js)
├── utils.js        # 工具函数
├── socketManager.js # Socket.IO 连接管理
├── llmAPI.js       # LLM 交互 API
├── functionCallAPI.js # 函数调用 API
└── style.css          # 样式
```

## 3. 客户端生命周期

1. **连接到默认命名空间 (/)**
2. **客户端认证 (/auth)**
3. **获取和监听可用扩展分配**
4. **监听角色变更**
5. **LLM 交互和消息同步**
6. **函数调用 (可选)**

## 4. 最佳实践: 代码示例

以下是遵循最佳实践的客户端代码示例，包含了所有必要的 JavaScript 文件。

### 4.1. `constants.js`

```javascript
// constants.js
// 最好是直接导入服务器端的 lib/constants.js，而不是自己重新定义
export const MSG_TYPE = {
    LLM_REQUEST: 'LLM_REQUEST',
    FUNCTION_CALL: 'FUNCTION_CALL',
    ERROR: 'ERROR',
    NEW_MESSAGE: 'new_message',
    GET_ASSIGNMENTS_FOR_ROOM: 'GET_ASSIGNMENTS_FOR_ROOM',
    AVAILABLE_EXTENSIONS: 'AVAILABLE_EXTENSIONS',
    MEMBER_ROLE_CHANGED: 'member_role_changed',
    NON_STREAM: 'NON_STREAM',
    // ... 其他消息类型 ...
};

export const NAMESPACES = {
    LLM: '/llm',
    FUNCTION_CALL: '/function_call',
    ROOMS: '/rooms',
    AUTH: '/auth',
    // ... 其他命名空间 ...
};
export const STREAM_EVENTS = {
    streamed_data: 'streamed_data',
}
```

### 4.2. `utils.js`

```javascript
// utils.js
import { v4 as uuidv4 } from 'uuid';

export function generateUniqueId() {
    return uuidv4();
}
```

### 4.3. `socketManager.js`

```javascript
// socketManager.js
import { io } from 'socket.io-client';
import { MSG_TYPE, NAMESPACES, STREAM_EVENTS } from './constants';
import ss from '@sap_oss/node-socketio-stream';

const serverAddress = 'http://localhost'; // 从环境变量或配置文件中获取
const serverPort = 4000;
const clientId = 'my-client';
const clientType = 'web-app';
// const clientKey = 'your-secret-key'; // 不要硬编码！
const clientKey = process.env.CLIENT_KEY || 'fallback-key'; // 从安全的地方获取
const clinetDesc = '网页'
const clientHTML = `${serverAddress}:${serverPort}/yourAddress.html`
const identity = `${clientId}` + uuidv4(); // 我们使用identity来识别同一种客户端但不同的客户端实例。强烈建议添加一个更具有可读性的后缀，例如让用户自行输入，而不是uuidv4。

const authData = {
    clientType: clientType,
    clientId: clientId,
    identity: identity,
    key: clientKey, // 从环境变量获取
    desc: clinetDesc,
    clienthtml: clientHTML,
};

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

const sockets = {};

/**
 * 获取或创建 Socket.IO 连接
 * @param {string} namespace - 命名空间
 * @returns {Socket} - Socket.IO 连接实例
 */
export function getSocket(namespace) {
    if (!sockets[namespace]) {
        sockets[namespace] = createSocket(namespace);
    }
    return sockets[namespace];
}

/**
 * 创建并配置 Socket.IO 连接
 * @param {string} namespace - 命名空间
 * @returns {Socket} - Socket.IO 连接实例
 */
function createSocket(namespace) {
    const socket = io(`${serverAddress}:${serverPort}${namespace}`, {
        auth: authData,
        autoConnect: true, // 启用自动连接
        reconnection: true, // 启用自动重连
        reconnectionAttempts: 5, // 重连尝试次数
        reconnectionDelay: 1000, // 重连延迟 (毫秒)
    });

    // 通用错误处理
    socket.on('connect_error', (error) => {
        console.error(`Socket.IO connection error (${namespace}):`, error);
    });

    socket.on('disconnect', (reason) => {
        console.log(`Socket.IO disconnected (${namespace}). Reason:`, reason);
    });

    socket.on(MSG_TYPE.ERROR, (error) => {
        console.error(`Socket.IO error (${namespace}):`, error);
    });

    return socket;
}

/**
 * 关闭所有 Socket.IO 连接
 */
export function closeAllSockets() {
    for (const namespace in sockets) {
        sockets[namespace].disconnect();
        delete sockets[namespace];
    }
}

/**
 * 使用 socket.io-stream 接收流数据并实时更新到 HTML 元素，具有缓冲区功能。
 *
 * @param {object} socket - 已连接的 Socket.IO socket 对象。
 * @param {string} eventName - 服务器发送流数据的事件名称。
 * @param {string} elementId - HTML 元素的 ID。
 * @param {object} [options] - 可选配置对象。
 * @param {number} [options.updateInterval=200] - 更新间隔（毫秒），控制 DOM 更新频率。
 * @param {number} [options.maxBufferSize=1024 * 1024] - 缓冲区最大大小（字节），超过此大小则启用缓冲区。
 * @param {boolean} [options.debug=false] - 是否启用调试日志。
 *
 * @throws {TypeError} 如果参数类型不正确。
 * @throws {Error} 如果找不到元素或 Socket.IO 相关对象无效。
 *
 * @returns {function} 返回一个函数，调用该函数可以移除事件监听器。
 */
export function streamToElement(socket, eventName, elementId, options = {}) {
    const { updateInterval = 200, maxBufferSize = 1024 * 1024, debug = false } = options;

    // --- 输入验证 ---
    if (!socket || typeof socket !== 'object') {
        throw new TypeError('socket 参数必须是一个有效的 Socket.IO socket 对象。');
    }
    if (typeof eventName !== 'string' || eventName.trim() === '') {
        throw new TypeError('eventName 参数必须是一个非空字符串。');
    }
    if (typeof elementId !== 'string' || elementId.trim() === '') {
        throw new TypeError('elementId 参数必须是一个非空字符串。');
    }
    if (typeof updateInterval !== 'number' || updateInterval < 0) {
        throw new TypeError('updateInterval 参数必须是一个非负数。');
    }
    if (typeof maxBufferSize !== 'number' || maxBufferSize <= 0) {
        throw new TypeError('maxBufferSize 参数必须是一个正数。');
    }
    if (typeof debug !== 'boolean') {
        throw new TypeError('debug 参数必须是一个布尔值。');
    }

    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`找不到 ID 为 "${elementId}" 的元素。`);
    }

    if (!socket.on || typeof socket.on !== 'function') {
        throw new Error('传入的 socket 对象无效。 它需要一个有效的 Socket.IO socket 对象.');
    }

    if (!eventName || typeof eventName !== 'string') {
        throw new Error('传入的 eventName 无效。 它需要一个有效的 string 类型');
    }

    let accumulatedData = '';
    let lastUpdateTime = 0;
    let updateScheduled = false;
    let buffer = [];
    let buffering = false;
    let totalBufferedSize = 0;

    const dataHandler = (chunk) => { //将 stream.on('data') 的处理函数提取出来
        const chunkSize = chunk.length;
        totalBufferedSize += chunkSize;

        if (buffering || totalBufferedSize > maxBufferSize) {
            buffering = true;
            buffer.push(chunk);
            if (debug) {
                console.log(`Buffering: ${buffer.length} chunks, total size: ${totalBufferedSize}`);
            }
        } else {
            accumulatedData += chunk.toString();
        }

        const now = Date.now();

        if (now - lastUpdateTime >= updateInterval && !updateScheduled) {
            updateScheduled = true;
            scheduleUpdate();
        }
    };

    const endHandler = () => {
        if (buffering) {
            processBuffer(); //process remaining data
        }

        if ('textContent' in element) {
            element.textContent = accumulatedData;
        } else {
            element.innerHTML = accumulatedData;
        }
        console.log('流传输结束');
    };

    const errorHandler = (error) => {
        console.error('流传输错误:', error);
    };

    const stream = ss.createStream();
    const streamOn = ss(socket).on(eventName, (stream) => {//给stream.on 绑定一个变量
        stream.on('data', dataHandler);
        stream.on('end', endHandler);
        stream.on('error', errorHandler);
    });

    function scheduleUpdate() {
        requestAnimationFrame(() => {

            if (buffering) {
                processBuffer();
            }

            // 优先使用 textContent，其次使用 innerHTML
            if ('textContent' in element) {
                element.textContent = accumulatedData;
            } else {
                element.innerHTML = accumulatedData;
            }

            if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                element.scrollTop = element.scrollHeight;
            }

            updateScheduled = false;
            lastUpdateTime = Date.now();
        });
    }

    function processBuffer() {
        while (buffer.length > 0) {
            const chunk = buffer.shift();
            accumulatedData += chunk.toString();
            totalBufferedSize -= chunk.length;
        }
        buffering = false;
    }

    // 返回一个清理函数
    return () => {
        if (streamOn && stream) { //streamOn 是一个Listener, 需要通过ss(socket).removeListener去清除
            ss(socket).removeListener(eventName, streamOn);
            stream.removeListener('data', dataHandler);//stream 是一个node emitter, 可以直接removeListener
            stream.removeListener('end', endHandler);
            stream.removeListener('error', errorHandler);
        }
    };
}
```

### 4.4. `llmAPI.js`

```javascript
// llmAPI.js
import { getSocket } from './socketManager';
import { MSG_TYPE, NAMESPACES, STREAM_EVENTS } from './constants';
import { generateUniqueId } from './utils';
import * as ss from '@sap_oss/node-socketio-stream'

/**
 * 发送 LLM 请求
 * @param {string} message - 消息文本
 * @param {string | string[]} targetClientIds - 目标 SillyTavern 扩展的 clientId (或 clientId 数组)
 * @param {string}  role - 客户端的role
 * @param {Function} [callback] - 可选的回调函数，用于处理同步响应
 */
export function sendLLMRequest(message, targetClientIds, role, callback) {
  const socket = getSocket(NAMESPACES.LLM);
  const requestId = generateUniqueId();
  const target = Array.isArray(targetClientIds) ? targetClientIds : [targetClientIds]; // 确保 target 是数组

  socket.emit(
    MSG_TYPE.LLM_REQUEST,
    {
      target: target,
      requestId: requestId,
      message: message,
      role: role,
      // ... 其他 LLM 参数 ...
      },
      (response) => {
        if (callback) {
          callback(response);
        }
      }
  );
}

/**
 * 监听流式数据
 * @param {HTMLElement} element - 用于显示流式数据的 HTML 元素。
 * @param {object} options - 传入streamToElement的参数
 * @returns {function} 返回一个函数，调用该函数可以移除事件监听器。
 */
export function setupLLMStream(element, options) {
    const socket = getSocket(NAMESPACES.LLM);
    const removeListener = streamToElement(socket, STREAM_EVENTS.streamed_data, element, options);
    return removeListener;
}
```

### 4.5. `functionCallAPI.js`

```javascript
// functionCallAPI.js
import { getSocket } from './socketManager';
import { MSG_TYPE, NAMESPACES } from './constants';
import { generateUniqueId } from './utils';

/**
 * 调用服务器端函数
 * @param {string} functionName - 要调用的函数名
 * @param {any[]} args - 传递给函数的参数
 * @param {string} target - 调用的目标 ('server' 或客户端 ID)
 * @param {Function} [callback] - 可选的回调函数，用于接收函数调用的结果
 */
export function callFunction(functionName, args, target, callback) {
    const socket = getSocket(NAMESPACES.FUNCTION_CALL);
    const requestId = generateUniqueId();

    socket.emit(
        MSG_TYPE.FUNCTION_CALL,
        {
            requestId: requestId,
            functionName: functionName,
            args: args,
            target: target,
        },
        (response) => {
            if (callback) {
                callback(response);
            }
        }
    );
}
```

### 4.6. `app.js`

```javascript
// app.js
import { getSocket, closeAllSockets } from './socketManager';
import { MSG_TYPE, NAMESPACES } from './constants';
import { sendLLMRequest, setupLLMStream } from './llmAPI';
import { callFunction } from './functionCallAPI';
import { generateUniqueId } from './utils';

// 获取 DOM 元素
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const llmResponseOutput = document.getElementById('llmResponseOutput'); // 假设你有一个用于显示 LLM 响应的元素

// 连接到默认命名空间 (可选，但建议连接，因为它会自动创建房间和添加成员)
const defaultSocket = getSocket('/');

defaultSocket.on('connect', () => {
  console.log('Connected to default namespace!');
});

defaultSocket.on('connect_error', (error) => {
  console.error('Default namespace connection error:', error);
});

defaultSocket.on('disconnect', (reason) => {
  console.log('Disconnected from default namespace. Reason:', reason);
});

// 连接到 /rooms 命名空间
function connectToRoomsNamespace() {
  const roomsSocket = getSocket(NAMESPACES.ROOMS);

  roomsSocket.on('connect', () => {
    console.log('Connected to /rooms namespace!');

    // 1. 主动获取当前分配
    roomsSocket.emit(
      MSG_TYPE.GET_ASSIGNMENTS_FOR_ROOM,
      { roomName: clientId }, // 通常，房间名就是客户端 ID
      (response) => {
        if (response.status === 'ok') {
          console.log('My assigned extensions:', response.assignments);
          // 在这里保存/更新你的扩展列表 (例如，保存到 localStorage 或全局变量)
        } else {
          console.error('Failed to get assigned extensions:', response.message);
        }
      }
    );

    // 2. 监听分配更新
    roomsSocket.on(MSG_TYPE.AVAILABLE_EXTENSIONS, (data) => {
      console.log('Available extensions updated:', data.extensions);
      // 在这里更新你的扩展列表
    });
    // 3. 监听角色变更
    roomsSocket.on(MSG_TYPE.MEMBER_ROLE_CHANGED, (data) => {
      console.log(`My role in room ${data.roomName} changed to ${data.role}`);
      // 更新 UI 或执行其他操作 (例如，启用/禁用某些功能)
      // 你也可以在这里更新你的 role 变量 (例如，localStorage)
    });
  });

  roomsSocket.on('connect_error', (error) => {
    onsole.error('Rooms namespace connection error:', error);
  });
}

connectToRoomsNamespace(); // 调用函数以连接到 /rooms

// 连接到 /llm 命名空间, 并设置流式监听
const llmSocket = getSocket(NAMESPACES.LLM);
const removeStreamListener = setupLLMStream(llmResponseOutput, {
  updateInterval: 200, // 200ms 更新间隔
  maxBufferSize: 1024 * 1024, // 1MB 缓冲区
});

llmSocket.on('connect', () => {
  console.log('Connected to /llm namespace!');
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

// 发送 LLM 请求
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    // 假设你已经从 UI 或其他地方获取了 targetClientId 和 role
    const targetClientId = 'your-sillytavern-client-id'; // 替换为实际的 SillyTavern clientId
    const role = 'guest'; // 或 'user'、'manager'、'master'，取决于客户端类型和权限
    sendLLMRequest(message, targetClientId, role, (response) => {
      if (response.status === 'ok') {
        console.log('LLM request sent successfully.');
      } else {
        console.log('LLM request failed')
      }
    });
      messageInput.value = ''; // 清空输入框
  }
});

// 连接到 /function_call 命名空间 (可选)
function connectToFunctionCallNamespace() {
  const functionCallSocket = getSocket(NAMESPACES.FUNCTION_CALL);

  functionCallSocket.on('connect', () => {
    console.log('Connected to /function_call namespace!');

    // 你可以在这里调用服务器端函数

    // 示例：调用 addStaticResources 函数
    // 假设你有一个名为 addStaticResources 的服务器端函数
    // 键：URL，值：文件相对于 server.js 的文件系统路径
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
          console.log('Function call result:', response.result);
          // 现在可以通过 URL 访问这些资源了，例如：
          // http://localhost:4000/my-client/index.html
          } else {
            console.error('Function call error:', response.error);
          }
      });
  });

  functionCallSocket.on('connect_error', (error) => {
    console.error('Function call connection error:', error);
  });
}

connectToFunctionCallNamespace();

// 在页面关闭前, 或不需要连接时，关闭所有 Socket.IO 连接, 并清除流式监听
window.addEventListener('beforeunload', () => {
  removeStreamListener(); // 清除流式监听
  closeAllSockets();
});

// 错误处理 (监听全局错误)
window.addEventListener('error', (event) => {
  console.error('Unhandled error:', event.error);
});
```

**HTML (`index.html`) 示例:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>SillyTavern-NewAge Client</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>SillyTavern-NewAge Client</h1>

  <div id="chat">
    <div id="llmResponseOutput"></div>
    <input type="text" id="messageInput" placeholder="Type your message...">
    <button id="sendButton">Send</button>
  </div>

  <script type="module" src="app.js"></script>
</body>
</html>
```

**解释:**

* **HTML (`index.html`):**
  * 包含一个简单的聊天界面，包括一个用于显示 LLM 响应的 `div` (`llmResponseOutput`)、一个输入框 (`messageInput`) 和一个发送按钮 (`sendButton`)。
  * 使用 `<script type="module" src="app.js"></script>` 导入 `app.js` 作为 ES 模块。
* **`app.js`:**
  * 导入了各个模块。
  * 获取了 DOM 元素。
  * 连接到默认命名空间、`/rooms`命名空间、`/llm`命名空间和`/function_call`命名空间。
  * 设置了 LLM 流式响应的监听器 (`setupLLMStream`)。
  * 实现了发送 LLM 请求的逻辑 (点击发送按钮时)。
  * 实现了通过`/function_call`来请求服务器加载静态资源。
  * 监听了`NEW_MESSAGE`事件。
  * 在页面关闭前关闭所有 Socket.IO 连接，并清除流式监听。
  * 添加了全局错误处理。

**流程图:**

以下流程图展示了客户端的典型工作流程：

<ClientWorkflow />

**总结:**

通过以上代码示例和解释，你应该对如何构建一个遵循最佳实践的 SillyTavern-NewAge 客户端有了更深入的了解。请根据你的具体需求调整代码和配置。
