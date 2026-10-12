import { createRouter, createWebHistory } from "vue-router";
import { getToken, storeToken } from "@/services/AccountService";

import Application from "./dataClass/index.js";
import platform from "@/views/platform/index.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/",
    component: () => import("@/views/platform/home.vue"),
    redirect: "/index",
    children: [
      {
        path: "/index",
        name: "Index",
        component: platform,
      },
      {
        path: "/about",
        name: "About",
        component: () => import("@/views/About.vue"),
        children: Application,
      },
    ],
  },
  {
    path: "/subpage",
    name: "subpage",
    component: () => import("@/views/subpage.vue"),
  },
  {
    path: "/portal:pathMatch(.*)",
    name: "portal",
    component: () => import("@/views/subpage.vue"),
  },
  {
    name: "404",
    path: "/404",
    component: () => import("@/views/Error/404.vue"),
  },
  {
    name: "401",
    path: "/401",
    component: () => import("@/views/Error/401.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  let token = await getToken();
  const params = window.location.href?.split("?")[1];
  if (params) {
    const res = params?.split("=");
    const index = res?.findIndex((item) => item === "token");
    if (index !== -1) {
      token = JSON.parse(res[index + 1]);
      storeToken(token);
    }
  }
  if (token && token.access_token) {
    next();
  } else {
    if (to.name === "Login") {
      next();
    } else {
      next({ path: "/login", replace: true });
    }
  }
});

export default router;
