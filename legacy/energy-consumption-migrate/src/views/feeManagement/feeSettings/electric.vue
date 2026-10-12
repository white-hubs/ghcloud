<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <g-layout title="电费配置" :show-search="false" :showFooter="true">
    <template #content-table>
      <Spin :spinning="isLoading">
        <div class="fee_setting">
          <div class="item">
            <div class="title">
              <span class="tit-left">计费方式：</span>
              <RadioGroup v-model:value="chargeType" :options="chargeTypeOptions">
              <!-- <Radio :value="1" class="ml-5px! mr-15px!">复合收费</Radio>
              <Radio :value="2">阶梯收费</Radio> -->
              </RadioGroup>
            </div>
          </div>
          <template v-if="!isJTJ">
            <div class="item">
              <div class="title"><span class="tit-left">费率价格：</span><Button type="primary" @click="priceRef.addItem()">添加</Button></div>
              <div class="content">
                <PriceItem ref="priceRef" :placeholder="['费率时段', '费率价格']" :items="periodPrices" />
              </div>
            </div>
            <div class="item">
              <div class="title"><span class="tit-left">费率时段：</span><Button type="primary" @click="timeRangeRef.addItem()">添加</Button></div>
              <div class="content">
                <TimeRangeItem ref="timeRangeRef" :placeholder="['费率时段', '起止时间']" :items="periodDefines" />
              </div>
            </div>
          </template>
          <div v-else class="item">
            <div class="title"><span class="tit-left">阶梯：</span><Button type="primary" @click="stepRef.addItem()">添加</Button><span class="ml-6px text-12px color-#999999">用电量阶梯收费方式配置</span></div>
            <div class="content">
              <StepItem ref="stepRef" :min="0" :placeholder="['用电量最小值', '用电量最大值', '费用']" :items="usagePrices" />
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
import { type RadioGroupProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PriceItem from './components/PriceItem.vue'
import StepItem from './components/StepItem.vue'
import TimeRangeItem from './components/TimeRangeItem.vue'
import { onMounted, ref, watch } from 'vue'

const router = useRouter()
const goBack = () => {
  router.push('/feeManagement/feeSettings')
}
const chargeType = ref<string>('FPG')
const chargeTypeOptions: RadioGroupProps['options'] = [
  { label: '复合收费', value: 'FPG' },
  { label: '阶梯收费', value: 'JTJ' }
]
const isLoading = ref(false)
const btnLoading = ref(false)
const isJTJ = ref(false)

const priceRef = ref() // 费率价格
const timeRangeRef = ref() // 费率时段
const stepRef = ref() // 阶梯
const periodPrices = ref<Fee.PeriodPricesState[]>([])
const periodDefines = ref<Fee.PeriodDefinesState[]>([])
const usagePrices = ref<Fee.UsagePricesState[]>([])
// 提交
const submitForm = async () => {
  if (btnLoading.value) return
  let price = null
  let timeRange = null
  let step = null
  let params = {}
  if (isJTJ.value) {
    step = await stepRef.value.validateForm()
    params = {
      instrumentType: instrumentTypeE.ELECTRIC,
      chargeType: chargeType.value || chargeTypeE.fpg,
      usagePrices: step?.items
    }
  } else {
    price = await priceRef.value.validateForm()
    timeRange = await timeRangeRef.value.validateForm()
    // 时间处理
    let times = []
    if (timeRange?.items && timeRange?.items.length) {
      times = timeRange?.items.map((item: { periodType:string; time: string[];}) => {
        return {
          periodType: item.periodType,
          startTime: item.time[0],
          endTime: item.time[1]
        }
      })
    }
    params = {
      instrumentType: instrumentTypeE.ELECTRIC,
      chargeType: chargeType.value || chargeTypeE.fpg,
      periodPrices: price.items,
      periodDefines: times
    }
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
    priceRef.value?.resetForm()
    timeRangeRef.value?.resetForm()
    stepRef.value?.resetForm()
  } catch (errorInfo) {
  }
}
// 查询收费配置
const queryConfig = async () => {
  isLoading.value = true
  try {
    const result = await getChargeConfig({ instrumentType: instrumentTypeE.ELECTRIC })
    chargeType.value = result.data?.chargeType || 'FPG'
    periodPrices.value = result.data?.periodPrices || []
    usagePrices.value = result.data?.usagePrices || []
    // 时间处理
    let times = []
    if (result.data?.periodDefines) {
      times = result.data?.periodDefines.map((item: { periodType:string; startTime: string; time: string[]; endTime: string; }) => {
        return {
          periodType: item.periodType,
          time: [item.startTime, item.endTime]
        }
      })
    }
    periodDefines.value = times || []
    defaultConfig()
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
  }
}
// 如果费率为空，默认1项费率价格，费率时段默认到00：00-24：00
const defaultConfig = () => {
  if (!periodPrices.value || !periodPrices.value.length) {
    periodPrices.value = [{ periodType: 'PV', price: undefined }]
    periodDefines.value = [{ periodType: 'PV', time: ['00:00:00', '23:59:59'] }]
  }
  if (isJTJ.value && (!usagePrices.value || !usagePrices.value.length)) {
    usagePrices.value = [{ endUsage: undefined, price: undefined, startUsage: undefined }]
  }
}
watch(() => chargeType.value, (value) => {
  if (value === 'FPG') {
    isJTJ.value = false
  }
  if (value === 'JTJ') {
    isJTJ.value = true
    defaultConfig()
  }
})

onMounted(() => {
  queryConfig()
  // defaultConfig()
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
