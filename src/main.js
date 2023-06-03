import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

import App from "./App.vue";

//const Login = () => import(/* webpackChunkName: "login" */ "./components/Login");

const app = createApp(App);

/* CONFIGS */
app.config.globalProperties.$dados = {};

/* VUE ROUTER */
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "home",
            components: {
                //Screen: Feed,
            }
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: () => {
                return { path: '/', query: null }
            },
        }
    ],
});

app.use(router);
router.isReady().then(() => app.mount("#app"));