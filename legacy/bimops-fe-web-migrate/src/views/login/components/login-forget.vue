<template>
  <div class="forget-password-container">
  <div class="login-body">
    <div class="login-title">  验证手机 </div>
   
     <span> 请输入要找回账号对应的手机号： </span>
  </div>

    <a-form ref="formRef" :model="formState" :rules="rules" layout="horizontal">
      <a-form-item name="account">
        <a-input 
          v-model:value="formState.account" 
          placeholder="输入手机号码" 
          allowClear
           :class="{ 'error-input': accError.show }"
        >
          <template #prefix>
            <user-outlined />
          </template>
        </a-input>
        <div v-show="accError.show" class="error">{{ accError.error }}</div>
      </a-form-item>
      
      <a-form-item name="verifyCode">
        <div class="identify">
          <a-input 
            v-model:value="formState.verifyCode" 
            placeholder="输入验证码" 
            allowClear
            ref="verifyInputRef"
          >
            <template #prefix>
              <safety-outlined />
            </template>
          </a-input>
          <div 
            class="get-code-btn" 
            :class="{ 'disabled': state.codeBtnDisabled }" 
            @click="getCode"
          > 
            {{ state.codeText }}
          </div>
        </div>
      </a-form-item>
        <div style="height: calc((20 / var(--design-width)) * 100vw);;"></div>
      <a-form-item>
        <a-button type="primary" block @click="handleNext" :loading="state.loading">
          下一步
        </a-button>
        <div class="login-footer" >
        <!-- <span @click="backToLogin" style="margin-right: 10px;">返回登录</span> -->
        <span @click="backToLogin">其它方式?</span>
      </div>
      </a-form-item>
      
      
    </a-form>

    <Teleport to="body">
      <Verify
        @success="success" 
        mode="pop"     
        captchaType="blockPuzzle"   
        :imgSize="{ width: '330px', height: '155px' }"
        ref="verify"
      ></Verify>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { UserOutlined, SafetyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import * as api from '@/api';
import Verify from './verifition/Verify.vue';
import { logger } from '@/logger';

const { proxy } = getCurrentInstance();
const emit = defineEmits(['back-to-login',]);

// 表单引用
const formRef = ref();
const verify = ref();
const verifyInputRef = ref();

// 响应式状态
const state = reactive({
  loading: false,
  codeBtnDisabled: false,
  codeText: '获取验证码',
  timer: null,
  countdown: 60,
});

// 表单数据
const formState = reactive({
  account: '',
  verifyCode: '',
});

// 表单验证规则
const rules = {
  account: [
    {
      required: true,
      message: '请输入手机号码或邮箱',
      trigger: 'change',
    },
    {
      validator: validateAccount,
      trigger: 'change',
    },
  ],
  verifyCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'change',
    },
  ],
};

/**
 * 验证账号格式（手机号或邮箱）
 */
function validateAccount(rule, value) {
  if (!value) return Promise.resolve();
  
  // 手机号正则
  const phoneReg = /^1[3-9]\d{9}$/;
  // 邮箱正则
  const emailReg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
  
  if (phoneReg.test(value) || emailReg.test(value)) {
    return Promise.resolve();
  }
  
  return Promise.reject('请输入正确的手机号或邮箱格式');
}

/**
 * 获取验证码
 */
function getCode() {
  // if (state.codeBtnDisabled) return;
  
  formRef.value.validateFields(['account']).then(() => {
    // 显示滑动验证
    useVerify();
  }).catch(err => {
  });
}

/**
 * 使用滑动验证
 */
function useVerify() {
  verify.value.show();
}

/**
 * 滑动验证成功回调
 */
function success(params) {
  getVerifyCode(params);
}
const accError = reactive({
  show:false,
  error:''
})
/**
 * 获取验证码
 */
const getVerifyCode = (params) => {
  formRef.value.validateFields(['account']).then(() => {
    // 检查是否在限制时间内
    const lastSendTime = localStorage.getItem('forgetPwdLastSendTime');
    const currentTime = new Date().getTime();
    
    if (lastSendTime && (currentTime - parseInt(lastSendTime)) < 120000) {
      // 如果上次发送时间距离现在不足2分钟，计算剩余时间
      const remainingSeconds = 60 - Math.floor((currentTime - parseInt(lastSendTime)) / 1000);
      state.countdown = remainingSeconds > 0 ? remainingSeconds : 0;
      state.codeBtnDisabled = true;
      state.codeText = `${state.countdown}秒后重新获取`;
      
      // 重新启动倒计时
      startCountdown();
      message.warning('请勿频繁获取验证码');
      return;
    }
    
    state.codeBtnDisabled = true;
    state.countdown = 60;
    state.codeText = `${state.countdown}秒后重新获取`;
    
    // 记录发送验证码的时间
    localStorage.setItem('forgetPwdLastSendTime', currentTime.toString());
    
    const newParams = {
      captchaVerification: params.captchaVerification,
      tel: formState.account,
      sendSmsCodeType: 'RESET_PASSWORD'
    }
    
    // 调用发送验证码的API
    api.getsmsCode(newParams).then(res => {
        if(res.details){
          if(res.details === "ACCOUNT"){
            accError.show = true
            accError.error = res.message
          }else if (token.details === "SMS"){
            accError.show = true
            accError.error = res.message
          }
        }else{
        message.success('验证码发送成功');
        }
        startCountdown();
    }).catch(err => {
      state.codeBtnDisabled = false;
      state.codeText = '获取验证码';
      localStorage.removeItem('forgetPwdLastSendTime');
      clearInterval(state.timer);
    });
  }).catch(() => {
    // 账号验证失败
  });
};

/**
 * 开始倒计时
 */
const startCountdown = () => {
  if (state.timer) {
    clearInterval(state.timer);
  }
  
  state.timer = setInterval(() => {
    state.countdown--;
    state.codeText = `${state.countdown}秒后重新获取`;
    
    // 同步更新localStorage中的时间
    const lastSendTime = localStorage.getItem('forgetPwdLastSendTime');
    if (lastSendTime) {
      const elapsedSeconds = Math.floor((new Date().getTime() - parseInt(lastSendTime)) / 1000);
      if (elapsedSeconds >= 60) {
        clearInterval(state.timer);
        state.codeBtnDisabled = false;
        state.codeText = '获取验证码';
        localStorage.removeItem('forgetPwdLastSendTime');
      }
    } else {
      clearInterval(state.timer);
      state.codeBtnDisabled = false;
      state.codeText = '获取验证码';
    }
  }, 1000);
};

/**
 * 下一步按钮点击处理
 */
function handleNext() {
  formRef.value.validate().then(() => {
    state.loading = true;
    
    // 调用验证码验证API
    api.getPasswordToken({
      tel: formState.account,
      code: formState.verifyCode
    }).then(res => {
      // 存储账号信息到localStorage，以便修改密码页面使用
      localStorage.setItem('reset-password-account', formState.account);
      state.loading = false;
      emit('back-to-login', 'submit',res);
    }).catch((error) => {
      logger.error(error);
    }).finally(() => {
      state.loading = false;
    }); 
  }).catch(err => {
  });
}

/**
 * 返回登录页
 */ 
function backToLogin() {
  // 触发父组件的事件，切换回登录页
  emit('back-to-login', 'back');
}

// 组件挂载时，检查是否有未过期的倒计时
onMounted(() => {
  // 检查是否有未过期的验证码倒计时
  const lastSendTime = localStorage.getItem('forgetPwdLastSendTime');
  if (lastSendTime) {
    const currentTime = new Date().getTime();
    const elapsedSeconds = Math.floor((currentTime - parseInt(lastSendTime)) / 1000);
    
    if (elapsedSeconds < 60) {
      // 如果倒计时未结束，恢复倒计时状态
      state.countdown = 60 - elapsedSeconds;
      state.codeBtnDisabled = true;
      state.codeText = `${state.countdown}秒后重新获取`;
      startCountdown();
    } else {
      // 倒计时已结束，清除记录
      localStorage.removeItem('forgetPwdLastSendTime');
    }
  }
});

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  clearInterval(state.timer);
});
</script>

<style lang="less" scoped>
.forget-password-container {
  margin-top: calc((30 / var(--design-width)) * 100vw);;
  margin-bottom: calc((70 / var(--design-width)) * 100vw);;
  width: 100%;
  
  .forget-title {
    font-size: calc((20 / var(--design-width)) * 100vw);;
    font-weight: 500;
    color: #333;
    text-align: center;
    margin-bottom:calc((38 / var(--design-width)) * 100vw);;
  }
  
 .identify {
  display: flex;
  align-items: center;
  border: 1px solid #E2E7F5;
  border-radius: calc((2 / var(--design-width)) * 100vw);
  height: calc((46 / var(--design-width)) * 100vw);
  overflow: hidden;

  .get-code-btn {
    height: 100%;
    white-space: nowrap;
    font-size: calc((14 / var(--design-width)) * 100vw);
    color: #4080FF;
    cursor: pointer;
    padding: 0 calc((15 / var(--design-width)) * 100vw);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    transition: all 0.3s;
    min-width: calc((100 / var(--design-width)) * 100vw);
    
    &.disabled {
      color: #C0C6D4;
      cursor: not-allowed;
    }
    
  
  }
  
  :deep(.ant-input-affix-wrapper) {
    border: none !important;
    box-shadow: none !important;
    height: 100%;
    
    &:focus, &-focused {
      box-shadow: none !important;
    }
  }
}
  
  .back-login {
    text-align: center;
    margin-top: calc((16 / var(--design-width)) * 100vw);;
    font-size: calc((16 / var(--design-width)) * 100vw);;
    color: #1890ff;
    cursor: pointer;
  }
}


:deep(.ant-form-item) {
  margin-bottom: calc((24 / var(--design-width)) * 100vw);
  .ant-form-item-explain-error {
    text-align: left;
    font-size: calc((14 / var(--design-width)) * 100vw);
  }
}

:deep(.ant-form-item-control) {
  height: calc((46 / var(--design-width))* 100vw);
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
    margin-left: calc((9 / var(--design-width)) * 100vw)
  }
}

:deep(.ant-btn-block) {
  height: calc((50 / var(--design-width)) * 100vw);
  font-size: calc((18 / var(--design-width)) * 100vw);
}

:deep(.ant-checkbox+span) {
  padding-left: calc((4 / var(--design-width)) * 100vw);
}
.login-footer{
  padding: calc((10 / var(--design-width)) * 100vw) 0;
  display: flex;
  justify-content: flex-end;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: #666;
  cursor: pointer;
  color: #1578ff;

}
.login-body{
 padding-bottom: calc((30 / var(--design-width)) * 100vw);
  span{
  color:#666
 }
}
.error{
  position: absolute;
  font-size: calc((14 / var(--design-width)) * 100vw);
  color: red;
}
.error-input {
  border-color: #ff4d4f !important;
}
.login-title{
  font-size: calc((23 / var(--design-width)) * 100vw);
  font-weight: 500;
   padding-bottom: calc((10 / var(--design-width)) * 100vw);
}
</style>