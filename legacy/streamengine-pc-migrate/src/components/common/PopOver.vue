<template>
  <a-popover
    v-if="!isArray"
    :title="title || undefined"
    :trigger="method"
    :placement="position"
    :autoAdjustOverflow="true"
  >
    <template #content>
      <span>{{ displayContent }}</span>
    </template>
    <slot />
  </a-popover>
  <a-popover
    v-else
    :title="title || undefined"
    :trigger="method"
    :placement="position"
    :autoAdjustOverflow="true"
  >
    <template #content>
      <div v-for="(item, index) in content" :key="index">
        <span v-if="isObjectItem(item)">{{ item[label] }}</span>
        <div v-else>{{ item }}</div>
      </div>
    </template>
    <slot />
  </a-popover>
</template>
<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    content?: string | unknown[] | number;
    position?: string;
    title?: string;
    method?: string;
    label?: string;
  }>(),
  {
    content: () => "无内容",
    position: "top",
    title: "",
    method: "hover",
    label: "name",
  }
);

const isArray = computed(() => Array.isArray(props.content));
const displayContent = computed(() => {
  const value = props.content;
  if (value === null || value === undefined || value === "") {
    return "无内容";
  }
  return value;
});
const isObjectItem = (item: unknown) => typeof item === "object" && item !== null;
</script>
<style lang="less" scoped></style>
