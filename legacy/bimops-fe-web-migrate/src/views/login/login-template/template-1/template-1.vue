<template>
  <a-spin :spinning="isLoading" tip="微信验证中">
    <div class="login-container">
      <div class="system-name">{{ systemTitle }}</div>
      <div class="login-form" v-if="loginMethods === 'normal'">
        <div v-if="activeKey === 'password'">
          <LoginForm
            @changeMethods="(params) => changeMethods(params)"
            :smsCode="smsCode || wechatCode"
            :loginSuccessRedirectPath="loginSuccessRedirectPath"
          />
        </div>
        <div v-if="activeKey === 'phone'">
          <LoginPhone
            @bind="(tokenId) => bind('SMS', tokenId)"
            @changeMethods="(params) => changeMethods(params)"
            :smsCode="smsCode"
            :loginSuccessRedirectPath="loginSuccessRedirectPath"
          />
        </div>
        <div class="login-other" v-if="wechatCode || smsCode">
          <div class="title">
            <div class="left"></div>
            <span>其它登录方式</span>
            <div class="right"></div>
          </div>
          <div class="login-other-line">
            <div class="other-img" v-if="wechatCode" @click="changeMethods('wechat')"><img :src="WECHAT_ICON" alt="" /> 微信</div>
            <div class="other-img" v-if="smsCode && activeKey === 'password'" @click="wechatChangeMethods('phone')">
              <img :src="PHONE_ICON" alt="" /> 手机
            </div>
            <div class="other-img" v-if="activeKey === 'phone'" @click="wechatChangeMethods('password')">
              <img :src="MAC_ICON" alt="" /> 帐号
            </div>
          </div>
        </div>
      </div>
      <div class="login-form" v-if="loginMethods === 'wechat'">
        <LoginWechat
          :smsCode="smsCode"
          :wechatLogin="wechatLogin"
          :loginSuccessRedirectPath="loginSuccessRedirectPath"
          @change-method="wechatChangeMethods"
          @other-method="wechatForgetMethods"
          @bind="(tokenId) => bind('WECHAT', tokenId)"
        />
      </div>
      <div class="login-form" v-if="loginMethods === 'password'">
        <LoginForget @back-to-login="backToLogin" />
      </div>
      <div class="login-form" v-if="loginMethods === 'changePassword'">
        <LoginChange @back-to-login="backToLogin" @back-to-login-submit="backToLoginSubmit" :data="forgetData" />
      </div>
      <div>
        <AccountBindModal
          v-if="showBindModal"
          ref="bindModalRef"
          :visible="showBindModal"
          :loginType="currentLoginType"
          :tokenId="tokenId"
          @cancel="showBindModal = false"
          @success="handleBindSuccess"
          @create-account="handleCreateAccount"
          :wechatCode="wechatCode"
          :smsCode="smsCode"
          :loginSuccessRedirectPath="loginSuccessRedirectPath"
        />
        <ForgetChangeMethod
          v-if="showForgetModal"
          :visible="showForgetModal"
          @cancel="showForgetModal = false"
          @success="handleForgetSuccess"
          :wechatCode="wechatCode"
          :smsCode="smsCode"
        />
      </div>
    </div>
  </a-spin>
</template>
<script setup>
import { message } from "ant-design-vue";
import { ref, getCurrentInstance, nextTick, onMounted } from "vue";

import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import AccountBindModal from "../../components/account-bind-modal.vue";
import ForgetChangeMethod from "../../components/forget-change-method.vue";
import LoginChange from "../../components/login-change.vue";
import LoginForget from "../../components/login-forget.vue";
import LoginForm from "../../components/login-form.vue";
import LoginPhone from "../../components/login-phone.vue";
import LoginWechat from "../../components/login-wechat.vue";
import { useLoginHook } from "../../login-hook/login-hook";
import * as api from "@/api";
const { proxy } = getCurrentInstance();
import qs from "qs";
import { useRoute, useRouter } from "vue-router";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { redirectAfterLogin } from "../../utils/login-success-redirect";
import { useSystemTitleStore } from "@/hooks/use-system-title";
import { logger } from "@/logger";
const route = useRoute();

const isDevEnv = import.meta.env.DEV;
const RESOURCE_BASE = "/resource/v1/bimops-fe-web-migrate";

const WECHAT_ICON = `${RESOURCE_BASE}/icons/image/wechat.png`;
const PHONE_ICON = `${RESOURCE_BASE}/icons/image/phone.png`;
const MAC_ICON = `${RESOURCE_BASE}/icons/image/mac.png`;
const DEFAULT_LOGIN_REDIRECT_PATH = "/index";
/** 粮仓微应用（qiankun）内三平台入口：`/portal/granary-management/` + `/granary-platform-hub` */
const GRANARY_PLATFORM_HUB_PATH = "/portal/granary-management/granary-platform-hub";
/**
 * 数据字典开关（SYS 配置）：为 true 时登录成功跳转上方粮仓大屏路径。
 * itemCode/code 与后端字典条目保持一致（历史编码名未改，避免改库）。
 */
const GRANARY_PANEL_LOGIN_REDIRECT_DICT_CODE = "XIANING_CUS_LOGIN";

const readBimopsDevOriginForGranaryPanelRedirect = () => {
  const raw = import.meta.env.VITE_GRANARY_STATISTICAL_PANEL_DEV_ORIGIN;
  return typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
};

const resolveGranaryPlatformHubLoginTarget = () => {
  const devOrigin = readBimopsDevOriginForGranaryPanelRedirect();
  if (isDevEnv && devOrigin !== "") {
    return `${devOrigin}${GRANARY_PLATFORM_HUB_PATH}`;
  }
  return GRANARY_PLATFORM_HUB_PATH;
};
const activeKey = ref("password");
// normal wechat password changePassword
const router = useRouter();
const loginMethods = ref("normal");
const forgetData = ref({});
const smsCode = ref(false);
const wechatCode = ref(false);
const showBindModal = ref(false);
const showForgetModal = ref(false);
const currentLoginType = ref("SMS");
const tokenId = ref("");
const isLoading = ref(false);
const wechatLogin = ref(true);
const bindModalRef = ref(null);
const loginSuccessRedirectPath = ref(DEFAULT_LOGIN_REDIRECT_PATH);
const bind = (type, token) => {
  currentLoginType.value = type;
  tokenId.value = token;
  showBindModal.value = true;
};
const { loadInfoForLoginPage, lastLoginTenant } = useSystemTitleStore();

const changeMethods = (methods) => {
  if (methods === "wechat") {
    const agreement = localStorage.getItem("agreement");
    if (agreement === "true") {
      wechatLogin.value = true;
      loginMethods.value = methods;
    } else {
      message.warning("请先阅读并同意用户协议及隐私政策！");
    }
  } else if (methods === "password") {
    showForgetModal.value = true;
  } else {
    loginMethods.value = methods;
  }
};
const backToLoginSubmit = () => {
  loginMethods.value = "normal";
};
const backToLogin = (methods, data) => {
  if (methods === "back") {
    loginMethods.value = "normal";
    showForgetModal.value = true;
  } else {
    loginMethods.value = "changePassword";
  }
  if (data) {
    forgetData.value = data;
  }
};
const wechatChangeMethods = (methods) => {
  loginMethods.value = "normal";
  if (methods) {
    activeKey.value = methods;
  }
};
const wechatForgetMethods = () => {
  loginMethods.value = "normal";
  showForgetModal.value = true;
};

const getProjectInfo = async () => {
  try {
    const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: "SYS_ABILITY_CONFIG",
      code: "sms_code",
    });
    if (res.variable === "true") {
      smsCode.value = true;
    } else {
      smsCode.value = false;
    }
  } catch (error) {
  } finally {
  }
};
const getWechatInfo = async () => {
  try {
    const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: "SYS_ABILITY_CONFIG",
      code: "wechat_login",
    });
    if (res.variable === "true") {
      wechatCode.value = true;
    } else {
      wechatCode.value = false;
    }
  } catch (error) {
    // (function(){})('获取项目信息失败', error);
  } finally {
  }
};
const getCustomLoginInfo = async () => {
  try {
    const res = await new CubeDictionaryService().getSysDictionaryByCodeAndItemCode({
      itemCode: GRANARY_PANEL_LOGIN_REDIRECT_DICT_CODE,
      code: GRANARY_PANEL_LOGIN_REDIRECT_DICT_CODE,
    });
    loginSuccessRedirectPath.value = res.variable === "true" ? resolveGranaryPlatformHubLoginTarget() : DEFAULT_LOGIN_REDIRECT_PATH;
  } catch (error) {
    loginSuccessRedirectPath.value = DEFAULT_LOGIN_REDIRECT_PATH;
  }
};
getProjectInfo();
getWechatInfo();
getCustomLoginInfo();
// 检查URL中是否有code参数，如果有则表示微信扫码登录成功并重定向回来
const checkWxLoginCode = () => {
  const query = route.query;
  if (query?.code) {
    if (query?.forget) {
      let code = query?.code;
      let state = query?.state;
      const wxCode = localStorage.getItem("wx-forget-code");
      if (wxCode !== code && state === "STATE") {
        localStorage.setItem("wx-forget-code", code);
        forgetWechatLogin(code);
      }

      return;
    }
    if (query?.tokenId) {
      let tokenId = query?.tokenId;
      let code = query?.code;
      let state = query?.state;
      const wxCode = localStorage.getItem("wx-bind-code");
      if (wxCode !== code && state === "STATE") {
        localStorage.setItem("wx-bind-code", code);
        bindWithWechat(code, tokenId);
      }

      return;
    }
    let code = query?.code;
    let state = query?.state;
    const wxCode = sessionStorage.getItem("wx-login-code");
    if (wxCode !== code && state === "STATE") loginMethods.value = "wechat";
  }
};
/**
 * 获取租户列表
 */
const getTenantList = async () => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
  const data = await api.tenant();

  let tenant = "";
  if (data && data instanceof Array) {
    if (data.length === 0) {
      proxy.$message.warn("您尚未加入任何企业，请联系管理员添加!");
      sessionStorage.removeItem("GH-Token");
      cubeMfRootGlobalState.mfRootState.clearAuthInfo();
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
    // 自动切换到上一次登录切换的租户
    const tenants = data?.map((item) => item.code);
    const lastTenantId = lastLoginTenant();
    if (lastTenantId && tenants?.includes(lastTenantId)) tenant = lastTenantId;
    cubeMfRootGlobalState.mfRootState.setAuthInfo({
      ...cubeMfRootGlobalState.mfRootState.authInfo,
      tenant: tenant,
    });
    await cubeMfRootGlobalState.initGlobalState();
    isLoading.value = false;
    await redirectAfterLogin(loginSuccessRedirectPath.value, router);
  } else {
    proxy.$message.warn("该用户未加入企业");
  }
};
const bindWithWechat = async (code, id) => {
  // 这里需要根据实际微信绑定流程调整
  // const params = qs.stringify({
  //   grant_type: "SMS",
  //   principal:'',
  //   credentials:code,
  //   loginBindType:'WECHAT',
  //   registerNewUser:false,
  //   tokenId:id,
  // })
  params = {
    authType: "WECHAT",
    bindType: "SMS",
    tokenId: id,
    authParam: {
      code,
    },
  };
  isLoading.value = true;
  api
    .LoginBind(params)
    .then(async (token) => {
      if (token) {
        CubeMfRootGlobalState.getInstance().mfRootState.setAuthInfo(
          {
            token: token.access_token,
            tenant: "",
            terminal: CubeTerminalEnum.BUSINESS,
          },
          token.refresh_token,
          token.jti,
        );
        await getTenantList();
      }
    })
    .catch((error) => {
      logger.error(error);
      isLoading.value = false;
      tokenId.value = id;
      currentLoginType.value = "SMS";
      showBindModal.value = true;
      nextTick(() => {
        bindModalRef.value.showBindForm("wechat");
      });
    });
};
//微信验证忘记密码
const forgetWechatLogin = async (code) => {
  isLoading.value = true;
  // 调用验证码验证API
  api
    .getPasswordToken({
      code: code,
      type: "WECHAT",
    })
    .then((res) => {
      // 存储账号信息到localStorage，以便修改密码页面使用
      isLoading.value = false;
      backToLogin("submit", res);
    })
    .catch((error) => {
      wechatLogin.value = false;
      loginMethods.value = "wechat";
      logger.error(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const handleBindSuccess = () => {};
const handleCreateAccount = () => {};
const handleForgetSuccess = (params) => {
  if (params === "wechat") {
    wechatLogin.value = false;
  }
  loginMethods.value = params;
  showForgetModal.value = false;
};
// 页面加载时检查是否有微信登录的code
checkWxLoginCode();
const systemTitle = ref("");
onMounted(() => {
  const info = loadInfoForLoginPage();
  systemTitle.value = info.title;
});
</script>
<style lang="less" scoped>
.login-container {
  width: 100vw !important;
  height: 100vh !important;
  transform-origin: left top;
  background-image: url("./assets/background.webp");
  background-size: 100%100%;
  position: relative;
  --ant-primary-color: #1578ff;
  --ant-primary-color-outline: rgba(24, 144, 255, 0.2);

  .system-name {
    height: calc((73 / var(--design-width)) * 100vw);
    font-size: calc((50 / var(--design-width)) * 100vw);
    text-align: center;
    font-family: "Microsoft YaHei", "微软雅黑", sans-serif;
    // font-family: YouSheBiaoTiHei, YouSheBiaoTiHei-Regular;
    font-weight: 700;
    color: #404449;
    line-height: calc((73 / var(--design-width)) * 100vw);
    letter-spacing: 0.11;
    position: absolute;
    top: calc((108 / var(--design-width)) * 100vw);
    left: 50%;
    transform: translateX(-50%);
  }

  .login-form {
    width: calc((420 / var(--design-width)) * 100vw);
    background: #ffffff;
    box-shadow: 0 calc((17 / var(--design-width)) * 100vw) calc((36 / var(--design-width)) * 100vw) 0 rgba(4, 65, 150, 0.12);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: calc((340 / var(--design-width)) * 100vw);
    box-sizing: border-box;
    padding: calc((30 / var(--design-width)) * 100vw) calc((30 / var(--design-width)) * 100vw);
    text-align: center;
    .welcome {
      height: calc((30 / var(--design-width)) * 100vw);
      font-size: calc((26 / var(--design-width)) * 100vw);
      font-family:
        Source Han Sans CN,
        Source Han Sans CN-Medium;
      font-weight: 500;
      text-align: left;
      color: #02112b;
      line-height: calc((30 / var(--design-width)) * 100vw);
      text-align: center;
    }

    .login-tabs {
      display: flex;
      width: 100%;
      margin-bottom: calc((20 / var(--design-width)) * 100vw);
      background: #f3f8fe;
      border-radius: calc((8 / var(--design-width)) * 100vw);
      overflow: hidden;
      padding: calc((6 / var(--design-width)) * 100vw);
      .tab-item {
        flex: 1;
        padding: calc((7 / var(--design-width)) * 100vw) 0;
        text-align: center;
        cursor: pointer;
        color: #666;
        font-size: calc((14 / var(--design-width)) * 100vw);
        transition: all 0.3s ease;

        &.active {
          background-color: #fff;
          color: #1578ff;
          font-weight: 500;
        }
      }
    }

    :deep(.ant-form-item-control-input) {
      .ant-input-affix-wrapper {
        border-color: #e2e7f5 !important;
        input {
          color: #000;
          &::placeholder {
            color: #a4afca;
          }
        }
      }
    }

    :deep(.ant-input-prefix) {
      color: #a4afca;
    }

    :deep(.remember-account) {
      margin-bottom: calc((30 / var(--design-width)) * 100vw);
      span {
        color: #a4afca !important;
      }
    }
  }
}
.login-footer {
  padding: calc((10 / var(--design-width)) * 100vw) 0;
  display: flex;
  justify-content: flex-end;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: #666;
  cursor: pointer;
}
.other-img {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: calc((20 / var(--design-width)) * 100vw);
  cursor: pointer;
  font-size: calc((14 / var(--design-width)) * 100vw);
  font-family:
    Source Han Sans CN,
    Source Han Sans CN-Regular;
  font-weight: Regular;
  text-align: left;
  color: #738292;
  line-height: calc((14 / var(--design-width)) * 100vw);
}
.other-img img {
  width: calc((16 / var(--design-width)) * 100vw);
  height: calc((16 / var(--design-width)) * 100vw);
  margin-right: calc((3 / var(--design-width)) * 100vw);
}
.title {
  width: 100%;
  color: #a4afca;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: calc((16 / var(--design-width)) * 100vw);
  gap: calc((15 / var(--design-width)) * 100vw);
  .left,
  .right {
    height: calc((1 / var(--design-width)) * 100vw);
    width: 30%;
    background-color: #e9eef1;
  }
}
.login-other {
  margin-top: calc((15 / var(--design-width)) * 100vw);
}
.login-other-line {
  display: flex;
  justify-content: center;
  gap: calc((10 / var(--design-width)) * 100vw);

  font-size: 14px;
}
.copyright {
  color: #1578ff;
}
.aggrement {
  margin-top: calc((10 / var(--design-width)) * 100vw);
}
</style>
