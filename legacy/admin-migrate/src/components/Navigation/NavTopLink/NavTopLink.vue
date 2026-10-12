<template lang="pug">
div
  div.flex.NavTopLink
    div.project.flex 
      div.flex(style="flex: 1")
        div.systemName {{systemName}} 
    ul.flex
      li(
        v-for="(item, index) in linkData"
        :key="item.key"
        @click="choseMenu(index)"
        @mouseover="showSuspended(index)"
        @mouseout="hideSuspended")
        span(:class="[isActive === index ? 'checked' : '', 'normal']") {{ item.name }}
        span(:class="[isActive === index ? 'Active' : '']")
        div(
          v-if="item.Suspended"
          :class="['suspended', isShowSuspended ? 'show' : '']")
          Application(v-if="appList?.length" :appList="appList")
      div(:class="isShowSuspended ? 'popup' : '' " @mouseover="hideSuspended")
    div.link.flex       
    div.person_info
      div.flex( @mouseover="showUserInfo" @mouseleave="hideUserInfo")
        div.nickname {{userInfo?.username}} 
        div(:class="[isHover ? 'appear' : 'hide']")
          div(@click="logout") 安全退出
</template>
<script lang='jsx'>
import {
  defineComponent,
  ref,
  reactive,
  toRefs,
  onMounted,
  watch,
  createVNode,
  getCurrentInstance,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import { Modal } from "ant-design-vue";
import { useStore } from "vuex";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { getToken } from "@/services/AccountService";
import { stringify } from "qs";
export default defineComponent({
  components: {},
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const confirm = Modal.confirm;
    const count = ref("1");
    const state = reactive({
      collapsed: false,
      selectedKeys: [],
      openKeys: [],
      preOpenKeys: [],
      linkData: [
        {
          name: "首页",
          key: "a",
          Suspended: false,
        },
        // {
        //   name: "应用",
        //   key: "b",
        //   Suspended: true,
        // },
      ],
      isActive: 0,
      isShowSuspended: false,
      isHover: false,
      confirming: false,
      userInfo: null,
      token: null,
      appList: [],
      systemName: window.config.systemName
    });

    const getApp = async () => {
      const data = await proxy.$api.getUserApplications("get", {
        productCode: window.config.productionCode,
      });
      state.appList = data;
    };

    onMounted(async () => {
      state.token = await getToken();
      const data = await proxy.$api.userInfo("get", { id: state.token.id });
      if (data) {
        state.userInfo = data;
        store.commit("userInfo/SET_USER_INFO", JSON.stringify(data));
      }
      getApp();
      if (route.path !== "/index") state.isActive = 1;
    });

    const choseMenu = (index) => {
      if (index === 0) {
        router.push({ path: "/index" });
      }
    };
    const showSuspended = (index) => {
      if (index === 1) state.isShowSuspended = true;
    };
    const hideSuspended = () => {
      state.isShowSuspended = false;
    };
    const showUserInfo = () => {
      state.isHover = true;
    };
    const hideUserInfo = () => {
      state.isHover = false;
    };

    const logout = () => {
      if (confirm) {
        state.confirming = true;
        confirm({
          title: "提示",
          content: "是否退出登录？",
          okText: "确定",
          cancelText: "取消",
          centered: true,
          icon: createVNode(ExclamationCircleOutlined),
          onOk: () => {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userInfo");
            sessionStorage.removeItem("tenant");
            sessionStorage.removeItem("appList");
            sessionStorage.removeItem("menu");
            sessionStorage.removeItem("app");
            window.location.href = "/";
            window.location.hash = "/login";
            window.location.reload();
            state.confirming = false;
          },
          onCancel: () => {
            state.confirming = false;
          },
        });
      }
    };

    watch(
      () => route.path,
      (newVal) => {
        if (newVal === "/index") state.isActive = 0;
        else state.isActive = 1;
      }
    );
    watch(
      () => store.getters.appList,
      (newVal) => {
        
        state.appList = JSON.parse(store.getters.appList);
      }
    );

    const switchSys = async () => {
      // alert("跳转页面");
      const token = await getToken();
      window.open(`${window.config.businessUrl}?${stringify(token)}`);
    };

    return {
      ...toRefs(state),
      count,
      choseMenu,
      showSuspended,
      hideSuspended,
      showUserInfo,
      hideUserInfo,
      logout,
      switchSys,
    };
  },
});
</script>
<style lang="less" scoped>
.NavTopLink {
  width: 100%;
  height: 50px;
  background: @blue;
  color: @white;
  justify-content: space-between;

  .systemName {
    font-size: 16px;
    font-family: auto;
  }
}

.project {
  width: 200px;
  height: 50px;
  align-items: center;
  justify-content: center;
  line-height: 50px;
  background: @bluedeep;
  font-family: "PangMenZhengDaoBiao";
  color: @white;

  >.flex {
    align-items: center;
    justify-content: center;
  }
}

:deep(.ant-menu-item.ant-menu-item-only-child) {
  width: 30%;
}

.bottomLine {
  background-color: @colorEee;
}

ul {
  list-style: none;
  // width: calc(100% - 800px);
  height: 50px;
  // padding: 0 0 0 24px;
  padding: 0;
  margin: 0;
  position: relative;
  flex: 1;

  li {
    &:hover {
      background-color: @blueHover;
      color: @white;
      cursor: pointer;
    }

    position: relative;
    width: 80px;
    cursor: pointer;
    height: 50px;
    // line-height: 50px;
    font-size: 16px;
  }

  .Active {
    width: 18%;
    display: inline-block;
    height: 1px;
    background-color: @white;
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translate(-50%);
  }

  .normal {
    font-family: @fontRegular;
    display: inline-block;
    height: 50px;
    color: #fff;
    line-height: 50px;
  }

  .checked {
    font-family: @fontMedium;
  }

  .suspended {
    display: none;
  }

  .show {
    display: inline-block;
    position: fixed;
    top: 50px;
    z-index: 999;
    left: 200px;
    width: 48%;
    height: 55%;

    :deep(.application) {
      padding: 0 20px;
      overflow-y: auto;

      .title {
        height: 100%;
      }

      .applInfo {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        cursor: pointer;

        .applName {
          margin-bottom: 16px;

          div {
            flex: 1;
          }
        }
      }
    }
  }

  .popup {
    display: inline-block;
    position: fixed;
    top: 50px;
    z-index: 998;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
  }
}

.link {

  // width: 400px;
  .linkEnterprise {
    &:hover {
      color: #e0d4d4;
      // transition: 1s;
    }
  }
}

.person_info {
  display: flex;
  align-items: center;
  width: 200px;
  height: 50px;
  line-height: 50px;
  justify-content: flex-end;

  >div {
    &:first-child {
      width: 40%;
    }

    &:last-child {
      width: 60%;
    }
  }

  >.flex {
    height: 50px;
    position: relative;
    padding-right: 10px;
  }

  .hide {
    display: none;
  }

  .appear {
    width: 100%;
    display: inline-block;
    position: absolute;
    top: 50px;
    left: 0;
    background-color: @white;
    color: #000;
    z-index: 2;

    >div {
      cursor: pointer;

      &:hover {
        background-color: @infoHover;
        color: @blue;
      }
    }
  }
}

#components-badge-demo-dot .anticon-notification {
  width: 160px;
  height: 16px;
  line-height: 16px;
  font-size: 16px;
  vertical-align: middle;
}

.flex {
  align-items: center;
  cursor: pointer;

  .nickname {
    width: 100%;
    display: inline-block;
    padding-left: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
