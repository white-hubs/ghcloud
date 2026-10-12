<template>
  <div class="custom-player">
    <CubePlayer @error="error" :h5sControl="props.h5sControl" :device-id="props.id" :enable-auto-recovery="false" />
  </div>
</template>

<script setup>
import { reactive, toRefs, onMounted } from "vue";

import { CubePlayer } from "@ghcloud/cube-player";
// 初始化token
const emit = defineEmits(["playError"]);
const props = defineProps({
  index: {
    type: Number,
    default: 0,
  },
  id: {
    type: String,
    default: "",
  },
  h5sControl: {
    type: Boolean,
    default: false,
  },
});

const error = (msg, errorType) => {
  if (errorType === "PLAY_ERROR") {
    emit("playError", {
      msg,
      errorType,
      index: props.index,
    });
  }
};

/**
 * 数据部分
 */
const state = reactive({});

onMounted(() => {});
defineExpose({
  ...toRefs(state),
});
</script>
<style scoped lang="less">
.custom-player {
  width: 100%;
  height: 100%;
}
</style>
