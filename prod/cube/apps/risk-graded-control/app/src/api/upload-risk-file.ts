import type { CubeFileService } from "@ghcloud/cube-file-service";

import { cubeFileService } from "./file-service";
import { FILE_BUCKET } from "@/constants";
import { normalizeUploadPath } from "@/utils/file-url";

export async function uploadRiskControlFile(
  file: Blob,
  sceneCode: string,
  service: CubeFileService = cubeFileService,
): Promise<{ id: string; path: string }> {
  const result = await service.uploadFile({
    businessKey: FILE_BUCKET,
    sceneCode,
    file,
  });
  return {
    id: result.id != null ? String(result.id) : "",
    path: normalizeUploadPath(result.path),
  };
}
