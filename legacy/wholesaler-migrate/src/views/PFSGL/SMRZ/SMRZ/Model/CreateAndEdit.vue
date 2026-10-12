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
    a-form-model-item(label='驳回理由', prop='rejectReason')
      a-textarea(v-model="model.rejectReason" placeholder="请输入驳回理由")
  
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
      title: '驳回合同',
      model: {
        projectId: null,
        id: null,
        rejectReason: null,
      },
      rules: {
        rejectReason: [{ required: true, message: '必填项' }],
      },
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
  },
  created() {},
  methods: {
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.visible = true;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        id: null,
        rejectReason: null,
      };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(
          `PUT:/project-merchant/wholesaler/reject/${this.model.id}?rejectReason=${this.model.rejectReason}`,
          // {
          //   rejectReason: this.model.rejectReason,
          //   // id: this.model.id,
          //   // projectId: this.project.id,
          // },
        )
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
