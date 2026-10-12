import type { ProductProp } from "@ghcloud/cube-iot-center-service";

export interface PropertyOption {
  value: string | number | boolean;
  label: string;
}

export function propertyConfig(property: ProductProp): unknown[] {
  const value: unknown = property.dataConfig ? JSON.parse(property.dataConfig) : [];
  if (!Array.isArray(value)) {
    throw new Error("属性取值约束异常，暂不能操作");
  }
  return value;
}

export function propertyOptions(property: ProductProp): PropertyOption[] {
  try {
    return propertyConfig(property).filter(
      (item): item is PropertyOption =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "value" in item &&
        typeof item.label === "string" &&
        ["string", "number", "boolean"].includes(typeof item.value),
    );
  } catch {
    return [];
  }
}

export function displayPropertyValue(property: ProductProp, value?: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }
  const option = propertyOptions(property).find((item) => String(item.value) === String(value));
  if (option) {
    return option.label;
  }
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

/** 与设备中心相同的字符串指令值契约，禁止隐式截断整数或四舍五入。 */
export function commandPropertyValue(property: ProductProp, input: string): string {
  if (property.dataWrite !== 1 || !property.propCode) {
    throw new Error("该属性不可写");
  }
  if (!input.trim()) {
    throw new Error("请输入属性值");
  }
  const config = propertyConfig(property);
  if (["enum", "boolean"].includes(property.dataType ?? "")) {
    const option = propertyOptions(property).find((item) => String(item.value) === input);
    if (!option) {
      throw new Error("请选择有效的属性值");
    }
    return String(option.value);
  }
  if (["int", "long", "float", "double"].includes(property.dataType ?? "")) {
    const text = input.trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/iu.test(text)) {
      throw new Error("请输入有效数字");
    }
    const value = Number(text);
    if (!Number.isFinite(value)) {
      throw new Error("请输入有效数字");
    }
    if (["int", "long"].includes(property.dataType ?? "") && !Number.isSafeInteger(value)) {
      throw new Error("请输入精度范围内的整数");
    }
    const [min, max] = config;
    if (typeof min === "number" && value < min) {
      throw new Error(`属性值不能小于 ${min}`);
    }
    if (typeof max === "number" && value > max) {
      throw new Error(`属性值不能大于 ${max}`);
    }
    if (
      typeof property.precision === "number" &&
      property.precision >= 0 &&
      property.precision <= 100 &&
      Number(value.toFixed(property.precision)) !== value
    ) {
      throw new Error(`属性值最多保留 ${property.precision} 位小数`);
    }
    return String(value);
  }
  if (property.dataType === "string") {
    return input;
  }
  throw new Error("暂不支持此类型的属性操作");
}
