<template lang="pug">
div.ItemVideoCtr(ref="ItemVideoCtr") 
  div.video_top
    .video_title {{title}}
    //- .now_time 
      span.pr2 星期{{day === 0 ? '日' : day=== 1 ? '一' : day === 2 ? '二': day === 3 ? '三' : day === 4 ? '四' : day=== 5 ? '五' : '六' }} 
      span {{time}}
    div.icon_ctr
      FullscreenExitOutlined(v-if="isFull" @click.stop="fullScreenOperate('close')")
      FullscreenOutlined(v-else @click.stop="fullScreenOperate('open')")
      CloseOutlined(@click.stop="deleteItem")
  div.video_box
    PlayVideo(:videoId="`video_${index}`" :cameraItem="cameraItem")
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onMounted,
  computed,
  nextTick,
  reactive,
  toRefs,
  watch,
  ref,
} from "vue";
import PlayVideo from "./video.vue";
import {
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons-vue";
import { timeFormat } from "@/utils/common";
export default defineComponent({
  components: {
    PlayVideo,
    CloseOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    index: {
      type: Number,
    },
    cameraItem: {
      type: Object,
    },
  },
  setup(props, { emit }) {
    // 时间
    // const nowTime = computed(() => {
    //   timeFun();
    //   return state.time;
    // });
    // 时间
    // const timeFun = () => {
    //   if (state.timer) {
    //     clearInterval(state.timer);
    //   }
    //   state.timer = setInterval(() => {
    //     const time = new Date();
    //     state.day = time.getDay();
    //     state.time = timeFormat(time, true);
    //   }, 1000);
    // };

    const state = reactive({
      day: null,
      time: null,
      timer: null,
      isFull: false,
    });

    const ItemVideoCtr = ref();

    const fullScreenOperate = (status) => {
      emit("fullScreen", status, props.index);
    };

    const deleteItem = () => {
      emit("deleteItem", props.index);
    };

    onMounted(() => {
      window.addEventListener("resize", function (e) {
        state.isFull = e?.path[0]?.document?.fullscreen ? state.isFull : false;
      });
    });

    // 时间
    // watch(
    //   () => nowTime.value,
    //   (n) => {
    //     state.time = n;
    //   }
    // );
    // 时间
    // watch(
    //   () => state.day,
    //   (n) => {
    //     state.day = n;
    //   }
    // );

    return {
      // nowTime,
      ...toRefs(state),
      fullScreenOperate,
      ItemVideoCtr,
      deleteItem,
    };
  },
});
</script>
<style lang="less" scoped>
.ItemVideoCtr {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 65px;
  position: relative;

  .video_top {
    width: 100%;
    height: 38px;
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    font-size: 12px;
    background-color: rgba(255, 255, 255, 0.2);
    .icon_ctr {
      max-width: 60px;
      min-width: 40px;
      display: flex;
      justify-content: space-between;
    }
  }
  .video_box {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    video {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
