---
title: 它能做什么？
aside: false
---

# 它能做什么

<Floors :floors="floorsData" />

<script setup>
import Floors from './.vitepress/theme/components/Floors.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const floorsData = [
  {
    title: '自定义前端',
    description:
      '创建完全自定义的 SillyTavern 客户端界面，突破内置 UI 的限制。例如，您可以创建一个具有独特布局、主题和交互方式的 Web 应用程序。',
    //image: '/images/custom-ui.png',
    icon: 'fas fa-desktop',
  },
  {
    title: '多客户端协作',
    description:
      '多个客户端可以同时连接到 SillyTavern，实现协同编辑、多用户聊天、共享状态等功能。',
    //image: '/images/multi-client.png',
    icon: 'fas fa-users',
  },
  {
    title: '集成外部服务',
    description:
      '将 SillyTavern 与外部服务集成，实现更复杂的功能。',
    //image: '/images/external-services.png',
    icon: 'fas fa-link',
  },
  {
    title: '自动化任务',
    description:
      '创建自动化脚本或机器人，与 SillyTavern 进行交互，执行特定任务。例如，您可以创建一个自动回复机器人，或一个根据特定条件触发动作的脚本。',
    //image: '/images/automation.png',
    icon: 'fas fa-robot',
  },
  {
    title: '游戏集成',
    description: '将 SillyTavern 集成到游戏中，为游戏角色提供 AI 驱动的对话能力。',
    //image: '/images/game-integration.png',
    icon: 'fas fa-gamepad',
  },
  {
    title: '数据分析与可视化',
    description:
      '收集 SillyTavern 的聊天数据，进行分析和可视化，以了解用户行为、评估模型性能等。',
    //image: '/images/data-analysis.png',
    icon: 'fas fa-chart-line',
  },
];
</script>