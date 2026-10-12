import { type PropType, defineComponent, ref, watch, nextTick } from 'vue'
import JSZip from 'jszip'
import html2canvas from 'html2canvas'
import type { DesignConfig, QrCode } from '../../types/qrcode-type'
import { PreView } from '../preview'

export const CubeQrCode = defineComponent({
  props: {
    packageName: {
      type: String,
      default: () => ''
    },
    qrCodeList: {
      type: Array as PropType<QrCode[]>,
      default: () => {
        return []
      }
    },
    designConfig: {
      type: Object as PropType<DesignConfig>,
      default: () => {
        return {}
      }
    }
  },
  emits: ['end', 'error'],
  setup: (props, { emit, expose }) => {
    const qrCodeList = ref(props.qrCodeList)
    const zip = new JSZip()
    const promises: unknown[] = []

    const refMap: { key: number; val: HTMLElement; }[] = []
    const handleSetTempMap = (el: HTMLElement, index: number): unknown => {
      if (el) {
        refMap.push({ key: index, val: el })
      }
      return refMap
    }

    watch(() => props.qrCodeList, (newVal) => {
      qrCodeList.value = newVal
      qrCodeList.value.forEach((item: QrCode) => {
        if (typeof item.configJson === 'string') item.configJson = JSON.parse(item.configJson)
      })
    }, { deep: true })

    const handleDownload = async (qrCodeData?: QrCode[]): Promise<void> => {
      const startTime = performance.now()

      const chunk = (arr: any[], size: number) => {
        const result = []
        for (let i = 0; i < arr.length; i += size) {
          result.push(arr.slice(i, i + size))
        }
        return result
      }

      const chunkQrCodeData = chunk(qrCodeData ?? [], 10)

      for (const item of chunkQrCodeData) {
        qrCodeList.value = await item.map((item: QrCode) => {
          if (typeof item.configJson === 'string') item.configJson = JSON.parse(item.configJson)
          return item
        })
        await nextTick(async () => {
          try {
            for (let i = 0; i < refMap.length; i++) {
              const obj = refMap[i]
              const canvas = await html2canvas(obj.val, {
                useCORS: true,
                scale: 1,
                windowWidth: 1000,
                windowHeight: 1000,
                ignoreElements: (element) => {
                  if (obj.val.contains(element) || element.contains(obj.val) || element.tagName === 'STYLE') {
                    return false
                  } else {
                    return true
                  }
                }
              })
              const imgData = canvas.toDataURL('image/png')
              zip.file(`${qrCodeList.value[i].entityName + qrCodeList.value[i].serialNumber}.png`, imgData.split('base64,')[1], { base64: true })
            }
          } catch (error) {
            emit('error')
          } finally {
            refMap.length = 0
          }
        })
      }

      const content = await zip.generateAsync({ type: 'blob' })
      const zipFile = new Blob([content])
      const url = URL.createObjectURL(zipFile)
      const link = document.createElement('a')
      link.href = url
      link.download = `${props.packageName ?? '二维码'}.zip`
      link.click()
      emit('end')
      const endTime = performance.now()
      const duration = (endTime - startTime) / 1000
    }

    expose({
      handleDownload
    })
    return () => (
      <div style='opacity: 0;'>
        {
          qrCodeList.value && qrCodeList.value.length > 0 && qrCodeList.value.map((item, index) => {
            return (
              <div key={index}>
                <div class='preview' style={{ display: 'inline-block' }} key={index} ref={(el: HTMLElement) => handleSetTempMap(el, index)}> <PreView designConfig={item.configJson} key={index} /></div>
              </div>
            )
          })
        }
      </div>
    )
  }
})
