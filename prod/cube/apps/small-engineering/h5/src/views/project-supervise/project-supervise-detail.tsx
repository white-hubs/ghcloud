import { defineComponent, onMounted, ref } from 'vue'
import { Button, Tab, Tabs } from 'vant'
import './project-supervise-detail.less'
import { TabInfo } from './components/tab-business/tab-info'
import { TabPatrol } from './components/tab-patrol/tab-patrol'
import { TabCorrection } from './components/tab-correction/tab-correction'
import { useRoute, useRouter } from 'vue-router'
import { cubeSmallEngineeringService } from '@/api/server'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const ProjectSuperviseDetail = defineComponent({
  setup () {
    const { id } = useRoute().query as { id: string; }
    const router = useRouter()
    const tabActive = ref(0)
    onMounted(() => {
      document.title = '工程监管详情'
    })
    const feedbackEvent = (): void => {
      router.push({ path: '/feedback', query: { id } })
    }
    const check = (): void => {
      router.push({ path: '/checkAndAccept', query: { id } })
    }
    const statusCode = ref('')
    const getBaseInfo = async (): Promise<void> => {
      try {
        const res = await cubeSmallEngineeringService.projectScheduleDetail(id)
        statusCode.value = res?.statusCode
      } catch {
      }
    }
    onMounted(() => {
      getBaseInfo()
    })
    return (): JSX.Element =>
      <div class='detail-wrap'>
        <CubeNavBar title='工程详情' showBack />
        <Tabs v-model:active={tabActive.value} sticky swipeable>
          <Tab key='0' title='工程信息'>
            <TabInfo />
          </Tab>
          <Tab key='1' title='巡查记录'>
            <TabPatrol />
          </Tab>
          <Tab key='2' title='整改记录'>
            <TabCorrection />
          </Tab>
        </Tabs>
        <div class='detail-footer'>
          <div class='wrap'>
            {
              statusCode.value === 'UNDERWAY' && <Button class='btn' size='small' onClick={() => {
                feedbackEvent()
              }}>反馈</Button>
            }
            {
              statusCode.value === 'WAIT_ACCEPT' && <Button class='btn' size='small' type='primary' onClick={() => {
                check()
              }}>验收</Button>
            }
          </div>
        </div>
      </div>
  }
})
