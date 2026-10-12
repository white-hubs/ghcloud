<template>
  <div class="alarm-market" :class="alarmInfo.alarmLevelCode === 'one_level' ? 'serious' : 'normal'">
    <span class="alarm-market-close" @click="close">
      <CloseOutlined />
    </span>
    <a-tooltip>
      <template #title>{{ alarmInfo.alarmEventName }}</template>
      <div class="alarm-title over-ellipsis">{{ alarmInfo.alarmEventName }}</div>
    </a-tooltip>

    <div class="alarm-detail">
      <a-tooltip>
        <template #title>{{ alarmInfo.alarmTargetName }}</template>
        <div class="over-ellipsis">报警设备：{{ alarmInfo.alarmTargetName }}</div>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ alarmInfo.areaName || "--" }}</template>
        <div class="over-ellipsis">报警地点：{{ alarmInfo.areaName }}</div>
      </a-tooltip>
      <a-tooltip>
        <template #title>{{ alarmInfo.alarmTime }}</template>
        <div class="over-ellipsis">报警时间：{{ alarmInfo.alarmTime }}</div>
      </a-tooltip>
      <!-- <div class="over-ellipsis">报警设备：{{ alarmInfo.alarmTargetName }}</div>
      <div class="over-ellipsis">报警地点：{{ alarmInfo.areaName || "--" }}</div>
      <div class="over-ellipsis">报警时间：{{ alarmInfo.alarmTime }}</div> -->
    </div>
    <div class="footer">
      <div class="operate" @click="handleSosMeeting">
        <img src="/resource/v1/command-dispatch-migrate/images/phone.png" alt="" srcset="" />
        <span class="txt">紧急呼叫人员</span>
      </div>
    </div>
  </div>
</template>

<script>
import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, computed, getCurrentInstance } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: { CloseOutlined },
  name: "alarm-map-window",
  props: {
    alarmInfo: {
      type: Object,
      default: () => {},
    },
    onlineDevices: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["openAudioConference"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const localUser = computed(() => store.getters.userInfo ?? { name: "张三", number: "2001" });
    const close = () => {
      emit("close");
    };
    const handleSosMeeting = async () => {
      const mediaControl = document.getElementById("member-control-host");
      const members = props.onlineDevices.map((item) => item.id).filter((item) => item !== localUser.value.id);
      if (!members.length) {
        proxy.$message.warning("当前没有可呼叫人员");
        return;
      }
      const meetingName = `${localUser.value.name}发起的语音通话`;
      store.commit("commandDispatch/SET_MEETING_TITLE", meetingName);
      await webrtcInstance.value.startConference(members, mediaControl, meetingName, false);
      emit("openAudioConference");
    };
    return {
      close,
      handleSosMeeting,
    };
  },
});
</script>
<style scoped lang="less">
.alarm-market {
  padding: 26px;
  background: var(--dispatch-modal-bg, rgba(255, 255, 255, 0.98));
  background-image: none !important;
  background-size: 100% 100%;
  height: 207px;
  width: 277px;
  background-repeat: no-repeat;
  position: relative;
  border: 1px solid var(--dispatch-border, #dbe4ef);
  border-radius: 8px;
  box-shadow: var(--dispatch-shadow-strong, 0 12px 32px rgba(26, 54, 93, 0.18));
  color: var(--dispatch-text, #1f2d3d);

  &.serious {
    background-image: none;
    border-color: rgba(255, 61, 61, 0.35);

    .alarm-title,
    .alarm-detail {
      text-shadow: none;
    }
  }

  &.normal {
    background-image: none;
  }

  .alarm-market-close {
    position: absolute;
    right: 10px;
    top: 10px;
    color: var(--dispatch-text-secondary, #64748b);
    cursor: pointer;
  }

  .alarm-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--dispatch-text, #1f2d3d);
  }

  .over-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }

  .alarm-detail {
    margin-top: 10px;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-weight: 400;
    color: var(--dispatch-text-secondary, #64748b);
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 12px;
  }

  .operate {
    cursor: pointer;
    background: var(--dispatch-map-blue-soft, #eaf4ff);
    border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
    border-radius: 4px;
    padding: 6px 7px 6px 10px;
    display: flex;
    align-items: center;
    font-size: 12px;
    font-family:
      Source Han Sans CN,
      Source Han Sans CN-Regular;
    font-weight: Regular;
    text-align: left;
    color: var(--dispatch-map-blue, #216cc3);
    gap: 6px;

    img {
      width: 14px;
      height: 14px;
    }
  }
}
</style>
