<template>
  <div class="suspend-layout flex-column">
    <div class="suspend-layout-content">
      <a-form :labelCol="{ span: 5 }">
        <a-form-item label="预计处理时间">
          <a-date-picker
            v-model:value="form.estimatedProcessTime"
            value-format="YYYY-MM-DD"
            :getCalendarContainer="(triggerNode) => triggerNode.parentNode"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="挂起原因">
          <a-textarea :maxlength="150" v-model:value="form.remark" placeholder="请输入挂起原因,最多150字" allow-clear />
        </a-form-item>
        <a-form-item label="图片">
          <g-upload ref="upLoad" sceneCode="ALARM:RECORD_SUSPEND" :max="3" businessKey="alarm" @changeFile="changeFile"></g-upload>
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
import { defineComponent, reactive, toRefs, ref, getCurrentInstance } from "vue";
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
      confirmLoading: false,
    });
    const changeFile = () => {
      const fileList = upLoad.value.fileList;
      state.form.fileVOS = fileList.map((item) => {
        return item.response.data;
      });
    };
    const handleOk = () => {
      state.confirmLoading = true;
      proxy.$api
        .alarmHandelSuspend({ ...state.form, id: props.id })
        .then((res) => {
          proxy.$emitter.emit("refreshAlarmList");
          proxy.$message.success("提交成功");
          cancel();
        })
        .finally(() => {
          state.confirmLoading = false;
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
      color: var(--dispatch-text, #26384d);
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
    color: var(--dispatch-text, #26384d);
  }

  .ant-input {
    background: var(--dispatch-input-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-picker:hover .ant-calendar-picker-input:not(.ant-input-disabled) {
    border: 1px solid var(--dispatch-map-blue, #1976d2);
  }

  .ant-input-affix-wrapper {
    background-color: var(--dispatch-input-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-upload.ant-upload-select-picture-card {
    background-color: var(--dispatch-panel-bg-soft, #f5f9ff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-upload {
    color: var(--dispatch-text-secondary, #68798d);
  }

  .ant-calendar {
    background-color: var(--dispatch-card-bg, #ffffff);
    border: 1px solid var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-calendar-input {
    background: var(--dispatch-input-bg, #ffffff);
    border: solid 1px var(--dispatch-map-blue-border, #b9d5f4);
  }

  .ant-calendar-header .ant-calendar-prev-year-btn {
    color: var(--dispatch-text-secondary, #68798d);
  }

  .ant-calendar-header a:hover {
    color: var(--dispatch-map-blue, #1976d2);
  }

  .ant-calendar-header .ant-calendar-year-select {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-picker-container {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-date {
    color: var(--dispatch-text, #26384d);
  }

  .ant-calendar-last-month-cell .ant-calendar-date,
  .ant-calendar-next-month-btn-day .ant-calendar-date {
    color: var(--dispatch-text-muted, #91a1b2);
  }
}
</style>
