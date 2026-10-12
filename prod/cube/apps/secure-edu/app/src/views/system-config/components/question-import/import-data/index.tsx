import { cubeSecureEduService } from '@/api/server'
import { GLOBAL_SCENE_CODE } from '@ghcloud/cube-file-service'
import { Button, message } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, onMounted, ref } from 'vue'

export const ImportData = defineComponent({
  emits: ['update:value', 'success'],
  setup: (props, { emit, expose }) => {
    const excel = ref<Blob | null>(null)
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    onMounted(() => {
      fileUploadRef.value?.clearAll()
    })
    const exportTemplate = async (): Promise<void> => {
      try {
        const res = await cubeSecureEduService.exportExamQuestionTemplate()
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '考题库导入模版.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
      }
    }
    const handleImport = async (): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        try {
          if (!excel.value || JSON.stringify(excel.value) === '[]') {
            message.destroy()
            message.warning('请先上传文件')
            reject(new Error('请先上传文件'))
          }
          cubeSecureEduService.importExamQuestion({
            file: excel.value,
          }).then(res => {
            if (res) {
              emit('success', res)
              resolve(res)
            }
          }).catch(error => {
            reject(error)
          })
        } catch (error) {
          reject(error)
          message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
        }
      })
    }
    expose({
      handleImport
    })
    return (): JSX.Element =>
      <>
        <p style={{ margin: '5px 0' }}>
          点击下载
          <Button type='link' style={{ margin: '0', padding: '0' }} onClick={exportTemplate}>考题库批量导入模版</Button>
          ，按格式完善表格信息后，点击下方选择进行上传。
        </p>
        <FileUpload
          ref={fileUploadRef}
          showtext
          typelist={['.xls', '.xlsx']}
          customText='支持上传（.xls/.xlsx）文件'
          multiple={false}
          customupload
          sceneCode={GLOBAL_SCENE_CODE.safetyEducationCourseWare}
          v-modal:value={excel.value}
          onFile={(file) => {
            excel.value = file
            emit('update:value', excel.value)
          }}
          type='picture'
          dragger
        />
      </>
  }
})
