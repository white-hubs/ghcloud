import { Button, message } from '@ghcloud/cube-ui'
import { computed, defineComponent, type PropType } from 'vue'
import type { ImportResultVO } from '@ghcloud/cube-bi-data-management'
import { cubeBiDataManagementService } from '@/api/service'
export const ImportResult = defineComponent({
  props: {
    value: {
      type: Object as PropType<{
        fail: number;
        success: number;
        errorList: ImportResultVO['errorList'] | null;
      }>,
      default: {}
    },
    merchantType: {
      type: String,
      default: 'PURCHASER'
    }
  },
  setup: (props) => {
    const successTotal = computed(() => {
      return props.value ? props.value.success : 0
    })
    const failTotal = computed(() => {
      return props.value ? props.value.fail : 0
    })
    const resultTotal = computed(() => {
      return Number(successTotal.value ?? 0) + Number(failTotal.value ?? 0)
    })
    const importErrorList = computed(() => {
      return props?.value?.errorList ?? []
    })
    const handleExportError = async (): Promise<void> => {
      try {
        const res = await cubeBiDataManagementService.exportFailList({
          dataList: importErrorList.value,
          merchantType: props.merchantType
        })
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', `${props.merchantType === 'PURCHASER' ? '采购商' : '批发商'}导入失败清单.xlsx`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    return (): JSX.Element =>
      <>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <p style={{ padding: '20px 0 10px 0', fontSize: '16px' }}>导入完成！</p>
          <span>总计导入
            <span style={{ margin: '0 3px', fontSize: '14px' }}>{resultTotal.value ?? 0}</span>个，成功
            <span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{successTotal.value ?? 0}</span>个，失败
            <span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{failTotal.value ?? 0}</span>个。
          </span>
          {!!failTotal.value && failTotal.value > 0 && <span>点击下载获取<Button type='link' style={{ margin: '0 3px', padding: '0' }} onClick={handleExportError}>失败清单</Button></span>}
        </div>
      </>
  }
})
