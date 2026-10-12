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
<script>
import { computed, defineComponent } from "vue";
export default defineComponent({
  name: "PopOver",
  props: {
    content: {
      type: [String, Array, Number],
      default: () => {
        return "无内容";
      },
    },
    position: {
      type: String,
      default: () => {
        return "top";
      },
    },
    title: {
      type: String,
      default: () => {
        return "";
      },
    },
    method: {
      type: String,
      default: () => {
        return "hover";
      },
    },
    label: {
      type: String,
      default: () => {
        return "name";
      },
    },
  },
  setup(props) {
    const isArray = computed(() => Array.isArray(props.content));
    const displayContent = computed(() => {
      const value = props.content;
      if (value === null || value === undefined || value === "") {
        return "无内容";
      }
      return value;
    });
    const isObjectItem = (item) => typeof item === "object" && item !== null;
    return {
      isArray,
      displayContent,
      isObjectItem,
    };
  },
});
</script>
<style lang="less" scoped></style>
