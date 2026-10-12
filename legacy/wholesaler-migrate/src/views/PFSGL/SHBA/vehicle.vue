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
      a-button.ml2(type='primary', :loading="templateLoading" @click='handleDownloadTemplate') 下载模板
      a-button.ml2(type="primary" @click="handleImport") 导入
      a-button.ml2(type="primary" :loading="exportLoading" @click="handleExport") 导出
    app-table(
      ref='table',
      model-name='wholesalerVehicle',
      url='/project-merchant/wholesaler-vehicle/page',
      :params='params',
      :visibles='columns',
      :columns-customsize='columnsCustomsize',
    )
      template(#vehiclePlate="{text, record}")
        app-link-btn(:to="'./vehicle-record/' + record.id") {{ text }}
      template(#action='{ record }')
        app-action-column
          app-link-btn(@click='handleEdit(record)') 编辑
          app-link-btn-delete(@confirm='(cb) => handleDelete(record, cb)') 删除
  CreateVehicle(ref="createVehicle", @modal-success='$refs.table.reload()')
  ImportVehicle(
    ref='import',
    @modal-success='$refs.table.reload()',
    @modal-error='(err) => $refs.importError.show(err)'
    )
  ImportError(ref='importError', @modal-success='$refs.table.reload()')
</template>

<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import CreateVehicle from './Modal/CreateVehicle';
import ImportVehicle from './Modal/ImportVehicle';
import ImportError from './Modal/ImportError';
import moment from 'moment';
export default {
  name: 'KeepAliveXxxx',
  components: { CreateVehicle, ImportVehicle, ImportError },
  data() {
    return {
      columns: [
        'vehiclePlate',
        'vehicleTypeName',
        'color',
        'owner',
        'mobile',
        'stallName',
        'companyName',
        'createBy',
        'createTime',
      ],
      search: null,
      // 筛选
      filters: {},
      filterFieleds: [],
      // 导出
      exportLoading: false,
      templateLoading: false,
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
      this.$refs.createVehicle.show();
    },
    // 修改
    handleEdit(record) {
      this.$refs.createVehicle.show(record);
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
      await this.$restful(`DELETE:/project-merchant/wholesaler-vehicle/${record.id}`);
      cb();
      this.$message.success('删除成功!');
      this.$refs.table.reload();
    },

    // 导入
    handleImport() {
      this.$refs.import.show();
    },
    // 下载模板
    handleDownloadTemplate() {
      this.templateLoading = true;
      this.$restful(
        `GET:/project-merchant/wholesaler-vehicle/template-download`,
        {
          projectId: this.project.id,
        },
        {
          responseType: 'blob',
        },
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
            '车辆备案模板' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
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
    moment,
    handleExport() {
      this.exportLoading = true;
      this.$restful(
        `GET:/project-merchant/wholesaler-vehicle/data-export`,
        { ...this.params },
        {
          responseType: 'blob',
        },
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
            '车辆记录模板' + this.moment().format('YYYYMMDDHHmmss') + '.xlsx',
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
          placeholder: '选择车型',
          api: '/dictionary/getDataDictionaryByItem?itemCode=vehicleType',
          field: { name: 'code', label: 'name' },
        },
      ];
    },
  },
};
</script>
<style lang="less" scoped>
// .
</style>
