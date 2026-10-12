<template lang="pug">
app-modal(v-model="visible" :title="`${isEdit?'编辑':'新建'}角色`" :width="500" :confirm-loading="loading" @ok="handleSubmit")
  app-form(:model="model" :rules="rules" ref="form" oneline :labelWidth="90")
    a-form-model-item(label="角色名称" prop="name")
      a-input(v-model="model.name" :maxLength="30")
    a-form-model-item(label="启用" prop="enabled")
      a-switch(v-model="model.enabled")
    a-form-model-item(label="备注" prop="remark")
      app-textarea.w-full(v-model="model.remark" :maxLength="50")
</template>
<script>
import { buildDefaults, buildFormRules } from '@/services/ModelService';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  data() {
    return {
      visible: false,
      loading: false,
      model: buildDefaults('Role'),
      rules: buildFormRules('Role'),
    };
  },
  computed: {
    isEdit() {
      return !!this.model?.id;
    },
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  watch: {
    visible(nv) {
      if (!nv) {
        this.reset();
      }
    },
  },
  methods: {
    show(model) {
      this.visible = true;
      this.model.projectId = this.project.id;
      this.model = { ...this.model, ...model };
    },
    reset() {
      this.model = buildDefaults('Role');
      this.$nextTick(this.$refs.form.clearValidate);
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = true;
          await this.$restful('save:/sys/roles', this.model);
          this.$message.success('保存成功。');
          this.$emit('on-save');
          this.visible = false;
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
