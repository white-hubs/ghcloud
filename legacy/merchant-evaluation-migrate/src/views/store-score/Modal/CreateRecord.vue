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
    a-form-model-item(label='类型', prop='type')
      app-dict-select(
        v-model='model.type',
        code='appealType',
        placeholder='请选择'
        @change="handleAppealTypeChange"
      )
    a-form-model-item(label='分值', prop='score')
      a-input(v-model='model.score' placeholder="请输入分值")
    a-form-model-item(label='备注', prop='contactPhone') 
      app-textarea.w-full(v-model="model.remark" :maxLength="50")
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
      title: '创建诉求',
      model: {
        name: null,
        type: null,
        description: null,
        urgent: false, // 是否加急
        startUserId: null,
        contactPerson: null,
        contactPhone: null,
        areaIds: null,
        deviceIds: [],
        devices: [],
        fileIds: [],
        fileDTOS: [],
      },
      rules: {
        name: [{ required: true, message: '必填项' }],
        type: [{ required: true, message: '必填项' }],
        sourceType: [{ required: true, message: '必填项' }],
        description: [
          { required: true, message: '必填项' },
          {
            pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5_~！@#￥%……&*（）——{}？。，》《':]+$/,
            message: '不能输入空格',
          },
        ],
        contactPerson: [{ required: true, message: '必填项' }],
        contactPhone: [{ required: true, message: '必填项' }],
        areaIds: [{ required: true, message: '必填项' }],
        // deviceIds: [{ required: true, message: '必填项' }],
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
    this.getDescriptionList();
  },
  methods: {
    // 接收父组件传入的值model并填入输入框中,当对象键名重复时，后出现的覆盖先出现的
    show(model, isTransfer) {
      this.model = {
        ...this.model,
        ...model,
      };

      this.title = model?.id ? '编辑诉求' : '添加';
      this.visible = true;
      this.isTransfer = !!isTransfer;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        id: null,
        type: null,
        description: null,
        urgent: false, // 是否加急
        startUserId: null,
        contactPerson: null,
        contactPhone: null,
        areaIds: null,
        areaNames: [],
        deviceIds: [],
        devices: [],
        fileIds: [],
        fileDTOS: [],
      };
    },
    handleSelectionChange(selection) {
      // debugger;
      this.model.devices = selection.map(({ id, type }) => {
        return { id, type };
      });
    },
    async handleSubmit() {
      const valid = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;
        this.$restful(`save:/project-merchant/appeals`, {
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
    //
    handleAppealTypeChange() {
      this.getDescriptionList();
    },
    getDescriptionList() {
      this.$restful(`GET:/project-merchant/appeal-description/list`, {
        type: this.model.type,
        projectId: this.project.id,
      }).then((res) => {
        this.descriptionList = res || [];
      });
    },
    handleDescription(item) {
      this.model.description =
        `#${item.name}#` + (this.model.description || '');
    },
    isSelected(item) {
      return (this.model.description || '').includes(`#${item.name}#`);
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
