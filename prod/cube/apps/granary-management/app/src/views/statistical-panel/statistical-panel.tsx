import { CubeAuthService } from '@ghcloud/cube-auth-service'
import type { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { message } from '@ghcloud/cube-ui'
import * as echarts from 'echarts'
import { computed, defineComponent, nextTick, onMounted, onUnmounted, ref, type Ref } from 'vue'
import { authStore, navigateToMainApplicationIndex } from '@/api/auth-store'
import {
  type GrainCategoryItem,
  STATISTICAL_PANEL_DATA_PLACEHOLDER,
  STATISTICAL_PANEL_EMPTY_LIST_MESSAGE,
  STATISTICAL_PANEL_MOCK,
} from './mock'
import './statistical-panel.less'

const WAREHOUSE_SCROLL_SPEED = 0.42
const ALARM_SCROLL_SPEED = 0.36

/** 无类别数据时节环分段数（纯视觉占位） */
const GRAIN_CATEGORY_EMPTY_RING_SEGMENTS = 8

const buildGrainCategoryChartOption = (): echarts.EChartsOption => {
  const list = STATISTICAL_PANEL_MOCK.grainCategoryList
  const isEmpty = list.length === 0

  const seriesData = isEmpty
    ? Array.from({ length: GRAIN_CATEGORY_EMPTY_RING_SEGMENTS }, (_, index) => ({
        value: 1,
        name: '',
        itemStyle: {
          color: index % 2 === 0 ? 'rgba(86, 165, 255, 0.32)' : 'rgba(56, 130, 210, 0.22)',
          borderColor: 'rgba(12, 42, 74, 0.85)',
          borderWidth: 1,
        },
      }))
    : list.map((item: GrainCategoryItem) => ({
        name: item.name,
        value: item.ratio,
        itemStyle: { color: item.color },
      }))

  return {
    backgroundColor: 'transparent',
    animation: !isEmpty,
    tooltip: isEmpty
      ? { show: false }
      : {
          trigger: 'item',
          backgroundColor: 'rgba(8, 28, 52, 0.92)',
          borderColor: 'rgba(130, 186, 255, 0.35)',
          textStyle: { color: '#e6f2ff', fontSize: 12 },
          formatter: (params: unknown): string => {
            const p = params as { name: string; percent: number }
            const row = list.find((x) => x.name === p.name)
            const weightStr = row != null ? `${row.weight.toLocaleString()} 万吨` : ''
            return `${p.name}<br/>占比：${p.percent}%<br/>储量：${weightStr}`
          },
        },
    series: [
      {
        type: 'pie',
        radius: ['54%', '78%'],
        center: ['50%', '50%'],
        silent: isEmpty,
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: isEmpty ? { disabled: true } : { scale: false, focus: 'self' },
        itemStyle: isEmpty ? {} : { borderColor: 'rgba(12, 42, 74, 0.85)', borderWidth: 1 },
        data: seriesData,
      },
    ],
  }
}

const formatAlarmTimeNoYear = (time: string): string => {
  const trimmed = time.trim()
  const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/.exec(trimmed)
  if (m != null) {
    return `${m[2]}-${m[3]} ${m[4]}`
  }
  return trimmed
}

const alarmLevelClassMap: Record<'高' | '中' | '低', string> = {
  高: 'is-high',
  中: 'is-middle',
  低: 'is-low',
}

/** 与 `choose-terminal-dropdown` / higreen `nav-menu` 中指挥调度一致 */
const COMMAND_DISPATCH_APP_CODE = 'command-dispatch-app'

/** 默认与宿主新开页一致：`/command-dispatch?cube-secret=...`；若部署在 portal 下可配为 `/portal/xxx/` */
const DEFAULT_COMMAND_DISPATCH_PATH = '/command-dispatch'

const getCommandDispatchEntryPath = (): string => {
  const raw = import.meta.env.VITE_COMMAND_DISPATCH_HOST_PATH
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim()
  }
  return DEFAULT_COMMAND_DISPATCH_PATH
}

const openCommandDispatchWithSecret = (path: string, cubeSecret: string): void => {
  const query = new URLSearchParams({ 'cube-secret': cubeSecret })
  const urlObj = new URL(path, globalThis.location.origin)
  urlObj.search = urlObj.search !== '' ? `${urlObj.search}&${query.toString()}` : `?${query.toString()}`
  globalThis.location.assign(urlObj.toString())
}

/** 「粮食储量与粮情安全监管平台」新窗口地址；可通过 `VITE_STATISTICAL_PANEL_GRAIN_SAFETY_PLATFORM_URL` 覆盖 */
const DEFAULT_GRAIN_SAFETY_PLATFORM_URL = 'http://192.168.1.199:8650/'

const getGrainSafetyPlatformUrl = (): string => {
  const raw = import.meta.env.VITE_STATISTICAL_PANEL_GRAIN_SAFETY_PLATFORM_URL
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim()
  }
  return DEFAULT_GRAIN_SAFETY_PLATFORM_URL
}

const useAutoLoopScroll = (containerRef: Ref<HTMLDivElement | null>, speed: number): (() => void) => {
  let frameId = 0
  let paused = false
  let boundElement: HTMLDivElement | null = null
  let virtualScrollTop = 0

  const onMouseEnter = (): void => {
    paused = true
  }

  const onMouseLeave = (): void => {
    paused = false
  }

  const tick = (): void => {
    const el = containerRef.value
    if (el != null && !paused) {
      const halfHeight = el.scrollHeight / 2
      if (halfHeight > 0) {
        virtualScrollTop += speed
        if (virtualScrollTop >= halfHeight) {
          virtualScrollTop -= halfHeight
        }
        el.scrollTop = virtualScrollTop
      }
    }
    frameId = window.requestAnimationFrame(tick)
  }

  const start = (): void => {
    const el = containerRef.value
    if (el == null) {
      return
    }
    boundElement = el
    virtualScrollTop = el.scrollTop
    boundElement.addEventListener('mouseenter', onMouseEnter)
    boundElement.addEventListener('mouseleave', onMouseLeave)
    frameId = window.requestAnimationFrame(tick)
  }

  const stop = (): void => {
    if (frameId !== 0) {
      window.cancelAnimationFrame(frameId)
      frameId = 0
    }
    if (boundElement != null) {
      boundElement.removeEventListener('mouseenter', onMouseEnter)
      boundElement.removeEventListener('mouseleave', onMouseLeave)
      boundElement = null
    }
  }

  start()
  return stop
}

export const StatisticalPanel = defineComponent({
  name: 'StatisticalPanel',
  setup: () => {
    const warehouseScrollRef = ref<HTMLDivElement | null>(null)
    const alarmScrollRef = ref<HTMLDivElement | null>(null)
    const grainCategoryChartRef = ref<HTMLDivElement | null>(null)

    const warehouseUsageLoopList = computed(() => [...STATISTICAL_PANEL_MOCK.warehouseUsageList, ...STATISTICAL_PANEL_MOCK.warehouseUsageList])
    const alarmLoopList = computed(() => [...STATISTICAL_PANEL_MOCK.alarmEvents, ...STATISTICAL_PANEL_MOCK.alarmEvents])

    let grainCategoryChart: echarts.ECharts | null = null

    let stopWarehouseAutoScroll: (() => void) | null = null
    let stopAlarmAutoScroll: (() => void) | null = null

    const renderGrainCategoryChart = (): void => {
      if (grainCategoryChart == null) {
        return
      }
      grainCategoryChart.setOption(buildGrainCategoryChartOption(), true)
    }

    const resizeGrainCategoryChart = (): void => {
      grainCategoryChart?.resize()
    }

    onMounted(() => {
      stopWarehouseAutoScroll = useAutoLoopScroll(warehouseScrollRef, WAREHOUSE_SCROLL_SPEED)
      stopAlarmAutoScroll = useAutoLoopScroll(alarmScrollRef, ALARM_SCROLL_SPEED)
      void nextTick(() => {
        if (grainCategoryChartRef.value != null) {
          grainCategoryChart = echarts.init(grainCategoryChartRef.value)
          renderGrainCategoryChart()
        }
      })
      window.addEventListener('resize', resizeGrainCategoryChart)
    })

    onUnmounted(() => {
      stopWarehouseAutoScroll?.()
      stopAlarmAutoScroll?.()
      window.removeEventListener('resize', resizeGrainCategoryChart)
      grainCategoryChart?.dispose()
      grainCategoryChart = null
    })

    const openGrainSafetyPlatformInNewTab = (): void => {
      globalThis.window.open(getGrainSafetyPlatformUrl(), '_blank', 'noopener,noreferrer')
    }

    const goToCommandDispatch = async (): Promise<void> => {
      message.loading('正在获取授权')
      try {
        const cubeAuthService = new CubeAuthService(
          COMMAND_DISPATCH_APP_CODE as unknown as CubeTerminalEnum,
          authStore.tenant,
          authStore.token,
        )
        const cubeSecret = await cubeAuthService.getSecretByToken()
        message.destroy()
        const trimmed = typeof cubeSecret === 'string' ? cubeSecret.trim() : ''
        if (trimmed === '') {
          message.error('获取短期鉴权密钥失败，请稍后重试')
          return
        }
        openCommandDispatchWithSecret(getCommandDispatchEntryPath(), trimmed)
      } catch (error) {
        message.destroy()
        message.error('进入指挥调度失败，请稍后重试')
      }
    }

    const goToBusinessBackend = (): void => {
      navigateToMainApplicationIndex()
    }

    return (): JSX.Element => (
      <div class='statistical-panel-root'>
        <div class='statistical-panel-stage'>
          <header class='statistical-panel-header'>
            <div class='statistical-panel-platform-menu'>
              <button type='button' class='statistical-panel-platform-menu-item' onClick={openGrainSafetyPlatformInNewTab}>
                粮食储量与粮情安全监管平台
              </button>
              <button type='button' class='statistical-panel-platform-menu-item' onClick={() => void goToCommandDispatch()}>
                人员安全监控平台
              </button>
              <button type='button' class='statistical-panel-platform-menu-item' onClick={goToBusinessBackend}>
                综合信息管理平台
              </button>
            </div>
            <div class='statistical-panel-title-banner' role='presentation'>
              <span class='statistical-panel-title'>智慧粮仓数据管理中心</span>
            </div>
          </header>

          <div class='statistical-panel-content'>
            <section class='statistical-panel-left'>
              <div class='statistical-panel-card statistical-panel-card--overview'>
                <h2 class='statistical-panel-card-title statistical-panel-card-title--overview'>粮仓概览</h2>
                <div class='statistical-panel-overview-grid'>
                  {STATISTICAL_PANEL_MOCK.overviewMetrics.map((item) => (
                    <div key={item.key} class='statistical-panel-overview-item'>
                      <p>{item.label}</p>
                      <strong>
                        <span class='statistical-panel-overview-value'>{item.value}</span>
                        {item.unit != null && item.unit !== '' ? <span class='statistical-panel-overview-unit'>{item.unit}</span> : null}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div class='statistical-panel-card statistical-panel-usage'>
                <h2 class='statistical-panel-card-title'>仓库使用分析</h2>
                <div class='statistical-panel-scroll-header statistical-panel-usage-header'>
                  <span>仓号</span>
                  <span>粮食</span>
                  <span>库存占比</span>
                  <span>库存（吨）</span>
                  <span>使用率</span>
                </div>
                <div
                  ref={warehouseScrollRef}
                  class={[
                    'statistical-panel-scroll-body',
                    STATISTICAL_PANEL_MOCK.warehouseUsageList.length === 0 ? 'statistical-panel-scroll-body--empty' : undefined,
                  ]}
                >
                  {STATISTICAL_PANEL_MOCK.warehouseUsageList.length === 0 ? (
                    <div class='statistical-panel-data-placeholder'>{STATISTICAL_PANEL_EMPTY_LIST_MESSAGE}</div>
                  ) : (
                    <div class='statistical-panel-scroll-list'>
                      {warehouseUsageLoopList.value.map((item, index) => (
                        <div key={`${item.id}-${index}`} class='statistical-panel-scroll-row'>
                          <span>{item.name}</span>
                          <span class='statistical-panel-grain-name'>{item.grainName}</span>
                          <span class='statistical-panel-usage-rate'>
                            <em
                              class={
                                index % STATISTICAL_PANEL_MOCK.warehouseUsageList.length < 2 ? 'is-warning' : 'is-normal'
                              }
                              style={{ width: `${item.usageRate}%` }}
                            ></em>
                          </span>
                          <span class='statistical-panel-usage-value'>{item.usedWeight} 吨</span>
                          <span class='statistical-panel-usage-percent'>{item.usageRate}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section class='statistical-panel-center'></section>

            <section class='statistical-panel-right'>
              <div class='statistical-panel-card statistical-panel-card--grain-category'>
                <h2 class='statistical-panel-card-title statistical-panel-card-title--grain-category'>粮食类别统计</h2>
                <div class='statistical-panel-category'>
                  <div class='statistical-panel-category-chart'>
                    <div ref={grainCategoryChartRef} class='statistical-panel-category-echarts' aria-hidden='true'></div>
                    <div class='statistical-panel-category-center'>
                      <strong>{STATISTICAL_PANEL_MOCK.grainCategoryCenter.value}</strong>
                      {STATISTICAL_PANEL_MOCK.grainCategoryCenter.unit === '' ? undefined : (
                        <span>{STATISTICAL_PANEL_MOCK.grainCategoryCenter.unit}</span>
                      )}
                    </div>
                  </div>
                  <ul class='statistical-panel-category-legend'>
                    {STATISTICAL_PANEL_MOCK.grainCategoryList.length === 0 ? (
                      <li class='statistical-panel-category-legend-empty'>
                        <span>{STATISTICAL_PANEL_DATA_PLACEHOLDER}</span>
                      </li>
                    ) : (
                      STATISTICAL_PANEL_MOCK.grainCategoryList.map((item) => (
                        <li key={item.key}>
                          <i style={{ background: item.color }}></i>
                          <span>{item.name}</span>
                          <span>
                            {item.weight.toLocaleString()} 万吨（{item.ratio}%）
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              <div class='statistical-panel-card'>
                <h2 class='statistical-panel-card-title'>告警事件统计</h2>
                <div class='statistical-panel-alarm-summary'>
                  <div class='statistical-panel-alarm-total'>
                    <strong
                      class={
                        STATISTICAL_PANEL_MOCK.alarmEvents.length === 0 &&
                        STATISTICAL_PANEL_MOCK.alarmSummaryList.length === 0
                          ? 'statistical-panel-alarm-placeholder-value'
                          : undefined
                      }
                    >
                      {STATISTICAL_PANEL_MOCK.alarmEvents.length === 0 &&
                      STATISTICAL_PANEL_MOCK.alarmSummaryList.length === 0
                        ? STATISTICAL_PANEL_DATA_PLACEHOLDER
                        : STATISTICAL_PANEL_MOCK.alarmTotal}
                    </strong>
                    <span>今日告警总数</span>
                  </div>
                  <div class='statistical-panel-alarm-detail'>
                    {STATISTICAL_PANEL_MOCK.alarmSummaryList.length === 0 ? (
                      <>
                        <div class='statistical-panel-alarm-detail-item statistical-panel-alarm-detail-item--placeholder'>
                          <strong>{STATISTICAL_PANEL_DATA_PLACEHOLDER}</strong>
                          <span>今日新增</span>
                        </div>
                        <div class='statistical-panel-alarm-detail-item statistical-panel-alarm-detail-item--placeholder'>
                          <strong>{STATISTICAL_PANEL_DATA_PLACEHOLDER}</strong>
                          <span>处理中</span>
                        </div>
                        <div class='statistical-panel-alarm-detail-item statistical-panel-alarm-detail-item--placeholder'>
                          <strong>{STATISTICAL_PANEL_DATA_PLACEHOLDER}</strong>
                          <span>待处理</span>
                        </div>
                      </>
                    ) : (
                      STATISTICAL_PANEL_MOCK.alarmSummaryList.map((item) => (
                        <div key={item.key} class={['statistical-panel-alarm-detail-item', `is-${item.tone}`]}>
                          <strong>{item.value}</strong>
                          <span>{item.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div class='statistical-panel-card statistical-panel-alarm-list-card'>
                <h2 class='statistical-panel-card-title'>告警列表</h2>
                <div class='statistical-panel-scroll-header statistical-panel-alarm-header'>
                  <span>时间</span>
                  <span>仓房</span>
                  <span>告警设备</span>
                  <span>告警事件</span>
                  <span>等级</span>
                </div>
                <div
                  ref={alarmScrollRef}
                  class={[
                    'statistical-panel-scroll-body',
                    'statistical-panel-scroll-body-alarm',
                    STATISTICAL_PANEL_MOCK.alarmEvents.length === 0 ? 'statistical-panel-scroll-body--empty' : undefined,
                  ]}
                >
                  {STATISTICAL_PANEL_MOCK.alarmEvents.length === 0 ? (
                    <div class='statistical-panel-data-placeholder'>{STATISTICAL_PANEL_EMPTY_LIST_MESSAGE}</div>
                  ) : (
                    <div class='statistical-panel-scroll-list'>
                      {alarmLoopList.value.map((item, index) => (
                        <div key={`${item.id}-${index}`} class='statistical-panel-scroll-row statistical-panel-scroll-row-alarm'>
                          <span>{formatAlarmTimeNoYear(item.time)}</span>
                          <span>{item.warehouse}</span>
                          <span>{item.device}</span>
                          <span>{item.event}</span>
                          <span class={['statistical-panel-alarm-level', alarmLevelClassMap[item.level]]}>{item.level}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  },
})
