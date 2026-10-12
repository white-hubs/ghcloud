<template>
  <div>
    <div class="electron">
      <div class="electricity">
        <div class="voltage">
          <div class="title">电压数据</div>
          <div class="content">
            <div class="item" v-for="item in voltage">
              <gauge-chart :data="item.attributeValue" :anchorShow="true" :anchorStyle="{
                 borderWidth: 6,
                 borderColor: '#F2A226'
                 }" 
                 :axisLineColor="voltageColor(getCodeMax(item.code) || 500)"
                  :title="item.attributiveName"
                 :max="getCodeMax(item.code) || 500" unit="V"></gauge-chart>
              <span>{{item.attributiveName}}</span>
            </div>
          </div>
        </div>
        <div class="current">
          <div class="title">电流数据</div>
          <div class="content">
            <div class="item" v-for="item in current">
              <gauge-chart :data="item.attributeValue" :anchorShow="true" 
              :title="item.attributiveName"
              :anchorStyle="{
                 borderWidth: 6,
                 borderColor: '#F2A226'
                 }"  :max="getCodeMax(item.code) || 320" unit="A"></gauge-chart>
              <span>{{item.attributiveName}}</span>
            </div>
          </div>

        </div>
      </div>
      <div class="temperature">
        <div class="title">温度数据</div>
        <div class="content">
          <div v-for="item in temperature" class="content-box">
            <div class="item">
              <gauge-chart
              :title="item.attributiveName"
              :data="item.attributeValue" :detailShow="false"
                :splitLineShow="false" :axisTickShow="false" :axisLabelShow="false" :anchorShow="true"
                :progressShow="true" :axisLineColor="[[1,'#f1f3fc']]" :anchorStyle="{
                 borderWidth:4,
                 borderColor: '#1578FF'
                 }" 
                 :pointerStyle="{ color:'#1578FF' }"
                 :anchorSize="8"
                 :max="getCodeMax(item.code) || 100"
                 ></gauge-chart>
            </div>
            <span style="font-size: 12px;">{{item.attributiveName}}</span>
            <span class="temp-item">{{ item.attributeValue }}°C</span>
          </div>
        </div>

      </div>


    <!-- 2026-01-22 华威添加其余数据展示功能 -->
      <div class="alldata">
        <div class="title">总电能</div>
        <div class="content">
           <div v-for="item in all" class="name">
          {{item.attributeValue?item.attributeValue+"KW·h":'--'}}
        </div>
        </div>

      </div>
  <!-- 2026-01-22 华威添加其余数据展示功能 -->
      <div>
        <div class="item-title">现场数据</div>
          <div class="fireControlMsg">
            <div class="fireControlMsg-item" v-for="(item, index) in readData" :key="index">
              <div class="fireControlMsg-item-left">{{ item.attributeName }}：</div>
              <div class="fireControlMsg-item-right">
                <template
                  v-if="item.attributeKeyValueVos.length&&(item.dataType === 'enum'||item.dataType === 'boolean')">
                  {{ item.attributeKeyValueVos.find(e=>e.value.toString() ===
                  attributeValue[item.attributeCode].toString())?.label ||'--' }}
                </template>
                <template v-else>
                  {{ attributeValue[item.attributeCode] ? `${attributeValue[item.attributeCode]} ${item.unitName}`
                  :"--"}}
                </template>
              </div>
            </div>
          </div>
      </div>
      <div>
        <div v-if="readAndWritData.length" :style="show? 'width: 180%;transform: translateX(-200px)':''">
          <div class="item-title">设备控制</div>
          <div class="fireControlMsg-control">
            <a-row :gutter="[16, 16]" style="margin-left: 0; margin-right: 0">
              <a-col :span="8" v-for="item in readAndWritData" :key="item.attributeCode">
                <div class="column">
                  <switch-attribute v-if="item.dataType.toLowerCase() === 'boolean'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></switch-attribute>
                  <enumerate-attribute v-else-if="item.dataType.toLowerCase() === 'enum'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></enumerate-attribute>
                  <set-string-attribute v-else-if="item.dataType.toLowerCase() === 'string'" :attributeItem="item"
                    :deviceId="deviceId" :curValue="attributeValue[item.attributeCode]"></set-string-attribute>
                  <set-value-attribute v-else :attributeItem="item" :deviceId="deviceId"
                    :curValue="attributeValue[item.attributeCode]"></set-value-attribute>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  computed,
  watch,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
  ref,
} from "vue";
import gaugeChart from '@/views/pages/components/echart/gaugeChart.vue'
import EnumerateAttribute from '@/views/pages/components/deviceAttribute/enumerateAttribute.vue'
import setValueAttribute from '@/views/pages/components/deviceAttribute/setValueAttribute.vue'
import setStringAttribute from '@/views/pages/components/deviceAttribute/setStringAttribute.vue'
import switchAttribute from '@/views/pages/components/deviceAttribute/switchAttribute.vue'
import { useStore } from "vuex";
export default defineComponent({
  components: { 
    gaugeChart,    
    EnumerateAttribute,
    setValueAttribute,
    setStringAttribute,
    switchAttribute, },
  props: {
    id: {
      type: String,
      default: "",
    },
    subscribeRealTimeData: {
      type: Array,
    },
    attributeValue: {
      type: Object,
      default: {}
    },
    propsCodeList: {
      type: Object,
      default: {}
    },    
    dataArr: {
      type: Object,
      default: {}
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const state = reactive({
      voltage: [],
      current: [],
      temperature: [],
      all: [],
      readData:[],
      readAndWritData:[]
    });
    const allData = ref([])
    const initStatus = ref(false)
    const getData = () => {
      proxy.$api
        .getGroupAttributive({ applicationCode: JSON.parse(sessionStorage.getItem("GH-currentApplication")).code })
        .then((res) => {
          state.voltage = res.find((data) => data.name == '电压').groupAttributiveDetailsVos
          state.current = res.find((data) => data.name == '电流').groupAttributiveDetailsVos
          state.temperature = res.find((data) => data.name == '温度').groupAttributiveDetailsVos
          state.all = res.find((data) => data.name == '总电能').groupAttributiveDetailsVos
          if (props.subscribeRealTimeData?.length) {
            setChartValue(props.subscribeRealTimeData)
          }
         const allDataGroup = []
          
          res.forEach(item => {
            item.groupAttributiveDetailsVos.forEach(group => {
             allDataGroup.push(group)
            });
          })
          allData.value = allDataGroup
          initStatus.value = true
        });
    }
    const otherData = computed(() => {
      if (!props.dataArr) return []
      return props.dataArr
        .filter(item => {
          return !allData.value.some(data => data.code === item.attributeCode)
        })
    })

    const setValue = (dataName, item) => {
      state[dataName] = state[dataName].map((res) => {
        if (res.code == item.key) {
          res.attributeValue = item.value === '' ? 0 : parseFloat(item.value).toFixed(2)
        }
        return res
      })
    }
    const setChartValue = (subValue) => {
      subValue.forEach(item => {
        setValue('voltage', item)
        setValue('current', item)
        setValue('temperature', item)
        setValue('all', item)
      });
      state.readData = otherData.value.filter(item => !item.dataWrite)
      state.readAndWritData = otherData.value.filter(item => item.dataWrite)
    }

    watch(
      () => props.subscribeRealTimeData,
      () => {
        if (initStatus.value) {
          setChartValue(props.subscribeRealTimeData)
        }
      }
    );

    onMounted(() => {
      getData()
    })
    const getCodeMax = (codeName) => {
      const iotCode = props.propsCodeList?.filter(item => item.propCode === codeName)[0]
      const max = iotCode?.dataConstraint.length === 2 ? Math.max(iotCode?.dataConstraint[0], iotCode?.dataConstraint[1]) : 0
      return max
    }
    // 电压仪表盘 220v正负7%范围为绿色，其余颜色为橙色
    const voltageColor = (max) => {
      const colorList = [
        {
          range: [0, 204],
          ratio: 0,
          color: '#FDAD30'
        },
        {
          range: [204, 235],
          ratio: 0,
          color: '#64D040'
        },
        {
          range: [235, max],
          ratio: 0,
          color: '#FDAD30'
        }
      ]
      const result = colorList.map((item) => {
        if (item.range[0] <= max && item.range[1] <= max) {
          item.ratio = Number((item.range[1] / max).toFixed(2))
        } else if (index === colorList.length - 1 && item.ratio === 0 ) {
          item.ratio = 1
        }
        return [item.ratio, item.color]
      })
      return result
    }
    return {
      ...toRefs(state),
      voltageColor,
      getCodeMax
    };
  },
});
</script>

<style lang="less" scoped>
.electron {
  padding-bottom: 50px;
  .electricity {
    display: flex;
    justify-content: space-between;
  }

  .alldata {
    position: relative;
    border: 1px solid #ccc;
    width: 100%;
    margin-top: 5px;
    padding: 10px;

    .name {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .voltage,
  .current,
  .temperature {
    position: relative;
    width: 49%;

    .title {
      padding: 10px 0px;
      border-bottom: 1px solid #e4e7ed;
      font-size: 16px;
      font-family: Source Han Sans CN, Source Han Sans CN-Medium;
      font-weight: 700;
      text-align: left;
      color: #1d2129;
    }

    .content {
      width: 100%;
      margin-top: 5px;
      display: flex;
      justify-content: space-between;
      position: relative;
      // height: 200px;

      .item {
        height: 210px;
        width: 300px;
        text-align: center;

        span {
          position: relative;
          top: -30px
        }
      }
    }

  }

  .temperature {
    width: 100%;

    .content {
      margin-top: 30px;

      .content-box {
        width: 300px;
        background: #f9fafc;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding:0 10px;

        .item {
          width: 120px;
          height: 120px;
        }

        .temp-item {
          font-size: 20px;
          font-family: Roboto, Roboto-Medium;
          font-weight: 500;
          color: #4e5969;
        }
      }

    }


  }
}
.fireControlMsg {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  margin-bottom: 20px;

  // height: 200px;
  .fireControlMsg-item {
    width: 30%;
    display: flex;
    justify-content: flex-start;
    margin-top: 20px;
    margin-left: 20px;
    font-size: 15px;

    .fireControlMsg-item-left {
      font-weight: 400;
    }

    .fireControlMsg-item-right {
      margin-left: 10px;
    }
  }

  .bg {
    width: 82px;
    height: 82px;
    background: #f8f8f8;
    border-radius: 4px 4px 4px 4px;
    opacity: 1;
    border: 1px solid #f2f2f2;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
.item-title {
  width: 100%;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #000000d9;
  border-bottom: 1px solid #e8e8e88c;
  padding-bottom: 6px;
  padding-top: 5px;
  font-family: "PingFang SC-Medium";


}
</style>
