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
    app-table(
      ref='table',
      model-name='store-score',
      url='/project-merchant/stall-score/total',
      :params='params',
      :visibles='columns',
      @select='handleSelectChange',
      @selectChange='handleSelectChange',
      @change='handleSelectChange',
      @loaded='handleSelectChange'
    )
      template(#code="{text, record}")
        app-link-btn(:to="'./store-score/' + record.id") {{ text }}
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
        'companyName',
        'owner',
        // 'score',
        'honestyScore',
        'zScoreAvg',
        'sScoreAvg',
        'tScoreAvg',
        'wScoreAvg',
        'inspTotal',
        'total',
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
        ...this.filters,
        projectId: this.project?.id,
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
    // 启用/禁用
    async handleEnable(record, cb, enabled) {
      //inspplans
      await this.$restful(
        `PUT:/project-merchant/appeal-description/${record.id}/enables`,
        { enabled },
        { params: { enabled } },
      );
      cb();
      // this.$message.success('操作成功!');
      this.$refs.table.reload();
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/appeal-description/${record.id}`);
      cb();
      // this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`DELETE:/project-merchant/appeal-description`, {
        ids: ids,
      })
        .then(() => {
          this.$refs.table.reload();
        })
        .finally(() => {
          this.deleteBatchLoading = false;
        });
    },
    // 是否可以批量删除
    handleSelectChange(select) {
      if (select?.selectedRowKeys?.length) {
        this.canDeleteBatch = true;
      } else {
        this.canDeleteBatch = false;
      }
    },
    // 导出数据
    moment,
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/appeal-description/data-export`,
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
        // {
        //   name: 'type',
        //   component: 'app-remote-select',
        //   width: '150px',
        //   placeholder: '诉求类型',
        //   api: '/sys/dict-datas/graph?typeCode=appealType',
        //   field: { name: 'code', label: 'name' },
        // },
      ];
    },
  },
};
</script>
<style lang="less" scoped>
// .
</style>
