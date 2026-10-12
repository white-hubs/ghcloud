import { PopOver, Table } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { computed, defineComponent, type PropType, type VNode } from 'vue'
export interface ImportType {
  fail: number;
  errorMsg: string[];
  success: number;
}
export const ImportResult = defineComponent({
  props: {
    value: {
      type: Object as PropType<ImportType>,
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
    const failTableData = computed(() => {
      return props?.value?.errorMsg.map(item => {
        return { details: item }
      }) ?? []
    })
    const failColumns: ColumnType[] = [
      {
        title: '导入详情',
        dataIndex: 'details',
        align: 'center',
        ellipsis: true,
        width: 200,
        customRender: ({ text }: { text: string; }): VNode=> {
          return <PopOver placement='bottomLeft' overlayStyle={{ width: '800px !important' }} content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '状态',
        dataIndex: 'state',
        align: 'center',
        width: 50,
        customRender: (): VNode=> {
          return <PopOver content='失败'>失败</PopOver>
        }
      },
    ]
    return (): VNode =>
      <>
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <span>导入结果如下：</span>
          <span>导入成功共计
            <span style={{ color: '#389e0d', margin: '0 3px', fontSize: '14px' }}>{successTotal.value ?? 0}</span>条，失败
            <span style={{ fontSize: '14px', color: '#cf1322', margin: '0 3px' }}>{failTotal.value ?? 0}</span>条
          </span>
        </div>
        {
          failTableData.value.length > 0 &&
            <Table columns={failColumns} dataSource={failTableData.value ?? []} pagination={false} size='small' scrollY={500} />
        }
      </>
  }
})
