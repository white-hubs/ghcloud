import { defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@/components/layout/layout'
import { Button, Form, FormItem, Input, PopOver, Switch, message } from '@ghcloud/cube-ui'
import { useTableScroll } from '@/hook/use-table-scroll'
import { usePageName } from '@ghcloud/cube-utils'
import { AliasTable } from '@ghcloud/generic-component'
import { cubeMeetRoomService } from '@/api/service'
import type { FieldConfigurationVO } from '@ghcloud/cube-meet-room-service'

/** 字段设置 */
export const FieldSettings = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const loading = ref(false)
    const dataSource = ref<FieldConfigurationVO[]>([])
    const pagination = ref({
      pageSize: 100,
      pageNumber: 1,
    })
    const updateLoading = ref(false)
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeMeetRoomService.getRequiredFieldPage({
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
          fieldName: formState.fieldName ?? '',
        })
        if (res) {
          const { records } = res
          dataSource.value = records
        }
      } catch {
      } finally {
        loading.value = false
      }
    }
    const changeStatus = async (enable: boolean, record: FieldConfigurationVO): Promise<void> => {
      updateLoading.value = true
      try {
        const params = {
          fieldCode: record.fieldCode || '',
          fieldName: record.fieldName || '',
          required: enable,
          id: record.id || '',
        }
        await cubeMeetRoomService.updateFieldConfig(params)
        message.success('操作成功')
      } catch {
        record.required = !enable
      } finally {
        updateLoading.value = false
        getTableData()
      }
    }
    const changeVisibleStatus = async (enable: boolean, record: FieldConfigurationVO): Promise<void> => {
      updateLoading.value = true
      try {
        const params = {
          fieldCode: record.fieldCode || '',
          fieldName: record.fieldName || '',
          hidden: !enable,
          id: record.id || '',
        }
        await cubeMeetRoomService.updateFieldConfig(params)
        message.success('操作成功')
      } catch {
      } finally {
        updateLoading.value = false
        getTableData()
      }
    }


    const queryForm = (): void => {
      pagination.value.pageNumber = 1
      getTableData()
    }
    const formState = reactive<{
      fieldName: string | undefined;
    }>({
      fieldName: undefined,
    })
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined
      }
      dataSource.value = []
      queryForm()
    }
    onMounted(async () => {
      await getTableData()
    })
    const columns = [
      {
        title: '字段',
        dataIndex: 'fieldName',
        ellipsis: true,
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '必填',
        dataIndex: 'required',
        ellipsis: true,
        customRender: ({ record }: { record: FieldConfigurationVO; }): JSX.Element => {
          return <Switch v-model:checked={record.required} checked-children='开' un-checked-children='关' onChange={async (e) => changeStatus(e, record)} />
        }
      },
      {
        title: '显示',
        dataIndex: 'hidden',
        ellipsis: true,
        customRender: ({ record }: { record: FieldConfigurationVO; }): JSX.Element => {
          let visible = record.hidden === null || record.hidden === undefined ? true : !record.hidden
          return <Switch v-model:checked={visible} checked-children='开' un-checked-children='关' onChange={async (e) => changeVisibleStatus(e, record)} />
        }
      },
    ]
    const { scrollY } = useTableScroll()
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Form layout='inline' style={{ margin: '10px 0 0 0' }}>
              <FormItem style={{ paddingRight: 0, marginRight: '10px', marginBottom: '10px' }}>
                <Input
                  v-model:value={formState.fieldName} placeholder='字段名称' showCount={false} allowClear
                />
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
              pagination={false}
              scrollY={scrollY.value}
              tableCode='FIELD_SETTINGS'
              applicationCode={__ENV__.applicationCode}
            />
          </>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
