import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Table } from '@ghcloud/cube-ui'
import {
  getEmergencyFacility,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './facilities-list-i'
import styles from './facilities-list.module.less'
import { logger } from '@/logger'
import Input from '@ghcloud/cube-ui/src/components/input/input'
export const FacilitiesList = defineComponent({
  setup: () => {
    const item: SearchType = {
      name: '',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询设施表格数据===================================================================================================
    // 获取设施表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getEmergencyFacility(params)
        tableLoading.value = false
        total.value = res.total
        tableData.value = res.records
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }
    onMounted(() => {
      requestLightPage()
    })
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requestLightPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requestLightPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requestLightPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requestLightPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '设施名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '设施类型',
        dataIndex: 'facilityTypeName',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        key: 'status',
        customRender: ({ text }: { text: string; }) => {
          return <><span>{text === 'USED' ? '已使用' : '未使用'}</span></>
        }
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark'
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='设施名称'>
                <Input v-model:value={search.name} />
              </FormItem>
              <FormItem>
                <div class={styles.btns}>
                  <Button onClick={reset}>重置</Button>
                  <Button type='primary' onClick={handelSearch}>查询</Button>
                </div>
              </FormItem>
            </Form>
          </div>
        )
      },
      'content-table': () => {
        return (
          <>
            <div class={styles['content-right']}>
              <Table
                columns={recordTableColumns}
                data-source={tableData.value}
                loading={tableLoading.value}
                scrollY={scrollY.value}
                rowKey='id'
                pagination={false}
              />
              <div class={styles['table-footer']}>
                <GPagination
                  current={search.pageNumber}
                  pageSize={search.pageSize}
                  total={total.value}
                  onChangePage={changePage}
                  onChangeSize={changeSize}
                />
              </div>
            </div>
          </>
        )
      },
    }
    return () =>
        <GLayout title='设施清单' showFooter={false} v-slots={gLayoutSlots} />
  }
})
