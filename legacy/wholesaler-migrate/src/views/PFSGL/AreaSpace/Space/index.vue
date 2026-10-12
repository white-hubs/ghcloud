<template lang="pug">
  app-table-page-layout
    //- Edit(ref="edit" @on-save="reload")
    ImportDevices(
      ref='import',
      @modal-success='$refs.table.reload()',
      @modal-error='(err) => $refs.importError.show(err)'
    )
    ImportError(ref='importError', @modal-success='$refs.table.reload()')
    template(#toolbar-left)
      //- app-input-search(@search="handleQuickSearch") 
      app-search(
        v-model="filters"
        :fields="filterFieleds"
        @search="handleQuickSearch"
      )    
      a-button.ml2(@click="$refs.table.reload()") 刷新
    template(#toolbar-right)
      a-button.mr2(type='primary', :loading="templateLoading" @click='handleDownloadTemplate') 下载模板
      a-button.mr2(type="primary" :loading="exportLoading" @click="handleExport") 导出空间
      a-button.mr2(type='primary', @click='handleImport') 导入空间
      app-link-btn(to="/space/add")
        a-button(type="primary" icon="plus") 新建
        //- a-button(type="primary" icon="plus" @click="handleAdd") 新建
        //-  selectionMode="single"
        app-table(
          ref="table" 
          model-name="Space" 
          :selectionMode="false"
          url="/project-merchant/spaces/page" 
          :params="params"
          :visibles="columns" 
          :fitHeight="-60"
          :columns-customsize="columnsCustomsize")
            template(#action="{record}")
              app-action-column
                //- app-link-btn(@click="handleEdit(record)" :disabled="!$getPermission('Resource:Edit')") 编辑
                app-link-btn(:to="`/space/${record.id}/edit`") 编辑
                app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)" ) 删除
</template>
<script>
import ImportDevices from '../Modal/ImportDevices';
import ImportError from '../Modal/ImportError';

// import Edit from '../Modal/CreateSpace';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';

import moment from 'moment';
export default {
  components: {
    // Edit,
    ImportDevices,
    ImportError,
  },
  data() {
    return {
      columns: [
        'code',
        'name',
        'type',
        'coverArea',
        'fireArea',
        'cleanArea',
        'area',
        'deptName',
        'attributeName',
        'tradeModelName',
        'createTime',
        'bimBind',
      ],
      expandedRowKeys: [],
      // search: null,
      filters: {},
      filterFieleds: [],
      //
      templateLoading: false,
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
        name: 'areaId',
        placeholder: '请选择所属区域',
        width: '250px',
        component: 'app-cascader',
        api: '/project-merchant/areas/all-graph',
        params: { projectId: this.project.id },
        mode: 'single',
      },
      {
        name: 'attribute',
        placeholder: '空间属性',
        width: '150px',
        component: 'app-remote-select',
        api: '/dictionary/getDataDictionaryByItem?itemCode=project-merchant-spaceAttr',
        params: { projectId: this.project.id },
        field: { name: 'code', label: 'name' },
      },
      {
        name: 'tradeModel',
        placeholder: '经营类型',
        width: '150px',
        component: 'app-remote-select',
        api: '/dictionary/getDataDictionaryByItem?itemCode=project-merchant-spaceTradeModel',
        params: { projectId: this.project.id },
        field: { name: 'code', label: 'name' },
      },
    ];
  },
  methods: {
    moment,
    reload() {
      this.$refs.table.reload();
    },
    handleQuickSearch(keyword) {
      // this.search = keyword;
      this.$refs.table.refresh();
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
    handleAdd() {
      const select = this.$refs.table.getSelection();
      this.$refs.edit.show({ pid: select?.id }, select?.level);
    },
    handleEdit(record) {
      this.$refs.edit.show({ ...record }, record?.level - 1, 'edit');
    },
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/spaces/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    }, // 下载模板
    handleDownloadTemplate() {
      //handleDownloadTemplate
      this.templateLoading = true;
      this.$restful(
        `GET:/project-merchant/spaces/template-download`,
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
            '空间导入模板' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.templateLoading = false;
        });
    },
    // 导出空间
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/spaces/data-export`,
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
            '空间导出' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .finally(() => {
          this.exportLoading = false;
        });
    },
    // 导入空间
    handleImport() {
      this.$refs.import.show();
    },
  },
};
</script>
