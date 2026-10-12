<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    template(#toolbar-left)
      //- app-input-search(@search='handleQuickSearch')
      app-search(
        v-model='filters',
        :fields='filterFieleds',
        @search='handleQuickSearch',
        keywordPlaceholder='请输入关键字'
      )
      a-button.ml2(@click='$refs.table.reload()') 刷新
    template(#toolbar-right)
      a-button(type='primary', icon='plus', @click='handleCreate') 新建
    app-table(
      ref='table',
      model-name='contract-type',
      url='/project-merchant/wholesaler-contract-type',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      //- template(#code="{text, record}")
      //-   app-link-btn(:to="'/contract-type/detail/' + record.id") {{ text }}
      template(#action='{ record }')
        app-action-column
          app-link-btn(@click='handleEdit(record)') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
    CreateAndEdit(ref='createAndEdit', @modal-success='$refs.table.reload()')
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateAndEdit from './Modal/CreateAndEdit';
export default {
  name: 'KeepAliveXxxx',
  components: {
    CreateAndEdit,
  },
  data() {
    return {
      columns: ['code', 'name', 'enabled', 'createBy', 'createTime'],
      search: null,
      // 批量删除
      canDeleteBatch: false,
      deleteBatchLoading: false,
      // 筛选
      filters: {},
      filterFieleds: [],
      // 导出
      exportLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        // search: this.search,
        ...this.filters,
        projectId: this.project.id,
      };
    },
  },
  created() {
    this.initFilters();
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    // 新增
    handleCreate() {
      this.$refs.createAndEdit.show();
    },
    // 修改
    handleEdit(record) {
      this.$refs.createAndEdit.show(record);
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '18rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/wholesaler-contract-type/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'timeRange',
          placeholder: '请选择时间范围',
          width: '500px',
          component: 'AppTimeRangeSelect',
          options: [{ code: 'custom', name: '自定义时间范围' }],
          field: { name: 'code', label: 'name' },
          extraProp: {
            onlyCustom: true,
            // onlyDate: true,
            // showTime: true,
          },
          onChange: (e) => {
            if (Array.isArray(e)) {
              this.filters.timeRange = 'custom';
              this.filters.beginTime = e[0] || null;
              this.filters.endTime = e[1] || null;
            } else {
              this.filters.beginTime = null;
              this.filters.endTime = null;
            }
          },
        },
      ];
    },
  },
};
</script>
<style lang="less" scoped>
// .
</style>
