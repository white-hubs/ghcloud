<template>
  <div class="card list-data" >
    <Tabs class="a-title" v-model:activeKey="activeKey">
      <Tab v-for="(item,index) in batteryData" :key="index" :title="`电池数据${index+1}`">
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
      </Tab>
    </Tabs>
  </div>
</template>

<script lang="jsx">
import {
  defineComponent, 
  reactive, ref, toRefs, watch
} from "vue";
import GuideChart from "../../components/guide-chart.vue";
const IOT_UPS = '/resource/v1/iot-center/dashboard-assets'
const ups1 = `${IOT_UPS}/ups-1.png`
const ups2 = `${IOT_UPS}/ups-2.png`
const ups3 = `${IOT_UPS}/ups-3.png`
const dcrl1 = `${IOT_UPS}/dcrl-1.png`
const dcrl2 = `${IOT_UPS}/dcrl-2.png`
const dc = `${IOT_UPS}/dc.png`
const yd = `${IOT_UPS}/yd.png`
import { filterU, filterSame, convertSeconds, getUnit, groupArray, upsBatteryfilter } from "../../hooks/device-info";
import {Tabs,Tab} from 'vant'
export default defineComponent({
  components: {
    GuideChart,
    Tabs,
    Tab
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
.card {
  border-radius: 4px;
  padding: 0;
  width: 80vw;
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
          margin-top: 10px;
          width: 48%;
          .wrap {
            display: flex;
            align-items: center;
            color: #323233;
            border: 1px solid var(--van-primary-color);
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
            color: #323233;
            line-height: 20px;
          }

          .text {
            font-size: 14px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 500;
            line-height: 20px;
            color: #323233;
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
