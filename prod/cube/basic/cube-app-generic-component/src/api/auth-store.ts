import { reloadServer } from './server'

export const authStore = {
  tenant: sessionStorage.getItem('GH-NowEnterprise') ? JSON.parse((sessionStorage.getItem('GH-NowEnterprise')!))?.code : '',
  terminal: 'bimops-manage-app',
  token: sessionStorage.getItem('GH-Token') ? JSON.parse((sessionStorage.getItem('GH-Token')!))?.access_token : ''
}

export const initAuthStore = async (auth: { tenant: string; token: string;terminal?: string; }): Promise<void> => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  authStore.terminal = auth.terminal ?? 'bimops-manage-app'
  reloadServer()
}
