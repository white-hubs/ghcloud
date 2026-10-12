import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const viewport = {
  content: "width=device-width, initial-scale=1.0, user-scalable=no"
}

const router = new Router({
  mode: 'history',
  base: '/apps-legacy/stream-engine-config',
  routes: [
    // {
    //   path: '/',
    //   redirect: '/index'
    // },
    {
      path: '/',
      redirect: '/flowform'
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/login/Index.vue"),
      meta: {title: '登录页', viewport: viewport}
    },
    {
      path: "/index",
      name: "index",
      component: () => import("@/views/Index.vue"),
      meta: {title: 'OA工作流', viewport: viewport}
    },
    {
      path: "/workspace",
      name: "workspace",
      component: () => import("@/views/workspace/WorkSpace.vue"),
      meta: {title: '工作区', viewport: viewport}
    },
    {
      path: "/formsPanel",
      name: "formsPanel",
      component: () => import("@/views/admin/FormsPanel.vue"),
      meta: {title: '表单列表', viewport: viewport}
    },
    {
      path: "/flowform",
      name: "flowform",
      component: () => import("@/views/flowform/Index.vue"),
      meta: {title: '表单管理', viewport: viewport}
    },
    {
      path: "/flowformDetail",
      name: "flowformDetail",
      component: () => import("@/views/flowform/detail.vue"),
      meta: {title: '发起表单', viewport: viewport}
    },
    {
      path: "/flowformHandle",
      name: "flowformHandle",
      component: () => import("@/views/flowform/handle.vue"),
      meta: {title: '处理表单', viewport: viewport}
    },
    {
      path: "/admin/design",
      name: "design",
      component: () => import("@/views/admin/FormProcessDesign.vue"),
      meta: {title: '表单流程设计', viewport: viewport}
   /*   children: [
        {
          path: "baseSetting",
          name: "baseSetting",
          component: () => import("@/views/admin/layout/FormBaseSetting.vue"),
          meta: {title: '基础设置'}
        }, {
          path: "formSetting",
          name: "formSetting",
          component: () => import("@/views/admin/layout/FormDesign.vue"),
          meta: {title: '表单设计'}
        }, {
          path: "processDesign",
          name: "processDesign",
          component: () => import("@/views/admin/layout/ProcessDesign.vue"),
          meta: {title: '流程设计'}
        }, {
          path: "proSetting",
          name: "proSetting",
          component: () => import("@/views/admin/layout/FormProSetting.vue"),
          meta: {title: '高级设置'}
        }
      ]*/
    }
  ]
})

router.beforeEach((to, from, next) => {
  next();
  sessionStorage.setItem('router-path', to.path)
})

export default router;
