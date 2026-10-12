import { defineComponent, ref, reactive } from 'vue'
import { Button, PopOver, Page, message, Switch } from '@ghcloud/cube-ui'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils'
import { AppTypeSelect } from '@/components/app-type-select/app-type-select'
import dayjs from 'dayjs'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity } from '@ghcloud/cube-application-center-service'
import { BatchUpdateTypeModal } from './batch-update-type-modal'
import { BatchUpdateShowModal } from './batch-update-show-modal'
import { useRouter } from 'vue-router'

export const AppList = defineComponent({
  setup: () => {
    const router = useRouter()
    const { pageTitle } = usePageName()
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0
    })
    const selectedRowKeysData = ref<string[]>([])
    const searchFormSchema = [
      {
        component: AppTypeSelect,
        label: '应用分类',
        fieldName: 'applicationGroupId',
        componentProps: {
          placeholder: '应用分类',
          onChange: (): void => {
            tableApi.query()
          }
        }
      },
      {
        component: 'Select',
        label: '是否展示',
        fieldName: 'enabled',
        componentProps: {
          allowClear: true,
          placeholder: '是否展示',
          options: [
            {
              label: '全部',
              value: ''
            },
            {
              label: '是',
              value: true
            },
            {
              label: '否',
              value: false
            },
          ],
          onChange: (): void => {
            tableApi.query()
          }
        },
      },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '应用名称'
        }
      }
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })
    const columns = [
      {
        title: '应用编号',
        dataIndex: 'code',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '应用名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '应用分类',
        dataIndex: 'applicationGroupName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '最新版本',
        dataIndex: 'version',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          const time = dayjs(text).format('YYYY-MM-DD HH:mm:ss')
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
        }
      },
      {
        title: '是否展示',
        dataIndex: 'enabled',
        ellipsis: true,
        align: 'center',
        customRender: ({ text, record }: { text: boolean; record: ApplicationEntity; }): JSX.Element => {
          return (
            <Switch v-model:checked={text}
              checked-children='是'
              un-checked-children='否'
              onChange={async (e) => handleShowSwitch(e, record)}
            />
          )
        }
      },
      {
        title: '浏览次数',
        dataIndex: 'viewCount',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        slots: {
          customRender: 'action',
        },
        width: 250,
        align: 'center',
        customRender: ({ record }: { record: ApplicationEntity; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      rowKey: 'id',
      rowSelection: 'checkbox',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          keyword: formApi.formValues.keyword as string ?? '',
          applicationGroupId: formApi.formValues.applicationGroupId as string ?? '',
          enabled: formApi.formValues.enabled as boolean ?? undefined,
        }
        return cubeApplicationCenterService.getApplicationPage(params)
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[]
      },
      fetchLoaded: (data) => {
        page.total = data.total
      }
    })
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }
    const handleEdit = (record: ApplicationEntity): void => {
      // history.pushState({}, '', `/portal/application-center/admin-app-edit?id=${record.id}`)
      router.push({
        path: '/admin-app-edit',
        query: {
          id: record.id
        }
      })
    }

    const handleShowSwitch = async (isShow: boolean, record: ApplicationEntity): Promise<void> => {
      try {
        const payload = {
          applicationIds: [record.id],
          enabled: isShow,
        }
        await cubeApplicationCenterService.batchUpdateApplication(payload)
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const batchUpdateTypeModalRef = ref<{ openModal: (ids: string[]) => void; }>()
    const handleBatchUpdateType = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error('请选择需要修改的应用')
        return
      }
      batchUpdateTypeModalRef.value?.openModal(selectedRowKeysData.value)
    }

    const batchUpdateShowModalRef = ref<{ openModal: (ids: string[], isPublic: boolean) => void; }>()
    const handleBatchUpdateShow = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error('请选择需要修改的应用')
        return
      }
      batchUpdateShowModalRef.value?.openModal(selectedRowKeysData.value, false)
    }

    const handleBatchUpdatePublicShow = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error('请选择需要修改的应用')
        return
      }
      batchUpdateShowModalRef.value?.openModal(selectedRowKeysData.value, true)
    }

    // 批量修改成功后的回调函数
    const handleBatchUpdateSuccess = (): void => {
      // 清空选中的行
      selectedRowKeysData.value = []
      tableApi.setSelectedRowKeys(selectedRowKeysData.value)
      // 刷新列表数据
      tableApi.query()
    }

    const slots = {
      'layout-content': (): JSX.Element => {
        return (
          <div>
            <CubeForm />
            <CubeTable />
          </div>
        )
      },
      'footer-btn': (): JSX.Element => {
        return (
          <>
            <span style={{ marginRight: '10px' }}>已选{selectedRowKeysData.value.length}项</span>
            <Button
              type='primary'
              onClick={handleBatchUpdateType}
              style={{ marginRight: '10px' }}
            >修改应用分类</Button>
            <Button
              onClick={handleBatchUpdateShow}
              style={{ marginRight: '10px' }}
            >修改是否展示</Button>
            <Button onClick={handleBatchUpdatePublicShow}>修改是否公开展示</Button>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Page
            current={page.pageNumber}
            pageSize={page.pageSize}
            total={page.total}
            onPageChange={handleChange}
          />
        )
      },
    }

    return (): JSX.Element =>(
      <CubeLayout title={pageTitle ?? '应用列表'} v-slots={slots} >
        <BatchUpdateTypeModal
          ref={batchUpdateTypeModalRef}
          onEnter={handleBatchUpdateSuccess}
        />
        <BatchUpdateShowModal
          ref={batchUpdateShowModalRef}
          onEnter={handleBatchUpdateSuccess}
        />
      </CubeLayout>
    )
  }

})