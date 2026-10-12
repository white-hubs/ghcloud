<template lang="pug">
div.role-list
  edit(ref="edit" @on-save="loadRoles")
  div.role-list-header
    div.searchbox
      a-input(type="search" placeholder="输入查询...")
        a-icon(type="search" slot="suffix")
    div.toolbar
      a-button(icon="plus" @click="handleAdd")
      a-button.ml1(icon="reload" @click="loadRoles" :loading="loading")
  div.role-list-body
    div.list
      div.list-item(v-for="item in data" :key="item.id" :class="{active:role && role.id === item.id}" @click="handleClick(item)")
        div.name {{item.name}}
        div.toolbar(@click.stop)
          app-link-btn
            a-icon(type="edit" @click.native="handleEdit(item)")
          app-link-btn-delete(@confirm="cb=>handleDelete(item.id,cb)")
            a-icon.ml2(type="delete")
</template>
<script>
import _ from 'lodash';
import Edit from './Edit';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { Edit },
  model: {
    prop: 'role',
    event: 'change',
  },
  props: {
    role: Object,
  },
  data() {
    return {
      data: [],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  created() {
    this.loadRoles();
  },
  methods: {
    async loadRoles() {
      try {
        this.loading = true;
        const roles = await this.$restful(`/sys/roles/all/${this.project.id}`);
        this.data = _.sortBy(roles, 'sort');
      } finally {
        this.loading = false;
      }
    },
    handleClick(item) {
      this.$emit('change', item);
    },
    handleAdd() {
      this.$refs.edit.show();
    },
    handleEdit(item) {
      this.$refs.edit.show({ ...item });
    },
    async handleDelete(id) {
      await this.$restful(`delete:/sys/roles/${id}`);
      this.loadRoles();
      this.$emit('change', null);
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/variables';
.role-list {
  height: 100%;
  width: 25rem;
  &-header {
    flex: none;
    .searchbox {
      padding: 1rem;
    }
    .toolbar {
      background-color: #f5f8fa;
      padding: 1rem;
    }
  }
  &-body {
    overflow: auto;
    flex: auto;
    .list {
      .list-item {
        padding: 1rem 1rem;
        display: flex;
        cursor: pointer;
        &:hover {
          background-color: #f5f8fa;
        }
        &.active {
          background-color: lighten(@primary-color, 40%);
          color: @primary-color;
        }
        &:hover {
          .toolbar {
            display: block;
          }
        }

        .name {
          flex: auto;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .toolbar {
          flex: none;
          display: none;
        }
      }
    }
  }
}
</style>
