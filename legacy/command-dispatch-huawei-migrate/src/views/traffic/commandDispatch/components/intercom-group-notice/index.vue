<template>
  <div class="modal-wrap">
    <div class="notice-modal">
      <div class="notice-title">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/voice-icon.png" alt="" />
        <span>{{ stateInfo.name }}</span>
      </div>
      <div class="notice-content">{{ stateInfo.speaker }} 正在讲话......</div>
    </div>
  </div>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, watch } from "vue";

import customTable from "../custom-table/index.vue";
export default defineComponent({
  props: {
    stateInfo: {
      type: Object,
      default: {},
    },
  },
  name: "interGroupNotice",
  components: { CloseOutlined, customTable },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      trailList: [],
      searchParams: {
        period: {
          startTime: "",
          endTime: "",
        },
      },
    });

    onMounted(() => {});

    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.notice-modal {
  width: 300px;
  position: fixed;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px;
  background: var(--dispatch-card-bg, #ffffff);
  border: 1px solid var(--dispatch-border, #d7e5f4);
  border-radius: 8px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 34px rgba(34, 95, 158, 0.18));

  .notice-title {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 20px;
    font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
    font-weight: 400;
    color: var(--dispatch-text, #26384d);

    img {
      width: 20px;
      height: 20px;
    }
  }

  .notice-content {
    text-indent: 22px;
    font-size: 14px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
    color: var(--dispatch-text-secondary, #68798d);
  }
}
</style>
<style lang="less">
.trail-modal {
  .ant-form-item-label > label {
    color: var(--dispatch-text, #26384d);
  }

  .check-box {
    width: 100%;

    .ant-checkbox-wrapper {
      color: var(--dispatch-text, #1f2d3d);
      width: 60% !important;

      .ant-checkbox-inner {
        background: var(--dispatch-input-bg, #ffffff);
        border-radius: 2px 2px 2px 2px;
        opacity: 1;
        border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
      }
    }
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

  .ant-calendar-picker-icon {
    color: var(--dispatch-text-secondary, #68798d) !important;
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
