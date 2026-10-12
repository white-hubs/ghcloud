<template>
      <SubPanelTemplate title="今日来访人员统计">
      <div class="monitorPanelBox">
        <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item">
        </monitorPanel>
      </div>
    </SubPanelTemplate>
  <!-- 门禁通行情况 -->
  <entranceAnalysisPanel :from-page="fromPage" />
  <!-- 车辆通行情况 -->
  <CarAnalysisPanel :from-page="fromPage" />
</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import entranceAnalysisPanel from '@/components/businessPanel/demo-panel/security-situation/components/entrance-analysis-panel.vue';
import CarAnalysisPanel from '@/components/businessPanel/demo-panel/security-situation/components/car-analysis-panel.vue';
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import monitorPanel from "@/components/businessPanel/court-panel/court-overview/components/monitor-panel.vue"

const fromPage: FromPageType = 'PARK'
// 司法空间数据
const monitorPanelData = ref([
  {
    imgPath: "overView109.png",
    value: "1399",
    name: "来访人员总数",
  },
  {
    imgPath: "overView106.png",
    value: "234",
    name: "律师来访统计",
  },
  {
    imgPath: "overView107.png",
    value: "1",
    name: "敏感人员来访",
  },
  {
    imgPath: "overView108.png",
    value: "9",
    name: "来访滞留人员",
  },
]);
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  padding-right: 20px;

  :deep(.monitorPanel-left) {
    .bg {
      width: 90px;

      .rotate {
        left: 30px;
      }
    }
  }
}
</style>