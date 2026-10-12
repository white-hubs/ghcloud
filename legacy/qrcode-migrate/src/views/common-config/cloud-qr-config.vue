<template>
  <div class="content">
    <g-layout title="云端配置">
      <template #content-table>
        <div class="tips">
          <a-alert
            message="用于配置云二维码服务的基本参数，包括应用ID、密钥和服务地址等信息"
            type="info"
            show-icon
          />
        </div>
        <div class="form-container">
          <a-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 20 }"
          >
            <a-form-item label="配置名称" name="configName">
              <a-input 
                v-model:value="formState.configName" 
                placeholder="请输入配置名称" 
                :maxlength="100"
                show-count
              />
            </a-form-item>

            <a-form-item label="应用ID" name="appId">
              <a-input 
                v-model:value="formState.appId" 
                placeholder="请输入应用ID (client_id)" 
                :maxlength="100"
                show-count
              />
            </a-form-item>

            <a-form-item label="应用密钥" name="appSecret">
              <a-input-password 
                v-model:value="formState.appSecret" 
                placeholder="请输入应用密钥 (client_secret)" 
                :maxlength="200"
                show-count
              />
            </a-form-item>

            <a-form-item label="云二维码服务地址" name="serverUrl">
              <a-input 
                v-model:value="formState.serverUrl" 
                placeholder="请输入云二维码服务地址 例如: https://ip:端口" 
                :maxlength="200"
                show-count
              />
            </a-form-item>

            <a-form-item label="是否启用" name="enabled">
              <a-switch v-model:checked="formState.enabled" />
            </a-form-item>

            <a-form-item label="备注说明" name="remark">
              <a-textarea 
                v-model:value="formState.remark" 
                placeholder="输入备注信息" 
                :maxlength="500"
                :rows="4"
                show-count
              />
            </a-form-item>
          </a-form>
        </div>
      </template>
      <template #footer-page>
        <a-button type="primary" :loading="loading" @click="handleSave">
          保存配置
        </a-button>
        <a-button type="primary" :loading="loading" @click="syncQrCodeToCloud" style="margin-left: 8px;">
          同步二维码到云端
        </a-button>
      </template>
    </g-layout>
  </div>
</template>

<script>
import { defineComponent, reactive, ref, getCurrentInstance, onMounted } from "vue"
import { authStore } from "@/api/auth-store";
import { CubeIdentityService } from '@ghcloud/cube-risk-management-service'

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance()
    const formRef = ref()
    const loading = ref(false)
    const cubeIdentityService = new CubeIdentityService(authStore)
    // 表单数据
    const formState = reactive({
      id: undefined,
      configName: '',
      appId: '',
      appSecret: '',
      serverUrl: '',
      enabled: true,
      remark: ''
    })

    // 表单验证规则
    const rules = {
      configName: [
        { required: true, message: '请输入配置名称', trigger: 'blur' }
      ],
      appId: [
        { required: true, message: '请输入应用ID', trigger: 'blur' }
      ],
      appSecret: [
        { required: true, message: '请输入应用密钥', trigger: 'blur' }
      ],
      serverUrl: [
        { required: true, message: '请输入云二维码服务地址', trigger: 'blur' },
        { type: 'url', message: '请输入正确的URL格式', trigger: 'blur' }
      ]
    }

    // 初始化数据
    const initData = async () => {
      try {
        loading.value = true
        const result = await cubeIdentityService.getCloudQrCodeConfig()
        if (result) {
          Object.assign(formState, result)
        }
      } catch (error) {
      } finally {
        loading.value = false
      }
    }

    // 保存配置
    const handleSave = async () => {
      try {
        await formRef.value.validate()
        loading.value = true

        await cubeIdentityService.saveCloudQrCodeConfig({
          id: formState.id,
          configName: formState.configName,
          appId: formState.appId,
          appSecret: formState.appSecret,
          serverUrl: formState.serverUrl,
          enabled: formState.enabled,
          remark: formState.remark
        })

        proxy.$message.success('保存成功')
        await initData()
      } catch (error) {
        proxy.$message.error('保存失败，请检查表单数据')
      } finally {
        loading.value = false
      }
    }

    // 同步二维码到云端
    const syncQrCodeToCloud = async() =>{
        try {
        await cubeIdentityService.syncQrCodeToCloud()
        proxy.$message.success('同步成功')
        await initData()
      } catch (error) {
        proxy.$message.error('同步失败，请检查表单数据')
      } 
    }

    onMounted(() => {
      initData()
    })

    return {
      formRef,
      formState,
      rules,
      loading,
      handleSave,
      syncQrCodeToCloud
    }
  }
})
</script>

<style lang="less" scoped>
.tips {
  margin-bottom: 20px;
}

.form-container {
  margin: 20px 0;
  max-width: 900px;
  
  :deep(.ant-form-item-label) {
    text-align: right;
  }
  
  :deep(.ant-input),
  :deep(.ant-input-password),
  :deep(.ant-input-textarea textarea) {
    text-align: left !important;
  }
}
</style>
