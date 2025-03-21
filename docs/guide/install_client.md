---
title: 安装客户端
---

# 安装客户端 (Client Installation)

本指南将介绍如何安装 SillyTavern-NewAge 扩展的客户端。为了方便非程序员用户，我们采用一种标准化的客户端分发方式。

## 客户端仓库结构

所有需要分发的客户端仓库都应遵循以下结构：

* **根目录:**  客户端仓库的根目录应为 `server` 文件夹。
* **客户端代码:**  客户端代码 (例如 HTML, JavaScript, CSS 文件) 应放置在 `server` 文件夹下的 `exampleClient` 或 `Client` 文件夹中。
* **客户端设置:**  客户端的 `settings.json` 文件应提前在 `server/settings` 文件夹中创建好 (参见 [设置](/guide/setting) 部分)。
* **客户端所需依赖:** 
  * 客户端所需的依赖库如果是纯浏览器环境的依赖，则可以直接放入`server/lib` 文件夹中，依赖的js文件最好是放在 `lib/<依赖库的名字>` 文件夹中。
  * 客户端所需的依赖库如果不适用于纯浏览器环境，即只能从 `node_modules` 中导入的依赖，则请一定要使用依赖库白名单中的依赖 (参见 [依赖白名单](../api/client/dependences_whiteList))。如果的确有你想要使用但不在名单上的依赖，则请联系我们。

**示例目录结构:**

```
server/
├── dist/          (服务器代码)
├── settings/
│   ├── server_settings.json
│   └── your_client_id.json  (您的客户端设置文件)
├── exampleClient/   (或 Client/)
│     └── your_client_name  (你的客户端名字)
│       ├── index.html      (客户端入口文件)
│       ├── script.js       (客户端脚本)
│       ├── style.css       (客户端样式)
│       └── dependences.txt (依赖名单)
├── package.json
├── server.js
└── ...
```

这种结构的好处：

* **统一性:**  所有客户端都遵循相同的结构，便于管理和维护。
* **易用性:**  非程序员用户只需下载整个 `server` 文件夹，即可获得服务器和客户端的所有必要文件。
* **预配置:**  客户端的 `settings.json` 文件已提前配置好，用户无需手动修改。

## 安装方法

有两种安装客户端的方法：

### 1. 手动安装 (推荐)

1. **下载:** 下载包含客户端的 `server` 文件夹 (通常是一个 ZIP 压缩包)。
2. **解压:** 将 `server` 文件夹解压到您希望安装客户端的位置。
3. **启动服务器:**  按照 [快速开始](/guide/getting-started) 中的说明启动服务器。
4. **访问客户端:**  在浏览器中访问客户端的 URL (客户端作者提供的示例URL，请根据你的服务器端口进行实际的的访问)。

### 2. 通过服务器前端安装 (TODO)

> [!NOTE]
> 此功能尚未实现。未来可能会提供一个服务器前端界面，允许用户直接从服务器安装和管理客户端。

## 注意事项

* 确保客户端的 `settings.json` 文件已正确配置，并且 `clientId` 与客户端代码中使用的 `clientId` 一致。
* 如果客户端代码有任何依赖项 (例如 JavaScript 库)，请确保这些依赖项已正确安装或包含在客户端文件夹中。
