<template>
  <SubPanelTemplate title="庭审安排信息">
    <template #extra>
      <DateInlineForm v-model:modelValue="energyOverviewTime">
      </DateInlineForm>
    </template>
    <CourtArrangeInfo :modelValue="energyOverviewTime.timeType"/>
  </SubPanelTemplate>
  <SubPanelTemplate :title="'历史庭审信息'">
    <HistoryCourtTrial :dataSource="dataSource"/>
  </SubPanelTemplate>

</template>

<script setup lang="ts">
import { ref, reactive,onMounted} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { getAssetsImage } from '@/utils/getImage';
import { ModelValueItf } from '@/components/businessPanel/public/types'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import CourtArrangeInfo from './components/court-arrange-info.vue';
import HistoryCourtTrial from './components/history-court-trial.vue';

const energyOverviewTime = ref<ModelValueItf>({
  timeType: 'THIS_YEAR',
  dateRange: []
})
const dataSource = [
  {
    id: '1',
    title: '陶某某诉王某某运输合同纠纷一审',
    case: '民事（2024）川0602民初3180号',
    reason: '运输合同纠纷',
    name: '张某',
    time: '2024年11月13日 15:30'
  },
  {
    id: '2',
    title: '董某诉成都市某某工程队、张某某合同纠纷',
    case: '民事（2024）川0602民初6290号',
    reason: '合同纠纷',
    name: '李某',
    time: '2024年11月13日 17:05'
  },
  {
    id: '3',
    title: '陶某某诉王某某运输合同纠纷一审',
    case: '民事（2024）川0602民初3180号',
    reason: '运输合同纠纷',
    name: '张某',
    time: '2024年11月13日 15:30'
  },
  {
    id: '4',
    title: '董某诉成都市某某工程队、张某某合同纠纷',
    case: '民事（2024）川0602民初6290号',
    reason: '合同纠纷',
    name: '李某',
    time: '2024年11月13日 17:05'
  },
]

</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
}

.hospitalInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;

  img {
    width: 152px;
    height: 128px;
  }

  .hospitalInfo-text {
    width: 169px;
    color: #fff;
    font-size: 12px;

    .hospitalInfo-title {
      font-size: 14px;
      margin-bottom: 5px;
    }
  }

  .scroll_box {
    height: 100px;
    overflow: hidden;

    .scroll-text {
      animation: scroll 10s linear infinite;
      color: #D9E7FF;
    }
  }

  @keyframes scroll {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(-100%);
    }
  }
}

.line-chart {
  height: 200px;
}

.elevator-analysis {
  display: flex;
  justify-content: space-between;
  padding: 10px 10px;
  align-items: center;

  .pie_list {
    width: 180px;
    height: 180px;

    // margin-left: 10px;
    :deep(.alarm-analysis-name) {
      width: 90px;
    }

    :deep(.alarm-analysisBox) {
      width: auto;
    }
  }

  .chart {
    flex: 1;
    height: 140px;
  }
}
:deep(.sub-panel-content) {
  padding: 0 !important;
}
</style>