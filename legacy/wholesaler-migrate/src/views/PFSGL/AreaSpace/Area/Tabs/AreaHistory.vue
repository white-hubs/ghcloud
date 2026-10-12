<template lang="pug">
app-table-page-layout
  template(#toolbar-left)
    //- app-input-search(@search='handleQuickSearch')
    app-search(
      v-model="filters"
      :fields="filterFieleds"
      @search="handleQuickSearch"
      hideKeyword
    )
    a-button.ml2(@click='$refs.table.reload()') 刷新
  //- template(#toolbar-right)
    a-button.ml2(type="primary" :loading="exportLoading" @click="handleExport") 导出数据
  app-table(
    ref="table"
    model-name="HistoryArea"
    url="/project-merchant/history-areas"
    :params="params"
    :visibles="columns"
    @select="handleSelectChange",
    @selectChange="handleSelectChange",
    @change="handleSelectChange",
    @loaded="handleSelectChange"
  )
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
// import CreateAndEdit from './Modal/CreateAndEdit';
import moment from 'moment';
export default {
  name: 'KeepAliveXxxx',
  components: {
    // CreateAndEdit,
  },
  data() {
    return {
      columns: [
        'areaName',
        'project-merchant-areaType',
        'areaLevel',
        'buildingArea',
        'coverArea',
        'leaseArea',
        'leaseRealArea',
        'leasePublicArea',
        'fireArea',
        'cleanArea',
        'parkingArea',
        'createBy',
        'createTime',
        // 'updateBy',
        // 'updateTime',
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
        projectId: this.project.id,
        objectId: this.$route.params.id,
        objectType: 'area',
        ...this.filters,
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
        width: '13rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    // 启用/禁用
    async handleEnable(record, cb, enabled) {
      //inspplans
      await this.$restful(
        `PUT:/sys/login-logs/${record.id}/enables`,
        { enabled },
        { params: { enabled } },
      );
      cb();
      this.$message.success('操作成功!');
      this.$refs.table.reload();
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/sys/login-logs/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`DELETE:/sys/login-logs`, {
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
        `GET:/ops/operation-logs/data-export`,
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
            '登录日志数据导出' +
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
