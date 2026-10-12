<template>
  <SubMenu v-bind="$props" :key="route.path" :title="route.meta?.title">
    <template v-for="item in route.children">
      <template v-if="!item.children">
        <MenuItem v-if="!item.meta?.hide" :key="item.path" @click="goPath(item)">
          <component :is="item.meta?.icon" />
          <span>{{ item.meta?.title }}</span>
        </MenuItem>
      </template>
      <Menus v-else :route="item" />
    </template>
  </SubMenu>
</template>
<script lang="ts" setup>
import { type RouteRecordRaw, useRouter } from 'vue-router'
interface RouteMenusProps {
  route: RouteRecordRaw;
}
const router = useRouter()
const props = withDefaults(defineProps<RouteMenusProps>(), {})
const goPath = (data:RouteRecordRaw) => {
  router.push(data.path)
}

</script>
