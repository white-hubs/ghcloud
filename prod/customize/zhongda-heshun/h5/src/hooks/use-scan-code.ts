import { onMounted, ref, type Ref } from 'vue'
import { cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { showNotify } from 'vant'
import { cubeZhongdaHeshunService } from '@/api/server'
import { storeKill } from '@/store/kill'
import { useRoute, useRouter } from 'vue-router'
import { getRouteParams } from '@ghcloud/cube-auth-utils'
import { ensureCoordsForBind } from '@/hooks/use-mp-location'


interface UseScanCode {
  isWxEnv: Ref<boolean>;
  scanCodeResult: Ref<ScanCodeResult>;
  getScanResult: () => Promise<void>;
  handleScanResult: () => Promise<void>;
  getUrlParams: () => Promise<void>;
}
export interface ScanCodeResult {
  success?: boolean;
  rawData?: string;
  result?: string;
  error?: unknown;
}
export const useScanCode = (): UseScanCode => {

  const isWxEnv = ref(false)
  const scanCodeResult = ref<ScanCodeResult>({})

  const store = storeKill()
  const groupActive = ref(store.groupActive)

  const router = useRouter()
  const route = useRoute()
  
  const getScanResult = async (): Promise<void> => {
    if (isWxEnv.value) {
      try {
        scanCodeResult.value = {}
        
        const scanResult = await cubeWxService.scanCode({ scanType: ['qrCode'],  path: route.path as string, query: JSON.stringify(route.query) })
        scanCodeResult.value = scanResult
        // 确保等待handleScan完成
        await handleScan(scanResult)
        return Promise.resolve()
      } catch (error) {
        scanCodeResult.value = { success: false, error }
        return Promise.reject(error)
      }
    } else {
      return Promise.reject(new Error('非小程序环境'))
    }
  }
  
  const handleScanResult = async (): Promise<void> => { 
    await getScanResult()
    // 确保扫码结果处理完成后返回结果
    return Promise.resolve()
  }
  const bindDevice = async (code: string): Promise<void> => {
    try {
      const coords = await ensureCoordsForBind()
      const res = await cubeZhongdaHeshunService.bindDeviceOne({
        deviceCode: code,
        prodCategoryId: store.selectProduct?.prodCategoryId as unknown as string ?? '',
        productId: store.selectProduct?.id as unknown as string ?? '',
        groupId: groupActive.value,
        latitude: coords.latitude,
        longitude: coords.longitude,
      })
      // 清空路由参数
      router.replace({ query: {} })
      if (res) {
        showNotify({ type: 'success', message: '设备添加成功' })
        // 使用replace方式跳转，避免返回到设备选择页面
        router.replace({ 
          path: '/device', 
          query: { 
            refresh: 'true',
            timestamp: Date.now().toString() // 添加时间戳确保刷新
          } 
        })
      } else {
        showNotify({ type: 'danger', message: '设备添加失败' })
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : '未获取到定位信息，请开启定位权限后重试'
      showNotify({ type: 'danger', message: msg })
    }
  }
  const handleScan = async (data: ScanCodeResult): Promise<void> => {
    if (isWxEnv.value) {
      try {
        
        // 解析扫码结果，处理多种格式
        let scanCode = ''
        const snMatch = data?.result?.match(/SN(?::|：)([^;]+)/i)
        
        // 1. 处理URL格式的二维码 (包含code=参数)
        if (data?.result?.includes('code=')) {
          scanCode = data.result.split('code=')[1] || ''
        } 
        // 2. 处理包含SN信息的格式 (如"SN:01BA317600DA;IMEI:865602079141443;")
        else if (snMatch) {
          scanCode = snMatch[1]
        }
        // 3. 处理Base64编码的结果
        else if (data?.rawData && /^[A-Za-z0-9+/=]+$/.test(data.rawData)) {
          try {
            const decodedData = atob(data.rawData)
            // 从解码后的数据中提取SN
            const snMatch = decodedData.match(/SN(?::|：)([^;]+)/i)
            if (snMatch) {
              scanCode = snMatch[1]
            } else {
              scanCode = decodedData
            }
          } catch (e) {
            scanCode = data.rawData
          }
        }
        // 4. 直接使用result作为fallback
        else {
          scanCode = data?.result || ''
        }
        
        
        if (!scanCode) {
          return Promise.reject(new Error('无法识别的二维码格式'))
        }
        
        return await bindDevice(scanCode)
      } catch (error) {
        showNotify({ type: 'danger', message: '处理扫码结果异常' })
        return Promise.reject(error)
      }
    } else{
      showNotify({ type: 'danger', message: `扫码失败: ${scanCodeResult.value.error}` })
      return Promise.reject(new Error(`扫码失败: ${scanCodeResult.value.error}`))
    }
  }
  const getUrlParams = async (): Promise<void> => {
    const urlPrams = getRouteParams()
    const prams = urlPrams?.scanCodeResult ? JSON.parse(decodeURIComponent(urlPrams?.scanCodeResult)) : null
    if (prams && prams?.rawData && prams?.result) {
      // 清空路由参数
      router.replace({ query: {} })
      await handleScan({
        success: true,
        rawData: prams.rawData,
        result: prams.result
      })
    }
  }

  onMounted(async (): Promise<void> => {
    await store.updateGroupInfo()
    groupActive.value = store.groupActive
    isWxEnv.value = await cubeWxService.getWxEnv()
    getUrlParams()
  })
  
  return {
    isWxEnv,
    scanCodeResult,
    getScanResult,
    handleScanResult,
    getUrlParams
  }
}
