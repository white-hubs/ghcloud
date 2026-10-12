<template>
  <div class="card list-data">
    <a-tabs class="a-title" v-model:activeKey="activeKey">
      <a-tab-pane v-for="(item, index) in inputData" :key="index" :tab="'输入数据'+(index+1)">
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
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent,
  reactive, ref, toRefs, watch
} from "vue";
import GaugeChart from '../../components/newGaugeChart.vue'
const xh = '/resource/v1/ue5-migrate/components/equipmentdetails/device-dashboard/ups/assets/xh.png'
import { filterU, filterSame, convertSeconds } from "../../hooks/device-info";

export default defineComponent({
  components: {
    GaugeChart
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
  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-size: 14px;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
    border-bottom: 1px solid #E4E7EDFF;
  }

  .tip {
    margin: 5px 10px 15px 0;
    padding: 10px 0 10px 20px;
    color: #F9FAFC;
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
    color: white;
  }
}

.content-table .a-title .ant-tabs-nav-wrap,
:deep(.content-table .a-title .ant-tabs-nav-wrap) {
  background-color: transparent !important;
  border-bottom: 1px solid #E4E7EDFF;
}

.content-table .a-title {
  :deep(.ant-tabs-nav-wrap) {
    background-color: transparent !important;
  }
}

:deep(.ant-tabs-nav .ant-tabs-tab),
.ant-tabs-nav .ant-tabs-tab {
  padding: 0;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  color: #1D2129;
  line-height: 24px;
  padding-bottom: 6px;
}
</style>
