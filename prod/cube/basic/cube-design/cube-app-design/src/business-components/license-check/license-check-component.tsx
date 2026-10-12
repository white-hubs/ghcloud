import { CubeOuaaService, type LicenseInfo } from '@ghcloud/cube-ouaa-service'
import { Modal, WarningOutlined } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import styles from './license-check-component.module.less'

export const LicenseCheckComponent = defineComponent({
  name: 'LicenseCheckComponent',
  emits: ['close'],
  setup (props, { emit }) {
    const licenseInfo = ref<LicenseInfo>()
    const expiryDays = ref(999)
    const showModal = ref(false)
    onMounted(async ()=>{
      licenseInfo.value = await new CubeOuaaService({
        token: '',
        tenant: '',
        terminal: CubeTerminalEnum.BUSINESS,
      }).getLicenseInfo()
      expiryDays.value = licenseInfo.value.expiryDays

      if (expiryDays.value < 0){
        return
      }
      if (expiryDays.value <= 31){
        showModal.value = true
      }
    })
    return (): JSX.Element =><>
      <Modal
        v-model:visible={showModal.value}
        wrapClassName={styles['license-check-component']}
        title="授权到期提醒"
        okText="我已知晓"
        closable={false}
        cancelButtonProps={{ style: { display: 'none' } }}
        onOk={()=>{
          emit('close')
        }}
        width='800px'
      >
        <div style='text-align: center'>
          <h1 style='font-size: 28px'>系统授权剩余【<span style="color:red">{expiryDays.value}</span>】天到期，请联系服务商处理！</h1>
          {/* <h2>联系电话：400-105-5388</h2> */}
        </div>
      </Modal>
      {
        expiryDays.value < 0 && <div class={styles['license-check-fullscreen']}>
          <WarningOutlined style="color:red;font-size:10vw" />
          <h2>系统授权已到期，禁止登录。请联系服务商处理！</h2>
          {/* <h2>联系电话：400-105-5388</h2> */}
        </div>
      }
    </>
  }
})