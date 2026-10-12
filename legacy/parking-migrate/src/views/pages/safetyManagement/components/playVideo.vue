<template>
  <div
    :class="[
      grid === '1X1'
        ? 'one'
        : grid === '2X2'
        ? 'four'
        : grid === '2X3'
        ? 'six'
        : grid === '3X3'
        ? 'nine'
        : grid === '4X4'
        ? 'sixteen'
        : 'one',
      'playVideo',
    ]"
  >
    <template v-for="(item, index) in cameraList" :key="`${index}-${item?.id ?? 'empty'}`">
      <VideoItem
        :cameraItem="item"
        :index="index"
        :clickIndex="clickIndex"
        @click="videoItemClick(index)"
        @close-item="closeItem"
        :type="videoAccessMode"
      ></VideoItem>
    </template>
  </div>
</template>
<script lang="jsx">
import {
  getCurrentInstance,
  defineComponent,
  onUnmounted,
  onMounted,
  reactive,
  nextTick,
  toRefs,
  watch,
  ref,
} from "vue";
import VideoItem from "./videoItem.vue";
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons-vue";
export default defineComponent({
  components: {
    VideoItem,
    FullscreenOutlined,
    FullscreenExitOutlined,
  },
  props: {
    cameraList: {
      type: Object,
      default: () => {
        return [];
      },
    },
    grid: {
      type: Object,
      default: "2X2",
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      isFull: false,
      fallback: window.config.fallback,
      clickIndex: null,
    });
    const videoAccessMode = window.config.feature?.videoAccessMode ?? 'H5S'

    const videoItemClick = (index) => {
      state.clickIndex = index;
    };

    const closeItem = (index) => {
      emit("close-item", index);
    };
    watch(
      () => props.cameraList,
      () => {
      }
    );

    return {
      ...toRefs(state),
      videoItemClick,
      closeItem,
      videoAccessMode
    };
  },
});
</script>
<style lang="less" scoped>
.playVideo {
  width: 100%;
  height: 100%;
  display: grid;
  &:not(.one) {
    grid-row-gap: 8px;
    grid-column-gap: 8px;
  }
  &.one {
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(1, 100%);
  }
  &.four {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
  &.six {
    .ctr {
      &:first-child {
        grid-area: a;
      }
    }
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-template-areas:
      "a a b"
      "a a c"
      "d e f";
  }
  &.nine {
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
  &.sixteen{
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }
}
</style>
