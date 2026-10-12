<template>
  <div class="card list-data">
    <a-tabs class="a-title" v-model:activeKey="activeKey">
      <a-tab-pane v-for="(item,index) in batteryData" :key="index" :tab="`电池数据${index+1}`">
        <!-- <div class="title">{{ title }}</div> -->

        <div class="wrap">
          <div class="list">
            <div class="item" v-for="sub in item" :key="sub.propCode">
              <div class="wrap" v-if="['bat_temp','bat_voltage'].includes(sub.propCode)">
                <div class="chart">
                  <GuideChart :title="sub.propName" :unit="sub.unitName"
                    :color="sub.propCode==='bat_voltage'?'#1890FF':'#FBA33F'" :max="180"
                    :data='getCodeValue(sub.propCode) || 0' />
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

            <!-- <div class="item">
              <div class="wrap">
                <div class="chart">
                  <GuideChart title="湿度" unit="V" color="#FBA33F" :max="180" :data='getCodeValue("bat_temp") || 0' />
                </div>
                <div class="info">
                  <div class="tit">湿度</div>
                  <div class="text">{{ getCodeValue("bat_temp") || 0 }} %</div>
                </div>
              </div>
            </div> -->

            <!-- <div class="item">
              <div class="wrap">
                <div class="icon">
                  <img :src="img.dc" alt="" />
                </div>
                <div class="info">
                  <div class="tit">电池容量</div>
                  <div class="text">{{ getCodeValue("bat_cap_p") || 0 }} %</div>
                </div>
              </div>
            </div>
            <div class="item">
              <div class="wrap">
                <div class="icon">
                  <img :src="img.ups3" alt="" />
                </div>
                <div class="info">
                  <div class="tit">电池后备时间</div>
                  <div class="text">{{ getCodeValue("bat_time") ? convertSeconds(getCodeValue("bat_time") ?? 0) : '--'
                    }}
                  </div>
                </div>
              </div>
            </div> -->
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
import GuideChart from "../../common/guide-chart.vue";

const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const ups1 = `${GEM}/ups-1.png`
const ups2 = `${GEM}/ups-2.png`
const ups3 = `${GEM}/ups-3.png`
const dcrl1 = `${GEM}/dcrl-1.png`
const dcrl2 = `${GEM}/dcrl-2.png`
const dc = `${GEM}/dc.png`
const yd = `${GEM}/yd.png`
import { filterU, filterSame, convertSeconds, getUnit, groupArray, upsBatteryfilter } from "@/hooks/device-info.ts";

export default defineComponent({
  components: {
    GuideChart
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
      batteryData: [],
      attributeData: {},
    })
    watch(() => props.propsCodeList, (newVal) => {
      state.codeList = newVal
      state.batteryData = groupArray(upsBatteryfilter(newVal))
    }, { immediate: true, deep: true })
    watch(() => props.attributeValue, (newVal) => {
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
  background: #FFFFFF;
  border-radius: 4px;
  height: 100%;
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
        height: 100%;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        align-content: space-around;
        gap: 20px;

        .item {
          display: flex;
          align-items: center;
          flex-wrap: wrap;

          .wrap {
            width: 252px;
            display: flex;
            align-items: center;
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
          }

          .text {
            font-size: 14px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 500;
            line-height: 20px;
            color: #4E5969;
          }

          .chart {
            width: 78px;
            height: 50px;
          }

          .icon {
            width: 44px;
            height: 44px;
            position: relative;
          }
        }
      }

    }
  }
}
</style>
