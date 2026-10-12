<template>
  <div class="business-nav flex-between" v-if="businessNavs.length > 0&&businessNavs.length!=1">
    <div class="outSwiperBox swiper">
      <div class="swiper-wrapper" :class="{ 'lessline': businessNavs.length < 6 }">
        <div class="swiper-slide" v-for="(item, i) in businessNavs" :key="i">
          <BusinessNavItem :actived-id="actived?.id" :nav-item="item" @click-nav="clickNav" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, nextTick, onMounted } from "vue";
import { sceneTypePage } from "@/api/mdata";
import { SceneDataType } from "@/api/models/mdata";
import BusinessNavItem from './business-nav-item.vue';
import "swiper/swiper.min.css"
import Swiper from 'swiper';


const swiperBtn = '/resource/v1/ue5-sn-migrate/assets/images/business-icon/right-swiper.png'
const emit = defineEmits<{
  (e: "switchNav", nav: any, lv: number): void;
}>();

let businessNavs = ref<any[]>([]);
const actived = ref<any>(); //一级菜单选中
const swiperObj = ref()

/** 获取菜单 */
async function getMenuList() {
  // const res = await sceneTypePage();
  const res = [
    {
        "id": "1760959073580224514",
        "name": "综合分析",
        "code": "202402231725344747",
        "sort": 1,
        "type": "comprehensive"
    },
    {
        "id": "1760959936000430082",
        "name": "消防安全",
        "code": "202402231729001903",
        "sort": 2,
        "type": "fire"
    },
    {
        "id": "1760959866404343809",
        "level": 1,
        "name": "安防监控",
        "code": "202402231728439016",
        "sort": 3,
        "type": "securityMonitoring"
    },{
        "id": "1760959793943547905",
        "level": 1,
        "name": "电气安全",
        "code": "202402231728267434",
        "sort": 4,
        "type": "electrical"
    },
    {
        "id": "1875152100212609025",
        "level": 1,
        "name": "电动车管理",
        "code": "202501032007538874",
        "sort": 5,
        "type": "electricCar"
    },{
        "id": "1760959793943547908",
        "level": 1,
        "name": "用气安全",
        "code": "202402231728267464",
        "sort": 6,
        "type": "gas"
    },
    {
        "id": "1875152053328678913",
        "level": 1,
        "name": "小散工程",
        "code": "202501032007418304",
        "sort": 7,
        "type": "smallProject"
    },
    {
        "id": "1760960063222059009",
        "level": 1,
        "name": "安全管理",
        "code": "202402231729301736",
        "sort": 8,
        "type": "safetyManage"
    }
  ]
  if (res.length) {
    businessNavs.value = res;
    actived.value = businessNavs.value[0];
    emit("switchNav", actived.value, 1);
  }
}

/** 点击菜单 */
function clickNav(nav: any, lv: number): void {
  // 切换菜单触发条件: 当前选中的一级菜单改变时
  if (actived.value?.id !== nav.id) {
    // 将当前选中的菜单id存入store中
    emit("switchNav", nav, lv);
  }
  actived.value = nav;
}
onMounted(() => {
  getMenuList();
});
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
  width: 5.2rem;
  overflow: visible;

  .nav-container {
    display: flex;
    align-items: center;
  }

  .lessline {
    display: flex;
    justify-content: center;
  }
}

.swiper-left-btn {
  position: absolute;
  top: 50%;
  width: 48px;
  height: 48px;
  left: -40px;
  transform: translateY(-50%) rotate(-180deg);
  cursor: pointer;
}

.swiper-right-btn {
  position: absolute;
  top: 50%;
  width: 48px;
  height: 48px;
  right: -40px;
  transform: translateY(-50%);
  cursor: pointer;
}

.business-nav {
  transition: all 0.3s ease-in-out;
  transform: translateY(0);
  width: auto;
}

:deep(.swiper-button-prev) {
  background: url("/resource/v1/ue5-sn-migrate/assets/images/business-icon/right-swiper.png") no-repeat;
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
  background: url("/resource/v1/ue5-sn-migrate/assets/images/business-icon/right-swiper.png") no-repeat;
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
:deep(.swiper-slide){
  flex: 1;
}
</style>
