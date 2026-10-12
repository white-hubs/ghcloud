import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  ZoomOutOutlined,
  ZoomInOutlined,
  RightOutlined,
  LeftOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons-vue";
import { defineComponent, reactive, toRefs } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";

import styles from "./H5Video.module.less";

export default defineComponent({
  components: {
    CubePlayer,
    FullscreenOutlined,
    FullscreenExitOutlined,
    ZoomOutOutlined,
    ZoomInOutlined,
    RightOutlined,
    LeftOutlined,
    UpOutlined,
    DownOutlined,
  },
  props: {
    idStr: {
      type: String,
      default: "cameraBox",
    },
    isShowDeviceDetails: {
      type: Boolean,
      default: false,
    },
    control: {
      type: Boolean,
      default: false,
    },
    tokenInfo: {
      type: Object,
      default: {},
    },
    cameraItem: {
      type: Object,
      default: () => {
        return {};
      },
    },
    snUrl: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      player: null,
      tabShow: false,
    });
    const onError = (msg, type) => {
      if (type === "PLAY_ERROR") {
        emit("error", props.cameraItem?.deviceId || props.cameraItem?.id);
      }
    };
    return {
      ...toRefs(state),
      onError,
      h5sSessionChange: (session) => {
        emit("h5sSessionChange", session);
      },
    };
  },
});
