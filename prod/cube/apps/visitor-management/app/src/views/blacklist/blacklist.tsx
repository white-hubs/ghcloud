import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@/hook/use-page-name'
import { cubeVisitorManagementService } from '@/api/service'
import { AddBlackModel } from './components/add-black-modal'

/** 黑名单管理 */
export const Blacklist = defineComponent({
  setup: () => {
    const { title: pageTitle } = usePageName()
    const formState = reactive({
      keyword: '',
    })

    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        fixed: 'left',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '加入黑名单原因',
        dataIndex: 'reason',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: { id: number; }; }): JSX.Element => {
          return (
            <>
              {/* <Button type='link' size='small' onClick={() => { editRow(record) }}>编辑</Button> */}
              <PopConfirm onConfirm={() => {
                deleteRow(record)
              }} title='确定移除该项？'>
                <Button type='link' size='small'>移除</Button>
              </PopConfirm>
            </>
          )
        }
      }
    ]

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          keyword: formState.keyword,
        }
        const res = await cubeVisitorManagementService.getBlacklistPage(params)
        if (res) {
          const { records, total } = res
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
      } finally {
        loading.value = false
      }
    }

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const reset = (): void => {
      formState.keyword = ''
      queryForm()
    }
    const deleteRow = async (record: { id: number; }): Promise<void> => {
      try {
        await cubeVisitorManagementService.delBlacklist(record.id)
        message.success('操作成功')
        getTableData()
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      }
    }
    const addBlackModelRef = ref<{ openModal: (id?: number) => void; }>()
    // const rowId = ref()
    // const editRow = (record: { id: number; }): void => {
    //   addBlackModelRef.value?.openModal(record.id)
    //   rowId.value = record.id
    // }
    const { scrollY } = useTableScroll()
    onMounted(() => {
      getTableData()
    })
    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return (
          <>
            <div>
              <Button type='primary' onClick={() => addBlackModelRef.value?.openModal()}>新增</Button>
            </div>
          </>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.keyword} placeholder='请输入姓名/手机号' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollY.value} />
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
        <Layout title={pageTitle ?? '黑名单管理'} v-slots={layoutSlots} />
        <AddBlackModel ref={addBlackModelRef} onEnter={getTableData} />
      </>
  }
})
