<template>
  <div class="suspend-layout flex-column">
    <div class="suspend-layout-content">
      <a-form :labelCol="{ span: 3 }">
        <a-form-item label="预计处理时间">
          <a-date-picker
            v-model:value="form.estimatedProcessTime"
            value-format="YYYY-MM-DD"
            :getCalendarContainer="(triggerNode) => triggerNode.parentNode"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="挂起原因">
          <a-textarea
            :maxlength="150"
            :rows="4"
            v-model:value="form.remark"
            placeholder="请输入挂起原因,最多150字"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="图片">
          <g-upload
            ref="upLoad"
            :max="3"
            businessKey="alarm"
            @changeFile="changeFile"
          ></g-upload>
        </a-form-item>
      </a-form>
    </div>
    <div class="suspend-layout-footer">
      <a-button class="cancel" @click="cancel">取消</a-button>
      <a-button class="confirm" @click="handleOk">确定</a-button>
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
} from "vue";
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
    const state = reactive({
      form: {
        estimatedProcessTime: "",
        remark: "",
        fileVOS: [],
      },
    });
    const changeFile = () => {
      const fileList = upLoad.value.fileList;
      state.form.fileVOS = fileList.map((item) => {
        return item.response.data;
      });
    };
    const handleOk = () => {
      proxy.$api
        .alarmHandelSuspend({ ...state.form, id: props.id })
        .then((res) => {
          proxy.$message.success("提交成功");
          cancel();
        });
    };
    const cancel = () => {
      emit("closeModal");
      state.form = {
        estimatedProcessTime: "",
        remark: "",
        fileVOS: [],
      };
    };
    return {
      ...toRefs(state),
      upLoad,
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
.suspend-layout {
  .ant-form-item-label > label {
    color: rgba(255, 255, 255, 0.8);
  }
  .ant-input {
    background: transparent;
    border: 1px solid #374870;
    color: #ffffff;
  }
  .ant-calendar-picker:hover
    .ant-calendar-picker-input:not(.ant-input-disabled) {
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
