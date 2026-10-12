import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Switch, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@ghcloud/cube-utils'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'
import { cubeMeetRoomService } from '@/api/service'
import type { MeetType as MeetTypeVo } from '@ghcloud/cube-meet-room-service'
import { TypeModal } from './type-modal'

/** 会议室类型 */
export const MeetRoomType = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive<{
      keyword: string | undefined;
    }>({
      keyword: undefined,
    })

    const loading = ref(false)
    const dataSource = ref<MeetTypeVo[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeMeetRoomService.getMeetRoomTypePage({
          keyword: formState.keyword || '',
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records ?? []
          pagination.value.total = total
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const selectedRowKeysData = ref<string[]>([])
    const rowSelection = ref({
      onChange: (selectedRowKeys: string []) => {
        selectedRowKeysData.value = selectedRowKeys
      }
    })
    const updateLoading = ref(false)
    const changeStatus = async (enable: boolean, record: MeetTypeVo): Promise<void> => {
      updateLoading.value = true
      try {
        const params = {
          id: record.id || '',
          name: record.name || '',
          status: record.status || null,
        }
        await cubeMeetRoomService.saveMeetRoomType(params)
        message.success('操作成功')
        getTableData()
      } catch {
        record.status = !enable
      } finally {
        updateLoading.value = false
      }
    }
    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      dataSource.value = []
      queryForm()
    }

    onMounted(() => {
      queryForm()
    })
    const { scrollY } = useTableScroll()
    const delRow = async (record: MeetTypeVo): Promise<void> => {
      try {
        await cubeMeetRoomService.deleteMeetRoomType(`${record?.id ?? ''}`)
        message.success('删除成功')
        getTableData()
      } catch {
      }
    }

    const MeetTypeModalRef = ref<{ openModal: (record?: MeetTypeVo) => void; }>()
    const add = (): void => {
      MeetTypeModalRef.value?.openModal()
    }
    const editRow = (record: MeetTypeVo): void => {
      MeetTypeModalRef.value?.openModal(record)
    }
    const columns = [
      {
        title: '类型名称',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '类型状态',
        dataIndex: 'status',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: MeetTypeVo; }): JSX.Element => {
          return <Switch v-model:checked={record.status} loading={updateLoading.value} checked-children='启用' un-checked-children='停用' onChange={async (e) => changeStatus(e, record)} />
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: MeetTypeVo; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                editRow(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                delRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' onClick={add}>新增</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input
                  v-model:value={formState.keyword} placeholder='会议室类型名称' showCount={false} allowClear
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              rowSelection={rowSelection.value}
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <TypeModal ref={MeetTypeModalRef} onEnter={queryForm} title={pageTitle} labelWidth='100px' />
      </>
  }
})
