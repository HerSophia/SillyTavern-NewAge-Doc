<template>
  <div class="typewriter-container">
    <TypedComponent :options="typedOptions">
      <span class="typing" />
    </TypedComponent>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { TypedComponent } from 'typed-vue3';

const props = defineProps({
  strings: {
    type: Array,
    required: true,
  },
  typeSpeed: {
    type: Number,
    default: 50,
  },
  backSpeed: {
    type: Number,
    default: 30,
  },
  startDelay: {
    type: Number,
    default: 500,
  },
  backDelay: {
    type: Number,
    default: 1500,
  },
  loop: {
    type: Boolean,
    default: true,
  },
});

const typing = ref(true);

const typedOptions = ref({
    strings: props.strings,
    typeSpeed: props.typeSpeed,
    backSpeed: props.backSpeed,
    startDelay: props.startDelay,
    backDelay: props.backDelay,
    loop: props.loop,
    preStringTyped: () => {
        typing.value = true;
    },
    onComplete: () => {
        typing.value = false;
    },
});

// 监听 props 变化，更新 typedOptions
watch(() => props, (newProps) => {
  typedOptions.value.strings = newProps.strings;
  typedOptions.value.typeSpeed = newProps.typeSpeed;
  typedOptions.value.backSpeed = newProps.backSpeed;
  typedOptions.value.startDelay = newProps.startDelay;
  typedOptions.value.backDelay = newProps.backDelay;
  typedOptions.value.loop = newProps.loop;
  
}, { deep: true });


</script>

<style scoped>
.typewriter-container {
  font-size: 1.0rem;
  color: #989898;
  margin-top: 0.5rem;
  text-align: left;
}

/* 媒体查询：当页面宽度小于 960px 时 */
@media (max-width: 960px) {
  .typewriter-container {
    text-align: center; /* 居中对齐 */
  }
}
</style>