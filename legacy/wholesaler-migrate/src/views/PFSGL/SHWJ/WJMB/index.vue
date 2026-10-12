<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    template(#toolbar-left)
      app-search(
        v-model='filters',
        :fields='filterFieleds',
        @search='handleQuickSearch',
        keywordPlaceholder='请输入关键字'
      )
      a-button.ml2(@click='$refs.table.reload()') 刷新
    template(#toolbar-right)
      app-link-btn(to='/questionnaire-temp/add')
        a-button(type="primary" icon="plus") 新建
    app-table(
      ref='table',
      model-name='questionnaire-temp',
      url='/project-merchant/wholesaler-ques-temp/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize',
    )
      template(#code="{text, record}")
        app-link-btn(:to="'./questionnaire-temp/detail/' + record.id") {{ text }}
      template(#action='{ record }')
        app-action-column
          app-link-btn(:to='"/questionnaire-temp/edit/" + record.id') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: '',
  components: {},
  data() {
    return {
      columns: ['code', 'name', 'type', 'createBy', 'createTime'],
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
      await this.$restful(`DELETE:/project-merchant/wholesaler-ques-temp/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'type',
          component: 'app-remote-select',
          width: '150px',
          placeholder: '调查类型',
          api: '/dictionary/getDataDictionaryByItem?itemCode=project-merchant-questionnaireType',
          field: { name: 'code', label: 'name' },
        },
        {
          name: 'timeRange',
          placeholder: '请选择时间范围',
          width: '500px',
          component: 'AppTimeRangeSelect',
          options: [{ code: 'custom', name: '自定义时间范围' }],
          field: { name: 'code', label: 'name' },
          extraProp: {
            onlyCustom: true,
            onlyDate: true,
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
