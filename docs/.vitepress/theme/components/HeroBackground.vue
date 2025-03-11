<template>
  <div ref="bgContainer" class="hero-bg-container" id="tsparticles"></div>
</template>

<script>
/*
import { onMounted, onUnmounted, ref } from 'vue';
import { tsParticles } from 'tsparticles';
import { loadFull } from 'tsparticles';

export default {
  setup() {
    const bgContainer = ref(null);
    let particlesInstance = null;

    onMounted(async () => {
      await loadFull(tsParticles); // 加载 tsparticles 引擎

      particlesInstance = await tsParticles.load('tsparticles', {
        fullScreen: {
          enable: false,
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: {
              enable: false,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: "#3CB2BE",
          },
          links: {
            color: "#3CB2BE",
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 50,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      });
    });

    onUnmounted(() => {
      if (particlesInstance) {
        particlesInstance.destroy(); // 销毁 tsparticles 实例
        particlesInstance = null;
      }
    });

    return {
      bgContainer,
    };
  },
};
*/
</script>

<style scoped>
.hero-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}
</style>