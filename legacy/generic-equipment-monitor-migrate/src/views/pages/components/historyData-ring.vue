<template>
  <div class="fireControlStatus">
    <div class="fireControlStatus-item">
      <a-radio-group button-style="solid" v-model:value="tabPosition" @change="changeType">
        <a-radio-button value="TODAY">今日</a-radio-button>
        <a-radio-button value="THIS_WEEK">本周</a-radio-button>
      </a-radio-group>
    </div>
    <div class="fireControlStatus-item">
      <a-range-picker format="YYYY-MM-DD" :placeholder="['请选择', '请选择']" v-model:value="dates" :disabled-date="disabledPriceRangeDate" @change="onRangeChange" valueFormat="YYYY-MM-DD" :allowClear="false" />
    </div>
    <div class="fireControlStatus-item">
      <a-select v-model:value="value" style="width: 200px" placeholder="请选择设备属性"  :options="deviceOption"
        @change="handleChange"></a-select>
    </div>
    <div class="fireControlStatus-item">
      <a-button type="primary" @click="search">查询</a-button>
    </div>
  </div>

  <div class="fireControlStatus-content">
    <HistoryLineChart :historyData="historyData" :deviceData="deviceOption" v-if="!['string','boolean','enum'].includes(deviceOption.find((e) => e.value === value)?.dataType)"></HistoryLineChart>
        <a-table v-else
         :dataSource="historyData" 
         size="small"
         bordered
         :pagination="true"
         :scroll="{ y: tableScrollY }" 
         :columns="[
          {
            align:'center',
            title: '值',
            dataIndex: 'valueTranslate',
            key: 'valueTranslate',
          },
          {
            align:'center',
            title: '更新时间',
            dataIndex: 'time',
            key: 'time',
          }]" 
        ></a-table>
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

import { timeFormat } from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/common";
import HistoryLineChart from "./echart/historyLineChart.vue";
import HistoryLineChartE from "./echart/historyLineChartE.vue";
import Moment from "moment";
import { useStore } from "vuex";
import { cubeDeviceCenterService } from "@/api/service";

export default defineComponent({
  name: "",
  components: { HistoryLineChart, HistoryLineChartE },
  props: {
    deviceId: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const state = reactive({
      historyData: [],
      historyDataE: {},
      disabledCurrent: null,
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
        timeFlag: "TODAY",
      },
      deviceData:null,
      tableScrollY: 200,
    });
    const { proxy } = getCurrentInstance();
    const deviceOption = ref([]);
    const value = ref([]);
    const dates = ref([]);
    const tabPosition = ref("TODAY");
    const onRangeChange = value => {
      state.search.period = `${timeFormat(value[0])} 00:00:00,${timeFormat(value[1])} 23:59:59`
      state.search.timeFlag = '1'
    };
    const changeType = e => {
      let type = e.target.value;
      const nowTime = Moment().format("YYYY-MM-DD");
      let startTime;
      if (type == "TODAY") {
        startTime = Moment().startOf("days").format("YYYY-MM-DD");
      } else if (type == "THIS_WEEK") {
        startTime = Moment().startOf("weeks").format("YYYY-MM-DD");
      } else if (type == "THIS_MONTH") {
        startTime = Moment().startOf("months").format("YYYY-MM-DD");
      }else if(type == 'THIS_YEAR'){
        startTime = Moment().startOf('years').format('YYYY-MM-DD');
      }
      state.search.timeFlag = type;
      dates.value = [startTime, nowTime];

      if (['ELECTRICMANAGE'].includes(applicationCode.value)) {
        state.search.period = dates.value.join(",");
        if (state.search.attributeCode.length > 0) {
          getHistoryData();
        }
      } else {
        state.search.timeFlag = e.target.value;
        getHistoryData();
      }
    };
    const handleChange = value => {
      state.historyData = []
      state.search.attributeCode = [];
      state.search.attributeCode.push(value)
      if(!value||!value.length){
        message.warring('请选择设备属性')
        return
      }
      getHistoryData();
    };
    const getSelectData = () => {
      cubeDeviceCenterService.getNorthDeviceDetail({ deviceId: props.deviceId,withPropertySpec:true })
        .then(res => {
          state.deviceData = res
          deviceOption.value = res.productPropVoList.map(item => {
            return {
              label: item.propName,
              value: item.propCode,
              dataType:item.dataType
            }
          });
          if (deviceOption.value.length > 0) {
            if(['ELECTRICMANAGE'].includes(applicationCode.value)){
              value.value=[deviceOption.value[0].value]
            }else{
              value.value = deviceOption.value[0].value
            }
            
            state.search.attributeCode.push(deviceOption.value[0].value)
          }
          getHistoryData()
        });
    };

      const search = () => {
      if(!value.value||!value.value.length){
         if (proxy?.$message) proxy.$message.warning('至少选择一个设备属性')
        return
      }
      getHistoryData();
    };
    const reset = () => {
      state.search = {
        deviceId: "",
        attributeCode: [],
        period: "",
        timeFlag: "",
      };
      getHistoryData();
    };
    // 获取历史数据
    const getHistoryData = () => {
      
      const params = {
          deviceId: props.deviceId,
          propCodes: state.search.attributeCode.join(","),
          startTs: new Date(dates.value[0] + " " + "00:00:00").getTime(),
          endTs: new Date(dates.value[1] + " "+"23:59:59").getTime(),
        };
        cubeDeviceCenterService.getDevicePropHistoryGroup(params).then(res=>{
          if(['string','boolean','enum'].includes(deviceOption.value.find((e) => e.value === value.value)?.dataType)){
            state.historyData = Object.values(res)[0].map(e=>{
              const productPropVo=state.deviceData.productPropVoList.find(ele=>ele.propCode===e.key)
              return {
                ...e,
                time:Moment(e.ts).format('YYYY-MM-DD HH:mm:ss'),
                propName:productPropVo?.propName||'值',
                valueTranslate:productPropVo.dataConstraint.find(ele=>ele.value.toString()===e.value.toString())?.label||e.value
              }
            });
          }else{
            state.historyData = res;
          }
        })
      state.tableScrollY = document.querySelector('.fireControlStatus-content').clientHeight-400
    }

    const applicationCode = ref('')
    onMounted(async () => {
      const nowTime = Moment().format("YYYY-MM-DD");
      const startTime = Moment().startOf("days").format("YYYY-MM-DD");
      dates.value = [startTime, nowTime];
      applicationCode.value = JSON.parse(sessionStorage.getItem("GH-currentApplication")).code
      state.search.deviceId = props.deviceId;
      getSelectData();
    });
    const onOpenChange = (open) => {
      state.disabledCurrent = null
    };
    const onCalendarChange = (dates) => {
      state.disabledCurrent = dates[0]
    }
    const disabledDate = (current) => {
      if (!state.disabledCurrent) return current > Moment()
      return (
        (current && current < Moment(state.disabledCurrent).subtract(7, 'days')) ||
        current > Moment(state.disabledCurrent).add(7, 'days') ||
        current > Moment()
      )
    }
    const disabledPriceRangeDate = (current) =>{
        return current > Moment().endOf('day')//禁用今天之后的日期
    }
    return {
      onOpenChange,
      disabledDate,
      onCalendarChange,
      ...toRefs(state),
      applicationCode,
      tabPosition,
      changeType,
      value,
      handleChange,
      getSelectData,
      deviceOption,
      onRangeChange,
      getHistoryData,
      search,
      reset,
      dates,
      disabledPriceRangeDate
    };
  },
});
</script>
<style scoped lang="less">
:deep(.ant-select-multiple .ant-select-selector::after) {
  display: none;
}

::-webkit-scrollbar {
  width: 0 !important;
}

.fireControlStatus {
  display: flex;
  justify-content: flex-start;
  padding-bottom: 16px;

  .fireControlStatus-item {
    margin-left: 10px;
  }
}

.fireControlStatus-content {
  height: 700px;

  .fireControlStatus-content-box1 {
    height: 40vh;
    overflow-y: scroll;
    margin-bottom: 100px;
  }
}
:deep(.ant-table-wrapper){
  height: 100%;
}
</style>
