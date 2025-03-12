<template>
  <div class="floors-container">
    <div
      v-for="(floor, index) in floors"
      :key="index"
      class="floor"
      :class="[
        index % 2 === 0 ? 'floor-left' : 'floor-right',
        { 'floor-animated': isVisible },
      ]"
      :style="{ transitionDelay: `${index * 0.2}s` }"
    >
      <div class="floor-content">
        <h2 class="floor-title">{{ floor.title }}</h2>
        <p class="floor-description">{{ floor.description }}</p>
      </div>
      <div class="floor-image">
        <img v-if="floor.image" :src="floor.image" :alt="floor.title" />
        <font-awesome-icon
          v-else
          :icon="floor.icon || defaultIcon"
          class="default-icon"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    floors: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
      defaultIcon: "fa-solid fa-image", // 默认图标, 如果没有指定，就显示这个
    };
  },
  mounted() {
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  },
};
</script>

<style scoped>
.floors-container {
  width: 100%;
  padding: 20px;
  overflow: hidden;
}

.floor {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  opacity: 0;
  /* 移除 transform: translateY(-50px); */
  transition: transform 1s ease-out, opacity 1s ease-out;
}

.floor-left {
  flex-direction: row;
  transform: translateX(-100%); /* 从左侧滑入 */
}

.floor-right {
  flex-direction: row-reverse;
  transform: translateX(100%); /* 从右侧滑入 */
}

.floor-animated {
  opacity: 1;
  transform: translateX(0); /* 回到原位 */
}

.floor-content {
  flex: 1;
  padding: 20px;
}

.floor-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #7498e4;
}

.floor-description {
  font-size: 16px;
  line-height: 1.5;
}

.floor-image {
  width: 50%; /* 或根据需要调整 */
  padding: 20px;
}

.floor-image img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

.default-icon {
  font-size: 3em; /* 调整为你想要的大小 */
  color: #73b2fa;
}

/* 响应式设计 (可选) */
@media (max-width: 768px) {
  .floor {
    flex-direction: column !important;
  }

  .floor-image {
    width: 100%;
  }
}
</style>