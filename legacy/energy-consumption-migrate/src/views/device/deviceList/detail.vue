<template>
  <div class="device-detail">
    <p class="title">
          {{ device.deviceArea }}
          {{device.deviceArea?'-':''}}
          {{ device.deviceName }}
    </p>
    <Tabs v-model:activeKey="activeKey" id="tabs" style="height: calc(100% - 230px);">
      <TabPane key="1" tab="设备信息">
        <div v-if="device">
          <DeviceDetail :deviceData="deviceData" :model="device"></DeviceDetail>
        </div>
      </TabPane>
      <TabPane key="2" tab="仪表读数记录" force-render>
        <ReadingRecord></ReadingRecord>
      </TabPane>
      <TabPane key="3" tab="历史仪表" force-render>
        <HistoryRecord></HistoryRecord>
      </TabPane>
      <TabPane key="4" tab="关联监控"><AssociatedMonitoring></AssociatedMonitoring></TabPane>
      <TabPane key="5" tab="操作日志"><OperateNote></OperateNote></TabPane>
    </Tabs>
    <div class="button">
      <Button @click="back">返回</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {  useRoute, useRouter } from "vue-router";
import ReadingRecord from './components/reading-record.vue'
import HistoryRecord from './components/history-record.vue'
import OperateNote from './components/operate-note.vue'
import DeviceDetail from './components/device-detail.vue'
import AssociatedMonitoring from './components/associated-monitoring.vue'
import { onMounted, reactive, ref } from "vue";
import { deviceDetail } from "@/api/energyOverview";

const route = useRoute();
const activeKey=ref('1')
const device = reactive<{
  deviceArea: string,
  deviceName: string,
  fileVOS: {path:string}[],
  readeValue: string,
  nowReadeValue: string,
  lastReadeValue: string,
}>({
  deviceArea: "",
  deviceName: "",
  fileVOS: [],
  readeValue: "",
  nowReadeValue: "",
  lastReadeValue: "",
});
const deviceData = ref();
const getData = async () => {
    const  id = route.query.id as string;
    const { data } = await deviceDetail(id??'');
    deviceData.value = data
};

onMounted(() => {
  getData();
});
const router=useRouter()
const back = () => {
  router.push('/device/list')
};
</script>
<style lang="less" scoped>
@import url("@/style/theme/color.less");
.device-detail{
  margin: 20px;
  height: 100%;
  .title{
    font-size: 18px;
    font-weight: 600;
  }
  .device-info {
    margin: 10px 30px;
    min-width: 240px;
    .item {
      display: flex;
      padding:4px 0px;
      .label {
        width: 30%;
      }
      .value {
        width: 70%;
      }
    }
  }
  .basic{
    display: flex;
  }
  .device{
    p{
      margin-top: 20px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 10px;
      color: rgba(0, 0, 0, 0.85);
      font-family: "PingFang SC-Medium";
    }
    &>div{display: flex;}
  }
  .button{
    float: right;
  }
}
</style>
