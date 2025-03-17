---
title: 函数调用
layout: doc
---

# 函数调用机制 (Function Call Mechanism)

SillyTavern-NewAge 服务器提供了一种函数调用机制，允许客户端通过 Socket.IO 调用服务器端定义的函数。 这为客户端提供了一种与服务器进行交互的灵活方式，可以执行服务器端的特定操作，而无需为每个操作定义单独的 Socket.IO 事件。

## 1. 概述

函数调用机制通过 `/function_call` 命名空间实现。 客户端可以向服务器发送 `FUNCTION_CALL` 事件，指定要调用的函数名、参数以及目标（`'server'` 或 SillyTavern 的 `clientId`）。 服务器会执行相应的函数，并通过回调函数将结果返回给客户端。

## 2. API

### 2.1. 发起函数调用

* **事件:**  `FUNCTION_CALL`  (`/function_call` 命名空间)
* **发送方:**  客户端 (SillyTavern 扩展、普通客户端、管理前端)
* **接收方:**  服务器
* **数据:**

    ```typescript
    {
      requestId: string;    // 请求的唯一 ID (由客户端生成)
      functionName: string; // 要调用的函数名
      args: any[];          // 函数参数 (数组)
      target: string;     // 调用的目标，'server' 或者 SillyTavern 的 clientId
    }
    ```

* **响应 (通过 `callback` 函数):**

    ```typescript
    {
      requestId: string; // 与请求中的 requestId 相同
      success: boolean; // 函数调用是否成功
      result?: any;     // 函数的返回值 (如果 success 为 true)
      error?: {
        message: string; // 错误消息 (如果 success 为 false)
      };
    }
    ```

## 3. 服务器端函数注册

服务器端函数必须先注册到 `functionRegistry` 对象中，然后才能被客户端调用。

```javascript
const functionRegistry = {};

function registerFunction(name, func) {
  if (functionRegistry[name]) {
    console.warn(`Function "${name}" is already registered. Overwriting.`);
  }
  functionRegistry[name] = func;
  console.log(`Function "${name}" registered for function_call.`);
}

// 示例：注册一个加法函数
registerFunction('add', (a, b) => a + b);
```

服务器在启动时会自动注册 `server/dist/function_call.js` 文件中导出的所有函数。

## 4. `server/dist/function_call.js`

`server/dist/function_call.js` 模块提供了一些预定义的函数，可供客户端调用。 这些函数主要用于：

* **静态资源管理:**  `addStaticResources(app, resources)`
* **文件读写:**
  * `readJsonFromFile(filePath)`
  * `saveJsonToFile(filePath, jsonData)`

### 4.1. `addStaticResources(app, resources)`

* **功能:**  动态添加静态资源 (将 URL 路径映射到文件系统路径)。
* **参数:**
  * `app`:  Express 应用实例 (在服务器内部使用，客户端不需要提供)。
  * `resources`:  一个对象，键是 URL 路径，值是相对于`server.js`的相对文件路径。
* **返回值:**  一个 Promise，resolve 时返回一个对象，指示操作是否成功以及每个资源的状态。

### 4.2. `readJsonFromFile(filePath)`

* **功能:**  从指定的文件读取 JSON 数据。
* **参数:**
  * `filePath`:  文件路径 (可以是相对路径或绝对路径，但会被 `sanitizePath` 函数处理)。
* **返回值:**  一个 Promise，resolve 时返回一个对象：
  * `success`: `true` 表示读取成功，`false` 表示失败。
  * `result`:  读取到的 JSON 数据 (如果 `success` 为 `true`)。
  * `error`:  错误信息 (如果 `success` 为 `false`)。

### 4.3. `saveJsonToFile(filePath, jsonData)`

* **功能:**  将 JSON 数据保存到文件 (合并现有数据，新数据覆盖旧数据)。
* **参数:**
  * `filePath`:  文件路径 (可以是相对路径或绝对路径，但会被 `sanitizePath` 函数处理)。
  * `jsonData`:  要保存的 JSON 数据。
* **返回值:**  一个 Promise，resolve 时返回一个对象：
  * `success`: `true` 表示保存成功，`false` 表示失败。
  * `error`:  错误消息 (如果 `success` 为 `false`)。

## 5. 路径安全 (`sanitizePath`)

`server/dist/function_call.js` 模块中的 `sanitizePath(filePath, isRestricted = true)` 函数用于确保文件路径的安全性，防止路径遍历攻击。

* **功能:**
    1. 将相对路径转换为绝对路径。
    2. 规范化路径 (处理 `.`、`..`、多个分隔符等)。
    3. 检查路径是否超出服务器根目录 (`serverRoot`)。
    4. 如果 `isRestricted` 为 `true`，检查路径是否在 `serverSettings.restrictedFiles` 列表中。
    5. 如果路径无效或越界，则抛出错误。

## 6. SillyTavern 扩展的函数调用

SillyTavern 扩展也可以向服务器发送 `FUNCTION_CALL` 请求。 通常，SillyTavern 扩展会调用 `readJsonFromFile` 和 `saveJsonToFile` 函数来读取和保存配置文件或其他数据。

## 7. 示例

**客户端 (JavaScript):**

```javascript
// 假设 socket 是已连接的 Socket.IO 客户端实例

// 调用服务器端的 'add' 函数
socket.emit(
  'FUNCTION_CALL',
  {
    requestId: '123',
    functionName: 'add',
    args: [1, 2],
    target: 'server',
  },
  (response) => {
    if (response.success) {
      console.log('Result:', response.result); // 输出: 3
    } else {
      console.error('Error:', response.error);
    }
  },
);

// 调用服务器端的 'readJsonFromFile' 函数
socket.emit(
  'FUNCTION_CALL',
  {
    requestId: '456',
    functionName: 'readJsonFromFile',
    args: ['/settings/config.json'], // 注意：路径是相对于 server 文件夹的
    target: 'server',
  },
  (response) => {
    if (response.success) {
      console.log('Config:', response.result);
    } else {
      console.error('Error:', response.error);
    }
  },
);
```

## 8. 总结

SillyTavern-NewAge 服务器的函数调用机制提供了一种灵活的方式，允许客户端执行服务器端的操作。 通过将函数注册到 `functionRegistry` 对象中，服务器可以轻松地扩展其功能，而无需为每个操作定义单独的 Socket.IO 事件。 `server/dist/function_call.js` 模块提供了一些常用的函数 (例如，文件读写)，而 `sanitizePath` 函数确保了文件路径的安全性。 SillyTavern 扩展也可以利用此机制与服务器进行交互。
