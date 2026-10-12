<template>
  <div class="card list-data">
    <a-tabs class="a-title" v-model:activeKey="activeKey">
      <a-tab-pane v-for="(item,index) in batteryData" :key="index" :tab="`电池数据${index+1}`">
        <div class="wrap">
          <div class="list">
            <div class="item" v-for="sub in item" :key="sub.propCode">
              <div class="wrap" v-if="['bat_temp','bat_voltage'].includes(sub.propCode)">
                <div class="icon">
                  <img :src="img.dcrl1" alt="" />
                </div>
                <div class="info">
                  <div class="tit">{{ sub.propName }}</div>
                  <div class="text">{{ getCodeValue(sub.propCode) || 0 }}{{ sub.unitName }}</div>
                </div>
              </div>
              <div v-else-if="sub.propCode==='bat_cap_p'" class="wrap">
                <div class="icon">
                  <img :src="img.dc" alt="" />
                </div>
                <div class="info">
                  <div class="tit">{{sub.propName}}</div>
                  <div class="text">{{ getCodeValue(sub.propCode) || 0 }} %</div>
                </div>
              </div>
              <div v-else class="wrap">
                <div class="icon">
                  <img :src="img.ups3" alt="" />
                </div>
                <div class="info">
                  <div class="tit">{{sub.propName}}</div>
                  <div class="text">{{ getCodeValue(sub.propCode) ? convertSeconds(getCodeValue(sub.propCode) ?? 0) :
                    '--'
                    }}
                  </div>
                </div>
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
import GuideChart from "../../components/guide-chart.vue";
import { filterU, filterSame, convertSeconds, getUnit, groupArray, upsBatteryfilter } from "../../hooks/device-info";

const UE5_SN_UPS_ASSETS = '/resource/v1/ue5-sn-migrate/components/equipmentdetails/device-dashboard/ups/assets'
const ups1 = `${UE5_SN_UPS_ASSETS}/ups-1.png`
const ups2 = `${UE5_SN_UPS_ASSETS}/ups-2.png`
const ups3 = `${UE5_SN_UPS_ASSETS}/ups-3.png`
const dcrl1 = `${UE5_SN_UPS_ASSETS}/dcrl-1.png`
const dcrl2 = `${UE5_SN_UPS_ASSETS}/dcrl-2.png`
const dc = `${UE5_SN_UPS_ASSETS}/dc.png`
const yd = `${UE5_SN_UPS_ASSETS}/yd.png`

export default defineComponent({
  components: {
    GuideChart
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
    const activeKey = ref(0);
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      batteryData: [],
      attributeData: {},
    })
    watch(() => props.productPropVoList, (newVal) => {
      state.codeList = newVal
      state.batteryData = groupArray(upsBatteryfilter(newVal))
    }, { immediate: true, deep: true })
    watch(() => props.data, (newVal) => {
      state.attributeData = newVal
    }, { immediate: true, deep: true })
    const getCodeValue = (codeName) => {
      try {
        if (state.codeList && state.codeList.length > 0) {
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
        } else {
          return ''
        }
      } catch (error) {
        return ''
      }
    }
    return {
      ...toRefs(state),
      activeKey,
      getCodeValue,
      filterU, filterSame, convertSeconds, getUnit,
      img: {
        ups1,
        ups2,
        ups3,
        dcrl1,
        dcrl2,
        dc,
        yd,
      },
    };
  },
});
</script>
<style scoped lang="less">
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
.ant-tabs-nav .ant-tabs-tab{
  padding: 0;
  font-family: Source Han Sans, Source Han Sans;
  font-weight: 500;
  color: #1D2129;
  text-align: center;
  line-height: 24px;
  padding-bottom: 6px;
}
.card {
  border-radius: 4px;
  padding: 0;

  .title {
    font-family: Source Han Sans, Source Han Sans;
    font-size: 14px;
    color: #1D2129;
    line-height: 24px;
    padding-bottom: 5px;
  }

  &.list-data {
    .wrap {
      .list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        align-content: space-around;
        gap: 10px;

        .item {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          width: 24%;
          .wrap {
            display: flex;
            align-items: center;
            color: #F9FAFC;
            border: 1px solid #2989FF;
            border-radius: 8px;
            padding: 10px;
            width: 100%;
          }


          .info {
            margin-left: 15px;
          }

          .tit {
            font-size: 12px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 400;
            color: #F9FAFC;
            line-height: 20px;
          }

          .text {
            font-size: 14px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 500;
            line-height: 20px;
            color: #F9FAFC;
          }

          .chart {
            width: 78px;
            height: 50px;
          }

          .icon {
            width: 30px;
            height: 30px;
            position: relative;
            img{
              width: 100%;
              height: 100%;
            }
          }
        }
      }

    }
  }
}
</style>
