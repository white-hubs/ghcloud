<template>
  <a-modal title="挂起" v-model:visible="visible" @ok="handleOk" @cancel="cancel">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" ref="modalFormRef" :model="form">
      <a-form-item label="预计处理时间" :name="['estimatedProcessTime']" :rules="[{ required: true }]">
        <a-date-picker show-time v-model:value="form.estimatedProcessTime" value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm" style="width: 100%" />
      </a-form-item>
      <a-form-item label="挂起原因">
        <a-textarea v-model:value="form.remark" placeholder="请输入挂起原因" allow-clear />
      </a-form-item>
      <a-form-item label="图片">
        <b-upload ref="upLoad" :max="3" :sceneCode="GLOBAL_SCENE_CODE.alarmRecordSuspend" businessKey="alarm"
          @changeFile="changeFile"></b-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import { defineComponent, reactive, ref, toRefs } from "vue";
import bUpload from "./bUpload.vue";
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
export default defineComponent({
  components: {
    bUpload,
  },
  setup(props, { emit }) {
    const modalFormRef = ref();
    const upLoad = ref();
    const state = reactive({
      visible: false,
      form: {
        estimatedProcessTime: "",
        remark: "",
        fileVOS: [],
      },
    });
    const handleOk = () => {
      emit("modal-save", state.form);
    };
    const cancel = () => {
      modalFormRef.value.resetFields();
      state.form = {
        estimatedProcessTime: "",
        remark: "",
        fileVOS: [],
      };
      upLoad.value.fileList = [];
      state.visible = false;
    };
    const changeFile = fileId => {
      const fileList = upLoad.value.fileList;
      state.form.fileVOS = fileList.map(item => {
        return item.response.data;
      });
    };
    return {
      ...toRefs(state),
      handleOk,
      cancel,
      GLOBAL_SCENE_CODE,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      changeFile,
      upLoad,
      modalFormRef,
    };
  },
});
</script>

<style></style>
