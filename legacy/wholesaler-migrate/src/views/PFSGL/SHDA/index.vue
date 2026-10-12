<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    CreateAndEdit(ref="createAndEdit" @on-save="reload")
    ImportDevices(
      ref='import',
      @modal-success='$refs.table.reload()',
      @modal-error='(err) => $refs.importError.show(err)'
    )
    ImportError(ref='importError', @modal-success='$refs.table.reload()')
    spaceList(ref="spaces")
    BatchEdit(ref="batchEdit" @on-save="handleBatchEditSuccess")
    BatchError(ref="batchError")
    template(#toolbar-left)
      app-input-search(@search='handleQuickSearch')
      a-button.ml2(@click='$refs.table.reload()') 刷新
    template(#toolbar-right)
      a-button.ml2(type='primary', icon='plus', @click='handleAdd') 新建
      a-button.ml2(type='primary' :loading="progress < 100" @click='handleBatchEdit')
        span 批量上传图片 
        span.ml1(v-if="progress < 100") {{progress}}%
      a-button.ml2(type='primary', :loading="templateLoading" @click='handleDownloadTemplate') 下载模板
      a-button.ml2(type="primary" :loading="exportLoading" @click="handleExport") 导出数据
      a-button.ml2(type='primary', @click='handleImport') 导入数据
      a-button.ml2(
        type='danger',
        @click='handleDeleteBatch',
        :disabled='!canDeleteBatch',
        :loading='deleteBatchLoading'
      ) 批量删除
    app-table(
      ref='table',
      model-name='Merchants',
      url='/project-merchant/companies/page',
      :pagination="true"
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize',
      @select='handleSelectChange',
      @selectChange='handleSelectChange',
      @change='handleSelectChange',
      @loaded='handleSelectChange'
    )
      template(#code="{text, record}")
        app-link-btn(:to="'./merchant-archives/' + record.id") {{ text }}
      template(#num="{record}")
        app-link-btn(v-if="record.spaces && record.spaces.length" @click="handleSpacesView(record)") {{record.spaces.length}}
        span(v-else) 0
      template(#action='{ record }')
        app-action-column
          app-link-btn(@click='handleEdit(record)') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
</template>

<script>
import { GETTER_PROJECT, LOAD_CURRENT_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
import CreateAndEdit from './Modal/CreateAndEdit';
import BatchEdit from './Modal/BatchEdit';
import BatchError from './Modal/BatchError';
import ImportDevices from './Modal/ImportDevices';
import ImportError from './Modal/ImportError';
import spaceList from './Modal/spaceList';
export default {
  name: 'KeepAliveXxxx',
  components: {
    CreateAndEdit,
    BatchEdit,
    BatchError,
    ImportDevices,
    ImportError,
    spaceList,
  },
  data() {
    return {
      columns: ['code', 'name', 'owner', 'mobile', 'stallName', 'createTime'],
      search: null,
      // 批量删除
      canDeleteBatch: false,
      deleteBatchLoading: false,
      // 筛选
      filters: {},
      filterFieleds: [],
      // 导出
      exportLoading: false,
      progress: 100,
      templateLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        search: this.search,
        projectId: this.project?.id,
      };
    },
  },
  created() {
    this.initFilters();
    this.$store.dispatch(LOAD_CURRENT_PROJECT);
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
      this.reload()
    },
    // 新增
    handleAdd() {
      const select = this.$refs.table.getSelection();
      this.$refs.createAndEdit.show({ pid: select?.id }, select?.level);
    },
    // 修改
    handleEdit(record) {
      this.$refs.createAndEdit.show({ ...record }, record?.level - 1, 'edit');
    },
    handleBatchEdit() {
      const selections = this.$refs.table.getSelection();
      this.$refs.batchEdit.show(selections);
    },
    handleBatchEditSuccess(uuid) {
      this.uuid = uuid;
      this.reload();
      localStorage.setItem('merchantsBatchProcessUuid', uuid);
      this.handleBatchProgress(uuid);
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
    handleSpacesView(record) {
      this.$refs.spaces.show(record);
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`DELETE:/project-merchant/companies/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 下载模板
    handleDownloadTemplate() {
      this.templateLoading = true;
      this.$restful(
        `GET:/project-merchant/companies/template-download`,
        { projectId: this.project.id },
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
          // let time = new Date().getTime();
          link.setAttribute(
            'download',
            '商户导入模板' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.templateLoading = false;
        });
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`POST:/project-merchant/companies/batch-deleted`,ids)
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
        `GET:/project-merchant/companies/data-export`,
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
            '商户档案导出' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
    // 导入数据
    handleImport() {
      this.$refs.import.show();
    },
    // 初始化筛选条件
    initFilters() {
      this.filterFieleds = [
        {
          name: 'type',
          component: 'app-remote-select',
          width: '150px',
          placeholder: '诉求类型',
          api: '/dictionary/getDataDictionaryByItem?itemCode=appealType',
          field: { name: 'code', label: 'name' },
        },
      ];
    },
  },
};
</script>
<style lang="less" scoped></style>
