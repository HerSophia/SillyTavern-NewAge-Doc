import DefaultTheme from 'vitepress/theme';
import SwiperComponent from './components/SwiperComponent.vue';
import HeroBackground from './components/HeroBackground.vue';
import Typewriter from './components/Typewriter.vue'; 
import ConnectFlowchart from './components/ConnectFlowchart.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('SwiperComponent', SwiperComponent);
    app.component('HeroBackground', HeroBackground);
    app.component('Typewriter', Typewriter); 
    app.component('ConnectFlowchart', ConnectFlowchart);
  },
};