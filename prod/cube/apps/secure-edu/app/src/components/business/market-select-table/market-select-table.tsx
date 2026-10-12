import { cubeDataIntegrateService } from '@/api/server'
import type { MarketConfig } from '@ghcloud/cube-data-integrate-service'
import { Button, PopConfirm, PopOver, Table } from '@ghcloud/cube-ui'
import { ModalTable } from '@ghcloud/generic-component'
import { defineComponent, ref, watch } from 'vue'

interface Props {
  readonly: boolean;
  value: MarketConfig[];
}
/** 选择市场组件 */
export const MarketSelectTable = defineComponent({
  props: ['readonly', 'value'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const modalVisible = ref(false)
    const openModal = (): void => {
      modalVisible.value = true
    }
    const markets = ref<MarketConfig[]>(props.value ?? [])
    const marketConfigList = ref<MarketConfig[]>([])
    cubeDataIntegrateService.getMarketConfigList().then(res => {
      marketConfigList.value = res
    })

    watch(() => props.value, () => {
      markets.value = props.value
    }, { deep: true })

    const delRow = (index: number): void => {
      markets.value.splice(index, 1)
      emit('update:value', markets.value)
    }
    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '市场名称',
        dataIndex: 'marketName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        align: 'center',
        customRender: ({ index }: { index: number; }): JSX.Element => {
          return (
            <>
              <PopConfirm title='确认移除该项？' onConfirm={() => {
                delRow(index)
              }}>
                <Button type='link' size='small' danger>移除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    if (props.readonly) {
      columns.pop()
    }
    const tableColumns = [
      {
        title: '序号',
        width: 100,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '市场名称',
        dataIndex: 'marketName',
        align: 'center',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      }
    ]

    const onOk = (marketConfigList: MarketConfig[]): void => {
      markets.value = marketConfigList
      emit('update:value', markets.value)
      modalVisible.value = false
    }

    return (): JSX.Element => {
      const header = (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
          <span class='verticalLine primary-color-before'>选择市场</span>
          {
            !props.readonly &&
              <>
                <Button type='primary' shape='round' onClick={openModal}>添加市场</Button>
              </>
          }
        </div>
      )

      const body = <Table columns={columns} dataSource={markets.value} pagination={false} size='small' scrollY={440} />
      const apiFunction = async (): Promise<{ records: MarketConfig[]; total: number; }> => {
        const records = await cubeDataIntegrateService.getMarketConfigList()
        return {
          records,
          total: records.length
        }
      }
      return (
        <>
          {header}
          {body}
          <ModalTable
            multiple
            title='选择市场'
            v-model:show={modalVisible.value}
            columns={tableColumns}
            apiFunction={apiFunction}
            showPage={false}
            onOk={onOk}
            rowKey='marketTenant'
            selectRowValue={markets.value}
            selectRowKeysValue={markets.value.map(item => item.marketTenant)}
          />
        </>
      )
    }
  }
})
