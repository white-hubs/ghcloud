<template lang="pug">
.app-menu
  slot
  div.menu
    a-menu(mode="inline" :openKeys="openKeys" v-model:selectedKeys="selectedKeys" :inline-collapsed="false" @openChange="onOpenChange")
      template(v-for="item in menuList" :key="item.id")
        a-sub-menu(v-if="item.children&&item.children.length>0" :key="item.id" :title="item.name")
          menuSub(:subMenu="item.children" @gotoPage="goToPage")
        a-menu-item(v-else :key="item.id" @click="goToPage(item)") {{item.name}}
</template>
<script lang='jsx'>
import { defineComponent, onMounted, reactive, toRefs, watch } from "vue";
import { useRoute } from "vue-router";
import { treematch, getParentNode } from "@/utils/common";
export default defineComponent({
  props: {
    menuList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  emits: ["goto-page"],
  setup(props, { emit }) {
    const route = useRoute();
    const state = reactive({
      openKeys: [],
      selectedKeys: [],
    });
    onMounted(() => {
      getSelectedKeys();
      getOpenKeys();
    });
    const onOpenChange = (keys) => {
      state.openKeys = [keys.reverse()[0]];
    };
    const goToPage = (item) => {
      emit("goto-page", item);
    };
    const getSelectedKeys = () => {
      const matche = treematch(props.menuList, route.path, "path");
      if (matche) {
        state.selectedKeys = [matche.id];
      }
    };
    const getOpenKeys = () => {
      const keys = getParentNode(props.menuList, route.path, "path");
      if (keys && keys.length) {
        state.openKeys = keys;
      }
    };
    watch(
      () => route.path,
      () => {
        getSelectedKeys();
        getOpenKeys();
      }
    );
    watch(
      () => props.menuList,
      () => {
        getSelectedKeys();
        getOpenKeys();
      }
    );
    return {
      ...toRefs(state),
      onOpenChange,
      goToPage,
    };
  },
});
</script>

<style lang="less" scoped>
.app-menu {
  width: 200px;
  height: 100%;
  .menu {
    width: 100%;
    height: calc(100% - 45px);
    overflow-y: auto;
    &::-webkit-scrollbar {
      width: 0.16rem;
      // width: 0;
      background: rgba(117, 180, 253, 0.2);
      box-shadow: 0rem 0.01rem 0.01rem 0rem rgba(1, 69, 132, 0.5);
      border-radius: 0.08rem;
    }
    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: @blue;
      box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
    }
    /*滚动条的上下两端的按钮*/
    &::-webkit-scrollbar-button {
      height: 0px;
    }
  }
}
:deep(.ant-menu) {
  width: 100%;
  height: 100%;
}
</style>
