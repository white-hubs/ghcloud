<template lang="pug">
div.app-rate-range-selector
  div
    a-input-number(v-model="beginRate" :min="min" @blur="handleRangeChange" @focus="visible=true" :placeholder="placeholders[0]")
  div.devider
  div
    a-input-number(v-model="endRate" :max="max" @blur="handleRangeChange" @focus="visible=true" :placeholder="placeholders[1]")
  div.slider(v-show="visible")
    div {{ placeholder }}
    a-slider(range v-model="parsedValue" :min="min" :max="max" :marks="marks" @change="onChange")
    div.right
      a-button(type="primary" size="small" @click="handOk") OK

</template>

<script>
// 未完成
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [Array],
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    unit: {
      type: String,
      default: '%',
    },
    placeholder: {
      type: String,
      default: '请选择范围',
    },
    placeholders: {
      type: [Array],
      default: () => ['最小比率', '最大比率'],
    },
  },
  data() {
    return {
      beginRate: 0,
      endRate: 0,
      parsedValue: [0, 0],
      visible: false,
    };
  },
  computed: {
    marks() {
      return {
        [this.min]: this.min + this.unit,
        [this.max]: this.max + this.unit,
      };
    },
  },
  watch: {
    value: 'parseValue',
  },
  created() {
    this.parseValue();
  },
  methods: {
    parseValue() {
      const value = this.value || [0, 0];
      this.parsedValue = value;
      this.beginRate = value[0] || 0;
      this.endRate = value[1] || 0;
    },
    handleRangeChange() {
      const t = this.beginRate / 1 || 0;
      if (this.beginRate > this.endRate) {
        this.beginRate = this.endRate / 1;
        this.endRate = t;
      }
      this.parsedValue = [this.beginRate, this.endRate];
      // this.$emit('change', [this.beginRate, this.endRate]);
    },
    onChange(value) {
      this.beginRate = value[0];
      this.endRate = value[1];
    },
    handOk() {
      this.visible = false;
      this.$emit('change', [this.beginRate, this.endRate]);
    },
  },
};
</script>
<style lang="less">
.app-rate-range-selector {
  display: inline-flex;
  align-items: center;
  position: relative;
  .devider {
    height: 1px;
    width: 10px;
    margin: 0 4px;
    background-color: #aaa;
  }
  .slider {
    position: absolute;
    top: 34px;
    z-index: 100;
    width: 100%;
    padding: 12px 24px;
    background-color: #fff;
    border-radius: 2px;
    border: 1px solid #efefef;
    box-shadow: 0 0 5px 0px #efefef;
  }
}
</style>
