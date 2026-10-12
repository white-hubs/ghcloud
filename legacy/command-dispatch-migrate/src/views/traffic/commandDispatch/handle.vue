<template>
  <div class="suspend-layout flex-column">
    <div class="suspend-layout-content">
      <a-form :labelCol="{ span: 4 }" :wrapper-col="wrapperCol" ref="modalFormRef" :validate-messages="validateMessages"
        :model="form">
        <a-form-item label="处理结果" name="alarmHandlerResult" :rules="[{ required: true, message: '请选择处理结果' }]">
          <a-select v-model:value="form.alarmHandlerResult" style="width: 100%" :options="options"></a-select>
        </a-form-item>
        <a-form-item label="报警原因" name="alarmReason" :rules="[{ required: true, message: '请选择报警原因' }]">
          <a-select show-search :filterOption="filterOption" @change="handleChangeReason"
            v-model:value="form.alarmReasonValue" style="width: 100%" :options="reasonOptions"></a-select>
        </a-form-item>
        <a-form-item label="描述信息">
          <a-textarea v-model:value="form.alarmHandlerResultRemark" placeholder="请输入描述信息" allow-clear />
        </a-form-item>
        <a-form-item label="图片" name="fileVOS" :rules="imageRules">
          <g-upload ref="upLoad" sceneCode="ALARM:RECORD_HANDLER" :watermark="watermark" :max="3" businessKey="alarm"
            @changeFile="changeFile"></g-upload>
        </a-form-item>
      </a-form>
    </div>
    <div class="suspend-layout-footer">
      <a-button class="cancel" @click="cancel">取消</a-button>
      <a-button class="confirm" @click="handleOk" :loading="confirmLoading">确定</a-button>
    </div>
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  getCurrentInstance,
  onMounted,
} from "vue";
import { getAlarmConfiguration } from '../../../api/dict'
export default defineComponent({
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const upLoad = ref(null);
    const modalFormRef = ref(null)
    const state = reactive({
      form: {
        alarmHandlerResult: "ALARM_ACTUAL",
        alarmHandlerResultRemark: "",
        alarmReasonValue: "",
        alarmReason: null,
        fileVOS: [],
      },
      confirmLoading: false,
      watermark: '',
      imageRules: [],
      reasonOptions: []
    });
    const filterOption = (value, option) => {
      return option.label.indexOf(value) > -1;
    }
    const validateMessages = {
      required: "${label} is required!",
    };
    const getAlarmReasonOptions = async () => {
      const res = await proxy.$api.getAlarmReasons();
      state.reasonOptions = res.map(item => {
        return {
          value: item.id,
          label: item.reason,
        };
      });
    }
    onMounted(() => {
      getAlarmReasonOptions()
      setConfig()
    })
    const setConfig = async () => {
      const result = await getAlarmConfiguration()
      state.imageRules = result.imageRules
      state.watermark = result.watermark
    }
    const handleChangeReason = (value) => {
      state.form.alarmReason = {
        id: value
      };
    }
    const changeFile = () => {
      const fileList = upLoad.value.fileList;
      state.form.fileVOS = fileList.map(item => {
        return item.response.data;
      });
      modalFormRef.value.validateFields('fileVOS')
    };
    const handleOk = async () => {
      await modalFormRef.value.validate();
      const params = {
        ...state.form
      }
      Reflect.deleteProperty(params, "alarmReasonValue");
      state.confirmLoading = true
      proxy.$api
        .alarmHandelResult({ ...state.form, id: props.id })
        .then(res => {
          proxy.$emitter.emit('refreshAlarmList')
          proxy.$message.success("提交成功");
          cancel();
        }).finally(() => {
          state.confirmLoading = false
        });
    };
    const cancel = () => {
      emit("close");
      state.form = {
        estimatedProcessTime: "",
        remark: "",
        fileVOS: [],
      };
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
      options,
      handleChangeReason,
      ...toRefs(state),
      upLoad,
      modalFormRef,
      validateMessages,
      filterOption,
      changeFile,
      handleOk,
      cancel,
    };
  },
});
</script>

<style lang="less" scoped>
.suspend-layout {
  height: 100%;

  &-content {
    margin-top: 16px;
    height: calc(100% - 80px);
  }

  &-footer {
    width: 100%;
    height: 64px;
    text-align: right;
    line-height: 64px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    .cancel {
      background: #ffffff;
      color: #000000;
      border-color: rgb(255, 255, 255);
    }

    .confirm {
      margin-left: 16px;
      background: rgba(41, 137, 255, 1);
      border-color: rgba(41, 137, 255, 1);
      color: #ffffff;
    }
  }
}
</style>
<style lang="less">
.suspend-layout .ant-form-item-has-error .ant-select:not(.ant-select-disabled):not(.ant-select-customize-input) .ant-select-selector {
  background-color: #374870;
  border: 1px solid #2989ff;
}

.suspend-layout {
  .ant-form-item-label>label {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .ant-input {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }

  .ant-calendar-picker:hover .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: 1px solid #374870;
  }

  .ant-input-affix-wrapper {
    background-color: transparent;
    border: 1px solid #374870;
  }

  .ant-upload.ant-upload-select-picture-card {
    background-color: transparent;
    border: 1px solid #374870;
  }

  .ant-upload {
    color: rgba(255, 255, 255, 0.2);
  }

  .ant-calendar {
    background-color: #374870;
    border: 1px solid #2989ff;
  }

  .ant-calendar-input {
    background: transparent;
    border: solid 1px #2989ff;
  }

  .ant-calendar-header .ant-calendar-prev-year-btn {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-header a:hover {
    color: #ffffff;
  }

  .ant-calendar-header .ant-calendar-year-select {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-picker-container {
    color: #ffffff;
  }

  .ant-calendar-date {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-calendar-last-month-cell .ant-calendar-date,
  .ant-calendar-next-month-btn-day .ant-calendar-date {
    color: rgba(255, 255, 255, 0.4);
  }
}
</style>
