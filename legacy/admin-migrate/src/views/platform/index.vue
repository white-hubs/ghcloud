<template lang="pug">
HeaderContent
  div(v-if="isRuiHao")
    div(class="content")
      div(class="topUse")
        RecentUsed(v-if="applications.length" :title="'最近使用'" :appList="applications")
        RecentUsed(v-else)
      div(class="topinfo")
        AppTable(:title="'消息通知'")
      div( class="bottom_application")
        Application(v-if="applications.length"  :title="'业务应用'" :appList="applications")
        Application(v-else)
    CubeMessageSocket
  div(v-else style="height: 100vh;")
    Application(v-if="applications.length"  :appList="applications")
    Application(v-else)
</template>
<script lang='jsx'>
import {
  defineComponent,
  ref,
  onMounted,
  reactive,
  toRefs,
  getCurrentInstance,
  computed,
} from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {},
  props: {},
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const state = reactive({
      productionCode: window.config.productionCode,
      applications: [],
      // isRuiHao: import.meta.env.MODE === "ruihao"
    });
    const getApp = async () => {
      const data = await proxy.$api.getUserApplications("get", {
        productCode: state.productionCode,
      });
      store.commit("appList/SET_APPLIST", JSON.stringify(data));
      state.applications = [...data];
    };
    const isRuiHao = computed(() => {
      return import.meta.env.MODE === "ruihao";
    });
    onMounted(() => {
      getApp();
    });
    return {
      ...toRefs(state),
      isRuiHao,
    };
  },
});
</script>
<style lang="less" scoped>
:deep(.applName) {
  min-width: 64px;
  width: unset !important;

  .imgContent {
    width: 64px !important;
  }
}

:deep(.groupName) {
  visibility: hidden;
}

.platform {
  height: 100%;
  position: relative;
}

.site-layout-content {
  min-height: 280px;
  padding: 24px;
  background: #fff;
}

#components-layout-demo-top .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);
}

.ant-row-rtl #components-layout-demo-top .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

[data-theme="dark"] .site-layout-content {
  background: #141414;
}

.content {
  width: 100%;
  height: 100%;
  padding: 16px 16px 0;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(2, 49.4%);
  grid-template-rows: 45% 53%;
  grid-column-gap: 16px;
  grid-row-gap: 16px;
  position: relative;

  .topUse {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
  }

  .topinfo {
    padding: 10px;
    position: relative;
    overflow: hidden;
  }

  .bottom_application {
    border-radius: 8px;
    height: 100%;
    grid-column-start: 1;
    grid-column-end: 3;
    position: relative;
    overflow: hidden;

    :deep(.application) {
      .appliCtr {
        padding: 0 20px 20px;
        display: grid;
        // height: calc(100% - 60px);
        grid-auto-flow: column;
        grid-template-columns: repeat(2, 49%);
        grid-template-areas:
          "a c"
          "b c";
        grid-column-gap: 3%;
        grid-row-gap: 5%;
      }

      .group {
        padding-bottom: 20px;
      }

      // .group:nth-last-child(2) {
      //   padding-bottom: 20px;
      // }
    }
  }

  >div:not(:first-child) {
    height: 100%;
    background-color: #fff;
    border-radius: 8px;
  }

  .topUse_info {
    >div {
      width: 100%;
      background-color: #666;
    }
  }
}

// .pageName {
//   position: absolute;
//   left: 20px;
//   top: 10px;
//   color: #999999;
// }</style>
