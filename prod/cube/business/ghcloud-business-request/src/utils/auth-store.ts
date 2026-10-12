export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-web',
  token: ''
}

export const requestAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}
