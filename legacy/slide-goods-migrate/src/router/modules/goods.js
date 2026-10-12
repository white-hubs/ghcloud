export default [
  {
    path: "/goodsList",
    name: "商品列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/goods/goodsList.vue"
      ),
    meta: {
      title: "商品列表",
      keepAlive: true,
    },
  },
  {
    path: "/goodsType",
    name: "商品品类",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/goods/goodsType.vue"
      ),
    meta: {
      title: "商品品类",
      keepAlive: true,
    },
  },
  {
    path: "/goodsUnit",
    name: "商品单位",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/goods/goodsUnit.vue"
      ),
    meta: {
      title: "商品单位",
      keepAlive: true,
    },
  },
  {
    path: "/saleStistics",
    name: "商品销售报表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/goods/saleStistics.vue"
      ),
    meta: {
      title: "商品销售报表",
      keepAlive: true,
    },
  },
  {
    path: "/logisticSet",
    name: "物流配置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/goods/logisticSet.vue"
      ),
    meta: {
      title: "物流配置",
      keepAlive: true,
    },
  },
];
