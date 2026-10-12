import type { AssetType } from "@ghcloud/cube-asset-management-service";

import { cubeAssetManagementService } from "@/api/asset-management-service";
import type { RiskObjectVO } from "@/types/risk";

export const PROPERTY_ASSET_PAGE_SIZE = 10;

export interface PropertyAssetOption {
  id: string;
  name: string;
  typeName?: string;
  receiveDepName?: string;
  areaName?: string;
}

export interface PropertyAssetListQuery {
  pageNumber: number;
  pageSize: number;
  keyword: string;
}

export interface PropertyAssetPageResult {
  records: PropertyAssetOption[];
  total: number;
}

export function mapPropertyAsset(asset: AssetType): PropertyAssetOption {
  const areaName =
    (asset as AssetType & { areaName?: string }).areaName ??
    asset.area
      ?.map((item) => item.name)
      .filter(Boolean)
      .join("、");
  return {
    id: String(asset.id),
    name: asset.name,
    typeName: asset.typeName,
    receiveDepName: asset.receiveDepName,
    areaName,
  };
}

export async function pagePropertyAssets(query: PropertyAssetListQuery): Promise<PropertyAssetPageResult> {
  const page = await cubeAssetManagementService.getPropertyDetailedPage({
    pageNumber: query.pageNumber,
    pageSize: query.pageSize,
    keyword: query.keyword.trim(),
    status: "",
    areaId: "",
    typeId: "",
    sourceId: "",
    receiveDepId: "",
    usageDate: "",
  });
  return {
    records: page.records.map(mapPropertyAsset),
    total: page.total ?? 0,
  };
}

export async function resolvePropertyAssetNameMap(assetIds: string[]): Promise<Map<string, string>> {
  const uniqueIds = [...new Set(assetIds.filter(Boolean))];
  const nameMap = new Map<string, string>();
  if (uniqueIds.length === 0) return nameMap;

  await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const detail = await cubeAssetManagementService.getDetailById({
          pageNumber: 1,
          pageSize: 1,
          id,
        });
        if (detail?.id && detail?.name) {
          nameMap.set(String(detail.id), detail.name);
        }
      } catch {
        // 资产可能已删除，保留 ID 回退
      }
    }),
  );

  return nameMap;
}

export async function enrichRiskObjectsWithAssetNames(objects: RiskObjectVO[]): Promise<void> {
  const assetIds = objects.map((o) => o.assetId).filter(Boolean) as string[];
  const nameMap = await resolvePropertyAssetNameMap(assetIds);
  for (const obj of objects) {
    if (obj.assetId) {
      obj.assetName = nameMap.get(obj.assetId) ?? obj.assetId;
    }
  }
}
