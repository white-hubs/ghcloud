import { CubeMapPlugins } from './cube-map.es'
export const initAMapPlugin = async () => {
  if (!window.AMap) {
    const token = JSON.parse(sessionStorage.getItem('GH-Token')).access_token
    const tenant = JSON.parse(sessionStorage.getItem('GH-NowEnterprise')).code
    if (!token) {
      throw new Error('token不存在')
    }
    if (!tenant) {
      throw new Error('tenant不存在')
    }
    const cubeMapPlugins = new CubeMapPlugins({
      tenant,
      terminal: 'command-dispatch-app',
      token
    }, {
      type: 'a-map'
    })
    // try {
      window.AMap = await cubeMapPlugins.getAMapInstance()
    // } catch (error) {
    //   throw new Error('地图加载失败')
    // }

  }
}
// 获取当前地址信息
export const getCurrentAddress = async () => {
  if (!window.AMap) {
    await initMapPlugin()
  }
  const geolocation = new AMap.Geolocation({
    timeout: 10000,
    zoomToAccuracy: true,
    GeoLocationFirst: true
  })
  return new Promise((resolve, reject) => {
    // 使用高德地图
    geolocation.getCurrentPosition(async (status, result) => {
      if (status === 'complete') {
        const lnglat = [result.position.lng, result.position.lat];
        try {
          const result = await getAddress(lnglat)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      } else {
        // 获取不到使用h5定位获取
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lnglat = [position.coords.longitude, position.coords.latitude];
          try {
            const result = await getAddress(lnglat)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, err => {
          reject(err)
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      }
    })
  })
}
const getAddress = async (lnglat) => {
  if (!window.AMap) {
    await initMapPlugin()
  }
  const geocoder = new AMap.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete') {
        resolve(result.regeocode.formattedAddress)
      } else {
        reject(result)
      }
    })
  })
}