<template lang="pug">
div.dict-type-list
  EditDictType(ref="edit" @on-save="handleRefresh")
  div.dict-type-list-header
    div.searchbox
      a-input(placeholder="输入查询..." v-model="keyword")
        a-icon(type="search" slot="suffix")
    div.toolbar.my1
      a-button(icon="plus" @click="handleAdd") 
      a-button.ml1(icon="reload" @click="handleRefresh")
  div.dict-type-list-body
    div.list
      div.list-item(v-for="item in fiteredData" :key="item.code" @click="handleItemClick(item)" :class="{active:value === item.code}")
        div.name.flex-auto {{item.name}}
        div.flex-none.toolbar
          a-icon(type="edit" @click="handleEdit(item)")
          a-popconfirm(title="是否删除?" @confirm="handleDelete(item)")
            a-icon.ml2(type="delete")
</template>
<script>
import EditDictType from './EditDictType';

export default {
  components: {
    EditDictType,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: String,
  },
  data() {
    return {
      data: [],
      keyword: null,
    };
  },
  computed: {
    fiteredData() {
      if (this.keyword) {
        return this.data.filter(
          (a) => a.code.includes(this.keyword) || a.name.includes(this.keyword),
        );
      }
      return this.data;
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    handleItemClick(item) {
      this.$emit('change', item.code);
    },
    handleRefresh() {
      this.keyword = null;
      this.loadData();
    },
    handleAdd() {
      this.$refs.edit.show();
    },
    handleEdit(item) {
      this.$refs.edit.show({ ...item });
    },
    async handleDelete(item) {
      await this.$restful(`delete:/sys/dict-types/${item.code}`);
      this.$message.success('删除成功。');
      this.handleRefresh();
    },
    async loadData() {
      const res = await this.$restful(`/sys/dict-types/page`, {
        pageSize: 100,
      });
      this.data = res.records;
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';
.dict-type-list {
  width: 25rem;
  height: 100%;
  border-right: 1px solid #f0f0f0;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  &-header {
    flex: none;
    .searchbox {
      padding: 0.5rem;
    }
    .toolbar {
      background-color: rgba(245, 248, 250, 1);
      padding: 0.5rem;
    }
  }
  &-body {
    position: relative;
    flex: auto;
    overflow: auto;
    .list {
      .list-item {
        padding: 1rem 1rem;
        cursor: pointer;
        display: flex;
        &:hover {
          background: rgba(245, 248, 250, 1);
        }
        &.active {
          background: lighten(@primary-color, 40%);
          color: @primary-color;
        }
        .toolbar {
          display: none;
        }
        &:hover {
          .toolbar {
            display: block;
          }
        }
      }
    }
  }
}
</style>
