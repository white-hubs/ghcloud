<template lang="pug">
div.detpt-detailoredit
  a-row
    a-col(:lg="8" :md="12" :sm="24")
      template(v-if="edit || isCreate")
        app-detail-item(label="所属部门" labelWidth="94px" labelAlign="right" style="margin-bottom:3rem")
          app-dept-display(:id="dept.parentId")
        dept-form(:model="model" ref="form")
        div.toolbar
          a-button(type="primary" @click="handleSave" :loading="loading" :disabled="!$getPermission('Dept:Edit')&&!isCreate || !$getPermission('Dept:Add')&&isCreate") 保存
          a-button.ml1(@click="handleCancelEdit" v-if="!isCreate") 取消编辑
      template(v-else)
        dept-detail(:model="model")
        div.toolbar
          a-button(@click="edit=true" :disabled="!$getPermission('Dept:Edit')") 编辑
</template>
<script>
import DeptForm from './Form';
import DeptDetail from './Detail';
export default {
  components: { DeptForm, DeptDetail },
  props: {
    dept: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      edit: false,
      model: this.dept ? { ...this.dept } : null,
      loading: false,
    };
  },
  computed: {
    // 是否时新创建部门
    isCreate() {
      return !this.model?.id;
    },
  },
  watch: {
    dept(nv) {
      this.model = nv ? { ...nv } : null;
    },
  },
  methods: {
    handleCancelEdit() {
      this.$refs.form.reset();
      this.edit = false;
      this.model = { ...this.dept };
    },
    async handleSave() {
      const model = await this.$refs.form.getModel();
      if (model) {
        try {
          this.loading = true;
          await this.$restful(`save:/sys/depts`, { ...model });
          this.$message.success('保存成功。');
          this.$emit('on-save');
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
<style lang="less" scoped>
.toolbar {
  margin-left: 100px;
}

@{deep} .app-detail-item {
  margin-bottom: 1rem;
  .label {
    width: 100px !important;
    text-align: right !important;
  }
}
</style>
