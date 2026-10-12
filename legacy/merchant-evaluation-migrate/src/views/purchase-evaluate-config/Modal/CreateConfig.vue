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
    a-form-model-item(label='评价标签', prop='tag')
      a-input(v-model='model.tag', :maxLength='6')
    a-form-model-item(label='所属维度', prop='evaluation')
      a-select(placeholder='请选择', allowClear, v-model='model.evaluation')
        a-select-option(
          v-for='item in itemDTOS',
          :key='item.code',
          :value='item.code'
        ) {{ item.name }}
    a-form-model-item(label='评价分类', prop='category')
      a-select(placeholder='请选择', allowClear, v-model='model.category')
        a-select-option(
          v-for='item in categorysOptions',
          :key='item.code',
          :value='item.code'
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
      title: '添加评价配置',
      itemDTOS: [
        { code: '1', name: '商品质量' },
        { code: '2', name: '诚实守信' },
        { code: '3', name: '环境卫生' },
        { code: '4', name: '服务态度' },
      ],
      categorysOptions: [],
      model: {
        projectId: null,
        tag: null,
        category: null,
        evaluation: null,
      },
      rules: {
        tag: [{ required: true, message: '必填项' }],
        evaluation: [{ required: true, message: '必填项' }],
        category: [{ required: true, message: '必填项' }],
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
      return { projectId: this.project.id };
    },
    displayDescriptionList() {
      const data = this.descriptionList.slice(0, 4);
      return data;
    },
  },
  created() {
    this.getCategorys()
  },
  methods: {
    // 接收父组件传入的值model并填入输入框中,当对象键名重复时，后出现的覆盖先出现的
    show(model, isTransfer) {
      this.model = {
        ...this.model,
        ...model,
      };
      this.title = model?.id ? '编辑评价规则' : '添加评价规则';
      this.visible = true;
      this.isTransfer = !!isTransfer;
    },
    getCategorys() {
      this.$restful(`GET:/dictionary/getDataDictionaryByItem?itemCode=project-merchant-evaluate_level&name=&code=`, {}).then(res => {
        this.categorysOptions=[...res]
      })
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        tag: null,
        type: null,
      };
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        // this.loading = true;
        this.$restful(`POST:/project-merchant/stall-evaluation-tag`, {
          ...this.model,
          projectId: this.project?.id,
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
