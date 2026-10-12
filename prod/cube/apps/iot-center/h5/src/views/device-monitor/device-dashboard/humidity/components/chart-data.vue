<template>
  <div class="card list-data">
    <div class="bottom">
      <div class="wrap2">
        <div class="list">
          <div class="item" v-for="(sub, idx) in codeList" :key="idx">
            <div class="chart">
              <ElectricGaugeChart :value="getCodeValue(sub.propCode)" :min="Math.min(...sub.dataConstraint)"
                :max="Math.max(...sub.dataConstraint)" :unit="sub.unitName" />
            </div>
            <div class="label">{{ sub.propName }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent, 
  reactive, toRefs, watch
} from "vue";
import ElectricGaugeChart from "../../components/electric-gauge-chart.vue";

export default defineComponent({
  components: {
    ElectricGaugeChart
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    productPropVoList: {
      type: Object,
      default: []
    },
    data: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
      inputData: [],
    })
    watch(() => props.productPropVoList, (newVal) => {
      state.codeList = newVal
    }, { immediate: true, deep: true })
    watch(() => props.data, (newVal) => {
      state.attributeData = newVal
    }, { immediate: true, deep: true })
    const getCodeValue = (codeName) => {
      try {
        const iotCode = state.codeList.filter(item => item.propCode === codeName)[0]
        const iotVal = state.attributeData[codeName] ?? ''
        const res = {
          code: iotCode.propCode,
          name: iotCode.propName,
          unit: iotCode.unitName,
          value: iotVal
        }
        if (['enum', 'boolean', 'bool'].includes(iotCode.dataType)) {
          const enumCur = iotCode.dataConstraint.filter(e => e.value === iotVal)[0]
          res.value = enumCur ? enumCur?.label : ''
        }
        return res.value
      } catch (error) {
        return ''
      }
    }
    return {
      ...toRefs(state),
      getCodeValue,
    };
  },
});
</script>
<style scoped lang="less">
.card {
  margin-top: 10px;
  padding: 0;

  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-size: 14px;
    color: #323233;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #323233;
  }

  .tip {
    margin: 5px 10px 15px 0;
    padding: 10px 0 10px 20px;
    background: #323233;
    border-radius: 4px 4px 4px 4px;

    font-size: 14px;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    color: #4E5969;

    .val {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #4E5969;
    }
  }

  .bottom {
    .title2 {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #4E5969;
      margin-right: 20px;
    }

  }

  &.list-data {
    .wrap {
      .list {

        .item {
          width: 78px;
          height: 78px;
        }
      }

    }
  }
}

.list {

  .item {
    width: 78px;
    height: 78px;
  }
}

.chart-item {
  padding: 30px;
  background: #f9fafc;
  min-width: 360px;
  width: 33%;
  height: 380px;
  display: inline-block;
  text-align: center;
  padding-top: 60px;
  padding-bottom: 60px;

  span {
    display: inline-block;
  }
}


.wrap2 {
  margin: 10px 0;
  flex-shrink: 0;
  width: 100%;
  -webkit-backface-visibility: hidden;
  opacity: 1;

  .list {
    display: flex;
    flex-wrap: wrap;

    .item {
      width: 320px;
      height: 200px;
      text-align: -webkit-center;

      .label {
        font-size: 16px;
        font-family: Source Han Sans CN, Source Han Sans CN-Regular;
        font-weight: Regular;
        text-align: left;
        color: #323233;
        text-align: center;
        position: relative;
        top:-40px;
      }

      .chart {
        height: 100%;
        width: 100%;
      }

      .battery-time {
        display: flex;
        flex-direction: column;
        align-items: center;

        .label {
          margin-top: 20px;
        }

        img {
          width: 64px;
          height: 87px;
        }

      }

      .wrap {
        margin: 0;
        padding: 0;
        flex: 1;
        display: flex;
        align-items: center;
        margin-left: 0;
        margin-right: 20px;
        border-radius: 8px;
      }

      &:first-child {
        .wrap {
          margin-left: 0;
        }
      }

      &:last-child {
        .wrap {
          margin-right: 20px;
        }
      }

      .info {
        margin-left: 15px;
      }

      .tit {
        font-size: 12px;
        font-family: Source Han Sans, Source Han Sans;
        font-weight: 400;
        color: #606266;
        line-height: 20px;
        text-wrap: nowrap;
      }

      .text {
        font-size: 14px;
        font-family: Source Han Sans, Source Han Sans;
        font-weight: 500;
        line-height: 20px;
        color: #4E5969;
      }

      .icon {
        width: 44px;
        height: 44px;
        margin-left: 36px;
        position: relative;
      }
    }
  }

}

</style>
