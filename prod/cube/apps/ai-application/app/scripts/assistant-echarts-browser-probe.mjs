import { chromium } from 'playwright'

const PROBE_URL = process.env.ASSISTANT_ECHARTS_PROBE_URL ?? 'http://localhost:8890/'

const LINE_OPTION_SOURCE = JSON.stringify({
  grid: { left: 48, right: 24, top: 48, bottom: 48, containLabel: true },
  xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
  yAxis: { type: 'value', name: '用户数（千）' },
  series: [
    { type: 'line', data: [12, 15, 18, 22, 25, 28], name: '活跃用户' },
    { type: 'line', data: [3, 4, 5, 6, 5, 4], name: '新增用户' },
  ],
  title: { text: '用户增长趋势（月度）' },
})

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const chartLogs = []

page.on('console', (msg) => {
  const text = msg.text()
  if (text.includes('[assistant-chart]')) {
    chartLogs.push({ type: msg.type(), text })
    console.log('BROWSER:', msg.type(), text)
  }
})

await page.goto(PROBE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch((error) => {
  console.error(`Could not open dev server at ${PROBE_URL}. Start it with: bun run dev`)
  console.error(error.message)
  process.exit(2)
})

const result = await page.evaluate(async (source) => {
  const hostSource = await fetch('/src/views/assistant/assistant-chart-host.tsx').then((res) => res.text())
  const vueUrl = hostSource.match(/from "([^"]*\/vue\.js\?v=[^"]+)"/)?.[1]
  if (vueUrl == null) {
    throw new Error('Could not resolve Vue runtime URL from assistant-chart-host.tsx')
  }
  const vue = await import(vueUrl)
  const hostModule = await import('/src/views/assistant/assistant-chart-host.tsx')
  const mount = document.createElement('div')
  mount.style.width = '650px'
  mount.style.height = '298px'
  document.body.appendChild(mount)

  let failed = false
  let failError = ''
  const app = vue.createApp({
    render() {
      return vue.h(hostModule.AssistantEchartsChartHost, {
        source,
        onRenderFailed: (error) => {
          failed = true
          failError = error instanceof Error ? error.message : String(error)
        },
      })
    },
  })

  app.mount(mount)
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const canvas = mount.querySelector('canvas')
  const output = {
    failed,
    failError,
    canvas: canvas != null,
    canvasWidth: canvas?.width,
    canvasHeight: canvas?.height,
  }
  app.unmount()
  mount.remove()
  return output
}, LINE_OPTION_SOURCE)

console.log(JSON.stringify({ result, chartLogs }, null, 2))
await browser.close()

const hasChartError = chartLogs.some((entry) => entry.type === 'error')
process.exit(result.failed || !result.canvas || hasChartError ? 1 : 0)
