import { computed, defineComponent, onMounted, ref, type VNode } from 'vue'
import './page.less'
import { useRoute, useRouter } from 'vue-router'
import { Card } from './components/card'
import { Button, Icon, showNotify } from 'vant'
import { useStore } from '@/store'
import { getApplicationLink } from '@/api/identity'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getPropertyDetail, getRiskDetail } from '@/api/property'
import { getInspectDetail, getPatrolDetail } from '@/api/maintain'
import { getStallDetail } from '@/api/mdata'
import { getDeviceDetail } from '@/api/device-center'
import { authStore } from '@/api/auth-store'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import type { CubeTerminalEnum } from '../../../../../protocol/src/main'
const authorization = authStore.token.includes('Bearer') ? authStore.token.split(' ')[1] : authStore.token
const cubeAuthService = new CubeAuthService(authStore.terminal as CubeTerminalEnum, authStore.tenant, authorization)
export const Transfer = defineComponent({
  setup: () => {
    interface AppType {
      id: string | null;
      applicationCode: string;
      applicationName: string;
      thirdUrl: string;
      icon: string;
    }
    document.title = '详细信息'
    const route = useRoute()
    const router = useRouter()
    onMounted(async () => {
      entityAndAppLink()
      if (!sessionStorage.getItem('qrCode') && route.query.code && route.query.code?.length > 0) {
        if (route.query.code.includes('http://www.dbc61.com')) {
          const code = window.location.search.split('?code=')[1] ?? ''
          const deCode = decodeURIComponent(code)
          sessionStorage.setItem('qrCode', deCode)
          return
        }
        sessionStorage.setItem('qrCode', route.query.code as string)
      }
    })
    const thirdLinkList = ref<AppType[]>([])
    const entityType = ref('')
    const baseOnH5 = computed(() => {
      return [
        { code: 'SECURE_EDU', name: '安全教育', path: '/apps/secure-edu/h5/#/qrcode-transfer-add' },
        { code: 'INSPECTION', name: '日常巡检', path: '/apps/daily-inspection/h5/#/inspection-object' },
        { code: 'HIDDENDANGER', name: '隐患排查', path: '/streamengineH5/initiating-work-order?processType=ADD&businessType=HIDDENDANGER' },
        { code: 'FAULT', name: '故障报修', path: '/streamengineH5/initiating-work-order?processType=ADD&businessType=FAULT' },
      ]
    })
    const currentRoute = router.currentRoute
    const cardData = ref()
    const store = useStore()
    const code = currentRoute.value.fullPath.split('code=')[1] ? decodeURIComponent(currentRoute.value.fullPath.split('code=')[1]) : (decodeURIComponent(sessionStorage.getItem('qrCode')!))
    const entityId = ref('')
    const entityName = ref('')
    const entityObject = ref()
    // 详细信息卡片
    const entityAndAppLink = async (): Promise<void> => {
      try {
        const data = await getApplicationLink({ code })
        if (data) {
          entityId.value = data.entityId
          entityName.value = data.entityName
          thirdLinkList.value = data.qrcodeApplicationVOS as AppType[]
          // 筛选微信扫码展示的应用
          if (!store.inGhApp) {
            thirdLinkList.value = thirdLinkList.value.filter(x => !x.applicationCode || ['SECURE_EDU', 'HIDDENDANGER', 'FAULT', 'INSPECTION'].includes(x.applicationCode))
          }
          entityObject.value = {
            entityId: data.entityId,
            entityName: data.entityName,
            entityType: data.entityType
          }
          entityType.value = data.entityType
          // 设备和资产点击跳转
          switch (entityType.value) {
            case 'DEVICE':
              cardData.value = await getDeviceDetail(data.entityId)
              cardData.value.id = data.entityId
              break
            case 'STALL':
              cardData.value = await getStallDetail(data.entityId)
              break
            case 'PROPERTY':
              cardData.value = await getPropertyDetail(data.entityId)
              break
            case 'SITE_POINT':
              cardData.value = await getInspectDetail(data.entityId)
              break
            case 'RISK_SOURCE':
              cardData.value = await getRiskDetail(data.entityId)
              break
            case 'PATROL_POINT':
              cardData.value = await getPatrolDetail(data.entityId)
              cardData.value.name = cardData.value.patrolLocationName
              break
          }
        }
      } catch (err) {
        showNotify({ type: 'danger', message: err?.response?.data?.message ?? '请求失败' })
      }
    }
    if (store.inGhApp)cubeAppService.onQrcodeReceived(code)
    const handleClick = async (item: AppType): Promise<void> => {
      // 第三方链接跳转
      if (!item.applicationCode) {
        window.open(item.thirdUrl)
        return
      }
      const findH5 = baseOnH5.value.find(e => e.code === item.applicationCode)
      // H5应用跳转
      if (findH5) {
        if (findH5.code === 'SECURE_EDU') {
          const cubeSecret = await cubeAuthService.getSecretByToken()
          window.location.href = `${findH5.path}?entityId=${entityId.value}&&cube-secret=${cubeSecret}`
          return
        }
        if (findH5.code === 'INSPECTION') {
          const cubeSecret = await cubeAuthService.getSecretByToken()
          window.location.href = `${findH5.path}?targetId=${entityId.value}&targetCategory=${entityType.value}&cube-secret=${cubeSecret}`
          return
        }
        if (findH5.path.includes('streamengineH5')) {
          window.location.href = findH5.path
          return
        }
        return
      }
      // app应用跳转
      await cubeAppService.openQrcodeBusiness(JSON.stringify(item))
    }
    const appListDom = (): VNode =>
      <div class='link'>
        <div>业务管理</div>
        <div class='link-item'>
          {thirdLinkList.value.map((item, index) =>
            <div
              class='item'
              key={index}
              onClick={() => {
                handleClick(item)
              }}
            >
              {item.icon ? <img src={new URL(item.icon, import.meta.url).href} width='40' /> : null}
              {item.applicationName}<Icon name='arrow' />
            </div>)
          }
        </div>
      </div>
    return (): VNode =>
      <div class='wrapper'>
        <Card cardData={cardData.value} entityObject={entityObject.value} />
        {
          !authStore.token
            ? <div class='login'> <Button type='primary' block onClick={() => {
              router.push('/login')
            }}>登录</Button></div>
            : appListDom()
        }
      </div>
  }
})
