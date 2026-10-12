import { defineComponent, onMounted, ref } from 'vue'
import { Button, Page, PopOver } from '@ghcloud/cube-ui'
import '@/styles/common.less'
import { useTableScroll } from '@/hook/use-table-scroll'
import { cubeKnowledgeDocumentService } from '@/api/service'
import type { KnowledgeDocumentModel } from '@ghcloud/cube-knowledge-document-service'
import { message } from 'ant-design-vue/es'
import { AliasTable } from '@ghcloud/generic-component'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { fileDownLoad } from '@/hook/file-download'
import { showImagePreview, kkFilePreview } from '@ghcloud/cube-utils'
import { typeList } from '@/utils'

export const TabKnowledgeDocuments = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
    prodId: {
      type: String,
      default: ''
    },
  },
  setup (props) {
    const route = useRoute()
    const tableCode = route.path.replaceAll('/', '')
    const columns = [
      {
        title: '文档名称',
        dataIndex: 'name',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '文档类型',
        dataIndex: 'typeName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element=> {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '文档格式',
        dataIndex: 'format',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '文档大小',
        dataIndex: 'size',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: number; }): JSX.Element => {
          const size = text ? `${(text / 1024 / 1024).toFixed(2)} MB` : '--'
          return <PopOver content={size}>{size}</PopOver>
        }
      },
      {
        title: '关联产品',
        dataIndex: 'productName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '所属部门',
        dataIndex: 'deptName',
        ellipsis: true,
        align: 'center',
        customRender: ({ text }: { text: string; }): JSX.Element => {
          return <PopOver content={text || '--'}>{text || '--'}</PopOver>
        }
      },
      {
        title: '上传人',
        dataIndex: 'createBy',
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
        title: '操作',
        dataIndex: 'action',
        width: 180,
        fixed: 'right',
        customRender: ({ record }: { record: KnowledgeDocumentModel; }): JSX.Element=> {
          return (
            <>
              <Button type='link' size='small' onClick={() => {
                handleDowload(record)
              }}>下载</Button>
              <Button type='link' size='small' onClick={() => {
                handleShow(record)
              }}>查看</Button>
            </>
          )
        }
      }
    ]
    const loading = ref(false)
    const dataSource = ref<KnowledgeDocumentModel[]>([])
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0
    })
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          productId: props.prodId,
          name: '',
          typeId: '',
          deptId: '',
        }
        const res = await cubeKnowledgeDocumentService.getKnowledgeDocumentList(params)
        if (res) {
          dataSource.value = res.records
          pagination.value.total = res.total
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
    const { tabScrollY } = useTableScroll()
    onMounted(() => {
      getTableData()
    })

    const handleDowload = (record: KnowledgeDocumentModel): void => {
      const fileName = record.fileList[0].name;
      const filePath = record.fileList[0].path;
      fileDownLoad(fileName, filePath)
    }
    const handleShow = (record: KnowledgeDocumentModel): void => {
      if (record.fileList.length === 0){
        message.error('该文档无文件')
        return
      }
      const item = record.fileList[0]
      if (typeList.includes(item.type ?? '')) {
        kkFilePreview(item)
      } else {
        showImagePreview([item.path], 0)
      }
    }

    return (): JSX.Element=>
      <>
        <AliasTable
          rowKey='id'
          columns={columns}
          loading={loading.value}
          dataSource={dataSource.value}
          tableCode={`${tableCode}Knowledge`}
          pagination={false}
          scrollY={tabScrollY.value - 20}
          applicationCode={__ENV__.applicationCode}
        />
        {
          dataSource.value.length > 0 &&
            <Page
              style={{ marginTop: '30px', display: 'flex', justifyContent: 'right' }}
              v-model:current={pagination.value.pageNumber}
              v-model:pageSize={pagination.value.pageSize}
              v-model:total={pagination.value.total}
              onPageChange={pageChange}
            />
        }
      </>
  }
})
