import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/product-brand",
    name: "product-brand",
    component: async () => (await import("@/views/product-brand/product-brand")).ProductBrand,
  },
  {
    path: "/product-category",
    name: "product-category",
    component: async () => (await import("@/views/product-category/product-category")).ProductCategory,
  },
  {
    path: "/product-list",
    name: "product-list",
    component: async () => (await import("@/views/product-list/product-list")).ProductList,
  },
  {
    path: "/product-update",
    name: "product-update",
    component: async () => (await import("@/views/product-update/product-update")).ProductUpdate,
  },
  {
    path: "/product-detail",
    name: "product-detail",
    component: async () => (await import("@/views/product-detail/product-detail")).ProductDetail,
  },
];
