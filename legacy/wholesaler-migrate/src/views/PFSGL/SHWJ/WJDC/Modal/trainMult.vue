<template lang="pug">
div.train_mult
  a-checkbox-group(v-model="model.answer")
    a-checkbox(v-for='(checkbox,i) in model.options', :value='checkbox.label', :key='checkbox.label',:style="radioStyle") {{checkbox.label}}、{{ checkbox.value }}
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
      answer: JSON.parse(this.data.answer) ? JSON.parse(this.data.answer) : '',
    };
  },

  methods: {},
};
</script>
<style lang="less">
.train_mult {
  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0;
  }
}
</style>
<style lang="less" scoped>
.answer {
  font-size: 14px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 30px;
}
</style>
