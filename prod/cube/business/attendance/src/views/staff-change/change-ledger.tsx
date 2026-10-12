import { defineComponent, reactive, ref, type VNode } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, DatePicker, Form, FormItem, type PickerMode, Table, Page } from '@ghcloud/cube-ui'
import './change-ledger.less'
import { KEYWORD_ALIAS } from '@ghcloud/cube-business-alias-manage-plugin'


/** 换班台账 */
export const ChangeLedger = defineComponent({
  setup: () => {
    // const = useRoute()
    const searchData = reactive<
      {
        timeType: PickerMode;
      }
    >({
      timeType: 'month'

    })
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1
      pagination.value.pageSize = pageSize
      getTableData()
    }
    const getTableData = (): void => {
    }
    const reset = (): void => {
      Object.assign(searchData, {
        timeType: 'month'

      })
    }
    const exportExcel = (): void => {
      exportLoading.value = true
    }
    const layoutSlots = {
      'layout-header': (): VNode=> {
        return <Button type='primary' onClick={exportExcel} loading={exportLoading.value}>导出</Button>
      },
      'layout-content': (): VNode=> {
        return (
          <>
            <div class='classes-Summary-form'>
              <div class='search'>
                <Form layout='inline' model={searchData}>

                  <FormItem>
                    <DatePicker />
                  </FormItem>
                  <FormItem>
                    <Button type='primary' onClick={getTableData}>查询</Button>
                    <Button type='default' style={{ marginLeft: '10px' }} onClick={reset}>重置</Button>
                  </FormItem>

                </Form>
              </div>
              <div class='search'>
                <Table
                  pagination={false}
                  columns={columns} dataSource={dataSource.value} size='small'
                  scrollX={2500}
                />
              </div>

            </div>
          </>
        )
      },
      'footer-page': (): VNode=> {
        return (
          <>
            <Page
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />

          </>
        )
      }
    }
    const exportLoading = ref(false)
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const dataSource = ref([{

    }])
    const columns = [
      {
        title: `${KEYWORD_ALIAS.staff}姓名`,
        dataIndex: 'department',

      },
      {
        title: '换班申请时间',
        dataIndex: 'department',

      },
      {
        title: '换班处理时间',
        dataIndex: 'department',
      },
      {
        title: '换班类型',
        dataIndex: 'department',
      },
      {
        title: '换班人员',
        dataIndex: 'department',
      },
      {
        title: '班次信息',
        dataIndex: 'department',
      },

    ]
    return (): VNode => <Layout title='换班台账' v-slots={layoutSlots} />
  }
})
