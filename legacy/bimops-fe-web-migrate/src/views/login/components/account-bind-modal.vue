<template>
  <div class="account-bind-modal" v-if="visible">
    <div class="modal-overlay" @click="handleCancel"></div>
    <div class="modal-content">

      
      <div class="modal-body">
        <div v-if="!showForm">
        <div class="bind-info">
          <p class="bind-header">绑定账号</p>
          <p v-if="loginType === 'WECHAT'">当前微信未绑定，请选择绑定本平台账号:</p>
          <p v-else-if="loginType === 'SMS'">当前手机未绑定，请选择绑定本平台账号:</p>
        </div>

        <!-- 微信登录后的绑定选项 -->
        <div v-if="loginType === 'WECHAT'" class="bind-options">
          <div class="bind-option" @click="showBindForm('phone')" v-if="props.smsCode">
            <!-- <div class="option-icon phone-icon"><img src="@/assets/icons/image/phone.png" alt=""></div> -->
            <div class="option-content">
              <p>验证账号手机绑定</p>
            </div>
          </div>
          
          <div class="bind-option" @click="showBindForm('password')">
            <!-- <div class="option-icon password-icon"><img src="@/assets/icons/image/mac.png" alt=""> </div> -->
            <div class="option-content">
              <p>验证账号密码绑定</p>
            </div>
          </div>
        </div> 

        <!-- 短信登录后的绑定选项 -->
        <div v-else-if="loginType === 'SMS'" class="bind-options">
          <div class="bind-option" @click="showBindForm('wechat')" v-if="props.wechatCode">
            <!-- <div class="option-icon wechat-icon"><img src="@/assets/icons/image/wechat.png" alt=""></div> -->
            <div class="option-content">
              <p>验证账号微信绑定</p>
            </div>
          </div>
          
          <div class="bind-option" @click="showBindForm('password')">
            <!-- <div class="option-icon password-icon"><img src="@/assets/icons/image/mac.png" alt=""> </div> -->
            <div class="option-content">
              <p>验证账号密码绑定</p>
            </div>
          </div>
        </div>
        </div>
        <!-- 绑定表单 -->
        <div v-if="showForm" class="bind-form">
          <!-- 手机号绑定表单 -->
          <div v-if="bindMethod === 'phone'" class="form-content">
            <!-- <h4>手机号绑定</h4> -->
            <loginPhone :bind="true" :loginType="loginType" :tokenId="props.tokenId" :loginSuccessRedirectPath="props.loginSuccessRedirectPath" @bind="phoneBind" @back="back"/>
          </div>

          <!-- 密码绑定表单 -->
          <div v-else-if="bindMethod === 'password'" class="form-content">
            <!-- <h4>密码绑定</h4> -->
              <loginForm :bind="true" :tokenId="props.tokenId" :loginType="loginType" :loginSuccessRedirectPath="props.loginSuccessRedirectPath" @bind="formBind" @back="back"/>
          </div>

          <!-- 微信绑定表单 -->
          <div v-else-if="bindMethod === 'wechat'" class="form-content">
            <!-- <h4>微信绑定</h4> -->
            <div class="wechat-bind-content">
              <div class="qr-code-container">
                 <wxlogin
                  :appid="appid"
                  :scope="scope"
                  :redirect_uri="redirect_uri"
                  :state="wxstate"
                  :theme="theme"
                />
                <p class="qr-code-text">请使用微信扫描二维码完成绑定</p>
              </div>
            </div> 
            <div class="form-actions" >
            <!-- <a-button @click="showForm = false">返回</a-button> -->
            <div @click="showForm = false" class="back" >
              其它方式?
            </div>
            <!-- <a-button type="primary" @click="handleBind" :loading="binding">
              确认绑定
            </a-button> -->
          </div>
          </div>

          
        </div>

        <!-- 创建新账号选项 -->
        <!-- <div v-if="!showForm" class="create-account-section">
          <div class="divider">
            <div></div>
            <span>或</span>
            <div></div>
          </div>
          <a-button 
            type="dashed" 
            block 
            size="large" 
            @click="handleCreateAccount"
            :loading="creating"
          >
            不绑定，直接创建新账号
          </a-button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed ,onMounted,watch,getCurrentInstance,defineExpose } from 'vue'
import { message } from 'ant-design-vue'
import * as api from '@/api'
import { UserOutlined, LockOutlined, VerifiedOutlined } from '@ant-design/icons-vue'
import { CubeAuthService } from "@ghcloud/cube-auth-service";
import { CubeTerminalEnum } from "@ghcloud/cube-protocol";
import wxlogin from './vue-next-wxlogin/wxlogin.vue';
import loginPhone from './login-phone.vue';
import loginForm from './login-form.vue';
import qs from "qs";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loginType: {
    type: String, // 'wechat' | 'phone'
    required: true
  },
  tokenId: {
    type: String,
    default: ''
  },
   wechatCode:{
    type:Boolean,
    default: false
  },
  smsCode:{
    type:Boolean,
    default: false
  },
  loginSuccessRedirectPath: {
    type: String,
    default: '/index'
  },
})

const emit = defineEmits(['cancel', 'success', 'create-account'])
// 微信登录配置参数
const appid = ref('wxcb94649fa1496d1f'); // 请替换为实际的微信应用appid
const scope = ref('snsapi_login'); // 网页应用固定为snsapi_login
const redirect_uri = ref(encodeURIComponent(`https://cube-test.guhecloud.com:3000/login?tokenId=${props.tokenId}`)); // 添加协议和回调路径
const wxstate = ref('STATE'); // 可以是任意字符串，用于防止CSRF攻击
const theme = ref('black'); // 主题颜色
// 表单显示状态
const showForm = ref(false)
const bindMethod = ref('')
const binding = ref(false)
const creating = ref(false)
const { proxy } = getCurrentInstance();

const back = ()=> {
  showForm.value = false
}

const phoneBind = (params) =>{
}
const formBind = (params) =>{
}




// 显示绑定表单
const showBindForm = (method) => {
  bindMethod.value = method
  showForm.value = true
}


// 创建新账号
const handleCreateAccount = async () => {
  creating.value = true
  
  try {
    // 调用创建新账号API
    await api.Login(qs.stringify({
      grant_type: props.loginType,
      registerNewUser:true,
      tokenId: props.tokenId,
    }))
    
    message.success('账号创建成功')
    emit('create-account')
  } catch (error) {
    message.error('创建账号失败，请重试')
  } finally {
    creating.value = false
  }
}
defineExpose({
  showBindForm
})
// 取消
const handleCancel = () => {
  // emit('cancel')
}
onMounted(() => {
})
</script>

<style scoped>
.account-bind-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 420px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.modal-body {
  padding: 24px;
}

.bind-info {
  margin-bottom: 24px;
  text-align: center;
}
.bind-header{
  font-size: 20px;
  font-weight: 500;
}
.bind-info p {
  margin: 8px 0;
  color: #666;
}

.bind-options {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap:10%;
}

.bind-option {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.bind-option:hover {
  border-color: #1890ff;
  background: #f6ffed;

}

.option-icon {
  font-size: 24px;
  margin-right: 16px;
  width: 40px;
  text-align: center;
}

.option-content h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.option-content p {
  margin: 0;
  color: #555;
  font-size: 14px;
}

.bind-form {
  margin-bottom: 24px;
}

.form-content {
  margin-bottom: 20px;
}

.form-content h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

.wechat-bind-content {
  text-align: center;
}

.qr-code-container {
  padding: 20px;
}
.qr-code-text{
  margin-top: 10px;
}
.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #999;
  font-size: 14px;
}

.form-actions {
  margin-top:15px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.create-account-section {
  margin-top: 24px;
}

.divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div{
    height: 1px;
    background: #e9eef1;
    width: calc(50% - 20px);
  }
}

/* .divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8e8e8;
} */

.divider span {
  background: white;
  padding: 0 16px;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .bind-option {
    padding: 12px;
  }
  
  .option-icon {
    font-size: 20px;
    margin-right: 12px;
    width: 32px;
  }
}

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
  label{
  font-size:calc((15 / var(--design-width)) * 100vw) !important ;
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
.back{
  text-align: right;
  color: #1578ff;
  cursor: pointer;
  font-size: calc((14 / var(--design-width)) * 100vw);
}
</style>