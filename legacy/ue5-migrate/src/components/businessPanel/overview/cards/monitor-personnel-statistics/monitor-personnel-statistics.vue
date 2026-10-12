<template>
  <SubPanelTemplate title="监控人员统计">
    <div class="person-statistic">
      <div class="total">
        <span>人员总数</span>
        <count-to :startVal="0" :endVal="personStatistic.total" :duration="4000" class="scroll-number"></count-to>
      </div>
      <div class="view-statistic flex-center">
        <div class="bg">
          <img :src="getAssetsImage('overView4.png')" />
          <img class="rotate" :src="getAssetsImage('overView13.png')" alt="" />
        </div>
        <div class="view-content view-left flex-center">
          <div class="icon">
            <img :src="getAssetsImage('overView9.png')" alt="" />
          </div>
          <div class="content">
            <count-to :startVal="0" :endVal="personStatistic.onDutyNum" :duration="4000"
              class="scroll-number"></count-to>
            <div class="title">在岗人员</div>
          </div>
        </div>
        <div class="view-content view-right flex-center">
          <div class="content">
            <count-to :startVal="0" :endVal="personStatistic.leaveNum" :duration="4000"
              class="scroll-number"></count-to>
            <div class="title">离岗人员</div>
          </div>
          <div class="icon">
            <img :src="getAssetsImage('overView11.png')" alt="" />
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import SubPanelTemplate from "../../../public/subPanelTemplate.vue";
import { CountTo } from "vue3-count-to";
import { getAssetsImage } from "@/utils/getImage";
import { arrangeTodayStat } from '@/api/attendance';

const personStatistic = reactive({
  total: 0,
  onDutyNum: 0,
  leaveNum: 0,
});

const requestStateTotal = async () => {
  const res = await arrangeTodayStat();
  personStatistic.onDutyNum = 0;
  personStatistic.leaveNum = 0;
  personStatistic.total = 0;
  personStatistic.onDutyNum = res.workCount;
  personStatistic.leaveNum = res.totalCount - res.workCount;
  personStatistic.total = res.totalCount;
};

onMounted(() => {
  requestStateTotal();
});
</script>

<style lang="less" scoped>
.person-statistic {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #d0deee;

  .scroll-number {
    font-size: 24px;
    margin-left: 8px;
  }

  .view-statistic {
    width: 100%;
    position: relative;

    .bg {
      position: relative;

      img {
        width: 154px;
        height: 130px;
      }

      .rotate {
        position: absolute;
        top: 10px;
        left: 47px;
        width: 60px;
        height: 60px;
      }
    }

    .view-content {
      width: 98px;
      height: 60px;

      .icon img {
        width: 18px;
        height: 18px;
      }
    }

    .view-left {
      background-image: url("../../../../../assets/images/overView10.png");
      background-size: contain;
      position: absolute;
      left: 0;
      bottom: 0;
    }

    .view-right {
      background-image: url("../../../../../assets/images/overView8.png");
      background-size: contain;
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
</style>
