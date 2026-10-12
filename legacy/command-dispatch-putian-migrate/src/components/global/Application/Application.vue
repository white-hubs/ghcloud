<template lang="pug">
div.application 
  div.modelTitle(v-if="title") {{title}}
  div.occupy(v-if="title")
  div.title
    div.appliCtr
      div.group(v-for="(item,index) in applData" :key="index")
        div(v-if="item.applicationPageVOS.length")
          div.groupName {{item.name}}
          AppStyle(:appList="item.applicationPageVOS" @go_page="goPage")     
    //- a-empty(v-if="!applData[0].applicationPageVOS.length&&!applData[1].applicationPageVOS.length&&!applData[2].applicationPageVOS.length" description="未分配应用")     
</template>
<script>
import {
defineComponent,
getCurrentInstance,
onMounted,
reactive,
toRefs,
watch
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    title: {
      type: String,
      default: "",
    },
    applications: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      applData: [
        // {
        //   name: "运维作业",
        //   ids: [
        //     1527972634729648129, 1527974748667252737, 1524563097834229762,
        //     1528592363810983938, 1528592649854128129, 1524576316082622465,
        //   ],
        //   children: [],
        // },
        // {
        //   name: "内部管理",
        //   ids: [1529432253008187394, 1529432186239062017, 1529432328434356226],
        //   children: [],
        // },
        // {
        //   name: "基础应用",
        //   ids: [1465216340938747906, 2],
        //   children: [],
        // },
      ],
    });
    onMounted(() => {
      getApplications();
    });
    const getApplications = async () => {
      state.applData = props.applications;
    };
    const goPage = async ele => {
      store.commit("menu/SET_APPLICATION", ele);
      // TODO(danke): 临时支持嵌入流引擎，急需重构
      if (ele.id === "temp-flow-engine-app") {
        router.replace({ path: "/flow-engine" });
        return;
      }
      const data = await proxy.$api.getApplicationInMenus(
        {
          applicationCode: ele.code,
        },
        "get",
      );
      if (data && data.length) {
        if (route.path === "/index") {
          store.commit("menu/SET_TABS_PANE", []);
        }
        // if(route.path){}
        store.commit("menu/SET_MENU", data);
        router.replace({
          path: "/about",
        });
      } else if (!data.length) {
        proxy.$message.error("该应用下未分配菜单");
      }
    };
    watch(
      () => props.applications,
      () => {
        getApplications();
      },
    );
    return {
      ...toRefs(state),
      goPage,
    };
  },
});
</script>
<style lang="less" scoped>
.application {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: @white;
  // border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);

  &::-webkit-scrollbar {
    // width: 0.16rem;
    width: 0;
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
    font-family: @fontMedium;
    position: absolute;
    padding: 0 20px;
    background-color: @white;
    left: 0;
    font-size: 16px;
    z-index: 2;
  }

  .occupy {
    width: 100%;
    height: 60px;
  }

  .title {
    height: calc(100% - 60px);

    :deep(.ant-empty) {
      height: 100%;
      flex-direction: column;
      display: flex;
      justify-content: center;
      color: #000;
    }
  }

  .appliCtr {
    padding-top: 20px;
  }

  .groupName {
    text-align-last: left;
    color: #535b6c;
    font-family: "SourceHanSansCN-Medium-2";
    font-size: 14px;
    margin-bottom: 10px;
  }

  // .applInfo {
  //   display: grid;
  //   grid-template-columns: repeat(6, 15%);
  //   grid-column-gap: 2%;
  //   grid-row-gap: 7%;
  //   cursor: pointer;
  // }
  // .applName {
  //   width: 82px;
  //   height: 82px;
  //   background: @white;
  //   box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);
  //   border-radius: 6px;
  //   padding: 5px;
  //   display: flex;
  //   align-items: center;
  //   div {
  //     flex: 1;
  //   }
  //   &:hover {
  //     transform: scale(1.1);
  //     box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.103);
  //   }
  //   .name {
  //     font-size: 14px;
  //     width: 100%;
  //     height: 20px;
  //     line-height: 20px;
  //     color: #535b6c;
  //     font-family: "SourceHanSansCN-Regular-2";
  //   }
  // }
}
</style>
