import { registerMock } from './index'

/**
 * 全场景示例专用 mock（与 `template-demo` 分离，便于扩展而不污染教学 client）。
 */
export function registerShowcaseMocks (): void {
  registerMock('GET', /^\/template\/showcase\/ping/, () => ({ ok: true, scope: 'showcase' }))

  registerMock('GET', /^\/template\/showcase\/select-users/, () => ({
    records: [
      { id: 'u1', name: 'Mock 用户甲', deptName: '研发中心' },
      { id: 'u2', name: 'Mock 用户乙', deptName: '产品中心' },
      { id: 'u3', name: 'Mock 用户丙', deptName: '运营中心' },
    ],
  }))
}
