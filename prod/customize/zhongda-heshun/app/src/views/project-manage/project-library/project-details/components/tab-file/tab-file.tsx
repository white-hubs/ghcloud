import { defineComponent, ref, reactive, onMounted } from 'vue'
import { Button, PopOver, PopConfirm, message, Table, Form, Input, FormItem } from '@ghcloud/cube-ui'
import { kkFilePreview, showImagePreview } from '@ghcloud/cube-utils'
// 移除 useCubeForm 导入
import type { ProjectFileVO } from '@ghcloud/cube-zhongda-heshun-service'
import { cubeZhongdaHeshunService } from '@/api/service'
import { fileDownLoad } from '@/hook/file-download'
import styles from './tab-file.module.less'
import { cubeFileService } from '@ghcloud/cube-app-design/src/api/service'
import { typeList } from '@/utils'
import { useTableScroll } from '@/hook/use-table-scroll'
interface Props {
  projectId: string;
}
export const ProjectFile = defineComponent({
  name: 'ProjectFile',
  props: {
    projectId: {
      type: String,
      required: true
    }
  },
  setup: (props: Props) => {
    const { scrollY } = useTableScroll()
    const loading = ref(false)
    const fileTypeId = ref<string | number | undefined>('')
    const tableData = ref<ProjectFileVO[]>([])
    const page = reactive({
      pageNumber: 1,
      pageSize: 1000,
      total: 0,
    })

    // 替换为Form组件的表单状态
    const formState = reactive({
      keyword: ''
    })

    // 移除 detailSearchFormSchema 和 useCubeForm 相关代码

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
        customRender: ({ text }: { text: string; }): JSX.Element=> {
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
    const getData = async (): Promise<void> => {
      loading.value = true
      try {
        const params = {
          pageNumber: page.pageNumber,
          pageSize: page.pageSize,
          fileTypeId: fileTypeId.value,
          keyword: formState.keyword, // 使用新的formState
          projectId: props.projectId as string ?? '',
        }
        const data = await cubeZhongdaHeshunService.getMaterialsList(params)
        page.total = data.total
        tableData.value = data.records
      } finally {
        loading.value = false
      }
    }

    // 搜索方法
    const handleSearch = (): void => {
      getData()
    }

    // 重置方法
    const handleReset = (): void => {
      formState.keyword = ''
      getData()
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
        message.success('操作成功')
      } catch {
        message.error('操作失败')
      }
    }
    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (

      <>
        <div >
          <div class={styles['layout-content-main']}>

            <div class={styles['layout-content-right']}>
              {/* 替换CubeForm为Form组件 */}
              <div id='cube-query-form-container'>
                <Form layout='inline' style={{ margin: '16px 0' }} >
                  <FormItem label="">
                    <Input
                      v-model:value={formState.keyword}
                      placeholder="请输入文件名称查询"
                      showCount={false}
                      style={{ width: '240px' }}
                    />
                  </FormItem>
                  <FormItem>
                    <Button type="primary" onClick={handleSearch}>搜索</Button>
                    <Button style={{ marginLeft: '8px' }} onClick={handleReset}>重置</Button>
                  </FormItem>
                </Form>
              </div>
              <Table columns={columns} dataSource={tableData.value} loading={loading.value} scrollY={scrollY.value - 80} pagination={false}></Table>
            </div>
          </div>
        </div>
      </>
    )
  }
})