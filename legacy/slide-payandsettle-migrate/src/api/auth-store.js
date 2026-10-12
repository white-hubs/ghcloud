export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-web',
  token: ''
}

export const initAuthStore = (auth) => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}
