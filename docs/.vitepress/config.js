export default {
  title: 'NewAge',
  description: '基于 Socket.IO 的双向通信扩展',

  base:'/SillyTavern-NewAge-Doc/',

  themeConfig: {
    logo: '/logo1.png',
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'GitHub', link: 'https://github.com/HerSophia/SillyTavern-NewAge' }
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
          ]
        }
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: '总览', link: '/api/' },
            { text: '模块 1', link: '/api/module1' },
            // ... 其他 API 页面
          ]
        }
      ]
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present HerSophia'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/HerSophia' },
      { icon: 'discord', link: 'https://discord.gg/vpw8hgF8CR' }
    ],

    head: [
      ['link', { rel: 'stylesheet', href: '/custom.css' }],
      ['link', { rel: 'icon', href: '/SillyTavern-NewAge-Doc/favicon.ico' }],
    ],
    search: {
      provider: 'local',
      options: {
        detailedView: true, // 显示详细的搜索结果 (包括匹配的内容片段)
      },
    }
  },

  // ... 其他配置
};