<template lang="pug">
app-modal(title="数据字典" v-model="visible" :width="500" @ok="handleSubmit" :confirm-loading="loading")
  app-form(:model="model" :rules="rules" ref="form")
    a-form-model-item(label="父项" prop="parentCode")
      app-dict-select(:code="typeCode" v-model="model.parentCode" ref="select")
    a-form-model-item(label="编码" prop="code")
      a-input(v-model="model.code" :disabled="_defaults" :maxlength="20")
    a-form-model-item(label="名称" prop="name")
      a-input(v-model="model.name" :maxlength="50")
</template>
<script>
import { buildDefaults, buildFormRules } from '@/services/ModelService';
export default {
  props: {
    typeCode: String,
  },
  data() {
    return {
      visible: false,
      loading: false,
      model: buildDefaults('DictData'),
      rules: buildFormRules('DictData'),
    };
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
      this._defaults = model;
      this.model = model || buildDefaults('DictData');
      this.visible = true;

      this.$refs.select.reload();
    },
    reset() {
      this._defaults = null;
      this.model = buildDefaults('DictData');
      this.$refs.form.resetFields();
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = true;
          await this.$restful(
            `${this._defaults ? 'put' : 'post'}:/sys/dict-datas`,
            {
              ...this._defaults,
              ...this.model,
              typeCode: this.typeCode,
              parentCode: this.model.parentCode || '',
            },
          );
          this.$emit('on-save');
          this.$message.success('保存成功。');
          this.reset();
          this.visible = false;
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
