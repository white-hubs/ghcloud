export const getBase64 = (url: string, name: string): void => {
  const img = new Image();
  img.setAttribute("crossOrigin", "anonymous");
  img.src = url;
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(img, 0, 0, img.width, img.height);
    const quality = 0.8;
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const a = document.createElement("a");
    a.download = name || "下载";
    a.style.display = "none";
    a.href = dataUrl;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
};

export const getCurrentApplicationCode = (): string => {
  const applicationCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") as string).code;
  return applicationCode as string;
};
export function getBusinessPrefix() {
  const applicationCode = getCurrentApplicationCode();
  let businessPrefix = (import.meta as unknown as { env: { VITE_BUSINESS_PREFIX?: string } }).env.VITE_BUSINESS_PREFIX;
  if (businessPrefix) {
    return businessPrefix;
  }
  businessPrefix = "故障";
  if (applicationCode === "COMPLAINT") {
    businessPrefix = "投诉";
  }
  return businessPrefix;
}

export const getObjectNameColumnText = (): string => {
  const applicationCode = getCurrentApplicationCode();
  const businessPrefix = getBusinessPrefix();
  let text = `${businessPrefix}对象`;
  if (applicationCode === "COMPLAINT") {
    text = "投诉内容";
  }
  return text;
};

export function mapFormValuesToQueryDefaults<T extends Record<string, unknown>>(values: Record<string, unknown>, defaults: T): Partial<T> {
  return Object.keys(defaults).reduce<Partial<T>>((result, key) => {
    const value = values[key];
    result[key as keyof T] = (value === null || value === undefined ? defaults[key] : value) as T[keyof T];
    return result;
  }, {});
}
