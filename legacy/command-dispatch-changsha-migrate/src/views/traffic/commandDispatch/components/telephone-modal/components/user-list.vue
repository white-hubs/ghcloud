<template>
  <div class="conference-user-wrap">
    <a-input-search class="search" v-model:value="keyword" @change="handleInputChange" placeholder="搜索成员"></a-input-search>
    <div class="list">
      <div
        :class="['item', activeCode === item.code && 'active']"
        v-for="item in membersList"
        :key="item.number"
        @click="() => handleCheckUser(item)"
      >
        <div class="top">
          <div class="user">
            <img class="head" v-if="item.file" :src="item.file.path" />
            <img class="head" v-else src="/resource/v1/command-dispatch-migrate/images/tx-1.png" alt="" srcset="" />
            <div class="info">
              <p class="title">{{ item.name }}</p>
              <p class="desc">{{ item.name }}</p>
            </div>
          </div>
          <template v-if="type === 'video'">
            <img
              class="btn"
              style="margin-right: 10px"
              v-show="item.openVideo"
              @click.stop="() => handleCloseVideo(item)"
              src="/resource/v1/command-dispatch-migrate/images/video-icon.png"
              alt=""
            />
            <img
              class="btn"
              style="margin-right: 10px"
              src="/resource/v1/command-dispatch-migrate/images/no-video.png"
              v-show="!item.openVideo"
              @click.stop="() => handleOpenRemoteVideo(item)"
              alt=""
            />
          </template>
          <img
            class="btn"
            src="/resource/v1/command-dispatch-migrate/images/no-sound.png"
            @click.stop="() => handleSpeak(item)"
            v-show="!item.allowSpeak"
            alt=""
          />
          <img
            class="btn"
            src="/resource/v1/command-dispatch-migrate/images/open-sound.png"
            @click.stop="() => handleSpeak(item)"
            v-show="item.allowSpeak"
          />
        </div>
        <div class="bottom" v-show="activeCode === item.code">
          <div class="btn" style="visibility: hidden" @click.stop="() => handleSpeak(item)">
            <img class="icon" src="/resource/v1/command-dispatch-migrate/images/sound.png" />
            {{ item.allowSpeak ? "禁言" : "取消禁言" }}
          </div>
          <div class="btn" style="visibility: hidden" @click.stop="() => handleListen(item)">
            <img class="icon" src="/resource/v1/command-dispatch-migrate/images/ej.png" />
            {{ item.allowListen ? "禁听" : "取消禁听" }}
          </div>
          <div class="btn active" @click.stop="() => handleRemove(item)">
            <img class="icon" src="/resource/v1/command-dispatch-migrate/images/qc.png" />
            请出
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {},
  props: {
    type: {
      type: String,
      default: "video",
    },
  },
  setup(props, { emit }) {
    const store = useStore();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const conferenceMembers = computed(() => store.getters.conferenceMembers);
    let allMembers = [];
    const state = reactive({
      keyword: "",
      activeCode: "",
      membersList: [],
    });
    watch(
      () => conferenceMembers.value,
      () => {
        allMembers = conferenceMembers.value;
        state.membersList = conferenceMembers.value;
      },
    );
    const handleCheckUser = (item) => {
      state.activeCode = item.code;
    };
    const handleOpenRemoteVideo = async (item) => {
      const { number } = item;
      await webrtcInstance.value.openMemberVideo(item.number);
      const members = [...conferenceMembers.value];
      const index = members.findIndex((i) => i.number === item.number);
      members[index].openVideo = true;
      store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
    };
    const handleInputChange = (e) => {
      const value = e.target.value;
      if (value) {
        state.membersList = allMembers.filter((item) => item.name.includes(value));
        return;
      }
      state.membersList = allMembers;
    };
    const handleCloseVideo = async (item) => {
      await webrtcInstance.value.closeMemberVideo(item.number);
      const members = [...conferenceMembers.value];
      const index = members.findIndex((i) => i.number === item.number);
      members[index].openVideo = false;
      store.commit("commandDispatch/SET_CONFERENCE_MEMBERS", members);
    };
    const handleSpeak = (item) => {
      webrtcInstance.value.setMemberSpeak(item.number, !item.allowSpeak);
    };
    const handleListen = (item) => {
      webrtcInstance.value.setMemberListen(item.number, !item.allowListen);
    };
    const handleRemove = (item) => {
      webrtcInstance.value.removeMember(item.number);
    };
    onMounted(() => {});
    // watch(() => webrtcInstance.value, () => {
    //   debugger
    //   if (!webrtcInstance.value) return;
    //   webrtcInstance.value.on('userAudioConferenceConnected', (member) => {
    //     if (conferenceMembers.value.findIndex(item => item.number === member.number) !== -1) return
    //     const members = [...conferenceMembers.value, member]
    //     store.commit('commandDispatch/SET_CONFERENCE_MEMBERS', members)
    //   })
    // })
    return {
      ...toRefs(state),
      conferenceMembers,
      handleCloseVideo,
      handleInputChange,
      handleListen,
      handleCheckUser,
      handleSpeak,
      handleRemove,
      handleOpenRemoteVideo,
    };
  },
});
</script>
<style scoped lang="less">
.conference-user-wrap {
  background: var(--dispatch-panel-bg-soft, #f6f9fd);
  padding: 16px 12px;
  height: 100%;
  overflow-y: auto;

  .search {
    height: 30px;
    background: var(--dispatch-input-bg, #ffffff);
    color: var(--dispatch-text, #1f2d3d);
    border-radius: 2px;
    border: 1px solid var(--dispatch-map-blue-border, #cfe0f3);
    font-size: 12px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
  }

  .ant-input-affix-wrapper > input.ant-input,
  :deep(.ant-input-affix-wrapper > input.ant-input) {
    background: transparent;
    color: var(--dispatch-text, #1f2d3d) !important;
  }

  .ant-input-affix-wrapper .ant-input-prefix,
  :deep(.ant-input-affix-wrapper .ant-input-prefix),
  :deep(.ant-input-affix-wrapper .ant-input-suffix),
  .ant-input-search-icon,
  :deep(.ant-input-search-icon),
  .ant-input-affix-wrapper .ant-input-suffix {
    color: var(--dispatch-text-secondary, #64748b) !important;
  }

  p {
    margin: 0;
  }

  .list {
    margin-top: 16px;
    max-height: calc(100% - 90px);
    // padding-bottom: 30px;
    overflow-y: scroll;

    .item {
      margin-bottom: 10px;
      background: var(--dispatch-panel-bg-solid, #ffffff);
      border: 1px solid var(--dispatch-border-soft, #e8eef6);
      border-radius: 0px;
      padding: 8px 8px 10px 8px;

      &.active {
        background: var(--dispatch-panel-bg-active, #eaf4ff);
        border-radius: 4px;
        border: 1px solid rgba(41, 137, 255, 0.3);
      }

      .top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .user {
          flex: 1;
          display: flex;
          align-items: center;

          .head {
            width: 40px;
            height: 40px;
          }

          .info {
            margin-left: 6px;

            .title {
              font-size: 14px;
              font-family:
                Source Han Sans CN-Medium,
                Source Han Sans CN;
              font-weight: 500;
              color: var(--dispatch-text, #26384d);
              line-height: 18px;
            }

            .desc {
              font-size: 12px;
              font-family: Roboto-Regular, Roboto;
              font-weight: 400;
              color: var(--dispatch-text-secondary, #68798d);
              visibility: hidden;
              line-height: 16px;
              margin-top: 5px;
            }
          }
        }

        .btn {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
      }

      .bottom {
        margin-top: 10px;
        display: flex;
        align-items: center;

        .btn {
          cursor: pointer;
          padding: 4px;
          background: var(--dispatch-map-blue-soft, #e8f3ff);
          border-radius: 2px;
          margin: 0 4px;
          text-wrap: nowrap;

          .icon {
            width: auto;
            height: 12px;
          }

          font-size: 12px;
          font-family:
            Source Han Sans CN-Regular,
            Source Han Sans CN;
          font-weight: 400;
          color: var(--dispatch-map-blue, #1976d2);
          line-height: 18px;

          &.active {
            background: #216cc3;
          }
        }
      }
    }
  }
}
</style>
