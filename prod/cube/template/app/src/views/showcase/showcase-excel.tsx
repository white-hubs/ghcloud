import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button, Card, Table, message } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import ExcelJS from 'exceljs'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

export const ShowcaseExcel = defineComponent({
  name: 'ShowcaseExcel',
  setup: () => {
    const { pageTitle } = usePageName()
    const router = useRouter()
    const { t } = useI18n()
    const previewRows = ref<{ colA: string; colB: string }[]>([])
    const fileInputRef = ref<HTMLInputElement | undefined>(undefined)

    const columns: ColumnType[] = [
      { title: '列 A', dataIndex: 'colA', key: 'colA' },
      { title: '列 B', dataIndex: 'colB', key: 'colB' },
    ]

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
          a.download = 'template-showcase-sample.xlsx'
          a.click()
          URL.revokeObjectURL(url)
          message.success('已下载示例 xlsx')
        })
        .catch(() => {
          message.error('导出失败')
        })
    }

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
            const a = row.getCell(1).text?.trim() ?? ''
            const b = row.getCell(2).text?.trim() ?? ''
            rows.push({ colA: a, colB: b })
          })
          previewRows.value = rows
          message.success(`已解析 ${rows.length} 行（mock 本地预览）`)
        })
        .catch(() => {
          message.error('解析失败')
        })
    }

    const slots = {
      'layout-header': (): JSX.Element => (
        <Button onClick={() => router.push({ name: 'demo-home' })}>返回首页</Button>
      ),
      'layout-content': (): JSX.Element => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <Card title={t('showcase.excel.cardExport')}>
            <Button type='primary' onClick={downloadSample}>
              下载示例 xlsx
            </Button>
          </Card>
          <Card title={t('showcase.excel.cardImport')}>
            <input
              ref={fileInputRef}
              type='file'
              accept='.xlsx,.xlsm'
              style={{ display: 'none' }}
              onChange={(e) => {
                const input = e.target as HTMLInputElement
                const f = input.files?.[0]
                if (f) {
                  parseFile(f)
                }
                input.value = ''
              }}
            />
            <Button onClick={() => fileInputRef.value?.click()}>选择 xlsx 解析</Button>
            <Table
              style={{ marginTop: 16 }}
              columns={columns}
              dataSource={previewRows.value.map((r, i) => ({ ...r, key: String(i) }))}
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

    return (): JSX.Element => <CubeLayout title={pageTitle || 'Showcase · Excel'} v-slots={slots} showFooter={false} />
  },
})
