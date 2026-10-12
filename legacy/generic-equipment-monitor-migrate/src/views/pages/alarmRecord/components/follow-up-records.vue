<template>
  <a-modal v-model:visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="cancel">
    <template #title>
      <div class="custom-title">
        <span> 跟进记录</span>
        <span class="tips">
          <ExclamationCircleFilled />
          <span>用于处理中时随时上传处理记录，工作留痕</span>
        </span>
      </div>
    </template>
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" ref="modalFormRef" :model="form">
      <a-form-item label="跟进记录信息" name="content" :rules="[{ required: true, message: '请录入跟进记录信息' }]">
        <a-textarea v-model:value="form.content" placeholder="请录入跟进记录信息" allow-clear />
      </a-form-item>
      <a-form-item label="图片">
        <b-upload ref="upLoad" :sceneCode="GLOBAL_SCENE_CODE.alarmRecordFollowUp" :max="3" businessKey="alarm"
          @changeFile="changeFile"></b-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs } from "vue";
import bUpload from "./bUpload.vue";
import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  props: {
    confirmLoading: {
      type: Boolean,
      default: false
    }
  },
  components: {
    bUpload,
    ExclamationCircleFilled
  },
  setup(props, { emit }) {
    const modalFormRef = ref();
    const upLoad = ref();
    const state = reactive({
      visible: false,
      form: {
        content: "",
        files: [],
      },
    });
    const handleOk = () => {
      modalFormRef.value.validate().then(() => {
        emit("modal-save", state.form);
      });
    };
    const cancel = () => {
      modalFormRef.value.resetFields();
      state.form = {
        estimatedProcessTime: "",
        remark: "",
        files: [],
      };
      upLoad.value.fileList = [];
      state.visible = false;
    };
    const changeFile = fileId => {
      const fileList = upLoad.value.fileList;
      state.form.files = fileList.map(item => {
        return item.response.data;
      });
    };
    return {
      ...toRefs(state),
      handleOk,
      cancel,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      changeFile,
      upLoad,
      modalFormRef,
      GLOBAL_SCENE_CODE
    };
  },
});
</script>

<style lang="less" scoped>
.custom-title {
  display: flex;
  align-items: flex-end;

  .tips {
    font-size: 12px;
    margin-left: 5px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>
