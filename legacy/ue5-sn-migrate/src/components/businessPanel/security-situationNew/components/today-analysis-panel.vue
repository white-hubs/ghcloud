<template>
        <SubPanelTemplate title="消防到期设备统计">
            <template #extra>
                <DateInlineForm
                  v-model:modelValue="timeFrame"
                  @search="changeTopTimeFrame"
                ></DateInlineForm>
            </template>
            <OperateDays title="设备数" :value="alarmCon.totalNumber" class="body-bum">
                <div class="extra flex-start">
                    <div class="mode">环比</div>
                    <div :class="['downtriangle', alarmCon.chainRatio > 0 && 'uptriangle']"></div>
                    <div :class="[alarmCon.chainRatio < 0 ? 'down' : 'up']">{{ alarmCon.chainRatio }}%</div>
                </div>
            </OperateDays>
            <RollTable  :column="alarmColumn" :data="listData" :limitScrollNum="4">
                <template #deviceStatus="{ record }">
              <span class="details" @click="clickRow(record)">定位</span>
            </template>
            </RollTable>
        </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import { ModelValueItf } from '../../public/types'
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { storeArea } from "@/piniaStore/area"
import { storeMenu } from "@/piniaStore/menu"
import SubPanelTemplate from "../../public/subPanelTemplate.vue";
import DateInlineForm from '../../public/dateInlineForm.vue';
import OperateDays from '../../public/operateDays.vue';
import RollTable from "../../public/rollTable/index.vue";
import { expiredChain, expiredPage } from '@/api/device'
const ueClient = UeClient.getInstance();

const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();
const stateList = {
    SPLIT:'待拆解',
    ACCEPT:'待接收',
    EXECUTING:'进行中',
    OVER:'已完成',
    EXPIRE:'已过期',
}
const timeFrame = ref<ModelValueItf>({
timeType: 'TODAY',
dateRange: []
});
const listData = ref([])
const alarmCon = ref({
  totalNumber: 0,
  chainRatio: 0,
});
const alarmColumn = [
  {
    title: "设备名称",
    dataIndex: "name",
    width: 120,
  },
  {
    title: "设备类型",
    dataIndex: "genreName",
  },
  {
    title: "使用年限",
    dataIndex: "usefulLifeYear",
  },
  {
    title: "操作",
    dataIndex: "deviceStatus",
    slots: {
      customRender: "deviceStatus",
    },
    width: 80,
  }
];
const clickRow = (value)=>{
    ueClient.send('focusActor', {id: value.code});
}
// 设备统计
const changeTopTimeFrame = async()=>{
    const param = {
        sceneType: piniaStoreMenu.currentMenu,
        areaId: piniaStoreArea.currentAreaId,
        period: timeFrame.value.dateRange.join(","),
        type: timeFrame.value.timeType,
    };
  const {records} = await expiredPage(param)
  listData.value = records.map(item=>{
    return {
      ...item,
      expireStatus:stateList[item.expireStatus]
    }
  })
  alarmCon.value = await expiredChain(param)
}
</script>
<style lang="less" scoped>
.extra {
  margin-left: 16px;
  font-size: 12px;
  font-weight: 400;
  font-family: Roboto-Regular, Roboto;

  .mode {
    color: #e7f0ff;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin: 0 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .down {
    color: #2ae8bd;
    font-family: Roboto-Regular, Roboto;
  }

  .up {
    color: #f14545;
    font-family: Roboto-Regular, Roboto;
  }
}
.details{
  color: #91C2F2;
  cursor: pointer;
}
</style>