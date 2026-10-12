<template lang="pug">
app-page-layout(fixHeader)
  div.abs-fit.user
    div.user-sider
      dept-tree.abs-fit(:dept="dept" @change="handleDeptChange" ref="tree" readonly)
    div.user-main
      grant-permission(ref="grantRef")
      app-table-page-layout
        template(#toolbar-left)
          app-input-search(@search="handleQuickSearch")
          a-button.ml2(@click="$refs.table.reload()") 刷新
        template(#toolbar-right)
          app-link-btn(to="/user/edit")
            a-button(type="primary" icon="plus" :disabled="!$getPermission('User:Add')") 新建用户
        app-table(
          ref="table" 
          model-name="User" 
          row-key="id" 
          url="/sys/users/page" 
          :visibles="columns" 
          :params="params"
          :columns-customsize="columnsCustomsize")
            template(#action="{record}")
              app-action-column
                app-link-btn(:to="`/user/edit/${record.id}`" :disabled="!$getPermission('User:Edit')") 编辑
                app-link-btn(@click="handleGrant(record)") 权限
                app-link-btn-confirm(@confirm="cb=>handleResetPassword(record,cb)" title="是否重置此用户的密码？" :disabled="!$getPermission('User:Edit')") 重置密码
                app-link-btn-delete(@confirm="cb=>handleDelete(record,cb)") 删除
</template>
<script>
import DeptTree from '@/components/sys/Dept/Tree';
import GrantPermission from './GrantPermission';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { DeptTree, GrantPermission },
  data() {
    return {
      dept: null,
      columns: ['username', 'nickname', 'deptId', 'mobile', 'enabled'],
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
        deptId: this.dept?.id,
        projectId: this.project.id,
      };
    },
  },
  methods: {
    columnsCustomsize(columns, config) {
      columns.push({
        uid: 'action',
        dataIndex: 'action',
        title: '操作',
        width: '23rem',
        fixed: config.fixedActionColumn ? 'right' : null,
      });
      return columns;
    },
    handleQuickSearch(keyword) {
      this.search = keyword;
    },
    handleDeptChange(dept) {
      if (this.dept?.id === dept?.id) {
        this.dept = null;
      } else {
        this.dept = dept;
      }
    },
    async handleResetPassword(user, cb) {
      await this.$restful(`put:/sys/users/${user.id}/password-reset`);
      cb();
      this.$message.success('重置密码成功。');
    },
    async handleDelete(record, cb) {
      await this.$restful(`delete:/sys/users/${record.id}`);
      cb();
      this.$message.success('删除成功。');
      this.$refs.table.reload();
    },
    handleGrant(user) {
      this.$refs.grantRef.show(user);
    },
  },
};
</script>
<style lang="less" scoped>
.user {
  display: flex;
  flex-direction: row;
  &-sider {
    width: 25rem;
    flex: none;
    border-right: 1px solid #f0f0f0;
    position: relative;
  }
  &-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
</style>
