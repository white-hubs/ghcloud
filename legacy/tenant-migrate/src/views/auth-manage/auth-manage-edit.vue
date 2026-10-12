<template>
  <g-layout :title="code?'编辑授权':'新增授权'">
    <template #content-table>
      <a-form :label-col="{ span: 3 }" :wrapperCol="{ span: 8 }" ref="formRef" :model="formState" :rules="formRules">
        <a-form-item label="名称" name="name">
          <a-input placeholder="请输入" v-model:value="formState.name" />
        </a-form-item>
        <template v-if="code">
          <a-form-item label="APPID">
            {{ code }}
          </a-form-item>
          <a-form-item label="KEY">
            <span>{{ secretPlainText }}</span>
            <span @click="showKey = !showKey" style="cursor: pointer;margin-left: 10px;">
              <EyeOutlined v-if="!showKey"/>
              <EyeInvisibleOutlined v-else/>
            </span>
          </a-form-item>
        </template>
        <a-form-item label="是否启用" name="enabled">
          <a-switch v-model:checked="formState.enabled" />
        </a-form-item>
        <a-form-item label="数据授权" name="scopes">
          <a-checkbox-group v-model:value="formState.scopes">
            <a-row>
              <a-col :span="6" v-for="item in authList" :key="item.name">
                <a-checkbox :value="item.value">{{ item.name }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="授权方式" name="grantTypes">
          <a-checkbox-group v-model:value="formState.grantTypes">
            <a-row>
              <a-col :span="12" v-for="item in grantTypes" :key="item.name">
                <a-checkbox :value="item.value">{{ item.name }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item label="生成令牌的超时时间" name="accessTokenTimeout">
          <a-input-number placeholder="单位:秒" v-model:value="formState.accessTokenTimeout" :min="0" :max="999999999"
            style="width: 180px;" />
        </a-form-item>
        <a-form-item label="刷新令牌的超时时间" name="refreshTokenTimeout" v-if="formState.grantTypes.includes('refresh_token')">
          <a-input-number placeholder="单位:秒" v-model:value="formState.refreshTokenTimeout" :min="0" :max="999999999"
            style="width: 180px;" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="formState.remark" placeholder="请输入备注" :auto-size="{ minRows: 3, maxRows: 5 }" />
        </a-form-item>
      </a-form>
    </template>
    <template #footer-page>
      <a-button type="default" @click="goBack()" style="margin-right: 10px;">返回</a-button>
      <a-button type="primary" @click="handleSubmit()" :loading="submitLoading">保存</a-button>
    </template>
  </g-layout>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { computed, onMounted, reactive, ref } from 'vue';
import { authList, grantTypes } from './auth-list';
import { cubeOuaaService } from '@/api/service';
import { message } from 'ant-design-vue';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons-vue'

const submitLoading = ref(false)
const showKey = ref(false)
const formRef = ref()
const formState = reactive({
  name: '',
  remark: '',
  scopes: [],
  grantTypes: [],
  accessTokenTimeout: undefined,
  refreshTokenTimeout: undefined,
  enabled: true
})
const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  scopes: [{
    required: true, trigger: 'change', validator: async () => {
      if (formState.scopes.length === 0) {
        return Promise.reject('请选择权限范围');
      } else {
        return Promise.resolve();
      }
    }
  }],
  grantTypes: [{
    required: true, trigger: 'change', validator: async () => {
      if (formState.grantTypes.length === 0) {
        return Promise.reject('请选择授权类型');
      } else {
        return Promise.resolve();
      }
    }
  }],
  accessTokenTimeout: [{
    required: true, trigger: 'blur',
    validator: async () => {
      if (formState.accessTokenTimeout === null || formState.accessTokenTimeout === undefined) {
        return Promise.reject('请输入生成令牌的超时时间');
      } else {
        return Promise.resolve();
      }
    }
  }],
  refreshTokenTimeout: [{
    required: true,
    trigger: 'blur',
    validator: async () => {
      if (formState.refreshTokenTimeout === null || formState.refreshTokenTimeout === undefined) {
        return Promise.reject('请输入刷新令牌的超时时间');
      } else {
        return Promise.resolve();
      }
    }
  }]
}
const secretPlain = ref('')
const secretPlainText = computed(() => {
  if(showKey.value){
    return secretPlain.value
  }else{
    return '******'
  }
})
const route = useRoute()
const { code } = route.query

onMounted(async () => {
  if(code){
    try {
      message.loading('数据获取中')
      const res = await cubeOuaaService.getTenantClient(code)
      res.scopes = res.scopes.split(',')
      res.grantTypes = res.grantTypes.split(',')
      for (const key in formState) {
        formState[key] = res[key]
      }
      secretPlain.value = res.secretPlain
      message.destroy()
    } catch (error) {
      message.destroy()
      message.error('数据获取失败')
    }
  }
})

async function handleSubmit() {
  await formRef.value.validate()
  const params = {
    ...formState,
    grantTypes: formState.grantTypes.join(','),
    scopes: formState.scopes.join(',')
  }

  try {
    submitLoading.value = true
    if (!code) {
      await cubeOuaaService.createTenantClient(params)
    } else {
      await cubeOuaaService.updateTenantClient({...params,code})
    }
    goBack()
  } catch (error) {
    let {errorDetail} = error.toJSON()
    try {
      errorDetail = JSON.parse(errorDetail)
    } catch (error) {
      
    }
    if(typeof errorDetail === 'string'){
      message.error(errorDetail)
    }else{
      for (const key in errorDetail) {
        message.error(errorDetail[key])
      }
    }
  } finally{
    submitLoading.value = false
  }
}
function goBack() {
  history.back()
}
</script>
<style lang="less" scoped>
:deep(.content-table) {
  text-align: left;
  overflow-y: auto !important;
}
</style>