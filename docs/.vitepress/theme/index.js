import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import DefaultTheme from 'vitepress/theme';
import SwiperComponent from './components/SwiperComponent.vue';
import HeroBackground from './components/HeroBackground.vue';
import Typewriter from './components/Typewriter.vue'; 
import ConnectFlowchart from './components/ConnectFlowchart.vue';
import ClientWorkflow from './components/ClientWorkflow.vue';
import Floors from './components/Floors.vue';
import './custom.css'

import {
  faImage,
  faCode,
  faUsers,
  faServer,
  faGamepad,
  faChartBar,
  faArrowRight,
  faArrowLeft,
  faArrowsUpDown,
  faArrowsLeftRight,
  faCheck,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faCog,
  faWrench,
  faDownload,
  faUpload,
  faFile,
  faFolder,
  faEdit,
  faTrash,
  faPlus,
  faMinus,
  faLink,
  faUnlink,
  faLock,
  faUnlock,
  faUser,
  faUserPlus,
  faUserTimes,
  faKey,
  faEye,
  faEyeSlash,
  faSearch,
  faDesktop,
  faHome,
  faList,
  faTh,
  faTable,
  faCogs,
  faCloud,
  faDatabase,
  faTerminal,
  faRobot,
  faPuzzlePiece,
  faComments,
  faPaperPlane,
  faPlay,
  faPause,
  faStop,
  faForward,
  faBackward,
  faExpand,
  faCompress,
  faQuestionCircle,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faImage,
  faCode,
  faUsers,
  faServer,
  faGamepad,
  faChartBar,
  faArrowRight,
  faArrowLeft,
  faArrowsUpDown,
  faArrowsLeftRight,
  faCheck,
  faDesktop,
  faTimes,
  faExclamationTriangle,
  faInfoCircle,
  faCog,
  faWrench,
  faDownload,
  faUpload,
  faFile,
  faFolder,
  faEdit,
  faTrash,
  faPlus,
  faMinus,
  faLink,
  faUnlink,
  faLock,
  faUnlock,
  faUser,
  faUserPlus,
  faUserTimes,
  faKey,
  faEye,
  faEyeSlash,
  faSearch,
  faHome,
  faList,
  faTh,
  faTable,
  faCogs,
  faCloud,
  faDatabase,
  faTerminal,
  faRobot,
  faPuzzlePiece,
  faComments,
  faPaperPlane,
  faPlay,
  faPause,
  faStop,
  faForward,
  faBackward,
  faExpand,
  faCompress,
  faQuestionCircle,
  faChartLine
);

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('font-awesome-icon', FontAwesomeIcon);
    app.component('SwiperComponent', SwiperComponent);
    app.component('HeroBackground', HeroBackground);
    app.component('Typewriter', Typewriter); 
    app.component('ConnectFlowchart', ConnectFlowchart);
    app.component('ClientWorkflow', ClientWorkflow);
    app.component('Floors', Floors);
  },
};