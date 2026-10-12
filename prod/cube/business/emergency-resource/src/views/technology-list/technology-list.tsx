import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getEmergencyKnowledge,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './technology-list-i'
import styles from './technology-list.module.less'
import { logger } from '@/logger'
export const TechnologyList = defineComponent({
  setup: () => {
    const item: SearchType = {
      name: '',
      remark: '',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 查询技术表格数据===================================================================================================
    // 获取技术表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          remark: search.remark,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getEmergencyKnowledge(params)
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
        title: '文件',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: TableData; }) => {
          return (
            <>
              <Button type='link' onClick={() => { preView(record) }}>预览</Button>
              <Button type='link' onClick={() => { downLoad(record) }}>下载</Button>
            </>
          )
        }
      }
    ]

    // 下载/预览========================================================================================================
    const preView = (item: TableData): void => {
      window.open(item.filePath)
      logger.debug(item)
    }
    const downLoad = (item: TableData): void => {
      window.open(item.filePath)
    }
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='文件名称'>
                <Input v-model:value={search.name} />
              </FormItem>
              <FormItem label='备注'>
                <Input v-model:value={search.remark} />
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
        <GLayout title='技术文件查询' showFooter={false} v-slots={gLayoutSlots} />
  }
})
