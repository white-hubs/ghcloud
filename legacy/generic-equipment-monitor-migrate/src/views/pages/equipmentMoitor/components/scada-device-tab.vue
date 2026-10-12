<template>
  <div class="scada-device-tab">
    <a-spin :spinning="loading">
      <div v-if="error" class="scada-device-tab__error">{{ error }}</div>
      <div v-else-if="!pageHandle" class="scada-device-tab__empty">当前设备产品未绑定二维组态图</div>
      <div v-else class="scada-device-tab__canvas">
        <CubeScadaPage :instance="pageHandle" />
      </div>
    </a-spin>

    <a-modal
      :visible="propertyModalVisible"
      title="图元绑定属性"
      :footer="null"
      :width="520"
      centered
      :body-style="propertyModalBodyStyle"
      @cancel="propertyModalVisible = false"
    >
      <div class="scada-device-tab__property-modal-scroll">
        <div v-if="clickedProperties.length" class="scada-device-tab__property-list">
          <div v-for="item in clickedProperties" :key="item.propCode" class="scada-device-tab__property-item">
            <span class="scada-device-tab__property-name">{{ item.propName }}</span>
            <span class="scada-device-tab__property-value">
              {{ formatPropertyValue(item) }}
            </span>
          </div>
        </div>
        <a-empty v-else description="该图元未绑定属性" />
      </div>
    </a-modal>
  </div>
</template>

<script lang="jsx">
import { CubeScada, CubeScadaPage } from "@cube-scada/studio-sdk";
import { computed, defineComponent, onMounted, onUnmounted, reactive, ref, toRefs, watch } from "vue";

import { GHIotSocket } from "@ghcloud/cube-iot-socket";

import { authStore } from "@/api/auth-store";

/** 弹窗固定高度，避免撑开整页滚动；列表在弹窗内滚动 */
const propertyModalBodyStyle = {
  height: "min(420px, calc(100vh - 160px))",
  maxHeight: "calc(100vh - 160px)",
  padding: "12px 16px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
};

function parsePageContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function scadaAssetBase() {
  const fromEnv = import.meta.env.VITE_SCADA_ASSET_BASE;
  if (typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/$/, "");
  }
  const feature = window.config?.feature ?? {};
  return feature.scadaAssetBase || feature.scadaStudioBase || "/resource/v1/scada-studio";
}

export default defineComponent({
  name: "ScadaDeviceTab",
  components: { CubeScadaPage },
  props: {
    deviceId: {
      type: String,
      required: true,
    },
    /** 设备所属产品 id，与组态页 `page.product.id` 一致；是否展示该组态由此决定 */
    productId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const scada = CubeScada.create({
      renderMode: "direct",
      apiBase: "/scada/api",
      elementAssetBase: scadaAssetBase(),
      viewerBase: scadaAssetBase(),
    });

    const pageHandle = ref(null);
    const propertyModalVisible = ref(false);
    const clickedProperties = ref([]);
    const attributeSpecs = ref([]);
    const attributeValue = reactive({});
    const state = reactive({
      loading: false,
      error: "",
      pageModel: null,
    });

    let detachElementListener = null;
    let iotSocket = null;

    const elementBindingMap = computed(() => {
      const map = new Map();
      for (const el of state.pageModel?.elements ?? []) {
        if (Array.isArray(el.propertyBindings) && el.propertyBindings.length > 0) {
          map.set(el.id, el.propertyBindings);
        }
      }
      return map;
    });

    function setTagValues() {
      if (!pageHandle.value) {
        return;
      }
      Object.entries(attributeValue).forEach(([key, value]) => {
        if (value !== undefined) {
          pageHandle.value?.setTagValue(key, value);
        }
      });
    }

    function handleSocketMessage(message) {
      if (message.msgType !== "SUBSCRIBE_PUSH" || !message.content) {
        return;
      }
      try {
        const updates = JSON.parse(message.content).msg?.updates;
        if (!Array.isArray(updates)) {
          return;
        }
        updates.forEach((item) => {
          if (item?.key) {
            attributeValue[item.key] = item.value;
          }
        });
        setTagValues();
      } catch {
        /* ignore malformed push */
      }
    }

    async function loadDeviceAttributes() {
      const authInfo = { ...authStore, accessToken: authStore.token };
      iotSocket = new GHIotSocket(authInfo);
      iotSocket.onmessage(handleSocketMessage);
      const detail = await iotSocket.deviceDetail({
        deviceId: props.deviceId,
        withSnapShot: true,
        withPropertySpec: true,
      });
      const dataArr = Array.isArray(detail?.dataArr) ? detail.dataArr : [];
      attributeSpecs.value = dataArr;
      dataArr.forEach((item) => {
        attributeValue[item.attributeCode] = item.value;
      });
      setTagValues();
    }

    async function findPageByProduct(productId) {
      const listResp = await fetch("/scada/api/pages/");
      if (!listResp.ok) {
        throw new Error(`获取二维组态列表失败: HTTP ${listResp.status}`);
      }
      const pages = await listResp.json();
      const details = await Promise.all(
        pages.map(async (page) => {
          const resp = await fetch(`/scada/api/pages/${encodeURIComponent(page.id)}`);
          if (!resp.ok) {
            return null;
          }
          const detail = await resp.json();
          const model = parsePageContent(detail.content);
          return model ? { id: page.id, page: model } : null;
        }),
      );
      return details.find((item) => String(item?.page.product?.id ?? "") === String(productId)) ?? null;
    }

    async function loadScada() {
      if (!props.deviceId || !props.productId) {
        pageHandle.value = null;
        state.pageModel = null;
        return;
      }
      state.loading = true;
      state.error = "";
      try {
        const matched = await findPageByProduct(props.productId);
        if (!matched) {
          pageHandle.value = null;
          state.pageModel = null;
          return;
        }
        state.pageModel = matched.page;
        pageHandle.value?.dispose();
        pageHandle.value = scada.load({ page: matched.id });
        detachElementListener?.();
        detachElementListener = pageHandle.value.on("elementEvent", handleElementEvent);
        await loadDeviceAttributes();
      } catch (error) {
        state.error = error instanceof Error ? error.message : String(error);
      } finally {
        state.loading = false;
      }
    }

    function normalizePropertyValue(binding) {
      const spec = attributeSpecs.value.find((item) => item.attributeCode === binding.propCode);
      const raw = attributeValue[binding.propCode];
      const enumLabel = spec?.attributeKeyValueVos?.find((item) => String(item.value) === String(raw));
      return String(enumLabel?.keyName || enumLabel?.label || (raw ?? "--"));
    }

    function formatPropertyValue(binding) {
      const value = normalizePropertyValue(binding);
      return binding.unitName ? `${value} ${binding.unitName}` : value;
    }

    function handleElementEvent(event) {
      if (event.type !== "click") {
        return;
      }
      const bindings = elementBindingMap.value.get(event.element.id) ?? [];
      if (!bindings.length) {
        return;
      }
      clickedProperties.value = bindings;
      propertyModalVisible.value = true;
    }

    onMounted(() => {
      void loadScada();
    });

    watch(
      () => [props.deviceId, props.productId],
      () => {
        void loadScada();
      },
    );

    onUnmounted(() => {
      detachElementListener?.();
      pageHandle.value?.dispose();
      iotSocket?.unsubscribe?.();
      iotSocket?.dispose?.();
    });

    return {
      ...toRefs(state),
      pageHandle,
      propertyModalVisible,
      clickedProperties,
      formatPropertyValue,
      propertyModalBodyStyle,
    };
  },
});
</script>

<style scoped lang="less">
.scada-device-tab {
  height: 100%;
  min-height: 560px;

  &__canvas {
    height: 620px;
    overflow: auto;
    border: 1px solid #f0f0f0;
    background: #fff;
  }

  &__empty,
  &__error {
    min-height: 360px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8c8c8c;
  }

  &__error {
    color: #ff4d4f;
  }

  &__property-modal-scroll {
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__property-list {
    display: grid;
    gap: 10px;
  }

  &__property-item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px dashed #f0f0f0;
    padding-bottom: 8px;
  }

  &__property-name {
    color: #595959;
  }

  &__property-value {
    color: #262626;
    font-weight: 600;
  }
}
</style>
