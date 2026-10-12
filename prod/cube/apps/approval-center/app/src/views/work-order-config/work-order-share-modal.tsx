import { defineComponent, reactive } from 'vue'
import { Button, message } from '@ghcloud/cube-ui'
import { useCubeModal } from '@ghcloud/cube-app-design'
import type { FormFlowDetailVO } from '@ghcloud/cube-approval-center-service'
import { getNowEnterprise } from '@ghcloud/generic-component/src/utils/auth'
import { cubeApprovalCenterService } from '@/api/service'

interface Props {
  title: string;
}

export const WorkOrderShareModal = defineComponent({
  props: ['title'],
  emits: ['enter', 'cancel'],
  setup (props: Props, { emit, expose }) {
    const shareState = reactive<{
      flowName: string;
      flowUrl: string;
      codeUrl: string;
    }>({
      flowName: '',
      flowUrl: '',
      codeUrl: '',
    })
   
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      onConfirm: async () => {
        modalApi.close()
      },
      onCancel: () => {
        modalApi.close()
        emit('cancel')
      }
    })
    const openModal = (record: FormFlowDetailVO): void => {
      modalApi.open()
      shareState.flowName = record.name 
      getShareUrl(record)
    }

    const getShareUrl = async (record: FormFlowDetailVO): Promise<void> => {
      try {
        shareState.flowUrl = `${record.qrCodeUrl}&businessType=${record.businessType}&tenant=${getNowEnterprise()?.code}`
        const { path } = await cubeApprovalCenterService.getQrCode({
          tenant: getNowEnterprise()?.code ?? '',
          id: record.id,
          qrCodeUrl: shareState.flowUrl,
          businessType: record.businessType,
        })
        shareState.codeUrl = path ?? ''
      } catch {
        message.error('获取分享链接失败')
      }
    }

    const downloadQr = (): void => {
      if (!shareState.codeUrl) return
      const a = document.createElement('a')
      a.href = shareState.codeUrl
      a.download = `${shareState.flowName}二维码.png`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    const copyFlowUrl = async (): Promise<void> => {
      if (!shareState.flowUrl) return
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareState.flowUrl)
          return
        }
        const temp = document.createElement('textarea')
        temp.value = shareState.flowUrl
        temp.style.position = 'fixed'
        temp.style.opacity = '0'
        document.body.appendChild(temp)
        temp.select()
        document.execCommand('copy')
        document.body.removeChild(temp)
      } catch {
        // ignore
      }
    }

    expose({
      openModal
    })
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <div>
            <p style={{ marginTop: '8px' }}>保存二维码或复制链接分享给外部人员填写</p>

            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column', marginTop: '12px' }}>
              <Button type='primary' class='copy-btn' onClick={downloadQr}>保存二维码</Button>
              <img
                style={{ border: '1px solid #606266', margin: '10px 0px', maxWidth: '100%' }}
                src={shareState.codeUrl}
                alt='表单二维码'
              />
            </div>

            <div style={{ borderTop: '1px solid #ebeef5', margin: '12px 0', height: '1px' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
              <Button type='primary' class='copy-btn' onClick={copyFlowUrl}>复制链接</Button>
              <span id='copy-text' style={{ marginTop: '10px', wordBreak: 'break-all' }}>{shareState.flowUrl}</span>
            </div>
          </div>
        )
      }
    }
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />
  }
})