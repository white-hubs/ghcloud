import { defineComponent, reactive, ref } from 'vue'
import { Button, PopOver, PopConfirm, Page, message, AntModal, Upload } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import { cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectPlaceVO } from '@ghcloud/cube-zhongda-heshun-service'
import { ProjectSelect } from '@/components/project-select/project-select'
import styles from './project-place.module.less'
import PlaceSelect from '@/components/project-place/project-place'

export const ProjectPlace = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const selectedRowKeysData = ref<string[]>([])
    const placeSelectRef = ref()
    const exportLoading = ref(false)
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    const searchFormSchema = [
      {
        component: ProjectSelect,
        label: '所属项目',
        fieldName: 'projectId',
      },
      // {
      //   component: ProjectPlaceTypeSelect,
      //   label: '场所分类',
      //   fieldName: 'placeTypeId',
      // },
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '名称，详细位置'
        }
      }
    ]
    const [CubeForm, formApi] = useCubeForm({
      layout: 'horizontal',
      handleSubmit: () => {
        placeSelectRef.value?.getList()
        tableApi.query()
      },
      handleReset: () => {
        tableApi.query()
        setTimeout(() => {
          placeSelectRef.value?.getList()
        }, 1);
      },
      schema: searchFormSchema,
      showCollapseButton: true
    })
    const columns = [
      {
        title: '序号',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        width: 70,
        customRender: ({ index }: { index: number; }): JSX.Element=> {
          return <PopOver content={index + 1 || '--'}>{index + 1 || '--'}</PopOver>
        }
      },
      {
        title: '重点场所名称',
        dataIndex: 'placeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '场所分类',
        dataIndex: 'placeTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '详细位置',
        dataIndex: 'placeDetail',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '经纬度',
        dataIndex: '',
        ellipsis: true,
        align: 'center',
        customRender: ({ record }: { record: ProjectPlaceVO; }): JSX.Element=> {
          const text = `${record.longitude || '--'}，${record.latitude || '--'}`
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
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
        customRender: ({ record }: { record: ProjectPlaceVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleEdit(record)
              }}>编辑</Button>
              <Button type='link' size='small' onClick={() => {
                toDetails(record)
              }}>详情</Button>
              <PopConfirm title='确认删除该项？' onConfirm={() => {
                deleteRow(record)
              }}>
                <Button type='link' size='small' danger>删除</Button>
              </PopConfirm>
            </>
          )
        }
      },
    ]
    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: 'id',
      rowSelection: 'checkbox',
      fetchApi: async () => {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          projectId: formApi.formValues.projectId as string ?? '',
          placeTypeId: formApi.formValues.placeTypeId as string ?? '',
          keyword: formApi.formValues.keyword as string ?? '',
        }
        return cubeZhongdaHeshunService.getProjectPlacePageList(params)
      },
      fetchLoaded: (data) => {
        page.total = data.total
      },
      rowSelectionChange: (keys) => {
        selectedRowKeysData.value = keys as string[]
      },
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }

    const handleAdd = (): void => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-place-details?action=add`)
    }
    const handleDownload = async (): Promise<void> => {
      try {
        exportLoading.value = true
        const res = await cubeZhongdaHeshunService.exportTemplate()
        if (res) {
          const link = document.createElement('a')
          const blob = new Blob([res as BlobPart], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
          link.style.display = 'none'
          link.href = URL.createObjectURL(blob)
          link.setAttribute('download', '重点场所导入模版.xlsx')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
      } finally {
        exportLoading.value = false
      }
    }
    const handleEdit = async (record: ProjectPlaceVO): Promise<void> => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-place-details?id=${record.id}&action=edit`)
    }

    const toDetails = async (record: ProjectPlaceVO): Promise<void> => {
      history.pushState({ current: location.pathname + location.search }, '', `/portal/zhongda-heshun/project-place-details?id=${record.id}&action=details`)
    }

    const deleteRow = async (record: ProjectPlaceVO): Promise<void> => {
      try {
        await cubeZhongdaHeshunService.deleteProjectPlace({ ids: record.id })
        placeSelectRef.value?.getList()
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const handleBatchDelete = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error('请选择要删除的场所')
        return
      }
      AntModal.confirm({
        title: '删除',
        content: '确定要删除选中的场所吗？',
        onOk: async () => {
          try {
            await cubeZhongdaHeshunService.deleteProjectPlace({ ids: selectedRowKeysData.value.join(',') })
            message.success('操作成功')
            placeSelectRef.value?.getList()
            tableApi.query()
          } catch {
            message.error('操作失败')
          } finally {
            selectedRowKeysData.value = []
          }
        }
      })
    }


    const placeSelectMethods = (id: string | number | undefined): void => {
      page.pageNumber = 1
      page.pageSize = 10
      formApi.formValues.placeTypeId = id
      tableApi.query()
    }
    // 上传数据
    const fileUpload = async (options: { file: File; onProgress: (arg0: { percent: number; }) => void; }): Promise<void> => {
      const file = options.file
      const progress = { percent: 1 }
      const speed = 100 / (file.size / 65000)
      const intervalId = setInterval(() => {
        if (progress.percent < 100) {
          progress.percent += speed
          options.onProgress(progress)
        } else {
          clearInterval(intervalId)
        }
      }, 100)
      const formData = new FormData()
      formData.append('file', file)
      cubeZhongdaHeshunService.importTemplate((formData as unknown as Record<string, FormData>)).then(async () => {
        tableApi.query()
        message.success('导入成功')
      }).catch()
    }
    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div class={styles['layout-header-item']}>
            <Button type='primary' onClick={handleAdd}>新增</Button>
            <Button type='primary' onClick={handleDownload} loading={exportLoading.value}>下载模版</Button>
            <Upload name='file'
              showUploadList={false}
              // 限制文件格式
              accept='.xlsx,.xls'
              // 自定义上传行为
              customRequest={fileUpload}> <Button type='primary' >批量导入</Button></Upload>
            <Button type='primary' danger onClick={handleBatchDelete}>批量删除</Button>
          </div>
        )
      },
      'layout-content': (): JSX.Element => {
        return (
          <div >
            <div class={styles['layout-content-main']}>

              <div class={styles['layout-content-right']}>
                <CubeForm />
                <CubeTable />
              </div>
            </div>
          </div>
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
    return (): JSX.Element => (
      <>
        <CubeLayout title={pageTitle ?? '重点场所'} v-slots={slots} >
        </CubeLayout>
        <div class={styles['layout-content-left']}>
          <PlaceSelect title={'场所分类'} projectId={formApi.formValues.projectId as string ?? ''} ref={placeSelectRef} upload={true} dataType='PLACE' onSelect={placeSelectMethods} />
        </div>
      </>
    )
  }
})