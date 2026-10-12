/** 独立 dev 或主应用未注入 props.auth 时，从 Portal session 读取鉴权 */
export const readSessionAuth = (): { tenant: string; token: string } => {
  try {
    const enterprise = sessionStorage.getItem('GH-NowEnterprise')
    const tokenItem = sessionStorage.getItem('GH-Token')
    if (!enterprise || !tokenItem) {
      return { tenant: '', token: '' }
    }
    return {
      tenant: JSON.parse(enterprise).code as string,
      token: JSON.parse(tokenItem).access_token as string,
    }
  } catch {
    return { tenant: '', token: '' }
  }
}
