// import VuePrism from "@/plugin/"
import Vue3Prism from "@/custom/Vue3Prism.vue";

Vue3Prism.install = app => app.component(Vue3Prism.name, Vue3Prism);

export default Vue3Prism