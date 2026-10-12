import { cubeEmergencyService } from '@/api/server'
import { Cell, CellGroup, closeToast, showLoadingToast, showNotify } from 'vant'
import { defineComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import styles from './emergency-file-detail.module.less'
import type { EmergencyFilePageVO } from '@ghcloud/cube-emergency-service/src/type'
import { Base64 } from 'js-base64'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const EmergencyFileDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const loading = ref(true)
    const fileData = ref<EmergencyFilePageVO>()
    const getData = async (): Promise<void> => {
      try {
        showLoadingToast({ message: '加载中...', forbidClick: true })
        loading.value = true
        fileData.value = await cubeEmergencyService.getEmergencyFileDetail(route.query.id as string)
      } catch {
        showNotify('加载失败')
      } finally {
        closeToast()
        loading.value = false
      }
    }

    const handlePreviewItem = (obj: { name: string;url: string; }): void => {
      const index = obj.name.lastIndexOf('.') // （考虑严谨用lastIndexOf(".")得到）得到"."在第几位
      const fileValueSuffix = obj.name.substring(index) // 截断"."之前的，得到后缀
      let fileType = ''
      if (/(.*)\.(mp4|avi|wmv|MP4|AVI|WMV|flv)$/.test(fileValueSuffix)) {
        fileType = 'video'
      } else if (/(.*)\.(jpg|JPG|bmp|BMP|mpg|MPG|mpeg|MPEG|tis|TIS|png|gif|jpge|svg|webp|jpeg)$/.test(fileValueSuffix)) { // 根据后缀，判断是否符合图片格式
        fileType = 'image'
      } else if (/(.*)\.(xls|XLS|xlsx|XLSX)$/.test(fileValueSuffix)) {
        fileType = 'excel'
      } else if (/(.*)\.(doc|DOC)$/.test(fileValueSuffix)) {
        fileType = 'doc'
      } else if (/(.*)\.(docx|DOCX)$/.test(fileValueSuffix)) {
        fileType = 'docx'
      } else if (/(.*)\.(PPT|PPTX|ppt|pptx)$/.test(fileValueSuffix)) {
        fileType = 'ppt'
      } else if (/(.*)\.(pdf|PDF)$/.test(fileValueSuffix)) {
        fileType = 'pdf'
      } else if (/(.*)\.(mp3|wav|m4a)$/.test(fileValueSuffix)) {
        fileType = 'audio'
      } else {
        fileType = 'unknown'
      }
      if (fileType !== 'unknown') {
        if (!obj.url.includes('http')) {
          obj.url = window.location.origin + obj.url
        }
        window.open(`${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(Base64.encodeURL(obj.url))}&fileName=${obj.name}`)
      } else {
        showNotify('暂不支持该文件类型')
      }
    }

    document.title = '预案文件'
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='预案文件' />
        <div v-show={!loading.value && fileData.value} class={styles['file-detail']}>
          {
            (fileData.value?.documentFileVOS && fileData.value?.documentFileVOS.length > 0) &&
            <CellGroup inset>
              <Cell
                title='文档附件'
                v-slots={{
                  label: () => {
                    return fileData.value?.documentFileVOS.map(e => {
                      return (
                        <div class={styles['file-list-item-file']} key={e.id} onClick={() => {
                          handlePreviewItem({ name: e.name, url: e.path })
                        }}>
                          <span>{e.name}</span>
                          <span>{e.type}</span>
                        </div>
                      )
                    })
                  }
                }}
              />
            </CellGroup>
          }

          {
            (fileData.value?.processFileVOS && fileData.value?.processFileVOS.length > 0) &&
            <CellGroup inset style='margin-top: 20px'>
              <Cell
                title='流程附件'
                v-slots={{
                  label: () => {
                    return fileData.value?.processFileVOS.map(e => {
                      return (
                        <div class={styles['file-list-item-file']} key={e.id} onClick={() => {
                          handlePreviewItem({ name: e.name, url: e.path })
                        }}>
                          <span>{e.name}</span>
                          <span>{e.type}</span>
                        </div>
                      )
                    })
                  }
                }}
              />
            </CellGroup>
          }
        </div>
      </>
  }
})
