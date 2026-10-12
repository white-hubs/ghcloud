<template lang="pug">
//- v-bind='$attrs'接收父组件不作为props传的除class和style的属性
a-form-model(v-bind='$attrs', :class='{ oneline: oneline }', ref='form')
  slot
</template>
<script>
import _ from 'lodash';
export default {
  inheritAttrs: false,
  props: {
    oneline: {
      type: Boolean,
      default: false,
    },
    labelWidth: {
      type: Number,
      default: 70,
    },
  },
  mounted() {
    this.setLabelWidth();
    this.$watch(() => {
      return {
        oneline: this.oneline,
        label: this.labelWidth,
      };
    }, this.setLabelWidth);
  },
  methods: {
    setLabelWidth() {
      if (this.oneline && this.labelWidth) {
        this._styleEl = this._styleEl || document.createElement('style');
        // this.$el是在mounted中才会出现的，在created的时候是没有的所以我们引用的时候，获取Vue实例关联的DOM元素；
        const names = this.$el.getAttributeNames();
        let uniqtag = names.find((a) => a.startsWith('data-ut-'));
        if (!uniqtag) {
          uniqtag = 'data-ut-' + _.uniqueId();
          this.$el.setAttribute(uniqtag, uniqtag);
        }
        this._styleEl.innerHTML = `
        form[${uniqtag}].ant-form .ant-form-item-label{
          width:${this.labelWidth}px
        }
      `;
        this.$el.appendChild(this._styleEl);
      } else {
        this._styleEl && this.$el.removeChild(this._styleEl);
      }
    },
    validate(...args) {
      // 获取校验状态
      return this.$refs.form.validate(...args);
    },
    validateField(...args) {
      // 部分验证表单？
      return this.$refs.form.validateField(...args);
    },
    setFields(...args) {
      // this.$refs[‘form’].resetFields()方法是重置表单到初始值，而不是清空表单，当表单在第一次渲染时所有的数据就是初始数据
      return this.$refs.form.setFields(...args);
    },
    resetFields(...args) {
      // this.$refs[‘form’].resetFields()方法是重置表单到初始值，而不是清空表单，当表单在第一次渲染时所有的数据就是初始数据
      return this.$refs.form.resetFields(...args);
    },
    clearValidate(...args) {
      // 移除表单校验clearValidate的方法
      return this.$refs.form.clearValidate(...args);
    },
  },
};
</script>
<style lang="less" scoped>
.oneline {
  @{deep} .ant-form-item {
    align-items: flex-start;
    display: flex;
    &-label {
      flex: none;
      line-height: 32px;
    }
    &-control-wrapper {
      flex: auto;
      min-width: 0;
      .ant-form-item-control {
        line-height: 1.5;
      }
    }
  }
}
</style>
