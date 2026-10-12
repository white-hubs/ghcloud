import { exportExcel } from '@/utils/common'
import { Modal, Radio, RadioGroup } from '@ghcloud/cube-ui'
import { defineComponent, ref } from 'vue'

export const ExportModel = defineComponent({
  props: {
    id: {
      type: String,
      default: ''
    },
  },
  setup: (props, context) => {
    const templateDownloadVisible = ref<boolean>(false)
    const templateDownloadFlag = ref<string>('1')
    const exportLoading = ref(false)
    const handleOkFormModelTable = async (): Promise<void> => {
      exportLoading.value = true
      if (templateDownloadFlag.value === '1') {
        await exportExcel('/excel/exportCtlTemplate', { channelId: props.id }, '控制器模板').then(() => {
          exportLoading.value = false
        })
      } else if (templateDownloadFlag.value === '2') {
        await exportExcel('/excel/exportCtlAndVarTemplate', { channelId: props.id }, '控制器及变量模板').then(() => {
          exportLoading.value = false
        })
      }
      templateDownloadVisible.value = false
    }
    const cancel = (): void => {
      templateDownloadVisible.value = false
    }
    const openTemplat = (): void => {
      templateDownloadVisible.value = true
      exportLoading.value = false
      templateDownloadFlag.value = '1'
    }
    // 使用 expose 暴露组件内部的方法
    context.expose({ openTemplat })
    return (): JSX.Element =>
      <>
        <Modal
          visible={templateDownloadVisible.value}
          title='模板下载'
          onOk={handleOkFormModelTable}
          onCancel={cancel}
          maskClosable={false}
          confirmLoading={exportLoading.value}
        >
          <div>
            <RadioGroup v-model:value={templateDownloadFlag.value}>
              <Radio value='1'>控制器导入模板下载</Radio>
              <Radio value='2'>控制器及变量导入模板下载</Radio>
            </RadioGroup>
          </div>
        </Modal>
      </>
  }
})
