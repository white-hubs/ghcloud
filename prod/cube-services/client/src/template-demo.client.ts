import { makeCreateRequest, makeDELETERequest, makeGETRequest, makeListRequest, makeUpdateRequest } from '@ghcloud/cube-gateway'
import type { TemplateDemoGateway } from '@ghcloud/cube-service-interface/template-demo'

/**
 * ⚠️ 教学示例：仅供 `prod/cube/template/app` 模板演示使用，**禁止在生产应用中引用**。
 *
 * 演示要点：
 * 1. **未接入 BFF 的接口**：URL 直指原服务路径（以 `/template/demo` 起头而非
 *    `/gw-bff/...`）。真实业务中若接口尚未代理，可参照此方式；一旦迁移到 BFF，
 *    只需改动本文件的 URL 前缀，上游业务无感。
 * 2. **类型回填**：每个导出函数通过 `TemplateDemoGateway['xxx']` 取类型，
 *    保证 interface 与 client 实现严格对齐。
 * 3. **makeXxxRequest**：`cube-gateway` 按方法语义提供了命名工厂，业务优先用它们
 *    而不是 `makeCustomRequest`。
 */

export const listTemplateDemo: TemplateDemoGateway['listTemplateDemo'] = async (params) => {
  const resp = await makeListRequest({
    url: '/template/demo/list',
    payload: { ...params },
  }).send()
  return resp.json()
}

export const getTemplateDemoDetail: TemplateDemoGateway['getTemplateDemoDetail'] = async (id) => {
  const resp = await makeGETRequest({
    url: `/template/demo/detail/${id}`,
  }).send()
  return resp.json()
}

export const createTemplateDemo: TemplateDemoGateway['createTemplateDemo'] = async (params) => {
  const resp = await makeCreateRequest({
    url: '/template/demo',
    payload: { ...params },
  }).send()
  return resp.json()
}

export const updateTemplateDemo: TemplateDemoGateway['updateTemplateDemo'] = async (params) => {
  const resp = await makeUpdateRequest({
    url: '/template/demo',
    payload: { ...params },
  }).send()
  return resp.json()
}

export const deleteTemplateDemo: TemplateDemoGateway['deleteTemplateDemo'] = async (id) => {
  await makeDELETERequest({
    url: `/template/demo/${id}`,
  }).send()
}
