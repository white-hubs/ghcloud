import { showToast } from "vant";
import { shallowRef } from "vue";

import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import type { FileVO } from "@ghcloud/cube-service-interface/hazard-governance";

import { cubeFileService } from "@/api/file-service";

const DEFAULT_MAX_COUNT = 3;
const DEFAULT_BUSINESS_KEY = "maintain";
const DEFAULT_SCENE_CODE = "HIDDENDANGER::FLOW";

type UploadedHazardFile = FileVO & {
  fileId?: string | number;
};

interface UseHazardFileUploadOptions {
  maxCount?: number;
  businessKey?: string;
  sceneCode?: string;
  accept?: string;
  overLimitMessage?: string;
  errorMessage?: string;
}

export const useHazardFileUpload = (options: UseHazardFileUploadOptions = {}) => {
  const maxCount = options.maxCount ?? DEFAULT_MAX_COUNT;
  const businessKey = options.businessKey ?? DEFAULT_BUSINESS_KEY;
  const sceneCode = options.sceneCode ?? DEFAULT_SCENE_CODE;
  const accept = options.accept ?? "*/*";
  const overLimitMessage = options.overLimitMessage ?? `最多上传 ${maxCount} 个文件`;
  const errorMessage = options.errorMessage ?? "文件上传失败，请重试";
  const files = shallowRef<UploadedHazardFile[]>([]);
  const uploading = shallowRef(false);

  const setFiles = (nextFiles: UploadedHazardFile[]): void => {
    files.value = [...nextFiles].slice(0, maxCount);
  };

  const appendFiles = (nextFiles: UploadedHazardFile[]): void => {
    setFiles([...files.value, ...nextFiles]);
  };

  const removeAt = (index: number): void => {
    files.value = files.value.filter((_, fileIndex) => fileIndex !== index);
  };

  const uploadFromApp = async (remainingCount: number): Promise<void> => {
    const uploadedFiles = await cubeAppService.uploadFile(String(remainingCount), { sceneCode });
    appendFiles(uploadedFiles);
  };

  const uploadFromWeb = (remainingCount: number): void => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = remainingCount > 1;
    input.style.display = "none";
    input.onchange = (): void => {
      const selectedFiles = Array.from(input.files ?? []).slice(0, remainingCount);
      input.remove();
      if (selectedFiles.length === 0) {
        return;
      }
      void (async () => {
        uploading.value = true;
        try {
          const uploadedFiles = await Promise.all(
            selectedFiles.map((file) =>
              cubeFileService.uploadFile({
                businessKey,
                sceneCode,
                file,
              }),
            ),
          );
          appendFiles(uploadedFiles);
        } catch (error) {
          showToast(error instanceof Error ? error.message : errorMessage);
        } finally {
          uploading.value = false;
        }
      })();
    };
    document.body.appendChild(input);
    input.click();
  };

  const upload = async (): Promise<void> => {
    const remainingCount = maxCount - files.value.length;
    if (remainingCount <= 0) {
      showToast(overLimitMessage);
      return;
    }
    if (uploading.value) {
      return;
    }
    if (getEnvironment() !== "cubeApp") {
      uploadFromWeb(remainingCount);
      return;
    }
    uploading.value = true;
    try {
      await uploadFromApp(remainingCount);
    } catch (error) {
      showToast(error instanceof Error ? error.message : errorMessage);
    } finally {
      uploading.value = false;
    }
  };

  return {
    files,
    uploading,
    maxCount,
    setFiles,
    removeAt,
    upload,
  };
};
