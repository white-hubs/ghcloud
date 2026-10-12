<template>
  <SubPanelTemplate title="院区介绍">
    <div class="monitorPanelBox">
      <monitorPanel v-for="(item, index) in monitorPanelData" :key="item.name" :monitorPanelData="item"></monitorPanel>
    </div>
    <div class="hospitalInfo">
      <video v-if="promotionFile?.path && isPromotionVideo" class="promotion-media" :src="promotionFile.path" controls muted />
      <img v-else-if="promotionFile?.path" class="promotion-media" :src="promotionFile.path" alt="" />
      <div class="hospitalInfo-text">
        <div class="hospitalInfo-title">{{ tenantData.name }}</div>
        <div class="scroll_box">
          <div class="scroll-text">
            {{ tenantData.remark }}
          </div>
        </div>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from "vue";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { TenantType } from "@/api/models/ouaa";
import { getTenantDetails } from "@/api/ouaa";
import { cubeMdataService } from "@/api/service";
import monitorPanel from "@/components/businessPanel/court-panel/court-overview/components/monitor-panel.vue";
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";

const tenantData = reactive<TenantType>({
  address: "",
  areaCovered: 0,
  building: 0,
  code: "",
  files: [],
  location: "",
  logo: {
    id: "",
    name: "",
    path: "",
    size: "",
    suffix: "",
  },
  id: "",
  name: "",
  remark: "",
});
const monitorPanelData = ref([
  {
    imgPath: "overView100.png",
    value: "20008",
    unit: "亩",
    name: "占地面积",
  },
  {
    imgPath: "overView99.png",
    value: "56442",
    unit: "m²",
    name: "建筑面积",
  },
]);
const PROMOTION_VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];

const promotionFile = computed(() => tenantData.files[0] ?? null);

const isPromotionVideo = computed(() => {
  const file = promotionFile.value;
  if (!file?.path) return false;
  const lowerPath = file.path.toLowerCase();
  const lowerSuffix = (file.suffix || "").toLowerCase().replace(/^\./, "");
  return PROMOTION_VIDEO_EXTENSIONS.some((ext) => {
    const extName = ext.slice(1);
    return lowerPath.includes(ext) || lowerSuffix === extName;
  });
});

const scrollHeight = ref(0);
const tenantIntroScroll = () => {
  const boxDomHeight = document.querySelector(".hospitalInfo")?.clientHeight;
  const height = document.querySelector(".hospitalInfo-title")?.clientHeight + document.querySelector(".scroll_box")?.clientHeight;
  if (boxDomHeight < height) {
    requestAnimationFrame(() => {
      scrollHeight.value -= 0.1;
      if (0 - scrollHeight.value > height) {
        scrollHeight.value = 0;
      }
      nextTick(() => tenantIntroScroll());
    });
  }
};
// 获取企业介绍
const getTenantInfo = async () => {
  const res = await getTenantDetails(CubeMfRootGlobalState.getInstance().mfRootState.authInfo.tenant);
  const req = await cubeMdataService.getMarketOverviewStatistics();
  Object.assign(tenantData, res);
  nextTick(() => tenantIntroScroll());
  monitorPanelData.value[0].value = String(req.areaCovered);
  monitorPanelData.value[1].value = String(req.floorArea);
};
onMounted(() => {
  getTenantInfo();
});
</script>
<style lang="less" scoped>
.monitorPanelBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 20px;
  margin-bottom: 10px;
}
.hospitalInfo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px;

  .promotion-media {
    width: 188px;
    height: 128px;
    object-fit: cover;
  }

  .hospitalInfo-text {
    width: 169px;
    color: #fff;
    font-size: 12px;

    .hospitalInfo-title {
      font-size: 14px;
      margin-bottom: 5px;
    }
  }

  .scroll_box {
    height: 100px;
    overflow: hidden;

    .scroll-text {
      animation: scroll 30s linear infinite;
      color: #d9e7ff;
    }
  }

  @keyframes scroll {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(-100%);
    }
  }
}
</style>
