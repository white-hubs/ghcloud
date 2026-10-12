<template>
  <div class="wrap">
    <div class="list">
      <div class="item" @click="handleAllSpeak">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/jy.png" v-show="allMute" />
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/jcjy.png" v-show="!allMute" />
        <span class="txt">{{ allMute ? "取消静音" : "全体静音" }}</span>
      </div>
      <div class="item" @click="handleHold">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/qxbc.png" v-show="!holding" />
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/bc.png" v-show="holding" />
        <span class="txt">{{ holding ? "取消本地静音" : "本地静音" }}</span>
      </div>
      <!-- <div class="item" v-if="type === 'call'">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/ly.png" />
        <span class="txt">录音</span>
      </div> -->
      <!-- <template v-else>
        <div class="item">
          <img class="icon" src="/resource/v1/command-dispatch-migrate/images/lx.png" />
          <span class="txt">录像</span>
        </div> -->
      <div class="item" @click="handleLocalVideo" v-if="type === 'video'">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/kqsp.png" v-show="!localUser.openVideo" />
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/gbsp.png" v-show="localUser.openVideo" />
        <span class="txt">{{ !localUser.openVideo ? "开启" : "关闭" }}视频</span>
      </div>
      <!-- /resource/v1/command-dispatch-migrate/images/no-video.png -->
      <!-- </template> -->
      <!-- <div class="item">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/cy.png" />
        <span class="txt">成员(8)</span>
      </div> -->
      <div class="item" @click="handleInvite">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/yq.png" />
        <span class="txt">邀请</span>
      </div>
      <div class="item" @click="handleEndConference">
        <img class="icon" src="/resource/v1/command-dispatch-migrate/images/gd.png" />
        <span class="txt">挂断</span>
      </div>
    </div>
    <div v-if="personVisible">
      <checkPersonModal
        multiple
        v-model:visible="personVisible"
        v-model:isMinimized="personIsMinimized"
        @confirm="handleConfirm"
        @close="personVisible = false"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, getCurrentInstance, toRefs, computed, onMounted } from "vue";
import { useStore } from "vuex";

import checkPersonModal from "../../check-person-modal/index.vue";
export default defineComponent({
  components: {
    checkPersonModal,
  },
  props: {
    type: {
      type: String,
      default: "video", // video | call
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const localUser = computed(() => store.getters.userInfo ?? { openVideo: true });
    const conferenceMembersNumber = computed(() => {
      return store.getters.conferenceMembers.map((item) => item.number);
    });
    const state = reactive({
      allMute: false,
      holding: false,
      personVisible: false,
      personIsMinimized: false,
      isCloseVideo: false,
    });
    const handleInvite = () => {
      state.personVisible = true;
    };
    const handleEndConference = () => {
      emit("endConference");
    };
    // 设置全员禁听
    const handleAllSpeak = () => {
      !state.allMute
        ? webrtcInstance.value.setAllSpeak(conferenceMembersNumber.value, state.allMute)
        : webrtcInstance.value.setAllSpeak(conferenceMembersNumber.value, state.allMute);
      state.allMute = !state.allMute;
    };
    const handleHold = () => {
      webrtcInstance.value.setLocalMute(!state.holding);
      state.holding = !state.holding;
    };
    const handleLocalVideo = () => {
      webrtcInstance.value.setLocalVideo(!localUser.value.openVideo);
      store.commit("userInfo/SET_USER_INFO", {
        ...localUser.value,
        openVideo: !localUser.value.openVideo,
      });
    };
    const handleConfirm = async (members) => {
      await webrtcInstance.value.addConferenceMembers(members);
    };
    onMounted(() => {});
    return {
      handleConfirm,
      localUser,
      handleLocalVideo,
      handleHold,
      handleEndConference,
      handleAllSpeak,
      handleInvite,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.wrap {
  padding: 16px 90px;
  width: 100%;

  .list {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0 30px;

      .icon {
        width: 54px;
        height: 54px;
      }

      .txt {
        margin-top: 5px;
        font-size: 11px;
        font-family:
          Source Han Sans CN-Regular,
          Source Han Sans CN;
        font-weight: 400;
        color: var(--dispatch-text-secondary, #68798d);
        line-height: 18px;
      }
    }
  }
}
</style>
