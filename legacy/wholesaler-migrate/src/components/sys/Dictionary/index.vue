<template lang="pug">
  app-page-layout(fix-header)
    div.abs-fit.flex
      edit-dict-data(ref="edit" :typeCode="code" @on-save="reload")
      div.flex-none.relative
        dict-type-list(v-model="code")
      div.flex-auto.relative
        app-table-page-layout
          template(#toolbar-left)
            a-button(@click="reload") 刷新
          template(#toolbar-right)
            a-button(type="primary" icon="plus" @click="$refs.edit.show()") 添加数据字典
          app-table(
            ref="table" 
            model-name="DictData" 
            row-key="code" 
            @expandedRowsChange="rows=>expandedRowKeys=rows"
            :url="fetchData" 
            :visibles="columns" 
            :pagination="false"
            :expandedRowKeys="expandedRowKeys"
            :columns-customsize="columnsCustomsize")
              template(#action="{record}")
                app-action-column
                  app-link-btn(@click="$refs.edit.show({...record})") 编辑
                  app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
import DictTypeList from './DictTypeList';
import EditDictData from './EditDictData';

import { flattenTree, treezen } from '@/utils/common';
export default {
  components: { DictTypeList, EditDictData },
  data() {
    return {
      code: null,
      columns: ['name', 'code'],
      expandedRowKeys: [],
    };
  },
  watch: {
    code: 'reload',
  },
  methods: {
    async handleDelete(record, cb) {
      await this.$restful(`delete:/sys/dict-datas`, {
        typeCode: record.typeCode,
        dataCode: record.code,
      });
      cb();
      this.$message.success('删除成功。');
      this.reload();
    },
    async fetchData() {
      if (this.code) {
        const data = await this.$restful(`/sys/dict-datas/graph`, {
          typeCode: this.code,
        });
        const flatData = flattenTree(data).map((item) => {
          return {
            ...item,
            parentCode: item.parentCode || null,
          };
        });
        this.expandedRowKeys = flatData.map((item) => item.code);
        return treezen(flatData, 'parentCode', 'code');
      } else {
        return [];
      }
    },
    reload() {
      this.$refs.table.reload();
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
  },
};
</script>
