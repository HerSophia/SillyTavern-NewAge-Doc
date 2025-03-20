---
title: 日志管理
layout: doc
---

# 日志 (Logging)

SillyTavern-NewAge 服务器使用 [winston](https://github.com/winstonjs/winston) 库实现了一个灵活且可配置的日志系统。 日志信息对于调试、监控服务器运行状况以及排查问题至关重要.

## 1. 日志级别

服务器支持以下日志级别 (按照严重程度递增)：

* **`debug`:**  详细的调试信息，通常仅在开发过程中使用。
* **`info`:**  一般信息性消息，用于记录服务器的正常操作。
* **`warn`:**  警告消息，表示可能存在潜在问题，但服务器仍然可以继续运行。
* **`error`:**  错误消息，表示发生了错误，可能导致某些功能无法正常工作。

## 2. 日志格式

日志消息采用以下格式：

```
YYYY-MM-DD HH:mm:ss [level] [service] [event] (可选): message
[元数据 (JSON 格式)] (可选)
```

* **`YYYY-MM-DD HH:mm:ss`:**  日期和时间戳 (使用本地时区)。
* **`level`:**  日志级别 (`debug`、`info`、`warn` 或 `error`)。
* **`service`:**  产生日志的服务名称 (默认为 `'llm-server'`)。
* **`event`:**  (可选) 事件名称，用于标识特定类型的日志 (例如 `CONFIG_LOADED`, `ROOM_ERROR`)。
* **`message`:**  日志消息文本。
* **`元数据`:**  (可选) 与日志消息相关的附加信息，以缩进 JSON 格式表示。 元数据可以包含错误码 (`errorCode`) 或警告码 (`warningCode`) 以及其他上下文信息。

**示例：**

```
2024-03-17 15:30:45 [info] [llm-server] [CONFIG_LOADED]: Server settings loaded from file.
{}

2024-03-17 15:32:10 [error] [llm-server] [ROOM_ERROR]: Error deleting room room123:
{
  "error": {
    "message": "Failed to delete room room123: Error: Room room123 does not exist"
  }
}

2024-03-17 16:01:22 [warn] [llm-server] [ROOM_WARNING]: Room room123 already exists
{}
```

## 3. 日志文件

日志消息被写入以下文件，这些文件都位于服务器根目录下的 `logs` 文件夹中 (例如，`server/logs/combined.log`)。 服务器在启动时会清空这些日志文件。

* **`combined.log`:**  包含所有级别的日志消息。
* **`error.log`:**  仅包含 `error` 级别的日志消息。
* **`warn.log`:**  仅包含 `warn` 级别的日志消息。
* **`info.log`:**  仅包含 `info` 级别的日志消息。


## 4. 控制台输出

在开发环境 (`process.env.NODE_ENV !== 'production'`) 下，日志消息也会输出到控制台，并带有颜色以提高可读性，控制台输出的时间戳格式会更加简洁，只显示 `HH:mm:ss`。

## 5. `logger.js` 模块

`server/dist/logger.js` 模块提供了以下函数，用于在服务器代码中记录日志：

* **`log(level, message, meta = {}, event)`:**
  * 记录一条日志消息，可以自定义日志级别、消息内容、元数据和事件名称。
  * 参数：
    * `level`: 日志级别 (字符串，例如 `'error'`, `'warn'`, `'info'`, `'debug'`)。
    * `message`: 日志消息文本 (字符串)。
    * `meta`: (可选) 元数据对象 (默认为空对象 `{}`).  错误码或警告码应该作为元数据的一部分，例如 `meta: { errorCode: 10 }`.
    * `event`: (可选) 事件名称 (字符串，例如 `'CONFIG_LOADED'`, `'ROOM_ERROR'`) 用于分类和标识日志。
* **`error(message, meta = {}, event)`:**  记录一条 `error` 级别的日志消息 (快捷方式，等同于调用 `log('error', message, meta, event)`).
* **`warn(message, meta = {}, event)`:**  记录一条 `warn` 级别的日志消息 (快捷方式，等同于调用 `log('warn', message, meta, event)`).
* **`info(message, meta = {}, event)`:**  记录一条 `info` 级别的日志消息 (快捷方式，等同于调用 `log('info', message, meta, event)`).
* **`debug(message, meta = {}, event)`:**  记录一条 `debug` 级别的日志消息 (快捷方式，等同于调用 `log('debug', message, meta, event)`).

## 6. 错误码和警告码

为了帮助开发人员更快地识别和解决问题，服务器使用了一组预定义的错误码和警告码。 这些代码作为元数据的一部分包含在日志中。

### 6.1. 错误码 (errorCode)

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

### 6.2. 警告码 (warningCode)

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

### 6.3. 服务器事件 (EVENTS)

服务器内部使用事件 (定义在 `lib/constants.js` 中的 `EVENTS` 常量) 进行模块间的通信和状态通知。 下表列出了部分重要的服务器事件及其描述：

| 事件名称                      | 描述                                                               |
| ----------------------------- | ------------------------------------------------------------------ |
| `SERVER_START`                | 服务器启动时触发                                                     |
| `SERVER_STOP`                 | 服务器停止时触发                                                     |
| `CONFIG_LOADED`               | 服务器配置加载完成时触发                                             |
| `CONFIG_SAVED`                | 服务器配置保存完成时触发                                             |
| `ERROR`                       | 通用错误事件                                                         |
| `WARNING`                     | 通用警告事件                                                         |
| `CLIENT_CONNECTED`            | 客户端成功连接到服务器时触发                                         |
| `CLIENT_DISCONNECTED`         | 客户端与服务器断开连接时触发                                         |
| `CLIENT_AUTHENTICATED`        | 客户端成功通过身份验证时触发                                         |
| `CLIENT_AUTH_FAILED`          | 客户端身份验证失败时触发                                             |
| `ROOM_CREATED`                | 房间创建成功时触发                                                     |
| `ROOM_DELETED`                | 房间删除成功时触发                                                     |
| `ROOM_JOINED`                 | 客户端成功加入房间时触发                                             |
| `ROOM_LEFT`                   | 客户端离开房间时触发                                                 |
| `ROOM_ERROR`                  | 房间操作发生错误时触发                                               |
| `MEMBER_JOINED`               | 成员加入房间时触发 (语义更明确的房间加入事件)                              |
| `MEMBER_LEFT`                 | 成员离开房间时触发 (语义更明确的房间离开事件)                              |
| `LLM_REQUEST_RECEIVED`        | 服务器接收到 LLM 请求时触发                                           |
| `LLM_RESPONSE_SENT`         | 服务器向客户端发送 LLM 响应时触发                                       |
| `LLM_RESPONSE_FAILED`       | LLM 响应发送失败时触发                                                 |
| `STREAM_START`                | 流式传输开始时触发                                                     |
| `STREAM_DATA`                 | 流式数据传输过程中触发                                                 |
| `STREAM_END`                  | 流式传输结束时触发                                                     |
| `STREAM_ERROR`                | 流式传输发生错误时触发                                                 |
| `EXTENSION_CONNECTED`         | SillyTavern 扩展端连接到服务器时触发                                   |
| `EXTENSION_DISCONNECTED`      | SillyTavern 扩展端与服务器断开连接时触发                               |
| `FUNCTION_CALL_REQUEST`       | 服务器接收到函数调用请求时触发                                         |
| `FUNCTION_CALL_RESPONSE`      | 服务器发送函数调用响应时触发                                           |
| `FUNCTION_CALL_ERROR`         | 函数调用发生错误时触发                                                 |
| `DEBUG_MODE_CHANGED`          | 调试模式切换时触发                                                     |
| `SERVER_STATUS_RESPONSE`      | 服务器状态响应事件                                                       |
| `LOG_READ_RESPONSE`         | 日志读取响应事件                                                         |
| `CONNECTION_POLICY_SET`       | 连接策略设置时触发                                                       |
| `EXTENSION_ASSIGNED`          | 扩展端被分配给客户端时触发                                               |
| `AVAILABLE_EXTENSIONS_UPDATE` | 可用扩展端列表更新时触发                                                 |
| `MESSAGE_REQUEST_MODE_SET`    | 消息请求模式设置时触发                                                   |


## 7. 使用示例

```javascript
import { error, warn, info, debug } from './logger.js';

// 记录错误消息，带有错误码和元数据
error('Failed to connect to database', { url: 'mongodb://localhost:27017', retryAttempts: 3, errorCode: 10 }, 'DATABASE_ERROR');

// 记录警告消息，带有警告码
warn('Low disk space remaining', { freeSpace: '10MB', warningCode: 52 }, 'DISK_SPACE_WARNING');

// 记录信息性消息
info('User logged in', { userId: 123, username: 'john_doe' }, 'USER_LOGIN');

// 记录调试消息
debug('Received request', { method: 'GET', path: '/api/users' }, 'REQUEST_DEBUG');
```

## 8. 读取日志 (通过 `/debug` 命名空间)

客户端 (例如，管理前端或 SillyTavern 扩展端，需要具有相应权限) 可以通过 `/debug` 命名空间的 `READ_LOG` 事件读取服务器日志。 这对于远程监控服务器状态和诊断问题非常有用。

* **请求数据 (发送到服务器):**

    ```typescript
    {
      filename: string; // 日志文件名 ('combined.log', 'error.log', 'info.log', 'warn.log')
      level: string;    // 日志级别过滤器 ('all', 'error', 'warn', 'info')，只返回指定级别及以上的日志
      page: number;    // 页码 (从 1 开始)
      pageSize: number;  // 每页的行数 (建议 1-100)
    }
    ```

* **响应数据 (服务器返回):**

    ```typescript
    {
      status: 'ok' | 'error';
      lines?: string[]; // 日志行数组 (当 status 为 'ok' 时)
      total?: number; // 总行数 (过滤后，当 status 为 'ok' 时)
      page?: number; // 当前页码 (当 status 为 'ok' 时)
      pageSize?: number; // 每页的行数 (当 status 为 'ok' 时)
      level?: string; // 日志级别 (当 status 为 'ok' 时)
      message?: string; // 错误消息 (当 status 为 'error' 时)
    }
    ```

## 9. 总结

SillyTavern-NewAge 服务器的日志系统提供了一种结构化、可配置的方式来记录服务器的运行状况、错误和警告信息。 日志级别、自定义格式、错误码/警告码、事件名称以及通过 API 读取日志的功能，使开发人员和管理员能够轻松地监控服务器、快速诊断问题并进行有效的维护。
