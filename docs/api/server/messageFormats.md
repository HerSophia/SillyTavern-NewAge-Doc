---
title: 消息格式
layout: doc
---

# 消息格式 (Message Formats)

* SillyTavern-NewAge 服务器使用 Socket.IO 进行通信，消息格式主要基于 JSON。 以下是主要消息类型的详细格式说明。

> [!IMPORTANT]
> * 所有消息都通过 Socket.IO 事件进行传输。
> * 除非另有说明，否则所有字段都是必需的。
> * `callback` 表示一个可选的回调函数，服务器可以使用它来发送响应。

## 1. 通用消息

### 1.1. `ERROR`

* **描述:**  表示服务器端发生错误。
* **发送方:**  服务器
* **接收方:**  客户端
* **事件名:**  `MSG_TYPE.ERROR`
* **数据格式:**

    ```typescript
    {
      message: string; // 错误消息
      type?: string;   // (可选) 错误类型
      requestId?: string; // (可选) 相关的请求 ID
      code?: string | number; // (可选) 错误代码
      [key: string]: any;    // (可选) 其他错误相关信息
    }
    ```

### 1.2. `WARNING`

* **描述:**  表示服务器端发生了警告。
* **发送方:**  服务器
* **接收方:**  客户端
* **事件名:**  `MSG_TYPE.WARNING`
* **数据格式:**

    ```typescript
    {
      message: string; // 警告消息
      type?: string;   // (可选) 警告类型
      requestId?: string; // (可选) 相关的请求 ID
      code?: string | number; // (可选) 警告代码
      [key: string]: any;    // (可选) 其他警告相关信息
    }
    ```

## 2. 连接与认证

### 2.1. `LOGIN` (已废弃)

* **描述:**  客户端尝试登录 (已废弃，现在使用 `socket.handshake.auth` 进行认证)。
* **发送方:**  客户端
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.LOGIN`
* **数据格式:**

    ```typescript
    {
      clientId: string; // 客户端 ID
      password: string; // 密码
    }
    ```

### 2.2 `GET_CLIENT_KEY`

* **描述:** 客户端获取指定用户的key。
* **发送方:** 客户端
* **接收方:** 服务器
* **事件名:** `MSG_TYPE.GET_CLIENT_KEY`
* **数据格式:**

    ```typescript
    {
        clientId: string;// 客户端 ID
    }
    ```

### 2.3 `GET_SILLYTAVERN_EXTENSION`

* **描述:** 客户端获取所有已连接的 SillyTavern 客户端的 clientId。
* **发送方:** 客户端
* **接收方:** 服务器
* **事件名:** `MSG_TYPE.GET_SILLYTAVERN_EXTENSION`
* **数据格式:**

    ```typescript
    NULL
    ```

## 3. 客户端管理

### 3.1. `GET_CLIENT_LIST`

* **描述:**  获取客户端列表。
* **发送方:**  客户端 (SillyTavern 或管理前端)
* **接收方:**  服务器
* **事件名:** `MSG_TYPE.GET_CLIENT_LIST`
* **数据格式:**
  * 请求:

      ```typescript
      NULL
      ```

  * 响应 (`callback`):

      ```typescript
      {
        success: boolean;
        clients: {
          clientId: string;
          clientType: string;
          clientDesc: string; // 客户端描述
          clientHTML?: string; // (可选) 客户端的 URL
        }[];
      }
      ```

### 3.2. `GET_ALL_CLIENT_KEYS`

* **描述:**  获取所有客户端的密钥。
* **发送方:**  客户端 (仅 SillyTavern)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.GET_ALL_CLIENT_KEYS`
* **数据格式:**
  * 请求:

      ```typescript
      NULL
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
        keys: {
          [clientId: string]: {
            key: string; // 哈希后的密钥
            rooms: string[]; // (此字段可能已不再使用)
          };
        };
      }
      ```

### 3.3 `GENERATE_CLIENT_KEY`

* **描述:** 生成并存储指定客户端的密钥
* **发送方:** 客户端 (仅 SillyTavern)
* **接收方:** 服务器
* **事件名:** `MSG_TYPE.GENERATE_CLIENT_KEY`
* **数据格式:**
  * 请求:

      ```typescript
      {
          targetClientId: string // 要生成密钥的客户端 ID
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
          status: 'ok';
          key: string; // 生成的密钥 (未哈希)
      }
      ```

### 3.4 `REMOVE_CLIENT_KEY`

* **描述:** 移除指定客户端的密钥
* **发送方:** 客户端 (仅 SillyTavern)
* **接收方:** 服务器
* **事件名:** `MSG_TYPE.REMOVE_CLIENT_KEY`
* **数据格式:**
  * 请求:

      ```typescript
      {
        targetClientId: string // 要移除密钥的客户端 ID
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
      }
      ```

### 3.5. `UPDATE_CONNECTED_CLIENTS`

* **描述:** 更新客户端列表
* **发送方:** 服务器
* **接收方:** 管理前端
* **事件名:**  `MSG_TYPE.UPDATE_CONNECTED_CLIENTS`
* **数据格式:**
  * 请求:

      ```typescript
      NULL
      ```

  * 响应:

      ```typescript
      {
          status: 'ok';
      }
      ```

### 3.6. `CONNECTED_CLIENTS_UPDATE`

* **描述:** 发送给 SillyTavern (仅非 SillyTavern 客户端)
* **发送方:** 服务器
* **接收方:** SillyTavern
* **事件名:**  `MSG_TYPE.CONNECTED_CLIENTS_UPDATE`
* **数据格式:**

    ```typescript
    {
        nonSillyTavernClients: Array;
    }
    ```

## 4. 房间管理

### 4.1. `GET_ROOMS`

* **描述:**  获取所有房间的列表。
* **发送方:**  客户端 (SillyTavern 或管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.GET_ROOMS`
* **数据格式:**
  * 请求:

      ```typescript
      NULL
      ```

  * 响应 (`callback`):

      ```typescript
      {
          status: 'ok';
        rooms: string[]; // 房间名数组
      }
      ```

### 4.2. `GET_CLIENTS_IN_ROOM`

* **描述:**  获取指定房间内的客户端列表。
* **发送方:**  客户端 (SillyTavern 或管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.GET_CLIENTS_IN_ROOM`
* **数据格式:**
  * 请求:

      ```typescript
      {
        roomName: string; // 房间名
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        success: boolean;
        clients: {
          id: string; // 客户端 ID
          description: string; // 客户端描述
            // ... 其他信息 ...
        }[];
      }
      ```

### 4.3. `CREATE_ROOM`

* **描述:**  创建一个新房间 (仅限管理前端)。
* **发送方:**  客户端 (管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.CREATE_ROOM`
* **数据格式:**
  * 请求:

      ```typescript
      {
        roomName: string; // 房间名
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
      }
      ```

### 4.4. `DELETE_ROOM`

* **描述:**  删除一个房间 (仅限管理前端)。
* **发送方:**  客户端 (管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.DELETE_ROOM`
* **数据格式:**
  * 请求:

      ```typescript
      {
        roomName: string; // 房间名
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
      }
      ```

### 4.5. `ADD_CLIENT_TO_ROOM`

* **描述:**  将客户端添加到指定房间 (仅限管理前端)。
* **发送方:**  客户端 (管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.ADD_CLIENT_TO_ROOM`
* **数据格式:**
  * 请求:

      ```typescript
      {
        clientId: string; // 客户端 ID
        roomName: string; // 房间名
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
      }
      ```

### 4.6. `REMOVE_CLIENT_FROM_ROOM`

* **描述:**  将客户端从指定房间移除 (仅限管理前端)。
* **发送方:**  客户端 (管理前端)
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.REMOVE_CLIENT_FROM_ROOM`
* **数据格式:**
  * 请求:

      ```typescript
      {
        clientId: string; // 客户端 ID
        roomName: string; // 房间名
      }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
      }
      ```

## 5. LLM 交互

### 5.1. `LLM_REQUEST`

* **描述:**  客户端发送 LLM 对话请求，或服务器将请求转发给 SillyTavern 扩展。
* **发送方:**  客户端 或 服务器
* **接收方:**  服务器 或 SillyTavern 扩展
* **事件名:**  `MSG_TYPE.LLM_REQUEST`
* **数据格式:**

    ```typescript
    {
      target: string;             // 目标 SillyTavern 扩展的 clientId
      requestId: string;          // 请求的唯一 ID
      prompt: string;             // (可选) 提示文本
      context: string;            // (可选) 对话上下文
      history: any[];             // (可选) 对话历史
      // ... 其他特定于 LLM 的参数 ...
      data?: string;              //流数据的参数
    }
    ```

### 5.2. `NON_STREAM`

* **描述:**  客户端/服务器发送非流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.NON_STREAM`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.3. `STREAM_START`

* **描述:**  客户端/服务器开始发送流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_START`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.4. `STREAM_DATA`

* **描述:**  客户端/服务器发送流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA`
* **数据格式:**

    ```typescript
    和LLM_REQUEST的data一致
    ```

### 5.5. `STREAM_END`

* **描述:**  客户端/服务器停止发送流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_END`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.6. `STREAM_DATA_FIRST`

* **描述:**  客户端/服务器发送第一段流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA_FIRST`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.7. `STREAM_DATA_MIDDLE`

* **描述:**  客户端/服务器发送中间段流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA_MIDDLE`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.8. `STREAM_DATA_LAST`

* **描述:**  客户端/服务器发送最后一段流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA_LAST`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.9. `STREAM_DATA_RETRY`

* **描述:**  客户端/服务器尝试重发流式消息。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA_RETRY`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

### 5.10. `STREAM_DATA_FAILED`

* **描述:**  客户端/服务器流式数据发送失败。
* **发送方:**  客户端/服务器
* **接收方:**   服务器/客户端
* **事件名:**  `MSG_TYPE.STREAM_DATA_FAILED`
* **数据格式:**

    ```typescript
     和LLM_REQUEST的data一致
    ```

## 6. SillyTavern 相关

### 6.1. `IDENTIFY_SILLYTAVERN`

* **描述:**  SillyTavern 扩展向服务器标识自身。
* **发送方:**  SillyTavern 扩展
* **接收方:**  服务器
* **事件名:**  `MSG_TYPE.IDENTIFY_SILLYTAVERN`
* **数据格式:**
  * 请求:

    ```typescript
    {
      clientId: string; // SillyTavern 扩展的 clientId
    }
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok' | 'warning';
        key?: string; // 服务器生成的密钥 (仅在首次连接时发送)
        message?: string; // 警告消息 (如果 SillyTavern 已经连接)
      }
      ```

## 7. 函数调用

### 7.1. `FUNCTION_CALL`

* **描述:**  客户端请求调用服务器端函数, 或转发给 SillyTavern 扩展。
* **发送方:**  客户端
* **接收方:**  服务器
* **事件名:** `MSG_TYPE.FUNCTION_CALL`
* **数据格式:**
  * 请求:

    ```typescript
    {
      requestId: string;    // 请求的唯一 ID
      functionName: string; // 要调用的函数名
      args: any[];          // 函数参数
      target: string;     // 要调用的目标，'server' 或者 SillyTavern 的 clientId
    }
    ```

  * 响应 (`callback`):

    ```typescript
    {
      requestId: string;
      success: boolean;
        result?: any; // 函数返回值 (如果成功)
        error?: {
          message: string; // 错误消息
        };
    }
    ```

## 8. debug 命名空间

### 8.1. `TOGGLE_DEBUG_MODE`

* **描述:**  切换调试模式。
* **发送方:**  客户端 (SillyTavern 或管理前端)
* **接收方:**  服务器
* **事件名:** `MSG_TYPE.TOGGLE_DEBUG_MODE`
* **数据格式:**
  * 请求:

      ```typescript
      NULL
      ```

  * 响应 (`callback`):

      ```typescript
      {
        status: 'ok';
        debugMode: boolean; // 当前的调试模式状态
      }
      ```

### 8.2. `DEBUG_MODE_CHANGED`

* **描述:**  服务器通知客户端调试模式已更改。
* **发送方:**  服务器
* **接收方:**  客户端 (连接到 `/debug` 命名空间的所有客户端)
* **事件名:** `MSG_TYPE.DEBUG_MODE_CHANGED`
* **数据格式:**

    ```typescript
    {
     debugMode: boolean; // 当前的调试模式状态
    }
    ```

### 8.3. `SERVER_STATUS`

* **描述:**  服务器通知客户端当前状态。
* **发送方:**  客户端
* **接收方:**  服务器
* **事件名:** `MSG_TYPE.SERVER_STATUS`
* **数据格式:**

    ```typescript
    NULL
    ```

### 8.4. `READ_LOG`

* **描述:** 客户端获取日志。
* **发送方:** 客户端
* **接收方:** 服务器
* **事件名:** `MSG_TYPE.READ_LOG`
* **数据格式:**
  * 请求:

      ```typescript
      {
        filename: string; // 日志文件名 ('combined.log', 'error.log', 'info.log', 'warn.log')
        level: string; // 日志级别 ('all', 'error', 'warn', 'info')
        page: number; // 页码 (从 1 开始)
        pageSize: number; // 每页的行数
      }

      ```

  * 响应 :

      ```typescript
      {
        success: boolean;
        lines: string[]; // 日志行数组
        total: number; // 总行数 (过滤后)
        page: number; // 当前页码
        pageSize: number; // 每页的行数
        level: string;  //日志等级
      }
      ```
