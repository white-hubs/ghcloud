import { CubeFileService, type FileState } from "@ghcloud/cube-file-service";

import { authStore } from "./auth-store";

let fileService: CubeFileService | null = null;

export function getCubeFileService(): CubeFileService {
  if (!fileService) {
    fileService = new CubeFileService(authStore);
  }
  return fileService;
}

export async function uploadBusinessFile(file: Blob, sceneCode: string): Promise<FileState> {
  return getCubeFileService().uploadFile({
    businessKey: "",
    file,
    sceneCode,
  });
}
