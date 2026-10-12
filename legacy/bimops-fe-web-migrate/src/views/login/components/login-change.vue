<template>
  <div class="forget-password-container">
    <div class="forget-title">修改密码</div>
    
    <a-form ref="formRef" :model="formState" :rules="rules" layout="horizontal">
      <a-form-item name="password">
        <a-input-password
          v-model:value="formState.password" 
          :placeholder="state.currentPasswordPlaceholder" 
          type="password"
          allowClear
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item name="password2">
        <a-input-password
          v-model:value="formState.password2" 
          :placeholder="state.currentPassword2Placeholder" 
          type="password"
          allowClear
        >
          <template #prefix>
            <lock-outlined />
          </template>
        </a-input-password>
      </a-form-item>

      <div style="height: calc((20 / var(--design-width)) * 100vw);"></div>
      <a-form-item>
        <a-button type="primary" block @click="handleNext" :loading="state.loading">
          确认
        </a-button>
         <div class="login-footer" >
          <span @click="backToLogin">其它方式?</span>
        </div>
      </a-form-item>
      

    </a-form>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { LockOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import * as api from '@/api';
import Verify from './verifition/Verify.vue';
import Crypto from "@/utils/crypto.js";

// 定义props，接收data参数
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['back-to-login','back-to-login-submit']);

// 表单引用
const formRef = ref();
const verify = ref();

// placeholder滚动展示相关配置
const passwordPlaceholders = [
 '请输入密码'
];

const password2Placeholders = [
  '再一次输入密码',
];

// 响应式状态
const state = reactive({
  loading: false,
  // placeholder滚动相关
  currentPasswordPlaceholder: passwordPlaceholders[0],
  currentPassword2Placeholder: password2Placeholders[0],
  placeholderTimer: null,
  passwordPlaceholderIndex: 0,
  password2PlaceholderIndex: 0
});

// 表单数据
const formState = reactive({
  password: '',
  password2: '',
});

// 表单验证规则
const rules = {
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'change',
    },
    {
      validator: validatePassword,
      trigger: 'change',
    }
  ],
  password2: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: 'change',
    },
    {
      validator: validatePassword2,
      trigger: 'change',
    }
  ],
};

/**
 * 验证密码格式
 */
function validatePassword(rule, value) {
  if (!value) return Promise.resolve();
  
  // 密码必须包含字母大写、小写、数字、特殊字符(~!@#$%^&*,.&<=[),且长度大于8位！
  const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~!@#$%^&*,.&<=[])[\a-zA-Z\d~!@#$%^&*,.&<=[]{7,}$/;
  
  if (passwordReg.test(value)) {
    return Promise.resolve();
  }
  
  return Promise.reject('密码必须包含字母大写、小写、数字、特殊字符(~!@#$%^&*,.&<=[),且长度大于8位！');
}

/**
 * 验证两次密码是否一致
 */
function validatePassword2(rule, value) {
  if (!value) return Promise.resolve();
  
  if (value === formState.password) {
    return Promise.resolve();
  }
  
  return Promise.reject('两次输入的密码不一致');
}

/**
 * 开始placeholder滚动展示
 */
function startPlaceholderRotation() {
  // 清除之前的定时器
  clearInterval(state.placeholderTimer);
  
  // 设置新的定时器，每3秒切换一次placeholder
  state.placeholderTimer = setInterval(() => {
    // 密码输入框placeholder轮换
    state.passwordPlaceholderIndex = (state.passwordPlaceholderIndex + 1) % passwordPlaceholders.length;
    state.currentPasswordPlaceholder = passwordPlaceholders[state.passwordPlaceholderIndex];
    
    // 确认密码输入框placeholder轮换
    state.password2PlaceholderIndex = (state.password2PlaceholderIndex + 1) % password2Placeholders.length;
    state.currentPassword2Placeholder = password2Placeholders[state.password2PlaceholderIndex];
  }, 900);
}


/**
 * 修改密码
 */
function changePassword() {
  // 构建请求参数，包含从props.data中获取的resetSessionId和secret
  const params = {
    newPassword: Crypto.encrypt(formState.password,props.data?.secret),
    confirmPassword: Crypto.encrypt(formState.password2,props.data?.secret)
  };
  
  // 如果有data参数，添加到请求中
  if (props.data && props.data.resetSessionId) {
    params.resetSessionId = props.data.resetSessionId;
  }

  
  // 调用修改密码API
  api.changePassword(params).then(res => {
      message.success('找回密码成功');
      // 返回登录页
      setTimeout(() => {
        // backToLogin();
         emit('back-to-login-submit', 'back');
      }, 500);
  }).catch(err => {
    message.error('修改密码失败，请稍后重试');
    state.loading = false;
  });
}

/**
 * 确认按钮点击处理
 */
function handleNext() {
  formRef.value.validate().then(() => {
    state.loading = true;
    changePassword();
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

// 组件挂载时启动placeholder轮换
onMounted(() => {
  // 启动placeholder轮换
  startPlaceholderRotation();
});

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  clearInterval(state.placeholderTimer);
});
</script>

<style lang="less" scoped>
.forget-password-container {
  margin-top: calc((30 / var(--design-width)) * 100vw);
  margin-bottom: calc((80 / var(--design-width)) * 100vw);
  width: 100%;
  
  .forget-title {
    font-size: calc((20 / var(--design-width)) * 100vw);
    font-weight: 500;
    color: #333;
    text-align: center;
    margin-bottom: calc((38 / var(--design-width)) * 100vw);
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
    margin-top: calc((16 / var(--design-width)) * 100vw);
    font-size: calc((16 / var(--design-width)) * 100vw);
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
        transition: opacity 0.3s ease;
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
</style>