<template>
  <div>
    <div class="electron">
      <div class="voltage">
        <span class="title">电压数据</span>
        <div v-for="item in voltage">
          <gauge-chart :data="item.attributeValue" :title="item.attributiveName" :max="500" unit="/V"></gauge-chart>
          <span>{{item.attributiveName}}/V</span>
        </div>
      </div>
      <div class="current">
        <span class="title">电流数据</span>
        <div v-for="item in current">
          <gauge-chart :data="item.attributeValue"  :title="item.attributiveName" :max="320" unit="/A"></gauge-chart>
          <span>{{item.attributiveName}}/A</span>
        </div>
      </div>
      <div class="temperature">
        <span class="title">温度数据</span>
        <div v-for="item in temperature">
          <gauge-chart :data="item.attributeValue"   :title="item.attributiveName" unit="/°C"></gauge-chart>
          <span>{{item.attributiveName}}/°C</span>
        </div>
      </div>
      <div class="alldata">
        <span class="title">总电能数据</span>
        <div v-for="item in all" class="name">
          {{item.attributeValue?item.attributeValue+"KW·h":'--'}}
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
import gaugeChart from './echart/gaugeChart.vue'
import { useStore } from "vuex";
export default defineComponent({
  components: { gaugeChart },
  props: {
    id: {
      type: String,
      default: "",
    },
    subscribeRealTimeData:{
      type: Array,
    }
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const state = reactive({
      voltage: [],
      current: [],
      temperature: [],
      all: []
    });
    const initStatus = ref(false)
    const getData = () => {
      proxy.$api
        .getGroupAttributive({ applicationCode: JSON.parse(sessionStorage.getItem("GH-currentApplication")).code })
        .then((res) => {
          state.voltage = res.find((data) => data.name == '电压').groupAttributiveDetailsVos
          state.current = res.find((data) => data.name == '电流').groupAttributiveDetailsVos
          state.temperature = res.find((data) => data.name == '温度').groupAttributiveDetailsVos
          state.all = res.find((data) => data.name == '总电能').groupAttributiveDetailsVos
          if(props.subscribeRealTimeData.length){
            setChartValue(props.subscribeRealTimeData)
          }
          initStatus.value = true
        });
    }

    const setValue = (dataName, item) => {
      state[dataName] = state[dataName].map((res) => {
        if (res.code == item.key) {
          res.attributeValue = item.value===''?0: parseFloat(item.value).toFixed(2)
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
    }

    watch(
      () => props.subscribeRealTimeData,
      () =>{
        if(initStatus.value){
          setChartValue(props.subscribeRealTimeData)
        }
      }
    );

    onMounted(()=>{
      getData()
    })

    return {
      ...toRefs(state),
    };
  },
});
</script>

<style lang="less" scoped>
.electron {

  .alldata {
    position: relative;
    border: 1px solid #ccc;
    width: 100%;
    margin-top: 5px;
    padding: 10px;
    margin-bottom: 40px;

    .name {
      font-size: 20px;
      font-weight: bold;
    }
  }

  .voltage,
  .current,
  .temperature {
    position: relative;
    border: 1px solid #ccc;
    width: 100%;
    margin-top: 5px;
    display: flex;
    min-height: 200px;
    justify-content: space-between;

    .title {
      position: absolute;
      top: 5px;
      left: 5px;
    }

    div {
      position: relative;

      width: 280px;
      height: 280px;

      span {
        position: absolute;
        font-size: 16px;
        bottom: 15px;
        left: 50%;
        transform: translateX(-50%);
      }
    }

  }


}
</style>
