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
    a-form-model-item(label='评价标签', prop='name')
      a-input(v-model='model.name' :maxLength='20')
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
      title: '新增敏感词',
      model: {
        projectId: null,
        name: null,
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
      },
      isTransfer: false,
      showmore: false,
      descriptionList: [],
    };
  },
  computed: {
    // mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性
    // 获取并存储用户信息
    ...mapGetters({
      project: GETTER_PROJECT,
      user: GETTER_USER,
    }),
    params() {
      return { projectId: this.project?.id };
    },
    displayDescriptionList() {
      const data = this.descriptionList.slice(0, 4);
      return data;
    },
  },
  created() {},
  methods: {
    // 接收父组件传入的值model并填入输入框中,当对象键名重复时，后出现的覆盖先出现的
    show(model, isTransfer) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = model?.id ? '编辑敏感词' : '新增敏感词';
      this.visible = true;
      this.isTransfer = !!isTransfer;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        name: null,
      };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        // this.loading = true;
        this.$restful(`POST:/project-merchant/sensitive-word`, {
          ...this.model,
          projectId: this.project.id,
        })
          .then((res) => {
            this.$emit('modal-success', res, this.model.description);
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
