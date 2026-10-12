<template>
  <div class="status">
    <div class="statusBox">
      <div>
        <span>{{ props.data?.maxTaskNumDep }}</span>完成的任务最多，共完成了<span class="blue1 textNum">{{ data?.maxTaskNum
        }}</span>个，环比下降<span class="blue1">{{ data?.maxTaskNumRatio }}</span>
      </div>
      <div>
        <span>{{ data?.maxTaskRatioDep }}</span> 任务完成率最高，完成率在<span class="blue1 textNum">{{ data?.maxTaskRatio
        }}</span>，环比上升<span class="blue1">{{ data?.maxTaskRatioRatio }}</span>
      </div>
    </div>
    <div class="statusBox">
      <div>
        <span>{{ data?.minTaskNumDep }}</span>完成的任务最少，共完成了<span class="blue1 textNum">{{ data?.minTaskNum
        }}</span>个，环比下降<span class="blue1">{{ data?.minTaskNumRatio }}</span>
      </div>
      <div>
        <span>{{ data?.minTaskRatioDep }}</span>任务完成率最低，完成率在<span class="blue1 textNum">{{ data?.minTaskRatio
        }}</span>，环比下降<span class="blue1">{{ data?.minTaskRatioRatio }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DepTaskExecutionAnalysis } from '@/api/model/inspection'
const props = withDefaults(defineProps<{data: DepTaskExecutionAnalysis | null | undefined;}>(), {});
</script>
<style scoped lang="less">
.status {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .statusBox {
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    width: 816px;
    min-height: 64px;
    background: linear-gradient(50deg, #F7FAFF 0%, rgba(245, 249, 255, .22) 37%, #F7FAFF 100%);
    border-radius: 6px;
    align-items: center;
  }
}

.blue1 {
  color: #1890FF;
}

.green1 {
  color: #2FC539;
}

.red1 {
  color: #E64141;
}

.textNum {
  font-size: 13px;
}</style>
