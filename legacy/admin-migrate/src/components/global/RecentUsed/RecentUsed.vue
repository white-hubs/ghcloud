<template lang="pug">
div.RecentUse 
  div.modelTitle(v-if="title") {{title}}
  div.occupy(v-if="title")
  AppStyle(v-if="applData" :appList="applData" @go_page="goPage")   
  //- div.applInfo
    div.applName(v-for="item,index in applData" :key="item.key" @click="goPage(item)")
      div
        img(:src="icon[index]")
        div.name {{item.name}}
</template>

<script lang='jsx'>
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    title: {},
    appList: {
      type: Array,
    },
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();

    const state = reactive({
      applData: [],
    });
    const goPage = async (ele) => {
      // const menu = await proxy.$api.appMenu("get", ele.id);
      const menu = await proxy.$api.appMenu("get", ele.code);
      if (menu.length) {
        store.commit("menu/SET_MENU", JSON.stringify(menu));
        store.commit("menu/SET_APP", JSON.stringify(ele));
        router.push({ path: "/about" });
      } else {
        // proxy.$message.warn("当前应用未分配菜单");
      }
    };

    onMounted(() => {
      state.applData = props.appList;
    });

    watch(
      () => props.appList,
      (newVal) => {
      }
    );

    return {
      ...toRefs(state),
      goPage,
    };
  },
});
</script>

<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
.RecentUse {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: @white;
  // border-radius: 8px;
  box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);
  &::-webkit-scrollbar {
    width: 0.16rem;
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
  .modelTitle {
    width: 100%;
    color: #535b6c;
    text-align: left;
    font-size: 16px;
    font-family: "SourceHanSansCN-Medium-2";
    padding: 20px 20px 0;
    position: absolute;
    left: 0;
    background-color: @white;
  }
  .occupy {
    width: 100%;
    height: 60px;
    background: @white;
  }
  .applInfo {
    width: 100%;
    height: calc(100% - 100px);
    display: grid;
    @media (max-width: 1920px) {
      grid-template-columns: repeat(6, 13.3%);
      grid-column-gap: 24px;
      grid-row-gap: 24px;
    }
    @media (min-width: 1920px) {
      grid-template-columns: repeat(8, 10%);
      grid-column-gap: 24px;
      grid-row-gap: 24px;
    }
    grid-template-rows: repeat(auto-fill, 82px);
    justify-items: center;
    align-items: center;
    cursor: pointer;
    padding: 40px 20px;
  }
  .applName {
    width: 82px;
    height: 82px;
    background: @white;
    box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);
    border-radius: 6px;
    display: flex;
    align-items: center;
    > div {
      flex: 1;
      img {
        height: 36px;
        width: 36px;
      }
    }
    &:hover {
      transform: scale(1.1);
      box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.103);
    }
    .name {
      font-size: 14px;
      width: 100%;
      height: 20px;
      line-height: 20px;
      color: #535b6c;
      font-family: "SourceHanSansCN-Regular-2";
    }
  }
}
</style>
