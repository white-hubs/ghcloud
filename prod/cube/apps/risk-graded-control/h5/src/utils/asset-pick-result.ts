export const ASSET_PICK_RESULT_KEY = "risk-graded-control:asset-pick-result";

export interface AssetPickResult {
  objectIdx: number;
  id: string;
  name: string;
}

export function saveAssetPickResult(result: AssetPickResult): void {
  sessionStorage.setItem(ASSET_PICK_RESULT_KEY, JSON.stringify(result));
}

export function consumeAssetPickResult(): AssetPickResult | null {
  const raw = sessionStorage.getItem(ASSET_PICK_RESULT_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(ASSET_PICK_RESULT_KEY);
  try {
    return JSON.parse(raw) as AssetPickResult;
  } catch {
    return null;
  }
}
