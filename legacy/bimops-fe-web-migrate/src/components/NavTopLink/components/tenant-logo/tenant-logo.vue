<template>
  <div
    class="tenant-logo"
    :class="{ 'menu-fold': cubeSiteSetting.layout.menuFold, route }"
    :style="{ 'box-shadow': showBoxShadow ? '-20px 0px 30px 0px rgba(0, 0, 0, 0.5)' : '' }"
  >
    <a-image :preview="false" :src="systemLogo ?? CubeIcon" :style="{ width: '25px', height: '25px' }"></a-image>
    <div class="systemName" v-show="!cubeSiteSetting.layout.menuFold" ref="systemNameRef" :style="{ fontSize: systemNameFontSize + 'px' }">
      {{ systemTitle }}
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, computed, watch, nextTick } from "vue";

import * as api from "../../../../api";
const CubeIcon = "/resource/v1/bimops-fe-web-migrate/icons/svgs/cube-icon.svg";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { useSiteSetting } from "@/hooks/use-site-setting";
import { useSystemTitleStore } from "@/hooks/use-system-title";

const route = useRoute();
const systemTitleStore = useSystemTitleStore();
const { systemTitle, systemLogo } = storeToRefs(systemTitleStore);
const { setTenantInfo, updateFavicon } = systemTitleStore;

const { cubeSiteSetting } = useSiteSetting();
const showBoxShadow = computed(() => route.path !== "/index" && cubeSiteSetting.layout.value === "MIXIN");
const systemNameRef = ref();
const systemNameFontSize = ref(0);

onMounted(async () => {
  const userId = CubeMfRootGlobalState.getInstance().mfRootState.userInfo?.id;
  const lastTenantId = systemTitleStore.getLastTenantId(userId);
  const tenantId = lastTenantId || CubeMfRootGlobalState.getInstance().mfRootState.authInfo?.tenant;

  if (tenantId) {
    systemTitleStore.setLastTenantId(tenantId);
  }

  // 企业logo
  try {
    const tenantInfo = await api.getTenantInfo(tenantId);
    let imgPath = "";
    if (tenantInfo.logoId) {
      const res = await api.getImage(tenantInfo.logoId);
      imgPath = res.path?.replaceAll("null", "");
      updateFavicon(imgPath);
    }
    setTenantInfo({ logo: imgPath || undefined }, tenantId);
  } catch (error) {}
});

watch(
  () => systemTitle.value,
  () => {
    nextTick(() => {
      const textContainer = systemNameRef.value;
      if (!textContainer) return;
      const text = textContainer.textContent || textContainer.innerText;
      const maxFontSize = 20; // 或者使用你想要的最大字体大小
      const minFontSize = 8; // 最小字体大小
      let fontSize = maxFontSize;

      const availableWidth = systemNameRef.value.clientWidth;
      // 临时元素用于测试字体大小
      const testDiv = document.createElement("div");
      testDiv.style.position = "absolute";
      testDiv.style.whiteSpace = "nowrap";
      testDiv.style.fontSize = fontSize + "px";
      testDiv.textContent = text; // 设置与textContainer相同的文本内容
      document.body.appendChild(testDiv);
      // 调整字体大小直到找到适合的尺寸
      while (fontSize > minFontSize && testDiv.clientWidth > availableWidth) {
        testDiv.style.fontSize = `${fontSize - 0.5}px`; // 或者使用更小的步长
        fontSize -= 0.5;
      }

      // 由于我们在循环中使用了小数减少字体大小，最后需要四舍五入到最近的整数或小数位数
      fontSize = Math.round(fontSize * 2) / 2; // 四舍五入到小数点后一位，如果需要其他精度可以调整

      systemNameFontSize.value = fontSize;
      document.body.removeChild(testDiv);
    });
  },
  { immediate: true },
);
</script>
<style lang="less" scoped>
.tenant-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--menu-unfold-width);
  height: 100%;
  box-sizing: border-box;
  padding: 0 10px;
  transition: all 0.3s;
  overflow-x: hidden;

  &.menu-fold {
    min-width: unset;
    width: var(--menu-fold-width);
  }

  .systemName {
    margin: 0 5px;
    font-size: 14px;
    white-space: nowrap;
    width: calc(100% - 25px);
  }
}
</style>
