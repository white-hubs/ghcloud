import { Button } from '@ghcloud/cube-ui'
import { message, Space } from 'ant-design-vue'
import { useCubeModal } from '@ghcloud/cube-app-design'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const [BaseCubeModal, baseModalApi] = useCubeModal({
      title: '基础弹窗',
    })
    const [EventCubeModal, eventModalApi] = useCubeModal({
      title: '事件监听',
      onConfirm: () => {
        message.success('点击了确认 3s 后关闭')
        eventModalApi.setState({ confirmLoading: true })
        setTimeout(() => {
          eventModalApi.close()
        }, 3000)
      },
      onClosed: () => {
        message.success('弹窗关闭')
      }
    })

    return (): JSX.Element => (
      <>
        <BaseCubeModal>
          弹窗内容
        </BaseCubeModal>
        <EventCubeModal>
          点击确认试一试
        </EventCubeModal>

        <Space>
          <Button type='primary' onClick={()=>{
            baseModalApi.open()
          }}>基础弹窗</Button>
          <Button type='primary' onClick={()=>{
            eventModalApi.open()
          }}>事件监听</Button>
        </Space>
      </>
    )
  }
})
