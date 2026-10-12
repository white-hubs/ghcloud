import { defineComponent, reactive, watch, type PropType } from 'vue'
import { Icon } from 'vant'
import styles from './index.module.less'
import { showImagePreview } from '../../hook/use-image-preview'
import type { FileVOState } from '@ghcloud/cube-protocol'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
export interface UploadConfig {
  uploadMethod: string[];
  watermark: string[];
}
export const UploadImage = defineComponent({
  props: {
    fileList: {
      type: Array as PropType<FileVOState[]>,
      default: () => []
    },
    uploadConfig: {
      type: Object as PropType<UploadConfig>,
      default: () => ({
        uploadMethod: [],
        watermark: [],
      })
    },
  },
  emits: ['update:fileList'],
  setup: (props, { emit }) => {
    const state = reactive<{
      files: FileVOState[];
    }>({
      files: [],
    })
    watch(() => props.fileList, () => {
      if (props.fileList.length === state.files.length) return
      state.files = props.fileList
    }, {
      deep: true
    })
    const maxCount = 3
    const handleUploadImage = async (): Promise<void> => {
      const result = await cubeAppService.uploadImage(String(maxCount - state.files.length), {
        uploadMethod: props.uploadConfig.uploadMethod,
        watermarkTypes: props.uploadConfig.watermark,
      }) as unknown as { id: string;path: string; }[]
      state.files = [...state.files, ...result]
      emit('update:fileList', state.files)
    }
    const handleImagePreview = (index: number): void => {
      const files = state.files.map((item) => {
        return item.path
      })
      showImagePreview(files, index)
    }
    const deleteImage = (id: string): void => {
      state.files = state.files.filter(item => item.id !== id)
      emit('update:fileList', state.files)
    }
    return (): JSX.Element => (
      <div class={styles.uploadedList}>
        {
          state.files.map((item, index) => {
            return (
              <div class={styles.uploaded} key={item.id}>
                <img onClick={() => {
                  handleImagePreview(index)
                }} src={item.path} alt='' width={60} height={60} />
                <div
                  class='van-uploader__preview-delete van-uploader__preview-delete--shadow' onClick={(e) => {
                    e.stopPropagation()
                    deleteImage(item.id)
                  }}
                >
                  <i class='van-badge__wrapper van-icon van-icon-cross van-uploader__preview-delete-icon' />
                </div>
              </div>
            )
          })
        }
        {state.files.length < maxCount &&
          <div class={styles.upload} onClick={handleUploadImage}>
            <Icon name='plus' size='30px' color='#d9d9d9' />
          </div>}

      </div>
    )
  }
})
