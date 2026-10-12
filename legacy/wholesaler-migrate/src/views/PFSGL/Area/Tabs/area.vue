<template lang="pug">
  app-table-page-layout
    Edit(ref="edit" @on-save="reload")
    template(#toolbar-left)
      app-input-search(@search="handleQuickSearch")
      a-button.ml2(@click="$refs.table.reload()") 刷新
    template(#toolbar-right)
      app-link-btn
        app-link-btn(to="/area/add")
          a-button(type="primary" icon="plus") 新建
        //- a-button(type="primary" icon="plus" @click="handleAdd") 新建

    //- childrenColumnName="areas"
    app-table(
      ref="table"
      model-name="Area"
      :selectionMode="false"
      sortable
      parentKey="pid"
      @expandedRowsChange="rows=>expandedRowKeys=rows"
      @on-sort="handleSort"
      :expandedRowKeys="expandedRowKeys"
      :url="fetchData"
      :params="params"
      :visibles="columns"
      :pagination="false"
      :fitHeight="-60"
      :columns-customsize="columnsCustomsize")
        //- template(#name="{record}")
        //-   span.drag-handler
        //-     span {{record.name}}
        //-     a-icon.drag-icon(type="drag")
        template(#action="{record}")
          app-action-column
            //- app-link-btn(@click="handleEdit(record)" :disabled="!$getPermission('Resource:Edit')") 编辑
            //- app-link-btn(:to="'/area/cameraStatus/' + record.id") 视角绑定
            app-link-btn(:to="'/area/edit/' + record.id") 编辑
            app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)" ) 删除
</template>
<script>
import Edit from '../Modal/Edit';
import { flattenTree, treezen, treezenFiltered } from '@/utils/common';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { Edit },
  data() {
    return {
      columns: ['name', 'num', 'levelName', 'typeName', 'coverArea'],
      expandedRowKeys: [],
      search: null,
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
  },
  methods: {
    reload() {
      this.$refs.table.reload();
    },
    async fetchData() {
      const data = await this.$restful(`/project-merchant/areas/all-graph`, this.params);
      const flatData = flattenTree(data)
        .map((item) => {
          return {
            ...item,
            pid: item.pid || null,
          };
        })
        .filter((item) => {
          let isPassFilter = false;
          isPassFilter = !this.search || item.name.includes(this.search);
          return isPassFilter;
        });
      // return treezen(flatData, 'pid');
      return treezenFiltered([], flatData, 'pid');
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '130px',
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
      await this.$restful(`delete:/project-merchant/areas/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
    async handleSort(ids) {
      await this.$restful(`put:/project-merchant/areas/sorting`, {
        ids,
      });
      this.$message.success('已保存排序。');
      this.$refs.table.reload();
    },
  },
};
</script>
