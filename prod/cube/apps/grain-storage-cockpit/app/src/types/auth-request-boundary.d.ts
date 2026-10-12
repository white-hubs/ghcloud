export interface AuthState {
  token?: string;
  tenant?: string;
  terminal?: string;
  [key: string]: unknown;
}

export const DEV_MOCK_AUTH: AuthState;
export const authRequest: {
  updateAuth: (auth: AuthState) => void;
};
