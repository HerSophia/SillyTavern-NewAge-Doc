export default {
  title: 'NewAge',
  description: '基于 Socket.IO 的双向通信扩展',

  base: '/SillyTavern-NewAge-Doc/',

  themeConfig: {
    logo: '/logo1.png',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '开发文档', link: '/api/' },
      { text: 'Changelog', link: '/changelog' },
      { text: '案例', link: '/use-cases' },
      { text: 'GitHub', link: 'https://github.com/HerSophia/SillyTavern-NewAge' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装', link: '/guide/installation' },
            { text: '连接', link: '/guide/connect' },
            { text: '设置', link: '/guide/setting' },
            { text: '安装客户端', link: '/guide/install_client' },
            // ... 其他指南页面
          ],
        },
      ],
      '/api/': [
        {
          text: '开发文档',
          items: [{ text: '总览', link: '/api/' }], // 保留 API 总览
        },
        {
          text: '扩展 (Extension)',
          collapsible: true, // 可折叠
          collapsed: false, // 默认展开
          items: [
            // 扩展相关的 API 页面
            { text: '扩展 API 1', link: '/api/extension/api1' },
            { text: '扩展 API 2', link: '/api/extension/api2' },
          ],
        },
        {
          text: '服务器 (Server)',
          collapsible: true,
          collapsed: false,
          items: [
            // 服务器相关的 API 页面
            { text: '服务器总览', link: '/api/server/index' },
            { text: '命名空间和响应事件', link: '/api/server/namespace-events' },
            { text: '消息格式', link: '/api/server/messageFormats' },
            { text: '认证和授权', link: '/api/server/authentication-and-authorization' },
            { text: '聊天系统', link: '/api/server/chat-system' },
            { text: '消息传输', link: '/api/server/data-transmission' },
            { text: '函数调用', link: '/api/server/function-call' },
            { text: '客户端管理', link: '/api/server/client-management' },
            { text: '房间管理', link: '/api/server/room-management' },
            { text: '日志管理', link: '/api/server/log' },
          ],
        },
        {
          text: '客户端 (Client)',
          collapsible: true,
          collapsed: false,
          items: [
            // 客户端相关的 API 页面
            { text: '快速开始(客户端)', link: '/api/client/getting-started' },
            { text: '依赖库白名单', link: '/api/client/dependences_whiteList' },
            { text: '约定俗成', link: '/api/client/customary-convention' },
            { text: '通用事件', link: '/api/client/common-events' },
            { text: 'LLM交互', link: '/api/client/llm-interaction' },
            { text: '函数调用', link: '/api/client/function-call' },
            { text: '最佳实践', link: '/api/client/best-practices' },
          ],
        },
      ],
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present HerSophia',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HerSophia' },
      { icon: 'discord', link: 'https://discord.gg/Yyegdmq3' },
    ],

    head: [
      ['link', { rel: 'stylesheet', href: '/custom.css' }],
      ['link', { rel: 'icon', href: '/SillyTavern-NewAge-Doc/favicon.ico' }],
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
        },
      ],
    ],
    search: {
      provider: 'local',
      options: {
        detailedView: true, // 显示详细的搜索结果 (包括匹配的内容片段)
      },
    },
  },

  ignoreDeadLinks: true,

  // ... 其他配置
};