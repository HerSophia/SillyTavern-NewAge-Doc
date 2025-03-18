---
title: 日志管理
layout: doc
---

# 日志 (Logging)

SillyTavern-NewAge 服务器使用 `winston` 库实现了一个灵活且可配置的日志系统。 日志信息对于调试、监控服务器运行状况以及排查问题至关重要。

## 1. 日志级别

服务器支持以下日志级别 (按照严重程度递增)：

* **`debug`:**  详细的调试信息，通常仅在开发过程中使用。
* **`info`:**  一般信息性消息，用于记录服务器的正常操作。
* **`warn`:**  警告消息，表示可能存在问题，但服务器仍然可以继续运行。
* **`error`:**  错误消息，表示发生了错误，可能导致某些功能无法正常工作。

## 2. 日志格式

日志消息采用以下格式：

```
YYYY-MM-DD HH:mm:ss [level] [service] [code] (可选): message
[元数据 (JSON 格式)] (可选)
```

* **`YYYY-MM-DD HH:mm:ss`:**  日期和时间戳 (使用本地时区)。
* **`level`:**  日志级别 (`debug`、`info`、`warn` 或 `error`)。
* **`service`:**  产生日志的服务名称 (默认为 `'llm-server'`)。
* **`code`:**  (可选) 错误码或警告码 (整数)。
* **`message`:**  日志消息文本。
* **`元数据`:**  (可选) 与日志消息相关的附加信息，以 JSON 格式表示。

**示例：**

```
2024-03-17 15:30:45 [info] [llm-server]: User logged in
{"userId": 123, "username": "john_doe"}

2024-03-17 15:32:10 [error] [llm-server] [4]: Failed to process request
{"requestId": "abc-xyz"}

2024-03-17 16:01:22 [warn] [llm-server] [52]: Resource already exists
{"resourceId": "xyz"}
```

## 3. 日志文件

日志消息被写入以下文件：

* **`combined.log`:**  包含所有级别的日志消息。
* **`error.log`:**  仅包含 `error` 级别的日志消息。
* **`warn.log`:**  仅包含 `warn` 级别的日志消息。
* **`info.log`:**  仅包含 `info` 级别的日志消息。

日志文件位于服务器根目录下的 `logs` 文件夹中 (例如，`server/logs/combined.log`)。 服务器在启动时会清空这些日志文件。

## 4. 控制台输出

在开发环境 (`process.env.NODE_ENV !== 'production'`) 下，日志消息也会输出到控制台，并带有颜色以提高可读性。

## 5. `logger.js` 模块

`server/dist/logger.js` 模块提供了以下函数：

* **`log(level, message, meta = {}, code)`:**
  * 记录一条日志消息。
  * 参数：
    * `level`: 日志级别 (字符串)。
    * `message`: 日志消息文本 (字符串)。
    * `meta`: (可选) 元数据对象。
    * `code`: (可选) 错误码或警告码 (整数或字符串)。
* **`error(message, meta = {}, code)`:**  记录一条 `error` 级别的日志消息 (快捷方式)。
* **`warn(message, meta = {}, code)`:**  记录一条 `warn` 级别的日志消息 (快捷方式)。
* **`info(message, meta = {}, code)`:**  记录一条 `info` 级别的日志消息 (快捷方式)。
* **`debug(message, meta = {}, code)`:**  记录一条 `debug` 级别的日志消息 (快捷方式)。

## 6. 错误码和警告码

为了帮助开发人员更快地识别和解决问题，服务器使用了一组预定义的错误码和警告码。

### 6.1. 错误码

| 类别             | 代码    | 描述                                                                                       |
| ---------------- | ------- | ------------------------------------------------------------------------------------------ |
| **通用**         |         |                                                                                            |
|                  | 1       | 未知错误 (Unknown Error)                                                                  |
|                  | 2       | 内部服务器错误 (Internal Server Error)                                                      |
|                  | 3       | 无效参数 (Invalid Parameter)                                                              |
|                  | 4       | 无效请求 (Invalid Request)                                                                |
|                  | 5       | 身份验证失败 (Authentication Failed)                                                        |
|                  | 6       | 授权失败 (Authorization Failed)                                                           |
|                  | 7       | 资源未找到 (Resource Not Found)                                                           |
|                  | 8       | 请求超时 (Request Timeout)                                                                |
|                  | 9       | 服务不可用 (Service Unavailable)                                                          |
|                  | 10      | 网络错误 (Network Error)                                                                  |
|                  | 11      | 客户端断开连接 (Client Disconnected)                                                        |
| **文件操作**    |         |                                                                                            |
|                  | 101     | 文件未找到 (File Not Found)                                                                |
|                  | 102     | 文件已存在 (File Already Exists)                                                          |
|                  | 103     | 无权访问文件 (File Access Denied)                                                          |
|                  | 104     | 文件读取错误 (File Read Error)                                                              |
|                  | 105     | 文件写入错误 (File Write Error)                                                            |
|                  | 106     | 无效的文件路径 (Invalid File Path)                                                          |
| **路径安全**    |         |                                                                                            |
|                  | 201     | 路径越界 (Path Traversal)                                                           |
|                  | 202     | 文件受限 (Restricted File)                                                  |
| **房间管理**      |         |                                                                                            |
|                  | 301     | 房间已存在 (Room Already Exists)                                                          |
|                  | 302     | 房间未找到 (Room Not Found)                                                                |
|                  | 303     | 无权访问房间 (Room Access Denied)                                                          |
|                  | 304     | 客户端已在房间中 (Client Already in Room)                                                  |
|                  | 305     | 客户端不在房间中 (Client Not in Room)                                                      |
| **客户端管理**  |         |                                                                                            |
|                  | 401     | 客户端未找到 (Client Not Found)                                                             |
|                  | 402     | 无效的客户端key (Invalid Client Key)                                                         |
| **函数调用**    |         |                                                                                            |
|                  | 501     | 函数未找到 (Function Not Found)                                                            |
|                  | 502     | 函数调用错误 (Function Call Error)                                                          |
|                  | 503     | 无效的函数参数 (Invalid Function Arguments)                                                  |
| **LLM消息相关** |         |                                                                                            |
|                  | 10400   | LLM 提供商 API 密钥无效或缺失 (Invalid or missing LLM provider API key)                       |
|                  | 10401   | LLM 提供商 API 请求失败 (LLM provider API request failed)                                   |
|                  | 10403   | LLM 访问被拒绝 (LLM access denied)                    |
|                  | 10429   | LLM 请求速率过快 (Too many requests to LLM provider)                                     |
|                  | 10500   | LLM 提供商服务器错误 (LLM provider server error)                                         |
|                  | 10503   | LLM 服务不可用 (LLM service unavailable)                                                     |
|                  | 10401   | API 密钥不正确 (Incorrect API key provided)                                                |
|                  | 10429   | 您超过了当前的配额，请检查您的计划和账单详细信息 (You exceeded your current quota)            |
|                  | 10500   | 服务器在处理您的请求时遇到错误 (The server had an error processing your request)            |

### 6.2. 警告码

| 类别     | 代码   | 描述                                                     |
| -------- | ------ | -------------------------------------------------------- |
| **通用** |        |                                                          |
|          | 51     | 未知警告 (Unknown Warning)                                |
|          | 52     | 资源已存在 (Resource Already Exists)                     |
| **日志** |        |                                                          |
|          | 61     | 客户端尝试删除不存在的key (Client Attempted to Remove Non-Existent Key) |
| **流式消息** |   |                                                        |
|          | 71     | 收到未知stream ID的消息 (Received Data for Unknown Stream)       |
|          | 72    | 未找到requestId对应的请求 (No Matching Requests Found for RequestId)  |

## 7. 使用示例

```javascript
import { error, warn, info, debug } from './logger.js';

// 记录错误消息，带有错误码和元数据
error('Failed to connect to database', { url: 'mongodb://localhost:27017', retryAttempts: 3 }, 10);

// 记录警告消息，带有警告码
warn('Low disk space remaining', { freeSpace: '10MB' }, 52);

// 记录信息性消息
info('User logged in', { userId: 123, username: 'john_doe' });

// 记录调试消息
debug('Received request', { method: 'GET', path: '/api/users' });
```

## 8. 读取日志 (通过 `/debug` 命名空间)

客户端 (具有相应权限) 可以通过 `/debug` 命名空间的 `READ_LOG` 事件读取服务器日志。

* **请求数据:**

    ```typescript
    {
      filename: string; // 日志文件名 ('combined.log', 'error.log', 'info.log', 'warn.log')
      level: string;    // 日志级别 ('all', 'error', 'warn', 'info')
      page: number;    // 页码 (从 1 开始)
      pageSize: number;  // 每页的行数
    }
    ```

* **响应数据:**

    ```typescript
    {
      success: boolean;
      lines: string[]; // 日志行数组
      total: number; // 总行数 (过滤后)
      page: number; // 当前页码
      pageSize: number; // 每页的行数
      level: string; // 日志级别
    }
    ```

## 9. 总结

SillyTavern-NewAge 服务器的日志系统提供了一种结构化、可配置的方式来记录服务器的运行状况、错误和警告信息。 日志级别、自定义格式、错误码/警告码以及通过 API 读取日志的功能，使开发人员能够轻松地监控服务器并快速诊断问题。
