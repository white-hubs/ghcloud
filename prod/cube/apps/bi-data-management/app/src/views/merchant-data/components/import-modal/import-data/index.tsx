import { Button, message, AntModal } from '@ghcloud/cube-ui'
import { FileUpload } from '@ghcloud/generic-component'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { cubeBiDataManagementService } from '@/api/service'
import type { ImportResultVO } from '@ghcloud/cube-bi-data-management'
export const ImportData = defineComponent({
  props: {
    merchantType: {
      type: String,
      default: 'PURCHASER'
    }
  },
  emits: ['update:value', 'success'],
  setup: (props, { emit, expose }) => {
    const excel = ref<Blob | null>(null)
    const state = reactive({
      downloadLoading: false
    })
    const fileUploadRef = ref<{ triggerUpload: () => void;clearAll: () => void; }>()
    onMounted(() => {
      fileUploadRef.value?.clearAll()
    })
    const exportTemplate = async (): Promise<void> => {
      try {
        state.downloadLoading = true
        const res = await cubeBiDataManagementService.downloadTemplate({
          merchantType: props.merchantType
        })
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `${props.merchantType === 'PURCHASER' ? '采购商' : '批发商'}导入模版.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        state.downloadLoading = false
      }
    }
    const handleImport = async (): Promise<ImportResultVO> => {
      return new Promise((resolve, reject) => {
        try {
          if (!excel.value || JSON.stringify(excel.value) === '[]') {
            message.destroy()
            message.warning('请先上传文件')
            reject(new Error('请先上传文件'))
          }
          AntModal.confirm({
            title: '提示',
            content: '若有重复数据是否覆盖?',
            okText: '覆盖',
            cancelText: '跳过',
            onOk: async () => {
              const result = await cubeBiDataManagementService.importTemplate({
                file: excel.value as Blob,
                merchantType: props.merchantType,
                replaceBool: true
              })
              resolve(result)
            },
            onCancel: async () => {
              const result = await cubeBiDataManagementService.importTemplate({
                file: excel.value as Blob,
                merchantType: props.merchantType,
                replaceBool: false
              })
              resolve(result)
            }
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
          <Button type='link' loading={state.downloadLoading} style={{ margin: '0', padding: '0' }} onClick={exportTemplate}>{props.merchantType === 'PURCHASER' ? '采购商' : '批发商'}导入模板</Button>
          ，按格式完善表格信息后，点击下方选择进行上传。
        </p>
        <FileUpload
          ref={fileUploadRef}
          showtext
          typelist={['.xls', '.xlsx']}
          customText='支持上传（.xls/.xlsx）文件'
          multiple={false}
          customupload
          v-modal:value={excel.value}
          onFile={(file: Blob | null) => {
            excel.value = file
            emit('update:value', excel.value)
          }}
          type='picture'
          dragger
        />
      </>
  }
})
