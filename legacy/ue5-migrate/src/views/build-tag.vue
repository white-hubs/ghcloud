<template>
  <div class="tag-container">
    <div class="tag-item waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
      :class="{ 'disabled': page === 1 }" @click="pageChange('up')" v-waves>上一页
    </div>

    <Swiper v-if="list.length > pageSize" class="swiper-area" :modules="modules" :slides-per-view="pageSize"
      :slides-per-group="pageSize" :direction="'vertical'" ref="swiperRef">
      <SwiperSlide v-for="(item, index) in areaList" :key="index" v-waves>
        <div  class="tag-item waves-effect" :class="{ 'active': item.id === selected?.id, 'disabled': determineExistenceArea(item) }" @click="changeBuild(item)">{{ item.name }}
        </div>
      </SwiperSlide>
    </Swiper>
    <template v-else>
      <div class="tag-item mg-t-12 waves-effect" :class="{ 'active': item.id === selected?.id, 'disabled': determineExistenceArea(item) }" @click="changeBuild(item)"
        v-for="(item, index) in areaList" :key="index" v-waves>
        {{ item.name }}
      </div>
    </template>

    <div class="tag-item waves-effect" :style="{ visibility: showPageButton ? 'visible' : 'hidden' }"
      :class="{ 'disabled': page === maxPage}" @click="pageChange('down')" v-waves>下一页</div>
  </div>
</template>
<script setup lang="ts">
import { storeMarket } from '@/piniaStore/other'
import { message } from 'ant-design-vue'
import { determineExistenceArea } from "@/views/index";
import { Swiper, SwiperSlide } from "swiper/vue";
// 引入swiper样式（按需导入）
import "swiper/css";
import "swiper/css/navigation"; // 轮播图两边的左右箭头
import { Pagination, Navigation, Scrollbar } from "swiper";
import { commandMap } from '@/components/basic/header/chat-assistant/ai-command'

const modules = [Pagination, Navigation, Scrollbar];
import { AreaType } from "@/api/models/mdata";
import { computed, onMounted, ref, watch } from "vue"
import {UeClient} from "@ghcloud/cube-visual-sdk";
import { getPerspective } from "@/utils/common";
const ueClient = UeClient.getInstance();

interface CurBuild {
  actorId: string,
  props: {
    iconType: "area",
    name: string,
    areaId: string,
    actorId: string,
    modalNames: string,
    buildTagLocation:unknown,
    visualizationAreaType:string
  }
}

const props = withDefaults(defineProps<{
  areaList: AreaType[]
  curBuild?: CurBuild
}>(), {
  areaList: () => []
})
const emits = defineEmits(['changeBuild'])

/** 排序后的列表 */
const list = computed(() => {
  return props.areaList.length ? props.areaList.sort(SortArray) : []
})
/** 当前选中 */
const selected = ref<{ id: string, name: string }>(props.curBuild ? { id: props.curBuild.props.areaId, name: props.curBuild.props.name } : { id: '', name: '' })
watch(() => props.curBuild, () => {
  if(props.curBuild){
    selected.value.id = props.curBuild.props.areaId
    selected.value.name = props.curBuild.props.name
  }
})
const swiperRef = ref()
const pageSize = 10
const page = ref(1)
const showPageButton = computed(() => {
  return props.areaList.length > pageSize
})
const maxPage = computed(() => {
  return Math.ceil(props.areaList.length / pageSize)
})
/** 分页按钮 */
const pageChange = (direction: 'up' | 'down'): void => {
  if (direction === 'up' && page.value <= 1) {
    return
  }
  if (direction === 'down' && page.value >= maxPage.value) {
    return
  }

  if (direction === 'up') {
    page.value--
    swiperRef.value.$el.swiper.slidePrev()
  }

  if (direction === 'down') {
    page.value++
    swiperRef.value.$el.swiper.slideNext()
  }
}

/** 楼栋 tag 点击事件 */
const changeBuild = (item: AreaType) => {
    if (determineExistenceArea(item)) {
      message.warning('当前区域暂无设备！');
      return
    }
    selected.value = item
    const perspective = getPerspective(item.aliasName)
    ueClient.send("getActorByName", { name: item.aliasName }, (res) => {
    const params: CurBuild = {
        actorId: res.id,
        props: {
          iconType: "area",
          name: item.name,
          areaId: item.id,
          actorId: res.id,
          modalNames: item.aliasName,
          buildTagLocation: perspective?.buildTagLocation ?? null,
          visualizationAreaType:item.visualizationAreaType
        },
      }
    emits('changeBuild', params)
    });
}

/** 根据sort排序 */
function SortArray(a: AreaType, b: AreaType) {
  if (a.sort < b.sort) {
    return -1;
  } else if (a.sort > b.sort) {
    return 1;
  } else if (a.sort == b.sort) {
    return 0;
  }
}
</script>
<style scoped lang="less">
.tag-container {
  .mg-t-12 {
    margin-top: 12px;
  }

  .swiper-area {
    min-height: 420px;
    max-height: 420px;
    margin-top: 12px;

    :deep(.swiper-wrapper) {
      justify-content: center;
    }
  }

  .tag-item {
    width: auto;
    padding: 4px 10px;
    background: rgba(6, 6, 6, 0.7);
    color: #FFFFFF;
    font-size: 12px;
    border-radius: 13px;
    text-align: center;
    cursor: pointer;

    &.active {
      background: #2989FF;
    }
  }

  .disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}
</style>