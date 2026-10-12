<template>
  <a-modal title="处理" v-model:visible="visible" @ok="handleOk" @cancel="cancel">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" ref="modalFormRef" :validate-messages="validateMessages"
      :model="form">
      <a-form-item label="处理结果" name="alarmHandlerResult" :rules="[{ required: true, message: '请选择处理结果' }]">
        <a-select v-model:value="form.alarmHandlerResult" style="width: 100%" :options="options"></a-select>
      </a-form-item>
      <a-form-item label="描述信息">
        <a-textarea v-model:value="form.alarmHandlerResultRemark" placeholder="请输入描述信息" allow-clear />
      </a-form-item>
      <a-form-item label="图片">
        <b-upload ref="upLoad" :max="3" businessKey="alarm" :sceneCode="GLOBAL_SCENE_CODE.alarmRecordHandler"
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
        alarmHandlerResult: "ALARM_IMPRACTICAL",
        alarmHandlerResultRemark: "",
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
    const validateMessages = {
      required: "${label} is required!",
    };
    const options = [
      {
        value: "ALARM_ACTUAL",
        label: "实报",
      },
      {
        value: "ALARM_IMPRACTICAL",
        label: "误报",
      },
    ];
    return {
      ...toRefs(state),
      handleOk,
      cancel,
      GLOBAL_SCENE_CODE,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      changeFile,
      validateMessages,
      upLoad,
      options,
      modalFormRef,
    };
  },
});
</script>

<style></style>
