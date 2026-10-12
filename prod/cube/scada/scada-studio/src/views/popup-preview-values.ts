import type { ElementInstance, ElementPropertyBinding } from "@cube-scada/core";

export function createPreviewDeviceValue(binding: ElementPropertyBinding, index: number): string | number | boolean {
  const dataType = (binding.dataType ?? "").trim().toLowerCase();
  const identity = `${binding.propCode} ${binding.propName}`.toLowerCase();

  if (dataType.includes("bool") || /(状态|开关|启用|运行|告警|status|switch|enable|running|alarm)/i.test(identity)) {
    return index % 2 === 0;
  }
  if (/(温度|temperature|temp)/i.test(identity)) return 26.5;
  if (/(湿度|humidity)/i.test(identity)) return 58;
  if (/(压力|pressure)/i.test(identity)) return 1.25;
  if (/(转速|speed|rpm)/i.test(identity)) return 1450;
  if (/(功率|power)/i.test(identity)) return 75.5;
  if (/(电压|voltage)/i.test(identity)) return 220;
  if (/(电流|current)/i.test(identity)) return 12.8;
  if (/(number|int|float|double|decimal)/i.test(dataType) || binding.unitName) return Number((20 + index * 7.5).toFixed(2));
  return `模拟值 ${index + 1}`;
}

export function createPreviewDeviceValueReader(source: ElementInstance) {
  const values = new Map(
    (source.propertyBindings ?? []).map((binding, index) => [binding.propCode, createPreviewDeviceValue(binding, index)] as const),
  );
  return (propCode: string) => values.get(propCode);
}

export interface PreviewPopupDeviceContext {
  source: ElementInstance;
  readValue: (propCode: string) => string | number | boolean | undefined;
}

export function createPreviewPopupDeviceContext(source: ElementInstance): PreviewPopupDeviceContext {
  if (source.deviceBinding !== "required" || (source.propertyBindings?.length ?? 0) > 0) {
    return { source, readValue: createPreviewDeviceValueReader(source) };
  }

  const previewBindings: ElementPropertyBinding[] = [
    { propCode: "__preview_binding_name", propName: "属性绑定名称", dataType: "string" },
    { propCode: "__preview_running", propName: "运行状态", dataType: "boolean" },
    { propCode: "__preview_value", propName: "模拟属性", dataType: "number" },
  ];
  const values = new Map<string, string | number | boolean>([
    ["__preview_binding_name", source.propertyBindName?.trim() || source.label?.trim() || "模拟设备"],
    ["__preview_running", true],
    ["__preview_value", 26.5],
  ]);

  return {
    source: { ...source, propertyBindings: previewBindings },
    readValue: (propCode: string) => values.get(propCode),
  };
}
