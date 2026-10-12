import { CubeMapCore } from '@ghcloud/cube-map-plugins'
let cubeMap = null
const initMapPlugin = async () => {
  if (!cubeMap) {
    const token = JSON.parse(sessionStorage.getItem('GH-Token')).access_token
    const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise')).code
    if (!token) {
      throw new Error('token不存在')
    }
    if (!tenant) {
      throw new Error('tenant不存在')
    }
    cubeMap = new CubeMapCore({
      token,
      tenant,
      terminal: 'bimops-manage-web'
    })
  }
}
// 获取当前地址信息
export const getCurrentAddress = async () => {
  await initMapPlugin()
  const location = await cubeMap.getLntLatFromBrowser()
  return await cubeMap.getAddressByLntLat(location.lng, location.lat)
}