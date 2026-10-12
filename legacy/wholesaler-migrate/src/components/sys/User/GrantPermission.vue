<template lang="pug">
app-modal(v-model="visible" 
  width="80rem" 
  title="用户权限" 
  :confirm-loading="loading"
  :body-style="{padding:0}"
  @ok="handleSubmit"
  @cancel="close")
    resource-table(v-model="resourceIds" :scroll="{y:'50vh'}")
</template>
<script>
import ResourceTable from '../Role/ResourceTable';
export default {
  components: { ResourceTable },
  data() {
    return {
      loading: false,
      visible: false,
      user: null,
      resourceIds: [],
    };
  },
  methods: {
    show(user) {
      this.visible = true;
      this.user = user;
      this.resourceIds = user.resourceIds || [];
    },
    async handleSubmit() {
      try {
        this.loading = true;
        await this.$restful(`put:/sys/users/${this.user.id}/permissions`, {
          resourceIds: this.resourceIds,
        });
        this.$message.success('保存成功。');
        this.$emit('on-save');
        this.close();
      } finally {
        this.loading = false;
      }
    },
    close() {
      this.visible = false;
      this.user = null;
    },
  },
};
</script>
