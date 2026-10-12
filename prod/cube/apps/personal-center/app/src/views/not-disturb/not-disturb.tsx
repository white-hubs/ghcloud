import {
  defineComponent,
  nextTick,
  onMounted,
  reactive,
  ref,
  type VNode
} from 'vue'
import { GLayout } from '@/components/common/layout'
import { cubeMessageService } from '@/api/service'
import { Button, Form, FormItem, message, Modal, Switch, TimePicker } from '@ghcloud/cube-ui'
import CheckboxGroup from '@ghcloud/cube-ui/src/components/checkbox-group/checkbox-group'
import { authStore } from '@/api/auth-store'
import QRCode from 'qrcodejs2-fix'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
enum CubeTerminalEnum {
  BUSINESS = 'bimops-manage-web'
}
export const NotDisturb = defineComponent({
  setup: () => {
    const formState = reactive<
      {
        startTime: string;
        endTime: string;
        enabled: boolean;
        channels: string[];
      }>({
      enabled: false,
      startTime: '',
      endTime: '',
      channels: []
    })
    const loading = ref(false)
    const plainOptions = [
      { label: '站内消息', value: 'CHANNEL_SITE' },
      { label: 'APP推送', value: 'CHANNEL_APP' },
      { label: '短信', value: 'CHANNEL_SMS' },
    ]
    const isShowWeChatOfficialQrCode = ref(false)
    const closeQrCode = (): void => {
      isShowWeChatOfficialQrCode.value = false
    }
    const showWeChatOfficialQrCode = async (): Promise<void> => {
      try {
        isShowWeChatOfficialQrCode.value = true
        const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, authStore.tenant, authStore.token)
        const cubeSecret = await cubeAuthService.getSecretByToken()
        const authType = 'WX_OFFICIAL_ACCOUNT'
        const tenant = authStore.tenant
        const qrcodeUrl = `${window.origin}/apps/qrcode-transfer/platform-auth?authType=${authType}&cubeSecret=${cubeSecret}&tenant=${tenant}`
        generateQrCode(qrcodeUrl)
      } catch (error) {
        message.error((error as { errorMessage: string; })?.errorMessage ?? '参数错误')
      }
    }
    const generateQrCode = (qrcodeUrl: string): void => {
      nextTick(() => {
        const qrcodeContainer = document.getElementById('qrcode')
        if (qrcodeContainer) {
          // 清除之前生成的二维码
          while (qrcodeContainer.firstChild) {
            qrcodeContainer.removeChild(qrcodeContainer.firstChild)
          }
          new QRCode(qrcodeContainer, {
            text: qrcodeUrl,
            width: 128,
            height: 128,
          })
          qrcodeContainer.style.textAlign = 'center'
        }
      })
    }

    const getForm = async (): Promise<void> => {
      try {
        const data = await cubeMessageService.getIgnoredConfig()
        formState.enabled = data.enabled ?? false
        formState.startTime = data?.startTime ?? ''
        formState.endTime = data?.endTime ?? ''
        formState.channels = data?.channels ?? []
      } catch (e) {
        message.error((e as { errorMessage: string; })?.errorMessage ?? '暂无消息配置')
      }
    }
    const submit = async (): Promise<void> => {
      const startTime = formState.startTime && formState.startTime.split(':')[0] + formState.startTime.split(':')[1]
      const endTime = formState.endTime && formState.endTime.split(':')[0] + formState.endTime.split(':')[1]
      if (startTime > endTime) {
        message.warning('开始时间不能大于结束时间')
        return
      }
      if (!startTime || !endTime) {
        message.warning('请选择时间')
        return
      }
      loading.value = true
      try {
        await cubeMessageService.setIgnoredConfig(formState)
        message.success('保存成功')
      } catch (err) {
        message.error((err as { errorMessage: string; })?.errorMessage ?? '请求错误')
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getForm()
    })
    const codeDom = (): VNode =>
      <div>
        <Button loading={isShowWeChatOfficialQrCode.value} type='primary' onClick={showWeChatOfficialQrCode}>绑定微信公众号</Button>
        <Modal
          visible={isShowWeChatOfficialQrCode.value}
          title='微信公众号二维码'
          onCancel={closeQrCode}
          width='220px'
          footer={false}
        >
          <div style='margin: 0 auto;width: 128px;'>
            <div id='qrcode' style='width:128px' />
          </div>
        </Modal>
      </div>

    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      'content-table': (): JSX.Element => {
        return (
          <>
            <Form model={formState}>
              <FormItem label='消息免打扰'>
                <Switch v-model:checked={formState.enabled} />
              </FormItem>
              <FormItem label='设定时间'>
                <TimePicker
                  v-model:value={formState.startTime} placeholder='开始时间' style='margin-right: 10px;' format='HH:mm:SS'
                  valueFormat='HH:mm:SS'
                />
                <TimePicker v-model:value={formState.endTime} placeholder='结束时间' format='HH:mm:SS' valueFormat='HH:mm:SS' />
              </FormItem>
              <FormItem label='免打扰类型'>
                <CheckboxGroup v-model:value={formState.channels} options={plainOptions} />
              </FormItem>
            </Form>
            {codeDom()}
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Button type='primary' onClick={submit} loading={loading.value}>保存</Button>
        )
      }
    }
    return (): JSX.Element =>
      <>
        <GLayout title='消息免打扰' v-slots={gLayoutSlots} />
      </>
  }
})
