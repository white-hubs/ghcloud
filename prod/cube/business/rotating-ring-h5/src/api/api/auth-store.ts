export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-app',
  token: ''
}

export const initAuthStore = (data: Record<string, string>): void => {
  authStore.tenant = data?.tenant
  authStore.token = data?.token
  authStore.terminal = data?.terminal ?? 'bimops-manage-app'
}
