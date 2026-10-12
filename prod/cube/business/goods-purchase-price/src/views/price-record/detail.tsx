import { computed, defineComponent, onMounted, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, InputNumber, Page, PopOver, Table, message } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { DynamicFormRender } from '@ghcloud/dynamic-form-render'
import type { DynamicFormRenderOptionProps } from '@ghcloud/dynamic-form-render/src/dynamic-form-render-props'
import type { FormExpose } from '@ghcloud/cube-ui/src/components/form/form'
import type { InsertState, RecordState } from './index.i'
import { getCategoryTree, getRecordPage, insertRecord, updatePriceRule, updateRecord } from '@/api/price-record'
import { getTaskDetail } from '@/api/price-task'
import '@/styles/common.less'
import { VerticalLine } from '@ghcloud/generic-component'
import dayjs from 'dayjs'

export const Detail = defineComponent({
  setup: () => {
    const { action, id, searchVal } = useRoute().query
    const goBack = (): void => {
      history.back()
    }

    const title = computed(() => {
      let res = ''
      if (action === 'add') {
        res = '新增采价记录'
      } else if (action === 'edit') {
        res = '编辑采价记录'
      } else {
        res = '采价记录详情'
      }
      return res
    })
    const urgencyOptions = ref([
      { label: '紧急', value: 'MAX' },
      { label: '中等', value: 'MID' },
      { label: '较低', value: 'MIN' },
    ])

    const dynamicFormRenderRef = ref<{ formRef: FormExpose; }>()
    const options = computed(() => {
      const res: DynamicFormRenderOptionProps[] = [
        { title: '记录名称', key: 'name', width: 46, componentName: 'TextInput', required: true },
        { title: '紧急程度', key: 'urgency', width: 46, componentName: 'SelectInput', componentProps: { options: urgencyOptions.value, allowClear: true, placeholder: '请选择紧急程度' }, required: true },

        {
          title: '采价人',
          key: action === 'detail' ? 'userNames' : 'userList',
          width: 46,
          componentName: 'UserPickerInput',
          required: true,
          componentProps: { multiple: true, placeholder: '请选择采价人' }
        },
      ]
      if (action === 'detail') {
        res.forEach(e => {
          e.readonly = true
        })
      }
      return res
    })
    const formData = ref<InsertState>({
      name: '',
      urgency: '',
      startTime: '',
      endTime: '',
      remark: '',
      categoryIds: null,
      userIds: null,
      userList: null,
      userNames: '',
    })
    // 保存
    const saveLoading = ref(false)
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate()
      await dynamicFormRenderRef.value?.formRef.validate()
      try {
        saveLoading.value = true
        const params: InsertState = {
          ...formData.value
        }
        if (params.userList) {
          params.userIds = params.userList.map((item: { id: string; }) => {
            return item.id
          })
        }
        delete params.userList

        if (action === 'add' || action === 'copy') {
          await insertRecord(params)
        } else {
          await updateRecord({
            ...params,
            id: id as string
          })
        }
        message.success('操作成功')
        history.back()
      } catch {
      } finally {
        saveLoading.value = false
      }
    }
    const categoryOptions = ref([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
    }
    const init = ref(false)
    onMounted(async () => {
      getCategoryOption()
      getTableData()
      if (action !== 'add') {
        if (id) {

          const res = await getTaskDetail({ id: id as string })
          if (res.data) {

            res.data.userList = res.data.userList.map((item: { userId: string; userName: string; }) => {
              return {
                id: item.userId,
                name: item.userName,
                gender: ''
              }
            })

            const names = res.data.userList.map((item: { name: string; }) => {
              return item.name
            })

            res.data.userNames = names.length > 0 ? names.toString(',') : '--'

            formData.value = res.data as InsertState
          }
        }
      }
      init.value = true
    })

    const columns = [
      {
        title: '商品品类',
        dataIndex: 'goodsCategoryName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '采价人',
        dataIndex: 'userList',
        ellipsis: true,
        customRender: ({ record }: { record: { userList: []; userName: string; }; }): JSX.Element => {
          const { userList, userName } = record

          const users = userList ? userList.map((item: { userName: string; }) => {
            return item.userName
          }) : []

          const text = users.length > 0 ? users.join(',') : ''
          return <PopOver content={text || '--'}>{text || userName || '--'}</PopOver>
        }
      },
      {
        title: '采价时间',
        dataIndex: 'createTime',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '最高价（元/公斤）',
        dataIndex: 'maxPrice',
        ellipsis: true,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.maxPrice}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.maxPrice} /></>}
            </div>
          )
        }
      },
      {
        title: '均价（元/公斤）',
        dataIndex: 'midPrice',
        ellipsis: true,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.midPrice}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.midPrice} /></>}
            </div>
          )
        }
      },
      {
        title: '最低价（元/公斤）',
        dataIndex: 'minPrice',
        ellipsis: true,
        customRender: ({ record }: { record: RecordState; }): JSX.Element => {
          return (
            <div>
              {!record.isEdit && <>{record.minPrice}</>}
              {record.isEdit && <><InputNumber precision={2} v-model:value={record.minPrice} /></>}
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 180,
        customRender: ({ record }: { record: RecordState & InsertState & { secretKey: string; }; }): JSX.Element => {
          return (
            <>
              {!record.isEdit &&
                <Button type='link' onClick={() => {
                  handleEditRow(record)
                }}>修改价格 </Button>}
              {record.isEdit &&
                <>
                  <Button type='link' onClick={() => {
                    handleSaveRow(record)
                  }}>保存</Button>
                  <Button type='link' onClick={() => {
                    handleCancelRow(record)
                  }}>取消</Button>
                </>}
            </>
          )
        }
      }
    ]
    const handleEditRow = (record: RecordState): void => {
      record.isEdit = !record.isEdit
    }
    const handleCancelRow = (record: RecordState): void => {
      record.isEdit = !record.isEdit
      getTableData()
    }
    const handleSaveRow = async (record: RecordState): Promise<void> => {
      try {
        loading.value = true
        const params = {
          maxPrice: record.maxPrice,
          midPrice: record.midPrice,
          minPrice: record.minPrice,
          id: record.id,
        }
        await updatePriceRule(params)
        message.success('操作成功')
        getTableData()
      } catch {

      } finally {
        loading.value = false
      }
    }

    const loading = ref(false)
    const dataSource = ref<RecordState[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const search = searchVal ? JSON.parse(searchVal as string) : null
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          taskId: id as string,

          period: search.period ? search.period.toString() : '',
          keyword: search.name ? search.name : ''
        }
        const res = await getRecordPage(params)
        if (res.data) {
          const { records, total } = res.data
          dataSource.value = records as RecordState[]
          dataSource.value.map(item => {
            return {
              ...item,
              isEdit: false
            }
          })
          pagination.value.total = total
        }
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

    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        if (!init) {
          return <></>
        }
        return (
          <>
            <DynamicFormRender
              formOptions={options.value}
              labelWidth='150px'
              v-model:formData={formData.value}
              ref={dynamicFormRenderRef}
              style={{ margin: '20px' }}
            />
            <VerticalLine style='margin: 10px 0;' title='采价明细' />
            <Table
              rowKey='id'
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false} size='small'
              scrollY={500}
            />
            <div class='page-right'>
              <Page
                v-model:current={pagination.value.pageNumber}
                v-model:pageSize={pagination.value.pageSize}
                v-model:total={pagination.value.total}
                onPageChange={pageChange}
              />
            </div>

          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== 'detail' && <Button type='primary' style={{ marginLeft: '10px' }} loading={saveLoading.value} onClick={save}>保存</Button>}
          </>
        )
      }
    }
    return (): JSX.Element => <Layout title={title.value} v-slots={layoutSlots} />
  }
})
