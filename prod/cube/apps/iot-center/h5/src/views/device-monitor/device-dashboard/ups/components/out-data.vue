<template>
  <div class="card list-data">
    <div class="title">输出数据</div>
    <div class="wrap">
      <div class="tip">
        <img :src="img.xh" alt="" />
        频率：
        <span class="val">{{ getCodeValue('out1_fr') || '0' }} HZ</span>
      </div>
      <div class="bottom">
        <div class="title2">电压</div>
        <div class="list">
          <div class="chart-item" v-for="(item,index) in outData" >
              <GaugeChart :data="getCodeValue(item.propCode) || 0" :title="item.propName" :max="360" :unit="'V'">
              </GaugeChart>
            <span>{{item.propName}} / {{ getCodeValue(item.propCode) || '0' }}V</span>
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
import GaugeChart from '../../components/new-gauge-chart.vue'
import { filterU, filterSame, convertSeconds } from "../../hooks/device-info";

const IOT_UPS = '/resource/v1/iot-center/dashboard-assets'
const ups1 = `${IOT_UPS}/ups-1.png`
const ups2 = `${IOT_UPS}/ups-2.png`
const ups3 = `${IOT_UPS}/ups-3.png`
const dcrl1 = `${IOT_UPS}/dcrl-1.png`
const dcrl2 = `${IOT_UPS}/dcrl-2.png`
const dc = `${IOT_UPS}/dc.png`
const yd = `${IOT_UPS}/yd.png`
const xh = `${IOT_UPS}/xh.png`

export default defineComponent({
  components: {
    GaugeChart
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
  setup(props) {
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
      outData: [],
    })
    watch(() => props.productPropVoList, (newVal) => {
      state.codeList = newVal
      const isone = filterU(newVal).inv.length > 0
      const codeObj = {
        inv: filterSame(filterU(newVal, !isone).inv),
        outv: filterSame(filterU(newVal, !isone).outv),
      }
      state.outData = codeObj.outv[0]
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
      img: {
        ups1,
        ups2,
        ups3,
        dcrl1,
        dcrl2,
        dc,
        yd,
        xh
      },
      filterU, filterSame, convertSeconds
    };
  },
});
</script>
<style scoped lang="less">
.card {
  padding: 0;
  margin-top: 10px;

  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-size: 14px;
    color: #323233;
  }

  .tip {
    // margin: 5px 10px 15px 0;
    padding: 10px 10px 10px 20px;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid var(--van-primary-color);
    font-size: 14px;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    color: #323233;

    .val {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #323233;
    }
  }

  .bottom {

    .title2 {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #323233;
      text-align: center;
    }

  }

  &.list-data {
    .wrap {

      // margin: 10px 0;
      .list {
        display: flex;
        flex-wrap: wrap;
        .item {
          width: 78px;
          height: 78px;
        }
      }

    }
  }
}

.chart-item {
  margin:18px 10px;
  display: inline-block;
  text-align: center;
  text-align: -webkit-center;
  span {
    display: inline-block;
    color: #323233
  }
}
</style>
