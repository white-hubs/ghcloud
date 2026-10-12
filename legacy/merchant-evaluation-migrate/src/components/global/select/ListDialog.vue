<template lang="pug">
app-modal(
  v-model='visible',
  :title='title',
  :width='width || 800',
  :confirm-loading='loading',
  @ok='handleSubmit'
  @cancel="hide"
)
  app-table-page-layout
    template(#toolbar-left)
      AppSearch(
        v-model='paseFilters',
        :fields='filterFieleds',
        @search='handleQuickSearch'
      )
      a-button.ml2(@click='$refs.table.reload()') 刷新
    app-table(
      ref='table',
      v-bind='$attrs',
      :model-name='modelName',
      :row-key='rowKey',
      :fitHeight='false',
      :maxHeight='400',
      :url='api',
      :visibles='columns',
      :params='filterParams',
      @loaded='handleTableLoaded'
      @select="handleClickRow"
      :maxCount="maxCount"
    )
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: [String, Number, Object, Array],
    project: Object,
    title: String,
    width: Number,
    modelName: String,
    rowKey: String,
    columns: Array,
    api: [String, Function],
    params: Object,
    options: Array,
    field: {
      default: () => {
        return { name: 'id', label: 'name' };
      },
      type: Object,
    },
    dataFormatter: Function,
    filterFieleds: Array,
    filters: {
      type: Object,
      default: () => {
        return {};
      },
    },
    maxCount: Number,
  },
  data() {
    return {
      visible: false,
      loading: false,
      // columns: ['username', 'nickname', 'mobile', 'enabled'],
      search: null,
      paseFilters: {},
    };
  },
  computed: {
    filterParams() {
      return {
        ...this.params,
        ...this.paseFilters,
      };
    },
  },
  watch: {
    options: 'handleOptionsChange',
    filters: {
      handler() {
        this.paseFilters = { ...this.filters };
      },
      deep: true,
    },
  },
  created() {
    this.paseFilters = { ...this.filters };
  },
  methods: {
    handleTableLoaded() {
      this.$refs.table.selectedRowKeys =
        this.options?.map((item) => item[this.rowKey || this.field.name]) || [];
      this.$refs.table.selectedKey =
        this.$refs.table.selectedRowKeys[0] || null;
    },
    handleOptionsChange() {
      if (this.$refs?.table) {
        this.$refs.table.selectedRowKeys =
          this.options?.map((item) => item[this.rowKey || this.field.name]) ||
          [];
        this.$refs.table.selectedKey =
          this.$refs.table.selectedRowKeys[0] || null;
      }
    },
    show() {
      this.visible = true;
      this.handleOptionsChange();
    },
    hide() {
      this.visible = false;
      // this.$refs.form.resetFields();
    },
    handleQuickSearch(keyword) {
      // this.search = keyword;
      this.$refs.table.refresh();
    },
    handleSubmit() {
      // const data = this.$refs.table.getSelection();
      let data = [];
      const selections = this.$refs.table.getSelection();
      if (selections?.length) {
        const uniqMap = {};
        selections.forEach((item) => {
          if (!uniqMap[item[this.rowKey || this.field.name]]) {
            uniqMap[item[this.rowKey || this.field.name]] = true;
            data.push(item);
          }
        });
        this.options.forEach((item) => {
          if (!uniqMap[item[this.rowKey || this.field.name]]) {
            uniqMap[item[this.rowKey || this.field.name]] = true;
            data.push(item);
          }
        });
      } else {
        data = selections || null;
      }
      if (data?.length && Array.isArray(data)) {
        // 多选
        if (this.maxCount && data.length > this.maxCount) {
          data.reverse().splice(this.maxCount);
          data.reverse();
        }

        this.$emit(
          'change',
          data.map((item) => item[this.field.name] || item['name']),
          data,
        );
        this.$emit('update:options', data);
      } else if (data && !Array.isArray(data)) {
        // 单选
        this.$emit('change', data[this.field.name], data);
        this.$emit('update:options', [data]);
      } else {
        this.$emit('change', null, null);
        this.$emit('update:options', []);
      }
      this.hide();
    },
    handleClickRow() {
      // 单行点击事件, 选中/取消选中
    },
  },
};
</script>

<style lang="less" scoped></style>
