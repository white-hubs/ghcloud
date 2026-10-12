<template>
  <a-modal title="禁用规则" :confirm-loading="confirmLoading" v-model:visible="visible" @ok="handleOk" @cancel="cancel" width="680px">
    <a-form :label-col="labelCol" ref="modalFormRef" :model="form">
      <a-form-item label="禁用时长">
        <a-input-number v-model:value="form.disableDuration" :min="0" :max="999" :precision="0" placeholder="请输入禁用时长（若未设置禁用时长，将默认永久禁用）" allow-clear style="width: 380px;" />
        <span style="margin-left: 8px;">小时</span>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs, onMounted, computed, getCurrentInstance } from "vue";
export default defineComponent({
  setup(props, { emit, expose }) {
    const { proxy } = getCurrentInstance();
    const modalFormRef = ref();
    const state = reactive({
      visible: false,
      confirmLoading: false,
      detail: {},
      form: {
        disableDuration: null,
      },
    });
    const handleOk = async () => {
      await modalFormRef.value.validate()
      try {
        state.confirmLoading = true;
        await proxy.$api.enabledPlanRules({
          id: state.detail.id,
          enabled: false,
          disableDuration: state.form.disableDuration
        })
        proxy.$message.success("操作成功！");
      } catch (error) {
      } finally {
        state.confirmLoading = false;
        cancel()
        emit('ok')
      }
    };
    const cancel = () => {
      modalFormRef.value.resetFields();
      state.form = {
        disableDuration: null
      };
      state.visible = false;
    };
    const openModal = (record) => {
      state.visible = true;
      state.detail = record;
    }
    expose({
      openModal
    })
    return {
      ...toRefs(state),
      handleOk,
      cancel,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      modalFormRef,
    };
  },
});
</script>

<style></style>
