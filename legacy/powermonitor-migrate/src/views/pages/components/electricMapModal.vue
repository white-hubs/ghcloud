<template>
  <div class="map-modal">
    <div class="tab-select">
      <div class="select-top">
        <a-select v-model:value="state.selectValue" show-search placeholder="请选择" style="width: 200px;"
          :options="props.deviceOptions">
        </a-select>
        <a-range-picker v-show="state.radioValue === 'b'" v-model:value="period" :allowClear="false"
          valueFormat="YYYY-MM-DD" :disabledDate="disabledDate" @change="onChange" @openChange="onOpenChange"
          @calendarChange="onCalendarChange" />
      </div>

      <div class="tab-icon">
        <a-radio-group v-model:value="state.radioValue" button-style="solid">
          <a-radio-button value="a">
            <PieChartOutlined />
          </a-radio-button>
          <a-radio-button value="b">
            <LineChartOutlined />
          </a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <div class="tab-content">
      <!-- 仪表盘 -->
      <div class="meter" v-if="state.radioValue === 'a'">
        <meter-charts :data="state.meterData" :bottomLabel="selectType"></meter-charts>
      </div>
      <!-- 历史数据折线图 -->
      <div class="line" v-else>
        <electric-line-chart :data="state.lineData" :label="selectType"></electric-line-chart>
      </div>
    </div>
    <div class="tab-buttom">
      <a-radio-group v-model:value="state.selectType" button-style="solid">
        <a-radio-button :value="item.id" v-for="item in props.tabOptions" :key="item.id">{{ item.name }}</a-radio-button>
      </a-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import { reactive, toRefs, onMounted, computed, watch, ref } from "vue";
import { PieChartOutlined, LineChartOutlined } from "@ant-design/icons-vue";
import meterCharts from "./echart/meterChart.vue";
import electricLineChart from "./echart/electricLineChart.vue";
import { getDevicesAttrValue, getDevicesHistory } from "@/api/map";
let deviceAttrsData: any = [];
interface optionsItem {
  name: string;
  id: string;
  groupAttributiveDetailsVos: any[];
}
interface Props {
  tabOptions: optionsItem[];
  deviceOptions: any[];
}
const dates = ref<moment.Moment[]>([]);
const period = ref<string[]>([
  moment().format("YYYY-MM-DD 00:00:00"),
  moment().format("YYYY-MM-DD HH:mm:ss"),
]);
const props = withDefaults(defineProps<Props>(), {
  tabOptions: () => [],
  deviceOptions: () => [],
});
const disabledDate = (current: moment.Moment) => {
  if (!dates.value || dates.value.length === 0) {
    return false;
  }
  const diffDate = current.diff(dates.value[0], "days");
  return Math.abs(diffDate) > 7;
};

const onOpenChange = (open: boolean) => {
  if (open) {
    dates.value = [];
  }
};
const onChange = (val: string[]) => {
  period.value = [
    moment(val[0]).format("YYYY-MM-DD 00:00:00"),
    moment(val[1]).format("YYYY-MM-DD") +" "+ moment().format('HH:mm:ss'),
  ];
};

const onCalendarChange = (val: moment.Moment[]) => {
  dates.value = val;
};
/**
 * 数据部分
 */

const state = reactive({
  selectValue: props.deviceOptions[0] ? props.deviceOptions[0].value : "",
  radioValue: "a",
  selectType: props.tabOptions[0] ? props.tabOptions[0].id : "",
  lineData: {},
  meterData: { A: 0, B: 0, C: 0 },
});
const selectType = computed(() => {
  const items = props.tabOptions.find((item) => item.id === state.selectType);
  return items ? items.name : "";
});
watch(
  () => state.selectValue,
  () => {
    if(state.radioValue==='a'){
    getDeviceAttrs();
    }else{
      getDeviceHistoryData();
    }
  }
);
watch(
  () => state.selectType,
  () => {
    if(state.radioValue==='a'){
      getDeviceAttrs();
    }else{
      getDeviceHistoryData();
    }
  }
);
watch(
  () => state.radioValue,
  (val) => {
    if (val === "a") {
      getDeviceAttrs();
    } else {
      getDeviceHistoryData();
    }
  }
);
watch(
  () => period.value,
  () => {
    getDeviceHistoryData();
  }
);
const getDeviceHistoryData = async () => {
  const params = {
    deviceId: state.selectValue,
    period: period.value.join(","),
    attributives: attrArray.value,
  };
  const result: any = await getDevicesHistory(params);
  let LineData = {
    xData: [],
    seriesDataA: [],
    seriesDataB: [],
    seriesDataC: [],
  };
  for (const key in result) {
    const resultItem = result[key];
    for (let i = 0; i < resultItem.length; i++) {
      const elItem = resultItem[i];
      LineData.xData = elItem.propertyHistoryVos.map((item) => item.ts);
    if (attrArray.value.includes(elItem.attributeCode)) {
      if (elItem.attributeCode.includes("a")) {
        LineData.seriesDataA = elItem.propertyHistoryVos.map(
          (item) => item.value
        );
      }
      if (elItem.attributeCode.includes("b")) {
        LineData.seriesDataB = elItem.propertyHistoryVos.map(
          (item) => item.value
        );
      }
      if (elItem.attributeCode.includes("c")) {
        LineData.seriesDataC = elItem.propertyHistoryVos.map(
          (item) => item.value
        );
      }
    }
    }
  }
  state.lineData = LineData;
};
const attrArray = computed(() => {
  const checkDevices = props.tabOptions.find(
    (item) => item.id === state.selectType
  );
  const hanldeArray: string[] = [];
  checkDevices?.groupAttributiveDetailsVos.forEach((item) => {
    hanldeArray.push(item.code);
  });
  return hanldeArray;
});
// 处理仪表盘数据
const handleMeterData = () => {
  let meterData: any = {
    A: 0,
    B: 0,
    C: 0,
  };
  const loopData = deviceAttrsData;
  const loopLen = deviceAttrsData.length;
  // 遍历所有属性数据进行仪表盘复制
  for (let i = 0; i < loopLen; i++) {
    const el = loopData[i];
    // 当前选择的设备数据类型
    if (attrArray.value.includes(el.key)) {
      // A箱
      if (el.key.includes("a")) {
        meterData.A = el.value ?? 0;
      }
      // B箱
      if (el.key.includes("b")) {
        meterData.B = el.value ?? 0;
      }
      // C箱
      if (el.key.includes("c")) {
        meterData.C = el.value ?? 0;
      }
    }
  }
  state.meterData = meterData;
};
const getDeviceAttrs = async () => {
  const result: any = await getDevicesAttrValue({deviceId:state.selectValue,withSnapShot:true});
  deviceAttrsData = result.snapshots;
  handleMeterData();
};
onMounted(async () => {
  getDeviceAttrs();
});
// 使用toRefs解构
defineExpose({
  ...toRefs(state),
});
</script>
<style scoped lang="less">
.map-modal {
  .tab-select {
    .select-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tab-icon {
      display: flex;
      // align-items: flex-end;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }

  .tab-content {
    height: 400px;
    margin-top: 20px;

    .meter,
    .line {
      width: 100%;
      height: 100%;
    }
  }

  .tab-buttom {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }
}
</style>
