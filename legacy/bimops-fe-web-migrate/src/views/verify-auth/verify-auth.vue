<template>
  <div class="verify-auth">
    <div class="app-loading" v-if="state.loading">
      <div class="app-loading-wrap">
        <img src="/resource/v1/bimops-fe-web-migrate/logo.gif" class="app-loading-logo" alt="Logo" />
        <div class="app-loading-title">鉴权验证中...</div>
      </div>
    </div>
    <a-result v-else status="403" title="401" sub-title="抱歉, 您暂无权限访问此页面.">
      <template #extra>
        <a-button type="primary" @click="goLogin">回登录页</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
// @ts-ignore
import { message } from "ant-design-vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeTerminalEnum, type CubeAuth } from "@ghcloud/cube-protocol";

import * as api from "@/api";
const router = useRouter();

/**
 * 数据部分
 */
const state = reactive({
  loading: true,
});
onMounted(() => {
  getData();
});
const getData = async () => {
  try {
    const code = useRoute().query.code;
    // CAS平台登录返回的的认证码
    const ticket = useRoute().query.ticket;
    if (!code && !ticket) {
      message.warn("认证参数不存在");
      throw new Error("认证参数不存在");
    }
    const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS);
    let result = null;
    if (code) {
      const params = {
        grant_type: "ms_accesstoken_code",
        code: code as string,
        redirect_uri: window.location.origin + window.location.host + window.location.pathname,
      };
      result = await cubeAuthService.getTokenByAuthCode(params);
    } else if (ticket) {
      result = await cubeAuthService.casLogin(ticket as string);
    }
    if (result) {
      CubeMfRootGlobalState.getInstance().mfRootState.setAuthInfo(
        {
          token: result.access_token,
          tenant: "",
          terminal: CubeTerminalEnum.BUSINESS,
        },
        result.refresh_token,
      );
      await getTenantList();
    }
  } catch (error) {
    state.loading = false;
  }
};
const goLogin = () => {
  if (document.referrer) {
    window.location.href = document.referrer;
  } else {
    history.go(-1);
  }
};
const getTenantList = async () => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
  const data = await api.tenant();
  let tenant = "";
  if (data && data instanceof Array) {
    if (data.length === 0) {
      message.warn("该用户未加入企业");
      sessionStorage.removeItem("GH-Token");
      return;
    } else if (data.length === 1) {
      tenant = data[0].code;
    } else {
      const index = data.findIndex((item) => item.mainEnterprise);
      if (index !== -1) {
        tenant = data[index].code;
      } else {
        tenant = data[0].code;
      }
    }
    cubeMfRootGlobalState.mfRootState.setAuthInfo({
      ...cubeMfRootGlobalState.mfRootState.authInfo,
      tenant: tenant,
    } as CubeAuth);
    await cubeMfRootGlobalState.initGlobalState();
    router.replace({ path: "/portal-entry" });
  } else {
    message.warn("该用户未加入企业");
  }
};

// 使用toRefs解构
// let { } = { ...toRefs(state) }
defineExpose({
  ...toRefs(state),
});
</script>
<style scoped lang="less">
.verify-auth {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.app-loading {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #f4f7f9;
}

.app-loading .app-loading-wrap {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  -webkit-transform: translate3d(-50%, -50%, 0);
  transform: translate3d(-50%, -50%, 0);
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.app-loading .dots {
  display: flex;
  padding: 98px;
  justify-content: center;
  align-items: center;
}

.app-loading .app-loading-title {
  display: flex;
  margin-top: 30px;
  font-size: 30px;
  color: rgba(0, 0, 0, 0.85);
  justify-content: center;
  align-items: center;
}

.app-loading .app-loading-logo {
  display: block;
  width: 90px;
  margin: 0 auto;
  margin-bottom: 20px;
}

.dot {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 48px;
  margin-top: 30px;
  font-size: 32px;
  transform: rotate(45deg);
  box-sizing: border-box;
  animation: antRotate 1.2s infinite linear;
}

.dot i {
  position: absolute;
  display: block;
  width: 20px;
  height: 20px;
  background-color: #0065cc;
  border-radius: 100%;
  opacity: 0.3;
  transform: scale(0.75);
  animation: antSpinMove 1s infinite linear alternate;
  transform-origin: 50% 50%;
}

.dot i:nth-child(1) {
  top: 0;
  left: 0;
}

.dot i:nth-child(2) {
  top: 0;
  right: 0;
  -webkit-animation-delay: 0.4s;
  animation-delay: 0.4s;
}

.dot i:nth-child(3) {
  right: 0;
  bottom: 0;
  -webkit-animation-delay: 0.8s;
  animation-delay: 0.8s;
}

.dot i:nth-child(4) {
  bottom: 0;
  left: 0;
  -webkit-animation-delay: 1.2s;
  animation-delay: 1.2s;
}

@keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg);
  }
}

@-webkit-keyframes antRotate {
  to {
    -webkit-transform: rotate(405deg);
    transform: rotate(405deg);
  }
}

@keyframes antSpinMove {
  to {
    opacity: 1;
  }
}

@-webkit-keyframes antSpinMove {
  to {
    opacity: 1;
  }
}
</style>
