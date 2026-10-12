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
      app-link-btn(to='/agreement-sign/add')
        a-button(type="primary" icon="plus") 新建
      a-button.ml2(type='primary' @click="handleOneKeyUrge") 一键催办
    app-table(
      ref='table',
      model-name='sign',
      url='/project-merchant/wholesaler-protocol/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      template(#code="{text, record}")
        app-link-btn(:to="'./agreement-sign/' + record.id") {{ text }}
      template(#action='{ record }')
        app-action-column
          app-link-btn(:to='"/agreement-sign/edit/" + record.id') 编辑
          app-link-btn(v-if="record.processingStatus==0 && record.status === 'wholesalerProValidStatus_valid'" @click="handleUrge(record)") 催办
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  name: 'KeepAliveXxxx',
  components: {},
  data() {
    return {
      columns: [
        'code',
        'name',
        'count',
        'signedCount',
        'signedCount',
        'notSignedCount',
        'processingStatus',
        'templateType',
        'createBy',
        'createTime',
      ],
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
      // this.search = keyword;
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
      await this.$restful(`DELETE:/project-merchant/wholesaler-protocol/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 催办
    handleUrge(record) {
      this.$restful(`GET:/project-merchant/wholesaler-protocol/notice/${record.id}`, {
        projectId: this.project.id,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 一键催办
    handleOneKeyUrge() {
      this.$restful(`POST:/project-merchant/wholesaler-protocol/notices`, {
        projectId: this.project.id,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 导出数据
    moment,
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/ops/appeal-description/data-export`,
        { ...this.params },
        { responseType: 'blob' },
      )
        .then((res) => {
          const link = document.createElement('a');
          let blob = new Blob([res], {
            type:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          link.style.display = 'none';
          link.href = URL.createObjectURL(blob);
          link.setAttribute(
            'download',
            '诉求描述数据导出' +
              this.moment().format('YYYYMMDDHHmmss') +
              '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'type',
          component: 'app-remote-select',
          width: '150px',
          placeholder: '协议类型',
          api: '/dictionary/getDataDictionaryByItem?itemCode=project-merchant-protocolType',
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
