<template>
  <div class="login-body">
    <div class="login-title">{{ !props.bind ? "手机登录" : "绑定账号" }}</div>

    <span v-if="props.bind"> 请输入平台账号对应的手机号并验证： </span>
  </div>

  <a-form ref="formRef" :model="formState" :rules="rules" layout="horizontal" @finish="handleFinish">
    <a-form-item label="" name="phone">
      <a-input v-model:value="formState.phone" type="text" placeholder="手机号" @input="clearAccError" allowClear>
        <template #prefix>
          <user-outlined />
        </template>
      </a-input>
      <div v-show="accError.show" class="error">{{ accError.error }}</div>
    </a-form-item>
    <a-form-item label="" name="verifyCode">
      <div class="identify">
        <a-input
          v-model:value="formState.verifyCode"
          @input="clearPasError"
          type="text"
          placeholder="验证码"
          allowClear
          ref="verifyInputRef"
        >
          <template #prefix>
            <verified-outlined style="color: #c0c6d4" />
          </template>
        </a-input>
        <div class="get-code-btn" :class="{ disabled: state.codeBtnDisabled, 'agreement-pending': isAgreementPending }" @click="getCode">
          {{ state.codeText }}
        </div>
      </div>
      <div v-show="pasError.show" class="error">{{ pasError.error }}</div>
    </a-form-item>
    <div class="remember-account" v-if="!props.bind">
      <userAggrement
        ref="agreementRef"
        @accepted-change="handleAgreementAcceptedChange"
        @confirm-accepted="handleAgreementConfirmAccepted"
        @confirm-rejected="handleAgreementConfirmRejected"
      />
    </div>
    <div class="login-footer" v-if="props.smsCode">
      <div class="copyright" @click="changeMethods('password')">忘记密码？</div>
    </div>
    <a-form-item style="margin-bottom: 0">
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
    <Teleport to="body">
      <Verify @success="success" mode="pop" captchaType="blockPuzzle" :imgSize="{ width: '330px', height: '155px' }" ref="verify"></Verify>
    </Teleport>
  </a-form>
</template>
<script setup>
import { UserOutlined, LockOutlined, VerifiedOutlined } from "@ant-design/icons-vue";
import { get } from "lodash";
import qs from "qs";
import { computed, defineComponent, getCurrentInstance, onBeforeMount, onBeforeUnmount, onMounted, reactive, ref, toRefs } from "vue";
import { useRouter } from "vue-router";

import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";

import { redirectAfterLogin } from "../utils/login-success-redirect";
import userAggrement, { isLoginAgreementAccepted } from "./user-aggrement.vue";
import Verify from "./verifition/Verify.vue";
import * as api from "@/api";
import { logger } from "@/logger";
import Crypto from "@/utils/crypto.js";

// 定义props，接收data参数
const props = defineProps({
  bind: {
    type: Boolean,
    default: false,
  },
  loginType: {
    type: String,
    default: "WECHAT",
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
const verify = ref();
const verifyInputRef = ref();
const state = reactive({
  subLoading: false,
  remember: false,
  codeBtnDisabled: false,
  codeText: "获取验证码",
  timer: null,
  countdown: 60,
});
const accError = reactive({
  show: false,
  error: "",
});
const pasError = reactive({
  show: false,
  error: "",
});
const formState = reactive({
  phone: "",
  verifyCode: "",
});
const agreementRef = ref();
const agreementRejectCount = ref(0);
const agreementAccepted = ref(isLoginAgreementAccepted());
const pendingAgreementAction = ref(null);

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
const router = useRouter();
const rules = {
  phone: [
    {
      required: true,
      message: "请输入手机号",
      trigger: "change",
    },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "change",
    },
  ],
  verifyCode: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "change",
    },
  ],
};

const success = (params) => {
  getVerifyCode(params);
};
const getCode = () => {
  if (state.codeBtnDisabled) {
    return;
  }
  if (!validateLoginAgreement(getCode)) {
    return;
  }
  formRef.value
    .validateFields(["phone"])
    .then(() => {
      formState.verifyCode = "";
      useVerify();
    })
    .catch(() => {
      // 手机号验证失败
    });
};
const clearAccError = () => {
  accError.show = false;
  accError.error = "";
};

const clearPasError = () => {
  pasError.show = false;
  pasError.error = "";
};
const useVerify = () => {
  verify.value.show();
};
const bind = () => {
  emit("bind", formState);
};
const back = () => {
  emit("back");
};
/**
 * 处理表单提交
 */
const handleFinish = async () => {
  if (!validateLoginAgreement(handleFinish)) {
    return;
  }

  state.subLoading = true;
  let request = api.Login;
  let params = qs.stringify({
    grant_type: "sms",
    mobile: formState.phone,
    code: formState.verifyCode,
    registerNewUser: false,
  });
  if (props.bind) {
    // emit('bind',formState)
    // params =  qs.stringify({
    //   grant_type:props.loginType,
    //   principal: formState.phone,
    //   credentials: formState.verifyCode,
    //   code: formState.verifyCode,
    //   loginBindType:'SMS',
    //   registerNewUser:false,
    //   tokenId: props.tokenId,
    // })
    params = {
      authType: "SMS",
      bindType: props.loginType,
      tokenId: props.tokenId,
      authParam: {
        mobile: formState.phone,
        code: formState.verifyCode,
      },
    };
    request = api.LoginBind;
  }

  request(params)
    .then(async (token) => {
      if (token.status === 409) {
        emit("bind", token.details);
        state.subLoading = false;
        return;
      }
      if (token) {
        if (token.details) {
          if (token.details === "ACCOUNT") {
            accError.show = true;
            accError.error = token.message;
          } else if (token.details === "SMS") {
            pasError.show = true;
            pasError.error = token.message;
          }
          state.subLoading = false;
          return;
        }
        if (state.remember) {
          localStorage.setItem(
            "cube-login-info",
            JSON.stringify({
              phone: formState.phone,
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
        await getTenantList();
      }
      state.subLoading = false;
      formState.verifyCode = "";
    })
    .catch((error) => {
      logger.error(error);
      state.subLoading = false;
    });
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

/**
 * 重置表单
 */
const resetForm = () => {
  formRef.value.resetFields();
};

/**
 * 获取手机验证码
 */
const getVerifyCode = (params) => {
  formRef.value
    .validateFields(["phone"])
    .then(() => {
      // 检查是否在限制时间内
      const lastSendTime = localStorage.getItem("verify-code-last-send-time");
      const currentTime = new Date().getTime();

      if (lastSendTime && currentTime - parseInt(lastSendTime) < 120000) {
        // 如果上次发送时间距离现在不足1分钟，计算剩余时间
        const remainingSeconds = 60 - Math.floor((currentTime - parseInt(lastSendTime)) / 1000);
        state.countdown = remainingSeconds > 0 ? remainingSeconds : 0;
        state.codeBtnDisabled = true;
        state.codeText = `${state.countdown}秒`;

        // 重新启动倒计时
        startCountdown();
        proxy.$message.warning("请勿频繁获取验证码");
        return;
      }

      state.codeBtnDisabled = true;
      state.countdown = 60;
      state.codeText = `${state.countdown}秒`;

      // 记录发送验证码的时间
      localStorage.setItem("verify-code-last-send-time", currentTime.toString());

      const newParams = {
        captchaVerification: params.captchaVerification,
        tel: formState.phone,
      };

      // 调用发送验证码的API
      api
        .getsmsCode(newParams)
        .then((res) => {
          if (res.details) {
            if (res.details === "ACCOUNT") {
              accError.show = true;
              accError.error = token.message;
            }
            return;
          } else {
            proxy.$message.success("验证码发送成功");
          }
          startCountdown();
        })
        .catch((err) => {
          state.codeBtnDisabled = false;
          state.codeText = "获取验证码";
          localStorage.removeItem("verify-code-last-send-time");
          clearInterval(state.timer);
        });
    })
    .catch(() => {
      // 手机号验证失败
    });
};

/**
 * 启动倒计时
 */
const startCountdown = () => {
  if (state.timer) {
    clearInterval(state.timer);
  }

  state.timer = setInterval(() => {
    state.countdown--;
    state.codeText = `${state.countdown}秒`;
    // 同步更新localStorage中的时间
    const lastSendTime = localStorage.getItem("verify-code-last-send-time");
    if (lastSendTime) {
      const elapsedSeconds = Math.floor((new Date().getTime() - parseInt(lastSendTime)) / 1000);
      if (elapsedSeconds >= 60) {
        clearInterval(state.timer);
        state.codeBtnDisabled = false;
        state.codeText = "获取验证码";
        localStorage.removeItem("verify-code-last-send-time");
      }
    } else {
      clearInterval(state.timer);
      state.codeBtnDisabled = false;
      state.codeText = "获取验证码";
    }
  }, 1000);
};

const scale = ref(1);
function calcScale() {
  scale.value = document.body.clientWidth / 1920;
}

onMounted(() => {
  sessionStorage.clear();
  const loginCache = localStorage.getItem("cube-login-info") ? JSON.parse(localStorage.getItem("cube-login-info")) : {};
  if (loginCache.phone) {
    formState.phone = loginCache.phone;
    state.remember = true;
  }

  // 检查是否有未过期的验证码倒计时
  const lastSendTime = localStorage.getItem("verify-code-last-send-time");
  if (lastSendTime) {
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - parseInt(lastSendTime)) / 1000);

    if (elapsedSeconds < 60) {
      // 如果倒计时未结束，恢复倒计时状态
      state.countdown = 60 - elapsedSeconds;
      state.codeBtnDisabled = true;
      state.codeText = `${state.countdown}秒`;
      startCountdown();
    } else {
      // 倒计时已结束，清除记录
      localStorage.removeItem("verify-code-last-send-time");
    }
  }

  scale.value = document.body.clientWidth / 1920;
  window.addEventListener("resize", calcScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calcScale);
  if (state.timer) {
    clearInterval(state.timer);
  }
});
</script>
<style lang="less" scoped>
.identify {
  display: flex;
  align-items: center;
  border: 1px solid #e2e7f5;
  border-radius: calc((2 / var(--design-width)) * 100vw);
  height: calc((46 / var(--design-width)) * 100vw);
  overflow: hidden;

  .get-code-btn {
    height: 100%;
    white-space: nowrap;
    font-size: calc((14 / var(--design-width)) * 100vw);
    color: #4080ff;
    cursor: pointer;
    padding: 0 calc((15 / var(--design-width)) * 100vw);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    transition: all 0.3s;
    min-width: calc((100 / var(--design-width)) * 100vw);

    &.disabled {
      color: #c0c6d4;
      cursor: not-allowed;
    }

    &.agreement-pending:not(.disabled) {
      color: rgba(64, 128, 255, 0.55);
      background-color: #f7fbff;
    }
  }

  :deep(.ant-input-affix-wrapper) {
    border: none !important;
    box-shadow: none !important;
    height: 100%;

    &:focus,
    &-focused {
      box-shadow: none !important;
    }
  }
}

.remember-account {
  text-align: left;
  transform-origin: left top;
  margin-top: calc((-10 / var(--design-width)) * 100vw);
  margin-bottom: calc((20 / var(--design-width)) * 100vw) !important;
}

:deep(.ant-form-item) {
  margin-bottom: calc((24 / var(--design-width)) * 100vw);
  .ant-form-item-explain-error {
    text-align: left;
    font-size: calc((14 / var(--design-width)) * 100vw);
  }
}

:deep(.ant-form-item-control) {
  height: calc((46 / var(--design-width)) * 100vw);
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
        color: #c0c6d4;
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
.login-footer {
  margin-top: calc((-20 / var(--design-width)) * 100vw);
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
  span {
    color: #666;
  }
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
