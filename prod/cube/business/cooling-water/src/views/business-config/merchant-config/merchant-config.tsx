import { defineComponent, onMounted, reactive } from 'vue'
import { GLayout } from '@/components/common/layout'
import { Form, FormItem, Input, Table, Button, type PickerMode, PopConfirm, message } from '@ghcloud/cube-ui'
import type { RecordState } from './merchant-config.i'
import { GPagination } from '@/components/common/pagination'
import { RelateModal } from './relate-modal'
import { getWholesalers, getWholesalersConfigList, relateGear, cancelRelateGear } from '@/api/business-config'
type Key = string
export const MerchantConfig = defineComponent({
  setup: () => {
    const state = reactive<{
      dataSource: RecordState[];
      formState: {
        dateType: PickerMode;
      };
      actionId: string;
      searchParams: {
        keyword: string;
        pageNumber: number;
        pageSize: number;
        total?: number;
      };
      selectedRowKeys: Key[];
      visible: boolean;
      loading: boolean;
    }>({
      dataSource: [],
      selectedRowKeys: [],
      loading: false,
      visible: false,
      searchParams: {
        keyword: '',
        pageNumber: 1,
        pageSize: 10,
        total: 0
      },
      formState: {
        dateType: 'year'
      },
      actionId: ''
    })
    const columns = [
      {
        title: '档主编号',
        dataIndex: 'code',
        key: 'code',
      },
      {
        title: '档主姓名',
        dataIndex: 'shiftMaster',
        key: 'shiftMaster',
      },
      {
        title: '联系电话',
        dataIndex: 'shiftMasterPhone',
        key: 'shiftMasterPhone',
      },
      {
        title: '档位号',
        dataIndex: 'gearPositionName',
        key: 'gearPositionName',
      },
      {
        title: '档位区域',
        dataIndex: 'gearPositionArea',
        key: 'gearPositionArea',
      },
      {
        title: '是否关联档位',
        dataIndex: 'association',
        key: 'association',
        customRender: ({ record }: { record: RecordState; }): string => {
          return record.association === '0' ? '否' : '是'
        }
      },
      {
        title: '计费开始日期',
        dataIndex: 'billableTime',
        key: 'billableTime',
      },
      {
        title: '操作',
        dataIndex: 'atcion',
        key: 'atcion',
        width: 160,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <>
              {record.association === '0' && <Button type='link' onClick={() => {
                handleRelate(record)
              }}>关联</Button>}
              {record.association !== '0' &&
                <PopConfirm
                  title='是否取消关联?'
                  ok-text='确定'
                  cancel-text='取消'
                  onConfirm={async () => cancelRelate(record)}
                >
                  <Button type='text' danger>取消关联</Button>
                </PopConfirm>}

            </>
          )
        }

      },
    ]
    const cancelRelate = async (record: RecordState): Promise<void> => {
      await cancelRelateGear(record.wholesalerId)
      message.success('操作成功')
      getList()
    }
    const handleRelate = (record: RecordState): void => {
      state.actionId = record.wholesalerId
      state.visible = true
    }
    const getList = async (): Promise<void> => {
      try {
        state.loading = true
        const { data } = await getWholesalersConfigList(state.searchParams)
        state.dataSource = data.records
        state.searchParams.total = data.total
      } catch {
      } finally {
        state.loading = false
      }
    }
    onMounted(() => {
      getList()
    })
    const handleSaveWholesalers = async (): Promise<void> => {
      await getWholesalers()
      message.success('获取成功')
      handleReset()
    }
    const handleRelateOk = async (val: { gearPositionId: string; billableTime: string; }[]): Promise<void> => {
      try {
        state.loading = true
        const params = {
          wholesalerId: state.actionId ? [state.actionId] : state.selectedRowKeys,
          timePositionParams: val
        }
        await relateGear(params)
        message.success('关联成功')
        getList()
        state.actionId = ''
        state.visible = false
      } catch {
      } finally {
        state.loading = false
      }
    }
    // const onSelectChange = (val: Key[]): void => {
    //   state.selectedRowKeys = val
    // }

    // const checkboxProps = (record: RecordState): Record<string, boolean> => {
    //   return {
    //     disabled: record.association !== '0'
    //   }
    // }
    const handleSearch = (): void => {
      state.searchParams.pageNumber = 1
      getList()
    }
    const handleReset = (): void => {
      state.searchParams.pageNumber = 1
      state.searchParams.keyword = ''
      getList()
    }
    // 查询设备表格数据===================================================================================================
    const changePage = (page: number, pageSize: number): void => {
      state.searchParams.pageNumber = page
      state.searchParams.pageSize = pageSize
      getList()
    }
    // const handleMultiple = (): void => {
    //   if (!state.selectedRowKeys.length) {
    //     message.error('请选择需要设置的设备')
    //     return
    //   }
    //   state.actionId = ''
    //   state.visible = true
    // }
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return <Button type='primary' onClick={handleSaveWholesalers}>获取商户</Button>
      },
      'content-search': (): JSX.Element => {
        return (
          <div class='content-search'>
            <Form layout='inline'>
              <FormItem>
                <Input placeholder='档位号' v-model:value={state.searchParams.keyword} />
              </FormItem>
              <FormItem>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Button type='primary' onClick={handleSearch}>查询</Button>
                  <Button onClick={handleReset}>重置</Button>
                  {/* <Button type='primary' onClick={handleMultiple}>批量设置</Button> */}
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <Table
              dataSource={state.dataSource}
              columns={columns}
              pagination={false}
              size='small'
              loading={state.loading}
              scrollY={460}
              rowKey='wholesalerId'
              // rowSelection={{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange, getCheckboxProps: checkboxProps }}
            />
            <RelateModal v-model:visible={state.visible} onOk={handleRelateOk} />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <GPagination
            current={state.searchParams.pageNumber}
            pageSize={state.searchParams.pageSize}
            total={state.searchParams.total ?? 0}
            onChange={changePage}
          />
        )
      }
    }
    return (): JSX.Element => (
      <> <GLayout title='商户配置' v-slots={layoutSlots} /></>
    )
  }
})
