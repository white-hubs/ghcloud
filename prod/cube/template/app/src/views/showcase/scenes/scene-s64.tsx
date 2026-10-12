import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Table, message, type ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import ExcelJS from 'exceljs'
import { defineComponent, ref } from 'vue'

const PREVIEW_ROW_LIMIT = 20

/**
 * Batch-4 S64：`CubeLayout` + 文件选择 + ExcelJS 读取工作簿，首若干行 `Table` 预览（对齐 `showcase-excel` 导入侧）；无路由。
 */
export const ShowcaseSceneS64 = defineComponent({
  name: 'ShowcaseSceneS64',
  setup: () => {
    const { pageTitle } = usePageName()
    const titleFallback = 'Showcase · S64 Excel 导入预览'
    const previewRows = ref<{ colA: string; colB: string }[]>([])
    const fileInputRef = ref<HTMLInputElement | undefined>(undefined)

    const columns: ColumnType[] = [
      { title: '列 A', dataIndex: 'colA', key: 'colA' },
      { title: '列 B', dataIndex: 'colB', key: 'colB' },
    ]

    const parseFile = (file: File): void => {
      file
        .arrayBuffer()
        .then((buf) => {
          const wb = new ExcelJS.Workbook()
          return wb.xlsx.load(buf).then(() => wb)
        })
        .then((wb) => {
          const ws = wb.worksheets[0]
          if (!ws) {
            message.error('工作簿无工作表')
            return
          }
          const rows: { colA: string; colB: string }[] = []
          ws.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
              return
            }
            const t1 = row.getCell(1).text
            const t2 = row.getCell(2).text
            const a = (t1 === undefined || t1 === null ? '' : String(t1)).trim()
            const b = (t2 === undefined || t2 === null ? '' : String(t2)).trim()
            rows.push({ colA: a, colB: b })
          })
          const total = rows.length
          previewRows.value = rows.slice(0, PREVIEW_ROW_LIMIT)
          message.success(
            total > PREVIEW_ROW_LIMIT
              ? `已解析 ${total} 行，表格预览前 ${PREVIEW_ROW_LIMIT} 行`
              : `已解析 ${total} 行（本地预览）`,
          )
        })
        .catch(() => {
          message.error('解析失败')
        })
    }

    const slots = {
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <Card title='ExcelJS：导入预览'>
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xlsm'
              style={{ display: 'none' }}
              onChange={(e) => {
                const input = e.target as HTMLInputElement
                const { files } = input
                const f = files !== null && files.length > 0 ? files[0] : undefined
                if (f !== undefined) {
                  parseFile(f)
                }
                input.value = ''
              }}
            />
            <Button
              type='primary'
              onClick={() => {
                const el = fileInputRef.value
                if (el !== undefined) {
                  el.click()
                }
              }}
            >
              选择 xlsx 解析
            </Button>
            <Table
              style={{ marginTop: 16 }}
              columns={columns}
              dataSource={previewRows.value.map((r, i) => ({ colA: r.colA, colB: r.colB, key: String(i) }))}
              rowKey='key'
              pagination={false}
              size='small'
              scrollY={240}
              scrollX={400}
            />
          </Card>
        </div>
      ),
    }

    return (): JSX.Element => (
      <CubeLayout title={pageTitle || titleFallback} v-slots={slots} showFooter={false} />
    )
  },
})
