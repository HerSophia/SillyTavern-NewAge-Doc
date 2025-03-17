---
title: 快速开始
---

# 快速开始 (Getting Started)

本指南将引导您快速设置并运行 SillyTavern-NewAge 扩展。

## 使用方法 (How to Use)

### 1. 安装扩展

- 在 SillyTavern 中，转到 **"扩展"** 面板。
- 点击 **"安装扩展"**。
- 输入本项目的 GitHub 仓库链接： `https://github.com/HerSophia/SillyTavern-NewAge`
- 点击 **"只为我安装"** 或者 **"为所有用户安装"**。

### 2. 安装依赖

- 找到 SillyTavern-NewAge 扩展的根目录下的 `server` 文件夹 (通常在 `SillyTavern/data/default_user/extensions/SillyTavern-NewAge/server`)。
  - 如果你单独下载了 `server` 文件夹，则进入该文件夹。
- 在该文件夹中打开命令行终端 (CMD 或 PowerShell)。
- 运行命令 `npm install` 安装 `package.json` 中指定的依赖。

### 3. 启动服务器

有两种方法可以启动服务器：

- **方法一 (推荐)**：
  - 确保您位于 `server` 文件夹中 (请参阅上一步)。
  - 在命令行终端中运行 `node server.js` 启动服务器。

- **方法二**：
  - 确保您位于 `server` 文件夹中 (请参阅上一步)。
  - 在命令行终端中运行 `$env:DEBUG='engine,socket.io*'; node server.js`，以启动DEBUG模式。

### 4. 连接

- 刷新 SillyTavern 页面。扩展应该会自动连接到服务器（默认地址为 `http://localhost:4000`）。
- 如果自动连接失败，可以在扩展的设置界面手动输入服务器地址和端口，然后点击 **"连接"**。

## 疑难解答

- **服务器无法启动？**
  - 确保您已正确安装 Node.js。
  - 确保您已在 `server` 文件夹中运行了 `npm install`。
  - 检查是否有其他程序占用了 4000 端口。

- **扩展无法连接？**
  - 确保服务器已启动。
  - 检查服务器地址和端口是否正确。
  - 尝试关闭防火墙或安全软件，看看是否阻止了连接。

- **SillyTavern端口问题？**
  - 如果你的端口不是默认的 `8000` ，则请在/server/settings文件夹中复制一份 `SillyTavern-8000-settings.json` 并重命名。
  - 重命名的格式为 `SillyTavern-<你自定义的端口>-settings` ，`<你自定义的端口>` 指的就是SillyTavern运行的端口。
  - 随后，在新的这一份JSON文件中，修改 `clientId` 的值，与你的端口一致
  - `sillyTavernPassWord` 的值可直接设置为你想要的密码，默认密码是经过哈希的，你设置新的密码后再启动服务器，服务器自动哈希你的密码，所以请记住你的密码。

- **出现其他问题？**
  - 请查看本项目的GitHub仓库中的[issue](https://github.com/HerSophia/SillyTavern-NewAge/issues)部分，查看是否有人遇到相似的问题。

## 下一步

现在您已经成功运行了 SillyTavern-NewAge 扩展，接下来可以：

- 探索扩展的各项功能。
- 阅读[安装](/guide/installation)指南以了解更详细的安装步骤。
- 查看 [API 文档](/api/) 了解如何与其他程序进行交互。
