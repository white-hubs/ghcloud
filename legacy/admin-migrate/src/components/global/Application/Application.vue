<template lang="pug">
div.application 
  div.modelTitle(v-if="title") {{title}}
  div.occupy(v-if="title")
  div.title
    div.appliCtr
      div.group(v-for="item,index in applicationData" :key="item.id")
        div.groupName {{item.name}}
        AppStyle(:appList="item.children" @go_page="goPage")     
        //- div.applInfo
          div.applName(v-for="ele,idx in item.children" :key="ele.id" @click="goPage(ele)")
            div
              img(:src="icon[index].icon[idx]")
              div.name {{ele.name}}
             
</template>
<script lang='jsx'>
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
export default defineComponent({
  props: {
    title: String,
    appList: Array,
  },
  setup(props) {
    const router = useRouter();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      applicationData: [
        {
          name: "平台管理",
          id: "market",
          children: [

          ],
        },
      ],
    });
    onMounted(() => {
      getApp();
    });
    const getApp = async () => {
      state.applicationData[0].children = props.appList;
    };
    const goPage = async (ele) => {
      const menu = await proxy.$api.appMenu("get", ele.code);
      if (menu.length) {
        store.commit("menu/SET_MENU", JSON.stringify(menu));
        store.commit("menu/SET_APP", JSON.stringify(ele));
        router.push({ path: "/about" });
      } else {
        proxy.$message.warn("当前应用未分配菜单");
      }
    };
    return {
      ...toRefs(state),
      goPage,
    };
  },
});
</script>
<style lang="less" scoped>
// @import url("@/styles/theme/color.less");;
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
    background: @blue;
    box-shadow: 0px 1px 3px 0px rgba(44, 47, 49, 0.4);
  }

  /*滚动条的上下两端的按钮*/
  &::-webkit-scrollbar-button {
    height: 0px;
  }

  .modelTitle {
    width: 100%;
    height: 60px;
    line-height: 60px;
    color: #535b6c;
    text-align: left;
    font-family: "SourceHanSansCN-Medium-2";
    position: absolute;
    padding: 0 20px;
    background-color: @white;
    left: 0;
    font-size: 16px;
  }

  .occupy {
    width: 100%;
    height: 60px;
  }

  .title {
    height: calc(100% - 60px);
  }

  // .appliCtr {
  //   padding: 20px;
  //   height: 100%;
  // }
  .groupName {
    text-align-last: left;
    color: #535b6c;
    font-family: "SourceHanSansCN-Medium-2";
    font-size: 14px;
    margin-bottom: 10px;
  }

  .applInfo {
    display: grid;
    grid-template-columns: repeat(6, 15%);
    grid-column-gap: 2%;
    grid-row-gap: 7%;
    cursor: pointer;
  }

  .applName {
    width: 82px;
    height: 82px;
    background: @white;
    box-shadow: 0px 0px 6px 2px rgba(10, 24, 10, 0.04);
    border-radius: 6px;
    padding: 5px;
    display: flex;
    align-items: center;

    div {
      flex: 1;

      img {
        width: 36px;
        height: 36px;
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
