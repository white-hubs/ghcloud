import { cubeSecureEduService } from '@/api/server'
import type { ImportExamQuestionVO } from '@ghcloud/cube-secure-edu-service'
import { Button, PopOver, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { computed, defineComponent, type PropType } from 'vue'

export const ImportResult = defineComponent({
  props: {
    value: {
      type: Object as PropType<ImportExamQuestionVO>,
      default: {}
    },
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
    const failTableData = computed(() => {
      return props?.value?.errorMsg?.map(item => {
        return { details: item }
      }) ?? []
    })
    const importErrorList = computed(() => {
      return props?.value?.importErrorList ?? []
    })
    const handleExportError = async (): Promise<void> => {
      try {
        const res = await cubeSecureEduService.exportExamQuestionError(importErrorList.value as Record<string, unknown>[])
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '考题库导入失败清单.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const failColumns: ColumnType[] = [
      {
        title: '导入详情',
        dataIndex: 'details',
        align: 'center',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver placement='bottomLeft' overlayStyle={{ width: '800px !important' }} content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'state',
        align: 'center',
        width: 50,
        customRender: (): JSX.Element => {
          return <PopOver content='失败'>失败</PopOver>
        }
      },
    ]
    return (): JSX.Element =>
      <>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <p style={{ padding: '20px 0 10px 0', fontSize: '16px' }}>导入完成！</p>
          <span>总计导入
            <span style={{ margin: '0 3px', fontSize: '14px' }}>{resultTotal.value ?? 0}</span>个，成功
            <span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{successTotal.value ?? 0}</span>个，失败
            <span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{failTotal.value ?? 0}</span>个。
          </span>
          {failTotal.value && failTotal.value > 0 && <span>点击下载获取<Button type='link' style={{ margin: '0 3px', padding: '0' }} onClick={handleExportError}>失败清单</Button></span>}
        </div>
        {
          failTableData.value.length > 0 &&
            <Table columns={failColumns} dataSource={failTableData.value ?? []} pagination={false} size='small' scrollY={500} />
        }
      </>
  }
})
