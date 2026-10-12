import { CubeAuthRequest } from "@ghcloud/cube-services-client";

export const authRequest = new CubeAuthRequest();

export const useAuthRequest = authRequest.useAuthRequest.bind(authRequest);
