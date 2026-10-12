<template>
  <div class="modal-wrap">
    <div class="notice-modal">
      <div class="notice-title">
        <img src="/resource/v1/command-dispatch-migrate/commandDispatch/images/voice-icon.png" alt="">
        <span>{{ stateInfo.name }}</span>
      </div>
      <div class="notice-content">{{stateInfo.speaker}} 正在讲话......</div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, watch } from "vue";
import {
  CloseOutlined,
} from "@ant-design/icons-vue";

import customTable from '../custom-table/index.vue'
export default defineComponent({
  props: {
    stateInfo: {
      type: Object,
      default: {}
    }
  },
  name: 'interGroupNotice',
  components: { CloseOutlined, customTable },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      trailList: [],
      searchParams: {
        period: {
          startTime: '',
          endTime: '',
        },
      }
    })

    onMounted(() => {
    })




    return {
      ...toRefs(state)
    }
  }
})
</script>
<style scoped lang="less">
.notice-modal {
  width: 300px;
  position: fixed;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px;
  background-image: url('/resource/v1/command-dispatch-migrate/commandDispatch/images/inter-coming-notice-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.3);

  .notice-title {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 20px;
    font-family: YouSheBiaoTiHei-Bold, YouSheBiaoTiHei;
    font-weight: 400;
    color: #FFFFFF;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .notice-content {
    text-indent: 22px;
    font-size: 14px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #BCD2ED;
  }
}
</style>
<style lang="less">
.trail-modal {
  .ant-form-item-label>label {
    color: rgba(255, 255, 255, 0.8);
  }

  .check-box {
    width: 100%;

    .ant-checkbox-wrapper {
      color: #fff;
      width: 60% !important;

      .ant-checkbox-inner {
        background: #0C3173;
        border-radius: 2px 2px 2px 2px;
        opacity: 1;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

    }
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

  .ant-calendar-picker-icon {
    color: rgba(255, 255, 255, 0.4) !important;
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
