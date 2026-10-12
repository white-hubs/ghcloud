<template lang="pug">
.worksheet
  .worksheet-main
    app-table-page-layout
      template(#toolbar-left)
        app-search(
          v-model='filters',
          :fields='filterFieleds',
          @search='handleQuickSearch',
          keywordPlaceholder='请输入关键字'
        ) 

        a-button.ml2(@click='$refs.table.reload()') 刷新
      //- template(#toolbar-right)
      //-   a-button(
      //-     type='primary',
      //-     style='margin-left: 10px',
      //-     @click='exportClick'
      //-   ) 导出
      app-table(
        ref='table',
        model-name='statisticsDetail',
        url='/project-merchant/stall-evaluation-records/store/page',
        :params='params',
        :visibles='columns',
        :fitHeight='-50',
        :columns-customsize='columnsCustomsize'
      )
        template(#action='{ record }')
          span {{ Dname }}
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  // name: 'KeepAliveXxxx',
  components: {},
  data() {
    return {
      columns: [
        'nickname',
        'createTime',
        'honestyScore',
        'zScore',
        'sScore',
        'tScore',
        'wScore',
      ],
      categorys: [],
      search: null,
      type: null,
      startTime: null,
      endTime: null,
      deptId: null,
      date: null,
      sourceType: null,
      displayTable: true,
      // 筛选
      selectedCategoryIndex: 0,
      // 筛选
      filters: {
        search: '',
        timeRange: '',
        beginTime: '',
        endTime: '',
        underStar: '', //审核状态
      },
      filterFieleds: [],
      // 批量删除
      canDeleteBatch: false,
      deleteBatchLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        // status: this.status,
        projectId: this.project.id,
        ...this.filters,
        stallId: this.$route.params.id,
      };
    },
    Dname() {
      return this.$route.params.Dname;
    },
  },
  async created() {
    this.filterFieleds = [
      {
        name: 'underStar',
        placeholder: '诚信经营评分',
        width: '150px',
        component: 'app-remote-select',
        options: [
          { code: 1, name: '一星' },
          { code: 2, name: '二星及以下' },
          { code: 3, name: '三星及以下' },
          { code: 4, name: '四星及以下' },
          { code: 5, name: '五星及以下' },
        ],
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
    await this.loadCategorys();
    // this.status = this.categorys[this.selectedCategoryIndex].code;
  },
  methods: {
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '档位名称',
        width: '18rem',
        fixed: config.fixedActionColumn ? 'left' : null,
      });
      return columns;
    },
    moment,
    async loadCategorys() {
      const cates = await this.$restful('/project-merchant/stall-score-stat/honesty/page', {
        typeCode: 'appealStatus',
      });
      this.categorys = cates;
      // this.status = this.categorys[0].code;
    },
    handleCateClick(index) {
      this.selectedCategoryIndex = index;
      this.displayTable = false;
      this.status = this.categorys[this.selectedCategoryIndex].code;
      this.$nextTick(() => {
        this.displayTable = true;
        this.$nextTick(() => {
          this.$refs.table.refresh();
        });
      });
    },
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    handleCreate() {
      this.$refs.create.show();
    },
    handleCreateTicket(record) {
      this.$refs.ticket.show(record);
      // this.$refs.ticket.show({
      //   sourceType: 'ticketinstSource_appeal',
      //   sourceId: record.id,
      //   ticketId: record.ticketId,
      //   dutyId: record?.dutyId?.split(','),
      //   deviceDTOS: record?.deviceDTOS, // 设备自动填
      //   deviceIds: record?.deviceDTOS?.map((item) => item.id),
      // });
    },
    handleReply(record) {
      this.$refs.reply.show(record, 'reply');
    },
    handleClose(record) {
      this.$refs.reply.show(record, 'close');
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/appeals/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.reload();
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`delete:/project-merchant/appeals`, {
        ids: ids,
      })
        .then(() => {
          this.$refs.table.reload();
        })
        .finally(() => {
          this.deleteBatchLoading = false;
        });
    },
  },
};
</script>

<style lang="less" scoped>
.worksheet {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  .btn-tabs {
    flex: none;
    // padding: var(--space-3);
    // padding-bottom: 0;
    .category-btn {
      margin-right: 1rem;
    }
  }
  .worksheet-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
</style>
