<template lang="pug">
.worksheet
  .worksheet-main
    app-table-page-layout
      Import(
        ref='import',
        @modal-success='$refs.table.reload()',
        @modal-error='(err) => $refs.importError.show(err)'
      )
      ImportError(ref='importError', @modal-success='$refs.table.reload()')
      template(#toolbar-left)
        app-search(
          v-model='filters',
          :fields='filterFieleds',
          @search='handleQuickSearch',
          keywordPlaceholder='请输入关键字'
        ) 

        a-button.ml2(@click='$refs.table.reload()') 刷新
      template(#toolbar-right)
        a-button.ml2(type="primary" :loading="templateLoading" @click="handleDownloadTemplate") 下载模板
        a-button.ml2(type="primary" @click="handleImport") 导入数据
        a-button.ml2(
        type="danger"
        @click="handleDeleteBatch"
        :disabled="!canDeleteBatch"
        :loading="deleteBatchLoading"
      ) 批量删除
        a-button.ml2(type="primary" icon="plus" @click="handleCreate") 新建
        CreateConfig(ref="createAndConfig" @modal-success="$refs.table.refresh()")
      //- template(#toolbar-right)
      //-   a-button(
      //-     type='primary',
      //-     style='margin-left: 10px',
      //-     @click='exportClick'
      //-   ) 导出
      app-table(
        ref='table',
        model-name='mgcTable',
        url='/project-merchant/sensitive-word/page',
        :params='params',
        :visibles='columns',
        :columns-customsize="columnsCustomsize"
        :fitHeight='-50'
        @select="handleSelectChange",
      @selectChange="handleSelectChange",
      @change="handleSelectChange",
      @loaded="handleSelectChange"
      )
        template(#action="{record}")
                app-action-column
                  app-link-btn(@click='handleEdit(record)') 编辑
                  app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
import CreateConfig from './Modal/CreateConfig';
import Import from './Modal/Import';
import ImportError from './Modal/ImportError';
export default {
  // name: 'KeepAliveXxxx',
  components: { CreateConfig, Import, ImportError },
  data() {
    return {
      columns: ['name'],
      // 筛选
      filters: {
        search: '',
      },
      filterFieleds: [],
      templateLoading: false, //下载模板
      deleteBatchLoading: false, //批量删除状态
      canDeleteBatch: false, //
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
        // search: this.filters?.search,
      };
    },
  },
  async created() {},
  methods: {
    moment,
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    //新增
    handleCreate() {
      this.$refs.createAndConfig.show();
    },
    // 编辑
    handleEdit(record) {
      this.$refs.createAndConfig.show(record);
    },
    // 删除
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/sensitive-word/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },
    // 批量删除
    handleDeleteBatch() {
      this.deleteBatchLoading = true;
      const ids = this.$refs.table.getSelection()?.map((item) => item.id);

      this.$restful(
        `DELETE:/project-merchant/sensitive-word/batch`,
        {
          ids: ids,
        },
        { forceBody: true },
      )
        .then(() => {
          this.$message.success('批量删除成功!');
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
    // 下载模板
    handleDownloadTemplate() {
      this.templateLoading = true;
      this.$restful(
        `GET:/project-merchant/sensitive-word/template-download`,
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
          link.setAttribute(
            'download',
            '敏感词导入模板' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.templateLoading = false;
        });
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '15rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    // 导入数据
    handleImport() {
      this.$refs.import.show();
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
