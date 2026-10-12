<!-- eslint-disable no-console -->
<template>
  <div class="container_la">
    <Form ref="formRef" name="dynamic_form_item" :model="dynamicValidateForm">
      <div
        v-for="(item, index) in dynamicValidateForm.domains" :key="item.intervalNumber" style="
          border: 1px solid #ccc;
          margin: 10px;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <FormItem :label="type == 'plan' ? `巡更任务${index + 1}` : '巡更任务'">
          <FormItem
            :label-col="{ style: 'width: 110px' }" label-align="right" label="巡更时间"
            :name="['domains', index, 'timeRange']" :rules="{
              required: true,
              message: '时间段不能为空',
              trigger: 'change',
            }"
          >
            <TimePicker
              v-model:value="item.startTime" :disabled="showDisable" format="HH:mm" value-format="HH:mm"
              @change="startChange($event as string,index)"
            /> -
            <TimePicker
              v-model:value="item.endTime" :disabled="showDisable" format="HH:mm" value-format="HH:mm"
              @change="endChange($event as string, index)"
            />
            <span v-if="item.startTime&&item.endTime&&dayjs(item.endTime,'HH:mm').isBefore(dayjs(item.startTime,'HH:mm'))" style="margin-left: 10px; color:red">次日</span>
          </FormItem>
          <FormItem
            :label-col="{ style: 'width: 110px;margin-top:10px' }" label-align="right" label="每隔x巡更一次:"
            :name="['domains', index, 'intervalNumber']" :rules="{
              required: true,
              message: '巡更时长不能为空',
              trigger: 'change',
            }"
          >
            <InputNumber
              v-model:value="item.intervalNumber" :disabled="showDisable" :max="24" :min="1"
              style="margin-top: 10px" :step="1" :precision="0" @change="timeChangeNumber($event as number, index)"
            >
              <template #addonAfter> 小时</template>
            </InputNumber>
          </FormItem>
          <FormItem label="巡更时段:" label-align="right" :label-col="{ style: 'width: 110px;margin-top:10px' }">
            <div class="mt-5px" style="width: 430px; display: flex; flex-wrap: wrap">
              <Tag
                v-for="(res, tagIndex) in item.executePeriod" :key="res" :closable="!showDisable" class="ml-10px"
                style="margin-top: 10px" color="green" :value="item" @close="closeTag(index, tagIndex)"
              >
                {{ res }}
              </Tag>
            </div>
          </FormItem>
          <span v-if="word!==''&&currentIndex==index" style="color:red">{{ word }}</span>
        </FormItem>
        <div v-if="type == 'plan'">
          <div v-if="!showDisable">
            <Button
              v-if="index === 0" :icon="h(PlusOutlined)" type="primary" shape="round"
              @click="addTag"
            />
            <Button
              v-else :icon="h(DeleteOutlined)" danger shape="round"
              @click="deleteTag(index)"
            />
          </div>
        </div>
      </div>
    </Form>
  </div>
</template>

<script lang="ts">
import { PlusOutlined, DeleteOutlined } from '@ghcloud/cube-ui'
import type { FormInstance } from 'ant-design-vue/es/form/Form'
import { Tag } from 'ant-design-vue'
import { reactive, ref, h } from 'vue'
import { useRoute } from 'vue-router'
import { calcPeriod } from '@/api/plan-api'
import dayjs from 'dayjs'
</script>
<script setup lang="ts">
const route = useRoute()
const { type } = route.query
const formRef = ref<FormInstance>()
const dynamicValidateForm = reactive<{
  domains: {
    timeRange: any;
    startTime: string;
    endTime: string;
    intervalNumber: number;
    intervalUnit: number;
    executePeriod: string[];
  }[];
}>({
  domains: [
    {
      startTime: '',
      endTime: '',
      timeRange: '',
      intervalNumber: 1,
      intervalUnit: 10,
      executePeriod: [],
    },
  ],
})
const rule = async () => {
  if (word.value) {
    return 'save'
  } else {
    return formRef.value?.validateFields()
  }
}
const showDisable = ref(false)
const setInfo = (data: any, disable: boolean) => {
  showDisable.value = disable
  const deepCopy = JSON.parse(JSON.stringify(data))
  const info = deepCopy.map((item: any) => {
    if (item.startTime === undefined || item.endTime === undefined) {
      item.startTime = item.timeRange.split('-')[0]
      item.endTime = item.timeRange.split('-')[1]
    } else {
      item.timeRange = item.startTime + '-' + item.endTime
    }
    return item
  })
  Object.assign(dynamicValidateForm.domains, info)
}
const timeChangeNumber = (number: number, index: number) => {
  // if (dynamicValidateForm.domains[index].intervalNumber < 1) {
  //   dynamicValidateForm.domains[index].intervalNumber = 1;
  //     }
  getTime(dynamicValidateForm.domains[index].startTime, dynamicValidateForm.domains[index].endTime, number, index)
}
const setWord = () => {
  word.value = ''
}
const deleteTag = (index: number) => {
  dynamicValidateForm.domains.splice(index, 1)
}
const word = ref('')
const currentIndex = ref(0)
const addTag = () => {
  dynamicValidateForm.domains.push({
    timeRange: '',
    intervalNumber: 1,
    startTime: '',
    endTime: '',
    intervalUnit: 10,
    executePeriod: [],
  })
}
defineExpose({
  dynamicValidateForm,
  setInfo,
  rule,
  setWord
})
const getTime = async (startTime: string, endTime: string, intervalNumber: number, index: number): Promise<void> => {
  if (intervalNumber && startTime && endTime) {
    const { data } = await calcPeriod({
      startStr: startTime,
      endStr: endTime,
      intervalHour: intervalNumber
    })
    dynamicValidateForm.domains[index].executePeriod = data.periodList
    word.value = data.tip
  }
}
const startChange = async (time: string, index: number): Promise<void> => {
  const startTime = time
  const endTime = dynamicValidateForm.domains[index].endTime

  if (endTime === '') return
  if (startTime === endTime) {
    dynamicValidateForm.domains[index].endTime = ''
    dynamicValidateForm.domains[index].executePeriod.length = 0
    return
  }
  getTime(startTime, endTime, dynamicValidateForm.domains[index].intervalNumber, index)
  dynamicValidateForm.domains[index].timeRange = [time, endTime]
}
const endChange = (time: string, index: number): void => {
  const startTime = dynamicValidateForm.domains[index].startTime
  const endTime = time
  if (startTime === '') return
  if (startTime === endTime) {
    dynamicValidateForm.domains[index].startTime = ''
    dynamicValidateForm.domains[index].executePeriod.length = 0
    return
  }
  dynamicValidateForm.domains[index].timeRange = [startTime, endTime]
  getTime(startTime, endTime, dynamicValidateForm.domains[index].intervalNumber, index)
}

const closeTag = (index: number, tagIndex: number): void => {
  dynamicValidateForm.domains[index].executePeriod.splice(tagIndex, 1)
}
</script>
<style lang="less" scoped></style>
