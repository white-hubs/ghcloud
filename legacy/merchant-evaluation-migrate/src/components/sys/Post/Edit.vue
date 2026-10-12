<template lang="pug">
app-modal(v-model="visible" 
  width="40rem" 
  :title="`${creating?'新建':'编辑'}岗位`" 
  :confirm-loading="loading"
  @ok="handleSubmit"
  @cancel="close")
  app-form(:model="model" :rules="rules" ref="form")
    a-form-model-item(label="岗位名称" prop="name")
      a-input(v-model="model.name" :maxLength="30")
    a-form-model-item(label="岗位编码" prop="code")
      a-input(v-model="model.code" :maxLength="30")
</template>
<script>
import { buildDefaults, buildFormRules } from '@/services/ModelService';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      model: buildDefaults('Post'),
      rules: buildFormRules('Post'),
      loading: false,
      visible: false,
    };
  },
  computed: {
    creating() {
      return !this.model.id;
    },
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  methods: {
    show(model) {
      this.visible = true;
      this.model.projectId = this.project.id;
      this.model = { ...this.model, ...model };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = true;
          await this.$restful(`save:/sys/posts`, this.model);
          this.$message.success('保存成功。');
          this.$emit('on-save');
          this.close();
        } finally {
          this.loading = false;
        }
      }
    },
    close() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = buildDefaults('Post');
    },
  },
};
</script>
