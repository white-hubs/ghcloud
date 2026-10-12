<template>
  <div class="fireControlStatus">
    <div class="fireControlStatus-item">
      <a-radio-group
        button-style="solid"
        v-model:value="tabPosition"
        @change="changeType"
      >
        <a-radio-button value="TODAY">今日</a-radio-button>
        <a-radio-button value="THIS_WEEK">本周</a-radio-button>
        <a-radio-button value="THIS_MONTH">本月</a-radio-button>
      </a-radio-group>
    </div>
    <div class="fireControlStatus-item">
      <a-range-picker
        format="YYYY-MM-DD"
        :placeholder="['请选择', '请选择']"
        v-model:value="dates"
        @change="onRangeChange"
      />
    </div>
    <div class="fireControlStatus-item">
      <a-select
        v-model:value="value"
        mode="multiple"
        style="width: 200px"
        placeholder="请选择设备属性"
        :options="deviceOption"
        @change="handleChange"
      ></a-select>
    </div>

    <div class="fireControlStatus-item">
      <a-button type="primary" @click="serch">查询</a-button>
    </div>
  </div>
  <div class="fireControlStatus-content">
    <div class="fireControlStatus-content-box">
      <HistoryLineChart :historyData="historyData"></HistoryLineChart>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive,
  toRefs,
  onBeforeMount,
  onMounted,
  getCurrentInstance,
  ref,
  watch,
} from "vue";

import { timeFormat } from "@/utils/common";
import HistoryLineChart from "./echart/historyLineChart.vue";
import Moment from "moment";

export default defineComponent({
  name: "",
  components: { HistoryLineChart },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      historyData: [],
      defaultHistoryData: [
        {
          propertyName: "水压",
          valueTsBoList: [
            {
              value: 10,
              ts: 2021,
            },
            {
              value: 16,
              ts: 2022,
            },
            {
              value: 10,
              ts: 2023,
            },
          ],
        },
      ],
      search: {
        deviceId: "",
        attributeCode: [],
        period: "",
        timeFlag: "",
      },
    });
    const { proxy } = getCurrentInstance();
    const deviceOption = ref();
    const value = ref([]);
    const dates = ref([]);
    const tabPosition = ref("TODAY");
    const onRangeChange = value => {
      this.search.period = [timeFormat(value[0]), timeFormat(value[1])].join(
        ",",
      );
    };
    const changeType = e => {
      state.search.timeFlag = e.target.value;
      let type = e.target.value;
      changeDate(type);
    };
    const changeDate = type => {
      const nowTime = Moment().format("YYYY-MM-DD");
      let startTime;
      if (type == "TODAY") {
        startTime = Moment().startOf("days").format("YYYY-MM-DD");
      } else if (type == "THIS_WEEK") {
        startTime = Moment().startOf("weeks").format("YYYY-MM-DD");
      } else if (type == "THIS_MONTH") {
        startTime = Moment().startOf("months").format("YYYY-MM-DD");
      }
      state.search.timeFlag = type;
      dates.value = [startTime, nowTime];
      state.search.period = dates.value.join(",");
      getHistoryData();
    };
    const handleChange = value => {
      state.search.attributeCode = [];
      state.search.attributeCode = value;

      getHistoryData();
    };
    const getSelectData = () => {
      proxy.$api
        .getAttributeByDeviceIDList({ deviceId: props.deviceId })
        .then(res => {
          deviceOption.value = res.map(item => {
            return Object.assign(
              {},
              {
                label: item.attributeName,
                value: item.attributeCode,
              },
            );
          });
        });
    };

    const serch = () => {
      getHistoryData();
    };
    const reset = () => {
      this.search = {
        deviceId: "",
        attributeCode: [],
        period: "",
        timeFlag: "",
      };
      getHistoryData();
    };
    // 获取历史数据
    const getHistoryData = () => {
      state.search.attributeCode = value;
      proxy.$api.getDeviceHistoryData(state.search).then(res => {
        if (res) {
          state.historyData = res.propertyTsBoList ? res.propertyTsBoList : [];
        }
      });
    };

    onBeforeMount(() => {
      //2.组件挂载页面之前执行----onBeforeMount
    });
    onMounted(() => {
      //3.组件挂载到页面之后执行-------onMounted
      state.search.deviceId = props.deviceId;
      getSelectData();
      changeDate("TODAY");
    });
    return {
      ...toRefs(state),

      tabPosition,
      changeType,
      value,
      handleChange,
      getSelectData,
      deviceOption,
      onRangeChange,
      getHistoryData,
      serch,
      reset,
      dates,
      changeDate,
    };
  },
});
</script>
<style scoped lang="less">
::-webkit-scrollbar {
  width: 0 !important;
}
.fireControlStatus {
  display: flex;
  justify-content: flex-end;
  .fireControlStatus-item {
    margin-left: 10px;
  }
}
.fireControlStatus-content {
  height: 700px;
  .fireControlStatus-content-box {
    height: 620px;
    overflow-y: auto;
    margin-bottom: 100px;
  }
}
</style>
