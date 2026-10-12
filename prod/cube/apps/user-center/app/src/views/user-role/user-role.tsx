import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, Page, PopOver, Select } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'

export const UserRole = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const formState = reactive({
      status: '',
      keyword: ''
    })

    const columns = [
      {
        title: '角色名称',
        dataIndex: 'name',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      // {
      //   title: '角色状态',
      //   dataIndex: 'status',
      //   ellipsis: true,
      //   width: 180,
      //   customRender: ({ text }: { text: string; }): JSX.Element => {
      //     return (
      //       <PopOver content={text === 'DISABLED' ? '禁用' : ( text === 'ENABLED' ? '启用' : '' ) }>
      //         {text === 'DISABLED' ? '禁用'  : ( text === 'ENABLED' ? '启用' : '' )}
      //       </PopOver>
      //     )
      //   }
      // },
      {
        title: '备注',
        dataIndex: 'remark',
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string; }) => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
    ]

    const loading = ref(false)
    const dataSource = ref([
      { name: '管理者', code: 'MANAGER', remark: '' },
      { name: '普通成员', code: 'MEMBER', remark: '' },
    ])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        // loading.value = true
        // const params = {
        //   pageNumber: pagination.value.pageNumber,
        //   pageSize: pagination.value.pageSize,
        //   status: formState.status,
        //   keyword: formState.keyword,
        // }
        // const res = await cubeZDUserService.getMemberRoleList(params)
        // if (res) {
        //   dataSource.value = res || []
        //   pagination.value.total = res.length || 0
        // }
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

    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    
    const reset = (): void => {
      formState.status = ''
      formState.keyword = ''
      queryForm()
    }
    
    const { scrollY } = useTableScroll()

    onMounted(() => {
      getTableData()
    })

    const statusOptions = [
      { label: '启用', value: 'ENABLED' },
      { label: '禁用', value: 'DISABLED' },
    ]

    const layoutSlots = {
      'layout-content': () => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0', display: 'none' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='状态'>
              <Select options={statusOptions} style={{ width: '180px' }} placeholder='请选择状态' v-model:value={formState.status} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }} label='组织名称'>
                <Input v-model:value={formState.keyword} placeholder='名称' showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Button type='primary' onClick={queryForm}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey='id'
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        )
      },
      'footer-page': () => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
            style={{ display: 'none' }}
          />
        )
      }
    }
    return () =>
      <>
        <Layout title={ pageTitle ?? '用户角色' } v-slots={layoutSlots} />
      </>
  }
})