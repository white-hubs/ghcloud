import { CubeGateway, type LegacyServiceError } from "@ghcloud/cube-gateway";
import { BASE_API } from "@ghcloud/cube-protocol";
import type {
  FileVO,
  HazardCategoryTreeVO,
  HazardAiRecognitionCommand,
  HazardAiRecognitionVO,
  HazardPendingConfirmationCreateCommand,
} from "@ghcloud/cube-service-interface/hazard-governance";
import type { RiskObjectVO, RiskPageQuery, RiskUnitVO } from "@ghcloud/cube-service-interface/risk-graded-control";

import { authStore } from "./auth-store";
import { cubeFileService } from "./service";

export const HAZARD_FILE_SCENE_CODE = "HIDDENDANGER::FLOW";
export const INSPECTION_COMMAND_SCREEN_SOURCE_SYSTEM = "cube-inspection-command-screen-app";

const HAZARD_GOVERNANCE_API = `${BASE_API}/hazard-governance`;
const RISK_GRADED_CONTROL_API = "/gw-bff/risk-graded-control";
const hazardGateway = new CubeGateway(authStore);

interface PageResult<T> {
  records?: T[];
  total?: number;
  pages?: number;
}

const unwrapHazardResponse = <T>(resp: LegacyServiceError<T> | T): T => {
  if (resp && typeof resp === "object" && "data" in resp) {
    const data = (resp as LegacyServiceError<T>).data;
    if (data !== undefined && data !== null) {
      return data;
    }
  }
  return resp as T;
};

export const uploadHazardSnapshot = async (file: File): Promise<FileVO> => {
  return cubeFileService.uploadFile({
    file,
    tenant: authStore.tenant,
    businessKey: "maintain",
    sceneCode: HAZARD_FILE_SCENE_CODE,
  }) as Promise<FileVO>;
};

export const recognizeHazardsByAi = async (payload: HazardAiRecognitionCommand): Promise<HazardAiRecognitionVO> => {
  const resp = await hazardGateway.create<LegacyServiceError<HazardAiRecognitionVO> | HazardAiRecognitionVO>({
    url: `${HAZARD_GOVERNANCE_API}/hazards/ai/recognition`,
    payload: { ...payload },
  });
  return unwrapHazardResponse(resp);
};

export const getHazardCategoryTree = async (): Promise<HazardCategoryTreeVO[]> => {
  const resp = await hazardGateway.get<LegacyServiceError<HazardCategoryTreeVO[]> | HazardCategoryTreeVO[]>({
    url: `${HAZARD_GOVERNANCE_API}/categories/tree`,
  });
  return unwrapHazardResponse(resp);
};

export const pageRiskUnits = async (params: RiskPageQuery = {}): Promise<PageResult<RiskUnitVO>> => {
  const resp = await hazardGateway.get<LegacyServiceError<PageResult<RiskUnitVO>> | PageResult<RiskUnitVO>>({
    url: `${RISK_GRADED_CONTROL_API}/units`,
    payload: { ...params },
  });
  return unwrapHazardResponse(resp);
};

export const pageRiskObjects = async (params: RiskPageQuery = {}): Promise<PageResult<RiskObjectVO>> => {
  const resp = await hazardGateway.get<LegacyServiceError<PageResult<RiskObjectVO>> | PageResult<RiskObjectVO>>({
    url: `${RISK_GRADED_CONTROL_API}/risk-objects`,
    payload: { ...params },
  });
  return unwrapHazardResponse(resp);
};

export const batchCreateHazardPendingConfirmation = async (payload: HazardPendingConfirmationCreateCommand[]): Promise<unknown> => {
  const resp = await hazardGateway.create<LegacyServiceError<unknown> | unknown>({
    url: `${HAZARD_GOVERNANCE_API}/hazards/pending-confirmation/batch`,
    payload: payload.map((item) => ({ ...item })),
  });
  return unwrapHazardResponse(resp);
};
