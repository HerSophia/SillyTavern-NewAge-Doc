---
title: 连接
---

# 连接 (Connect)

本指南将详细介绍 SillyTavern-NewAge 扩展如何与服务器建立连接。

## 连接界面 (UI)

* **未连接状态 :**
  * 当 SillyTavern 扩展未连接到服务器时，会显示一个连接界面。
  * 此界面包含以下元素：
    * **服务器端口 (Server Port):** 输入框，默认值为 `4000`。
    * **服务器地址 (Server Address):** 输入框，默认值为 `http://localhost`。
    * **记住我 (Remember Me):** 复选框，用于记住连接设置。
    * **连接 (Connect) 按钮**: 点击后尝试连接到服务器。

    > [!NOTE]
    > 此处应插入图一 (连接界面截图)
    > `![连接界面](placeholder_connect_ui.png)`  <!-- 占位符 -->

* **已连接状态 :**
  * 连接成功后，扩展界面会显示已连接状态，并提供一些额外的功能。
    * **设置 (Settings) 区域：**
      -    **扩展ID (Extension ID):** 显示当前扩展的唯一标识符。
      -    **扩展端口 (Extension Port):** 显示扩展使用的端口。
      -    **服务器端口 (Server Port):** 显示服务器端口。
      -   **服务器地址 (Server Address):** 显示服务器地址。
      -   **网络安全模式（Web Security Mode）**: 开启后，扩展会让服务器跳过严格的客户端验证流程。默认开启，因为通常而言本地客户端与服务器是同域。
      -   **服务器房间管理（未完成）**：管理已经建立的连接房间。

    * **功能 (Function) 区域:**
      - **默认转发行为（Forwarding Behavior）**：控制扩展转发信息的行为。

    * **日志 (Logs) 区域:**
      - 显示连接状态、错误信息等日志。

    > [!NOTE]
    > 此处应插入图二 (已连接 - 设置)
    > `![已连接 - 设置](placeholder_connected_settings.png)`  <!-- 占位符 -->

    > [!NOTE]
    > 此处应插入图三 (已连接 - 日志)
    > `![已连接 - 日志](placeholder_connected_logs.png)`  <!-- 占位符 -->

## 连接流程 (Flow)

下面是 SillyTavern 扩展与服务器建立连接的详细流程：

<ConnectFlowchart />


## 进阶

- **命名空间 (Namespaces):**
  * Socket.IO 支持命名空间，允许您在单个共享连接上创建多个虚拟连接。
  * 扩展会使用命名空间来隔离不同类型的消息或功能。

- **事件 (Events):**
  * Socket.IO 使用事件驱动的通信模型。
  * 客户端和服务器可以监听和触发自定义事件，以实现双向通信。

- **安全性 (Security):**
  * 如果启用了“网络安全模式”，扩展会让服务器跳过严格的客户端验证流程。
