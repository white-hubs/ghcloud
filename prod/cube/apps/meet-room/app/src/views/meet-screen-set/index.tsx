import { defineComponent, onMounted, reactive, ref } from 'vue'
import { AliasTable, Layout } from '@ghcloud/generic-component'
import { Button, Form, FormItem, Input, PopConfirm, PopOver, Switch, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll.ts'
import { AddSetModal } from './add-set-modal'
import useClipboard from 'vue-clipboard3'
import { usePageName } from '@ghcloud/cube-utils'
import { useRoute } from 'vue-router'
import { DisplayStatus, type RoomScreenConfigVO } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/service'

export const MeetScreenSet = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      keyword: '',
    })


    const copyLinkRow = async (record: RoomScreenConfigVO): Promise<void> => {
      const url = `${window.location.origin}/apps/@ghcloud/cube-meet-room-data-viz#/entry?id=${record.conferenceId}`
      await useClipboard().toClipboard(url)
      message.success('复制成功')
    }

    const dataSource = ref<RoomScreenConfigVO[]>([])
    const state = reactive<{
      loading: boolean;
      updateLoading: boolean;
    }>({
      loading: false,
      updateLoading: false,
    })


    const getTableData = async (showLoading: boolean = true): Promise<void> => {
      if (showLoading) state.loading = true
      try {
        const res = await cubeMeetRoomService.getRoomScreenConfigList({ keyword: formState.keyword })
        if (res) {
          dataSource.value = (res ?? []).map(e => {
            return {
              ...e,
              displayStatusBool: e.displayStatus === DisplayStatus.OPEN,
            }
          })
        }
      } catch {
      } finally {
        state.loading = false
      }
    }
    const changeStatus = async (enable: boolean, record: RoomScreenConfigVO): Promise<void> => {
      state.updateLoading = true
      try {
        const params = {
          ...record,
          displayStatus: record.displayStatus === DisplayStatus.OPEN ? DisplayStatus.CLOSE : DisplayStatus.OPEN,
          id: record.id || '',
        }
        await cubeMeetRoomService.openRoomScreenConfig(params)
        message.success('操作成功')
        getTableData(false)
      } catch {
        record.displayStatusBool = !enable
      } finally {
        state.updateLoading = false
      }
    }
    const queryForm = (): void => {
      getTableData()
    }
    const reset = (): void => {
      Object.assign(formState, {
        keyword: '',
      })
      getTableData()
    }
    const deleteRow = async (record: RoomScreenConfigVO): Promise<void> => {
      try {
        await cubeMeetRoomService.deleteRoomScreenConfig(`${record.id || ''}`)
        message.success('操作成功')
        getTableData(false)
      } catch {
      }
    }
    const { scrollY } = useTableScroll()
    const columns = [
      {
        title: '设备编号',
        dataIndex: 'deviceCode',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '关联会议室',
        dataIndex: 'conferenceName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '发送节目状态',
        dataIndex: 'displayStatus',
        ellipsis: true,
        customRender: ({ record }: { record: RoomScreenConfigVO; }): JSX.Element => {
          return <Switch v-model:checked={record.displayStatusBool} loading={state.updateLoading} checked-children='启用' un-checked-children='停用' onChange={async (e) => changeStatus(e, record)} />
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        ellipsis: true,
        width: 150,
        customRender: ({ record }: { record: RoomScreenConfigVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' onClick={() => {
                copyLinkRow(record)
              }} style={{ paddingLeft: 0, paddingRight: 0 }}>复制链接</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}><Button danger type='link' size='small'>删除</Button></PopConfirm>
            </>
          )
        }
      }
    ]
    const tableColumns = ref(columns)

    onMounted(() => {
      getTableData()
    })
    const addModalRef = ref<{ openModal: () => void; }>()
    const add = (): void => {
      addModalRef.value?.openModal()
    }

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={add}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='设备名称' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.keyword} placeholder='请输入设备名称' width='180px' />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              dataSource={dataSource.value}
              columns={tableColumns.value}
              loading={state.loading}
              pagination
              scrollX={1000}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
              scrollY={scrollY.value}
            />
          </>
        )
      }
    }
    return (): JSX.Element=>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <AddSetModal ref={addModalRef} onEnter={getTableData} />
      </>
  }
})
