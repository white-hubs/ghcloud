/** 可视化菜单关联设备标签前缀，与 visual-config 设备关联一致 */
export const VISUAL_MENU_TAG_PREFIX = "custom.app::visual.";

/** 构建单个 visual 菜单 tagCode（如 custom.app::visual.{menuId}） */
export function buildVisualMenuTagCode(menuId: string): string {
  return `${VISUAL_MENU_TAG_PREFIX}${menuId}`;
}

/** 构建 tagCodes 数组（设备列表弹窗 / getDeviceBuyArea 等） */
export function buildVisualMenuTagCodes(menuId: string): string[] {
  return [buildVisualMenuTagCode(menuId)];
}

/**
 * getDeviceNumber 参数（旧版 ue5 使用 string 形态 tagCodes）
 * @example getDeviceNumber(buildVisualDeviceNumberParams(menuId))
 */
export function buildVisualDeviceNumberParams(menuId: string): { tagCodes: string } {
  return { tagCodes: buildVisualMenuTagCode(menuId) };
}

/**
 * getDeviceBuyArea 参数（旧版 ue5 使用 string[] 形态 tagCodes）
 */
export function buildVisualDeviceBuyAreaParams(menuId: string, areaLevel: number): { tagCodes: string[]; areaLevel: number } {
  return { tagCodes: buildVisualMenuTagCodes(menuId), areaLevel };
}

/**
 * 设备列表弹窗下钻 parameter（对齐 legacy modal-equipmentAll-table）
 * 每次打开弹窗前应传入当前 menuId，避免菜单切换后 tagCodes 过期。
 */
export function buildVisualDeviceModalParameter(menuId: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    tagCodes: buildVisualMenuTagCodes(menuId),
    ...overrides,
  };
}
