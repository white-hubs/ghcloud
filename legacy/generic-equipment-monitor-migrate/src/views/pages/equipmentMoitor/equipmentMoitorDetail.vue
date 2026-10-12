<template>
  <div class="fireControlLookPageDeil">
    <g-layout title="设备信息">
      <template #content-table>
        <a-tabs :activeKey="activeKey" @update:activeKey="activeKey = $event">
          <a-tab-pane key="1" tab="设备信息">
            <div class="tab-pane-content" style="height: 100%; overflow: auto">
              <deviceBasicData ref="deviceBasicData" :deviceId="deviceId"></deviceBasicData>
            </div>
          </a-tab-pane>
          <a-tab-pane key="3" tab="历史数据">
            <div class="tab-pane-content">
              <historyDataRing :deviceId="deviceId" v-if="applicationCode === 'ROTATINGMANAGE'" ref="historyData"></historyDataRing>
              <historyData :deviceId="deviceId" v-else-if="activeKey == 3" ref="historyData"></historyData>
            </div>
          </a-tab-pane>
          <a-tab-pane v-if="applicationCode === 'ELECTRICMANAGE'" key="5" tab="组态">
            <div class="tab-pane-content">
              <template v-if="activeKey === '5'">
                <a-spin v-if="deviceId && !deviceData" tip="加载设备信息…" />
                <scada-device-tab v-else-if="deviceId && deviceProductId" :device-id="String(deviceId)" :product-id="deviceProductId" />
                <a-empty v-else-if="deviceId && deviceData && !deviceProductId" description="当前设备未关联产品，无法匹配二维组态" />
                <a-empty v-else-if="!deviceId" description="缺少设备标识" />
              </template>
            </div>
          </a-tab-pane>
          <a-tab-pane key="4" tab="关联监控">
            <div class="tab-pane-content gvideo-box" v-if="deviceDataVideos && deviceDataVideos.length > 0">
              <div class="gvideo-item" v-for="(item, index) in deviceDataVideos" :key="index">
                <!-- <div > -->
                <span class="gvideo-title">{{ item.name }}</span>
                <CubePlayer
                  class="gvideo"
                  :h5sToken="item.token || item.thirdPartyId"
                  :h5sControl="true"
                  :h5sControlBtn="controlBtn"
                  :device-id="item.id"
                  :dom-id="index"
                  :type="videoAccessMode"
                >
                </CubePlayer>
              </div>
              <!-- </div> -->
            </div>
            <div v-else>
              <a-empty />
            </div>
          </a-tab-pane>
        </a-tabs>
      </template>
      <template #footer-page>
        <div class="buttom-btn" style="text-align: right">
          <a-button @click="goBack">返回</a-button>
        </div>
      </template>
    </g-layout>
  </div>
</template>

<script lang="jsx">
import { defineComponent, getCurrentInstance, onBeforeMount, onMounted, reactive, ref, toRefs, computed, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";

import { CubePlayer } from "@ghcloud/cube-player";

import deviceBasicData from "../components/deviceBasicData.vue";
import batteryHistoryData from "../components/historyData-battery.vue";
import humitureHistoryData from "../components/historyData-humiture.vue";
import historyDataRing from "../components/historyData-ring.vue";
import upsHistoryData from "../components/historyData-ups.vue";
import historyData from "../components/historyData.vue";
import scadaDeviceTab from "./components/scada-device-tab.vue";
import { cubeDeviceCenterService } from "@/api/service";
import { applicationCodeGroud } from "@/utils/enumerate.js";

export default defineComponent({
  name: "",
  components: {
    historyData,
    deviceBasicData,
    CubePlayer,
    upsHistoryData,
    humitureHistoryData,
    batteryHistoryData,
    historyDataRing,
    scadaDeviceTab,
  },
  setup() {
    const refList = ref([]);
    const applicationCode = ref(null);
    const controlBtn = ref(["left", "down", "up", "right", "zoomin", "zoomout", "fullscreen"]);

    // 设备上的控制按钮
    const store = useStore();
    const state = reactive({
      title: "监测详情",
      deviceData: null,
      deviceAttributes: {},
      deviceDataVideos: [],
    });
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const deviceId = route.query.deviceId;
    const deviceBasicData = ref();
    const historyData = ref();
    const activeKey = ref("1");

    /** 与二维组态页 `product.id` 对齐，用于判断是否加载对应组态；实时数据仍按 deviceId 订阅 */
    const deviceProductId = computed(() => {
      const d = state.deviceData;
      if (!d) {
        return "";
      }
      const productInfo = d.productInfo;
      const id = productInfo?.id ?? productInfo?.prodId ?? productInfo?.productId ?? d.baseArchivesInfo?.productId;
      return id != null && id !== "" ? String(id) : "";
    });

    // 监控
    const getBasicVideosData = async () => {
      const data = await proxy.$api.getDeviceVideosInfo(deviceId);
      if (data) {
        state.deviceDataVideos = data;
      }
    };
    const goBack = () => {
      history.back();
    };
    onBeforeMount(() => {
      const application = computed(() => {
        return JSON.parse(sessionStorage.getItem("GH-currentApplication"));
      });
      try {
        applicationCode.value = application.value.code;
        if (applicationCodeGroud[applicationCode.value]) {
          const isMeet = applicationCodeGroud[applicationCode.value].includes("会议");
          if (isMeet) controlBtn.value = ["fullscreen"];
        }
      } catch (error) {}
    });
    const dataType = ref("");
    const tagCode = ["builtin.usage::ups", "builtin.usage::battery", "builtin.usage::temp", "builtin.usage::fire"];
    const getDeviceTagCode = () => {
      try {
        cubeDeviceCenterService.getDeviceTagCode([deviceId]).then((res) => {
          tagCode.forEach((e) => {
            res[deviceId].tags.forEach((item) => {
              if (e === item.tagCode) {
                dataType.value = item.tagCode;
              }
            });
          });
        });
      } catch (error) {}
    };
    onMounted(async () => {
      getBasicVideosData();
      state.deviceData = await proxy.$api.getDeviceInfo({ deviceId });
      getDeviceTagCode();
    });
    const videoAccessMode = window.config.feature?.videoAccessMode ?? "H5S";
    return {
      refList,
      applicationCode,
      historyData,
      ...toRefs(state),
      activeKey,
      refList,
      deviceId,
      dataType,
      tagCode,
      getBasicVideosData,
      goBack,
      deviceBasicData,
      deviceProductId,
      controlBtn,
      videoAccessMode,
      getDeviceTagCode,
    };
  },
});
</script>
<style scoped lang="less">
.fireControlLookPageDeil {
  position: relative;
  height: 100%;

  .buttom-btn {
    position: absolute;
    bottom: 20px;
    right: 20px;
  }
}

.gvideo-box {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
  .gvideo-item {
    height: 300px;
    margin-bottom: 20px;
    width: calc((100% - 20px) / 3);
  }
  .gvideo {
    // margin-bottom: 10px;
    // margin-right: 10px;
    width: 100%;
    // height: 304px;
  }

  .gvideo-title {
    font-size: 16px;
    color: #3d3d3d;
  }
}
:deep(.ant-tabs-tab) {
  margin: 0 !important;
}
</style>
