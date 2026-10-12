import { reloadServer } from './server'
export const authStore = {
  tenant: '',
  terminal: 'bimops-manage-web',
  token: ''
}
export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  reloadServer()
}
