---
title: 开发文档总览
---

# 总览

本节提供了 SillyTavern-NewAge 扩展的开发文档的总览。

## 概述

SillyTavern-NewAge 开发文档分为三个主要部分：

* **客户端:**  供希望与 SillyTavern-NewAge 服务器交互的**非 SillyTavern 扩展**客户端（例如独立的 Web 应用、桌面应用、移动应用）开发者使用。
* **扩展本体:** 供 SillyTavern 扩展开发者使用, 用于理解扩展端内部的工作原理。
* **服务器:** 供 SillyTavern-NewAge 服务器开发者和高级用户使用，用于理解服务器内部工作原理、进行高级配置或贡献代码。

## 客户端

允许非 SillyTavern 扩展的客户端连接到 SillyTavern-NewAge 服务器，并与 LLM 进行交互、调用函数等。

**主要内容:**

* [快速开始](/api/client/getting-started)
* [依赖白名单](/api/client/dependences_whiteList)
* [约定俗成](/api/client/customary-convention)
* [通用事件](/api/client/common-events)
* [LLM 交互](/api/client/llm-interaction)
* [函数调用](/api/client/function-call)
* [最佳实践](/api/client/best-practices)

## 扩展本体

> [!NOTE]
> 扩展开发文档亟待建设中。

允许开发者扩展 SillyTavern 的功能。

**主要内容 (待补充):**

* 扩展的生命周期
* 如何注册扩展
* 如何与服务器通信
* 如何与其他扩展交互
* 如何注册函数
* 如何处理 LLM 请求和响应
* ...

## 服务器

> [!NOTE]
> 服务器开发文档正在建设中。更新不一定很及时。

服务器开发文档主要供 SillyTavern-NewAge **内部团队的开发人员**和**想要贡献代码的开发者**参考。它详细介绍了服务器的内部工作原理、各个模块的功能以及如何进行高级配置。

**主要内容:**

* [服务器总览](/api/server/index)
* [命名空间和响应事件](/api/server/namespace-events)
* [消息格式](/api/server/messageFormats)
* [认证和授权](/api/server/authentication-and-authorization)
* [聊天系统](/api/server/chat-system)
* [消息传输](/api/server/data-transmission)
* [客户端管理](/api/server/function-call)
* [房间管理](/api/server/client-management)
* [函数调用机制](/api/server/room-management)
* [日志管理](/api/server/log)

## 注意事项

* 请注意区分客户端/扩展/服务器的概念
* 客户端指的是非 SillyTavern 扩展的客户端
* 扩展指的是 SillyTavern 扩展
* 在开发时，请务必参考`lib/constants.js`的内容，以确保消息类型和常量的正确性。
