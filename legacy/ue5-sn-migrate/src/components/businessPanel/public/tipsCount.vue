<template>
  <div class="tips_count">
    <div v-if="props.status === '0'" :class="['dot',' warring']"></div>
    <div v-if="props.status === '1'" :class="['dot','success']"></div>
    <div v-if="props.status === '2'" :class="['dot','wait']"></div>
    <div class="content">
      <div class="status">{{ statusTextMap.get(props.status) }}</div>
      <div class="count">{{ props.count }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  interface Props {
    status: string;
    count: number;
  }
  const statusTextMap: Map<string, string> = new Map([
    ["0", "未处理"],
    ["1", "已处理"],
    ["2", "超时处理"],
  ]);
  const props = withDefaults(defineProps<Props>(), {
    status: "1",
    count: 23244,
  });
</script>
<style lang="less">
.tips_count {
  width: 74px;
  display: flex;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: relative;
    top: 6px;
    margin-right: 6px;
  }

  .warring {
    background: #F14545;
  }

  .success {
    background: #00f27b;
  }

  .wait {
    background: #ffab10;
  }

  .content {
    flex: 1;

    .status {
      font-size: 12px;
      color: #8996a5;
      line-height: 18px;
      border-bottom: 1px solid rgba(216, 216, 216, 0.2);
    }

    .count {
      font-size: 18px;
      color: #ffffff;
      line-height: 18px;
      margin-top: 4px;
    }
  }
}</style>