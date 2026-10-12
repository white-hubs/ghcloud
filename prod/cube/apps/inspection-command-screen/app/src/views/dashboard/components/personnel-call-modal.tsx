import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  PhoneOutlined,
  UserAddOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { Checkbox } from "ant-design-vue";
import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { Constants, RTCCore } from "@ghcloud/cube-rtc";
import { Button, Empty, Input, Modal } from "@ghcloud/cube-ui";

import type { PersonnelItem } from "@/types/dashboard";

import "./personnel-call-modal.less";

const defaultAvatar = "/resource/v1/command-dispatch-migrate/commandDispatch/images/default-avatar.png";

const formatSeconds = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const PersonnelCallModal = defineComponent({
  name: "PersonnelCallModal",
  props: {
    visible: { type: Boolean, required: true },
    person: { type: Object as () => PersonnelItem | null, required: false, default: null },
    type: { type: String as () => "audio" | "video", required: true },
    callStatus: { type: String, required: true },
    callRole: { type: String, required: true },
    remoteUsers: {
      type: Array as () => Array<{ id?: string; name?: string; callStatus?: string; videoAvailable?: boolean; audioAvailable?: boolean }>,
      required: true,
    },
    inviteVisible: { type: Boolean, required: true },
    inviteKeyword: { type: String, required: true },
    inviteOnlyOnline: { type: Boolean, required: true },
    invitePeople: { type: Array as () => PersonnelItem[], required: true },
    inviteSelectedIds: { type: Array as () => string[], required: true },
    inviteLoading: { type: Boolean, required: true },
    onHangup: { type: Function as unknown as () => () => void, required: true },
    onAccept: { type: Function as unknown as () => () => void, required: true },
    onReject: { type: Function as unknown as () => () => void, required: true },
    onOpenInvite: { type: Function as unknown as () => () => void, required: true },
    onCloseInvite: { type: Function as unknown as () => () => void, required: true },
    onSearchInvite: { type: Function as unknown as () => () => void, required: true },
    onConfirmInvite: { type: Function as unknown as () => () => void, required: true },
    onUpdateInviteKeyword: { type: Function as unknown as () => (value: string) => void, required: true },
    onUpdateInviteOnlyOnline: { type: Function as unknown as () => (checked: boolean) => void, required: true },
    onToggleInvitePerson: { type: Function as unknown as () => (person: PersonnelItem) => void, required: true },
    onToggleMicrophone: { type: Function as unknown as () => (open: boolean) => void, required: true },
    onToggleCamera: { type: Function as unknown as () => (open: boolean, viewId: string) => void, required: true },
    onOpenRemoteCamera: { type: Function as unknown as () => (userId: string, viewId: string) => void, required: true },
    onCloseRemoteCamera: { type: Function as unknown as () => (userId: string) => void, required: true },
  },
  setup(props) {
    const seconds = ref(0);
    const microphoneOpen = ref(true);
    const cameraOpen = ref(true);
    const localVideoId = `inspection-call-local-video-${Math.random().toString(36).slice(2)}`;
    const remoteVideoIds = new Map<string, string>();
    const remoteVideoTimers = new Map<string, number>();
    const remoteVideoStarted = new Set<string>();
    const pendingRemoteVideoUsers = new Set<string>();
    let localVideoStarted = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const isAccepted = computed(() => props.callStatus === "accept");
    const isVideo = computed(() => props.type === "video");
    const isIncomingWaiting = computed(() => props.callStatus === "waiting" && props.callRole === "called");
    const shouldShowLocalPreview = computed(
      () => props.visible && isVideo.value && cameraOpen.value && (isAccepted.value || props.callRole === "caller"),
    );
    const acceptedRemoteCount = computed(() => props.remoteUsers.filter((user) => user.callStatus === "accept").length);
    const remoteVideoSignature = computed(() =>
      props.remoteUsers.map((user) => `${user.id}:${user.callStatus || "none"}:${user.videoAvailable ? "1" : "0"}`).join("|"),
    );

    const getRemoteVideoId = (userId: string): string => {
      const cached = remoteVideoIds.get(userId);
      if (cached) {
        return cached;
      }
      const nextId = `inspection-call-remote-video-${userId}-${Math.random().toString(36).slice(2)}`;
      remoteVideoIds.set(userId, nextId);
      return nextId;
    };

    const stopTimer = (): void => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    const startTimer = (): void => {
      stopTimer();
      timer = setInterval(() => {
        seconds.value += 1;
      }, 1000);
    };

    const clearRemoteVideoTimers = (): void => {
      remoteVideoTimers.forEach((timerId) => window.clearTimeout(timerId));
      remoteVideoTimers.clear();
    };

    const openLocalVideo = (): void => {
      if (shouldShowLocalPreview.value && !localVideoStarted) {
        localVideoStarted = true;
        nextTick(() => {
          props.onToggleCamera(true, localVideoId);
        }).catch(() => undefined);
      }
    };

    const scheduleRemoteVideo = (userId: string, viewId: string): void => {
      if (remoteVideoStarted.has(userId)) {
        return;
      }
      const pendingTimer = remoteVideoTimers.get(userId);
      if (pendingTimer) {
        window.clearTimeout(pendingTimer);
      }
      const timerId = window.setTimeout(() => {
        remoteVideoTimers.delete(userId);
        if (!props.visible || !isVideo.value || !props.remoteUsers.some((user) => user.id === userId)) {
          return;
        }
        remoteVideoStarted.add(userId);
        props.onOpenRemoteCamera(userId, viewId);
      }, 500);
      remoteVideoTimers.set(userId, timerId);
    };

    const handleRemoteVideoAvailable = (event: { userId?: string }): void => {
      const userId = event.userId;
      if (!userId) {
        return;
      }
      pendingRemoteVideoUsers.add(userId);
      if (!props.remoteUsers.some((user) => user.id === userId)) {
        return;
      }
      nextTick(() => scheduleRemoteVideo(userId, getRemoteVideoId(userId))).catch(() => undefined);
    };

    const handleRemoteVideoUnavailable = (event: { userId?: string }): void => {
      const userId = event.userId;
      if (!userId) {
        return;
      }
      pendingRemoteVideoUsers.delete(userId);
      const pendingTimer = remoteVideoTimers.get(userId);
      if (pendingTimer) {
        window.clearTimeout(pendingTimer);
        remoteVideoTimers.delete(userId);
      }
      remoteVideoStarted.delete(userId);
      props.onCloseRemoteCamera(userId);
    };

    const openAvailableRemoteVideos = (): void => {
      if (!props.visible || !isVideo.value) {
        return;
      }
      nextTick(() => {
        props.remoteUsers.forEach((user) => {
          if (user.id && user.callStatus === "accept" && (user.videoAvailable || pendingRemoteVideoUsers.has(user.id))) {
            scheduleRemoteVideo(user.id, getRemoteVideoId(user.id));
          }
        });
      }).catch(() => undefined);
    };

    watch(
      () => props.visible,
      (visible) => {
        if (!visible) {
          stopTimer();
          seconds.value = 0;
          microphoneOpen.value = true;
          cameraOpen.value = true;
          remoteVideoIds.clear();
          remoteVideoStarted.clear();
          pendingRemoteVideoUsers.clear();
          localVideoStarted = false;
          clearRemoteVideoTimers();
          return;
        }
        seconds.value = 0;
        microphoneOpen.value = true;
        cameraOpen.value = true;
        remoteVideoStarted.clear();
        localVideoStarted = false;
        openLocalVideo();
        openAvailableRemoteVideos();
      },
    );

    watch(isAccepted, (accepted) => {
      if (accepted) {
        startTimer();
        openLocalVideo();
        openAvailableRemoteVideos();
      } else {
        stopTimer();
        seconds.value = 0;
      }
    });

    watch(remoteVideoSignature, openAvailableRemoteVideos);

    onMounted(() => {
      RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_VIDEO_AVAILABLE, handleRemoteVideoAvailable);
      RTCCore.getInstance().registerEvent(Constants.RTC_EVENT.REMOTE_VIDEO_UNAVAILABLE, handleRemoteVideoUnavailable);
    });

    onBeforeUnmount(() => {
      RTCCore.getInstance().unregisterEvent(Constants.RTC_EVENT.REMOTE_VIDEO_AVAILABLE, handleRemoteVideoAvailable);
      RTCCore.getInstance().unregisterEvent(Constants.RTC_EVENT.REMOTE_VIDEO_UNAVAILABLE, handleRemoteVideoUnavailable);
      stopTimer();
      clearRemoteVideoTimers();
    });

    return () => (
      <Modal
        open={props.visible}
        title={isVideo.value ? "视频通话" : "语音通话"}
        width={360}
        footer={null}
        mask={false}
        maskClosable={false}
        wrapClassName="screen-modal-wrap personnel-call-wrap draggable-modal-wrap"
        class="screen-modal personnel-call-modal"
        onCancel={props.onHangup}
      >
        <div class="personnel-call-panel">
          <div class="call-user-card">
            <img class="call-avatar" src={props.person?.file?.path || defaultAvatar} alt="" />
            <div>
              <div class="call-name">{props.person?.name || "--"}</div>
              <div class="call-phone">联系电话：{props.person?.mobile || "--"}</div>
            </div>
          </div>

          <div class={["call-media-area", isVideo.value ? "is-video" : "is-audio"]}>
            {isVideo.value ? (
              <>
                <div class={["remote-video-grid", props.remoteUsers.length > 1 ? "is-multiple" : ""]}>
                  {props.remoteUsers.length === 0 && (
                    <div class="remote-video-box">
                      <span>等待接听</span>
                    </div>
                  )}
                  {props.remoteUsers.map((user) => (
                    <div id={user.id ? getRemoteVideoId(user.id) : undefined} class="remote-video-box" key={user.id || Math.random()}>
                      {!user.videoAvailable && <span>{user.callStatus === "accept" ? "等待对方开启视频" : "等待接听"}</span>}
                    </div>
                  ))}
                </div>
                <div id={localVideoId} class={["local-video-box", isAccepted.value ? "is-accepted" : "is-waiting"]} />
              </>
            ) : (
              <div class="audio-calling-box">
                <PhoneOutlined />
                <span>{isAccepted.value ? `${formatSeconds(seconds.value)} · ${acceptedRemoteCount.value || 1}人通话中` : "等待接听"}</span>
              </div>
            )}
          </div>

          {isVideo.value && <div class="call-time">{isAccepted.value ? formatSeconds(seconds.value) : "等待接听"}</div>}

          <div class="call-action-row">
            <button
              type="button"
              class={["call-tool-btn", microphoneOpen.value ? "" : "is-off"]}
              onClick={() => {
                microphoneOpen.value = !microphoneOpen.value;
                props.onToggleMicrophone(microphoneOpen.value);
              }}
            >
              {microphoneOpen.value ? <AudioOutlined /> : <AudioMutedOutlined />}
              <span>{microphoneOpen.value ? "静音" : "取消静音"}</span>
            </button>
            {isVideo.value && (
              <button
                type="button"
                class={["call-tool-btn", cameraOpen.value ? "" : "is-off"]}
                onClick={() => {
                  cameraOpen.value = !cameraOpen.value;
                  props.onToggleCamera(cameraOpen.value, localVideoId);
                  localVideoStarted = cameraOpen.value;
                }}
              >
                <VideoCameraOutlined />
                <span>{cameraOpen.value ? "关闭摄像头" : "开启摄像头"}</span>
              </button>
            )}
            {isAccepted.value && (
              <button type="button" class="call-tool-btn" onClick={props.onOpenInvite}>
                <UserAddOutlined />
                <span>邀请</span>
              </button>
            )}
          </div>

          {isIncomingWaiting.value ? (
            <div class="incoming-action-row">
              <Button danger class="call-hangup-btn" onClick={props.onReject}>
                <CloseOutlined />
                拒绝
              </Button>
              <Button type="primary" class="call-accept-btn" onClick={props.onAccept}>
                <PhoneOutlined />
                接听
              </Button>
            </div>
          ) : (
            <Button danger class="call-hangup-btn" onClick={props.onHangup}>
              <CloseOutlined />
              挂断
            </Button>
          )}
        </div>
        <Modal
          open={props.inviteVisible}
          title="选择人员"
          width={456}
          footer={null}
          mask={false}
          maskClosable={false}
          wrapClassName="screen-modal-wrap personnel-invite-wrap draggable-modal-wrap"
          class="screen-modal personnel-invite-modal"
          onCancel={props.onCloseInvite}
        >
          <div class="invite-toolbar">
            <Input
              value={props.inviteKeyword}
              placeholder="搜索姓名号码"
              allowClear
              onUpdate:value={props.onUpdateInviteKeyword}
              onPressEnter={props.onSearchInvite}
            />
            <Button type="primary" onClick={props.onSearchInvite}>
              查询
            </Button>
          </div>
          <Checkbox checked={props.inviteOnlyOnline} onUpdate:checked={(checked) => props.onUpdateInviteOnlyOnline(Boolean(checked))}>
            仅显示在线人员
          </Checkbox>
          <div class="invite-person-list">
            {props.inviteLoading && <div class="invite-load-status">加载中...</div>}
            {!props.inviteLoading && props.invitePeople.length === 0 && <Empty class="screen-empty" description="暂无可邀请人员" />}
            {!props.inviteLoading &&
              props.invitePeople.map((person) => (
                <button
                  type="button"
                  class={[
                    "invite-person-item",
                    props.inviteSelectedIds.includes(person.id) ? "active" : "",
                    !person.isOnline ? "offline" : "",
                  ]}
                  disabled={!person.isOnline}
                  onClick={() => props.onToggleInvitePerson(person)}
                >
                  <img src={person.file?.path || defaultAvatar} alt="" />
                  <span class="invite-person-main">
                    <em>{person.name}</em>
                    <b>{person.mobile || "--"}</b>
                  </span>
                  <i>{person.isOnline ? "在线" : "离线"}</i>
                </button>
              ))}
          </div>
          <div class="invite-footer">
            <Button onClick={props.onCloseInvite}>取消</Button>
            <Button type="primary" onClick={props.onConfirmInvite}>
              确定
            </Button>
          </div>
        </Modal>
      </Modal>
    );
  },
});
