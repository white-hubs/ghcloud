<template lang="pug">
  span.blod(:style="{color: statusColors[value]}") {{ statusTexts[value] }}
</template>

<script>
export default {
  props: {
    value: [Number, String],
  },
  data() {
    return {
      statusColors: {
        0: '#ff6161',
        1: '#47de4e',
      },
      statusTexts: {
        0: '离线',
        1: '在线',
      },
    };
  },
};
</script>

<style lang="less" scoped>
.blod {
  font-weight: bold;
}
</style>
