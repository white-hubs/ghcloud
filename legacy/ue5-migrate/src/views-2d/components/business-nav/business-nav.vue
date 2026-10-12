<template>
  <div class="business-nav flex-between" v-if="businessNavs.length > 0">
    <template v-if="businessNavs.length >= 6">
      <img :src='swiperBtn' class="swiper-left-btn" @click="swiperObj.slidePrev()" />
      <img :src='swiperBtn' class="swiper-right-btn" @click="swiperObj.slideNext()" />
    </template>

    <div class="outSwiperBox swiper">
      <div class="swiper-wrapper" :class="{ 'lessline': businessNavs.length < 6 }">
        <div class="swiper-slide" v-for="(item, i) in businessNavs" :key="i">
          <BusinessNavItem :actived-id="parentNav?.id" :nav-item="item" @click-nav="clickNav" />
        </div>
      </div>
    </div>

    <SubBusinessNavItem :parentNav="parentNav" :actived-id="actived?.id" @click-nav="clickNav"
      v-model:mouse-in-sub-nav="mouseInSubNav" :class="{ 'hide-sub-nav': !showSubNav }" />
  </div>
</template>
<script lang="ts" setup>
import { ref, nextTick, watch } from "vue";
import { sceneTypePage } from "@/api/mdata";
import { SceneDataType } from "@/api/models/mdata";
import BusinessNavItem from './business-nav-item.vue';
import "swiper/swiper.min.css"
import Swiper from 'swiper';
import SubBusinessNavItem from './sub-business-nav-item.vue';

const swiperBtn = '/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png'
const emit = defineEmits<{
  (e: "switchNav", nav: SceneDataType, lv: number): void;
}>();

let businessNavs = ref<SceneDataType[]>([]);
const actived = ref<SceneDataType>(); //当前选中的菜单
const activedParentNav = ref<SceneDataType>(); //当前选中的一级菜单
const parentNav = ref<SceneDataType>()
const swiperObj = ref()
const mouseInSubNav = ref(false) // 鼠标是否移入二级菜单
const showSubNav = ref(false)

/** 获取菜单 */
async function getMenuList() {
  const res = await sceneTypePage();
  if (res.length) {
    businessNavs.value = res;
    actived.value = businessNavs.value[0];
    parentNav.value = businessNavs.value[0];
    activedParentNav.value = businessNavs.value[0];
    if (parentNav.value.children.length) {
      showSubNav.value = true
    }
    emit("switchNav", actived.value, 1);
  }
  nextTick(() => {
    swiperObj.value = new Swiper('.outSwiperBox', {
      loop: true,
      slidesPerView: businessNavs.value.length > 5 ? 5 : businessNavs.value.length,
      observer: true,
      observeSlideChildren: true,
      observeParents: true,
    })
  })
}

/** 点击菜单 */
function clickNav(nav: SceneDataType, lv: number): void {
  if (nav.disabled) {
    return;
  }
  // 切换菜单触发条件: 当前选中的一级菜单改变时
  if (actived.value?.id !== nav.id) {
    // 将当前选中的菜单id存入store中
    emit("switchNav", nav, lv);
  }
  actived.value = nav;
  if (lv === 1) {
    if (parentNav.value.id !== nav.id) {
      parentNav.value = nav
      showSubNav.value = !!parentNav.value.children.length
    } else {
      showSubNav.value = parentNav.value.children.length?!showSubNav.value:false
    }
  }
  activedParentNav.value = parentNav.value;
}

/** 鼠标移入一级菜单 */
function hoverNav(nav: SceneDataType): void {
  parentNav.value = nav
}
/** 鼠标移出一级菜单 */
function mouseleaveNav(nav: SceneDataType): void {
  if (mouseInSubNav.value) {
    return
  }
  if (activedParentNav.value.id !== nav.id) {
    parentNav.value = activedParentNav.value
  }
}
watch(() => mouseInSubNav.value, () => {
  if (!mouseInSubNav.value) {
    parentNav.value = activedParentNav.value
  }
})

/** 清除活动菜单 */
function clearActived(): void {
  actived.value = undefined
}

defineExpose({
  getMenuList,
  clearActived
});
</script>
<style lang="less" scoped>
.outSwiperBox {
  position: relative;
  width: 800px;
  height: 30px;
  overflow: hidden;

  .nav-container {
    display: flex;
    align-items: center;
  }

  .lessline {
    display: flex;
    justify-content: center;
  }

  .swiper-slide {
    display: flex;
    justify-content: center;
  }
}

.swiper-left-btn {
  position: absolute;
  top: 50%;
  width: 48px;
  height: 48px;
  left: -60px;
  transform: translateY(-50%) rotate(-180deg);
  cursor: pointer;
}

.swiper-right-btn {
  position: absolute;
  top: 50%;
  width: 48px;
  height: 48px;
  right: -60px;
  transform: translateY(-50%);
  cursor: pointer;
}

.business-nav {
  transition: all 0.3s ease-in-out;
  transform: translateY(0);
  width: auto;
}

:deep(.swiper-button-prev) {
  background: url("/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png") no-repeat;
  background-size: 100%;
  width: 57px;
  height: 57px;
  transform: scaleX(-1);
  position: absolute;
  top: 25px;
  left: 0;
  margin-right: 30px;

  &::after {
    content: none;
  }
}

:deep(.swiper-button-next) {
  background: url("/resource/v1/ue5-migrate/assets/images/business-icon/right-swiper.png") no-repeat;
  background-size: 100%;
  width: 57px;
  height: 57px;
  position: absolute;
  top: 25px;
  right: 0;

  &::after {
    content: none;
  }
}

.hide-sub-nav {
  transform: translateX(-50%) translateY(200px);
  opacity: 0;
}
.flex-between{
  align-items: flex-end;
}
</style>
