import { makeListRequest } from "@ghcloud/cube-gateway";
import type { RiskPageQuery } from "@ghcloud/cube-service-interface/risk-graded-control";

const BFF = "/gw-bff/risk-graded-control";

export async function exportRiskXlsx(
  resource: "units" | "unit-inventory" | "control-measures" | "measure-executions" | "notice-cards",
  params?: RiskPageQuery,
): Promise<Blob> {
  const resp = await makeListRequest({
    url: `${BFF}/${resource}/export`,
    payload: { ...params },
  }).send();
  return resp.blob();
}
