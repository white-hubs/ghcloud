import type {
  AreaTreeNode,
  CandidatePageQuery,
  PageResult,
  ResourceCandidate,
  ResourcePageQuery,
  ResourceRefStatistics,
  ResourceRefType,
  ResourceRefVO,
} from "@ghcloud/cube-service-interface/emergency-dispatch";
import {
  createResourceRef,
  deleteResourceRef,
  getAreaTree,
  getResourceRefStatistics,
  listResourceRefs,
  pageResourceCandidates,
  pageResourceRefs,
} from "@ghcloud/cube-services-client/emergency-dispatch.client";

export {
  createResourceRef,
  deleteResourceRef,
  getAreaTree,
  getResourceRefStatistics,
  listResourceRefs,
  pageResourceCandidates,
  pageResourceRefs,
};

export type {
  AreaTreeNode,
  CandidatePageQuery,
  PageResult,
  ResourceCandidate,
  ResourcePageQuery,
  ResourceRefStatistics,
  ResourceRefType,
  ResourceRefVO,
};

export function typeText(type: ResourceRefType): string {
  if (type === "PERSON") {
    return "人员";
  }
  if (type === "MATERIAL") {
    return "物资";
  }
  return "设备";
}
