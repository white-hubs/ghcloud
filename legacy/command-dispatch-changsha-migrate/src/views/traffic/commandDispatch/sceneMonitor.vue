<template>
  <div class="monitor-container flex-column" v-if="showMonitor">
    <div class="monitor-box">
      <div class="monitor-item" v-if="allVideos.length" @click="enlargeVideo(allVideos[0])">
        <CustomPlayer
          v-if="!paused"
          @playError="playError"
          :index="0"
          :id="allVideos[0].id"
          :key="allVideos[0].id"
          :token="allVideos[0].thirdPartyId"
        />
      </div>
      <div v-else>
        <a-empty description="暂无视频" />
      </div>
    </div>
    <div class="carousel" v-if="monitorLayout !== '1X1'">
      <div class="swiper-box" v-if="swiperVideo.length && !paused" :key="`carousel-page-${pagination.pageNumber}`">
        <div :class="['swiper-button-prev', pagination.pageNumber === 1 && 'disabled']" @click="handlePageChange(-1)">
          <LeftOutlined style="" />
        </div>
        <div :class="['swiper-button-next', pagination.pageNumber === pagination.pages && 'disabled']" @click="handlePageChange(+1)">
          <RightOutlined />
        </div>
        <div
          class="video-item"
          :style="{
            marginLeft: index === 0 ? '0' : '6px',
          }"
          v-for="(item, index) in swiperVideo"
          :key="`${pagination.pageNumber}-${item.id}`"
          @click="enlargeVideo(item)"
        >
          <<<<<<< HEAD:legacy/command-dispath-changsha-migrate/src/views/traffic/commandDispatch/sceneMonitor.vue
          <CustomPlayer @playError="playError" :index="index + 1" :id="item.id" :key="`${pagination.pageNumber}-${item.id}`" />
          =======
          <CustomPlayer @playError="playError" :index="index + 1" :id="item.id" :key="item.id" />
          >>>>>>>
          eccc39129fed6680ff4eba844f5ae8c852493e62:legacy/command-dispatch-changsha-migrate/src/views/traffic/commandDispatch/sceneMonitor.vue
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
import { cloneDeep } from "lodash-es";
import { defineComponent, onMounted, reactive, toRefs, watch, getCurrentInstance, computed } from "vue";
import { nextTick } from "vue";
import { useStore } from "vuex";

import CustomPlayer from "../../../components/cube-player/index.vue";
export default defineComponent({
  components: {
    LeftOutlined,
    RightOutlined,
    CustomPlayer,
  },
  props: {
    videoList: {
      default: () => {
        return [];
      },
    },
    paused: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const state = reactive({
      swiperVideo: [],
      allSwiperVideos: [],
      showMonitor: true,
      allVideos: [],
      pagination: {
        pageNumber: 1,
        pageSize: 3,
        pages: 0,
      },
      monitorLayout: "2X2",
    });
    let suppressPlayError = false;

    const refreshSwiperPage = () => {
      const { pageNumber, pageSize } = state.pagination;
      state.swiperVideo = state.allSwiperVideos.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    };

    const playError = (error) => {
      if (suppressPlayError) {
        return;
      }
      const { errorType, index } = error;
      // 轮播小窗切换/销毁时可能误报，不参与主列表重排
      if (index > 0) {
        return;
      }
      const allVideos = cloneDeep(state.allVideos);
      const targetIndex = 0;
      if (!allVideos[targetIndex]) {
        return;
      }
      allVideos[targetIndex].playError = true;
      if (errorType === "PLAY_ERROR") {
        const videoLength = allVideos.length;
        for (let i = videoLength - 1; i >= 0; i--) {
          if (!allVideos[i].playError) {
            [allVideos[0], allVideos[i]] = [allVideos[i], allVideos[0]];
            break;
          }
        }
        nextTick(() => {
          state.allVideos = allVideos.filter((item) => !item.playError);
        });
      }
    };
    onMounted(() => {
      getServiceConfiguration();
    });
    const getServiceConfiguration = async () => {
      const res = await proxy.$api.getServiceConfiguration();
      if (!res.length) return;
      if (!res[0]) return;
      if (!res[0].variable) return;
      const variable = JSON.parse(res[0].variable);
      state.monitorLayout = variable.monitor_layout;
    };
    const enlargeVideo = (item) => {
      emit("enlargeVideo", item);
    };
    const handlePageChange = (number) => {
      const nextPage = state.pagination.pageNumber + number;
      if (nextPage < 1 || nextPage > state.pagination.pages) {
        return;
      }
      suppressPlayError = true;
      state.swiperVideo = [];
      state.pagination.pageNumber = nextPage;
      nextTick(() => {
        refreshSwiperPage();
        nextTick(() => {
          suppressPlayError = false;
        });
      });
    };

    watch(
      () => props.videoList,
      (value) => {
        if (!value.length) {
          state.allVideos = [];
          state.swiperVideo = [];
          state.allSwiperVideos = [];
          state.pagination.pageNumber = 1;
          state.pagination.pages = 0;
          state.showMonitor = true;
          return;
        }
        state.showMonitor = false;
        nextTick(() => {
          state.allVideos = value;
          state.pagination.pageNumber = 1;
        });
      },
      { deep: true },
    );
    watch(
      () => state.allVideos,
      () => {
        if (state.allVideos.length === 0) {
          state.swiperVideo = [];
          emit("notVideo");
          state.showMonitor = true;
          return;
        }
        if (state.allVideos instanceof Array && state.allVideos.length > 1) {
          const list = state.allVideos
            .filter((item, index) => {
              return index > 0;
            })
            .filter((item) => item.status);
          state.allSwiperVideos = list;
          state.pagination.pages = Math.ceil(state.allSwiperVideos.length / state.pagination.pageSize);
          if (state.pagination.pageNumber > state.pagination.pages) {
            state.pagination.pageNumber = Math.max(1, state.pagination.pages);
          }
          refreshSwiperPage();
        } else {
          state.swiperVideo = [];
          state.allSwiperVideos = [];
          state.pagination.pages = Math.ceil(state.allSwiperVideos.length / state.pagination.pageSize);
        }
        state.showMonitor = true;
      },
      { deep: true },
    );

    return {
      playError,
      handlePageChange,
      ...toRefs(state),
      enlargeVideo,
    };
  },
});
</script>

<style lang="less" scoped>
.monitor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;

  .monitor-box {
    width: 100%;
    flex: 1;
    margin-bottom: 10px;
    color: #fff;
    overflow: hidden;

    .monitor-item {
      width: 100%;
      height: 100%;
    }
  }

  .carousel {
    width: 100%;
    height: 80px;

    .swiper-box {
      width: 100%;
      height: 100%;
      display: flex;
      position: relative;

      .swiper-button-prev,
      .swiper-button-next {
        font-size: 40px;
        z-index: 999;
        color: #1e4690;
        position: absolute;
        cursor: pointer;
        top: 50%;
        transform: translateY(-50%);
      }

      .swiper-button-prev {
        left: 0;
      }

      .swiper-button-next {
        right: 0;
      }

      .disabled {
        color: rgba(38, 56, 77, 0.4) !important;
        cursor: not-allowed;
        pointer-events: none;
      }
    }

    .video-item {
      width: 32%;
      margin-left: 4px;
      height: 100%;
    }
  }
}
</style>
