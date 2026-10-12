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
      a-button(type='primary', icon='plus', @click='handleCreate') 新建
      //- a-button.ml2(type="primary" @click="handleImport") 导入
      a-button.ml2(type="primary" :loading="exportLoading" @click="handleExport") 导出
    app-table(
      ref='table',
      rowKey="id",
      model-name='staff',
      url='/project-merchant/wholesaler/user/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize',
    )
      template(#action='{ record }')
        app-action-column
          app-link-btn(@click='handleEdit(record)') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
    CreateStaff(ref='createStaff', @modal-success='$refs.table.reload()')
    ImportStaff(
      ref='import',
      @modal-success='$refs.table.reload()',
      @modal-error='(err) => $refs.importError.show(err)'
    )
    ImportError(ref='importError', @modal-success='$refs.table.reload()')
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateStaff from './Modal/CreateStaff';
import ImportStaff from './Modal/ImportStaff';
import ImportError from './Modal/ImportError';
import moment from 'moment';
export default {
  name: 'KeepAliveXxxx',
  components: {
    CreateStaff,
    ImportStaff,
    ImportError,
  },
  data() {
    return {
      filters: {},
      filterFieleds: [],
      columns: [
        'nickname',
        'mobile',
        'stallName',
        'owner',
        'companyName',
        'gender',
        'createBy',
        'createTime',
      ],
      keyword: null,
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
        projectId: this.project.id,
      };
    },
  },
  created() {
    this.filterFieleds = [
      {
        name: 'owner',
        placeholder: '请选择职位',
        width: '150px',
        component: 'app-remote-select',
        options: [
          { code: 'true', name: '档主' },
          { code: 'false', name: '从业人员' },
        ],
        field: { name: 'code', label: 'name' },
      },
    ];
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) { },
    // 新增
    handleCreate() {
      this.$refs.createStaff.show();
    },
    // 修改
    handleEdit(record) {
      this.$refs.createStaff.show(record);
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

    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/users/${record.userId}`);
      await this.$restful(`delete:/project-merchant/companies/user`, {
        companyId: record.companyId,
        userId: record.userId,
      });
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    handleImport() {
      this.$refs.import.show();
    },
    // 导出数据
    moment,
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/wholesaler/data-export`,
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
            '人员备案数据导出' +
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
  },
};
</script>
<style lang="less" scoped>
// .
</style>
