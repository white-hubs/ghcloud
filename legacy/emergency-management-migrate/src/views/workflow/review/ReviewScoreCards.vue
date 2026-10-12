<script setup lang="ts">
defineProps<{
  responseScore: number | undefined;
  completionScore: number | undefined;
  reviewScore: number | undefined;
  averageResponseSeconds: number | undefined;
  completedTasks: number;
  totalTasks: number;
}>();
</script>

<template>
  <section class="score-grid">
    <div class="workflow-card score-card">
      <div class="score-circle score-circle--blue">{{ responseScore ?? "--" }}</div>
      <strong>响应速度</strong>
      <small>平均响应 {{ averageResponseSeconds ?? "--" }} 秒</small>
    </div>
    <div class="workflow-card score-card">
      <div class="score-circle score-circle--gold">{{ completionScore ?? "--" }}</div>
      <strong>任务完成率</strong>
      <small>已完成 {{ completedTasks }}/{{ totalTasks }}</small>
    </div>
    <div class="workflow-card score-card">
      <div class="score-circle score-circle--gold total">{{ reviewScore ?? "--" }}</div>
      <strong>综合评分</strong>
      <small>{{ reviewScore == null ? "待评分" : reviewScore >= 80 ? "表现良好" : "建议修订" }}</small>
    </div>
  </section>
</template>

<style scoped>
.score-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 12px 0;
}
.score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  text-align: center;
}
.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 50%;
  font-size: 28px;
  font-weight: 700;
}
.score-circle--blue {
  background: #e6f4ff;
  color: #1677ff;
}
.score-circle--gold {
  background: #fff7e6;
  color: #faad14;
}
.score-circle.total {
  font-size: 36px;
}
.score-card strong {
  color: #475569;
  font-weight: 500;
}
.score-card small {
  margin-top: 4px;
  color: #94a3b8;
}
@media (max-width: 900px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
}
</style>
