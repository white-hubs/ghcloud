<template>
  <div class="electrical-wraper">
    <a-spin :spinning="state.mapLoading">
      <div id="maps"></div>
    </a-spin>
    <a-modal v-model:visible="state.visible" centered width="60%" title="详情" @ok="handleOk" destroyOnClose>
      <electric-map-modal :tabOptions="state.modalBottomTabs" :deviceOptions="state.deviceOptions"></electric-map-modal>
      <template #footer>
        <a-button @click="handleOk">关闭</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, onMounted, shallowRef, computed } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
import { message } from "ant-design-vue";
import "@amap/amap-jsapi-types";
import { getNowEnterprise } from "@/utils/auth";
import electricMapModal from "./components/electricMapModal.vue";
import { getAreaDevicePoint, getDevicesAttr, tenantinfo } from "@/api/map";
const PM = '/resource/v1/powermonitor-migrate'
const layerImage = `${PM}/wapian.jpg`
const defaultImage = `${PM}/mapicon.png`
const alarmImage = `${PM}/alarmIcon.gif`
// const lx = new URL("@/assets/lx.png", import.meta.url).href;
const map = shallowRef<AMap.Map>();
const applicationCode = computed(() => {
  let currentApplication = JSON.parse(
    sessionStorage.getItem("GH-currentApplication") as string
  );
  return currentApplication.code;
});
let refMap: any = "";
/*初始化地图 */

const initMap = async () => {
  state.mapLoading = true;
  try {
    const data = await tenantinfo(getNowEnterprise().code);
    const {lntAndLat}=data as any;
    

    const resMap = await AMapLoader.load({
      key: "11ce1f353a30f9fa2b125c842780a4cf",
      version: "2.0",
    });

    refMap = resMap;
    let imageLayer = new resMap.ImageLayer({
      url: layerImage,
      bounds: new resMap.Bounds([104.010476, 30.557396], [104.034262, 30.575086]),
      zooms: [17, 20],
    });
    map.value = new resMap.Map("maps", {
      showLabel: true,
      resizeEnable: true, // 是否监控地图容器尺寸变化
      zoom: 19, // 缩放级别
      center:lntAndLat? lntAndLat.split(",").reverse():'104.020216,30.565014'.split(','), // 初始化地图中心点
      defaultCursor: "default", // 鼠标样式
      // layers: [new resMap.TileLayer(), imageLayer],
    });
    map.value?.on("complete", () => {
      state.mapLoading = false;
    });
  } catch (error) {
    state.mapLoading = false;
    message.error("加载地图失败");
  }
};
const getAreaPoint = async () => {
  const points: any = await getAreaDevicePoint(applicationCode.value);
  points.forEach((item) => {
    addMarker(item);
  });
};
interface pointsItems {
  lntAndLat: string;
  count: Number;
  devices: any[];
}
const addMarker = (point: pointsItems) => {

  const marker = new refMap.Marker({
    map: map.value,
    icon: point.count ?alarmImage  : defaultImage,
    position: point.lntAndLat.split(","),
    imageOffset: new AMap.Pixel(0, 0),
    offset: new AMap.Pixel(-13, -30),
  });
  marker.on("click", () => {
    state.deviceOptions = point.devices.map((item) => {
      return {
        label: item.deviceName,
        value: item.deviceId,
      };
    });
    getPointDetail();
  });
};
const getPointDetail = async () => {
  const result: any = await getDevicesAttr({
    applicationCode: applicationCode.value,
  });
  state.modalBottomTabs = result.slice(0, 3);
  state.visible = true;
};
const handleOk = () => {
  state.visible = false;
};
/**
 * 数据部分
 */
const state = reactive({
  mapLoading: false,
  visible: false,
  modalBottomTabs: [],
  deviceOptions: [{}],
});
onMounted(async () => {
  // 加载地图
  await initMap();
  // 获取点位
  await getAreaPoint();
});

// 使用toRefs解构
// let { } = { ...toRefs(data) }
defineExpose({
  ...toRefs(state),
});
</script>
<style lang="less">
.electrical-wraper {
  height: 100%;
  width: 100%;

  .amap-logo {
    display: none !important;
  }

  .amap-copyright {
    visibility: hidden !important;
  }

  .map-container {
    height: 100%;
    width: 100%;
  }

  #maps {
    width: 100%;
    height: 100%;
  }
}
</style>
