<template>
  <div >
    <securityMonitor></securityMonitor>
    <SubPanelTemplate title="报警事件top5" class="alarm-event">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="eventTime"
          @search="changeEventTime"
        ></DateInlineForm>
      </template>
      <div class="body" style="min-height: 250px" >
        <EventAlarmItem
          v-for="(item, index) in alarmRank.list"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :linkRatio="item.chainRatio"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="巡逻异常数统计">
      <template #extra>
        <DateInlineForm
          v-model:modelValue="unusualTime"
          @search="changeUnusualTime"
        ></DateInlineForm>
      </template>
      <div
        class="body"
        style="min-height: 200px; position: relative"
        :style="{ top: tableList.length <= 0 ? '-40px' : '0px' }"
      >
        <RollTable
          :key="falg"
          :column="column"
          :data="tableList"
          @click-row="handelClickRow"
        >
          <template #photos="{ record }">
            <a-image-preview-group>
              <a-image
                v-for="item in record.photos.url"
                :width="30"
                :height="30"
                :src="item"
              ></a-image>
            </a-image-preview-group>
          </template>
        </RollTable>
      </div>
    </SubPanelTemplate>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import EventAlarmItem from "@/components/businessPanel/public/eventAlarmItem.vue";
import RollTable from "../public/rollTable/index.vue";
import tableData from "./rollTable";
import bus from "@/utils/bus";
import { AlarmAreaTop } from "@/api/models/alarm";
import usrCommon from "../../hooks/useCommon";
import securityMonitor from "@/components/businessPanel/security-monitoring-safty/cards/security-monitor.vue";
import { useStateStore } from "@/pages/state/use-state-store";

interface AlarmHandlType {
  list: AlarmAreaTop[];
}


const alarmRank = reactive<AlarmHandlType>({
  list: [],
});
let falg = ref<number>(0);
let tableList = ref([]);
const {
  eventTime,
  getEventTop,
  unusualTime,
  getremakerList,
} = usrCommon();
const { globalState } = useStateStore()

// 报警事件
async function changeEventTime() {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventTime.value.dateRange.join(","),
    type: eventTime.value.timeType,
  };
  alarmRank.list = await getEventTop(param);
}
// 巡逻异常
async function changeUnusualTime() {
  let param = {
    period: unusualTime.value.dateRange.join(","),
    pageNumber: 1,
    pageSize: 50,
  };
  tableList.value = await getremakerList(param);
  falg.value++;
}

const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const { column } = tableData();
function init() {
  changeEventTime();
  changeUnusualTime();
}
onMounted(() => {
  init();
});

</script>
<style lang="less" scoped>
.panel {
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart {
  height: 140px;
  display: flex;
}

.body {
  // :deep(.ant-image){
  //    width: 120px;
  //    height: 120px;
  //    .ant-image-img{
  //       width: 100%;
  //       height: 100%;
  //    }
  // }
}

.monitor {
  .body {
    margin-top: 0;
  }

  .title {
    color: #fff;
    font-size: 16px;
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .camera {
      margin: 0 6px;
      width: 160px;
      height: 90px;
      margin-top: 10px;
    }
  }
}

.alarm-event {
  .footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
}

.extra {
  font-family: Roboto-Regular, Roboto;
  font-weight: 400;
  margin-left: 8px;

  span {
    color: #e7f0ff;
    font-size: 12px;
  }

  .downtriangle {
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #d2fff3;
    margin-right: 3px;
    transform: rotate(180deg);
  }

  .uptriangle {
    border-bottom: 8px solid #ffcece;
    transform: rotate(0deg);
  }

  .radio {
    font-size: 12px;
  }

  .up {
    color: #f14545;
  }

  .down {
    color: #2ae8bd;
  }
}

.right-bar {
  width: 56px;
  height: 24px;
  background: rgba(41, 137, 255, 0.102);
  border-radius: 2px;
  border: 1px solid #2989ff;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
  
  img {
    width: 14px;
    height: 14px;
  }
}
.forbidden {
  background-color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>
