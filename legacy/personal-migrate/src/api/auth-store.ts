export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-web',
  token: ''
}

export const initAuthStore = (auth: { tenant: string; token: string;terminal?: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  authStore.terminal = auth.terminal ?? 'bimops-manage-web'
}
