export const authStore = {
  tenant: JSON.parse(sessionStorage.getItem('GH-NowEnterprise') || '{}').code || '',
  terminal: 'bimops-manage-web',
  token: JSON.parse(sessionStorage.getItem('GH-Token') || '{}').access_token || ''
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}
