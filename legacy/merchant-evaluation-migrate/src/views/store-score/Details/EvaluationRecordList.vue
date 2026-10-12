<template lang="pug">
.device-info-container
  app-table-page-layout
    template(#toolbar-left)
      app-search(
        v-model='filters',
        :fields='filterFieleds',
        @search='handleQuickSearch',
        keywordPlaceholder='请输入关键字'
      ) 
      a-button.ml2(@click='$refs.table.reload()') 刷新
    app-table(
      ref='table',
      :selectionMode='false',
      model-name='evaluate',
      url='/project-merchant/stall-evaluation-records/store/page',
      :columns-customsize='columnsCustomsize',
      :params='params',
      :visibles='columns'
    )
      template(#code='{ text, record }')
        app-link-btn(:to='"/evaluate-record-detail/" + record.id') {{ text }}
      template(#action='{ record }')
        app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  props: {
    id: String,
  },
  data() {
    return {
      columns: [
        'code',
        'nickname',
        'mobile',
        'zScore',
        'sScore',
        'tScore',
        'wScore',
        'createTime',
      ],
      search: null,
      // 筛选
      filters: {
        enabled: true,
        stallId: this.id,
      },
      filterFieleds: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        ...this.filters,
        examineStatus: '1',
        projectId: this.project.id,
      };
    },
  },
  async created() {
    this.initFilters();
  },
  methods: {
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/stall-evaluation-records/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
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
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '12rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
  },
};
</script>
<style lang="less" scoped>
.device-info-container {
  padding: 1rem;
}
</style>
