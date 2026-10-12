<template lang="pug">
app-page-layout(fix-header)
  div.role
    div.role-list-container
      role-list(v-model="role" ref="roleList")
    div.main
      template(v-if="role")
        div.main-header
          div.title {{role.name}}
          a-row
            a-col(:xl="18" :lg="24")
              a-row.my2(:gutter="16")
                a-col(:span="12")
                  app-detail-item(label="角色名称") {{role.name}}
                a-col(:span="12")
                  app-detail-item(label="角色状态")
                    app-enabled-display(:enabled="role.enabled")
                a-col(:span="12")
                  app-detail-item(label="角色描述") {{role.remark}}
        div.main-body.mt2
          resource-table(v-model="resources")
        div.main-footer
          a-button(type="primary" @click="handleSave" :loading="loading") 保存
      template(v-else)
        a-empty.abs-center(description="请选择左侧角色。")
</template>
<script>
import RoleList from './RoleList';
import ResourceTable from './ResourceTable';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: { RoleList, ResourceTable },
  data() {
    return {
      role: null,
      resources: [],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  watch: {
    role: 'loadRoleResources',
  },
  methods: {
    async loadRoleResources() {
      this.resources = this.role?.resourceIds || [];
    },
    async handleSave() {
      try {
        this.loading = true;
        await this.$restful(
          `put:/sys/roles/${this.project.id}/${this.role.id}/permissions`,
          {
            resourceIds: this.resources,
          },
        );
        this.$refs.roleList.loadRoles();
        this.$message.success('保存成功。');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import '~@/styles/utilities';
.role {
  .abs-fit;
  overflow: hidden;
  display: flex;

  .role-list-container {
    flex: none;
    position: relative;
    border-right: 1px solid #f0f0f0;
  }
  .main {
    flex: auto;
    overflow: auto;
    position: relative;
    margin: 1rem;
    &-header {
      background-color: #fafafa;
      padding: 0 1rem;
      .title {
        font-size: 2em;
        color: rgba(0, 0, 0, 0.85);
        padding: 1rem 0;
      }
    }

    &-footer {
      padding: 1rem 0;
      position: sticky;
      bottom: 0;
      background-color: #fff;
    }
  }
}
</style>
