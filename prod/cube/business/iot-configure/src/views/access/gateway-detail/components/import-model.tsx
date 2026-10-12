import { Modal, PopOver, Radio, RadioGroup, Table } from '@ghcloud/cube-ui'
import type { ColumnType } from '@ghcloud/cube-ui/node_modules/ant-design-vue/es/table'
import { defineComponent, reactive, ref } from 'vue'
import { FileUpload } from './file-upload/file-upload'
import type { ImportType } from '@/api/model/geteway'
export const ImportModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  emits: ['importEnd'],
  setup: (props, context) => {
    const importVisible = ref<boolean>(false)
    const importSuccessful = ref<boolean>(true)
    const importFlag = ref<string>('1')
    const fileTypes = ref<string[]>(['.xls', '.xlsx'])
    const uploadRef = ref()
    const importModelTable = (): void => {
      importVisible.value = false
    }
    const importCancel = (): void => {
      importVisible.value = false
      importSuccessful.value = true
    }
    const importData = reactive({
      successCount: '',
      failedCount: ''
    })
    const tableInfo = reactive<{ failColumns: ColumnType[];failTableData: { details: string; }[]; }>({
      failColumns: [
        {
          title: '导入详情',
          dataIndex: 'details',
          align: 'center',
          width: 200,
          ellipsis: true,
          customRender: ({ text }: { text: string; }): JSX.Element => {
            return <PopOver content={text || '--'}>{text || '--'}</PopOver>
          }
        },
        {
          title: '状态',
          dataIndex: 'state',
          align: 'center',
          width: 50,
          ellipsis: true,
          customRender: (): JSX.Element => {
            return <PopOver content='失败'>失败</PopOver>
          }
        },
      ],
      failTableData: [],
    })
    const feilSuccess = (res: ImportType): void => {
      Object.assign(importData, res)
      tableInfo.failTableData = res.failedMsgList.map((item: string) => {
        return {
          details: item,
        }
      })
      context.emit('importEnd')
      importSuccessful.value = false
    }
    const importEvent = (): void => {
      importVisible.value = true
      importSuccessful.value = true
      importFlag.value = '1'
      uploadRef.value.clearAll()
    }
    context.expose({ importEvent })
    return (): JSX.Element =>
      <>
        <Modal
          visible={importVisible.value}
          title={importSuccessful.value ? '导入数据' : '导入反馈'}
          onOk={importModelTable}
          onCancel={importCancel}
        >

          {
            importSuccessful.value
              ? <>
                <div class='mb-20px'>
                  <RadioGroup v-model:value={importFlag.value}>
                    <Radio value='1'>导入控制器</Radio>
                    <Radio value='2'>导入控制器及变量</Radio>
                  </RadioGroup>
                </div>
                <FileUpload ref={uploadRef} fileFlag={importFlag.value} fileTypes={fileTypes.value} channelId={props.id} multiple onSuccess={feilSuccess} />
              </>
              : <>
                <div class='importFeedback'>
                  <div class='importFeedback_title'>
                    <span>导入结果如下：</span>
                    <span>导入成功共计{importData.successCount}条，失败{importData.failedCount}条</span>
                  </div>
                  <Table
                    columns={tableInfo.failColumns} dataSource={tableInfo.failTableData} pagination={false} size='small' scrollY={500}
                  />
                </div>
              </>
          }
        </Modal>
      </>
  }
})
