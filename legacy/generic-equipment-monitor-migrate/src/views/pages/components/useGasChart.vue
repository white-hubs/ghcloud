<template>
  <div>
    <div class="chartData">
      <div class="water">
        <div v-for="(item,index) in water" class="chart-item">
          <gauge-chart :data="item.value" :title="attrData[index].attributeName " :max="getMax(attrData[index].valueMax)"
            :unit="attrData[index].attributeUnitName "></gauge-chart>
          <span>{{attrData[index].attributeName}}/{{attrData[index].attributeUnitName }}</span>
        </div>
      </div>
      <!-- <div class="waterLie">
        <div class="box" v-for="item in waterLie">
          <liquidFillChart :data="item.attributeValue" :title="attrData.modelName + '液位'"></liquidFillChart>
        </div>
      </div> -->
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
import liquidFillChart from './echart/liquidFillChart.vue'
export default defineComponent({
  components: { gaugeChart, liquidFillChart },
  props: {
    type: {
      type: String,
      default: ""
    },
    attributeValue: {
      type: Object,
      default: {}
    },
    attrData: {
      type: Object,
      default: []
    }
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();

    const state = reactive({
      water: [],
      waterLie: [],
      maxVlaue: 60
    });
    watch(() => props.attributeValue, val => {
      for (const key in props.attributeValue) {
        if (key === 'natural_gas_concentration') {
          state.water.push({
            code: key,
            value: props.attributeValue[key] ? parseInt(props.attributeValue[key]) : 0
          })
        }
      }
    }, { deep: true })

    const getMax = (val) => {
      return !val ? state.maxVlaue : parseInt(val)
    }
    return {
      ...toRefs(state),
      getMax
    };
  },
});
</script>

<style lang="less" scoped>
.chartData {

  .water,
  .waterLie {
    position: relative;
    width: 100%;
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
    min-height: 300px;
    border: 1px solid #ccc;

    .title {
      position: absolute;
      top: 5px;
      left: 5px;
    }

    .chart-item {
      width: 300px;
      height: 300px;
    }

    div {
      position: relative;

      span {
        position: absolute;
        font-size: 16px;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        text-align: center;
      }

      &.box {
        width: 240px;
        height: 240px;
      }
    }
  }
}
</style>
