<template>
  <div class="panel overview-left">
    <SubPanelTemplate :title="props.title" class="market-overview">
      <div class="safetyIndex" @click="handelClickRisk">
        <div class="safetyIndex-title">
          <span>周安全指数</span>
          <img @click.stop="showTipModal = true" :src="getAssetsImage('overView91.png')" alt="">
        </div>
        <div class="safetyIndex-content">
          <div class="safetyIndex-content-left">
            <dashboard :data="100-riskData.total"
              :pointerColor="riskData.total<=100 && riskData.total>=81?'#39DA99':riskData.total<=80 && riskData.total>=61?'#FFEF4B':'#FA6A36'">
            </dashboard>
          </div>
          <div class="safetyIndex-content-right">
            <div class="safetyIndex-content-data">
              <count-to :startVal="0" :endVal="riskData.total" :duration="2000"></count-to>分
            </div>
            <div v-if="riskData.total<=100 && riskData.total>=81" class="safetyIndex-content-text normal">
              <div>安全标杆！</div>
              <div>继续保持哦！</div>
            </div>
            <div v-else-if="riskData.total<=80 && riskData.total>=61" class="safetyIndex-content-text warn">
              <div>情况稳定！</div>
              <div>但也别松懈哦！</div>
            </div>
            <div v-else="riskData.total<=60" class="safetyIndex-content-text abnormal">
              <div>保持警惕！</div>
              <div>别掉以轻心哦！</div>
            </div>
          </div>
        </div>
      </div>
      <div class="parkInfo">
        <img v-if="tenantData.files.length&&tenantData.files[0].path" :src="tenantData.files[0].path" alt="">
        <a-empty v-else description="暂无图片" />
        <div class="parkInfo-text" :style="{'transform':`translateY(${scrollHeight}px)`}">
          <div class="parkInfo-title">{{ tenantData.name }}</div>
          <div class="scroll_box">
            <div class="scroll-text">
              {{ tenantData.remark }}
            </div>
          </div>
        </div>
      </div>
      <div class="total-num">
        <img :src="getAssetsImage('circel-halo4.png')" class="bg-img" />
        <img :src="getAssetsImage('circel-halo3.png')" class="img2 rotate reverse" />
        <img :src="getAssetsImage('overView46.png')" class="img3 rotate reverse" />
        <a-progress :stroke-color="{ '0%': '#2C8BFF', '100%': '#B2D4FF', }" :percent="0" type="circle"
          strokeLinecap="square" trailColor="rgba(255, 255, 255, 0.1)" />
        <img :src="getAssetsImage('bubble.png')" class="img3 rotate" />
        <div class="value">
          <img :src="getAssetsImage('overView44.png')" class="img3" />
        </div>
        <div class="list">
          <div :class="['item' + index]" class="item" v-for="(item, index) in callStatisticsData.list">
            <div>
              <CountTo :startVal="0" :endVal="item.value" :duration="2000" separator="" />
              <span style="font-size: calc(var(--font-size-scale) * 12px); margin-left: 2px;">
                {{ item.unit }}
              </span>
            </div>
            <div style="font-size: calc(var(--font-size-scale) * 16px);">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </SubPanelTemplate>
  </div>
  <ModalRiskTable :show-modal="riskModalShow" @close="riskModalShow=false" :riskDetail="riskDetail"></ModalRiskTable>
  <modal-table :show="showTipModal" title="风险指数说明" @close="showTipModal = false" width="973px">
    <tip-modal v-if="showTipModal"></tip-modal>
  </modal-table>
  <Teleport to="body">
    <SecurityDays />
  </Teleport>
</template>
<script lang="ts" setup>
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { nextTick, onMounted, reactive, ref } from "vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import ModalRiskTable from "../components/modal-risk-table.vue";
import { getAssetsImage } from "@/utils/getImage";
import { getTenantDetails } from "@/api/ouaa";
import { TenantType } from '@/api/models/ouaa';
import { riskIndex } from "@/api/saftsecurity/overview";
import SecurityDays from '../components/security-days.vue'
import dayjs from 'dayjs'
import modalTable from "@/components/modal-table/modal.vue";
import tipModal from "./tip-modal.vue";
import { cubeMdataService } from '@/api/service'
import dashboard from "@/components/businessPanel/public/charts/dashboard/dashboard.vue";
import { RiskDetail } from "../components/risk-types";
import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

const props = withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '市场总览'
})
const riskData = reactive({
  title: "安全风险指数",
  total: 0,
  unit: '分'
});
const riskDetail = reactive<RiskDetail>({
  riskIndex: 0,
  //@ts-ignore
  alarmSituationRiskIndex: {
    alarmLevelIndexDetails: [],
  },
  //@ts-ignore
  alarmUnConfirmedRiskIndex: {
    alarmLevelIndexDetails: [],
  },
  //@ts-ignore
  propertyFilingRiskIndex: {
    propertyCategoryDetails: [],
  },
});
const showTipModal = ref(false);
const callStatisticsData = reactive({
  totalNum: 0,
  list: [
      { name: "占地面积", value: 0, unit: '亩' },
      { name: "建筑面积", value: 0, unit: 'm²' },
      { name: "档位数", value: 0, unit: '个' },
      { name: "商户数", value: 0, unit: '个' },
  ]
})

// 风险指数
const getRiskIndex = async () => {
  const period = dayjs().subtract(1, 'week').startOf('week').format('YYYY-MM-DD')+','+dayjs().subtract(1, 'week').endOf('week').format('YYYY-MM-DD')
  const data = await riskIndex({period:period});
  riskData.total = 100 - data.riskIndex 
  Object.assign(riskDetail, data);
  if (!riskDetail.alarmSituationRiskIndex || riskDetail.alarmSituationRiskIndex?.alarmLevelIndexDetails.length === 0) {
    Object.assign(riskDetail, {
      alarmSituationRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: "ONE_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "TWO_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
        ],
      },
    });
  }
  if (!riskDetail.alarmUnConfirmedRiskIndex || riskDetail.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails.length === 0) {
    Object.assign(riskDetail, {
      alarmUnConfirmedRiskIndex: {
        alarmLevelIndexDetails: [
          {
            alarmLevel: "ONE_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "TWO_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
          {
            alarmLevel: "THREE_LEVEL_AND_FOUR_LEVEL",
            totalNum: 0,
            riskIndex: 0,
          },
        ],
      },
    });
  }
  if (!riskDetail.propertyFilingRiskIndex || riskDetail.propertyFilingRiskIndex?.propertyCategoryDetails.length === 0) {
    Object.assign(riskDetail, {
      propertyFilingRiskIndex: {
        propertyCategoryDetails: [
          {
            propertyCategory: "FLAMMABLE_EQUIPMENT",

            riskIndex: 0,
          },
          {
            propertyCategory: "FIRE_FIGHTING_EQUIPMENT",

            riskIndex: 0,
          },
          {
            propertyCategory: "TRANSPORT_DEVICES",

            riskIndex: 0,
          },
        ],
      },
    });
  }
};


const riskModalShow = ref<boolean>(false);
const handelClickRisk = () => {
  riskModalShow.value = true;
};

const scrollHeight = ref(0)
const tenantIntroScroll = () =>{
  const boxDomHeight = document.querySelector('.parkInfo')?.clientHeight
  const height = document.querySelector('.parkInfo-title')?.clientHeight+document.querySelector('.scroll_box')?.clientHeight
  if(boxDomHeight<height){
    requestAnimationFrame(()=>{
      scrollHeight.value-=0.1
      if(0-scrollHeight.value>height){
        scrollHeight.value=0
      }
      nextTick(()=>tenantIntroScroll())
    })
  }
}

const tenantData = reactive<TenantType>({
    address: '',
    areaCovered: 0,
    building: 0,
    code: '',
    files: [],
    location: '',
    logo: {
        id: '',
        name: '',
        path: '',
        size: '',
        suffix: ''
    },
    id: '',
    name: '',
    remark: ''
})
// 获取企业介绍
const getTenantInfo = async () => {
    const res = await getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant)
    const req = await cubeMdataService.getMarketOverviewStatistics()
    Object.assign(tenantData, res)
    nextTick(()=>tenantIntroScroll())
    callStatisticsData.list[0].value = req.areaCovered;
    callStatisticsData.list[1].value = req.floorArea;

    if (!window.config?.feature?.hideGears) {
      callStatisticsData.list[2].value = req.stallNum;
      callStatisticsData.list[3].value = req.supplierNum;
    }
}
const init = () => {
  getRiskIndex()
  getTenantInfo()
};
onMounted(() => {
  if (window.config?.feature?.hideGears) {
    callStatisticsData.list = [
      { name: "占地面积", value: 0, unit: '亩' },
      { name: "建筑面积", value: 0, unit: 'm²' },
    ]
  }
  init()
});
</script>
<style lang="less" scoped>
.overview-left {
  .market-overview {
    :deep(.situation-analysis) {
      .bg {
        width: 120px;

        .rotate {
          width: 70px;
          height: auto;
          left: 28px;
          top: -10px;
        }
      }

      .right {
        width: 198px;
        height: 39px;

        .total {
          height: 100%;

          .title {
            font-size: calc(var(--font-size-scale) * 14px);
            color: white;
          }

          .count {
            span {
              font-size: calc(var(--font-size-scale) * 123px);
              transform: translateY(5px);
            }

            .scroll-number {
              transform: unset;
              font-size: calc(var(--font-size-scale) * 32px);
              font-family: YouSheBiaoTiHei;
            }
          }
        }
      }
    }
  }

  .device-count {
    :deep(.situation-analysis) {
      .list {
        flex-wrap: nowrap;

        .list-item:nth-of-type(1) {
          margin-right: 20px;
          font-size: calc(var(--font-size-scale) * 14px);
        }

        .gh-count-to {
          color: inherit;
          font-size: calc(var(--font-size-scale) * 15px);
        }
      }
    }

    .device-count-chart {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

.panel {
  .chart {
    height: 220px;
  }
}

.parkInfo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 5px;
  overflow: hidden;
  height: 130px;
  margin-top: 15px;

  :deep(.ant-empty) {
    width: 152px;
    height: 128px;

    .ant-empty-img-default {
      width: 100%;
    }

    .ant-empty-description {
      color: white
    }
  }

  img {
    width: 50%;
    height: 100%;
    object-fit: cover;
  }

  .parkInfo-text {
    width: 45%;
    color: #fff;
    font-size: calc(var(--font-size-scale) * 12px);

    .parkInfo-title {
      font-size: calc(var(--font-size-scale) * 1px);
      padding-bottom: 5px;
    }

    .scroll-text {
      word-wrap: break-word;
    }
  }
}

.safetyIndex-content-data {
  :deep(.gh-count-to) {
    font-weight: bold;
    color: #FFFFFF;
    font-family: YouSheBiaoTiHei, YouSheBiaoTiHei !important;
    font-size: calc(var(--font-size-scale) * 40px);
    margin-bottom: -4px;
  }
}

:deep(.gh-count-to) {
  font-weight: bold;
  color: #FFFFFF;
  font-size: calc(var(--font-size-scale) * 22px);
  margin-bottom: -4px;
}

.total-num {
  margin: auto;
  position: relative;
  width: 50%;
  height: 175px;

  .bg-img {
    width: 90%;
  }

  img,
  .value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .img1 {
    width: 159px;
    height: 153px;
  }

  .img2 {
    width: 142px;
    height: 142px;
  }

  .img3 {
    width: 80px;
    height: 80px;
  }

  :deep(.ant-progress) {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 125px;
    height: 125px;
    transform: translate(-50%, -50%) rotate(-25deg);

    .ant-progress-text {
      display: none;
    }

    .ant-progress-inner {
      display: contents;
    }
  }


  .value {
    display: flex;
    flex-flow: column;
    align-items: center;

    :deep(.gh-count-to) {
      font-size: calc(var(--font-size-scale) * 22px);
      font-family: "YouSheBiaoTiHei";
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: -4px;

    }

    &:last-child {
      font-size: calc(var(--font-size-scale) * 12px);
      font-weight: 400;
      color: #D0DEEE;
    }
  }
}

.list {
  width: 100%;
  display: flex;
  position: relative;
  left: 0;
  width: 100%;
  height: 100%;
  color: #D9E7FF;

  .item {
    position: absolute;
    width: 100px;
    font-size: calc(var(--font-size-scale) * 14px);
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    text-align: center;
  }

  .item0 {
    left: -90px;
    top: 20px;
  }

  .item1 {
    right: -80px;
    top: 20px;
  }

  .item2 {
    left: -90px;
    top: 102px;
  }

  .item3 {
    right: -80px;
    top: 102px;
  }
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.rotate {
  animation: rotate 15s infinite linear;
}

:deep(.round-wrap) {
  flex-direction: column;
}

:deep(.round-wrap .info) {
  flex-direction: row;
  justify-content: space-around;
}

.safetyIndex {
  height: 170px;
  padding: 10px;

  .safetyIndex-title {
    font-size: calc(var(--font-size-scale) * 14px);
    color: #fff;
    display: flex;
    align-items: center;
    img{
      margin-left: 5px;
      width: 24px;
    }
  }

  .safetyIndex-content {
    display: flex;
    justify-content: space-around;

    .safetyIndex-content-left {
      flex: 1;
      height: 150px;
    }

    .safetyIndex-content-right {
      width: 130px;
      height: 90px;
      padding: 8px 0;
      text-align: center;
      display: flex;
      flex-flow: column;
      justify-content: center;

      .safetyIndex-content-data {
        color: #ffffff;
        font-size: calc(var(--font-size-scale) * 12px);
      }

      .safetyIndex-content-text {
        font-family: YouSheBiaoTiHei;
        font-size: calc(var(--font-size-scale) * 12px);
        color: #FFEF4B;
        text-align: center;
        position: relative;
        top: -10px;

        .normal {
          color: #39DA99
        }

        .warn {
          color: #FFEF4B
        }

        .abnormal {
          color: #FA6A36
        }
      }
    }
  }
}
</style>
