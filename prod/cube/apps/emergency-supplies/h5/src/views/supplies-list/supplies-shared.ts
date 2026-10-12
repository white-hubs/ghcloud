import type { SuppliesVO } from "@ghcloud/cube-service-interface/emergency-supplies";

import { formatDate } from "@/utils/format-datetime";

export type Option = { label: string; value: string };

export type SuppliesFormState = {
  id: string;
  code: string;
  name: string;
  type: string;
  specification: string;
  unit: string;
  photoFileId: string;
  quantity: number | "";
  safetyStockMin: number | "";
  warehouseId: string;
  locationDesc: string;
  longitude: number | "";
  latitude: number | "";
  productionDate: string;
  expiryDate: string;
  supplier: string;
  supplierContact: string;
  remark: string;
};

export const unitOptions: Option[] = [
  { label: "个", value: "个" },
  { label: "件", value: "件" },
  { label: "套", value: "套" },
  { label: "箱", value: "箱" },
  { label: "包", value: "包" },
  { label: "米", value: "米" },
  { label: "吨", value: "吨" },
  { label: "瓶", value: "瓶" },
];

export const createInitialForm = (): SuppliesFormState => ({
  id: "",
  code: "",
  name: "",
  type: "",
  specification: "",
  unit: "个",
  photoFileId: "",
  quantity: "",
  safetyStockMin: "",
  warehouseId: "",
  locationDesc: "",
  longitude: "",
  latitude: "",
  productionDate: "",
  expiryDate: "",
  supplier: "",
  supplierContact: "",
  remark: "",
});

export const normalizeNumber = (value?: number | string): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const formatCoordinateValue = (longitude?: number | string, latitude?: number | string): string => {
  const lng = normalizeNumber(longitude);
  const lat = normalizeNumber(latitude);
  if (lng === undefined || lat === undefined) return "--";
  return `${lng.toFixed(6)},${lat.toFixed(6)}`;
};

export const fillForm = (form: SuppliesFormState, item: SuppliesVO): void => {
  Object.assign(form, {
    id: item.id,
    code: item.code ?? "",
    name: item.name ?? "",
    type: item.type ? String(item.type) : "",
    specification: item.specification ?? "",
    unit: item.unit ?? "个",
    photoFileId: item.photoFileId ?? "",
    quantity: item.quantity ?? item.totalQuantity ?? "",
    safetyStockMin: item.safetyStockMin ?? "",
    warehouseId: item.warehouseId ? String(item.warehouseId) : "",
    locationDesc: item.locationDesc ?? "",
    longitude: item.longitude ?? "",
    latitude: item.latitude ?? "",
    productionDate: formatDate(item.productionDate),
    expiryDate: formatDate(item.expiryDate ?? item.earliestExpiryDate),
    supplier: item.supplier ?? "",
    supplierContact: item.supplierContact ?? "",
    remark: item.remark ?? "",
  });
};

export const assertForm = (form: SuppliesFormState): void => {
  if (!form.name) throw new Error("请输入物资名称");
  if (!form.type) throw new Error("请选择类别");
  if (!form.specification) throw new Error("请输入规格");
  if (!form.unit) throw new Error("请选择单位");
  if (form.quantity === "" || form.quantity === null) {
    throw new Error("请输入库存数量");
  }
  if (!form.warehouseId) throw new Error("请选择仓库");
  if (!form.expiryDate) throw new Error("请选择有效期至");
};

export const buildPayload = (form: SuppliesFormState): Partial<SuppliesVO> => {
  const safetyStockMin = normalizeNumber(form.safetyStockMin);
  const longitude = normalizeNumber(form.longitude);
  const latitude = normalizeNumber(form.latitude);
  const payload: Partial<SuppliesVO> = {
    name: form.name,
    type: form.type,
    specification: form.specification,
    unit: form.unit,
    quantity: Number(form.quantity),
    warehouseId: form.warehouseId,
    locationDesc: form.locationDesc,
    expiryDate: form.expiryDate,
    supplier: form.supplier,
    supplierContact: form.supplierContact,
    remark: form.remark,
  };
  if (form.code) payload.code = form.code;
  if (form.photoFileId) payload.photoFileId = form.photoFileId;
  if (safetyStockMin !== undefined) payload.safetyStockMin = safetyStockMin;
  if (longitude !== undefined) payload.longitude = longitude;
  if (latitude !== undefined) payload.latitude = latitude;
  if (form.productionDate) payload.productionDate = form.productionDate;
  return payload;
};

export const typeColorClass = (styles: Record<string, string>, name?: string): string => {
  const value = name ?? "";
  if (value.includes("消防")) return styles.fire;
  if (value.includes("救援")) return styles.rescue;
  if (value.includes("医疗")) return styles.medical;
  if (value.includes("防护")) return styles.protect;
  if (value.includes("照明")) return styles.light;
  if (value.includes("通讯")) return styles.communication;
  if (value.includes("防汛")) return styles.flood;
  return styles.defaultType;
};

export const statusClassNames = (styles: Record<string, string>, status?: string): string[] => [
  styles.tag,
  status === "ENABLED"
    ? styles.statusEnabled
    : status === "DISABLED" || status === "SCRAPPED"
      ? styles.statusDisabled
      : styles.statusDefault,
];

export const expiryClassNames = (styles: Record<string, string>, level?: string): string[] => [
  styles.expiryTag,
  level === "RED" || level === "EXPIRED"
    ? styles.expiryDanger
    : level === "ORANGE" || level === "YELLOW"
      ? styles.expiryWarn
      : styles.expiryNormal,
];
