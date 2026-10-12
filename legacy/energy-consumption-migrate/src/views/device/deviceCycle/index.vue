<template>
  <GLayout title="抄表周期" :showFooter="true">
    <template #content-table>
      <Form ref="formRef" :model="model" :rules="rules">
        <FormItem label="抄表周期" name="readeType">
          <Select v-model:value="model.readeType" placeholder="请选择抄表周期" :style="{ width: '300px' }" :options="options"
            :field-names="{ label: 'name', value: 'code', }" @change="changeCheck">
          </Select>
        </FormItem>
        <FormItem label="周期配置" :name="
            model.readeType === 'every_specified_day'||model.readeType === 'every_specified_min' ? 'readeVulue' : 'readeVulueList'
            " v-if="model.readeType !== 'last_day_monthly'">
          <div v-if="model.readeType === 'weekly_designated_date'">
            <Select v-model:value="model.readeVulueList" placeholder="请选择日期"
              :field-names="{ label: 'name', value: 'id', }" :style="{ width: '300px' }" :options="weekOptions"
              :mode="'multiple'">
            </Select>
          </div>
          <div v-else>
            <Input v-if="model.readeType === 'every_specified_day'" v-model:value="model.readeVulue"
              :suffix="model.readeType === 'every_specified_day' ? '天' : ''" :style="{ width: '300px' }"
              placeholder="请输入周期配置" />
            <Input v-else-if="model.readeType === 'every_specified_min'" v-model:value="model.readeVulue"
              :suffix="model.readeType === 'every_specified_min' ? '分钟' : ''" :style="{ width: '300px' }"
              placeholder="请输入间隔的时间" />
            <Select v-else v-model:value="model.readeVulueList" :disabled="!model.readeType"
              :field-names="{ label: 'name', value: 'id', }" :style="{ width: '300px' }" placeholder="请选择周期配置"
              :options="dateOptions" :mode="'multiple'">
            </Select>
          </div>
        </FormItem>
        <FormItem :label="model.readeType === 'every_specified_min'?'采集时间':'抄表时间'" name="workTime">
          <TimePicker :disabled="model.readeType === 'every_specified_min'" v-model:value="model.workTime" :style="{ width: '300px' }" :format="format" :valueFormat="format">
          </TimePicker>
        </FormItem>
      </Form>
    </template>
    <template #footer-page>
      <Button type="primary" @click="save" :loading="loading">保存</Button>
    </template>
  </GLayout>
</template>

<script setup lang="ts">
import { cycleList, metterReade, setCycle } from "@/api/cycle";
import GLayout from "@/components/common/gLayout.vue";
import { message, TimePicker } from "ant-design-vue/es";
import { onMounted, reactive, ref } from "vue";
import type { SelectValue } from "ant-design-vue/lib/select";
const format = "HH:mm:ss";
const loading = ref(false);
onMounted(()=>{
  getData()
  getCycleList()
})
const options=ref([])
const getCycleList=async()=>{
 const {data}=await cycleList()
 options.value=data
}
const model = reactive({
  id: "",
  taskId: "",
  readeType: undefined,
  readeVulue: "",
  workTime: "",
  readeVulueList: [],
});
const rules = {
  readeType: [{ required: true, message: "请选择抄表周期" }],
  readeVulue: [
    { required: true, message: "请选择周期配置" },
    {
      pattern: new RegExp(/(^[1-9]\d{0,2}$)/, "g"),
      message: "请输入小于999的正整数",
    },
  ],
  readeVulueList: [
    { required: true, message: "" },
    {
      validator(rule: any, value: string | any[]) {
        if (value.length) {
          return Promise.resolve();
        } else {
          return Promise.reject("请选择周期配置");
        }
      },
    },
  ],
  workTime: [{ required: true, message: "请选择抄表时间" }],
};
const changeCheck = (item: SelectValue) => {
  model.readeVulue = "";
  model.readeVulueList = [];
  if(item === 'every_specified_min'){
    model.workTime='00:00:00'
  }
};
const weekOptions = [
  { name: "周一", id: "1" },
  { name: "周二", id: "2" },
  { name: "周三", id: "3" },
  { name: "周四", id: "4" },
  { name: "周五", id: "5" },
  { name: "周六", id: "6" },
  { name: "周日", id: "7" },
];
const dateOptions = [
  { name: "1号", id: "1" },
  { name: "2号", id: "2" },
  { name: "3号", id: "3" },
  { name: "4号", id: "4" },
  { name: "5号", id: "5" },
  { name: "6号", id: "6" },
  { name: "7号", id: "7" },
  { name: "8号", id: "8" },
  { name: "9号", id: "9" },
  { name: "10号", id: "10" },
  { name: "11号", id: "11" },
  { name: "12号", id: "12" },
  { name: "13号", id: "13" },
  { name: "14号", id: "14" },
  { name: "15号", id: "15" },
  { name: "16号", id: "16" },
  { name: "17号", id: "17" },
  { name: "18号", id: "18" },
  { name: "19号", id: "19" },
  { name: "20号", id: "20" },
  { name: "21号", id: "21" },
  { name: "22号", id: "22" },
  { name: "23号", id: "23" },
  { name: "24号", id: "24" },
  { name: "25号", id: "25" },
  { name: "26号", id: "26" },
  { name: "27号", id: "27" },
  { name: "28号", id: "28" },
  { name: "29号", id: "29" },
  { name: "30号", id: "30" },
  { name: "31号", id: "31" },
];
const formRef = ref();
const save = () => {
  formRef.value.validate().then(() => {
    const { id, taskId, readeType, workTime, readeVulue, readeVulueList } = model;
    const params = {
      id: id,
      taskId: taskId,
      readeType: readeType,
      workTime: workTime,
      readeVulue:
        readeType === "every_specified_day"||model.readeType === 'every_specified_min' ? readeVulue : readeVulueList.join(","),
    };
    loading.value = true;
    setCycle(params).then(() => {
        loading.value = false;
        message.success("操作成功");
        getData();
      }).catch(() => {
        loading.value = false;
      });
  });
};
const getData = async () => {
  let { data } = await metterReade();
  if (data) {
    const { id, taskId, readeType, readeVulue, workTime } = data;
    const result = {
      id: id,
      taskId: taskId,
      readeType: readeType,
      readeVulue: readeType === "every_specified_day"||readeType === "every_specified_min" ? readeVulue : "",
      workTime: workTime,
      readeVulueList: readeType === "every_specified_day"||readeType === "every_specified_min"  ? [] : readeVulue.split(","),
    };
    Object.assign(model,result)
  }
};
</script>