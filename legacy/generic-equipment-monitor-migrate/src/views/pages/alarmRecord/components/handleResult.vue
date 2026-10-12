<template>
  <a-modal
    :title="batchMode ? '批量处理' : '处理'"
    :confirm-loading="confirmLoading"
    v-model:visible="visible"
    @ok="handleOk"
    @cancel="cancel"
  >
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" ref="modalFormRef" :validate-messages="validateMessages" :model="form">
      <a-form-item label="处理结果" name="alarmHandlerResult" :rules="[{ required: true, message: '请选择处理结果' }]">
        <a-select v-model:value="form.alarmHandlerResult" style="width: 100%" :options="options"></a-select>
      </a-form-item>
      <a-form-item v-if="!batchMode" label="报警原因" name="alarmReasonValue" :rules="[{ required: true, message: '请选择报警原因' }]">
        <a-select
          @change="handleReasonChange"
          v-model:value="form.alarmReasonValue"
          style="width: 100%"
          :options="reasonOptions"
          showSearch
          :filterOption="filterOption"
          @search="handleSearch"
        >
          <template #notFoundContent>
            <a-empty>
              <template #description>
                暂无数据
                <div v-if="searchText" style="margin-top: -10px; cursor: pointer" @mousedown="(e) => e.preventDefault()" @click="addItem">
                  <br />
                  <a>添加 {{ searchText }}</a>
                </div>
              </template>
            </a-empty>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="描述信息">
        <a-textarea
          v-model:value="form.alarmHandlerResultRemark"
          placeholder="请输入描述信息"
          :maxlength="batchMode ? 200 : undefined"
          :show-count="batchMode"
          allow-clear
        />
      </a-form-item>
      <a-form-item v-if="!batchMode" label="图片" name="fileVOS" :rules="imageRules">
        <b-upload
          ref="upLoad"
          :sceneCode="GLOBAL_SCENE_CODE.alarmRecordHandler"
          :watermark="watermark"
          :max="3"
          businessKey="alarm"
          @changeFile="changeFile"
        ></b-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="jsx">
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent, reactive, ref, toRefs, onMounted } from "vue";

import { GLOBAL_SCENE_CODE } from "@ghcloud/cube-file-service";

import bUpload from "./bUpload.vue";
import { cubeAlarmCenterService, cubeDictionaryService } from "@/api/service";
import { getCurrentAddress } from "@/utils/initMapPlugins";
const dictCodeSuffix = "_ALARM_HANDLER_SUBMIT_CONFIG";
const code = "uploadPicConfig";
import { PlusOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  props: {
    confirmLoading: {
      type: Boolean,
      default: false,
    },
    // 必传参数
    applicationCode: {
      type: String,
      required: true,
    },
    batchMode: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    bUpload,
    VNodes: (_, { attrs }) => {
      return attrs.vnodes;
    },
  },
  setup(props, { emit }) {
    const modalFormRef = ref();
    const upLoad = ref();
    const addItem = () => {
      const label = state.searchText;
      if (!label) return;
      const value = new Date().getTime();
      state.reasonOptions.push({
        label: label,
        value: value,
        isNew: true,
      });
      state.form.alarmReasonValue = value;
    };
    const state = reactive({
      visible: false,
      watermark: "",
      searchText: "",
      form: {
        alarmHandlerResult: "ALARM_IMPRACTICAL",
        alarmHandlerResultRemark: "",
        alarmReasonValue: "",
        alarmReason: null,
        fileVOS: [],
      },
      imageRules: [],
      reasonOptions: [],
    });
    const handleOk = async () => {
      await modalFormRef.value.validate();
      if (props.batchMode) {
        emit("modal-save", {
          alarmHandlerResult: state.form.alarmHandlerResult,
          alarmHandlerResultRemark: state.form.alarmHandlerResultRemark,
        });
        return;
      }
      const params = {
        ...state.form,
      };
      Reflect.deleteProperty(params, "alarmReasonValue");
      if (typeof state.form.alarmReasonValue === "number") {
        const data = state.reasonOptions.find((item) => item.value === state.form.alarmReasonValue);
        if (data.isNew) {
          Reflect.set(params, "alarmReason", { reason: data.label });
        } else {
          Reflect.set(params, "alarmReason", { id: state.form.alarmReasonValue });
        }
        Reflect.deleteProperty(params, "alarmReasonName");
      } else {
        Reflect.set(params, "alarmReasonName", state.form.alarmReasonValue);
        Reflect.set(params, "alarmReason", null);
      }
      emit("modal-save", params);
      setTimeout(() => {
        getReasonOptions();
      }, 500);
    };
    const cancel = () => {
      modalFormRef.value.resetFields();
      state.form = {
        alarmHandlerResult: "ALARM_IMPRACTICAL",
        alarmHandlerResultRemark: "",
        alarmReasonValue: "",
        fileVOS: [],
        alarmReason: null,
      };
      if (upLoad.value) upLoad.value.fileList = [];
      state.visible = false;
    };
    const changeFile = (fileId) => {
      const fileList = upLoad.value.fileList;
      state.form.fileVOS = fileList.map((item) => {
        return item.response.data;
      });
      modalFormRef.value.validateFields(["fileVOS"]);
    };
    const getReasonOptions = async () => {
      const result = await cubeAlarmCenterService.getAlarmReasons();
      state.reasonOptions = result.map((item) => {
        return {
          label: item.reason,
          value: item.id,
          isNew: false,
        };
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
    const handleSearch = (value) => {
      state.searchText = value;
    };
    const filterOption = (value, option) => {
      return option.label.indexOf(value) > -1;
    };
    const handleReasonChange = (value) => {
      if (typeof value === "number") {
        state.form.alarmReason = {
          id: value,
        };
        state.form.alarmReasonName = null;
      } else {
        state.form.alarmReason = null;
        state.form.alarmReasonName = value;
      }
    };
    const itemCode = props.applicationCode + dictCodeSuffix;
    const getHandleConfig = async () => {
      const result = await cubeDictionaryService.getDictionaryByItem({
        itemCode: itemCode,
        code,
      });
      if (!result) return;
      if (!result.length) return;
      const variable = JSON.parse(result[0].variable);
      if (variable.requirePic) {
        state.imageRules.push({
          required: true,
          message: "请上传图片",
        });
      } else {
        state.imageRules = [];
      }
      const watermarkConfig = variable.watermark;
      if (watermarkConfig.includes("location")) {
        try {
          state.watermark = (await getCurrentAddress()).address;
        } catch (error) {}
      }
      if (watermarkConfig.includes("timestamp")) {
        state.watermark = state.watermark
          ? `${state.watermark} ${dayjs().format("YYYY-MM-DD HH:mm:ss")}`
          : dayjs().format("YYYY-MM-DD HH:mm:ss");
      }
    };
    onMounted(() => {
      getReasonOptions();
      getHandleConfig();
    });
    return {
      ...toRefs(state),
      filterOption,
      GLOBAL_SCENE_CODE,
      handleReasonChange,
      handleOk,
      cancel,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      changeFile,
      validateMessages,
      upLoad,
      options,
      modalFormRef,
      addItem,
      handleSearch,
    };
  },
});
</script>

<style></style>
