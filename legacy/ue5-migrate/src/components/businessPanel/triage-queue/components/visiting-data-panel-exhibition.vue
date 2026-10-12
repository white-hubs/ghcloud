<template>
  <SubPanelTemplate title="看诊数据" class="visiting-data">
    <div class="item" v-for="item in visitingData" :key="item.title">
      <VisitingDataPic :img="item.img"/>
      <a-statistic :title="item.title">
        <template #formatter>
          <count-to :startVal="0" :endVal="item.value" :duration="2000" separator=""></count-to>
        </template>
      </a-statistic>
    </div>
  </SubPanelTemplate>
</template>
<script setup lang="ts">
import VisitingDataPic from "./visiting-data-pic.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import CountTo from "../../public/count-to/count-to.vue";
import { onMounted, ref } from 'vue';
import { consultationData } from '@/api/consultation-data'
import { storeMenu } from '@/piniaStore/menu'
import { storeArea } from '@/piniaStore/area'
const piniaStoreMenu = storeMenu();
const piniaStoreArea = storeArea();

/**
 * 看诊数据
 */
const visitingData = ref({
  appointmentNum: { title: "预约人数", value: 310, img: getAssetsImage('business-icon/triage-queue/1.png') },
  signNum: { title: "签到人数", value: 280, img: getAssetsImage('business-icon/triage-queue/2.png') },
  waitingNum: { title: "候诊人数", value: 75, img: getAssetsImage('business-icon/triage-queue/3.png') },
  visitNum: { title: "就诊人数", value: 40, img: getAssetsImage('business-icon/triage-queue/4.png') },
})

</script>
<style scoped lang="less">
.visiting-data {
  :deep(.sub-panel-content) {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .item {
      width: 49%;
      height: 60px;
      margin-bottom: 5px;
      display: inline-flex;
      align-items: center;
      box-sizing: border-box;
      padding-left: 23px;

      .ant-statistic {
        display: inline-flex;
        flex-flow: column-reverse;

        .ant-statistic-content {
          height: 29px;

          .ant-statistic-content-value {
            color: #5EA6FF;
            font-size: 22px;
            font-weight: 400;
          }
        }

        .ant-statistic-title {
          color: #D0DEEE;
          font-size: 12px;
          margin: 0;
        }
      }
    }
  }
}
</style>