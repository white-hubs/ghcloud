<template lang="pug">
  a-date-picker(mode="year"
  placeholder="请选择年份" 
  format='YYYY'
  :value='yearPick'
  :open='yearPickShow' 
  @panelChange="handlePanelChange"
  @openChange="handleOpenChange")
</template>

<script>
import moment from 'moment';
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Object],
  },
  data() {
    return {
      yearPick: null, //年选择器的值
      yearPickShow: false, //年选择器的显示隐藏
    };
  },
  watch: {
    value() {
      this.yearPick = this.value;
    },
  },
  mounted() {
    this.yearPick = this.value;
  },
  methods: {
    moment,
    // 弹出日历和关闭日历的回调
    handleOpenChange(status) {
      this.yearPickShow = status;
    },
    // 得到年份选择器的值
    handlePanelChange(value) {
      this.yearPick = value;
      this.$emit('change', this.moment(value, 'YYYY'));
      this.yearPickShow = false;
    },
  },
};
</script>

<style></style>
