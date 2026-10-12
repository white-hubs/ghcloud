<template lang="pug">
app-page-layout(fix-header)
  div.px3.abs-fit.overflow-auto
    app-table-page-layout
      Edit(ref="edit" @on-save="reload")
      template(#toolbar-left)
        app-input-search(@search="handleQuickSearch")      
        a-button.ml2(@click="$refs.table.reload()") 刷新
      template(#toolbar-right)
        app-link-btn()
          a-button(type="primary" icon="plus" @click="handleAdd") 新建
          
      app-table(
        ref="table" 
        model-name="Space" 
        selectionMode="single"
        url="/project-merchant/spaces/page" 
        :params="params"
        :visibles="columns" 
        :fitHeight="-60"
        :columns-customsize="columnsCustomsize")
          template(#action="{record}")
            app-action-column
              app-link-btn(@click="handleEdit") 编辑
              app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)" ) 删除
</template>
<script>
import Edit from './Modal/AddEditCamera';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { Edit },
  data() {
    return {
      columns: [
        'code',
        'name',
        'acreage',
        'area',
        'tradeModel',
        'createTime',
        'bim',
      ],
      expandedRowKeys: [],
      search: null,
      model: {},
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        search: this.search,
        projectId: this.project.id,
      };
    },
    id() {
      return this.$route.params.id;
    },
  },
  created() {
    this.loadModel();
  },
  methods: {
    async loadModel() {
      const area = await this.$restful(`GET:/project-merchant/spaces/${this.id}`);
      this.model = area;
    },
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
        width: '12rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handleAdd() {
      const select = this.$refs.table.getSelection();
      this.$refs.edit.show();
    },
    handleEdit(record) {
      this.$refs.edit.show({ ...record });
    },
    async handleDelete(record, cb) {
      await this.$restful(`delete:/project-merchant/spaces/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
  },
};
</script>
