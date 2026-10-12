import { defineComponent } from "vue";
import { computed, ref } from "vue";

import { CubeChatAI } from "@ghcloud/cube-speech-assistant";

import styles from "./speech-assistant.module.less";

export const SpeechAssistant = defineComponent({
  name: "SpeechAssistant",
  emits: ["command"],
  setup(_props, { emit }) {
    const waveView = ref();
    const chatAI = CubeChatAI.getInstance();

    /** 服务连接状态 */
    const connectStatus = ref(false);
    /** 录音状态 */
    const recordStatus = ref(false);
    /** 唤醒状态 */
    const awakenStatus = ref(false);
    /** 回显文字 */
    const text = ref("");
    /** AI Loading */
    const replyLoading = ref(false);
    const closeLoading = ref(false);

    const statusText = computed(() => {
      if (replyLoading.value) {
        return "思考中...";
      }
      if (closeLoading.value) {
        return "关闭中...";
      }
      return recordStatus.value ? "开" : "关";
    });

    chatAI.commandCallBack = async (command) => {
      emit("command", command);
    };
    chatAI.statesCallBack = (states) => {
      awakenStatus.value = states.awakenStatus;
      connectStatus.value = states.connectStatus;
      recordStatus.value = states.recordStatus;
      replyLoading.value = states.replyLoading;
      text.value = states.speechText;
    };

    async function handelRecord() {
      if (closeLoading.value) {
        return;
      }
      if (recordStatus.value) {
        closeLoading.value = true;
        waveView.value.innerHTML = "";
        await chatAI.stopRecord();
        closeLoading.value = false;
      } else {
        chatAI.startRecord();
        chatAI.createWaveView(".cube-wave-view");
      }
    }

    return (): JSX.Element => (
      <>
        <div class="model-camera-option" style="position: relative;">
          <div class="cube-wave-view" ref="waveView"></div>
          <div class="btn flex-center" onClick={handelRecord}>
            <span>
              语音拾取:
              {statusText.value}
            </span>
          </div>
        </div>
      </>
    );
  },
});

export default SpeechAssistant;
