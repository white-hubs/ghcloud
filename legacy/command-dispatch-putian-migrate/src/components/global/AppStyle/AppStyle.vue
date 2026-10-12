<template lang="pug">
div.applInfo(ref="appInfo")
  div.applName(v-for="(item,index) in appList" :key="index" @click="goPage(item)")
    div.imgCtr()
      div.imgContent 
        img(:src="item.fileVO&&item.fileVO.path?item.fileVO.path:defaultIcon")
    div.name {{item.name}}
</template>
<script>
import { defineComponent, ref, reactive, watch, onMounted } from "vue";
import _ from "lodash";
const defaultIcon = "/resource/v1/command-dispatch-putian-migrate/images/traffic.png";
export default defineComponent({
  props: {
    appList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const appInfo = ref();
    watch(
      () => props.appList,
      newValue => {
      },
    );
    const goPage = item => {
      emit("go_page", item);
    };

    return {
      goPage,
      appInfo,
      defaultIcon,
    };
  },
});
</script>
<style lang="less" scoped>
.applInfo {
  width: 100%;
  display: grid;
  @media (max-width: 1366px) {
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 24px;
  }
  @media (min-width: 1366px) and (max-width: 1920px) {
    grid-template-columns: repeat(4, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 24px;
  }

  @media (min-width: 1920px) {
    grid-template-columns: repeat(6, 1fr);
    grid-column-gap: 24px;
    grid-row-gap: 24px;
  }
  grid-template-rows: repeat(auto-fill, 120px);
  justify-items: center;
  align-items: center;
  cursor: pointer;
  padding: 20px;
  padding-left: 0;
}

.applName {
  width: 70px;
  height: 120px;
  background: @white;
  margin-right: 10px;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  > div {
    flex: 1;
  }
  .name {
    font-size: 14px;
    width: 100%;
    height: 20px;
    line-height: 20px;
    color: #535b6c;
    font-family: @fontRegular;
    padding-top: 16px;
  }
}
.imgCtr {
  width: 100%;
  height: 64px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  border-radius: 16px;
  > div {
    flex: 1;
  }
  .blurImg {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .imgContent {
    width: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    img {
      width: 100%;
    }
  }
}
</style>
