import { cubeMessageCenterService, cubeOuaaService } from '@/api/service'
import { ChannelCodesType, type MsgTemplate } from '@ghcloud/cube-message-center-service/src/types'
import { CheckboxGroup, Modal, Spin, Textarea, message } from '@ghcloud/cube-ui'
import { debounce } from 'lodash'
import { computed, defineComponent, ref } from 'vue'

interface Props {
  channelCode: ChannelCodesType;
}
export const RelateModal = defineComponent({
  props: ['channelCode'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const loading = ref(false)
    const templateId = ref('')
    const submitLoading = ref(false)
    const modalVisible = ref<boolean>(false)

    const terminalList = ref<{ label: string; value: string; }[]>([])
    const selectTerminals = ref<string[]>([])
    const msgRecord = ref<MsgTemplate>()

    const title = computed(() => {
      if (props.channelCode === ChannelCodesType.CHANNEL_SITE) {
        return '关联访问端'
      } else {
        return '关联第三方模板ID'
      }
    })
    const showTerminals = computed(() => {
      return props.channelCode === ChannelCodesType.CHANNEL_SITE
    })
    const getTerminalList = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeOuaaService.getTerminals()
        terminalList.value = res?.map(e => {
          return {
            label: e.name,
            value: e.code
          }
        })
      } catch {
      } finally {
        loading.value = false
      }
    }
    const openModal = async (record: MsgTemplate): Promise<void> => {
      if (showTerminals.value) {
        getTerminalList()
        selectTerminals.value = record.config ? JSON.parse(record.config)?.terminals : []
      } else {
        templateId.value = record.config ? JSON.parse(record.config)?.tmpId : ''
      }
      msgRecord.value = record
      modalVisible.value = true
    }
    // const validate = (): boolean => {
    //   message.destroy()
    //   if (showTerminals.value) {
    //     if (selectTerminals.value.length === 0) {
    //       message.warn('请选择访问端')
    //       return false
    //     }
    //     return true
    //   } else {
    //     if (templateId.value.length === 0) {
    //       message.warn('请输入第三方模板ID')
    //       return false
    //     }
    //     return true
    //   }
    // }
    const handleOk = debounce(async () => {
      try {
        const config = showTerminals.value
          ? {
            terminals: selectTerminals.value
          }
          : {
            tmpId: templateId.value
          }
        submitLoading.value = true
        await cubeMessageCenterService.updateMsgTemplateConfig(msgRecord.value?.id ?? '', {
          config: JSON.stringify(config)
        })
        message.success('操作成功')
      } catch {
      } finally {
        submitLoading.value = false
      }
      modalVisible.value = false
      emit('enter')
    }, 500)
    const handleCancel = (): void => {
      modalVisible.value = false
      emit('cancel')
    }

    expose({
      openModal,
    })

    return (): JSX.Element =>
      <>
        <Modal
          title={title.value}
          visible={modalVisible.value}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={submitLoading.value}
        >
          {showTerminals.value
            ? (
              <Spin spinning={loading.value}>
                <CheckboxGroup v-model:value={selectTerminals.value} options={terminalList.value} />
              </Spin>
            )
            : <Textarea v-model:value={templateId.value} placeholder='请输入第三方模板ID' />}
        </Modal>
      </>
  }
})
