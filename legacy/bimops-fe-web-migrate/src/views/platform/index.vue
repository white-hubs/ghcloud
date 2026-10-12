<template>
  <div id="workbench-container"></div>
  <div id="workbench-container-loading" v-if="childApplication.appLoadStatus === 'LOADING'" :class="{ 'full-content': inDesktopClient }">
    <a-spin></a-spin>
    <span>工作台加载中...</span>
  </div>
  <div id="workbench-container-error" v-if="childApplication.appLoadStatus === 'ERROR'" :class="{ 'full-content': inDesktopClient }">
    <a-empty :image="onePng">
      <template #description> 工作台加载失败，请刷新重试或联系运维人员处理 </template>
      <a-button type="primary" @click="reload">刷新</a-button>
    </a-empty>
  </div>
</template>
<script setup>
import { registerMicroApps } from "qiankun";
import { onMounted } from "vue";
const onePng = "/resource/v1/bimops-fe-web-migrate/images/1.png";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { useChildApplication } from "../../hooks/use-child-application";
import { inDesktopClient } from "../../hooks/use-environment";
import { ensureQiankunStarted } from "@/utils/qiankun-runtime";

const childApplication = useChildApplication();
const reload = () => {
  window.location.reload();
};

onMounted(() => {
  childApplication.clearMenuCache();
  const applicationIcons = childApplication
    .getUserApplications()
    .then(() =>
      Object.fromEntries(
        childApplication.applicationGroup.flatMap((group) =>
          group.applicationPageVOS
            .filter((application) => application.code && application.icon)
            .map((application) => [application.code, application.icon]),
        ),
      ),
    )
    .catch(() => ({}));
  registerMicroApps(
    [
      {
        name: "workbench-migrate",
        entry: window.config.homeEntry,
        // entry: 'http://localhost:8888/',
        container: "#workbench-container",
        activeRule: ["/index", "/workbench"],
        props: {
          base: "/",
          auth: { ...CubeMfRootGlobalState.getInstance().mfRootState.authInfo },
          applicationIcons,
        },
      },
    ],
    {
      beforeLoad: (app) => {
        childApplication.beginMicroAppLoad(app.name);
      },
      afterMount: (app) => {
        childApplication.completeMicroAppLoad(app.name);
      },
    },
  );
  ensureQiankunStarted();
});
</script>
<style lang="less" scoped>
#workbench-container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

#workbench-container-loading,
#workbench-container-error {
  width: 100%;
  height: calc(100% - 50px);
  position: absolute;
  top: 50px;
  left: 0;
  background-color: white;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  // 覆盖工作台子应用卡片的浮层（如配置页关闭按钮），避免路由切换时露出旧页面元素。
  z-index: 101;
}
.full-content {
  height: 100% !important;
  top: 0 !important;
}
</style>
