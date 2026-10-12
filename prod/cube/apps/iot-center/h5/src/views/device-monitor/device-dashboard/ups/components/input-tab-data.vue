<template>
  <div class="card list-data" v-if="inputData.length>0">
    <Tabs class="a-title" v-model:activeKey="activeKey">
      <Tab v-for="(item, index) in inputData" :key="index" :title="'输入数据'+(index+1)">
        <div class="wrap">
          <div class="tip">
            <img :src="img.xh" alt="" />
            频率：
            <span class="val">{{ getCodeValue('in1_fr') || '0' }} HZ</span>
          </div>
          <div class="bottom">
            <div class="title2">电压</div>
            <div class="list">
              <div class="chart-item" v-for="(sub,ind) in item">
                <GaugeChart :data="getCodeValue(sub.propCode) || 0" :title="sub.propName" :max="360" :unit="'V'">
                </GaugeChart>
                <span>{{sub.propName}} / {{ getCodeValue(sub.propCode) || '0' }}V</span>
              </div>
            </div>
          </div>
        </div>
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive, ref, toRefs, watch
} from "vue";
import GaugeChart from '../../components/new-gauge-chart.vue'
const xh = '/resource/v1/iot-center/dashboard-assets/xh.png'
import { filterU, filterSame, convertSeconds } from "../../hooks/device-info";
import { Tabs,Tab } from 'vant'

export default defineComponent({
  components: {
    GaugeChart,Tabs,Tab
  },
  props: {
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
    const activeKey = ref(0);
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
      const isone = filterU(newVal).inv.length > 0
      const codeObj = {
        inv: filterSame(filterU(newVal, !isone).inv),
        outv: filterSame(filterU(newVal, !isone).outv),
      }
      state.inputData = codeObj.inv
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
      activeKey,
      img: {
        xh
      },
      filterU, filterSame, convertSeconds
    };
  },
});
</script>
<style scoped lang="less">
.card {
  border-radius: 4px;
  padding: 0;
  width: 85vw;
  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-size: 14px;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #323233;
  }

  .tip {
    padding: 10px 10px 10px 20px;
    margin: 10px 0px;
    color: #323233;
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
   text-align: center;

    .title2 {
      font-size: 14px;
      font-family: Source Han Sans, Source Han Sans;
      font-weight: 500;
      color: #323233;
    }

  }

  &.list-data {
    .wrap {
      .list {
        text-align: center;
        .item {
          width: 78px;
          height: 78px;
        }
      }
    }

  }
}

.chart-item {
  margin:20px;
  display: inline-block;
  text-align: center;

  span {
    display: inline-block;
    color: #323233;
  }
}
</style>
