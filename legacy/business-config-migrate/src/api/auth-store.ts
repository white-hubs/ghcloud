export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-web',
  token:"",
  accessToken:''
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}
