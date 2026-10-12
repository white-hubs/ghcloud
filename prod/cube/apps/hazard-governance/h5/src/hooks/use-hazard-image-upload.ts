import { useHazardFileUpload } from "./use-hazard-file-upload";

interface UseHazardImageUploadOptions {
  maxCount?: number;
  businessKey?: string;
  sceneCode?: string;
}

export const useHazardImageUpload = (options: UseHazardImageUploadOptions = {}) =>
  useHazardFileUpload({
    ...options,
    accept: "image/*",
    overLimitMessage: `最多上传 ${options.maxCount ?? 3} 张图片`,
    errorMessage: "图片上传失败，请重试",
  });
