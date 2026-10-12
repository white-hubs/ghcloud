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
          <div v-for="(item,index) in outData" class="chart-item">
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
import GaugeChart from '../../components/newGaugeChart.vue'
import { filterU, filterSame, convertSeconds } from "../../hooks/device-info";

const UE5_SN_UPS_ASSETS = '/resource/v1/ue5-sn-migrate/components/equipmentdetails/device-dashboard/ups/assets'
const ups1 = `${UE5_SN_UPS_ASSETS}/ups-1.png`
const ups2 = `${UE5_SN_UPS_ASSETS}/ups-2.png`
const ups3 = `${UE5_SN_UPS_ASSETS}/ups-3.png`
const dcrl1 = `${UE5_SN_UPS_ASSETS}/dcrl-1.png`
const dcrl2 = `${UE5_SN_UPS_ASSETS}/dcrl-2.png`
const dc = `${UE5_SN_UPS_ASSETS}/dc.png`
const yd = `${UE5_SN_UPS_ASSETS}/yd.png`
const xh = `${UE5_SN_UPS_ASSETS}/xh.png`

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
    color: #fff;
  }

  .tip {
    margin: 5px 10px 15px 0;
    padding: 10px 0 10px 20px;
    background: #a9adba;
    border-radius: 4px 4px 4px 4px;
    border: 1px solid #2989FF;
    font-size: 14px;
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 400;
    color: #F9FAFC;

    .val {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #F9FAFC;
    }
  }

  .bottom {
    display: flex;
    align-items: center;
    gap: 20px;

    .title2 {
      font-size: 14px;
      flex-shrink: 0;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #fff;
      margin-right: 20px;
    }

  }

  &.list-data {
    .wrap {

      // margin: 10px 0;
      .list {
        display: flex;

        .item {
          width: 78px;
          height: 78px;
        }
      }

    }
  }
}

.chart-item {
  width: 200px;
  height: 170px;
  margin-bottom: 40px;
  display: inline-block;
  text-align: center;

  span {
    display: inline-block;
    color: #fff
  }
}
</style>
