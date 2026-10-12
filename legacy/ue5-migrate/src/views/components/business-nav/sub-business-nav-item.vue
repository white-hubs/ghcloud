<template>
  <div class="sub-navs swiper" v-if="props.parentNav.children.length > 8" @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <div class="swiper-wrapper">
      <div class="swiper-slide" v-for="(item, i) in props.parentNav.children" :key="i">
        <div class="item" @click="clickNav(item, 2)" :class="item.id === props.activedId ? 'actived' : ''">{{ item.name }}
        </div>
      </div>
    </div>
  </div>
  <div class="sub-navs no-swiper" v-else @mouseenter="onMouseenter" @mouseleave="onMouseleave">
    <div class="item" v-for="(item, i) in props.parentNav.children" :key="i" @click="clickNav(item, 2)"
      :class="item.id === props.activedId ? 'actived' : ''">{{ item.name }}
    </div>
  </div>
</template>
<script setup lang="ts">
import "swiper/swiper.min.css"
import Swiper from 'swiper';
import { SceneDataType } from "@/api/models/mdata";
import { nextTick, ref, watch } from "vue";

const props = withDefaults(defineProps<{
  parentNav: SceneDataType | undefined
  activedId: string
}>(), {
  parentNav: undefined,
  activedId: ''
})
const emits = defineEmits(['clickNav', 'update:mouseInSubNav'])

const swiperObj = ref()

const initSwiper = () => {
  if (props.parentNav.children.length < 8) {
    swiperObj.value = null
    return
  }
  let slidesPerView = 8
  if (props.parentNav && props.parentNav.children.length) {
    slidesPerView = props.parentNav.children.length > 8 ? 8 : props.parentNav.children.length
  }
  swiperObj.value && swiperObj.value.updateSlides();
  swiperObj.value = new Swiper('.sub-navs', {
    loop: true,
    slidesPerView: slidesPerView,
  })
}

watch(() => props.parentNav, () => {
  nextTick(() => {
    initSwiper()
  })
}, { immediate: true })


/**
 * 点击菜单事件
 * @param nav 菜单数据
 * @param lv 层级
 */
function clickNav(nav: SceneDataType, lv: number): void {
  emits("clickNav", nav, lv);
}

const onMouseenter = () => {
  emits('update:mouseInSubNav', true)
}
const onMouseleave = () => {
  emits('update:mouseInSubNav', false)
}
</script>
<style scoped lang="less">
.sub-navs {
  width: 858px;
  height: 50px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 30px;
  transition: all 0.3s ease-in-out;
  &::after{
    position: absolute;
    top: -14.5px;
    width: 100%;
    height: 52px;
    background-color: rgba(0,0,0,0.1);
    content: '';
    z-index: -1;
  }

  .item {
    width: 74px;
    height: 26px;
    background: linear-gradient(rgba(14,34,59,0.08) 0%, rgba(12,20,30,0.46) 100%);
    font-size: 14px;
    font-family: Source Han Sans CN-Regular, Source Han Sans CN;
    font-weight: 400;
    color: #D9E7FF;
    text-align: center;
    line-height: 26px;
    position: relative;
    cursor: pointer;

    &::after,
    &::before {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 1px;
      height: 8px;
      left: -1px;
      content: '';
      background-color: #5487C9;
    }

    &::after {
      left: unset;
      right: -1px;
    }

    &.actived {
      background: linear-gradient(180deg, rgba(61, 135, 220, 0.34) 0%, #4292EE 100%);
    }
  }

  &.no-swiper {
    display: flex;
    justify-content: center;

    .item {
      margin: 0 16.5px;
    }
  }
}
</style>