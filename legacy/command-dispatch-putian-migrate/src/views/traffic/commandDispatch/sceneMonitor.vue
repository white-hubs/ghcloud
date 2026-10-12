<template>
  <div class="monitor-container flex-column">
    <div class="monitor-box">
      <div class="monitor-item" v-if="videoList.length" @click="enlargeVideo(videoList[0])">
        <g-video :token="videoList[0].thirdPartyId"></g-video>
      </div>
      <div v-else>
        <a-empty description="暂无视频" />
      </div>
    </div>
    <div class="carousel">
      <div class="swiper-box">
        <swiper :modules="modules" :slides-per-view="3" :space-between="0" direction="horizontal" :loop="false"
          navigation>
          <swiper-slide v-for="item in swiperVideo" :key="item.id" @click="enlargeVideo(item)">
            <g-video :token="item.thirdPartyId"></g-video>
          </swiper-slide>
        </swiper>
      </div>
    </div>
  </div>
</template>
<script>
import { A11y, Navigation, Pagination, Scrollbar } from "swiper";
import "swiper/modules/navigation/navigation.min.css";
import "swiper/modules/pagination/pagination.min.css";
import "swiper/modules/scrollbar/scrollbar.min.css";
import "swiper/swiper.min.css";
import { Swiper, SwiperSlide } from "swiper/vue/swiper-vue.js";
import { defineComponent, onMounted, reactive, toRefs, watch } from "vue";
export default defineComponent({
  components: {
    Swiper,
    SwiperSlide,
  },
  props: {
    videoList: {
      default: () => {
        return [];
      },
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      swiperVideo: [],
    });
    onMounted(() => { });
    const enlargeVideo = item => {
      emit("enlargeVideo", item);
    };
    watch(
      () => props.videoList,
      value => {
        if (value instanceof Array && value.length > 1) {
          state.swiperVideo = value.filter((item, index) => {
            return index > 0;
          });
        } else {
          state.swiperVideo = [];
        }
      },
    );
    return {
      ...toRefs(state),
      modules: [Navigation, Pagination, Scrollbar, A11y],
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
    }

    :deep(.swiper) {
      height: 100%;
    }
  }
}
</style>
<style>
.swiper-button-prev,
.swiper-button-next {
  --swiper-navigation-size: 25px;
}
</style>
