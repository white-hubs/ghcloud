import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, PopConfirm, PopOver, Page, message } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeOperatingRoomService } from '@/api/service'
import Input from '@ghcloud/cube-ui/src/components/input/input'
import type { TestStandardVO } from '@ghcloud/cube-operating-room-service'
import { useTableScroll } from '@/hook/use-table-scroll'
import { useRoute } from 'vue-router'
import { AliasTable } from '@ghcloud/generic-component'

export const TestStandard = defineComponent({
  setup () {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const { pageTitle } = usePageName()
    const formState = reactive({
      keyword: '',
    })
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const loading = ref(false)
    const dataSource = ref<TestStandardVO[]>([])
    const { scrollY } = useTableScroll()

    const columns = [
      {
        title: '检测依据',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '标准级别',
        dataIndex: 'standardLevelNames',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      // {
      //   title: '检测项目个数',
      //   dataIndex: 'propertyNum',
      //   ellipsis: true,
      //   align: 'center',
      //   customRender: ({ text }: { text: string; }): JSX.Element=> {
      //     return <PopOver content={text || '--'}>{text || '--'}</PopOver>
      //   }
      // },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 250,
        customRender: ({ record }: { record: { id: string; }; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeOperatingRoomService.getTestStandardList({
          keyword: formState.keyword ?? '',
          pageSize: page.pageSize,
          pageNumber: page.pageNumber
        })
        if (res) {
          const { records, total } = res
          dataSource.value = records
          page.total = total
        }
      } catch {
      } finally {
        loading.value = false
      }
    }

    const handleSubmit = (): void => {
      page.pageNumber = 1
      getTableData()
    }

    const handleReset = (): void => {
      page.pageNumber = 1
      formState.keyword = ''
      getTableData()
    }

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      getTableData()
    }
    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', '/portal/operating-room-admin-manage/test-standard-form?action=add')
    }
    const handleEdit = (record: { id: string; }, detail?: boolean): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/operating-room-admin-manage/test-standard-form?id=${record.id}&action=${detail ? 'detail' : 'edit'}`)
    }
    const deleteRow = async (record: { id: string; }): Promise<void> => {
      try {
        await cubeOperatingRoomService.deleteTestStandard(record.id)
        message.success('操作成功')
        getTableData()
      } catch {
        message.error('操作失败')
      }
    }

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={handleAdd}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem label='检测依据' style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input v-model:value={formState.keyword} maxlength={50} placeholder='请输入检测依据' style={{ width: '300px' }} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={handleSubmit}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={handleReset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              dataSource={dataSource.value}
              columns={columns}
              loading={loading.value}
              pagination={false}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
              scrollY={scrollY.value}
            />
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={page.pageNumber}
            pageSize={page.pageSize}
            total={page.total}
            onPageChange={handleChange}
          />
        )
      },
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle ?? '检测标准'} v-slots={layoutSlots} />
      </>

  }
})