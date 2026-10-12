import { defineComponent, reactive, type PropType } from 'vue'
import { Modal, Button, UploadDragger, InboxOutlined, CheckCircleFilled, Table } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { cubeOperatingRoomService } from '@/api/service'
import { downloadExcelFile } from '@/utils'
import type { UploadChangeParam } from 'ant-design-vue'
import type { ImportResult } from '@ghcloud/cube-operating-room-service'
type ImportType = 'machines' | 'items'
export const BatchImportModal = defineComponent({
  props: {
    tenant: {
      type: String,
      default: ''
    },
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String as PropType<ImportType>,
      default: 'machines'
    }
  },
  emits: ['update:visible'],
  setup: (props, { emit }) => {
    const state = reactive<{
      resultState: ImportResult | null ;
    }>({
      resultState: null
    })
    const handleDownload = async (): Promise<void> => {
      // TODO: 下载模板
      const blob = props.type === 'machines' ? await cubeOperatingRoomService.downloadResourceMachinesTemplate() : await cubeOperatingRoomService.downloadResourceItemTemplate()
      downloadExcelFile(blob, `导入${props.type === 'machines' ? '机组' : '物品'}模板`)
    }
    const customRequest = async (options: { onProgress: ({ percent }: { percent: number; }) => void; file: File;onSuccess: (res: unknown, file: File) => void; }): Promise<void> => {

      const formData = new FormData()
      const progress = { percent: 2 }
      formData.append('file', options.file)
      options.onProgress?.(progress)
      const timer = setInterval(() => {
        progress.percent += 10
        options.onProgress?.(progress)
        if (progress.percent >= 100) {
          clearInterval(timer)
        }
      }, 100)
      const result = props.type === 'machines'
        ? await cubeOperatingRoomService.importResourceMachines({
          tenant: props.tenant,
          file: formData
        })
        : await cubeOperatingRoomService.importResourceItem({
          tenant: props.tenant,
          file: formData
        })
      clearInterval(timer)
      options.onSuccess(result, options.file)
      state.resultState = result
    }
    const handleChange = (info: UploadChangeParam): void => {
      if (info.file.status === 'done') {

        // TODO: 上传文件
      } else if (info.file.status === 'error') {
        // TODO: 上传失败
      }
    }
    const resultColumns = [
      {
        title: '失败行数',
        dataIndex: 'key',
        align: 'center',
      },
      {
        title: '失败原因',
        dataIndex: 'value',
        align: 'center'
      },
    ]
    return (): JSX.Element => (
      <Modal
        v-model:visible={props.visible} footer={null} title='批量导入' onCancel={() => {
          state.resultState = null
          emit('update:visible', false)
        }} width='800px'
      >
        {!state.resultState &&
          <div class={styles.content}>
            <div class={styles.tips}>请按模板填写后再上传</div>
            <Button type='link' class={styles.downloadBtn} onClick={handleDownload}>点击下载模板</Button>
            <UploadDragger customRequest={customRequest} onChange={handleChange}>
              <p class={styles.uploadIcon}>
                <InboxOutlined style={{ fontSize: '68px', color: 'var(--cube-theme-var--primary-5)' }} />
              </p>
              <p class={styles.uploadText}>点击或将文件拖拽到这里上传</p>
              <p class={styles.uploadTips}>
                支持扩展名: xlsx
              </p>
            </UploadDragger>
          </div>}

        {
          state.resultState &&
            <div class={styles.result}>
              <div class={styles.tips}>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: '52px' }} />
                <div>已成功导入{state.resultState.success}条,失败{state.resultState.fail},原因如下</div>
              </div>
              <Table style={{ width: '100%' }} columns={resultColumns} dataSource={state.resultState?.errorMsgList} />
            </div>
        }

      </Modal>
    )
  }
})
