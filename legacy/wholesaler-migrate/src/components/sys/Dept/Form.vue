<template lang="pug">
  app-form(:model="model" :rules="rules" oneline :labelWidth="100" ref="form")
    a-form-model-item(label="名称" prop="name")
      a-input(v-model="model.name" :maxLength="30")
    a-form-model-item(label="负责人" prop="managerId")
      app-user-select(v-model="model.managerId" :disabled="!isEdit" :parameter="requestParameter")
    a-form-model-item(label="分管领导" prop="leaderId")
      app-user-select(v-model="model.leaderId" :disabled="!isEdit")
    a-form-model-item(label="备注" prop="remark")
      app-textarea.w-full(v-model="model.remark" :maxLength="100")
</template>
<script>
import { buildFormRules } from '@/services/ModelService';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      rules: buildFormRules('Dept'),
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    isEdit() {
      return !!this.model.id;
    },
    requestParameter() {
      let requestParams = {
        projectId: this.project.id,
        deptId: this.model.id,
      };
      return requestParams;
    },
  },
  methods: {
    reset() {
      this.$refs.form.clearValidate();
    },
    async getModel() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        return this.model;
      }
      return null;
    },
  },
};
</script>
