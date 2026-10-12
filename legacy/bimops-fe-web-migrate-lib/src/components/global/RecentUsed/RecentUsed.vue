<template lang="pug">
div.RecentUse 
  div.modelTitle(v-if="title") {{title}}
  div.occupy(v-if="title")
  AppStyle(v-if="applications.length" :appList="appData" @go_page="goPage" :recentUsed="true") 
  a-empty(v-else description="暂无数据")
</template>

<script>
import {
defineComponent, getCurrentInstance,
onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    title: {},
    applications: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const store = useStore();
    const state = reactive({});

    const appData = ref([]);

    const goPage = async (ele) => {
      store.commit("menu/SET_APPLICATION", ele);
      const data = await proxy.$api.getApplicationInMenus(
        {
          applicationCode: ele.code,
        },
        "get"
      );
      if (data && data.length) {
        store.commit("menu/SET_MENU", data);
        router.replace({
          path: "/about",
        });
      } else if (!data.length) {
        proxy.$message.error("该应用下未分配菜单");
      }
    };

    const getWinWidth = async () => {
      const width = document.body.clientWidth;
      const baseData = _.cloneDeep(props.applications);
      if (width < 1366) {
        await baseData.splice(8);
      } else {
        await baseData.splice(12);
      }
      appData.value = baseData;
    };

    onMounted(() => {
      getWinWidth();
      window.onresize = () => {
        getWinWidth();
      };
    });

    watch(
      () => props.applications,
      (n) => {
        getWinWidth();
      }
    );

    return {
      appData,
      ...toRefs(state),
      goPage,
    };
  },
});
</script>

<style lang="less" scoped>
// @import url("~@/styles/theme/color.less");;
.RecentUse {
  width: 100%;
  height: 100%;
  // overflow-y: auto;
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
    box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
  }
  /*滚动条的上下两端的按钮*/
  &::-webkit-scrollbar-button {
    height: 0px;
  }
  .modelTitle {
    width: 100%;
    height: 50px;
    line-height: 50px;
    color: #535b6c;
    text-align: left;
    font-size: 16px;
    font-family: "SourceHanSansCN-Medium-2";
    padding: 0 20px;
    position: absolute;
    left: 0;
    z-index: 10;
    background-color: @white;
    z-index: 2;
  }
  .occupy {
    width: 100%;
    height: 60px;
    background: @white;
  }
  .applInfo {
    width: 100%;
    height: calc(100% - 60px);
    display: grid;
    // overflow-y: auto;
    @media (max-width: 1366px) {
      grid-template-columns: repeat(4, 1fr);
      grid-column-gap: 24px;
      grid-row-gap: 24px;
    }
    @media (min-width: 1366px) {
      grid-template-columns: repeat(6, 1fr);
      grid-column-gap: 24px;
      grid-row-gap: 24px;
    }

    grid-template-rows: repeat(2, 126px);
    justify-items: center;
    align-items: center;
    cursor: pointer;
    padding: 20px;
  }
  // .applName {
  //   width: 82px;
  //   height: 120px;
  //   background: @white;
  //   border-radius: 24px 24px 0 0;
  //   overflow: hidden;
  //   > div {
  //     flex: 1;
  //   }
  //   // &:hover .imgCtr {
  //   //   // transform: scale(1.1);
  //   //   box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.103);
  //   // }
  //   .name {
  //     font-size: 14px;
  //     width: 100%;
  //     height: 20px;
  //     line-height: 20px;
  //     color: #535b6c;
  //     font-family: @fontRegular;
  //     padding-top: 16px;
  //   }
  // }
  // .imgCtr {
  //   width: 100%;
  //   height: 82px;
  //   position: relative;
  //   overflow: hidden;
  //   display: flex;
  //   align-items: center;
  //   border-radius: 24px;
  //   > div {
  //     flex: 1;
  //   }
  //   .blurImg {
  //     width: 100%;
  //     height: 100%;
  //     position: absolute;
  //     top: 0;
  //     left: 0;
  //     right: 0;
  //     bottom: 0;
  //   }
  //   .imgContent {
  //     position: absolute;
  //     top: 50%;
  //     left: 50%;
  //     transform: translate(-50%, -50%);
  //     z-index: 1;
  //   }
  // }
}
</style>
