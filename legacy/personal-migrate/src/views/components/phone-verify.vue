<template>
  <a-form ref="formRef" :model="formState" :rules="rules" layout="horizontal" @finish="handleFinish">
    <a-form-item label="" name="phone">
      <a-input v-model:value="formState.phone" :disabled="props.changePhone !==''" type="text" placeholder="手机号" allowClear>
        <template #prefix>
          <user-outlined />
        </template>
      </a-input>
    </a-form-item>
    <a-form-item label="" name="verifyCode">
      <div class="identify">
        <a-input v-model:value="formState.verifyCode" type="text" placeholder="验证码" allowClear ref="verifyInputRef">
          <template #prefix>
            <verified-outlined style="color: #C0C6D4;" />
          </template>
        </a-input>
        <div class="get-code-btn" :class="{ 'disabled': state.codeBtnDisabled }" @click="getCode">
          {{ state.codeText }}
        </div> 
      </div>
    </a-form-item>

    <!-- <a-form-item style="margin-bottom: 0;">
      <a-button :loading="state.subLoading" type="primary" html-type="submit" block class="login-btn">
        登录
      </a-button>
    </a-form-item> -->
      
    <!-- <Teleport to="body"> -->
    <Verify
        @success="success" 
        mode="pop"     
        captchaType="blockPuzzle"   
        :imgSize="{ width: '330px', height: '155px' }"
        ref="verify"
    ></Verify>
  <!-- </Teleport> -->
  </a-form>
</template>
<script  setup>
import { onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { UserOutlined, VerifiedOutlined } from '@ant-design/icons-vue'
import Verify from './verifition/Verify.vue'
import { message } from "ant-design-vue";
import { cubeOuaaService } from '@/api/server'

// 正确使用 defineEmits
const emit = defineEmits(['success','loading']);
// const { proxy } = getCurrentInstance();
const formRef = ref();
const verify = ref();
const verifyInputRef = ref()
const state = reactive({
  subLoading: false,
  remember: false,
  codeBtnDisabled: false,
  codeText: '获取验证码',
  timer: null,
  countdown: 60
});
const formState = reactive({
  phone: "",
  verifyCode: ""
});
const props = defineProps({
  changePhone: {
      type: String,
    default: ''
  }
});
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
    }
  ],
  verifyCode: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "change",
    },
  ],
};

const success = (params) =>{
  getVerifyCode(params)
}
const getCode = () =>{
  if(state.codeBtnDisabled){
    return;
  }
  formRef.value.validateFields(['phone']).then(() => {
    formState.verifyCode = '' 
     useVerify()
  }).catch(() => {
    // 手机号验证失败
  });
 
}
const useVerify = () =>{
     verify.value.show()
  }
/**
 * 处理表单提交
 */
const handleFinish = async () => {
  formRef.value.validate().then(() => { 
       emit('loading',true)
      const params = {
        tel: formState.phone,
        code: formState.verifyCode
      }
      if(props.changePhone !== ''){
        cubeOuaaService.unbindPhone(params).then(res => { 
          emit('success')
          }).catch(err => {
            message.error(err?.errorMessage||'验证失败，请重试');
        }).finally(() => {
          emit('loading',false)
        });
      }else{
      cubeOuaaService.bindPhone(params).then(res => { 
        emit('success')
      }).catch(err => {
          message.error(err?.errorMessage||'验证失败，请重试');
      }).finally(() => {
          emit('loading',false)
        });
      }
    emit('loading',false)
    
  }).catch(() => {
    // 表单验证失败
  });

 
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
  formRef.value.validateFields(['phone']).then(() => {
    // 检查是否在限制时间内
    const lastSendTime = localStorage.getItem('verify-code-last-send-time');
    const currentTime = new Date().getTime();
    
    if (lastSendTime && (currentTime - parseInt(lastSendTime)) < 120000) {
      // 如果上次发送时间距离现在不足1分钟，计算剩余时间
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
    localStorage.setItem('verify-code-last-send-time', currentTime.toString());
    
    const newParams = {
      captchaVerification: params.captchaVerification,
      tel: formState.phone
    }
    
    // 调用发送验证码的API
    cubeOuaaService.getsmsCode(newParams).then(res => {
      message.success('验证码发送成功');
      startCountdown();
    }).catch(err => {
      message.error(err?.errorMessage||'验证码发送失败');
      state.codeBtnDisabled = false;
      state.codeText = '获取验证码';
      localStorage.removeItem('verify-code-last-send-time');
      clearInterval(state.timer);
    });
  }).catch(() => {
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
    state.codeText = `${state.countdown}秒后重新获取`;
    // 同步更新localStorage中的时间
    const lastSendTime = localStorage.getItem('verify-code-last-send-time');
    if (lastSendTime) {
      const elapsedSeconds = Math.floor((new Date().getTime() - parseInt(lastSendTime)) / 1000);
      if (elapsedSeconds >= 60) {
        clearInterval(state.timer);
        state.codeBtnDisabled = false;
        state.codeText = '获取验证码';
        localStorage.removeItem('verify-code-last-send-time');
      }
    } else {
      clearInterval(state.timer);
      state.codeBtnDisabled = false;
      state.codeText = '获取验证码';
    }
  }, 1000);
};

const scale = ref(1);
function calcScale() {
  scale.value = document.body.clientWidth / 1920
}

onMounted(() => {
  // sessionStorage.clear()
  if (props.changePhone) {
    formState.phone = props.changePhone
    state.remember = true
  }
  
  // 检查是否有未过期的验证码倒计时
  const lastSendTime = localStorage.getItem('verify-code-last-send-time');
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
      localStorage.removeItem('verify-code-last-send-time');
    }
  }
  
  scale.value = document.body.clientWidth / 1920
  window.addEventListener("resize", calcScale);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calcScale);
  if (state.timer) {
    clearInterval(state.timer);
  }
});
// 导出方法供父组件调用
defineExpose({
  handleFinish,
  resetForm,
  getVerifyCode
});
</script>
<style lang="less" scoped>
.identify {
  display: flex;
  align-items: center;
  border: 1px solid #E2E7F5;
  border-radius: calc((2 / 1px) * 100vw);
  height: calc((46 / 1px) * 100vw);
  overflow: hidden;

  .get-code-btn {
    height: 100%;
    white-space: nowrap;
    font-size: calc((14 / 1px) * 100vw);
    color: #4080FF;
    cursor: pointer;
    padding: 0 calc((15 / 1px) * 100vw);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    transition: all 0.3s;
    min-width: calc((100 / 1px) * 100vw);
    margin-right:10px ;
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

.remember-account {
  text-align: left;
  transform-origin: left top;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
  .ant-form-item-explain-error {
    text-align: left;
    font-size: calc((14 / 1px) * 100vw);
  }
}

:deep(.ant-form-item-control) {
  height: 46px;
}

:deep(.ant-form-item-control-input) {
  min-height: 38px;

  .ant-input-affix-wrapper {
    border-color: #e2e7f5 !important;
    border-radius: 2px;
    height: 38px;

    input {
      display: flex;
      align-items: center;
      line-height: normal;
      font-size: 14px;

      &::placeholder {
        font-size: 14px;
        display: flex;
        align-items: center;
        color: #C0C6D4;
      }
    }
  }

  .ant-input-clear-icon {
    font-size: 14px;
    margin: 0 4px;
  }


  .ant-input-prefix {
    font-size: 16px;
    margin-right: 8px;
    margin-left: 0px;
  }
}

:deep(.ant-btn-block) {
  height: 50px;
  font-size: 18px;
}

:deep(.ant-checkbox+span) {
  padding-left: 4px;
}
</style>