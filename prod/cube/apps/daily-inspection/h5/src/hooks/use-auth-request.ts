import { CubeAuthRequest, type AuthState } from "@ghcloud/cube-services-client";

import { authStore } from "@/api/auth-store";

export const authRequest = new CubeAuthRequest(authStore as unknown as AuthState);

export const useAuthRequest = authRequest.useAuthRequest.bind(authRequest);
