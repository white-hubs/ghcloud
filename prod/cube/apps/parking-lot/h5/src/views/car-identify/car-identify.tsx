import { defineComponent, reactive } from 'vue'
import { Button, Icon, showLoadingToast, showToast, Field, CellGroup, showNotify } from 'vant'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import styles from './car-identify.module.less'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { GLOBAL_SCENE_CODE, type FileState } from '@ghcloud/cube-file-service'
import { useGlobalRouter } from '@/hook/use-global-router'
import { cubeOcrService } from "@/api/server";
import { OcrFileProvideType, VehicleOcrManufacture } from "@ghcloud/cube-ocr-service";
import { showImagePreview } from '@ghcloud/cube-utils'

export const CarIdentify = defineComponent({
  name: 'CarIdentify',
  setup() {
    const { router } = useGlobalRouter()
    const state = reactive({
      image: null as FileState | null,
      plateNumber: '',
      loading: false,
    })

    const handleUpload = async () => {
      try {
        // const file = {
        //     "id": "2012057244965388289",
        //     "name": "c1.webp",
        //     "suffix": "webp",
        //     "path": "https://cube-dev.guhecloud.com:3000/minio/parking/2012104228951126018.webp",
        //     "size": 67938,
        //     "refCount": 0,
        //     "type": "webp",
        //     "businessKey": null,
        //     "tag": "",
        //     "accessPrefix": "/minio",
        //     "endpointPath": "http://192.168.0.243:9091/parking/2012057244965388289.webp",
        //     "createTime": 1768546804072
        // }
        // handleOcr(file)
        // return
        const result = await cubeAppService.uploadFile('1', {
          sceneCode: GLOBAL_SCENE_CODE.parkingVehicle
        })
        if (result && result.length > 0) {
            state.image = result[0]
            handleOcr(result[0])
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage })
      }
    }

    const handleOcr = async (file: FileState) => {
        const toast = showLoadingToast({
            message: '识别中...',
            forbidClick: true,
            duration: 0,
        })
        try {
            state.loading = true
            const imgUrl = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path || ''}`
            
            const res = await cubeOcrService.ocrVehicleNumber({
                vehicleOcrManufacture: VehicleOcrManufacture.ALI,
                ocrFileProvideType: OcrFileProvideType.URL,
                imgUrl: imgUrl,
                imgFileVO: file
            })
            if (res?.vehicleNumber) {
                state.plateNumber = res?.vehicleNumber
                showNotify({ type: 'success', message: '识别成功' })
                setTimeout(() => {
                    router.push({
                        path: '/car-identify-detail',
                        query: { plateNumber: state.plateNumber }
                    })
                }, 1 * 1000)
            } else {
                showNotify({ type: 'warning', message: '未识别到车牌' })
            }
        } catch (error) {
          const errorMessage = (error as any)?.toJSON?.()?.errorMessage || (error as Error).message || '识别失败'
          showNotify({ type: 'warning', message: errorMessage })
        } finally {
            setTimeout(() => {
                state.loading = false
                toast.close()
            }, 800)
        }
    }
    
    const reUpload = () => {
        state.plateNumber = ''
        state.image = null
        handleUpload()
    }
    
    const previewImage = () => {
        if (state.image?.path) {
            showImagePreview([state.image.path ?? ''])
        }
    }

    const plateNumberRule = [
        { required: true, message: '请输入车牌号' },
    ]

    const handleQuery = () => {
        if (!state.plateNumber) {
            showToast('请输入车牌号')
            return
        }
        router.push({
            path: '/car-identify-detail',
            query: { plateNumber: state.plateNumber }
        })
    }

    return () => (
      <div class={styles.container}>
        <CubeNavBar title='车牌识别' showBack />
        <div class={styles.content}>
            <div 
                class={[styles.uploadArea, state.image ? styles.hasImage : '']} 
                onClick={!state.image ? handleUpload : previewImage}
            >
                {state.image ? (
                    <img src={state.image.path ?? ''} alt="Car" />
                ) : (
                    <div class={styles.uploadPlaceholder}>
                        <Icon name="photograph" size="40" color="#dcdee0" />
                        <span>点击拍摄/上传车牌照片</span>
                    </div>
                )}
            </div>
            
            <div class={styles.inputArea}>
                <CellGroup inset>
                    <Field 
                        v-model={state.plateNumber}
                        label="车牌号"
                        placeholder="输入车牌号"
                        clearable
                        input-align="right"
                        rules={plateNumberRule}
                    />
                </CellGroup>
            </div>
            
            <div class={styles.actions}>
                <Button type="primary" block onClick={handleQuery}>
                    查询详情
                </Button>
                {state.image && (
                    <Button block onClick={reUpload} disabled={state.loading}>
                        重新上传
                    </Button>
                )}
            </div>
        </div>
      </div>
    )
  }
})
