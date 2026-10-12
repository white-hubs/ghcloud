import { defineComponent, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Empty, Form, FormItem, Input, Table, Tree } from '@ghcloud/cube-ui'
import {
  getLightPage,
} from '@/api/record'
import {
  defaultFileds,
  type SearchType,
  type SelectType,
  type TableData,
} from './personnel-list-i'
import styles from './personnel-list.module.less'
import { logger } from '@/logger'
import Select from '@ghcloud/cube-ui/src/components/select/select'
export const PersonnelList = defineComponent({
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
    const scrollHandle = (): void => {
      let tableHeight = 0
      const clientHeight = document.querySelector('#content-table')?.clientHeight
      if (clientHeight) {
        tableHeight = clientHeight - 160
      }
      scrollY.value = tableHeight
    }
    onMounted(async () => {
      // 设置表格滚动
      scrollHandle()
      window.addEventListener('resize', function () {
        scrollHandle()
      })
    })
    // 查询人员表格数据===================================================================================================
    const rangeOptions = ref([])
    const personOptions = ref([])
    // 获取人员表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          name: search.name,
          type: search.type,
          range: search.range,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getLightPage(params)
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
    // 人员分组信息======================================================================================================
    const treeLoading = ref<boolean>(true)
    const treeData = ref([])
    // 选中分组操作
    const selectNode = (selectedKeys: string[], e: SelectType): void => {
      logger.debug(e.node.id)
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '姓名',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '联系方式',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '人员类型',
        dataIndex: 'recordId',
        key: 'recordId',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '性别',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '来源组织',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '专业特长备注',
        dataIndex: 'recordId',
        key: 'recordId',
      },
      {
        title: '分组',
        dataIndex: 'dataTime',
        key: 'dataTime',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-left': (): JSX.Element => {
        return (
          <>
            <div class={styles['content-left']}>
              <a-spin tip='加载中...' spinning={treeLoading.value}>
                {treeData.value.length
                  ? <Tree
                    tree-data={treeData.value}
                    defaultExpandAll
                    fieldNames={defaultFileds}
                    onSelect={selectNode}
                  />
                  : <Empty />}
              </a-spin>
            </div>
          </>
        )
      },
      'content-search': (): JSX.Element => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='姓名'>
                <Input v-model:value={search.name} />
              </FormItem>
              <FormItem label='人员类型'>
                <Select style={{ width: '200px' }} options={personOptions} value={search.type} fieldNames={{ label: 'name', value: 'id' }} />
              </FormItem>
              <FormItem label='查询范围'>
                <Select style={{ width: '200px' }} options={rangeOptions} value={search.range} fieldNames={{ label: 'name', value: 'id' }} />
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
      'content-table': (): JSX.Element => {
        return (
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
        )
      },
    }
    return (): JSX.Element =>
      <GLayout title='人员通讯录' showFooter={false} v-slots={gLayoutSlots} />
  }
})
