import { defineComponent, onMounted, ref } from 'vue'
import { CellGroup, Cell, Tabs, Tab, Button, showNotify } from 'vant'
import './train-detail.less'
import { Information } from './information'
import { Trainers } from './trainers'
import { CourseWare } from './course-ware'
import { authStore } from '@/api/auth-store'
import { cubeOuaaService, cubeSecureEduPublicService, cubeSecureEduService } from '@/api/server'
import { useRoute, useRouter } from 'vue-router'
import { CultivateMode, CultivateTaskColor, CultivateTaskStatus, type TrainType } from '../type'
import dayjs from 'dayjs'
import { useMetaTitle } from '@/views/hooks/use-meta-title-hook'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { CubeAppBusinessBridge } from '@ghcloud/cube-app-js-sdk'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { TaskExam } from './task-exam'
/** 培训签到页面 */
export const TrainDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const trainDetail = ref<TrainType>({
      id: '',
      name: '',
      themeName: '',
      cultivateTarget: '',
      cultivateMode: '',
      cultivateModeName: '',
      userSignStatus: '',
      speaker: '',
      chargePersonName: '',
      cultivateEndTime: '',
      cultivateAddress: '',
      cultivateContent: '',
      cultivateUserNumber: '',
      cultivateTaskStatus: '',
      sourceCode: '',
      cultivateStartTime: '',
      cultivateTargetName: '',
      chargeUserName: '',
    })
    const userId = ref('')
    useMetaTitle()
    onMounted(async () => {
      const authenticated = Boolean(authStore.token)
      const res = authenticated
        ? await cubeSecureEduService.getCultivateTaskDetail({ id: route.query.id as string ?? '' })
        : await cubeSecureEduPublicService.getPublicCultivateTaskDetail({ id: route.query.id as string ?? '' })
      trainDetail.value = res as unknown as TrainType
      getUser()
    })
    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {}
    }
    const activeTab = ref('')
    const router = useRouter()
    // 打卡签到
    const signIn = async (): Promise<void> => {
      if (getEnvironment() === 'cubeApp' && trainDetail.value.cultivateMode === 'OFFLINE') {
        // cultivateMode为线下时进行扫码，否则直接进入
        try {
          const code = await CubeAppBusinessBridge.handleBusinessScanCode()
          const authenticated = Boolean(authStore.token)
          const res = authenticated
            ? await cubeSecureEduService.getCultivateTaskDetail({ id: code ?? '' })
            : await cubeSecureEduPublicService.getPublicCultivateTaskDetail({ id: code ?? '' })
          if (res.cultivateTarget === 'STAFF' && res.cultivateUsers?.find(x => x.userId === userId.value)) {
            router.push({ path: '/train-sign-in', query: { id: trainDetail.value.id } })
          } else {
            showNotify({ type: 'danger', message: '无效二维码' })
            return
          }
        } catch (error) {
          showNotify({ type: 'danger', message: (error as { errorMessage?: string })?.errorMessage || '无效二维码' })
          return
        }
      }
      router.push({ path: '/train-sign-in', query: { id: trainDetail.value.id } })
    }
    return (): JSX.Element =>
      <div>
        <CubeNavBar title='培训详情' showBack />
        <div style={{ background: '#f3f7fa', minHeight: '94vh', padding: '12px', position: 'relative' }}>
          <CellGroup class='train-detail-cell-group'>
            <Cell>
              <div class='train-cell-title'>
                <span>{trainDetail.value?.name}</span>
                <div class='status'>
                  <div style={{ color: CultivateTaskColor.get(trainDetail.value?.cultivateTaskStatus ?? '') }}>{CultivateTaskStatus.get(trainDetail.value?.cultivateTaskStatus ?? '')}</div>
                </div>
              </div>
            </Cell>
            <Cell class='train-cell'>
              <div>
                <label>培训形式：</label>
                <span>{CultivateMode.get(trainDetail.value?.cultivateMode)}</span>
              </div>
              <div>
                <label>主讲人：</label>
                <span>{trainDetail.value?.speaker || '--'}</span>
              </div>
              <div>
                <label>培训时间：</label>
                <span>{trainDetail.value?.cultivateStartTime ? dayjs(trainDetail.value?.cultivateStartTime).format('YYYY-MM-DD HH:mm') : '--'}</span>
              </div>
              <div>
                <label>培训地点：</label>
                <span>{trainDetail.value?.cultivateAddress}</span>
              </div>
            </Cell>
          </CellGroup>
          <Tabs v-model:active={activeTab.value} class='train-detail-tabs'>
            <Tab title='基础资料' name='information'>
              <Information detail={trainDetail.value} />
            </Tab>
            <Tab title='培训人员' name='trainers'>
              <Trainers users={trainDetail.value.cultivateUsers} total={Number(trainDetail.value.cultivateUserNumber)} />
            </Tab>
            <Tab title='课件' name='courseware'>
              <CourseWare course={trainDetail.value.cultivateCoursewares} />
            </Tab>
            {trainDetail.value.examTaskVO && <Tab title='关联考试' name='exam'>
              <TaskExam exam={trainDetail.value.examTaskVO} />
            </Tab>}
          </Tabs>
        </div>
        {
          (trainDetail.value.cultivateTaskStatus !== 'OVER' && trainDetail.value.userSignStatus !== 'SIGNED') &&
            <div class='operate'>
              <Button round block type='primary' native-type='submit' onClick={signIn}>
                打卡签到
              </Button>
            </div>
        }
      </div>
  }
})
