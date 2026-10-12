<template>
  <g-layout title="消息免打扰">
    <template #content-table>
      <a-form :model="form">
        <a-form-item label="消息免打扰">
          <a-switch v-model:checked="form.enabled" />
        </a-form-item>
        <a-form-item label="设定时间">
          <a-time-picker v-model:value="form.startTime" placeholder="开始时间" style="margin-right: 10px;" format="HH:mm:SS"
            valueFormat="HH:mm:SS" />
          <a-time-picker v-model:value="form.endTime" placeholder="结束时间" format="HH:mm:SS" valueFormat="HH:mm:SS" />
        </a-form-item>
        <a-form-item label="免打扰类型">
          <a-checkbox-group v-model:value="form.channels" :options="plainOptions" />
        </a-form-item>
      </a-form>
      <div>
        <a-button :loading="isShowWeChatOfficialQrCode" type="primary" @click="showWeChatOfficialQrCode">绑定微信公众号</a-button>
        <div v-if="isShowWeChatOfficialQrCode" class="qr-code-modal">
          <div class="qr-code-modal-content">
            <h3>微信公众号二维码</h3>
            <div id="qrcode"></div>
            <a-button style="margin-top: 10px;" @click="closeQrCode">关闭</a-button>
          </div>
        </div>
      </div>
    </template>
    <template #footer-page>
      <a-button type="primary" @click="submit" :loading="loading">保存</a-button>
    </template>
  </g-layout>
</template>
<script setup>
import { getCurrentInstance, ref, reactive, nextTick } from 'vue'
import { cubeMessageService } from '@/api/server'
import { authStore } from '@/api/auth-store'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import QRCode from 'qrcodejs2-fix'
import { onMounted } from 'vue';
const loading = ref(false)
const isShowWeChatOfficialQrCode = ref(false);
const plainOptions = [
  { label: '站内消息', value: 'CHANNEL_SITE' },
  { label: 'APP推送', value: 'CHANNEL_APP' },
  { label: '短信', value: 'CHANNEL_SMS' },
]
const form = reactive({
  enabled: false,
  startTime: '',
  endTime: '',
  channels: ''
})
const { proxy } = getCurrentInstance();
const submit = async () => {
  let startTime =form.startTime&&form.startTime.split(':')[0] + form.startTime.split(':')[1]
  let endTime = form.endTime&&form.endTime.split(':')[0] + form.endTime.split(':')[1]
  if (startTime > endTime) {
    proxy.$message.warning('开始时间不能大于结束时间')
    return
  }
  if(!startTime||!endTime){
    proxy.$message.warning('请选择时间')
    return
  }
  loading.value = true
  try {
    await cubeMessageService.setIgnoredConfig(form)
    proxy.$message.success('保存成功')
  }
  catch (err) {
    proxy.$message.error(err.errorMessage ?? '请求错误')
  }
  finally {
    loading.value = false
  }
}
const getForm = async () => {
  try {
    const data = await cubeMessageService.getIgnoredConfig()
    form.enabled =data?.enabled??false
    form.startTime=data?.startTime??''
    form.endTime=data?.endTime??''
    form.channels=data?.channels??''
  }
  catch (err) {
    proxy.$message.error(err.errorMessage ?? '请求错误')
  }
}

const showWeChatOfficialQrCode = async () => {
  try {
    isShowWeChatOfficialQrCode.value = true
    const cubeAuthService = new CubeAuthService(authStore.terminal, authStore.tenant, authStore.token)
    const cubeSecret = await cubeAuthService.getSecretByToken()
    const authType = 'WX_OFFICIAL_ACCOUNT'
    const tenant = authStore.tenant
    const qrcodeUrl = `${window.origin}/apps/qrcode-transfer/platform-auth?authType=${authType}&cubeSecret=${cubeSecret}&tenant=${tenant}`
    generateQrCode(qrcodeUrl)
  } catch (error) {
    proxy.$message.error(error.errorMessage ?? '参数错误')
  }
}

const closeQrCode = () => {
  isShowWeChatOfficialQrCode.value = false;
};

const generateQrCode = (qrcodeUrl) => {
  nextTick(() => {
    const qrcodeContainer = document.getElementById('qrcode');
    if (qrcodeContainer) {
      new QRCode(qrcodeContainer, {
        text: qrcodeUrl,
        width: 128,
        height: 128,
      });
    }
  })
};

onMounted(() => {
  getForm()
})
</script>
<style scoped lang="scss">
.wrapper {
  margin: 20px;
}
.qr-code-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-code-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}
</style>