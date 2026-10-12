<template>
  <gLayout :title="pageTitle">
    <template #content-table>
      <div class="channelBox">
        <div
          :style="{ cursor: item.channelCode === 'CHANNEL_SITE' ? 'not-allowed' : 'pointer' }"
          @click="configuration(item)"
          class="channelCard"
          v-for="item in msgChannelsList"
        >
          <div style="font-size: 16px; font-weight: bold">{{ item.channelName }}</div>
          <div style="font-size: 12">{{ item.manufacturerName }}</div>
        </div>
      </div>
    </template>
  </gLayout>
  <a-modal centered v-model:visible="channelConfiguration.visible" title="渠道配置" @ok="channelOk" @cancel="channeCancel">
    <a-form :label-col="{ style: { width: '120px !important' } }" :model="formState">
      <a-form-item label="渠道类型">
        <a-select disabled v-model:value="formState.channelCode" placeholder="please select your zone">
          <a-select-option v-for="item in msgChannelsList" :value="item.channelCode">{{ item.channelName }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="服务商">
        <a-select @change="changeManufacturer" v-model:value="formState.manufacturerCode" placeholder="please select your zone">
          <a-select-option v-for="item in serviceList" :value="item.code">{{ item.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="item" v-for="item in selectAccountRule.required">
        <a-input v-model:value="formState[formState.manufacturerCode][item]" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import gLayout from "@ghcloud-legacy/bimops-fe-web-migrate-lib/src/components/global/Common/gLayout.vue";
import { message } from "ant-design-vue";
import { ref, reactive, onMounted } from "vue";

import { usePageName } from "@ghcloud/cube-utils";

import { msgChannels, referManufacturers, msgChannel } from "@/api/message";
import type { MsgChannels, ReferManufacturersType } from "@/api/model/message";
const { pageTitle } = usePageName();
const channelConfiguration = reactive({
  visible: false,
});
const formState = reactive({
  channelCode: "",
  manufacturerCode: "",
  config: "",
});
const msgChannelsList = ref<MsgChannels[]>([]);
const serviceList = ref<ReferManufacturersType[]>([]);
const selectData = ref<MsgChannels>({
  channelCode: "",
  channelName: "",
  config: "",
  manufacturerCode: "",
  manufacturerName: "",
});
const selectAccountRule = ref<any>({
  required: [],
});
const configuration = async (data) => {
  if (data.channelCode === "CHANNEL_SITE") {
    return;
  }
  selectData.value = data;
  await getServiceData();
  channelConfiguration.visible = true;
  formState.channelCode = data.channelCode;
};
const getServiceData = async () => {
  let res = await referManufacturers(selectData.value.channelCode);
  serviceList.value = res.data;
  formState.manufacturerCode = selectData.value.manufacturerCode ? selectData.value.manufacturerCode : serviceList.value[0].code;
  const manufacturersData = serviceList.value.find((item) => {
    if (formState.manufacturerCode === item.code && item.accountRule) {
      return JSON.parse(item.accountRule);
    }
  });
  const properties = {};
  if (manufacturersData) {
    const accountRule = JSON.parse(manufacturersData.accountRule);
    for (const key in accountRule.properties) {
      properties[key] = "";
    }
  }
  const obj = Object.assign(properties, JSON.parse(selectData.value.config));
  formState[formState.manufacturerCode] = {};
  for (const key in obj) {
    selectAccountRule.value.required.push(key);
    formState[formState.manufacturerCode][key] = obj[key];
  }
};
// 渠道管理列表
const getChannelManage = async () => {
  let res = await msgChannels();
  msgChannelsList.value = res.data;
};
const changeManufacturer = async () => {
  const res = serviceList.value.filter((e) => e.code === formState.manufacturerCode)[0].accountRule;
  selectAccountRule.value.required = JSON.parse(res).required;
  formState[formState.manufacturerCode] = {};
  selectAccountRule.value.required.forEach((item: string) => {
    formState[formState.manufacturerCode][item] = formState[formState.manufacturerCode][item]
      ? formState[formState.manufacturerCode][item]
      : "";
  });
};
const channelOk = async () => {
  serviceList.value.forEach((e) => {
    if (e.code !== formState.manufacturerCode) {
      delete formState[e.code];
    }
  });
  Object.assign(formState, formState[formState.manufacturerCode]);
  delete formState[formState.manufacturerCode];
  let config = JSON.parse(JSON.stringify(formState));
  delete config.channelCode;
  delete config.manufacturerCode;
  delete config.config;
  formState.config = JSON.stringify(config);
  await msgChannel(formState);
  await getChannelManage();
  channelConfiguration.visible = false;
  selectAccountRule.value.required.forEach((item: string) => {
    delete formState[item];
  });
  selectAccountRule.value.required = [];
  message.success("渠道修改成功");
};
const channeCancel = () => {
  selectAccountRule.value.required = [];
};
onMounted(() => {
  getChannelManage();
});
</script>
<style scoped lang="less">
.channelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;

  .channelCard {
    width: 270px;
    height: 150px;
    margin: 0 50px 20px 0;
    background-color: rgb(242, 242, 242);
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
}

:deep(.ant-form-item-label) {
  width: 120px !important;
}
</style>
<style>
.ant-form-item-label {
  width: 120px !important;
}
</style>
