import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, PopConfirm, Table, Textarea, message } from '@ghcloud/cube-ui'
import { ModalForm } from '@/components/modal-form/modal-form'
import { getThemePage, themeDel, themeInsert, themeUpdate } from '@/api/theme'
import { useTableScroll } from '@/hook/use-table-scroll'
import { logger } from '@/logger'
export const Theme = defineComponent({
  setup: () => {
    const formState = reactive({
      keyword: ''
    })
    const modalVisible = ref(false)
    const submitLoading = ref(false)
    const modalTitle = ref('')
    const modalFormState = ref<{
      name: string;
      remark: string;
      id?: string;
    }>({
      name: '',
      remark: ''
    })
    const modalRules = {
      name: [{ required: true, message: '请输入主题名称', trigger: 'blur' }]
    }
    const formSource = ref([
      {
        label: '主题名称',
        value: 'name',
        component: Input,
        props: {
          placeholder: '请输入主题名称',
          maxLength: 20,
        }
      },
      {
        label: '备注说明',
        value: 'remark',
        component: Textarea,
        props: {
          placeholder: '请输入备注说明',
          autoSize: { minRows: 4, maxRows: 6 },
          maxLength: 200
        }
      }
    ])

    const modalOk = async (): Promise<void> => {
      try {
        submitLoading.value = true
        if (modalFormState.value.id) {
          await themeUpdate({
            id: modalFormState.value.id,
            ...modalFormState.value
          })
        } else {
          await themeInsert({
            ...modalFormState.value,
          })
        }
        message.success('操作成功')
        modalVisible.value = false
        getTableData()
      } catch (error) {
        const { data } = error as { data: { data: Record<string, string>; }; }
        for (const key in data.data) {
          message.error(data.data[key])
        }
      } finally {
        submitLoading.value = false
      }
    }

    const add = (): void => {
      modalVisible.value = true
      modalTitle.value = '新增'
      modalFormState.value = {
        name: '',
        remark: ''
      }
    }
    const editRow = (record: { name: string; remark: string; id: string; }): void => {
      modalVisible.value = true
      modalTitle.value = '编辑'
      modalFormState.value = {
        name: record.name,
        remark: record.remark,
        id: record.id
      }
    }
    const delRow = async (record: { id: string; name?: string; remark?: string; }): Promise<void> => {
      await themeDel({ id: record.id })
      message.success('操作成功')
      getTableData()
    }

    const columns = [
      {
        title: '序号',
        width: 70,
        align: 'center',
        customRender: ({ index }: { index: number; }): string => `${index + 1}`
      },
      {
        title: '主题名称',
        dataIndex: 'name',
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '备注说明',
        dataIndex: 'remark',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 200,
        customRender: ({ record }: { record: { id: string; name: string; remark: string; }; }): JSX.Element => {
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

    const loading = ref(false)
    const dataSource = ref<unknown[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const { scrollYAxis } = useTableScroll()

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await getThemePage({
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState
        })
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records
          pagination.value.total = total
        }
      } catch (error) {
        logger.error(error)
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

    onMounted(() => {
      getTableData()
    })

    const layoutSlots = {
      'layout-header': (): JSX.Element => {
        return <Button type='primary' onClick={add}>新增</Button>
      },
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0' }}>
              <FormItem style={{ paddingRight: 0 }}>
                <Input v-model:value={formState.keyword} placeholder='主题名称' showCount={false} />
              </FormItem>
              <FormItem>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <Table columns={columns} loading={loading.value} dataSource={dataSource.value} pagination={false} size='small' scrollY={scrollYAxis.value} />
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
        <Layout title='主题管理' v-slots={layoutSlots} />
        <ModalForm
          title={modalTitle.value}
          v-model:show={modalVisible.value}
          formSource={formSource.value}
          v-model:formState={modalFormState.value}
          rules={modalRules}
          onOk={modalOk}
          submitLoading={submitLoading.value}
        />
      </>
  }
})
