import type { RouteRecordRaw } from 'vue-router'

export const productManage: RouteRecordRaw[] = [
  {
    path: '/product-detail',
    name: 'ProductDetail',
    component: async () => (await import('@/views/product-manage/product-detail/product-detail')).ProductDetail
  },
  {
    path: '/product-list',
    name: 'ProductList',
    component: async () => (await import('@/views/product-manage/product-list/product-list')).ProductList
  },
  {
    path: '/product-add',
    name: 'ProductAdd',
    component: async () => (await import('@/views/product-manage/product-add/product-add')).ProductAdd
  },
  {
    path: '/product-update',
    name: 'ProductUpdate',
    component: async () => (await import('@/views/product-manage/product-update/product-update')).ProductUpdate
  },
  {
    path: '/product-category',
    name: 'productCategory',
    component: async () => (await import('@/views/product-manage/product-category/product-category')).ProductCategory
  },
  {
    path: '/product-brand',
    name: 'productBrand',
    component: async () => (await import('@/views/product-manage/product-brand/product-brand')).ProductBrand
  },
]
