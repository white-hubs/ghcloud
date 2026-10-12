<template>
  <div class="scada-device-tab">
    <van-loading v-if="loading" vertical class="scada-device-tab__loading">加载中…</van-loading>
    <template v-else>
      <div v-if="error" class="scada-device-tab__error">{{ error }}</div>
      <div v-else-if="!pageHandle" class="scada-device-tab__empty">当前设备产品未绑定二维组态图</div>
      <div v-else class="ignore-scada-canvas scada-device-tab__canvas">
        <CubeScadaPage :instance="pageHandle" />
      </div>
    </template>

    <van-popup
      :show="propertyPopupVisible"
      position="bottom"
      round
      :style="{ maxHeight: '72vh', paddingBottom: 'env(safe-area-inset-bottom)' }"
      teleport="body"
      @update:show="onPropertyPopupShowUpdate"
    >
      <div class="scada-device-tab__popup-head">图元绑定属性</div>
      <div class="scada-device-tab__property-scroll">
        <div v-if="clickedProperties.length" class="scada-device-tab__property-list">
          <div v-for="item in clickedProperties" :key="item.propCode" class="scada-device-tab__property-item">
            <span class="scada-device-tab__property-name">{{ item.propName }}</span>
            <span class="scada-device-tab__property-value">{{ formatPropertyValue(item) }}</span>
          </div>
        </div>
        <van-empty v-else description="该图元未绑定属性" />
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { CubeScada, CubeScadaPage } from '@cube-scada/studio-sdk'
import type { ScadaPageHandle } from '@cube-scada/studio-sdk'
import { GHIotSocket } from '@ghcloud/cube-iot-socket'
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { authStore } from '@/api/auth-store'

const props = defineProps<{
  deviceId: string
  /** 与组态页 `page.product.id` 一致 */
  productId: string
}>()

interface PropertyBinding {
  propCode: string
  propName: string
  unitName?: string
}

interface PageElementModel {
  id: string
  propertyBindings?: PropertyBinding[]
}

interface ScadaPageModel {
  elements?: PageElementModel[]
  product?: { id?: string }
}

interface AttributeSpecItem {
  attributeCode: string
  value?: unknown
  attributeKeyValueVos?: { value?: string | number; keyName?: string; label?: string }[]
}

function parsePageContent(content: string): ScadaPageModel | null {
  try {
    return JSON.parse(content) as ScadaPageModel
  } catch {
    return null
  }
}

function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, '')
}

/**
 * 与 legacy `generic-equipment-monitor-migrate/.../scada-device-tab.vue` 中 `scadaAssetBase` 一致：
 * `VITE_SCADA_ASSET_BASE` → `window.config.feature.scadaAssetBase` → `scadaStudioBase` → 默认 `/resource/v1/scada-studio`
 */
function scadaAssetBase(): string {
  const fromEnv = import.meta.env.VITE_SCADA_ASSET_BASE
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return trimTrailingSlash(fromEnv.trim())
  }
  const feature =
    typeof window !== 'undefined'
      ? ((window as unknown as { config?: { feature?: Record<string, string> } }).config?.feature ?? {})
      : {}
  const raw = feature.scadaAssetBase || feature.scadaStudioBase || '/resource/v1/scada-studio'
  return trimTrailingSlash(String(raw))
}

/**
 * 与 legacy 一致：默认 `/scada/api`（由网关 / Nginx 反代）。
 * 若 H5 与 PC 不同源、根路径未挂组态，构建时设置 `VITE_SCADA_API_BASE` 为完整 URL（与 PC 访问到的组态 API 根一致）。
 */
function scadaApiBase(): string {
  const fromEnv = import.meta.env.VITE_SCADA_API_BASE
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return trimTrailingSlash(fromEnv.trim())
  }
  return '/scada/api'
}

const resolvedScadaApiBase = scadaApiBase()
const resolvedScadaAssetBase = scadaAssetBase()

const scada = CubeScada.create({
  renderMode: 'direct',
  apiBase: resolvedScadaApiBase,
  elementAssetBase: resolvedScadaAssetBase,
  viewerBase: resolvedScadaAssetBase,
})

const pageHandle = ref<ScadaPageHandle | null>(null)
const propertyPopupVisible = ref(false)

function onPropertyPopupShowUpdate(v: boolean): void {
  propertyPopupVisible.value = v
}

const clickedProperties = ref<PropertyBinding[]>([])
const attributeSpecs = ref<AttributeSpecItem[]>([])
const attributeValue = reactive<Record<string, unknown>>({})
const loading = ref(false)
const error = ref('')
const pageModel = ref<ScadaPageModel | null>(null)

let detachElementListener: (() => void) | null = null
let iotSocket: GHIotSocket | null = null

const elementBindingMap = computed(() => {
  const map = new Map<string, PropertyBinding[]>()
  for (const el of pageModel.value?.elements ?? []) {
    if (Array.isArray(el.propertyBindings) && el.propertyBindings.length > 0) {
      map.set(el.id, el.propertyBindings)
    }
  }
  return map
})

function setTagValues(): void {
  if (!pageHandle.value) {
    return
  }
  Object.entries(attributeValue).forEach(([key, value]) => {
    if (value !== undefined) {
      pageHandle.value?.setTagValue(key, value)
    }
  })
}

function handleSocketMessage(message: { msgType: string; content: string }): void {
  if (message.msgType !== 'SUBSCRIBE_PUSH' || !message.content) {
    return
  }
  try {
    const updates = JSON.parse(message.content).msg?.updates as { key: string; value: unknown }[] | undefined
    if (!Array.isArray(updates)) {
      return
    }
    updates.forEach((item) => {
      if (item?.key) {
        attributeValue[item.key] = item.value
      }
    })
    setTagValues()
  } catch {
    /* ignore malformed push */
  }
}

async function loadDeviceAttributes(): Promise<void> {
  const authInfo = { ...authStore, terminal: 'bimops-manage-web' as const, accessToken: authStore.token }
  iotSocket = new GHIotSocket(authInfo)
  iotSocket.onmessage(handleSocketMessage)
  const detail = await iotSocket.deviceDetail({
    deviceId: props.deviceId,
    withSnapShot: true,
    withPropertySpec: true,
  })
  const dataArr = Array.isArray(detail?.dataArr) ? (detail.dataArr as AttributeSpecItem[]) : []
  attributeSpecs.value = dataArr
  dataArr.forEach((item) => {
    attributeValue[item.attributeCode] = item.value
  })
  setTagValues()
}

async function findPageByProduct(productId: string): Promise<{ id: string; page: ScadaPageModel } | null> {
  const listResp = await fetch(`${resolvedScadaApiBase}/pages/`)
  if (!listResp.ok) {
    throw new Error(`获取二维组态列表失败: HTTP ${listResp.status}`)
  }
  const pages = (await listResp.json()) as { id: string }[]
  const details = await Promise.all(
    pages.map(async (page) => {
      const resp = await fetch(`${resolvedScadaApiBase}/pages/${encodeURIComponent(page.id)}`)
      if (!resp.ok) {
        return null
      }
      const detail = (await resp.json()) as { content: string }
      const model = parsePageContent(detail.content)
      return model ? { id: page.id, page: model } : null
    }),
  )
  return details.find((item) => String(item?.page.product?.id ?? '') === String(productId)) ?? null
}

async function loadScada(): Promise<void> {
  if (!props.deviceId || !props.productId) {
    detachElementListener?.()
    detachElementListener = null
    pageHandle.value?.dispose()
    pageHandle.value = null
    pageModel.value = null
    iotSocket?.unsubscribe()
    iotSocket?.dispose()
    iotSocket = null
    return
  }
  loading.value = true
  error.value = ''
  try {
    detachElementListener?.()
    detachElementListener = null
    pageHandle.value?.dispose()
    pageHandle.value = null
    iotSocket?.unsubscribe()
    iotSocket?.dispose()
    iotSocket = null

    const matched = await findPageByProduct(props.productId)
    if (!matched) {
      pageModel.value = null
      return
    }
    pageModel.value = matched.page
    const nextHandle = scada.load({ page: matched.id })
    pageHandle.value = nextHandle
    detachElementListener?.()
    detachElementListener = nextHandle.on('elementEvent', handleElementEvent)
    await loadDeviceAttributes()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

function normalizePropertyValue(binding: PropertyBinding): string {
  const spec = attributeSpecs.value.find((item) => item.attributeCode === binding.propCode)
  const raw = attributeValue[binding.propCode]
  const enumLabel = spec?.attributeKeyValueVos?.find((kv: { value?: string | number; keyName?: string; label?: string }) => String(kv.value) === String(raw))
  return String(enumLabel?.keyName || enumLabel?.label || (raw ?? '--'))
}

function formatPropertyValue(binding: PropertyBinding): string {
  const value = normalizePropertyValue(binding)
  return binding.unitName ? `${value} ${binding.unitName}` : value
}

function handleElementEvent(event: { type: string; element: { id: string } }): void {
  if (event.type !== 'click') {
    return
  }
  const bindings = elementBindingMap.value.get(event.element.id) ?? []
  if (!bindings.length) {
    return
  }
  clickedProperties.value = bindings
  propertyPopupVisible.value = true
}

onMounted(() => {
  void loadScada()
})

watch(
  () => [props.deviceId, props.productId],
  () => {
    void loadScada()
  },
)

onUnmounted(() => {
  detachElementListener?.()
  pageHandle.value?.dispose()
  iotSocket?.unsubscribe()
  iotSocket?.dispose()
})
</script>

<style scoped lang="less">
.scada-device-tab {
  position: relative;
  height: calc(100vh );
  background-color: #F1F2F5;
}

.scada-device-tab__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px 0;
}

.scada-device-tab__canvas {
  min-height: 360px;
  height: calc(100vh - 220px);
  max-height: 640px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  background: #fff;
}

.scada-device-tab__empty,
.scada-device-tab__error {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #969799;
  font-size: 14px;
  text-align: center;
}

.scada-device-tab__error {
  color: #ee0a24;
}

.scada-device-tab__popup-head {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px 8px;
  text-align: center;
  border-bottom: 1px solid #ebedf0;
}

.scada-device-tab__property-scroll {
  max-height: min(420px, 56vh);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 12px 16px 20px;
}

.scada-device-tab__property-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.scada-device-tab__property-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px dashed #ebedf0;
  padding-bottom: 10px;
  font-size: 14px;
}

.scada-device-tab__property-name {
  color: #646566;
  flex-shrink: 0;
  max-width: 46%;
}

.scada-device-tab__property-value {
  color: #323233;
  font-weight: 600;
  text-align: right;
  word-break: break-all;
}
</style>
