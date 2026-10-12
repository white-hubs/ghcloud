<template lang="pug">
app-page-layout(fix-header)
  app-table-page-layout
    Edit(ref="edit" @on-save="reload")
    BatchEdit(ref="batchEdit" @on-save="handleBatchEditSuccess")
    BatchError(ref="batchError")
    ImportDevices(
      ref='import',
      @modal-success='$refs.table.reload()',
      @modal-error='(err) => $refs.importError.show(err)'
    )
    ImportError(ref='importError', @modal-success='$refs.table.reload()')
    spaceList(ref="spaces")
    template(#toolbar-left)
      //- app-input-search(@search="handleQuickSearch")      
      //- a-button.ml2(@click="$refs.table.reload()") 刷新
      AppSearch(
        v-model="filters"
        :fields="filterFieleds"
        @search="handleQuickSearch"
      ) 
    template(#toolbar-right)
      app-link-btn
        a-button(type="primary" icon="plus" @click="handleAdd") 新建
      a-button.ml2(type='primary' :loading="progress < 100" @click='handleBatchEdit')
        //- a-progress( type="circle" :percent="progress" :width="20" :showInfo="false") 
        span 批量上传图片 
        span.ml1(v-if="progress < 100") {{progress}}%
      a-button.ml2(type='primary', :loading="templateLoading" @click='handleDownloadTemplate') 下载模板
      a-button.ml2(type="primary" :loading="exportLoading" @click="handleExport") 导出数据
      a-button.ml2(type='primary', @click='handleImport') 导入数据
      //- a-button.ml2(type='danger', @click='handleDeleteBatch' :disabled="!canDeleteBatch") 批量删除
        
    app-table(
      ref="table" 
      model-name="Merchants" 
      url="/project-merchant/companies/page" 
      :params="params"
      :visibles="columns" 
      :columns-customsize="columnsCustomsize"
      
      @selectChange="handleSelectChange"
      @change="handleSelectChange"
      @loaded="handleSelectChange"
      )
        template(#code="{record, text}")
          app-link-btn(:to="'/merchant/' + record.id") {{text}}
        template(#num="{record}")
          app-link-btn(v-if="record.spaces && record.spaces.length" @click="handleSpacesView(record)") {{record.spaces.length}}
          span(v-else) 0
        template(#action="{record}")
          app-action-column
            //- app-link-btn(@click="handleEdit(record)" :disabled="!$getPermission('Resource:Edit')") 编辑
            app-link-btn(@click="handleEdit(record)") 编辑
            app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)" ) 删除
</template>
<script>
import ImportDevices from './Modal/ImportDevices';
import ImportError from './Modal/ImportError';

import Edit from './Modal/CreateEdit';
import BatchEdit from './Modal/BatchEdit';
import BatchError from './Modal/BatchError';

import spaceList from './Modal/spaceList';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  components: {
    Edit,
    spaceList,
    ImportDevices,
    ImportError,
    BatchEdit,
    BatchError,
  },
  data() {
    return {
      columns: [
        'code',
        'name',
        'owner',
        'mobile',
        'num',
        'securityFileDTOS',
        'createTime',
      ],
      expandedRowKeys: [],
      search: null,
      canDeleteBatch: false,
      //
      templateLoading: false,
      exportLoading: false,
      // 批量操作进度
      uuid: null,
      progress: 100,
      filters: {
        search: null,
        securitySignd: null,
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
        projectId: this.project.id,
      };
    },
  },
  created() {
    this.uuid = localStorage.getItem('merchantsBatchProcessUuid') || null;
    if (this.uuid) {
      this.handleBatchProgress(this.uuid);
    }
    this.filterFieleds = [
      {
        name: 'securitySignd',
        placeholder: '安全协议',
        width: '150px',
        component: 'app-remote-select',
        options: [
          //code不能从0开始
          { code: 'true', name: '已签订' },
          { code: 'false', name: '未签订' },
        ],
        field: { name: 'code', label: 'name' },
      },
    ];
  },
  beforeDestroy() {
    this.destroyed = true;
  },
  methods: {
    moment,
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
        width: '13rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handleAdd() {
      const select = this.$refs.table.getSelection();
      this.$refs.edit.show({ pid: select?.id }, select?.level);
    },
    handleEdit(record) {
      this.$refs.edit.show({ ...record }, record?.level - 1, 'edit');
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
    handleBatchProgress(uuid) {
      // let timeoutTicket = null;
      const updateProgress = () => {
        this.$restful('GET:/project-merchant/companies/batchUpdateFile/progress', {
          uuid,
        }).then((res) => {
          this.progress = res?.progress == undefined ? 100 : res.progress;
          if (this.progress >= 100) {
            localStorage.removeItem('merchantsBatchProcessUuid');
            if (res?.errors && Object.keys(res.errors).length) {
              this.$refs.batchError.show(res.errors);
            }
          }
          if (this.progress < 100 && !this.destroyed) {
            setTimeout(updateProgress, 1000);
            // updateProgress();
          }
        });
      };
      updateProgress();
    },
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/companies/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
    handleSpacesView(record) {
      this.$refs.spaces.show(record);
    },

    handleSelectChange(select) {
      if (select?.selectedRowKeys?.length) {
        this.canDeleteBatch = true;
      } else {
        this.canDeleteBatch = false;
      }
    },
    // 批量删除
    handleDeleteBatch() {
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);
      this.$restful(`delete:/project-merchant/companies`, {
        ids: ids,
      })
        .then(() => {
          // 删除成功
          this.$refs.table.reload();
        })
        .finally(function(){});
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
    // 导出数据
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
            '商户导出' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
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
  },
};
</script>
