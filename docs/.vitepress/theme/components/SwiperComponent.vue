<template>
  <div class="features-container">
    <Swiper
      class="swiper-container"
      :modules="modules"
      :space-between="16"
      :slides-per-view="1"
      :loop="true"
      :autoplay="{ delay: 3000, disableOnInteraction: false }"
      :pagination="{ clickable: true }"
      :breakpoints="{
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }"
    >
      <SwiperSlide v-for="(feature, index) in features" :key="index" class="feature-card">
        <div class="icon">{{ feature.icon }}</div>
        <div class="title">{{ feature.title }}</div>
        <div class="details">{{ feature.details }}</div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination'; // 引入分页器样式

export default {
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      modules: [Autoplay, Pagination],
      features: [
        {
          icon: '🔗',
          title: '双向通信',
          details: '基于 Socket.IO，实现 SillyTavern 与外部世界的稳定、可靠、安全连接。',
        },
        {
          icon: '⚡',
          title: '实时互动',
          details: '支持流式和非流式消息传输，自定义消息类型和事件，打造流畅的交互体验。',
        },
        {
          icon: '🛡️',
          title: '安全可靠',
          details: '客户端密钥认证，基于角色的权限控制，保障通信安全。',
        },
        {
          icon: '🧰',
          title: 'Function Calling',
          details: '支持服务器和 SillyTavern 扩展双向调用已注册函数，扩展无限可能。',
        },
        {
          icon: '🚀',
          title: '深度集成',
          details: '通过前端助手，与 SillyTavern 的事件、消息、生成等功能深度集成。',
        },
        {
          icon: '🧩',
          title: '多实例支持',
          details: '支持多个 SillyTavern 实例连接到同一服务器，实现数据共享和协作。',
        },
      ],
    };
  },
};
</script>

<style scoped>
/* 整体布局 */
.features-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 2rem 0;
}

/* Swiper 容器 */
.swiper-container {
  width: 80%;
  height: 200px; /* 调整容器高度 */
}

/* 卡片样式 (白天模式) */
.feature-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease; /* 添加颜色过渡 */
  height: 85%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card .icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #3498db; /* 白天模式图标颜色 */
  transition: color 0.3s ease; /* 添加颜色过渡 */
}

.feature-card .title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #333; /* 白天模式标题颜色 */
  transition: color 0.3s ease; /* 添加颜色过渡 */
}

.feature-card .details {
  color: #666; /* 白天模式描述颜色 */
  flex: 1;
  transition: color 0.3s ease; /* 添加颜色过渡 */
}

/* 卡片样式 (夜间模式) */
.dark .feature-card {
  background-color: #2c3e50; /* 夜间模式背景颜色 */
  border-color: #445a6f; /* 夜间模式边框颜色 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* 夜间模式阴影 */
}

.dark .feature-card .icon {
  color: #f39c12; /* 夜间模式图标颜色 */
}

.dark .feature-card .title {
  color: #ecf0f1; /* 夜间模式标题颜色 */
}

.dark .feature-card .details {
  color: #bdc3c7; /* 夜间模式描述颜色 */
}

/* 分页器样式 (白天模式) */
.swiper-pagination-bullet {
  background-color: #ccc;
  opacity: 0.8;
  width: 8px;
  height: 8px;
  margin: 0 5px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.swiper-pagination-bullet-active {
  background-color: #3498db;
}

/* 分页器样式 (夜间模式) */
.dark .swiper-pagination-bullet {
  background-color: #ffffff;
}

.dark .swiper-pagination-bullet-active {
  background-color: #f39c12;
}
</style>