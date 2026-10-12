import { defineComponent, nextTick, onMounted, reactive, ref } from 'vue'
import { GLayout } from '@/components/common/layout'
import { GPagination } from '@/components/common/pagination'
import { Button, Form, FormItem, Input, Table } from '@ghcloud/cube-ui'
import {
  getCardPage,
} from '@/api/record'
import type {
  SearchType,
  TableData,
} from './card-list-i'
import styles from './card-list.module.less'
import { logger } from '@/logger'
import { timestampToDate, timestampToTime } from '@/utils/common'
import Select from '@ghcloud/cube-ui/src/components/select/select'
import { useRouter, type LocationQueryRaw } from 'vue-router'
export const CardList = defineComponent({
  setup: () => {
    const item: SearchType = {
      pageNumber: 1,
      pageSize: 10,
    }
    const total = ref<number>(0)
    let search = reactive<SearchType>({ ...item })
    const statusOptions = ref([{ label: '正常', value: 'NORMAL' }, { label: '挂失', value: 'LOSS' }])
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
    // 查询卡片表格数据===================================================================================================
    // 获取卡片表格数据
    const requestLightPage = async (): Promise<void> => {
      tableLoading.value = true
      try {
        const params = {
          keyword: search.keyword,
          status: search.useStatus,
          pageNumber: search.pageNumber,
          pageSize: search.pageSize
        }
        const res = await getCardPage(params)
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
        title: '卡号',
        dataIndex: 'cardNo',
        key: 'cardNo',
      },
      {
        title: '持卡人名称',
        dataIndex: 'personName',
        key: 'personName',
      },
      {
        title: '使用状态',
        dataIndex: 'useStatus',
        key: 'useStatus',
        customRender: ({ text }: { text: string; }) => {
          return <><span>{text === 'NORMAL' ? '正常' : '挂失'}</span></>
        }
      },
      {
        title: '生效日期',
        dataIndex: 'startDate',
        key: 'startDate',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '失效日期',
        dataIndex: 'endDate',
        key: 'endDate',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '挂失时间',
        dataIndex: 'lossDate',
        key: 'lossDate',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '解除挂失时间',
        dataIndex: 'unlossDate',
        key: 'unlossDate',
        customRender: ({ text }: { text: number; }) => {
          return timestampToDate(text) + timestampToTime(text)
        }
      },
      {
        title: '卡类型',
        dataIndex: 'cardTypeName',
        key: 'cardTypeName',
      },
      {
        title: '所属组织',
        dataIndex: 'orgName',
        key: 'orgName',
      },
      {
        title: '是否绑定指纹',
        dataIndex: 'isBindFinger',
        key: 'isBindFinger',
        customRender: ({ text }: { text: boolean; }) => {
          return <><span>{text ? '是' : '否'}</span></>
        }
      },
      {
        title: '是否绑定人脸',
        dataIndex: 'isBindFace',
        key: 'isBindFace',
        customRender: ({ text }: { text: boolean; }) => {
          return <><span>{text ? '是' : '否'}</span></>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        customRender: ({ record }: { record: LocationQueryRaw; }) => {
          return (
            <>
              <Button type='link' onClick={() => { linkRecord(record) }}>详情</Button>
            </>
          )
        }
      }
    ]
    // 记录详情=========================================================================================================
    const router = useRouter()
    const linkRecord = (item: LocationQueryRaw): void => {
      logger.debug(item)
      router.replace({ path: '/detail-list', query: item })
    }
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-search': () => {
        return (
          <div style={{ display: 'flex' }}>
            <Form layout='inline' model={search} class={styles['content-right']}>
              <FormItem label='关键字'>
                <Input v-model:value={search.keyword} placeholder='请输入卡号/持卡人名称' />
              </FormItem>
              <FormItem label='使用状态'>
                <Select style={{ width: '200px' }} options={statusOptions.value} v-model:value={search.useStatus} allowClear />
              </FormItem>
            </Form>
            <div class={styles.btns}>
                  <Button type='primary' onClick={handelSearch} style={{ marginRight: '10px' }}>查询</Button>
                  <Button onClick={reset}>重置</Button>
            </div>
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
        <GLayout title='卡片列表' showFooter={false} v-slots={gLayoutSlots} />
  }
})
