---
title: 最佳实践 (客户端)
---

# 最佳实践 (Best Practices)

本指南将提供一些开发 SillyTavern-NewAge 客户端的最佳实践，并提供详细的代码示例和解释。

## 1. 模块化

将您的客户端代码组织成模块，以便更好地管理和维护。

* **连接管理:**  创建一个单独的模块 (例如 `socketManager.js`) 来处理 Socket.IO 连接的创建、管理和事件监听。
* **API 封装:**  为不同的 API 功能 (LLM 交互、函数调用等) 创建单独的模块或函数。
* **UI 更新:**  将 UI 更新逻辑与网络通信逻辑分离。
* **常量:**  将常量 (例如消息类型、事件名称、命名空间) 提取到一个单独的文件 (例如 `constants.js`) 中。
* **工具函数:** 将通用的工具函数 (例如生成唯一 ID) 提取到一个单独的文件 (例如 `utils.js`) 中。

## 2. 错误处理

* **监听错误事件:**  始终监听 `connect_error`、`disconnect` 和 `MSG_TYPE.ERROR` 事件，并进行适当的错误处理。
* **检查响应状态:**  对于支持回调函数的请求 (例如 `MSG_TYPE.FUNCTION_CALL`)，检查响应的 `success` 字段，并处理错误情况。
* **超时:**  为请求设置超时时间，避免无限期等待。
* **重试机制:**  对于可能因网络问题而失败的请求，实现重试机制 (例如，使用指数退避算法)。

## 3. 连接管理

* **自动重连:**  启用 Socket.IO 的自动重连功能，并配置适当的重试次数和延迟。
* **延迟重连:** 如果是客户端在短时间内断开所有连接，则最好等待一段时间再重连
* **连接复用:**  尽量复用 Socket.IO 连接，避免频繁地创建和销毁连接。
* **命名空间:**  根据功能使用不同的命名空间。
* **心跳:**  可以利用 Socket.IO 内置的心跳机制 (ping/pong) 来检测连接是否仍然有效。

## 4. 性能

* **批量处理:**  如果可能，将多个请求合并成一个批处理请求，以减少网络开销。
* **流式处理:**  对于大量数据，使用流式传输 (例如，使用 `@sap_oss/node-socketio-stream` 库)。
* **数据压缩:**  如果数据量较大，可以考虑对数据进行压缩 (例如，使用 GZIP)。
* **避免不必要的请求:**  缓存数据，避免重复请求相同的数据。
* **UI 节流/防抖:**  对于频繁触发的 UI 更新 (例如，处理流式 LLM 响应)，使用节流 (throttling) 或防抖 (debouncing) 技术来减少不必要的 DOM 操作。

## 5. 安全性

* **密钥管理:**  不要将客户端密钥 (`key`) 硬编码在客户端代码中。考虑使用环境变量、配置文件或安全存储机制。
* **HTTPS:**  如果可能，使用 HTTPS (wss://) 进行安全通信。
* **输入验证:**  对用户输入进行验证和清理，防止注入攻击。
* **最小权限原则:**  客户端只连接到它需要的命名空间，并且只请求它需要的权限。

## 6. 代码示例 (JavaScript)

以下是一个遵循最佳实践的客户端代码示例：

**`constants.js`:**

```javascript
// constants.js
// 最好是导入 lib/constants.js 而不是自己创建
export const MSG_TYPE = {
  LLM_REQUEST: 'LLM_REQUEST',
  FUNCTION_CALL: 'FUNCTION_CALL',
  ERROR: 'ERROR',
  // ... 其他消息类型 ...
};

export const NAMESPACES = {
  LLM: '/llm',
  FUNCTION_CALL: '/function_call',
  AUTH:'/auth',
  // ... 其他命名空间 ...
};

export const STREAM_EVENTS = {
    streamed_data:'streamed_data',
}
```

**`utils.js`:**

```javascript
// utils.js
import { v4 as uuidv4 } from 'uuid';

export function generateUniqueId() {
  return uuidv4();
}
```

**`socketManager.js`:**

```javascript
// socketManager.js
import { io } from 'socket.io-client';
import { MSG_TYPE, NAMESPACES } from './constants';//最好是导入 lib/constants.js 而不是自己创建

const serverAddress = 'http://localhost'; // 从环境变量或配置文件中获取
const serverPort = 4000;
const clientId = 'my-client';
const clientType = 'web-app';
// const clientKey = 'your-secret-key'; // 不要硬编码！
// 从安全的地方获取客户端密钥 (例如，环境变量、配置文件、安全存储)
const clientKey = process.env.CLIENT_KEY || 'fallback-key'; // 示例：从环境变量获取

// 示例：自动获取密钥，但前提是网络环境为相对安全
/*
const authData = = {
    clientType: 'monitor',
    clientId: 'monitor',
    key: 'getKey',
    desc: '服务器监控网页',
  } 
const authSocket = newSocket(NAMESPACES.AUTH, authData, true, true);

authSocket.on(MSG_TYPE.CLIENT_KEY , (data) =>){
  const key = data.Key;
  authData.key = key;
  }
*/

const authData = {
  clientType: clientType,
  clientId: clientId,
  key: clientKey,
};

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
    if(buffering){
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

  const stream = ss(socket).stream;//获取ss.createStream() 方法
  const streamOn = ss(socket).on(eventName, (stream) => {//给stream.on 绑定一个变量
    stream.on('data', dataHandler);
    stream.on('end', endHandler);
    stream.on('error', errorHandler);
  });

  function scheduleUpdate() {
    requestAnimationFrame(() => {

      if(buffering){
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

  function processBuffer(){
      while(buffer.length > 0){
        const chunk = buffer.shift();
        accumulatedData += chunk.toString();
        totalBufferedSize -= chunk.length;
      }
      buffering = false;
  }

  // 返回一个清理函数
  return () => {
    if(streamOn && stream){ //streamOn 是一个Listener, 需要通过ss(socket).removeListener去清除
        ss(socket).removeListener(eventName, streamOn);
        stream.removeListener('data', dataHandler);//stream 是一个node emitter, 可以直接removeListener
        stream.removeListener('end', endHandler);
        stream.removeListener('error', errorHandler);
    }
  };
}
```

**`llmAPI.js`:**

```javascript
// llmAPI.js
import { getSocket } from './socketManager';
import { MSG_TYPE, NAMESPACES, STREAM_EVENTS } from './constants';
import { generateUniqueId } from './utils';
import * as ss from '@sap_oss/node-socketio-stream'

export function sendLLMRequest(message, targetClientId, requestType, callback) {
  const socket = getSocket(NAMESPACES.LLM);
  const requestId = generateUniqueId();

  socket.emit(
    MSG_TYPE.LLM_REQUEST,
    {
      target: targetClientId,
      requestId: requestId,
      message: message,
      requestType: requestType,
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
export function setupLLMStream(element,options) {
    const socket = getSocket(NAMESPACES.LLM);
    const removeListener = streamToElement(socket, STREAM_EVENTS.streamed_data, element, options);
    return removeListener;
}


```

**`functionCallAPI.js`:**

```javascript
// functionCallAPI.js
import { getSocket } from './socketManager';
import { MSG_TYPE, NAMESPACES } from './constants';
import { generateUniqueId } from './utils';

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

**`app.js` (示例):**

```javascript
// app.js (示例)
import { getSocket,closeAllSockets } from './socketManager';
import { MSG_TYPE, NAMESPACES } from './constants';
import { sendLLMRequest, setupLLMStream } from './llmAPI';
import { callFunction } from './functionCallAPI';

// 你可以像如下代码来加载你想要的静态资源，具体用法详见开发文档，也可以参考server.js的initializeStaticResources()

// 键：URL，值：文件相对于本js文件的相对路径
const initialResources = {}

functionCallSocket.emit(MSG_TYPE.FUNCTION_CALL, {
  requestId: requestId,
  functionName: 'addStaticResources',
  args: initialResources,
  target: 'server'  
  }, (response) => {
    if (response.success) {
      console.log('Function call result:', response.result);
    } else {
      console.error('Function call error:', response.error);
    }
  }
);


// 获取 DOM 元素
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const llmResponseOutput = document.getElementById('llmResponseOutput');

// 连接到默认命名空间 (可选，取决于您的需求)
const defaultSocket = getSocket('/');

defaultSocket.on('connect', () => {
  console.log('Connected to default namespace!');
});

// 连接到 /llm 命名空间, 并设置流式监听
const llmSocket = getSocket(NAMESPACES.LLM);
const removeStreamListener = setupLLMStream(llmResponseOutput, {
        updateInterval: 200, // 200ms 更新间隔
        maxBufferSize: 1024 * 1024, // 1MB 缓冲区
});

// 发送 LLM 请求
sendButton.addEventListener('click', () => {
  const message = messageInput.value;
  if (message) {
    sendLLMRequest(message, 'your-sillytavern-client-id', 'newMessage', (response) => {
        if(response.status === 'ok'){
             console.log('LLM request sent successfully.');
        }
    });
    messageInput.value = '';
  }
});

// 调用函数示例
callFunction(
  'myServerFunction',
  [arg1, arg2],
  'server',
  (response) => {
    if (response.success) {
      console.log('Function call result:', response.result);
    } else {
      console.error('Function call error:', response.error);
    }
  }
);

// 在页面关闭前, 或不需要连接时，关闭所有 Socket.IO 连接
window.addEventListener('beforeunload', () => {
  removeStreamListener(); // 清除流式监听
  closeAllSockets();
});
```

**代码解释:**

* **`constants.js`:**  定义了常量，避免硬编码。
* **`utils.js`:**  定义了工具函数 (例如 `generateUniqueId`)。
* **`socketManager.js`:**
  * `getSocket()`:  获取或创建 Socket.IO 连接 (单例模式)。
  * `createSocket()`: 创建并配置 Socket.IO 连接，包括错误处理和自动重连。
  * `closeAllSockets()`:  关闭所有 Socket.IO 连接。
  * `streamToElement()`: 接收流数据并实时更新到 HTML 元素
* **`llmAPI.js`:**
  * `sendLLMRequest()`:  封装了发送 LLM 请求的逻辑。
  * `setupLLMStream()`: 设置流式监听
* **`functionCallAPI.js`:**
  * `callFunction()`:  封装了函数调用的逻辑。
* **`app.js`:**
  * 导入了各个模块。
  * 获取了 DOM 元素。
  * 使用 `getSocket()` 获取 Socket.IO 连接。
  * 使用 `sendLLMRequest()` 发送 LLM 请求。
  * 使用 `callFunction()` 调用函数。
  * 在页面关闭前关闭所有 Socket.IO 连接。

**流程图**

以下流程图展示了客户端的典型工作流程：

<ClientWorkflow />