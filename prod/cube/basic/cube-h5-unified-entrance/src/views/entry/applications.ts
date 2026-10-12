import { onMounted } from 'vue'
import { showNotify } from 'vant'
import { useRouter } from 'vue-router'

const applications = new Map(
  [
    ['HIDDENDANGER', '/apps/hidden-danger/h5'],
    ['FAULT', '/apps/fault-repair/h5'],
    ['SECURE_EDU', '/apps/secure-edu/h5'],
    ['SAFETY_MANAGE_MARKET', '/apps/safety-supervision/h5/#/market-entry'],
    ['RISK_SOURCE', '/apps/risk-management/h5'],
    ['ALARM_CENTER', '/apps/alarm-center/h5'],
    ['SECURITY_MONITORING', '/apps/@ghcloud/cube-security-management-h5'],
    ['BROADCAST_CENTER', '/apps/@ghcloud/cube-broadcast-center-h5'],
    ['MESSAGE_CENTER', '/apps/@ghcloud/cube-message-center-h5'],
    ['EMERGENCY_CENTER', '/apps/@ghcloud/cube-emergency-h5'],
    ['AGENCY_CENTER', '/apps/@ghcloud/cube-todo-center-h5'],
    ['TECHNICAL_BULLETIN', '/apps/@ghcloud/cube-notice-announcement-h5'],
    ['INSPECTION', '/apps/daily-inspection/h5'],
    ['ELECTRONIC_PATROL', '/apps/electronic-patrol/h5'],
    ['FIRECONTROL', '/apps/@ghcloud/cube-iot-center-h5/#/entry?applicationCode=FIRECONTROL'],
    ['ROTATINGMANAGE', '/apps/@ghcloud/cube-iot-center-h5/#/entry?applicationCode=ROTATINGMANAGE'],
    ['ELECTRICMANAGE', '/apps/@ghcloud/cube-iot-center-h5/#/entry?applicationCode=ELECTRICMANAGE'],
    ['GAS_MANAGEMENT', '/apps/@ghcloud/cube-iot-center-h5/#/entry?applicationCode=GAS_MANAGEMENT'],
    ['SMALLENFINEERING', '/apps/@ghcloud/cube-small-engineering-h5'],
    ['PROPERTY_MANAGEMENT', '/apps/@ghcloud/cube-asset-management-h5']
  ]
)
export const useJumpApplication = (): void => {
  const router = useRouter()
  const { application } = router.currentRoute.value.query as { application?: string; }

  onMounted(() => {
    if (!application) {
      showNotify({ type: 'danger', message: '缺少application参数' })
      return
    }
    if (!applications.has(application)) {
      showNotify({ type: 'danger', message: '未知的application code' })
      return
    }
    history.replaceState(null, '', applications.get(application))
  })
}
