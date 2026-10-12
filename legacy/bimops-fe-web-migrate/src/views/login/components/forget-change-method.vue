<template>
  <div class="account-bind-modal" v-if="visible">
    <div class="modal-overlay" @click="handleCancel"></div>
    <div class="modal-content">

      
      <div class="modal-body">
        <div >
        <div class="bind-info">
          <p class="bind-header">找回方式</p>
          <p>请选择找回密码的验证方式:</p>
        </div>

        <div class="bind-options">
          <div class="bind-option" @click="showBindForm('password')" v-if="props.smsCode">
            <div class="option-content">
              <p>验证账号手机找回</p>
            </div>
          </div>
          <div class="bind-option" @click="showBindForm('wechat')" v-if="props.wechatCode">
            <div class="option-content">
              <p>验证账号微信找回</p>
            </div>
          </div>
        </div> 

 
        </div>


      </div>
    </div>
  </div>
</template>

<script setup >
import { ref, reactive, computed ,onMounted,watch,getCurrentInstance } from 'vue'


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  wechatCode:{
    type:Boolean,
    default: false
  },
  smsCode:{
    type:Boolean,
    default: false
  }
})

const emit = defineEmits([ 'cancel','success'])




// 显示绑定表单
const showBindForm = (method) => {
  emit('success', method)
}




// 取消
const handleCancel = () => {
  emit('cancel')
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