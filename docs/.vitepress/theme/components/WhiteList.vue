<template>
  <div class="table-container">
    <el-table :data="dependencies" style="width: 100%">
      <el-table-column prop="name" label="库名" min-width="180" />
      <el-table-column prop="version" label="版本" min-width="120" />
      <el-table-column prop="stack" label="技术栈" min-width="120" />
      <el-table-column prop="category" label="类别" min-width="150" />
      <el-table-column prop="description" label="简介" />
    </el-table>
  </div>
</template>

<script>
import { ref } from 'vue';
// 引入element-plus的table组件
import { ElTable, ElTableColumn } from 'element-plus';
//如果全局引入了,则不需要import

export default {
  name: 'WhiteList',
  components: {
    ElTable,
    ElTableColumn,
  },
  setup() {
    const dependencies = ref([
      {
        name: '@fortawesome/fontawesome-svg-core',
        version: '^6.7.2',
        stack: '原生JS/Vue/React',
        category: '图标库',
        description: 'Font Awesome 的核心 SVG 库，提供图标的渲染和管理功能。',
      },
      {
        name: '@fortawesome/free-solid-svg-icons',
        version: '^6.7.2',
        stack: '原生JS/Vue/React',
        category: '图标库',
        description: 'Font Awesome 的免费实心图标集。',
      },
      {
        name: '@fortawesome/vue-fontawesome',
        version: '^3.0.8',
        stack: 'Vue',
        category: '图标库',
        description: 'Font Awesome 的 Vue.js 组件，方便在 Vue 项目中使用图标。',
      },
      {
        name: 'axios',
        version: '^1.8.3',
        stack: '原生JS/Vue/React',
        category: 'HTTP 请求',
        description: '基于 Promise 的 HTTP 客户端，用于浏览器和 Node.js 环境，进行 HTTP 请求。',
      },
      {
        name: 'element-plus',
        version: '^2.9.6',
        stack: 'Vue',
        category: 'UI 框架/组件库',
        description: '基于 Vue.js 3 的桌面端组件库，提供丰富的 UI 组件。',
      },
      {
        name: 'react',
        version: '^19.0.0',
        stack: 'React',
        category: 'UI 框架/组件库',
        description: '用于构建用户界面的 JavaScript 库。',
      },
      {
        name: 'react-dom',
        version: '^19.0.0',
        stack: 'React',
        category: 'UI 框架/组件库',
        description: 'React 的 DOM 渲染器，用于将 React 组件渲染到浏览器 DOM 中。',
      },
      {
        name: 'styled-components',
        version: '^6.1.15',
        stack: 'React',
        category: 'UI 框架/组件库',
        description: '用于 React 和 React Native 的 CSS-in-JS 库，允许您使用标记模板字面量或对象来为组件编写样式。',
      },
      {
        name: 'pinia',
        version: '^3.0.1',
        stack: 'Vue',
        category: '状态管理',
        description: 'Vue.js 的状态管理库，类似于 Vuex，但更轻量、更易用。',
      },
      {
        name: 'lodash',
        version: '^4.17.21',
        stack: '原生JS/Vue/React',
        category: '实用工具',
        description: '提供各种实用函数的 JavaScript 工具库，如数组、对象、字符串处理等。',
      },
      {
        name: 'dayjs',
        version: '^1.11.13',
        stack: '原生JS/Vue/React',
        category: '实用工具',
        description: '轻量级的 JavaScript 日期处理库，类似于 Moment.js，但更小巧。',
      },
      {
        name: 'simple-git',
        version: '^3.27.0',
        stack: 'Node.js',
        category: '实用工具',
        description: '轻量级的 Git 命令行工具接口，方便在 Node.js 项目中执行 Git 命令。',
      },
      {
        name: 'express',
        version: '^4.21.2',
        stack: 'Node.js',
        category: 'Node.js 框架',
        description: '流行的 Node.js Web 应用程序框架，用于构建 Web 应用和 API。',
      },
      {
        name: 'serve-static',
        version: '^1.16.2',
        stack: 'Node.js',
        category: '静态资源服务',
        description: 'Express 的中间件，用于提供静态文件服务（如 HTML、CSS、JavaScript 文件）。',
      },
      {
        name: 'socket.io',
        version: '^4.0.0',
        stack: '原生JS/Vue/React',
        category: '实时通信',
        description: '实现客户端和服务器之间双向、实时通信的库。',
      },
      {
        name: '@sap_oss/node-socketio-stream',
        version: '^1.0.8',
        stack: 'Node.js',
        category: '实时通信',
        description: '在服务器端为 Socket.IO 提供流支持的库。',
      },
      {
        name: 'bcryptjs',
        version: '^3.0.2',
        stack: 'Node.js',
        category: '安全性',
        description: '用于密码哈希加密的库，提高密码安全性。',
      },
      {
        name: 'dotenv',
        version: '^16.4.7',
        stack: 'Node.js',
        category: '环境变量',
        description: '将环境变量从 .env 文件加载到 process.env 中，方便配置管理。',
      },
      {
        name: 'winston',
        version: '^3.17.0',
        stack: 'Node.js',
        category: '日志记录',
        description: '通用的 JavaScript 日志库，支持多种日志级别和输出方式。',
      },
      {
        name: 'vitepress',
        version: '^1.6.3',
        stack: 'Vue',
        category: '文档工具',
        description: '基于 Vite 和 Vue.js 的静态站点生成器，用于快速构建文档站点。',
      },
      {
        name: 'uuid',
        version: '^9.0.0', // 假设的版本号
        stack: '原生JS/Vue/React',
        category: '实用工具',
        description: '用于生成 RFC4122 UUID 的库。',
      },
    ]);

    return {
      dependencies,
    };
  },
};
</script>

<style scoped>
.table-container {
  overflow-x: auto; /* 允许水平滚动 */
}

/* 媒体查询，针对小屏幕 */
@media (max-width: 768px) {
  .table-container {
    width: 100%; /* 小屏幕下容器宽度为100% */
  }
}
</style>