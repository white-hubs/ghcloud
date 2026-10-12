import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Empty, Form, FormItem, Input, Table, Tree, TreeSelect } from '@ghcloud/cube-ui'
import {
  getEmergencyOrganizationList, getEmergencyUserList, getUserCategoryTree,
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
      queryRange: 'local',
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const tableLoading = ref<boolean>(false)
    const scrollY = ref<number>(200)
    const tableData = ref<TableData[]>([])
    // 计算table-y的高度
    const getscrollY = (): void => {
      const ele = document.getElementById('appContainer')
      const height = ele?.clientHeight
      if (height) {
        scrollY.value = height - 320
      }
    }
    window.onresize = () => {
      getscrollY()
    }
    onMounted(() => {
      nextTick(() => {
        getscrollY()
      })
    })

    // 查询人员表格数据===================================================================================================
    const rangeOptions = ref([{ label: '本组', value: 'local' }, { label: '本组及以下', value: 'all' }])
    const personOptions = ref()
    const userCategoryTree = async (): Promise<void> => {
      const res = await getUserCategoryTree()
      personOptions.value = res
    }
    // 获取人员表格数据
    const requesUserPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          emgOrgId: origId.value,
          name: search.name,
          queryRange: search.queryRange,
          categoryCode: search.categoryCode,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getEmergencyUserList(params)
        total.value = res.total
        tableData.value = res.records

        tableLoading.value = false
      } catch (err) {
        tableLoading.value = false
        logger.debug(err)
      }
    }

    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page
      search.pageSize = pageSize
      requesUserPage()
    }
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1
      search.pageSize = size
      requesUserPage()
    }
    const handelSearch = (): void => {
      search.pageNumber = 1
      requesUserPage()
    }
    const reset = (): void => {
      search = reactive({ ...item })
      requesUserPage()
    }
    // 人员分组信息======================================================================================================
    const treeLoading = ref<boolean>(true)
    const treeData = ref()
    const requestEmergencyOrganizationList = async (): Promise<void> => {
      const res = await getEmergencyOrganizationList()
      treeData.value = res
      treeLoading.value = false
    }
    onMounted(() => {
      requesUserPage()
      requestEmergencyOrganizationList()
      userCategoryTree()
    })
    // 选中分组操作
    const origId = ref('')
    const selectNode = async (selectedKeys: string[], e: SelectType): Promise<void> => {
      origId.value = e.node.id
      if (selectedKeys.length > 0) {
        origId.value = e.node.id
      } else {
        origId.value = ''
      }
      requesUserPage()
    }
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: '人员类型',
        dataIndex: 'categoryName',
        key: 'categoryName',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '性别',
        dataIndex: 'sex',
        key: 'sex',
      },
      {
        title: '来源组织',
        dataIndex: 'fromOrg',
        key: 'fromOrg',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
      {
        title: '专业特长备注',
        dataIndex: 'skillDesc',
        key: 'skillDesc',
      },
      {
        title: '分组',
        dataIndex: 'emgOrgName',
        key: 'emgOrgName',
        customRender: ({ text }: { text: string; }) => {
          return text || '-'
        }
      },
    ]
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-left': () => {
        return (
          <>
            <div class={styles['content-left']}>
              <a-spin tip='加载中...' spinning={treeLoading.value}>
                {treeData.value?.length
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
      'content-search': () => {
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='姓名'>
                <Input v-model:value={search.name} />
              </FormItem>
              <FormItem label='人员类型'>
              <TreeSelect allow-clear style={{ width: '200px' }} treeData={personOptions.value} v-model:value={search.categoryCode} fieldNames={{ label: 'name', value: 'id' }} />
              </FormItem>
              <FormItem label='查询范围'>
                <Select style={{ width: '200px' }} options={rangeOptions.value} v-model:value={search.queryRange} />
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
    return () =>
        <GLayout title='人员通讯录' showFooter={false} v-slots={gLayoutSlots} />
  }
})
