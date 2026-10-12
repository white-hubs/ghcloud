<template>
  <div class="no-application">
    <a-result status="403" title="暂无可用应用" sub-title="当前账号尚未分配可访问的应用，请联系管理员配置权限。">
      <template #extra>
        <a-button type="primary" @click="logout">退出登录</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

const router = useRouter();

function logout() {
  CubeMfRootGlobalState.getInstance().mfRootState.clearAuthInfo();
  sessionStorage.removeItem("GH-Token");
  router.replace({ path: "/login" });
}
</script>

<style scoped lang="less">
.no-application {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}
</style>
