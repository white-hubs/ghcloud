<template>
  <div class="card list-data">
    <a-tabs class="a-title" v-model:activeKey="activeKey">
      <a-tab-pane v-for="(item, index) in batteryData" :key="index" :tab="'蓄电池组'+(index+1)">
        <div class="wrap">
          <div class="list">
            <div class="item" v-for="(sub, idx) in item" :key="sub.propCode">
              <template v-if="!sub.propName.includes('后备')">
                <div class="chart">
                  <ElectricGaugeChart :value="getCodeValue(sub.propCode)" :min="Math.min(...sub.dataConstraint)"
                    :max="Math.max(...sub.dataConstraint)" :unit="sub.unitName" />
                </div>
                <div class="label">{{ sub.propName }}</div>
              </template>

              <div class="battery-time" v-else>
                <img :src="img.dcrl1" alt="" />
                <div class="label">
                  <div>{{ sub.propName }}</div>
                  <div>{{ getCodeValue(sub.propCode) ?
                    convertSeconds(getCodeValue(sub.propCode)) : '--' }}</div>
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
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import GuideChart from "../common/guide-chart.vue";

const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const ups1 = `${GEM}/ups-1.png`
const ups2 = `${GEM}/ups-2.png`
const ups3 = `${GEM}/ups-3.png`
const dcrl1 = `${GEM}/dcrl-1.png`
const dcrl2 = `${GEM}/dcrl-2.png`
const dc = `${GEM}/dc.png`
const yd = `${GEM}/yd.png`
const wd = `${GEM}/wd.png`
import { filterU, filterSame, convertSeconds, batteryfilter, groupArray, getUnit } from "@/hooks/device-info.ts";
import ElectricGaugeChart from "../../components/echart/electric-gauge-chart.vue";

export default defineComponent({
  components: {
    GuideChart,
    ElectricGaugeChart
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
    const activeKey = ref(0);
    const state = reactive({
      deviceData: {
        fileVO: {
          path: "",
        },
      },
      codeList: [],
      attributeData: {},
      batteryData: [],
    })
    watch(() => props.propsCodeList, (newVal) => {
      state.codeList = newVal
      state.batteryData = groupArray(batteryfilter(newVal))
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
    const getUnitName = (unitName) => {
      if (!unitName) return ''
      return getUnit(unitName)
    }
    return {
      ...toRefs(state),
      getCodeValue,
      getUnitName,
      activeKey,
      img: {
        ups1,
        ups2,
        ups3,
        dcrl1,
        dcrl2,
        dc,
        yd,
        wd
      },
      filterU, filterSame, convertSeconds, batteryfilter, groupArray, getUnit
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
  }

  &.list-data {
    .wrap {
      margin: 10px 0;

      .list {
        display: grid;
        // g;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;

        .item {
          // flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 90px 0;
          background: #f9fafc;


          .label {
            font-size: 16px;
            font-family: Source Han Sans CN, Source Han Sans CN-Regular;
            font-weight: Regular;
            text-align: left;
            color: #606266;
            text-align: center
          }

          .chart {
            height: 183px;
            width: 183px;
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
            // max-width: 30%;
            flex: 1;
            display: flex;
            align-items: center;
            // margin: 10px;
            margin-left: 0;
            margin-right: 20px;
            background: #F9FAFC;
            border-radius: 8px;
            padding: 20px;
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

          // .chart {
          //   width: 78px;
          //   height: 50px;
          // }

          .icon {
            width: 44px;
            height: 44px;
            margin-left: 36px;
            position: relative;
          }
        }
      }

    }
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
</style>
