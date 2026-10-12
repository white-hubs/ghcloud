<template>
  <SubPanelTemplate title="报警事件正确率" image="xj.png">
    <template #extra>
      <DateInlineForm
        class="shengNongColor"
        v-model:modelValue="dnTime"
        @search="changednTime"
      ></DateInlineForm>
    </template>
    <div class="showPanel">
      <div v-if="statisticsData.length > 0">
        <div
          class="blister"
          :class="classList[index % classList.length]"
          v-for="(item, index) in statisticsData"
        >
          <div class="ball">
            <img style="width: 100%" :src="getAssetsImage('pie-01.png')" alt="" />
            <count-to
              :startVal="0"
              :endVal="item.total"
              :duration="2000"
              separator=""
            ></count-to>
            <span class="unit">%</span>
            <div class="blisterTitle">{{ item.name }}</div>
          </div>
        </div>
      </div>
      <div style="width: 100%; margin-top: 30px" v-else>
        <noData />
      </div>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import { ref, reactive, toRefs, onMounted, onUnmounted, watch } from "vue";
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { ModelValueItf } from "@/components/businessPanel/public/types";
import SubPanelTemplate from "@/components/businessPanel/public/snPanelTemplate.vue";
import { getAssetsImage } from "@/utils/getImage";
import CountTo from "@/components/businessPanel/public/count-to/count-to.vue";
import { storeMarket } from "@/piniaStore/other";
import { alarmActualRatio } from "@/api/shennong/alarm";
import noData from "@/components/businessPanel/public/noData.vue";

const piniaStoreMarket = storeMarket();
const props = withDefaults(
  defineProps<{
    chartHeight?: number;
    applicationCode: string;
  }>(),
  {
    chartHeight: 300,
    applicationCode: "SECURITY_MONITORING",
  }
);

const classList = ["top", "right", "left", "bottom"];
const dnTime = ref<ModelValueItf>({
  timeType: "THIS_YEAR",
  dateRange: [""],
});
const statisticsData = ref([]);
const changednTime = async () => {
  let param = {
    period: dnTime.value.dateRange.join(","),
    type: dnTime.value.timeType,
    marketTenant: piniaStoreMarket.currentMarket,
    applicationCode: props.applicationCode,
    // alarmEventTypeCode:['firecontrolEvent_mhbj','firecontrolEvent_ywbj',' firecontrolEvent_wgzyxftd','manageEvent_ddcgl'].join(',')
  };
  let res: any = await alarmActualRatio(param);
  statisticsData.value = res
    .map((item, index) => {
      return {
        name: item.name,
        total: item.actualRatio,
      };
    })
    .filter((item) => item.name)
    .slice(0, 4);
};
watch(
  () => piniaStoreMarket.currentMarket,
  (n) => {
    changednTime();
  }
);
</script>
<style lang="less" scoped>
.showPanel {
  position: relative;
  height: 260px;

  .bg {
    position: absolute;
    height: 132px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .rotate {
      position: absolute;
      width: 68px;
      height: 68px;
      left: 35px;
      top: 8px;
      top: 20%;
      left: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
    }
  }

  .blister {
    position: absolute;
    // min-width: 90px;
    width: auto;

    .unit {
      position: absolute;
      top: 45%;
      left: 40%;
      transform: translate(-50%, -50%);
      margin-left: 24px;
      font-size: 20px;
      font-weight: 400;
      line-height: 20px;
    }
    .ball {
      width: 100%;
      height: 70px;
      border-radius: 50%;
      position: relative;
      color: #ffffff;
      font-family: PangMenZhengDao-Regular, PangMenZhengDao;
      // background-image: url("/resource/v1/ue5-sn-migrate/assets/images/pie-01.png");
      // background-repeat: no-repeat;
      // background-size: 100% 100%;

      :deep(.gh-count-to) {
        font-size: 20px;
        font-family: "YouSheBiaoTiHei";
        font-weight: 400;
        color: #ffffff;
        position: absolute;
        top: 45%;
        left: 40%;
        transform: translate(-50%, -50%);
      }

      div {
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        font-size: 18px;
        color: #fff;
        font-family: Source YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
      }
    }

    .blisterTitle {
      // margin-left:15px;
      font-size: 12px !important;
      font-family: Source Han Sans CN-Medium, Source Han Sans CN !important;
      font-weight: 500 !important;
      color: #d4edfd !important;
      line-height: 22px;
      text-wrap: nowrap;
      margin-top: 30px;
      width: 100%;
      // border-radius:50%;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      text-align: center;
    }
  }

  @keyframes floating {
    from {
      transform: translateY(0);
    }

    50% {
      transform: translateY(-20px);
    }

    to {
      transform: translateY(0);
    }
  }
}

.top {
  top: 32px;
  left: 55px;
  animation: floating 3s ease-in-out infinite;
  .ball {
    width: 80px !important;
    height: 80px !important;
  }
}
.right {
  right: 121px;
  top: 60px;
  animation: floating 4s 0.5s ease-in-out infinite;
  .ball {
    width: 70px !important;
    height: 70px !important;
  }
}

.left {
  bottom: 31px;
  left: 83px;
  animation: floating 5s 1s ease-in-out infinite;
  .ball {
    width: 102px !important;
    height: 102px !important;
  }
}

.bottom {
  right: 44px;
  bottom: 40px;
  animation: floating 6s 1.5s ease-in-out infinite;
  .ball {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    width: 100px !important;
    height: 100px !important;
  }
}
</style>
