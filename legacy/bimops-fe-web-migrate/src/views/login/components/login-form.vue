<template>
  <div class="login-body">
    <div class="login-title">{{ !props.bind ? "账号登录" : "绑定账号" }}</div>

    <span v-if="props.bind"> 请验输入平台账号并验证： </span>
  </div>
  <a-form ref="formRef" :model="formState" :rules="rules" layout="horizontal" @finish="getVerifyCode">
    <a-form-item label="" name="username">
      <a-input
        v-model:value="formState.username"
        type="text"
        placeholder="请输入账号"
        allowClear
        :class="{ 'error-input': accError.show }"
        @input="clearAccError"
      >
        <template #prefix>
          <user-outlined />
        </template>
      </a-input>
      <div v-show="accError.show" class="error">{{ accError.error }}</div>
    </a-form-item>
    <a-form-item label="" name="password">
      <a-input-password
        v-model:value="formState.password"
        type="password"
        placeholder="请输入密码"
        allowClear
        :class="{ 'error-input': pasError.show }"
        @input="clearPasError"
      >
        <template #prefix>
          <lock-outlined />
        </template>
      </a-input-password>
      <div v-show="pasError.show" class="error">{{ pasError.error }}</div>
    </a-form-item>
    <!-- <a-form-item label="" name="verify"> -->
    <!-- <div class="identify">
        <a-input v-model:value="formState.verify" type="text" placeholder="验证码" allowClear ref="verifyInputRef">
          <template #prefix>
            <verified-outlined />
          </template>
        </a-input>
        <img :src="state.loginCode" @click="getLoginCode" alt="验证码" class="login-code">
      </div> -->
    <!-- <div class="verifyBody" @click="getVerifyCode" v-if="!formState.verify">
        点击验证
      </div> 
    
      <div class="verifyed"  v-else>
          <CheckCircleFilled  style="font-size: 20px;"/>
        </div> -->

    <!-- </a-form-item> -->
    <div class="remember-account" v-if="!props.bind">
      <userAggrement
        ref="agreementRef"
        @accepted-change="handleAgreementAcceptedChange"
        @confirm-accepted="handleAgreementConfirmAccepted"
        @confirm-rejected="handleAgreementConfirmRejected"
      />
      <a-checkbox class="remember-account__checkbox" v-model:checked="state.remember">记住我</a-checkbox>
    </div>
    <div class="login-footer" v-if="props.smsCode">
      <div class="copyright" @click="changeMethods('password')">忘记密码？</div>
    </div>
    <a-form-item style="margin-bottom: 0; margin-top: 10px">
      <a-button
        v-if="!props.bind"
        :loading="state.subLoading"
        type="primary"
        html-type="submit"
        block
        :class="['login-btn', { 'login-btn-pending-agreement': isAgreementPending }]"
      >
        登录
      </a-button>
      <div class="bindBody" v-else>
        <div @click="back" class="back">其它方式?</div>

        <a-button :loading="state.subLoading" type="primary" html-type="submit" class="bind-btn"> 绑定并登录 </a-button>
      </div>
    </a-form-item>
    <p class="bind-tip"></p>
  </a-form>
  <Teleport to="body">
    <Verify @success="success" mode="pop" captchaType="blockPuzzle" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
  </Teleport>
</template>
<script setup>
import { UserOutlined, LockOutlined, VerifiedOutlined, CheckCircleFilled } from "@ant-design/icons-vue";
import qs from "qs";
import { computed, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import form from "../../../../../../prod/cube/basic/cube-ui/src/components/form/form";
import { redirectAfterLogin } from "../utils/login-success-redirect";
import userAggrement, { isLoginAgreementAccepted } from "./user-aggrement.vue";
import Verify from "./verifition/Verify.vue";
import * as api from "@/api";
import { useSystemTitleStore } from "@/hooks/use-system-title";
import { logger } from "@/logger";
import Crypto from "@/utils/crypto.js";

const props = defineProps({
  bind: {
    type: Boolean,
    default: false,
  },
  loginType: {
    type: String,
    default: "SMS",
  },
  tokenId: {
    type: String,
    default: "",
  },
  smsCode: {
    type: String,
    default: "",
  },
  loginSuccessRedirectPath: {
    type: String,
    default: "/index",
  },
});
const emit = defineEmits(["back", "bind", "changeMethods"]);
const { proxy } = getCurrentInstance();
const formRef = ref();
const verifyInputRef = ref();
const state = reactive({
  subLoading: false,
  loginKey: null,
  loginCode: null,
  remember: false,
});
const verify = ref();
const agreementRef = ref();
const agreementRejectCount = ref(0);
const agreementAccepted = ref(isLoginAgreementAccepted());
const pendingAgreementAction = ref(null);
const formState = reactive({
  username: "",
  password: "",
  verify: false,
});

const accError = reactive({
  show: false,
  error: "",
});
const pasError = reactive({
  show: false,
  error: "",
});
const { lastLoginTenant, handleLogin } = useSystemTitleStore();

const verifyRef = ref(null);
const router = useRouter();
const rules = {
  username: [
    {
      required: true,
      message: "请输入账号",
      trigger: "change",
    },
  ],
  password: [
    {
      required: true,
      message: "请填写密码",
      trigger: "change",
    },
  ],
};
const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 14,
  },
};

const back = () => {
  emit("back");
};
const changeMethods = (params) => {
  emit("changeMethods", params);
};
const isAgreementPending = computed(() => {
  return !props.bind && !agreementAccepted.value;
});
const handleAgreementAcceptedChange = (accepted) => {
  agreementAccepted.value = accepted;
  if (accepted) {
    agreementRejectCount.value = 0;
  }
};
const handleAgreementConfirmAccepted = () => {
  agreementAccepted.value = true;
  agreementRejectCount.value = 0;
  const action = pendingAgreementAction.value;
  pendingAgreementAction.value = null;
  action?.();
};
const handleAgreementConfirmRejected = () => {
  agreementRejectCount.value = 0;
  pendingAgreementAction.value = null;
};
const validateLoginAgreement = (pendingAction) => {
  if (props.bind || isLoginAgreementAccepted()) {
    agreementAccepted.value = true;
    agreementRejectCount.value = 0;
    pendingAgreementAction.value = null;
    return true;
  }
  agreementAccepted.value = false;
  agreementRejectCount.value += 1;
  pendingAgreementAction.value = pendingAction;
  agreementRef.value?.remind?.();
  agreementRef.value?.openAgreementConfirm?.();
  return false;
};
const success = (params) => {
  formState.verify = params.captchaVerification;
  handleFinish();
};
const getVerifyCode = () => {
  if (!validateLoginAgreement(() => verify.value.show())) {
    return;
  }
  verify.value.show();
};
const handleFinish = async () => {
  if (!validateLoginAgreement(handleFinish)) {
    return;
  }

  CubeMfRootGlobalState.getInstance().mfRootState.clearAuthInfo();

  state.subLoading = true;
  let request = api.Login;
  let params = qs.stringify({
    grant_type: "pwd_simple_code",
    captchaType: "BLOCK_PUZZLE",
    key: formState.verify,
    username: formState.username,
    password: Crypto.encrypt(formState.password),
  });
  if (props.bind) {
    // emit('bind',formState)
    request = api.LoginBind;
    // params = {
    //   grant_type:props.loginType,
    //   principal: formState.username,
    //   credentials: Crypto.encrypt(formState.password),
    //   captchaType:'BLOCK_PUZZLE',
    //   key: formState.verify,
    //   loginBindType:'PASSWORD',
    //   registerNewUser:false,
    //   tokenId: props.tokenId,
    // }
    params = {
      authType: "PASSWORD",
      bindType: props.loginType,
      tokenId: props.tokenId,
      authParam: {
        username: formState.username,
        password: formState.password,
      },
    };
  }
  request(params)
    .then(async (token) => {
      if (token) {
        if (token.details) {
          if (token.details === "ACCOUNT") {
            accError.show = true;
            accError.error = token.message;
          } else if (token.details === "PASSWORD") {
            pasError.show = true;
            pasError.error = token.message;
          } else if (token.details === "CAPTCHA") {
            proxy.$message.warn(token.message);
            formState.verify = "";
          }
          state.subLoading = false;
          return;
        }
        if (state.remember) {
          localStorage.setItem(
            "cube-login-info",
            JSON.stringify({
              username: formState.username,
              password: Crypto.encrypt(formState.password),
            }),
          );
        } else {
          localStorage.removeItem("cube-login-info");
        }
        CubeMfRootGlobalState.getInstance().mfRootState.setAuthInfo(
          {
            token: token.access_token,
            tenant: "",
            terminal: CubeTerminalEnum.BUSINESS,
          },
          token.refresh_token,
          token.jti,
        );

        const systemTitleStore = useSystemTitleStore();
        systemTitleStore.loadInfoForLoginPage();
        await getTenantList();
      } else {
        getLoginCode();
      }
      state.subLoading = false;
    })
    .catch((error) => {
      formState.verify = "";
      logger.error(error);
      getLoginCode();
      state.subLoading = false;
    });
};
const getTenantList = async () => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
  const data = await api.tenant();
  let tenant = "";
  if (data && data instanceof Array) {
    if (data.length === 0) {
      proxy.$message.warn("该用户未加入企业");
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
    // 自动切换到上一次登录切换的租户
    const tenants = data?.map((item) => item.code);
    const lastTenantId = lastLoginTenant();
    if (lastTenantId && tenants?.includes(lastTenantId)) tenant = lastTenantId;

    cubeMfRootGlobalState.mfRootState.setAuthInfo({
      ...cubeMfRootGlobalState.mfRootState.authInfo,
      tenant: tenant,
    });
    await cubeMfRootGlobalState.initGlobalState();
    await redirectAfterLogin(props.loginSuccessRedirectPath, router);
  } else {
    proxy.$message.warn("该用户未加入企业");
  }
};
const resetForm = () => {
  formRef.value.resetFields();
};
const getLoginCode = () => {
  new CubeAuthService(CubeTerminalEnum.BUSINESS).getCode().then((res) => {
    state.loginKey = res.key;
    state.loginCode = res.code;
  });
};
const scale = ref(1);
function calcScale() {
  scale.value = document.body.clientWidth / 1920;
}
onMounted(() => {
  sessionStorage.clear();
  getLoginCode();
  const loginCache = localStorage.getItem("cube-login-info") ? JSON.parse(localStorage.getItem("cube-login-info")) : {};
  if (loginCache.username && loginCache.password) {
    formState.username = loginCache.username;
    formState.password = Crypto.decrypt(loginCache.password);
    state.remember = true;
  }
  scale.value = document.body.clientWidth / 1920;
  window.addEventListener("resize", calcScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calcScale);
});

const clearAccError = () => {
  accError.show = false;
  accError.error = "";
};

const clearPasError = () => {
  pasError.show = false;
  pasError.error = "";
};
</script>
<style lang="less" scoped>
.identify {
  display: flex;
  align-items: center;

  .login-code {
    height: calc((46 / var(--design-width)) * 100vw);
    cursor: pointer;
    margin-left: calc((10 / var(--design-width)) * 100vw);
  }
}

.remember-account {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc((8 / var(--design-width)) * 100vw);
  overflow: hidden;

  label {
    font-size: calc((12 / var(--design-width)) * 100vw) !important;
  }

  margin-bottom: 0 !important;

  :deep(.ant-checkbox-wrapper) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    line-height: calc((18 / var(--design-width)) * 100vw);
    white-space: nowrap;
  }

  :deep(.ant-checkbox) {
    top: 0;
    flex: 0 0 auto;
  }

  :deep(.remember-account__checkbox) {
    flex: 0 0 auto;
  }
}

:deep(.ant-form-item) {
  margin-bottom: calc((24 / var(--design-width)) * 100vw);

  .ant-form-item-explain-error {
    text-align: left;
    font-size: calc((14 / var(--design-width)) * 100vw);
  }
}

:deep(.ant-form-item-has-error) {
  margin-bottom: calc((38 / var(--design-width)) * 100vw);
}

:deep(.ant-form-item-control) {
  min-height: calc((46 / var(--design-width)) * 100vw);
}

:deep(.ant-form-item-control-input) {
  min-height: calc((46 / var(--design-width)) * 100vw);

  .ant-input-affix-wrapper {
    border-color: #e2e7f5 !important;
    border-radius: calc((2 / var(--design-width)) * 100vw);
    height: calc((46 / var(--design-width)) * 100vw);

    input {
      display: flex;
      align-items: center;
      line-height: normal;
      font-size: calc((16 / var(--design-width)) * 100vw);

      &::placeholder {
        font-size: calc((16 / var(--design-width)) * 100vw);
        display: flex;
        align-items: center;
      }
    }
  }

  .ant-input-clear-icon {
    font-size: calc((12 / var(--design-width)) * 100vw);
    margin: 0 calc((4 / var(--design-width)) * 100vw);
  }

  .ant-input-password-icon {
    font-size: calc((12 / var(--design-width)) * 100vw);
  }

  .ant-input-prefix {
    font-size: calc((18 / var(--design-width)) * 100vw);
    margin-right: calc((22 / var(--design-width)) * 100vw);
    margin-left: calc((9 / var(--design-width)) * 100vw);
  }
}

:deep(.ant-btn-block) {
  height: calc((50 / var(--design-width)) * 100vw);
  font-size: calc((18 / var(--design-width)) * 100vw);
}

:deep(.ant-checkbox + span) {
  padding-left: calc((4 / var(--design-width)) * 100vw);
}

.bind-btn {
  width: 100%;
  height: calc((50 / var(--design-width)) * 100vw);
}

.bindBody {
  margin-top: calc((38 / var(--design-width)) * 100vw);

  .back {
    text-align: right;
    color: #1578ff;
    cursor: pointer;
    font-size: calc((14 / var(--design-width)) * 100vw);
    margin-bottom: 8px;
  }
}

.verifyBody {
  height: calc((45 / var(--design-width)) * 100vw);
  width: 100%;
  background-color: rgb(51, 123, 247);
  line-height: calc((45 / var(--design-width)) * 100vw);
  font-size: calc((16 / var(--design-width)) * 100vw);
  color: white;
  cursor: pointer;
  text-align: center;
}

.verifyed {
  height: calc((45 / var(--design-width)) * 100vw);
  width: 100%;
  background-color: rgb(114, 192, 64);
  line-height: calc((45 / var(--design-width)) * 100vw);
  font-size: calc((16 / var(--design-width)) * 100vw);
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-footer {
  padding: calc((10 / var(--design-width)) * 100vw) 0;
  display: flex;
  justify-content: flex-end;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: #666;
  cursor: pointer;
}

.copyright {
  color: #1578ff;
}

.remember-account {
  text-align: left;
  transform-origin: left top;
}

.bind-tip {
  height: calc((14 / var(--design-width)) * 100vw);
}

.error {
  position: absolute;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: red;
}

.error-input {
  border-color: #ff4d4f !important;
}

.error-input:hover {
  border-color: #ff4d4f !important;
}

.error-input:focus,
.error-input:focus-within {
  border-color: #ff4d4f !important;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
}

.login-body {
  text-align: center;
  padding-bottom: calc((20 / var(--design-width)) * 100vw);
}

.login-title {
  font-size: calc((23 / var(--design-width)) * 100vw);
  font-weight: 500;
  padding-bottom: calc((10 / var(--design-width)) * 100vw);
}

.login-btn-pending-agreement {
  opacity: 0.58;
  box-shadow: none !important;
}

.login-btn-pending-agreement:hover,
.login-btn-pending-agreement:focus {
  opacity: 0.72;
}
</style>
