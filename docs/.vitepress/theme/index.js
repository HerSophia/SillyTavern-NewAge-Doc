import DefaultTheme from 'vitepress/theme';
import SwiperComponent from './components/SwiperComponent.vue';
import HeroBackground from './components/HeroBackground.vue';
import Typewriter from './components/Typewriter.vue'; 

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('SwiperComponent', SwiperComponent);
    app.component('HeroBackground', HeroBackground);
    app.component('Typewriter', Typewriter); // 注册
  },
};