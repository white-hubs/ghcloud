<template lang="pug">
div.train_select
  a-radio-group(v-model="model.answer")
    a-radio(v-for='(radio,i) in model.options', :value='radio.label', :key='radio.label',:style="radioStyle") {{radio.label}}、{{ radio.value }}
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      model: {},
    };
  },
  created() {
    this.model = {
      options: JSON.parse(this.data.options)
        ? JSON.parse(this.data.options)
        : '',
    };
  },
  methods: {},
};
</script>
<style lang="less">
.train_select {
  .answer {
    font-size: 14px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 30px;
  }
}
</style>
