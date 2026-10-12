<template lang="pug">
div(v-for="item in subMenu" :key="item.id")
    a-sub-menu(v-if="item.children&&item.children.length>0" :title="item.name" :key="item.id")
        menuSub(:subMenu="item.children")
    a-menu-item(v-else :key="item.id" @click="gotoPage(item)") {{item.name}}
</template>

<script lang='jsx'>
import { defineComponent, reactive, toRefs } from "vue";
export default defineComponent({
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
