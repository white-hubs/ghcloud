<template lang="pug">
.inline-search
  a-input-search.input(
    v-if='!hideKeyword',
    :placeholder='keywordPlaceholder',
    :style='{ width: keywordWidth }',
    v-model='model.search',
    allow-clear,
    @change='changeHandler',
    @search='searchHandler',
    v-bind='$attrs'
  )
  .inline(v-for='field in computedFields')
    .mt1(:style='{ display: field.break ? "block" : "none" }')
    component.input(
      v-if='field.component !== "AppTimeRangeSelect"',
      :is='field.component',
      v-model='model[field.name]',
      :key='field.uid',
      v-bind='field.extraProp || field',
      :class='{ ml1: !field.break }',
      :style='getFieldStyle(field)',
      @change='(select, opt) => handleChange(select, opt, field.onChange)',
      :allow-clear='field.allowClear'
    )
    component.input(
      v-else,
      :is='field.component',
      v-model='model[field.name]',
      :key='field.uid',
      v-bind='field.extraProp || field',
      :beginTime.sync='model[field.beginTime]',
      :endTime.sync='model[field.endTime]',
      :class='{ ml1: !field.break }',
      :style='getFieldStyle(field)',
      @change='(select, opt) => handleChange(select, opt, field.onChange)',
      :allow-clear='field.allowClear'
    )
    //- FieldItem(v-bind="field")
    //- app-remote-select.input.ml1(api="/project-merchant/inspplans/page" :params="{projectId: '1287732811710042113'}" v-bin="props" v-on="on")
  a-button.ml1(type='primary', @click='searchHandler', v-if='showButton') 查询
</template>
<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [Object],
    keywordPlaceholder: {
      type: String,
      default: '输入关键字查询',
    },
    keywordWidth: {
      type: String,
      default: '150px',
    },
    hideKeyword: Boolean, //是否有输入框
    showButton: {
      type: Boolean,
      default: true,
    },
    fields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      model: {
        search: null,
      },
      computedFields: [],
    };
  },
  watch: {
    value() {
      if (this.value) {
        this.model = { ...this.value };
      }
    },
    fields: 'rebuildFields',
  },
  created() {
    if (this.value) {
      this.model = { ...this.value };
    }
    // 调用方法将父组件传入的数据筛选遍历后符合条件的数据（数组）赋值给computedFields
    this.rebuildFields();
  },
  methods: {
    changeHandler(e) {
      // 表示点击清除按钮
      if (e.currentTarget.value.length > 20) {
        e.currentTarget.value = e.currentTarget.value.slice(0, 20);
        this.model.search = e.currentTarget.value;
      }
      if (e.type !== 'input' && !e.currentTarget.value) {
        this.$emit('change', this.model);
        this.$emit('search', this.model);
      }
    },
    searchHandler() {
      this.$emit('change', this.model);
      this.$emit('search', this.model);
      this.$emit('search-click', this.model);
    },
    handleChange(select, opt, fieldChangeHandler) {
      this.$emit('change', this.model);
      this.$emit('search', this.model);
      if (fieldChangeHandler) {
        fieldChangeHandler(select, opt, this.rebuildFields);
      }
    },
    getFieldStyle(field) {
      return { width: field.width, ...field.customStyle };
    },
    rebuildFields() {
      this.computedFields = this.fields
        ?.filter((item) => {
          if (item.hide && typeof item.hide === 'function') {
            return !item.hide();
          } else {
            return !item.hide;
          }
        })
        .map((item) => {
          return {
            uid: item.uid || item.name || btoa(Math.random() * 10000).substr(8),
            placeholder: '请选择',
            width: '100px',
            allowClear: true,
            ...item,
            params:
              typeof item.params === 'function'
                ? item.params.apply(this)
                : item.params,
          };
        });
    },
  },
};
</script>
<style lang="less" scoped>
.inline-search {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.input {
  width: 250px;
}

.ant-input-search {
  display: inline-flex;
}
</style>
