import { Inject, CONFIG_SERVICE_TOKEN, ConfigService, Injectable } from "@dangao/bun-server";

import type { InspectionStandardVO } from "@ghcloud/cube-service-interface/inspection-ai";

import { ProxyClient } from "@/clients/proxy-client";
import { buildUrl } from "@/services/request-utils";

interface LegacyServiceError<T> {
  data?: T;
  result?: T;
  code?: string;
  message?: string;
}

export interface InspectStandard {
  targetName?: string;
  standardVOS?: InspectionStandardVO[];
  [key: string]: unknown;
}

@Injectable()
export class DailyInspectionProxyService {
  private readonly baseUrl: string;

  constructor(
    private readonly proxyClient: ProxyClient,
    @Inject(CONFIG_SERVICE_TOKEN) private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>("app.dailyInspectionUrl") || "";
  }

  public async performInspection(payload: { id: string; objId: string }): Promise<InspectStandard> {
    const baseUrl = `${this.baseUrl.replace(/\/$/, "")}/inspect-task/${encodeURIComponent(payload.id)}/performInspection`;
    const url = buildUrl(baseUrl, {
      id: payload.id,
      objId: payload.objId,
    });
    const resp = await this.proxyClient.get<LegacyServiceError<InspectStandard> | InspectStandard>(url, {
      passthroughError: true,
    });
    return normalizePerformInspectionResponse(resp.data);
  }
}

function normalizePerformInspectionResponse(response: LegacyServiceError<InspectStandard> | InspectStandard): InspectStandard {
  if (response && typeof response === "object") {
    const legacy = response as LegacyServiceError<InspectStandard>;
    return legacy.data || legacy.result || (response as InspectStandard);
  }
  return {};
}
