<template>
  <div class="monitor-container flex-column" v-if="showMonitor">
    <div class="monitor-box">
      <div class="monitor-item" v-if="allVideos.length" @click="enlargeVideo(allVideos[0])">
        <CustomPlayer :key="allVideos[0].id" @playError="playError" :index="0" :id="allVideos[0].id" :token="allVideos[0].thirdPartyId" />
      </div>
      <div v-else>
        <a-empty description="暂无视频" />
      </div>
    </div>
    <div class="carousel" v-if="monitorLayout !== '1X1'">
      <div class="swiper-box" v-if="swiperVideo.length">
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
          :key="item.id"
          @click="enlargeVideo(item)"
        >
          <CustomPlayer :key="item.id" @playError="playError" :index="index + 1" :id="item.id" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { LeftOutlined, RightOutlined } from "@ant-design/icons-vue";
import { cloneDeep } from "lodash-es";
import { defineComponent, onMounted, reactive, toRefs, watch, getCurrentInstance } from "vue";

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
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
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
    const playError = (error) => {
      const { id } = error;
      if (!id) return;
      const allVideos = cloneDeep(state.allVideos);
      const targetIndex = allVideos.findIndex((item) => item.id === id);
      if (targetIndex === -1 || allVideos[targetIndex].playError) return;
      allVideos[targetIndex].playError = true;
      // 移除失败视频：主画面失败时，列表中的下一个会自动顶上
      state.allVideos = allVideos.filter((item) => !item.playError);
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
      state.pagination.pageNumber += number;
      state.swiperVideo = state.allSwiperVideos.slice(
        (state.pagination.pageNumber - 1) * state.pagination.pageSize,
        state.pagination.pageNumber * state.pagination.pageSize,
      );
    };

    watch(
      () => props.videoList,
      (value) => {
        state.allVideos = (value ?? []).map((item) => ({ ...item, playError: false }));
        state.pagination.pageNumber = 1;
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
          // 初始第一页
          state.pagination.pages = Math.ceil(state.allSwiperVideos.length / state.pagination.pageSize);
          handlePageChange(state.pagination.pageNumber - 1);
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
        color: #00000040 !important;
        cursor: not-allowed;
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
