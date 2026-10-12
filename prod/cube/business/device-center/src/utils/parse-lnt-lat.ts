/**
 * 将 lntAndLat 规范化为 [经度, 纬度]。
 * 新数据约定为「经度,纬度」；历史租户/设备数据可能为「纬度,经度」。
 */
export const parseLntAndLat = (val: string | undefined | null): [number, number] | null => {
  if (!val || typeof val !== "string") {
    return null;
  }
  const parts = val.split(",").map((s) => s.trim());
  if (parts.length < 2) {
    return null;
  }
  const first = Number(parts[0]);
  const second = Number(parts[1]);
  if (Number.isNaN(first) || Number.isNaN(second)) {
    return null;
  }

  const looksLikeLatLng = Math.abs(first) <= 90 && Math.abs(second) <= 180 && Math.abs(second) > Math.abs(first);
  if (looksLikeLatLng) {
    return [second, first];
  }
  return [first, second];
};

/** 保存用：经度,纬度 */
export const formatLntAndLat = (lng: number, lat: number): string => `${lng},${lat}`;
