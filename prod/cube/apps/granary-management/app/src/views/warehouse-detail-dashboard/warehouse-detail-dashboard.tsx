import type { LiangcangWarehouseLocationCardInfoVO } from '@ghcloud/cube-granary-management-service'
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cubeGranaryManagementService } from '@/api/service'
import './warehouse-detail-dashboard.less'

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const formatClock = (d: Date): string => {
  const pad = (n: number): string => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const h = pad(d.getHours())
  const min = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${h}:${min}:${s}  ${y}年${m}月${day}日  ${WEEKDAYS[d.getDay()]}`
}

const formatMetric = (v: number | null | undefined, suffix?: string): string => {
  if (v == null || !Number.isFinite(v)) {
    return '--'
  }
  const t = Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '')
  return suffix != null ? `${t}${suffix}` : t
}

const formatTextMetric = (v: string | null | undefined): string => {
  if (v == null) {
    return '--'
  }
  const t = v.trim()
  return t === '' ? '--' : t
}

type GasCardPropKey = 'gasCo' | 'gasCo2' | 'gasNo' | 'gasO2' | 'gasPh3' | 'gasSo2f2'

const TEMPORARY_DASHBOARD_METRICS = {
  granaryVolume: 5812.57,
  maxHeight: 8.95,
  materialVolume: 5812.57 - 2187.43,
  materialWeight: 17437.71,
  usageRate: 72.66,
} as const

/** 气体检测面板 · 与 {@link LiangcangWarehouseLocationCardInfoVO} 字段对应 */
const GAS_DETECTION_DISPLAY_ROWS: readonly { key: string; prop: GasCardPropKey; name: string; unit: string }[] = [
  { key: 'gas-co', prop: 'gasCo', name: '一氧化碳（CO）', unit: 'ppm' },
  { key: 'gas-co2', prop: 'gasCo2', name: '二氧化碳（CO₂）', unit: 'ppm' },
  { key: 'gas-no', prop: 'gasNo', name: '一氧化氮（NO）', unit: 'ppm' },
  { key: 'gas-o2', prop: 'gasO2', name: '氧气（O₂）', unit: '%VOL' },
  { key: 'gas-ph3', prop: 'gasPh3', name: '磷化氢（PH₃）', unit: 'ppm' },
  { key: 'gas-so2f2', prop: 'gasSo2f2', name: '硫酰氟（SO₂F₂）', unit: 'ppm' },
]

const getQueryParamFromUrl = (key: string): string => {
  const url = new URL(window.location.href)
  const searchValue = url.searchParams.get(key)
  if (searchValue != null && searchValue !== '') {
    return searchValue
  }
  const hashQueryIndex = url.hash.indexOf('?')
  if (hashQueryIndex < 0) {
    return ''
  }
  return new URLSearchParams(url.hash.slice(hashQueryIndex + 1)).get(key) ?? ''
}

const parseWidQuery = (route: ReturnType<typeof useRoute>): number | null => {
  const wid = route.query.wid
  const raw = Array.isArray(wid) ? wid[0] : wid ?? getQueryParamFromUrl('wid')
  if (raw == null || raw === '') {
    return null
  }
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const formatDeviceTotal = (
  status: LiangcangWarehouseLocationCardInfoVO['radarDeviceStatus'],
  unit: '台' | '套',
): string => {
  return status.total == null ? `--${unit}设备` : `${status.total}${unit}设备`
}

const formatDeviceStatus = (status: LiangcangWarehouseLocationCardInfoVO['radarDeviceStatus']): string => {
  if (status.online == null && status.offline == null) {
    return '--'
  }
  const offline = status.offline ?? 0
  if (offline === 0) {
    return '全部在线'
  }
  const online = status.online ?? 0
  return `${online}在线 ${offline}离线`
}

const getDeviceStatusClass = (status: LiangcangWarehouseLocationCardInfoVO['radarDeviceStatus']): string => {
  const base = 'warehouse-detail-dashboard__panel-status'
  if (status.online == null && status.offline == null) {
    return `${base} ${base}--unknown`
  }
  return status.offline != null && status.offline > 0 ? `${base} ${base}--warning` : `${base} ${base}--online`
}

export const WarehouseDetailDashboard = defineComponent({
  name: 'WarehouseDetailDashboard',
  setup: () => {
    const route = useRoute()
    const clockText = ref(formatClock(new Date()))
    const cardInfo = ref<LiangcangWarehouseLocationCardInfoVO | null>(null)
    const loading = ref(true)
    const loadError = ref<string | null>(null)
    let timer: ReturnType<typeof setInterval> | undefined

    const loadCardInfo = async (): Promise<void> => {
      const wid = parseWidQuery(route)
      if (wid == null) {
        loading.value = false
        cardInfo.value = null
        loadError.value = '链接无效：请使用带 wid 的地址访问。'
        return
      }
      loading.value = true
      loadError.value = null
      try {
        const res = await cubeGranaryManagementService.getWarehouseLocationCardInfo(wid)
        cardInfo.value = res
        if (res == null) {
          loadError.value = '未获取到仓库卡片数据'
        }
      } catch {
        cardInfo.value = null
        loadError.value = '加载失败，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    watch(
      () => route.query.wid,
      () => {
        void loadCardInfo()
      },
      { immediate: true },
    )

    onMounted(() => {
      timer = setInterval(() => {
        clockText.value = formatClock(new Date())
      }, 1000)
    })

    onUnmounted(() => {
      if (timer != null) {
        clearInterval(timer)
      }
    })

    const platformTitle = (): string => {
      const name = cardInfo.value?.granaryName?.trim()
      return `智慧粮仓监测平台 · ${name != null && name !== '' ? name : '粮仓名称'}`
    }

    return (): JSX.Element => (
      <div class='warehouse-detail-dashboard-root'>
        <div class='warehouse-detail-dashboard__scroll'>
          <div class='warehouse-detail-dashboard'>
            <div class='warehouse-detail-dashboard__top-bar'>
              <h1 class='warehouse-detail-dashboard__platform-title'>{platformTitle()}</h1>
              <div class='warehouse-detail-dashboard__clock'>{clockText.value}</div>
            </div>

            {loadError.value != null && cardInfo.value == null && !loading.value ? (
              <div class='warehouse-detail-dashboard__empty'>{loadError.value}</div>
            ) : null}

            {cardInfo.value != null ? (
              <>
                <div class='warehouse-detail-dashboard__summary'>
                  {[
                    { label: '类别名称', value: formatTextMetric(cardInfo.value.category) },
                    { label: '总容积', value: formatMetric(TEMPORARY_DASHBOARD_METRICS.granaryVolume, 'm³') },
                    { label: '质量等级', value: formatTextMetric(cardInfo.value.level) },
                    { label: '仓高', value: formatMetric(TEMPORARY_DASHBOARD_METRICS.maxHeight, 'm') },
                  ].map((item) => (
                    <div key={item.label} class='warehouse-detail-dashboard__metric-card'>
                      <span class='warehouse-detail-dashboard__metric-label'>{item.label}</span>
                      <span class='warehouse-detail-dashboard__metric-value'>{item.value}</span>
                    </div>
                  ))}
                </div>

                    <p class='warehouse-detail-dashboard__section-label'>核心数据</p>
                    <div class='warehouse-detail-dashboard__detail-grid'>
                      <section class='warehouse-detail-dashboard__panel'>
                        <div class='warehouse-detail-dashboard__panel-head'>
                          <h2 class='warehouse-detail-dashboard__panel-title'>储量监测雷达</h2>
                          <div class='warehouse-detail-dashboard__panel-meta'>
                            <span>{formatDeviceTotal(cardInfo.value.radarDeviceStatus, '台')}</span>
                            <strong class={getDeviceStatusClass(cardInfo.value.radarDeviceStatus)}>
                              {formatDeviceStatus(cardInfo.value.radarDeviceStatus)}
                            </strong>
                          </div>
                        </div>
                        <div class='warehouse-detail-dashboard__radar-layout'>
                          <div class='warehouse-detail-dashboard__radar-usage-card'>
                            <span class='warehouse-detail-dashboard__radar-usage-value'>
                              {formatMetric(TEMPORARY_DASHBOARD_METRICS.usageRate, '%')}
                            </span>
                            <span class='warehouse-detail-dashboard__radar-usage-label'>仓容使用率</span>
                          </div>
                          <div class='warehouse-detail-dashboard__radar-subgrid'>
                            {[
                              {
                                label: '物料体积',
                                v: formatMetric(TEMPORARY_DASHBOARD_METRICS.materialVolume, 'm³'),
                              },
                              {
                                label: '物料重量',
                                v: formatMetric(TEMPORARY_DASHBOARD_METRICS.materialWeight, 't'),
                              },
                            ].map((item) => (
                              <div key={item.label} class='warehouse-detail-dashboard__mini-card'>
                                <div class='warehouse-detail-dashboard__mini-text'>
                                  <span class='warehouse-detail-dashboard__mini-label'>{item.label}</span>
                                  <span class='warehouse-detail-dashboard__mini-value'>{item.v}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>

                      <section class='warehouse-detail-dashboard__panel'>
                        <div class='warehouse-detail-dashboard__panel-head'>
                          <h2 class='warehouse-detail-dashboard__panel-title'>温湿度传感设备</h2>
                          <div class='warehouse-detail-dashboard__panel-meta'>
                            <span>{formatDeviceTotal(cardInfo.value.temperatureDeviceStatus, '台')}</span>
                            <strong class={getDeviceStatusClass(cardInfo.value.temperatureDeviceStatus)}>
                              {formatDeviceStatus(cardInfo.value.temperatureDeviceStatus)}
                            </strong>
                          </div>
                        </div>
                        <div class='warehouse-detail-dashboard__mini-grid warehouse-detail-dashboard__mini-grid--temperature'>
                          {[
                            { label: '最高温度', key: 't-max', v: formatMetric(null, '°C') },
                            { label: '最低温度', key: 't-min', v: formatMetric(null, '°C') },
                            { label: '平均温度', key: 't-avg', v: formatMetric(null, '°C') },
                            { label: '内部温度', key: 't-in', v: formatMetric(null, '°C') },
                            { label: '外部温度', key: 't-out', v: formatMetric(null, '°C') },
                          ].map((item) => (
                            <div key={item.key} class='warehouse-detail-dashboard__mini-card'>
                              <div class='warehouse-detail-dashboard__mini-text'>
                                <span class='warehouse-detail-dashboard__mini-label'>{item.label}</span>
                                <span class='warehouse-detail-dashboard__mini-value'>{item.v}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section class='warehouse-detail-dashboard__panel'>
                        <div class='warehouse-detail-dashboard__panel-head'>
                          <h2 class='warehouse-detail-dashboard__panel-title'>气体检测</h2>
                          <div class='warehouse-detail-dashboard__panel-meta'>
                            <span>{formatDeviceTotal(cardInfo.value.gasDeviceStatus, '套')}</span>
                            <strong class={getDeviceStatusClass(cardInfo.value.gasDeviceStatus)}>
                              {formatDeviceStatus(cardInfo.value.gasDeviceStatus)}
                            </strong>
                          </div>
                        </div>
                        <div class='warehouse-detail-dashboard__mini-grid warehouse-detail-dashboard__mini-grid--gas'>
                          {GAS_DETECTION_DISPLAY_ROWS.map((row) => (
                            <div key={row.key} class='warehouse-detail-dashboard__mini-card'>
                              <div class='warehouse-detail-dashboard__mini-text'>
                                <span class='warehouse-detail-dashboard__mini-label'>{row.name}</span>
                                <span class='warehouse-detail-dashboard__mini-value'>
                                  {formatMetric(null)}
                                  <span class='warehouse-detail-dashboard__mini-unit'>{row.unit}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </>
                ) : null}
          </div>
        </div>
      </div>
    )
  },
})
