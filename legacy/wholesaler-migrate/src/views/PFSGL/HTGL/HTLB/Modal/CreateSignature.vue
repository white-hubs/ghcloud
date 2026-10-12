<template lang="pug">
app-modal(
  v-model='visible',
  :title='title',
  :width='500',
  :confirm-loading='loading',
  @ok='handleSubmit',
  @cancel='hide'
)
  app-form(
    :model='model',
    :rules='rules',
    ref='form',
    oneline,
    :labelWidth='90'
  )
    a-form-model-item(label='电子章')
      app-imgs-display(:files="model.fileDtos||[]")
    a-form-model-item(label="签约人" prop="signatoryId")
      a-select(
        @change="e=>changeSignatory(e,model.signatoryList)"
        placeholder='请选择',
        allowClear,
        v-model='model.signatoryId')
        a-select-option(
        v-for='(item, index) in model.signatoryList',
        :key='item.id',
        :value='item.id'
          ) {{ item.name }}
      
</template>

<script>
import { GETTER_PROJECT, GETTER_USER } from '@store/account';
import { mapGetters } from 'vuex';

export default {
  components: {},
  data() {
    return {
      visible: false,
      loading: false,
      title: '签章',
      model: {
        projectId: null,
        id: null,
        signatoryName: null,
        signatoryId: null,
        fileDTOS: [],
      },
      rules: {
        signatoryId: [{ required: true, message: '必填项' }],
      },
      isTransfer: false,
      showmore: false,
      descriptionList: [],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return { projectId: this.project.id };
    },
    displayDescriptionList() {
      const data = this.descriptionList.slice(0, 4);
      return data;
    },
  },
  created() {
    this.getFirstPart();
  },
  methods: {
    getFirstPart() {},
    show(model) {
      this.$restful(`/project-merchant/wholesaler-first-part/${this.project.id}`).then(
        (res) => {
          this.model = {
            ...res,
            ...model,
            signatoryId: null,
            signatoryName: null,
            fileDTOS: [],
          };
        },
      );
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        id: null,
        name: null,
        enabled: null,
      };
    },
    changeSignatory(e, data) {
      this.model.signatoryName = data?.find((item) => item.id === e).name;
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(`GET:/project-merchant/wholesaler-contract/first-part/confirm`, {
          projectId: this.project.id,
          signatoryName: this.model.signatoryName,
          signatoryId: this.model.signatoryId,
          contractId: this.model.id,
        })
          .then((res) => {
            this.$emit('modal-success', res);
            this.$message.success('保存成功!');
            this.hide();
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-item {
  padding-left: 90px;
  margin: -10px 0 16px 0;
}
</style>
