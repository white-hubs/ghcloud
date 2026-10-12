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
      app-link-btn(to='/questionnaire-examine/add')
        a-button(type="primary" icon="plus") 新建
      a-button.ml2(type='primary' @click="handleOneKeyUrge") 一键催办
    app-table(
      ref='table',
      model-name='examine',
      url='/project-merchant/wholesaler-questionnaire/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize'
    )
      template(#code="{text, record}")
        app-link-btn(:to="'./questionnaire-examine/' + record.id") {{ text }}
      template(#action='{ record }')
        app-action-column
          span.downText(@click='handleExport(record)') 下载excel
          app-link-btn(:to='"/questionnaire-analysis/"+record.id') 问卷分析
          app-link-btn(v-if="record.status==='questionnaireValidStatus_valid'" @click="handleUrge(record.id)") 催办
          app-link-btn(:to='"/questionnaire-examine/edit/" + record.id') 编辑
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
        'notSignedCount',
        'status',
        'processingStatus',
        'tempType',
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
      this.search = keyword;
    },
    // 新增
    handleCreate() {
      this.$refs.createAndEdit.show();
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
    // 催办
    handleUrge(id) {
      this.$restful(`GET:/project-merchant/wholesaler-questionnaire/notice/${id}`, {
        projectId: this.project.id,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 一键催办
    handleOneKeyUrge() {
      this.$restful(`GET:/project-merchant/wholesaler-questionnaire/notices`, {
        projectId: this.project.id,
      }).then((res) => {
        this.$message.success('操作成功');
        this.$refs.table.reload();
      });
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/wholesaler-questionnaire/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 导出数据
    a1(record) {
      //name
      //id
    },
    moment,
    handleExport(record) {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/wholesaler-questionnaire/detail-download`,
        { questionnaireId: record.id }, //参数
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
            record.name + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
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
          placeholder: '调查类型',
          api: '/dictionary/getDataDictionaryByItem?itemCode=project-merchant-questionnaireType',
          field: { name: 'code', label: 'name' },
        },
        {
          name: 'processingStatus',
          placeholder: '完成状态',
          width: '150px',
          component: 'app-remote-select',
          options: [
            {
              value: '1',
              label: '已完成',
            },
            {
              value: '0',
              label: '未完成',
            },
          ],
          field: { name: 'value', label: 'label' },
        },
        {
          name: 'status',
          component: 'app-remote-select',
          width: '150px',
          placeholder: '有效状态',
          api: '/dictionary/getDataDictionaryByItem?itemCode=questionnaireValidStatus',
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
.downText {
  color: #1890ff;
  cursor: pointer;
}
:deep(.input){
  overflow: hidden;
  margin-right: 8px;
}
:deep(.inline){
  &:nth-child(4){
    .input{
      margin-right: 0px;
    }
  }
}
</style>
