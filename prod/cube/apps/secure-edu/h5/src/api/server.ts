import { authStore } from "./auth-store";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubeSecureEduService, CubeSecureEduPublicService } from "@ghcloud/cube-secure-edu-service";

export let cubeFileService = new CubeFileService(authStore);
export let cubeOuaaService = new CubeOuaaService(authStore);
export let cubeSecureEduService = new CubeSecureEduService(authStore);
export let cubeSecureEduPublicService = new CubeSecureEduPublicService({ ...authStore, tenant: "", token: "" });

export const reloadServer = (): void => {
  cubeFileService = new CubeFileService(authStore);
  cubeOuaaService = new CubeOuaaService(authStore);
  cubeSecureEduService = new CubeSecureEduService(authStore);
  cubeSecureEduPublicService = new CubeSecureEduPublicService({ ...authStore, tenant: "", token: "" });
};
