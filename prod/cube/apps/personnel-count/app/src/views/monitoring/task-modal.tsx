import { defineComponent, reactive, ref, watch } from 'vue'
import { Image, Modal, Page, Table } from '@ghcloud/cube-ui'
import { cubeSecurityService } from '@/api/service'
import type { RollCall } from '@ghcloud/cube-security-management-service'
import dayjs from 'dayjs'
export const TaskModal = defineComponent({
  emits: ['close'],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    code: {
      type: String,
      default: ''
    },
  },
  setup: (props, { emit }) => {
    const modalVisible = ref(false)
    const tableLoading = ref(false)
    const dataSource = ref<RollCall[]>([])
    const status = new Map([
      [0, '点到'],
      [1, '特殊情况']
    ])
    const pagination = reactive({
      total: 0,
      position: 'bottom',
      pages: 1,
      pageSize: 10,
      current: 1,
    })
    const columns = [
      {
        title: '人员证件照',
        dataIndex: 'facePhoto',
        key: 'facePhoto',
        customRender: ({ record }: { record: RollCall; }): JSX.Element => {
          return <Image src={record.facePhoto} />
        },
      },
      {
        title: '人员姓名',
        dataIndex: 'personName',
        key: 'personName',
      },
      {
        title: '编号',
        dataIndex: 'indexCode',
        key: 'indexCode',
        customRender: ({ text }: { text: string; }): string => {
          return text || '-'
        }
      },
      {
        title: '人员所在区域',
        dataIndex: 'areaName',
        key: 'areaName',
      },
      {
        title: '人员抓拍照片',
        dataIndex: 'capturePhoto',
        key: 'capturePhoto',
        customRender: ({ record }: { record: RollCall; }): JSX.Element => {
          return <Image src={record.capturePhoto} />
        },
      },
      {
        title: '对比相似度',
        dataIndex: 'similarity',
        key: 'similarity',
      },
      {
        title: '点名状态',
        dataIndex: 'status',
        key: 'status',
        customRender: ({ text }: { text: number; }): string => {
          return status.get(text) || '-'
        }
      },
      {
        title: '点到时间',
        dataIndex: 'rollcallTime',
        key: 'rollcallTime',
        customRender: ({ text }: { text: string; }): string => {
          return dayjs(text).format('YYYY-MM-DD HH:mm:ss') || '-'
        }
      },
    ]
    // 表格数据
    const getTableData = async (): Promise<void> => {
      tableLoading.value = true
      const obj = {
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
        recordCode: props.code
      }
      const { records, total, pages } = await cubeSecurityService.personRollCallPage(obj)
      dataSource.value = records
      pagination.total = total
      pagination.pages = pages
      tableLoading.value = false
    }
    const close = (): void => {
      emit('close')
      modalVisible.value = false
    }
    const pageChange = (current: number, pageSize: number): void => {
      pagination.current = current
      pagination.pageSize = pageSize
      getTableData()
    }
    watch(() => props.visible, () => {
      modalVisible.value = props.visible
      getTableData()
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <Modal
        v-model:visible={modalVisible.value}
        width='1300px'
        title='任务详情'
        onOk={() => {
          close()
        }}
        onCancel={() => {
          close()
        }}
      >
        <div style='margin-bottom: 10px;'> 任务编号{props.code} </div>
        <Table
          rowKey='id'
          data-source={dataSource.value}
          columns={columns}
          pagination={false}
          scrollY={450}
          size='middle'
          loading={tableLoading.value}
        />
        <div style='display: flex;justify-content: flex-end;margin: 10px 0px;'>
          <Page
            v-model:current={pagination.pages}
            v-model:pageSize={pagination.pageSize}
            v-model:total={pagination.total}
            onPageChange={pageChange}
          />
        </div>
      </Modal>
  }
})
