const normalizeStaticMapDevicePoint = (item = {}) => {
  const deviceId = String(item.deviceId || item.id || "").trim();
  const x = Number(item.x);
  const y = Number(item.y);
  if (!deviceId || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
  return { deviceId, x, y };
};

export const parseStaticMapDeviceDictionary = (dictionaryItems) => {
  const dictionaryItem = Array.isArray(dictionaryItems) ? dictionaryItems[0] : null;
  if (!dictionaryItem?.variable) return [];
  try {
    const value = typeof dictionaryItem.variable === "string" ? JSON.parse(dictionaryItem.variable) : dictionaryItem.variable;
    return Array.isArray(value) ? value.map(normalizeStaticMapDevicePoint).filter(Boolean) : [];
  } catch (_ignore) {
    return [];
  }
};

export const mergeStaticMapDevices = (pointConfigs, devices) => {
  if (!Array.isArray(pointConfigs) || !Array.isArray(devices)) return [];
  const pointByDeviceId = new Map(
    pointConfigs.filter((point) => point?.deviceId != null).map((point) => [String(point.deviceId).trim(), point]),
  );
  return devices.flatMap((device) => {
    if (device?.id == null) return [];
    const point = pointByDeviceId.get(String(device.id).trim());
    return point ? [{ ...device, x: point.x, y: point.y }] : [];
  });
};
