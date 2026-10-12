<template lang="pug">
div.step_number_input(:style="{width: width ? width + 'px' : 'auto'}") 
  a-input-group(compact)
    a-button.btn(type="primary" :disabled="disabled || minusDisabled" @click="minus")
      a-icon(type="minus")
    a-input.input(:value="value" @change="handleChange" :min="min" :max="max" :step="step" :disabled="true" :readonly="true")
    a-button.btn(type="primary" :disabled="disabled || plusDisabled" @click="plus")
      a-icon(type="plus")
</template>

<script>
export default {
  name: 'AppStepNumber',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Number,
    min: {
      type: Number,
      default: -Infinity,
    },
    max: {
      type: Number,
      default: Infinity,
    },
    step: {
      type: Number,
      default: 1,
    },
    width: Number,
    disabled: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    minusDisabled() {
      return this.value <= this.min;
    },
    plusDisabled() {
      return this.value >= this.max;
    },
  },
  methods: {
    handleChange(e) {
      this.$emit('change', +e.target.value);
    },
    minus() {
      const val = +this.value - this.step;
      this.$emit('change', val <= this.min ? this.min : val);
    },
    plus() {
      const val = +this.value + this.step;
      this.$emit('change', val >= this.max ? this.max : val);
    },
  },
};
</script>

<style lang="less" scoped>
.step_number_input {
  //
  .btn {
    width: 40px;
    outline: none;
  }
  .input {
    width: calc(100% - 80px);
    text-align: center;
    // border: 1px solid #1890ff;
    &[disabled] {
      color: #232323;
      border-color: #d9d9d9;
      background-color: #fff;
    }
  }
}
</style>
