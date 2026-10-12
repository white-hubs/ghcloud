<template>
  <Menu v-model:selectedKeys="selectedKeys" :open-keys="openKeys" theme="dark" mode="inline">
    <template v-for="item in routes">
      <template v-if="!item.children">
        <MenuItem v-if="!item.meta?.hide" :key="item.path" @click="goPath(item)">
          <component :is="item.meta?.icon" />
          <span>{{ item.meta?.title }}</span>
        </MenuItem>
      </template>
      <menus v-else :route="item" />
    </template>
  </Menu>
</template>

<script setup lang="ts">
import { routes } from '@/router/index'
import { computed, ref, watch } from 'vue'
import { type RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import menus from './Menus.vue'

const route = useRoute()
const router = useRouter()

const goPath = (data:RouteRecordRaw) => {
  router.push(data.path)
}
/**
 * @description: 递归遍历查找路由数组对象的path
 * @param {string} code
 * @param {array} arr
 * @returns {object}
 */
const filterRoute = (path:string, arr:RouteRecordRaw[]) : any => {
  for (const item of arr) {
    if (item.path === path) return item
    if (item.children && item.children.length) {
      const _item = filterRoute(path, item.children)
      if (_item) return _item
    }
  }
}

// 选中当前路由对应的菜单
const selectedKeys = ref<string[]>(['/'])
watch(() => route.path, (val) => {
  // 找到当前的route信息
  const cur = filterRoute(val, routes)
  let selectKey = val
  if (cur) {
    if (cur.meta?.hide) {
      // 如果当前项不展示菜单，如详情页，默认展开项是path最后一个/
      const last = cur.path.lastIndexOf('/')
      selectKey = cur.path.substring(0, last)
    }
  }
  selectedKeys.value = [selectKey]
})
// 当前展开的菜单
const openKeys = computed(() => {
  // 找到当前的route信息
  const cur = filterRoute(route.path, routes)
  const pathArr = cur.path.split('/')

  let openKey = '/'
  if (pathArr.length > 2 && cur) {
    if (!cur.meta?.hide) {
      // 展开项为当前页面的父级，path的最后一个/
      const last = cur.path.lastIndexOf('/')
      openKey = cur.path.substring(0, last)
    } else {
      // 如果当前项不展示菜单，如详情页，默认展开项是path最后第二个/
      openKey = pathArr.slice(0, pathArr.length - 2).join('/')
    }
  }
  return [openKey]
})
</script>
