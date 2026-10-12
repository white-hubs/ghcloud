<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <g-layout title="燃气费配置" :show-search="false" :showFooter="true">
    <template #content-table>
      <Spin :spinning="isLoading">
        <div class="fee_setting">
          <div class="item">
            <div class="title"><span class="tit-left">阶梯：</span><Button type="primary" @click="stepRef.addItem()">添加</Button><span class="ml-6px text-12px color-#999999">用量阶梯收费方式配置</span></div>
            <div class="content">
              <StepItem
                ref="stepRef" :min="1" :placeholder="['燃气用量最小值', '燃气用量最大值', '费用']" :items="usagePrices"
                :unit="'m³'"
              />
            </div>
          </div>
        </div>
      </Spin>
    </template>
    <template #footer-btn>
      <Button
        class="ml-90px" type="primary" html-type="submit" :loading="btnLoading"
        @click="submitForm"
      >
        保存
      </Button>
      <Button class="ml-20px" @click="resetForm">重置</Button>
    </template>
    <template #footer-page>
      <Button class="ml-20px" @click="goBack">返回</Button>
    </template>
  </g-layout>
</template>
<script setup lang="ts">
import { chargeTypeE, getChargeConfig, instrumentTypeE, saveChargeConfig } from '@/api/feeManage'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import StepItem from './components/StepItem.vue'

import { onMounted, ref } from 'vue'

const router = useRouter()
const goBack = () => {
  router.go(-1)
}
const isLoading = ref(false)
const btnLoading = ref(false)
const chargeType = ref<string>('JTJ')

const stepRef = ref()
const usagePrices = ref<Fee.UsagePricesState[]>([])
// 提交
const submitForm = async () => {
  if (btnLoading.value) return
  const step = await stepRef.value.validateForm()
  const params = {
    chargeType: chargeType.value || chargeTypeE.jtj,
    instrumentType: instrumentTypeE.GAS,
    usagePrices: step.items
  }
  btnLoading.value = true
  try {
    const result = await saveChargeConfig(params)
    message.success('操作成功')
    btnLoading.value = false
    queryConfig()
  } catch (error) {
    btnLoading.value = false
    // message.error(error.data?.message || '服务器异常，请稍后重试')
  }
}
// 重置
const resetForm = async () => {
  try {
    await stepRef.value?.resetForm()
  } catch (errorInfo) {
  }
}
// 查询收费配置
const queryConfig = async () => {
  isLoading.value = true
  try {
    const result = await getChargeConfig({ instrumentType: instrumentTypeE.GAS })
    chargeType.value = result.data?.chargeType
    usagePrices.value = result.data?.usagePrices
    isLoading.value = false
    defaultConfig()
  } catch (error) {
    isLoading.value = false
  }
}
// 如果阶梯为空，默认添加1项
const defaultConfig = () => {
  if (!usagePrices.value || !usagePrices.value.length) {
    usagePrices.value = [{ endUsage: undefined, price: undefined, startUsage: undefined }]
  }
}

onMounted(() => {
  queryConfig()
})
</script>
<style lang="less" scoped>
@import url('@/style/theme/color.less');
.fee_setting{
  margin: 20px 0;
  .item{
    margin-bottom: 24px;
    &:not(:last-child){
      border-bottom: 2px dotted #D8D8D8;
    }

    .title{
      margin-bottom: 20px;
    }
    .tit-left{
      display: inline-block;
      width: 90px;
      text-align: right;
    }
  }
}
:deep(.template-form-item-label){
  width: 140px;
}
</style>
