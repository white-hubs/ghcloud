<template>
  <div class="card list-data">
    <div class="title">{{ title }}</div>
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
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import GaugeChart from '../../../components/echart/newGaugeChart.vue'
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const ups1 = `${GEM}/ups-1.png`
const ups2 = `${GEM}/ups-2.png`
const ups3 = `${GEM}/ups-3.png`
const dcrl1 = `${GEM}/dcrl-1.png`
const dcrl2 = `${GEM}/dcrl-2.png`
const dc = `${GEM}/dc.png`
const yd = `${GEM}/yd.png`
const xh = `${GEM}/xh.png`
import { filterU, filterSame, convertSeconds } from "@/hooks/device-info.ts";

export default defineComponent({
  components: {
    GaugeChart
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    propsCodeList: {
      type: Object,
      default: []
    },
    attributeValue: {
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
      outData: [],
    })
    watch(() => props.propsCodeList, (newVal) => {
      state.codeList = newVal
      const isone = filterU(newVal).inv.length > 0
      const codeObj = {
        inv: filterSame(filterU(newVal, !isone).inv),
        outv: filterSame(filterU(newVal, !isone).outv),
      }
      state.outData = codeObj.outv[0]
    }, { immediate: true, deep: true })
    watch(() => props.attributeValue, (newVal) => {
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
  background: #FFFFFF;
  border-radius: 4px;
  margin-top: 20px;

  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-weight: 700;
    font-size: 16px;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #E4E7EDFF;
  }

  .tip {
    margin: 5px 10px 15px 0;
    padding: 10px 0 10px 20px;
    background: #F9FAFC;
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
    display: flex;
    align-items: center;
    gap: 20px;

    .title2 {
      font-size: 14px;
      flex-shrink: 0;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #4E5969;
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
  }
}
</style>
