<!-- 空调管理 -->
<template>
  <div >
    <SubPanelTemplate title="空调类型分布">
      <div class="equipmentAlarm">
        <RoundPie :data="roundPieData" :eventNum="eventNum">
          <div class="content">
            <span>{{ eventNum }}</span> <br />设备总数
          </div>
        </RoundPie>
        <pieList :roundPieData="roundPieData"></pieList>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="报警事件top5">
      <!-- <template #bar>
                <div class="right-bar" @click="handelViewMore">查看更多》</div>
                      </template> -->
      <DateInlineForm
        v-model:modelValue="eventInfo"
        @search="alarmEventTop"
      ></DateInlineForm>
      <div class="body" v-show="alarmTop.arr.length > 0" style="min-height: 250px">
        <EventAlarmItem
          v-for="(item, index) in alarmTop.arr"
          :key="item.id"
          :sort="index + 1"
          :name="item.name"
          :count="item.alarmNum"
          :ratio="item.ratio + '%'"
        />
      </div>
      <div class="body" v-show="alarmTop.arr.length <= 0" style="min-height: 150px">
        <noData></noData>
      </div>
    </SubPanelTemplate>
    <SubPanelTemplate title="实时报警数据" class="alarm-event">
      <RollTable
        :column="columns"
        :data="data.arr"
        @click-row="handelClickRow"
        :limitScrollNum="7"
      >
      </RollTable>
    </SubPanelTemplate>
  </div>
  <!-- <Modal :show-modal="true" :title="modalParams.title" :select-item="modalParams.selectItem" :columns="modalParams.columns"></Modal> -->
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../equipmentPanel/businessPanel/public/subPanelTemplate.vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import RoundPie from "../public/charts/roundPie/roundPie.vue";
import pieList from "../public/pieList.vue";
import EventAlarmItem from "../public/eventAlarmItem.vue";
import RollTable from "../public/rollTable/index.vue";
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import noData from "../public/noData.vue";
import { ModelValueItf } from "../public/types";
import useCommon from "../../hooks/useCommon";
import { aralmDataList } from "@/utils/requestData/alarm";
import moment from "moment";

import viewMore from "./view-more";
import bus from "@/utils/bus";
import { useStateStore } from "@/pages/state/use-state-store";
const { getEquipmentNumber, getEventTop } = useCommon();
const { globalState } = useStateStore();

let timer: any = ref(null);
const eventInfo = ref<ModelValueItf>();
const colorList = ["#328BF7", "#FFC700", "#19F8F7", "#EF424A"];
const roundPieData = reactive([]);
const eventNum = ref<number>(0);
const alarmTop = reactive({ arr: [] });
const columns = ref([
  {
    title: "时间",
    dataIndex: "alarmTime",
    width: 120,
    slots: {
      title: "alarmTime",
    },
    customRender: (text) => {
      return text ? (typeof text === 'number' ? moment(text).format("YYYY-MM-DD HH:mm:ss") : text) : "--"
    },
  },
  {
    title: "报警设备",
    dataIndex: "alarmTargetName",
  },
  {
    title: "报警事件",
    dataIndex: "alarmEventName",
  },
]);
let data = reactive({
  arr: [],
});
const { modalParams } = viewMore();
watch(
  () => globalState.business.currentAreaId,
  () => {
    clearInterval(timer);
    timer = setInterval(() => {
      init();
    }, (window as any).config.pageLoopRequestTime);
    init();
  }
);
// 空调类型分布
const deviceDataInfo = async () => {
  let res: any = await getEquipmentNumber();
  if (!res.deviceNum) {
    return;
  }
  roundPieData.length = 0;
  res.deviceGenreNums.forEach((item, index) => {
    let obj = {
      label: `${item.genreName}(${
        Math.round((item.num / res.deviceNum) * 10000) / 100.0
      }%)`,
      color: colorList[index],
      value: item.num,
    };
    roundPieData.push(obj);
  });
  eventNum.value = res.deviceNum;
};
// 报警事件Top5
const alarmEventTop = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: eventInfo.value.dateRange.join(","),
    type: eventInfo.value.timeType,
  };
  let res = await getEventTop(param);
  alarmTop.arr = res;
};
// 实时报警数据
const alarmRealData = async () => {
  let param = {
    sceneType: globalState.business.currentMenu,
    areaId: globalState.business.currentAreaId,
    period: `${moment().format("YYYY-MM-DD 00:00:00")},${moment().format(
      "YYYY-MM-DD 23:59:00"
    )}`,
    pageSize: 50,
    pageNumber: 1,
  };
  let res = await aralmDataList(param);
  data.arr = res.records.filter((item) => {
    if (moment(item.alarmTime).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")) {
      return item;
    }
  });
};
/**
 * 查看更多
 */
const handelViewMore = () => {};
const handelClickRow = (record) => {
  if (record.alarmTargetCode) {
    bus.emit("equipmentPosition", record);
  }
};
const init = () => {
  deviceDataInfo();
  alarmEventTop();
  alarmRealData();
};
onMounted(() => {
  deviceDataInfo();
  alarmRealData();
  timer.value = setInterval(() => {
    init();
  }, (window as any).config.pageLoopRequestTime);
});
onBeforeUnmount(() => {
  clearInterval(timer.value);
});
</script>
<style lang="less" scoped>
.equipmentAlarm {
  display: flex;
  justify-content: space-around;
  align-items: center;
  .content {
    font-size: 12px;
  }
  :deep(.pie-box){
    width: 200px;
  }
}

.ringRatio {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  margin-left: 6px;
}

.chart {
  height: 140px;
  display: flex;
}

.iconOutlined {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #cbe2ff;
}
.alarm-event{
  height: 300px;
}
</style>
