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
    a-form-model-item(label='巡检标准', prop='standardId')
      app-remote-select(
        v-model='model.standardId',
        api='/maintain/inspect-standard/page',
        :params='{ pageNumber: 1, pageSize: 9999 }',
        allow-clear,
        placeholder='请选择',
        @change='handleStandardChange'
      )
    a-form-model-item(label='巡检项', prop='itemId')
      a-select(
        @change='handleItemChange',
        placeholder='请选择',
        allowClear,
        v-model='model.itemId'
      )
        a-select-option(
          v-for='item in itemDTOS',
          :key='item.name',
          :value='item.id'
        ) {{ item.name }}
    a-form-model-item(label='结果选项', prop='itemResultCode')
      a-select(
        @change='handleItemResultChange',
        placeholder='请选择',
        allowClear,
        v-model='model.itemResultCode'
      )
        a-select-option(
          v-for='(item, index) in itemResult',
          :key='item.itemValue',
          :value='item.itemValue'
        ) {{ item.itemName }}
    a-form-model-item(label='扣减分值', prop='itemResultMark') 
      a-input(
        v-model='model.itemResultMark',
        type='number',
        placeholder='请输入扣减分值',
        step='1',
        min='0',
        max='99'
      )
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
      itemDTOS: [],
      itemResult: [],
      model: {
        projectId: null,
        standardId: null,
        standardName: null,
        itemId: null,
        itemName: null,
        itemResultCode: null,
        itemResultName: null,
        itemResultMark: null,
        enabled: false,
      },
      rules: {
        standardId: [{ required: true, message: '必填项' }],
        itemId: [{ required: true, message: '必填项' }],
        itemResultCode: [{ required: true, message: '必填项' }],
        itemResultMark: [{ required: true, message: '必填项' }],
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
      if (this.model.standardId)
        this.getFireinspStandard(this.model.standardId);
      this.title = model?.id ? '编辑评价配置' : '添加评价配置';
      this.visible = true;
      this.isTransfer = !!isTransfer;
    },
    hide() {
      this.visible = false;
      this.$refs.form.resetFields();
      this.model = {
        projectId: null,
        standardId: null,
        standardName: null,
        itemId: null,
        itemName: null,
        itemResultCode: null,
        itemResultName: null,
        itemResultMark: null,
        enabled: false,
      };
    },
    // 标准改变
    handleStandardChange(v, option) {
      this.model.standardName = option.data.key;
      this.model.standardId = v;
      this.model.itemId = '';
      this.model.itemResultCode = '';
      // 巡检项
      this.getFireinspStandard(this.model.standardId);
    },
    // 巡检项
    handleItemChange(id, option) {
      this.model.itemName = option.data.key;
      this.model.itemResultCode = '';
      const checkedItem = this.itemDTOS.find(item => item.id === id)
      const checkedId = checkedItem ? checkedItem.resultId :"";
      if(!checkedId) return this.$message.error('当前选项数据错误,请联系管理员')
       this.$restful(`/maintain/inspect-result/${checkedId}/options`).then((res) => {
        this.itemResult = res
      })


      // if (this.itemDTOS && this.itemDTOS.length) {
      //   let result = this.itemDTOS.find((item) => item.id === v);
      //   this.itemResult = JSON.parse(result.config);
      // }
    },
    // 结果选项
    handleItemResultChange(v, option) {
      this.model.itemResultName = option.data.key;
    },
    // 获取巡检项
    getFireinspStandard(standardId) {
      this.$restful(`/maintain/inspect-standard/${standardId}`).then((res) => {
        // const data = res.itemDTOS;
        this.itemDTOS = res.standardItems
        // this.itemDTOS = data.filter(
        //   (item) =>
        //     item.resultType === 'inspItemType_radio' && 'inspItemType_checkbox',
        // );
        // if (this.itemDTOS && this.itemDTOS.length) {
        //   let result = this.itemDTOS.find(
        //     (item) => item.id === this.model.itemId,
        //   );
        //   this.itemResult = JSON.parse(result.config);
        // }
      });
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
        this.$restful(`save:/project-merchant/fireinsp-item-evaluation`, {
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
    //
    handleAppealTypeChange() {
      this.getDescriptionList();
    },
    getDescriptionList() {
      this.$restful(`GET:/project-merchant/appeal-description/list`, {
        type: this.model.type,
        projectId: this.project?.id,
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
