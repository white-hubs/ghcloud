<template lang="pug">
app-modal(title="数据字典" v-model="visible" :width="500" @cancel="close")
  app-form(:model="model" :rules="rules" ref="form" oneline)
    a-form-model-item(label="父项" prop="pid")
      resource-select(v-model="model.pid" ref="deptSelect")
    a-form-model-item(label="编码" prop="code")
      a-input(v-model="model.code" :disabled="!!model.id" :maxlength="20")
    a-form-model-item(label="名称" prop="name")
      a-input(v-model="model.name" :maxlength="50")
    a-form-model-item(label="类型" prop="type")
      app-enum-select(code="ResourceType" v-model="model.type" )
    a-form-model-item(label="启用" prop="enabled")
      a-switch(v-model="model.enabled")
    template(v-if="model.type==='MENU'")
      a-form-model-item(label="链接" prop="path")
        a-input(v-model="model.path")
      a-form-model-item(label="图标" prop="icon")
        a-input(v-model="model.icon")
  template(#footer)
    a-button(:disabled="!!loading" :loading="loading==='process'" @click="handleSubmit(true)") 保存并继续
    a-button.ml2(:disabled="!!loading" type="primary" :loading="loading==='save'" @click="handleSubmit(false)")  确定
</template>
<script>
import { buildDefaults, buildFormRules } from '@/services/ModelService';
import ResourceSelect from './Select';
export default {
  components: { ResourceSelect },
  data() {
    return {
      visible: false,
      loading: false,
      model: buildDefaults('Resource'),
      rules: buildFormRules('Resource'),
    };
  },
  methods: {
    show(model) {
      this.model = { ...buildDefaults('Resource'), ...model };
      this.visible = true;
      this.$refs.deptSelect?.reload?.();
    },

    async handleSubmit(proceed) {
      const valid = await this.$refs.form.validate();
      if (valid) {
        try {
          this.loading = proceed ? 'process' : 'save';
          await this.$restful(`save:/sys/resources`, {
            ...this.model,
            sort: 0,
          });
          this.$emit('on-save');
          this.$message.success('保存成功。');
          if (proceed) {
            this.resetFieldsForProceed();
          } else {
            this.close();
          }
        } finally {
          this.loading = false;
        }
      }
    },
    close() {
      this.visible = false;
      this.reset();
    },
    reset() {
      this.model = buildDefaults('Resource');
      this.$refs.form.resetFields();
    },
    resetFieldsForProceed() {
      this.model = {
        ...buildDefaults('Resource'),
        pid: this.model.pid,
        name: this.model.name,
        code: this.model.code,
        icon: this.model.icon,
        type: this.model.type,
      };
      this.$refs.form.resetFields();
    },
  },
};
</script>
