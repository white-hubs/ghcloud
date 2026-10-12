<template lang="pug">
app-modal(title="字典类别" v-model="visible" :width="500" @ok="handleSubmit" :confirm-loading="loading")
  app-form(:model="model" :rules="rules" ref="form")
    a-form-model-item(label="编码" prop="code")
      a-input(v-model="model.code" :maxlength="20")
    a-form-model-item(label="名称" prop="name")
      a-input(v-model="model.name" :maxlength="50")
</template>
<script>
const defaults = () => {
  return {
    code: null,
    name: null,
    sort: 0,
  };
};
export default {
  data() {
    return {
      visible: false,
      loading: false,
      model: defaults(),
      rules: {
        code: [
          {
            required: true,
            message: '必填项',
          },
        ],
        name: [
          {
            required: true,
            message: '必填项',
          },
        ],
      },
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
      this.model = model || defaults();
      this.visible = true;
    },
    reset() {
      this._defaults = null;
      this.model = defaults();
      this.$refs.form.resetFields();
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = true;
          await this.$restful(
            `${this._defaults ? 'put' : 'post'}:/sys/dict-types`,
            {
              ...this._defaults,
              ...this.model,
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
