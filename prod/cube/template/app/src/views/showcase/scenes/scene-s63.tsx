import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import ExcelJS from 'exceljs'
import { defineComponent } from 'vue'

/**
 * Batch-4 S63：`CubeLayout` + `Button`；使用 `ExcelJS` 工作簿 `writeBuffer` 触发 xlsx 下载（与 `showcase-excel.tsx` 的 `downloadSample` 相同模式）；无路由。
 */
export const ShowcaseSceneS63 = defineComponent({
  name: 'ShowcaseSceneS63',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S63 ExcelJS 导出'

    const downloadSample = (): void => {
      const wb = new ExcelJS.Workbook()
      const ws = wb.addWorksheet('Sheet1')
      ws.addRow(['名称', '数量'])
      ws.addRow(['示例 A', 10])
      ws.addRow(['示例 B', 20])
      wb.xlsx
        .writeBuffer()
        .then((buf) => {
          const blob = new Blob([buf], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'showcase-s63-sample.xlsx'
          a.click()
          URL.revokeObjectURL(url)
          message.success('已下载示例 xlsx')
        })
        .catch(() => {
          message.error('导出失败')
        })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <Card title='ExcelJS：导出'>
          <Button type='primary' onClick={downloadSample}>
            下载示例 xlsx
          </Button>
        </Card>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
