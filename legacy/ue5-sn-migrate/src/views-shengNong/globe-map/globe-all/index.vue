<template>
  <div class="globe" id="globeMap">
    <div v-if="currentScene === 'shenzhen'" class="back-to-china fade-in-delay" @click="backToChina">
      <ArrowLeftOutlined />
      返回全国
    </div>
    <div class="progress-bar-box">
      <div class="progress-bar">
        <div class="inset"></div>
      </div>
      <div class="progress-bar-text">
        <span>加</span>
        <span style="animation-delay: 0.3s">载</span>
        <span style="animation-delay: 0.6s">中</span>
        <span style="animation-delay: 0.9s">.</span>
        <span style="animation-delay: 1.2s">.</span>
        <span style="animation-delay: 1.5s">.</span>
        <!-- <span style="animation-delay: 1.8s">.</span>
        <span style="animation-delay: 2.1s">.</span>
        <span style="animation-delay: 2.4s">.</span> -->
      </div>
    </div>
    <canvas id="canvas" class="globe-map-canvas"></canvas>

    <div ref="chinaLabelRef">
      <china-label :labelData="labelData" ref="chinaLabelSubRef">
        <div class="map-msg" :class="currentScene === 'shenzhen' ? 'SZ' : ''">
          <slot />
        </div>
      </china-label>
    </div>
  </div>
</template>

<script setup>
import { LeftOutlined, ArrowLeftOutlined } from "@ant-design/icons-vue";
import { Vector3 } from "three";
import { onMounted, ref, onBeforeUnmount } from "vue";

import chinaLabel from "../components/chinaLabel.vue";
import { GHChinaMap } from "./gh-index.js";
import { cubeDictionaryService } from "@/api/service";
import { getMarketList } from "@/api/shennong/compre";
import { storeArea } from "@/piniaStore/area";
import { storeMarket } from "@/piniaStore/other";
import bus from "@/utils/bus";

const piniaStoreArea = storeArea();
const piniaStoreMarket = storeMarket();

let app = null;
let labelData = ref(null);
const chinaLabelRef = ref(null);
const chinaLabelSubRef = ref(null);
const currentScene = ref("china"); // globe | china | shenzhen
const mapData = ref([]);
const riskList = ref([]);

// 创建外部标签
const createOutsideLabel = (content, position) => {
  if (app) {
    let label = app.chinaMap.label3d.create("", "outside-label", true);
    let [x, y] = app.chinaMap.geoProjection(position);
    label.init(content, new Vector3(x, -y, 14));
    app.chinaMap.label3d.setLabelStyle(label, 0.08, "x");
    label.setParent(app.chinaMap.outsideLabelGroup);
    label.element.style.zIndex = 999;
    return label;
  }
};
// 移除标签
const removeOutsideLabel = () => {
  if (!app.chinaMap.outsideLabelGroup) return;
  app &&
    app.chinaMap.outsideLabelGroup?.traverse((label) => {
      label && label.remove && label.remove();
    });
};
// 创建sz外部标签
const createSZOutsideLabel = (content, position) => {
  let label = app.chinaMap.szmap.label3d.create("", "outside-label", true);
  let [x, y] = app.chinaMap.szmap.geoProjection(position);
  label.init(content, new Vector3(x, -y, 2));
  app.chinaMap.szmap.label3d.setLabelStyle(label, 0.02, "x");
  label.setParent(app.chinaMap.szmap.outsideLabelGroup);
  label.element.style.zIndex = 999;
  return label;
};
// 移除sz标签
const removeSZOutsideLabel = () => {
  app &&
    app.chinaMap.szmap.outsideLabelGroup?.traverse((label) => {
      label && label.remove && label.remove();
    });
};
onMounted(async () => {
  await getMapData();
  await getStyleConfig();
  piniaStoreArea.marketDataCN = await getMarketData();
  piniaStoreArea.marketDataSZ = await getMarketData(true);

  app = new GHChinaMap(document.getElementById("canvas"));

  // 界面渲染显示
  app.on("renderCompleted", () => {
    bus.emit("mapRenderCompleted");
  });
  // 世界中国地图标签点击
  app.on("labelClick", (event, userData) => {
    currentScene.value = "china";
    // 转场
    app && app.moveCloudGroup?.move();
  });
  // 世界中国地图区块点击
  app.on("chinaMeshClick", (event, userData) => {
    currentScene.value = "china";
    // 转场
    app && app.moveCloudGroup?.move();
  });
  // 深圳地图区块点击
  app.on("szMapClick", (event, userData) => {});
  app.on("szMapMouseOver", (event, userData) => {
    // removeOutsideLabel()
  });
  app.on("szMapMouseOut", (event, userData) => {
    bus.emit("szMapMouseOut", userData);
  });
  // 深圳地图标签点击
  app.on("szMapLabelClick", (event, userData) => {
    labelData.value = { ...userData };
    const market = getHoverMarket(userData.name, true);
    piniaStoreMarket.currentMarketTenant = market?.marketTenant || "";
    piniaStoreMarket.currentMarketName = userData?.name || "";
    chinaLabelSubRef.value.handleLabelClick();
    bus.emit("szMapLabelClick", userData);
  });
  app.on("szMapLabelMouseover", (event, userData) => {
    labelData.value = { ...userData };
    bus.emit("szMapLabelMouseover", userData);
  });
  // 中国地图区域点击
  app.on("chinaMapClick", (event, userData) => {
    bus.emit("chinaMapClick", userData);
    if (userData.name.indexOf("广东") > -1 || userData.name.indexOf("深圳") > -1) {
      currentScene.value = "shenzhen";
      app.chinaMap.moveCloudGroup.move();
      removeOutsideLabel();
    }
  });
  app.on("chinaMapMouseover", (event, userData) => {
    bus.emit("chinaMapMouseover", userData);
  });
  app.on("chinaMapMouseout", (event, userData) => {
    bus.emit("chinaMapMouseout", userData);
  });
  // 中国地图上的标签点击
  app.on("chinaMapLabelClick", (event, userData) => {
    if (["深圳总部", "深圳"].includes(userData.name)) {
      currentScene.value = "shenzhen";
      // 转场
      app.chinaMap.moveCloudGroup.move();
      removeOutsideLabel();
    } else {
      // removeOutsideLabel()
      labelData.value = { ...userData };
    }
    if (!["深圳总部"].includes(userData.name)) {
      const market = getHoverMarket(userData.name, false);
      piniaStoreMarket.currentMarketTenant = market?.marketTenant || "";
      piniaStoreMarket.currentMarketName = userData?.name || "";
      chinaLabelSubRef.value.handleLabelClick();
    }
    bus.emit("chinaMapLabelClick", userData);
  });
  app.on("chinaMapLabelMouseover", (event, userData) => {
    labelData.value = { ...userData };
    bus.emit("chinaMapLabelMouseover", userData);
  });
  viewEventListener();
});
onBeforeUnmount(() => {
  app && app.destroy();
});
const getHoverMarket = (name = "", isSZ = false) => {
  const mapData = isSZ ? [...piniaStoreArea?.marketDataSZ] : [...piniaStoreArea?.marketDataCN, ...piniaStoreArea?.marketDataSZ];
  const currentMarket = mapData.filter((m) => m.name === name)[0];
  return currentMarket?.data;
};
const viewEventListener = () => {
  document.addEventListener("mouseover", (event) => {
    if (!["globe-map-canvas"].includes(event.target.className) && !["globe-map-canvas"].includes(event.srcElement?.parentNode.className)) {
      if (currentScene.value === "china") app && app.chinaMap?.removeLightMesh();
    }
  });
};
// 返回上一级
const goBack = () => {
  if (currentScene.value === "shenzhen") {
    removeSZOutsideLabel();
    app && app.chinaMap.goBack();
    currentScene.value = "china";
  }
  bus.emit("mapDrillDown");
};
// 转场
const goMap = async (sceneName = "china") => {
  await getMapData();
  piniaStoreArea.marketDataCN = getMarketData();
  piniaStoreArea.marketDataSZ = getMarketData(true);
  if (sceneName === "china") {
    if (currentScene.value === "china") return;
    if (currentScene.value === "shenzhen") {
      removeSZOutsideLabel();
      app && app.chinaMap.goBack();
    }
    currentScene.value = "china";
  }
  bus.emit("mapDrillDown");
};
const styleConfig = ref(null);
const getStyleConfig = async () => {
  try {
    const res = await cubeDictionaryService.getDictionaryByItem({
      itemCode: "MARKET_STYLE_CONFIG",
    });
    styleConfig.value = res;
  } catch (error) {}
};
const getMarketStyle = (code) => {
  try {
    const filtercode = ["version", "projectId", "height"].map((item) => `${code}_${item}`);
    const resConfig = styleConfig.value?.filter((item) => filtercode.includes(item.code));
    const config = !resConfig.length ? initConfig(code) : resConfig;

    const market = {};
    market.version = config?.find((i) => i.code === `${code}_version`) ?? null;
    market.projectId = config?.find((i) => i.code === `${code}_projectId`) ?? null;
    market.height = config?.find((i) => i.code === `${code}_height`) ?? null;
    return market;
  } catch {
    return null;
  }
};
// 获取地图市场标签
const getMapData = async () => {
  riskList.value = [];
  mapData.value = [];
  mapData.value = await getMarketList();
};
// 风险指数排序，和综合分析风险指数排序保持一致
const getMarketData = (isSz = false) => {
  let data = [];
  data = mapData.value.map((item, index) => {
    const config = getMarketStyle(item.marketTenant);
    return {
      ...item,
      coordinate: item.coordinate ?? "104.020047,30.564944",
      marketTenant: item.marketTenant,
      name: item.marketName,
      address: item.address,
      center: item.coordinate ? item.coordinate.split(",") : [],
      centroid: item.coordinate ? item.coordinate.split(",") : "",
      status: item.status,
      id: item.marketTenant,
      adcode: "",
      version: config?.version?.variable || "",
      projectId: config?.projectId?.variable || "",
      height: Number(config?.height?.variable || 0),
      data: item,
    };
  });
  data = data.filter((item) => item.centroid && item.center);
  if (!isSz) {
    data = data.filter((item) => !item.address.includes("深圳") && item.status);
    data.unshift({
      name: "深圳总部",
      center: [114.085947, 22.547],
      centroid: [114.143142, 22.643377],
      adcode: 440000,
      start: true,
    });
  } else {
    data = data.filter((item) => item.address.includes("深圳") && item.status);
  }
  let marketV1 = window?.config?.feature?.subMarketV1 || [];
  if (marketV1.length) {
    data?.forEach((e, i) => {
      if (!data[i].version) {
        marketV1?.forEach((v, index) => {
          if ("" + e.marketTenant === v.tenant + "") {
            data[i].version = "1.0";
          }
        });
      }
    });
  }
  return data;
};
const showLabelView = (userData) => {
  if (!userData || !userData.center) return;
  // removeOutsideLabel();
  labelData.value = { ...userData };
  setTimeout(() => {
    createOutsideLabel(chinaLabelRef.value?.innerHTML, userData.center);
  }, 0);
};
const showSZLabelView = (userData) => {
  labelData.value = { ...userData };
  removeSZOutsideLabel();
  setTimeout(() => {
    createSZOutsideLabel(chinaLabelRef.value?.innerHTML, userData.centroid);
  }, 0);
};
const hideLabelView = () => {
  labelData.value = {};
};
const hideSZLabelView = () => {
  removeSZOutsideLabel();
  removeOutsideLabel();
  labelData.value = {};
};
const backToChina = () => {
  removeSZOutsideLabel();
  app && app.chinaMap.goBack();
  currentScene.value = "china";
};
defineExpose({
  app,
  goMap,
  goBack,
  getMarketData,
  getMapData,
  showLabelView,
  hideLabelView,
  showSZLabelView,
  hideSZLabelView,
  getStyleConfig,
  getMarketStyle,
});
</script>

<style lang="less" scoped>
:deep(.ant-spin) {
  max-height: none !important;
  margin-top: -70px;
}

:deep(.ant-spin .ant-spin-text) {
  font-size: 20px !important;
  margin-top: 20px !important;
  // color: #fff;
}

:deep(.ant-spin-lg .ant-spin-dot) {
  font-size: 36px !important;
  color: #fff !important;
}

:deep(.ant-spin-container::after) {
  background-color: transparent !important;
}
</style>
<style lang="scss">
#canvas,
.globe {
  width: 100%;
  height: 100%;
  /* background-color: #000; */
  position: relative;
}

.globe {
  background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/sky-texture2.jpg");
  background-size: cover;
}

// 返回按钮
.return-btn {
  position: absolute;
  // left: 50%;
  // bottom: 10px;
  // transform: translateX(-50%);
  left: 480px;
  top: 200px;
  z-index: 99;
  padding: 5px 24px;
  color: #fff;
  border: 1px solid #289fff;
  margin-bottom: 10px;
  font-size: 12px;
  text-align: center;
  // opacity: 0.9;
  display: block;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    opacity: 1;
  }
}

.clouds-wrap {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99999;
  pointer-events: none;

  .cloud {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/cloud.png") no-repeat;
    background-size: contain;
    transform: translate(110%, 0px);

    &:nth-child(1) {
      margin-left: -400px;
      margin-top: -300px;
      width: 150%;
      height: 150%;
    }

    &:nth-child(2) {
      width: 200%;
      height: 200%;
    }

    &:nth-child(3) {
      width: 300%;
      height: 300%;
      margin-left: -900px;
      margin-top: -900px;
    }
  }
}

.provinces-name-label {
  transform-origin: center center;
  position: relative;
  z-index: 2;

  &-wrap {
    position: relative;

    opacity: 0;
    z-index: 2;

    padding: 0px 20px;
    height: 30px;
    line-height: 30px;

    span {
      position: relative;
      z-index: 3;
      color: #ffffff;
      font-size: 18px;

      &:after {
        position: absolute;
        content: "";
        left: -18px;
        bottom: -3px;
        z-index: 9;
        background-image: url("/resource/v1/ue5-sn-migrate/globe-map/assets/texture/label-arrow.svg");
        // background-color: #7efbf6;
        width: 8px;
        height: 8px;
      }
    }

    $space: 10px;

    &::before {
      background: #334d7b;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      content: "";
      z-index: 1;

      clip-path: polygon(
        0 0,
        0px 100%,
        1px 100%,
        1px 1px,
        calc(100% - $space - 1px) 1px,
        calc(100% - 1px) calc($space + 1px),
        calc(100% - 1px) calc(100% - 1px),
        1px calc(100% - 1px),
        1px 100%,
        100% 100%,
        100% $space,
        calc(100% - $space) 0
      );
    }

    &:after {
      background: #081224;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      content: "";
      z-index: 2;

      clip-path: polygon(
        2px 2px,
        2px calc(100% - 2px),
        calc(100% - 2px) calc(100% - 2px),
        calc(100% - 2px) calc($space + 2px),
        calc(100% - 2px - $space) 2px
      );
    }
  }

  .icon {
    width: 100%;
    height: 30px;
  }

  .focus-label {
    .provinces-name-label-wrap {
      // background: rgba(255, 152, 0, 0.8);
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/texture/label_bg.png") center center no-repeat;
      background-size: cover;

      span {
        &:after {
          display: none;
        }
      }

      &::before,
      &::after {
        display: none;
      }
    }
  }
}

.provinces-label-style02 {
  &-wrap {
    transform: translate(0%, 200%);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 40px;
  }

  .number {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #7efbf6;
    /* text-shadow: 0px 0px 4px 0px #7efbf6; */
    text-shadow: 0 0 5px #7efbf6;
    font-size: 16px;
    /* font-weight: 700; */
    width: 30px;
    height: 30px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }

  .yellow {
    .no {
      color: #fef99e !important;
      text-shadow: 0 0 5px #fef99e !important;
    }
  }
}

.sz-label {
  transform-origin: center center;

  // position: relative;
  &-wrap {
    // transform: translate(50%, 200%);
    opacity: 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 20px;
    height: 30px;
    background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-4.png") no-repeat;
    background-size: 100% 100%;
    background-origin: content-box;
    background-position: right center;
  }

  z-index: 2;

  .number {
    color: #748bb9;
    font-size: 18x;
  }

  .name {
    color: #fff;
    font-size: 18x;
    padding: 0 10px 0 2px;

    span {
      display: block;
    }
  }

  .no {
    color: #ffffff;
    font-size: 18px;
    font-weight: 700;
    // padding: 0 15px;
    padding-left: 5px;
    font-family: PangMenZhengDao-Regular, PangMenZhengDao;
    font-weight: 400;
    color: #ffffff;
    display: none;
  }

  .yellow {
    .no {
      color: #fef99e !important;
      background: linear-gradient(222deg, #8a7344 0%, #b6a684 96.2%);
    }

    .sz-label-wrap {
      background: linear-gradient(90deg, #8a7344 0%, #39341f 116.13%);
    }

    .number {
      color: #fff;
    }
  }

  .squer {
    display: none;
  }

  .label-1 {
    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-1.png") no-repeat;
      background-size: 100% 100%;
    }
  }

  .label-2 {
    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-2.png") no-repeat;
      background-size: 100% 100%;
    }
  }

  .label-3 {
    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-3.png") no-repeat;
      background-size: 100% 100%;
    }
  }
  .label-v1 {
    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-v1.png") no-repeat;
      background-size: 100% 100%;
      padding-left: 10px;
    }
    .name {
      padding-left: 0;
      font-size: 18px;
    }
  }

  .label-no {
    .no {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-squer-no.png") no-repeat;
      background-size: cover;
    }

    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-no.png") no-repeat;
      background-size: 100% 100%;
    }

    .squer {
      display: block;
      // padding: 0 15px;
      height: 14px;
      width: 14px;
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-squer-no.png") no-repeat;
      background-size: contain;
    }

    .name {
      padding-left: 0;
      font-size: 18px;
    }
  }

  .label-zb {
    &-wrap {
      padding-left: 0;
    }

    .no {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-squer-zb.png") no-repeat;
      background-size: cover;
    }

    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-zb.png") no-repeat;
      background-size: 100% 100%;
    }

    .squer {
      display: block;
      // padding: 0 15px;
      height: 14px;
      width: 14px;
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-squer-zb.png") no-repeat;
      background-size: contain;
    }

    .name {
      font-size: 18px;
    }
  }

  .label-default {
    .sz-label-wrap {
      background: url("/resource/v1/ue5-sn-migrate/globe-map/assets/label/label-bg-zb.png") no-repeat;
      background-size: 100% 100%;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 10px;
    }

    .squer,
    .number {
      display: none;
    }

    .name {
      padding-left: 0;
      font-size: 18px;
    }
  }
}

.city-label {
  color: #fff;

  font-size: 12px;

  .other-label {
    display: flex;
    align-items: center;
    padding: 5px;
    border-radius: 4px;
  }

  &.blur {
    filter: blur(2px);
    opacity: 0.5;
  }
}

.other-label {
  transform: translateY(200%);
  opacity: 0;
  background: none;
}

.map-msg {
  position: relative;
  z-index: 1001;

  &.SZ {
    transform: scale(0.8);
  }
}

.loadPage {
  background: #ffffff;
  background-image: url("/resource/v1/ue5-sn-migrate/globe-map/assets/earth/sky-texture2.jpg");
  width: 100%;
  height: 100%;
  position: relative;
  top: 0px;
  left: 0px;
  z-index: 99;

  .progressBar {
    position: absolute;
    width: 100%;
    bottom: 50px;
    padding: 0 30px;

    .loadText {
      text-align: center;
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      font-family: "sourceMedium";
    }

    :deep(.ant-progress-text) {
      color: #ffffff;
    }
  }
}

.progress-bar-box {
  width: 334px;
  position: fixed;
  z-index: 100;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .progress-bar-text {
    color: white;
    margin-top: 29px;
    text-align: center;
    font-size: 18px;
    font-family: PangMenZhengDao-Regular, PangMenZhengDao;
    font-weight: 400;
    color: #ffffff;
    line-height: 22px;
    letter-spacing: 5px;

    span {
      animation-duration: 2s;
      animation-iteration-count: infinite;
      animation-name: loading-text-bounce;
      transform-origin: center bottom;
      animation-fill-mode: both;
      display: inline-block;
    }
  }
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 26px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(50, 118, 255, 0.3);
  overflow: hidden;

  .inset {
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateX(-100%);
    transition: all 2s ease-out;
    background: linear-gradient(90deg, #1de1ff 0%, #105fff 100%);
    border-radius: 12px;
    // background-image: url('../assets/loading-amimate.png');
    // background-repeat: no-repeat;
    // background-size:auto 100%;
    // background-position-x: 100%;
  }
}

.progress-bar-100 .inset {
  transform: translateX(0);
}

.back-to-china {
  position: absolute;
  background: rgb(33 83 181);
  border: 1px solid rgba(6, 48, 88, 0.85);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #fff;
  transition: all 0.3s;
  z-index: 1;
  left: 680px;
  bottom: 200px;
  padding: 5px 10px;
  padding-left: 5px;
}

.fade-in-delay {
  animation-name: fadeIn;
  animation-duration: 1s; /* 持续时间 */
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
  animation-delay: 1s; /* 延迟1秒开始 */
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
<style>
@keyframes loading-text-bounce {
  0% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }

  10% {
    animation-timing-function: cubic-bezier(0.755, 0.05, 0.855, 0.06);
    transform: translate3d(0, -10px, 0) scaleY(1.1);
  }

  20%,
  100% {
    animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1);
    transform: translate3d(0, 0, 0);
  }
}
</style>
