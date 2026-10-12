<template>
  <template v-for="item in subMenu">
    <a-sub-menu v-if="item.children && item.children.length > 0" :title="item.name" :key="item.id">
      <menuSub :subMenu="item.children" @gotoPage="gotoPage"></menuSub>
    </a-sub-menu>
    <a-menu-item v-else :key="item.id+''" @click="gotoPage(item)">
      {{ item.name }}
    </a-menu-item>
  </template>
</template>

<script>
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
  name: 'menuSub',
  props: {
    subMenu: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  emits: ["goto-page"],
  setup(props, { emit }) {
    const state = reactive({});
    const gotoPage = (item) => {
      emit("goto-page", item);
    };
    return {
      ...toRefs(state),
      gotoPage,
    };
  },
});
</script>

<style></style>
