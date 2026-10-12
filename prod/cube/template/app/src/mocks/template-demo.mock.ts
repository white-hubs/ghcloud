import { registerMock } from './index'

/**
 * `template-demo` 示例 mock。
 *
 * 响应结构对齐 `@ghcloud/cube-services-client/template-demo.client`：
 * - list：`{ total, records }`
 * - detail：单体实体
 * - create/update/delete：void 或实体
 */

interface TemplateDemoRecord {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: number;
  remark?: string;
}

const STATUS_POOL: TemplateDemoRecord['status'][] = ['active', 'inactive']

const buildSeed = (): TemplateDemoRecord[] => {
  return Array.from({ length: 42 }).map((_, idx): TemplateDemoRecord => ({
    id: `demo-${idx + 1}`,
    name: `示例条目 #${idx + 1}`,
    status: STATUS_POOL[idx % STATUS_POOL.length],
    createdAt: Date.now() - idx * 86400 * 1000,
    remark: idx % 3 === 0 ? '这是一条示例备注信息' : undefined,
  }))
}

const store: TemplateDemoRecord[] = buildSeed()

export function registerTemplateDemoMocks (): void {
  registerMock('GET', /^\/template\/demo\/list/, async (req) => {
    const url = new URL(req.url)
    const pageNumber = Number(url.searchParams.get('pageNumber') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)
    const keyword = url.searchParams.get('keyword') ?? ''
    const status = url.searchParams.get('status') ?? ''

    const filtered = store.filter((item) => {
      if (keyword && !item.name.includes(keyword)) {
        return false
      }
      if (status && item.status !== status) {
        return false
      }
      return true
    })

    const start = (pageNumber - 1) * pageSize
    return {
      total: filtered.length,
      pages: Math.ceil(filtered.length / pageSize),
      records: filtered.slice(start, start + pageSize),
    }
  })

  registerMock('GET', /^\/template\/demo\/detail\//, async (req) => {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    return store.find((item) => item.id === id) ?? null
  })

  registerMock('POST', '/template/demo', async (req) => {
    const payload = await req.json() as Partial<TemplateDemoRecord>
    const next: TemplateDemoRecord = {
      id: `demo-${store.length + 1}`,
      name: payload.name ?? '未命名',
      status: payload.status ?? 'active',
      createdAt: Date.now(),
      remark: payload.remark,
    }
    store.unshift(next)
    return next
  })

  registerMock('PUT', '/template/demo', async (req) => {
    const payload = await req.json() as TemplateDemoRecord
    const idx = store.findIndex((item) => item.id === payload.id)
    if (idx >= 0) {
      store[idx] = { ...store[idx], ...payload }
      return store[idx]
    }
    return null
  })

  registerMock('DELETE', /^\/template\/demo\//, async (req) => {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    const idx = store.findIndex((item) => item.id === id)
    if (idx >= 0) {
      store.splice(idx, 1)
    }
    return null
  })
}
