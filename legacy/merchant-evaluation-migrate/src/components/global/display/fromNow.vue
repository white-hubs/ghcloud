<template lang="pug">
  span {{ moment(timeStr, "YYYYMMDD HH:mm:ss").fromNow()  }}
</template>
<script>
// 距离现在有多久
import moment from 'moment';
export default {
  props: {
    value: [Date, String],
  },
  computed: {
    timeStr() {
      let str = this.value;
      if (typeof this.value === 'object') {
        str = this.moment(this.value).format('YYYYMMDD HH:mm:ss');
      }
      return str;
    },
  },
  methods: {
    moment,
  },
};
</script>
<style lang="less" scoped>
.amap-select-container {
  width: 100%;
  min-height: 200px;
}
</style>
<style>
.amap-select-container .amap-icon img,
.amap-select-container .amap-marker-content img {
  width: 25px;
  height: 34px;
}
</style>
