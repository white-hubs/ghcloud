<template>
  <div class="card list-data">
    <div class="title">现场数据</div>
    <div class="wrap">
      <div class="list">
        <div class="item">
          <div class="wrap">
            <div class="icon">
              <img :src="img.ups1" alt="" />
            </div>
            <div class="info">
              <div class="tit">UPS工作模式</div>
              <div class="text">{{ getCodeValue('work_mode') || '--' }}</div>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="wrap">
            <div class="icon">
              <img :src="img.ups2" alt="" />
            </div>
            <div class="info">
              <div class="tit">UPS状态</div>
              <div class="text">{{ getCodeValue('ups_status') || '--' }}</div>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="wrap">
            <div class="icon">
              <img :src="img.yd" alt="" />
            </div>
            <div class="info">
              <div class="tit">UPS负载</div>
              <div class="text">{{ getCodeValue('out1_load_p') || '0' }}%</div>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="wrap">
            <div class="icon">
              <img :src="img.dc" alt="" />
            </div>
            <div class="info">
              <div class="tit">电池状态</div>
              <div class="text">{{ getCodeValue('bat_status') || '--' }}</div>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="wrap">
            <div class="icon">
              <img :src="img.ups3" alt="" />
            </div>
            <div class="info">
              <div class="tit">通讯状态</div>
              <div class="text" v-if="deviceData?.onlineState" style="color: #5CCD4DFF;">
                在线
              </div>
              <div class="text" v-else style="color: #fba33f;">
                离线
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive, toRefs, watch
} from "vue";
const UE5_SN_UPS_ASSETS = '/resource/v1/ue5-sn-migrate/components/equipmentdetails/device-dashboard/ups/assets'
const ups1 = `${UE5_SN_UPS_ASSETS}/ups-1.png`
const ups2 = `${UE5_SN_UPS_ASSETS}/ups-2.png`
const ups3 = `${UE5_SN_UPS_ASSETS}/ups-3.png`
const dc = `${UE5_SN_UPS_ASSETS}/dc.png`
const yd = `${UE5_SN_UPS_ASSETS}/yd.png`

export default defineComponent({
  components: {},
  props: {
    baseInfo: {
      type: Object,
      default: {
        fileVO: {
          path: "",
        }
      }
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
      attributeData: {}
    })
    watch(() => props.baseInfo, (newVal) => {
      state.deviceData = newVal
    }, { immediate: true, deep: true })
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
      data: props.data,
      img: {
        ups1,
        ups2,
        ups3,
        dc,
        yd,
      },
    };
  },
});
</script>
<style scoped lang="less">
.card {
  display: flex;
  flex-direction: column;
  padding: 0;

  .title {
    font-size: 14px;
    color: #fff;
  }

  &.list-data {
    .wrap {
      margin: 10px 0;
      .list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-content: space-around;

        .item {
          width: 24%;
          flex-shrink: 0;
          display: inline-block;
          color: #F9FAFC;
          border: 1px solid #2989FF;
          border-radius: 8px;
          padding: 10px;

          &:first-child {
            margin-left: 0;
          }

          &:last-child {
            margin-right: 20px;
          }

          .wrap {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
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
            color: #F9FAFC;
            line-height: 20px;
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
