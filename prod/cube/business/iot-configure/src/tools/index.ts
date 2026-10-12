export const setToken = (token: string): void => {
  sessionStorage.setItem('iot-token', token)
}
export const getToken = (): string | null => {
  return sessionStorage.getItem('iot-token')
}
export const removeToken = (): void => {
  sessionStorage.removeItem('iot-token')
}

export const setTenant = (token: string): void => {
  sessionStorage.setItem('iot-tenant', token)
}
export const getTenant = (): string | null => {
  return sessionStorage.getItem('iot-tenant')
}
export const removeTenant = (): void => {
  sessionStorage.removeItem('iot-tenant')
}

export interface DataItem {
  title: string;
  [key: string]: unknown; // 允许其他属性存在
}

export const getMaxTitleLength = (data: DataItem[]): number => {
  if (!Array.isArray(data) || data.length === 0) {
    return 0;
  }
  return data.reduce((maxLength, item) => {
    const currentLength = item.title.length;
    return currentLength > maxLength ? currentLength : maxLength;
  }, 0);
};