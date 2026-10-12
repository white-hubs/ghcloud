import { defineComponent, ref, reactive } from 'vue'
import { Button, PopOver, PopConfirm, message, AntModal, Page } from '@ghcloud/cube-ui'
import { useRoute } from 'vue-router'
import { kkFilePreview, showImagePreview, usePageName } from '@ghcloud/cube-utils'
import { CubeLayout, useCubeForm, useCubeTable } from '@ghcloud/cube-app-design'
import type { ProjectFileVO } from '@ghcloud/cube-zhongda-heshun-service'
import { cubeZhongdaHeshunService } from '@/api/service'
import { fileDownLoad } from '@/hook/file-download'
import { ProjectFileModal } from './project-file-modal'
import { ProjectSelect } from '@/components/project-select/project-select'
import styles from './project-file.module.less'
import PlaceSelect from '@/components/project-place/project-place'
import { cubeFileService } from '@ghcloud/cube-app-design/src/api/service'
import { typeList } from '@/utils'
import dayjs from 'dayjs'

export const ProjectFile = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const route = useRoute()
    const placeSelectRef = ref()
    const tableCode = route.path.replaceAll('/', '')
    const fileTypeId = ref<string | number | undefined>('')
    const selectedRowKeysData = ref<string[]>([])
    const selectedRowData = ref<ProjectFileVO[]>([])
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    })
    let searchFormSchema = [
      {
        component: 'Input',
        label: '',
        fieldName: 'keyword',
        componentProps: {
          placeholder: '文件名称'
        }
      },
      {
        component: ProjectSelect,
        label: '项目',
        fieldName: 'projectId',
      },
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
        title: '文件名称',
        dataIndex: 'fileName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属项目',
        dataIndex: 'projectName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '文件类型',
        dataIndex: 'fileTypeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '上传人',
        dataIndex: 'uploadUserName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '上传时间',
        dataIndex: 'uploadTime',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const time = text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : '--'
          return <PopOver content={time || '--'}>{time || '--'}</PopOver>
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
        customRender: ({ record }: { record: ProjectFileVO; }): JSX.Element => {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleShow(record)
              }}>预览</Button>
              <Button type='link' size='small' onClick={() => {
                handleDowload(record)
              }}>下载</Button>
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
          fileTypeId: fileTypeId.value,
          keyword: formApi.formValues.keyword as string ?? '',
          projectId: formApi.formValues.projectId as string ?? '',
        }
        return cubeZhongdaHeshunService.getMaterialsList(params)
      },
      fetchLoaded: (data) => {
        page.total = data.total
      },
      rowSelectionChange: (keys, records) => {
        selectedRowKeysData.value = keys as string[]
        selectedRowData.value = records as ProjectFileVO[]
      },
    })

    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber
      page.pageSize = pageSize
      tableApi.query()
    }

    const featureModalRef = ref<{ openModal: () => void; }>()

    const handleAdd = (): void => {
      featureModalRef.value?.openModal();
    }

    const handleDowload = (record: ProjectFileVO): void => {
      if (!record.fileId){
        message.error('该文档无文件')
        return
      }
      getFileList(record.fileId, false)
    }

    const handleShow = (record: ProjectFileVO): void => {
      if (!record.fileId){
        message.error('该文档无文件')
        return
      }
      getFileList(record.fileId, true)
    }
    const getFileList = async (id: string, view: boolean): Promise<void> => {
      try {
        const data = await cubeFileService.getFileInfo(id)
        if (view){
          if (typeList.includes(data.type ?? '')) {
            kkFilePreview(data)
          } else {
            showImagePreview([data.path ?? ''], 0)
          }
        } else {
          fileDownLoad(data.name ?? '', data.path ?? '')
        }
      } catch {
        message.error('获取文件失败')
      }
    }
    const deleteRow = async (record: ProjectFileVO): Promise<void> => {
      try {
        await cubeZhongdaHeshunService.deleteMaterialsList({ ids: record.id })
        placeSelectRef.value?.getList()
        message.success('操作成功')
        tableApi.query()
      } catch {
        message.error('操作失败')
      }
    }

    const handleBatchDownload = async (): Promise<void> => {
      if (selectedRowData.value.length === 0) {
        message.warning('请选择要下载的文件')
      } else {
        for (const item of selectedRowData.value) {
          handleDowload(item)
        }
      }
    }

    const handleBatchDelete = (): void => {
      if (!selectedRowKeysData.value.length) {
        message.error('请选择要删除的文件')
        return
      }
      AntModal.confirm({
        title: '删除',
        content: '确定要删除选中的文件吗？',
        onOk: async () => {
          try {
            await cubeZhongdaHeshunService.deleteMaterialsList({ ids: selectedRowKeysData.value.join(',') })
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
      fileTypeId.value = id
      tableApi.query()
    }
    const slots = {
      'layout-header': (): JSX.Element => {
        return (
          <div class={styles['layout-header-item']}>
            <Button type='primary' onClick={handleAdd}>新增</Button>
            <Button type='primary' onClick={handleBatchDownload}>批量下载</Button>
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
        <CubeLayout title={pageTitle ?? '项目资料'} v-slots={slots} >
          <ProjectFileModal ref={featureModalRef} title='上传项目资料' onEnter={() => {
            placeSelectRef.value?.getList()
            tableApi.query()
          }} />
        </CubeLayout>
        <div class={styles['layout-content-left']}>
          <PlaceSelect title={'文件类型'} projectId={formApi.formValues.projectId as string ?? ''} ref={placeSelectRef} upload={false} dataType='FILE' onSelect={placeSelectMethods} />
        </div>
      </>
    )
  }
})