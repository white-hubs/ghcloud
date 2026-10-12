import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: "/dept",
    name: "dept",
    component: () => import("@/views/department/dept.vue"),
    meta: {
      title: "部门管理",
    },
  },
  {
    path: "/dept/editDept",
    name: "editDept",
    component: () => import("@/views/department/edit.vue"),
    meta: {
      title: "部门编辑",
    },
  },
  {
    path: "/person",
    name: "person",
    component: () => import("@/views/personnel/person.vue"),
    meta: {
      title: "人员管理",
    },
  },
  {
    path: "/person/editPerson",
    name: "editPerson",
    component: () => import("@/views/personnel/editPerson.vue"),
    meta: {
      title: "人员编辑",
    },
  },
  {
    path: "/post",
    name: "post",
    component: () => import("@/views/post/post.vue"),
    meta: {
      title: "职位管理",
    },
  },
  {
    path: "/appointment",
    name: "appointment",
    component: () => import("@/views/appointment/appointment.vue"),
    meta: {
      title: "岗位管理",
    },
  },
  {
    path: "/gear",
    name: "gear",
    component: () => import("@/views/gear/gear.vue"),
    meta: {
      title: "档位管理",
    },
  },
  {
    path: "/role",
    name: "role",
    component: () => import("@/views/role/role.vue"),
    meta: {
      title: "角色管理",
    },
  },
  {
    path: "/rolePermission",
    name: "rolePermission",
    component: () => import("@/views/authority/authority.vue"),
    meta: {
      title: "角色权限",
    },
  },
  {
    path: "/authority",
    name: "authority",
    component: () => import("@/views/authority/authority.vue"),
    meta: {
      title: "产品权限",
    },
  },
  {
    path: "/product",
    name: "product",
    component: () => import("@/views/authority/product.vue"),
    meta: {
      title: "权限管理",
    },
  },
  {
    path: "/myBusiness",
    name: "myBusiness",
    component: () => import("@/views/businessInfo/myBusiness.vue"),
    meta: {
      title: "我的企业",
    },
  },
  {
    path: "/businessInfoOperate",
    name: "businessInfoOperate",
    component: () => import("@/views/businessInfo/businessInfoOperate.vue"),
    meta: {
      title: "编辑企业信息",
    },
  },
  {
    path: "/role-feature-permissions",
    name: "featurePermissions",
    component: () => import("@/views/role/feature-permissions.vue"),
    meta: {
      title: "功能权限",
    },
  },
  {
    path: "/role-data-permissions",
    name: "dataPermissions",
    component: () => import("@/views/role/data-permissions.vue"),
    meta: {
      title: "数据权限",
    },
  },
  {
    path: "/auth-manage",
    name: "authManage",
    component: () => import("@/views/auth-manage/auth-manage.vue"),
  },
  {
    path: "/auth-manage-edit",
    name: "authManageEdit",
    component: () => import("@/views/auth-manage/auth-manage-edit.vue"),
  },
  {
    path: "/user-list",
    name: "user-list",
    component: () => import("@/views/user-list/user-list.vue"),
  },
  {
    path: "/field-config",
    name: "field-config",
    component: () => import("@/views/field-config/field-config.vue"),
  },
]

export default routes
