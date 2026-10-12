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
    a-form-model-item(label='合同名称', prop='name')
     a-input(v-model="model.name" placeholder="请输入合同名称")
    a-form-model-item(label="启用状态" prop="enabled")
      a-radio-group(v-model="model.enabled")
        a-radio(:value="1") 启用
        a-radio(:value="0") 禁用
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
      title: '添加合同',
      list: [
        {
          name: '存在',
          value: 'true',
        },
        {
          name: '不存在',
          value: 'false',
        },
      ],
      model: {
        projectId: null,
        id: null,
        name: null,
        enabled: null,
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        enabled: [{ required: true, message: '必填项' }],
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
  created() {},
  methods: {
    show(model) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = model?.id ? '编辑合同' : '添加合同';
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
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(`POST:/project-merchant/wholesaler-contract-type`, {
          ...this.model,
          projectId: this.project.id,
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
