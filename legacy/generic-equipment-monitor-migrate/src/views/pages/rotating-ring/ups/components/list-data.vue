<template>
  <div class="card list-data">
    <div class="title">{{ title }}</div>
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
              <div class="text" v-if="deviceData?.baseArchivesInfo?.status?.onlineState" style="color: #5CCD4DFF;">
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

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
const GEM = '/resource/v1/generic-equipment-monitor-migrate'
const ups1 = `${GEM}/ups-1.png`
const ups2 = `${GEM}/ups-2.png`
const ups3 = `${GEM}/ups-3.png`
const dcrl1 = `${GEM}/dcrl-1.png`
const dcrl2 = `${GEM}/dcrl-2.png`
const dc = `${GEM}/dc.png`
const yd = `${GEM}/yd.png`

export default defineComponent({
  components: {},
  props: {
    title: {
      type: String,
      default: "",
    },
    baseInfo: {
      type: Object,
      default: {
        fileVO: {
          path: "",
        }
      }
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
      attributeData: {}
    })
    watch(() => props.baseInfo, (newVal) => {
      state.deviceData = newVal
    }, { immediate: true, deep: true })
    watch(() => props.propsCodeList, (newVal) => {
      state.codeList = newVal
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
      },
    };
  },
});
</script>
<style scoped lang="less">
.card {
  background: #FFFFFF;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  height: 100%;
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

  &.list-data {
    .wrap {
      flex: 1;
      margin: 10px 0;

      .list {
      height: 100%;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        align-content: space-around;

        .item {
          width: 252px;
          flex-shrink: 0;
          display: inline-block;
          background: #F9FAFC;
          border-radius: 8px;
          padding: 20px;

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
            color: #606266;
            line-height: 20px;
          }

          .text {
            font-size: 14px;
            font-family: Source Han Sans, Source Han Sans;
            font-weight: 500;
            color: #4E5969;
            line-height: 20px;
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
