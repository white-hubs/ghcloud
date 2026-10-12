<template>
  <component :is="resolvedComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
}>()

//@ts-ignore
const components = import.meta.glob('~components/**/*.vue', { eager: true })

const componentMap: Record<string, any> = {}
for (const [path, mod] of Object.entries(components)) {
  const match = path.match(/\/([^/]+)\/([^/]+)\.vue$/)
  if (match) {
    const [, dirName] = match
    const name = dirName
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
    componentMap[name] = (mod as any).default
  }
}

// 使用 computed 而非 shallowRef：组件定义对象无法在 SSR 序列化中保留，
// computed 作为派生状态不会在 SSR 中序列化，客户端 hydration 时会重新计算。
const resolvedComponent = computed(() => componentMap[props.name])
</script>
