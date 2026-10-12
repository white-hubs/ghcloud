<template>
  <div class="video-list-wrap">
    <div class="video-list-top">
      <div class="video-list-right">
        <a-dropdown class="title">
          <a-button>
            {{ meetingName }}
            <DownOutlined />
          </a-button>
        </a-dropdown>
      </div>
      <div class="time">{{ conferenceTimeFormat }}</div>
    </div>
    <div class="list">
      <div class="row">
        <div class="video-item">
          <div style="width: 100%; height: 100%; object-fit: fill" id="member-control-host">
            <div class="user" v-show="!localUser.openVideo">
              <div class="head">
                <img class="img" v-if="localUser && localUser.fileVO" :src="localUser.fileVO.path" />
                <img class="img" v-else src="/resource/v1/command-dispatch-migrate/images/tx-1.png" alt="" srcset="" />
              </div>
              <div class="info">{{ localUser ? localUser.name : "--" }}</div>
            </div>
          </div>
        </div>

        <div
          :class="[item.openVideo ? 'video-item' : 'audio-item', item.allowSpeak ? 'sound' : 'disabled']"
          v-for="item in conferenceMembers"
          :key="item.userId"
          :id="`member-control-${item.userId}`"
        >
          <div class="user" v-show="!item.openVideo">
            <div class="head">
              <img class="img" v-if="item.file" :src="item.file.path" />
              <img class="img" v-else src="/resource/v1/command-dispatch-migrate/images/tx-1.png" alt="" srcset="" />
            </div>
            <div class="info">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DownOutlined } from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed, watch } from "vue";
import { useStore } from "vuex";
export default defineComponent({
  components: {
    DownOutlined,
  },
  props: {},
  setup(props, { emit }) {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const webrtcInstance = computed(() => store.getters.webrtcInstance);
    const conferenceMembers = computed(() => store.getters.conferenceMembers);
    const meetingName = computed(() => store.getters.meetingTitle || "调度中心发起的会议");
    const localUser = computed(() => store.getters.userInfo ?? { name: "xxxx", openVideo: true });
    let timer = null;
    const state = reactive({
      conferenceTimeFormat: "00:00",
      conferenceTime: 0,
    });
    onMounted(() => {
      proxy.$emitter.on("startConference", (type) => {
        if (type === "video") {
          startConferenceTime();
        }
        webrtcInstance.value.on("endConference", () => {
          terminalTime();
        });
      });
      proxy.$emitter.on("endConference", () => {
        if (state.conferenceTime > 0) {
          terminalTime();
          webrtcInstance.value.endConference();
        }
      });
    });
    const startConferenceTime = () => {
      if (timer) {
        clearInterval(timer);
      }
      timer = window.setInterval(() => {
        ++state.conferenceTime;
        state.conferenceTimeFormat = formateSeconds(state.conferenceTime);
      }, 1000);
    };
    const terminalTime = () => {
      clearInterval(timer);
      state.conferenceTime = 0;
      state.conferenceTimeFormat = "00:00";
    };
    const formateSeconds = (endTime) => {
      let secondTime = parseInt(endTime); //将传入的秒的值转化为Number
      let min = 0; // 初始化分
      let h = 0; // 初始化小时
      let result = "";
      if (secondTime > 60) {
        //如果秒数大于60，将秒数转换成整数
        min = parseInt(secondTime / 60); //获取分钟，除以60取整数，得到整数分钟
        secondTime = parseInt(secondTime % 60); //获取秒数，秒数取佘，得到整数秒数
        if (min > 60) {
          //如果分钟大于60，将分钟转换成小时
          h = parseInt(min / 60); //获取小时，获取分钟除以60，得到整数小时
          min = parseInt(min % 60); //获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      if (h.toString().padStart(2, "0") === "00") {
        result = `${min.toString().padStart(2, "0")}:${secondTime.toString().padStart(2, "0")}`;
      } else {
        result = `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${secondTime.toString().padStart(2, "0")}`;
      }

      return result;
    };

    return {
      ...toRefs(state),
      localUser,
      meetingName,
      conferenceMembers,
    };
  },
});
</script>
<style scoped lang="less">
.ant-dropdown,
:deep(.ant-dropdown),
.ant-dropdown-menu,
:deep(.ant-dropdown-menu),
.ant-dropdown-menu-item,
:deep(.ant-dropdown-menu-item) {
  background-color: var(--dispatch-card-bg, #ffffff);
  color: var(--dispatch-text, #26384d) !important;
}

.ant-dropdown-menu-item,
:deep(.ant-dropdown-menu-item) {
  &:hover {
    background: var(--dispatch-panel-bg-active, #e6f2ff);
  }
}

.ant-dropdown-menu-item,
.ant-dropdown-menu-submenu-title,
:deep(.ant-dropdown-menu-item, .ant-dropdown-menu-submenu-title) {
  color: var(--dispatch-text, #26384d) !important;
}

.video-list-top {
  display: flex;
  justify-content: center;

  .video-list-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .time {
    font-size: 14px;
    font-family:
      Source Han Sans CN-Regular,
      Source Han Sans CN;
    font-weight: 400;
    color: var(--dispatch-text, #26384d);
    line-height: 20px;
  }
}

.video-list-wrap {
  background: var(--dispatch-video-surface, #edf4fc);
  padding: 16px 12px;
  height: 100%;

  .ant-btn,
  :deep(.ant-btn) {
    background: var(--dispatch-map-blue-soft, #e8f3ff);
    border-radius: 2px;
    border: none;
    color: var(--dispatch-map-blue, #1976d2);
  }

  p {
    margin: 0;
  }

  .list {
    padding: 16px 0;
    height: calc(100% - 40px);
    overflow-y: scroll;

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;

      // align-items: center;
      // flex-wrap: wrap;
      .video-item {
        background: var(--dispatch-panel-bg-solid, #ffffff);
        border: 1px solid var(--dispatch-border-soft, #e8eef6);
        border-radius: 4px;
        width: 100%;
        aspect-ratio: 16/9;

        .user {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          .head {
            position: relative;

            .img {
              width: 60px;
              height: 60px;
            }

            &::after {
              width: 24px;
              height: 24px;
              display: inline-block;
              content: "";
              position: absolute;
              right: 0;
              bottom: 0;
              background-repeat: no-repeat;
              background-size: cover;
            }
          }

          .info {
            font-size: 14px;
            font-family:
              Source Han Sans CN-Regular,
              Source Han Sans CN;
            font-weight: 400;
            color: var(--dispatch-text-secondary, #64748b);
            line-height: 20px;
            margin-top: 5px;
          }
        }

        &.sound {
          .info {
            color: #216cc3;
          }

          .head {
            &::after {
              background: var(--dispatch-map-blue, #1976d2);
              border-radius: 50%;
            }
          }
        }

        &.disabled {
          .head {
            &::after {
              background: var(--dispatch-text-muted, #91a1b2);
              border-radius: 50%;
            }
          }
        }
      }

      .audio-item {
        cursor: pointer;

        .user {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;

          .head {
            position: relative;

            .img {
              width: 60px;
              height: 60px;
            }

            &::after {
              width: 24px;
              height: 24px;
              display: inline-block;
              content: "";
              position: absolute;
              right: 0;
              bottom: 0;
              background-repeat: no-repeat;
              background-size: cover;
            }
          }

          .info {
            font-size: 14px;
            font-family:
              Source Han Sans CN-Regular,
              Source Han Sans CN;
            font-weight: 400;
            color: #cbd5e5;
            line-height: 20px;
            margin-top: 5px;
          }
        }

        &.sound {
          .info {
            color: #216cc3;
          }

          .head {
            &::after {
              background: var(--dispatch-map-blue, #1976d2);
              border-radius: 50%;
            }
          }
        }

        &.disabled {
          .head {
            &::after {
              background: var(--dispatch-text-muted, #91a1b2);
              border-radius: 50%;
            }
          }
        }
      }
    }
  }
}
</style>
