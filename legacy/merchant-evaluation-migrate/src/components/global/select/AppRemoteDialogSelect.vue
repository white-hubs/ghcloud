<template lang="pug">
div
  //- mode设置 Select 的模式为多选或标签
  //- $attrs.selectionMode父级属性中是否有控制单选多选的属性
  //- dropdownVisibleChange展开下拉菜单的回调（@干嘛的）
  //- deselec取消选中时调用，参数为选中项的 value (或 key) 值，仅在 multiple 或 tags 模式下生效
  //- change选中 option，或 input 的 value 变化（combobox 模式下）时，调用此函数
  //- dropdownClassName	下拉菜单的 className 属性
  a-select(
    v-bind='$attrs',
    ref='select',
    :mode='$attrs.selectionMode === "single" ? "single" : "multiple"',
    :value='parseValue',
    @dropdownVisibleChange='handleSelectFocus',
    @deselect='handleDeselect',
    @change='handleChange',
    dropdownClassName='display-none'
  )
    //- 下拉菜单选项的循环生成
    //- options为父组件传入的数组，在created生命周期中赋值给了parseOptions
    //- labelFormatter、field为父组件传入的数据

    a-select-option(
      v-for='item in parseOptions',
      :key='item[field.label]',
      :value='field.name ? item[field.name] : item',
      :data='item'
    ) {{ labelFormatter ? labelFormatter(item) : item[field.label] }}
  //- 未识别的事件可通过v-on="$listeners"传入
  ListDialog(
    ref='listDialog',
    v-bind='$attrs',
    v-on='$listeners',
    :options='parseOptions',
    @update:options='(opts) => { handleOptionsChange(opts); }',
    :field='field',
    :maxCount='maxCount'
  )
</template>

<script>
import ListDialog from './ListDialog';
export default {
  components: {
    ListDialog,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [Array, String, Number, Object],
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    // dataFormatter: Function,
    labelFormatter: Function,
    maxCount: Number,
  },
  data() {
    return {
      parseOptions: [],
    };
  },
  computed: {
    parseValue() {
      return this.value || [];
    },
  },
  watch: {
    options() {
      this.parseOptions = this.options || [];
    },
  },
  created() {
    this.parseOptions = this.options || [];
  },
  methods: {
    handleSelectFocus() {
      this.$refs.select.blur();
      this.$refs.listDialog.show();
    },
    handleDeselect(value) {
      const delteOption = this.options.find(
        (item) => item[this.field.name] === value,
      );
      const index = this.options.indexOf(delteOption);
      this.options.splice(index, 1);
    },
    handleChange(e, v) {
      if (this.selectionMode !== 'single') {
        const selections =
          v?.map((item) => {
            return {
              ...item.data?.attrs?.data,
            };
          }) || [];
        this.$emit('change', e, selections);
      } else {
        this.$emit('change', e, v?.data?.attrs?.data);
      }
    },
    handleOptionsChange(opts) {
      // if (this.maxCount) {
      //   if (opts?.length > this.maxCount) {
      //     opts.reverse().splice(this.maxCount);
      //     opts.reverse();
      //   }
      // }
      this.parseOptions = [...opts];
      this.$emit('update:options', [...opts]);
    },
  },
};
</script>
