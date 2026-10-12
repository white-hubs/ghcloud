
import { Button, Step, Steps, Tab, Tabs } from 'vant'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import styles from './project-down-turn.module.less'
import { cubeSmallEngineeringService } from '@/api/server'
import dayjs from 'dayjs'
import type { ProjectScheduleDetail, ProjectScheduleTrackDownList } from '@ghcloud/cube-small-engineering-service/src/small-engineering.service'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'

export const FeedbackDetails = defineComponent({
  name: 'FeedbackDetails',
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const active = ref('1')
    const id = (route.query as { id: string; }).id
    const engineeringInfo = reactive({
      completionTime: ''
    })
    const scheduleDetail = ref<ProjectScheduleDetail>({
      id: '',
      projectName: '',
      status: '',
      statusCode: '',
      partyB: '',
      depName: '',
      username: '',
      userId: '',
      schedule: 0,
      scheduleRemark: '',
      hasProblem: false,
      scheduleFiles: [],
      checkAcceptResult: '',
      checkAcceptRemark: '',
      checkFiles: [],
      completionTime: 0,
      remarks: '',
      superviseDepId: '',
      constructionSite: '',
      superviseDepName: '',
      duration: '',
      projectType: '',
      superviseUser: []
    })
    const trackDownList = ref<ProjectScheduleTrackDownList[]>([])
    const feedbackSubmit = (): void => {
      router.push({
        name: 'feedback',
        query: {
          id
        }
      })
    }
    const getProjectCheckAndAccept = (): void => {
      router.push({
        name: 'checkAndAccept',
        query: {
          id
        }
      })
    }
    const getProjectDetail = async (): Promise<void> => {
      scheduleDetail.value = await cubeSmallEngineeringService.projectScheduleDetail(id)
      trackDownList.value = await cubeSmallEngineeringService.projectScheduleTrackDownList(id)
    }
    onMounted(() => {
      getProjectDetail()
    })
    return (): JSX.Element =>
      <>
        <div>
          <CubeNavBar title='工程监管详情' showBack />
          <Tabs v-modal:active={active.value} swipeable>
            <Tab
              title='工程信息'
              value='1'
            >
              <div class={`${styles['engineering-info']}`}>
                <div class={styles['engineering-info-item']}>
                  <div class={styles['engineering-info-item-title']}>基本信息</div>
                  <div class={styles['engineering-info-item-content']}>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>工程名称：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.projectName}</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>合同乙方：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.partyB || '--'}</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>完成时间：</span>
                      <span class={styles['list-page-item-value']}>{engineeringInfo.completionTime ? dayjs(engineeringInfo.completionTime).format('YYYY-MM-DD') : '--'}</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>监管部门：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.depName || '--'}</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>监管人员：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.username || '--'}</span>
                    </div>
                  </div>
                </div>
                <div class={`${styles['engineering-info-item']} ${styles['engineering-progress']}`}>
                  <div class={styles['engineering-info-item-title']}>当前工程进度</div>
                  <div class={styles['engineering-info-item-content']}>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>是否存在问题：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.hasProblem ? '是' : '否'}</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>完成进度：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.schedule}%</span>
                    </div>
                    <div class={styles['list-page-item-row']}>
                      <span class={styles['list-page-item-label']}>进度描述：</span>
                      <span class={styles['list-page-item-value']}>{scheduleDetail.value.scheduleRemark || '暂无描述'}</span>
                    </div>
                  </div>
                </div>
                {
                  scheduleDetail.value.checkAcceptResult &&
                    <div class={`${styles['engineering-info-item']} ${styles['acceptance-work']}`}>
                      <div class={styles['engineering-info-item-title']}>当前工程验收</div>
                      <div class={styles['engineering-info-item-content']}>
                        <div class={styles['list-page-item-row']}>
                          <span class={styles['list-page-item-label']}>验收结果：</span>
                          <span class={styles['list-page-item-value']}>{scheduleDetail.value.hasProblem ? '是' : '否'}</span>
                        </div>
                        <div class={styles['list-page-item-row']}>
                          <span class={styles['list-page-item-label']}>进度描述：</span>
                          <span class={styles['list-page-item-value']}>{scheduleDetail.value.scheduleRemark || '暂无描述'}</span>
                        </div>
                      </div>
                    </div>
                }
              </div>
            </Tab>
            <Tab
              title='监管记录'
              value='2'
            >
              <div class={styles['engineering-info']}>
                <Steps active='-1' inactive-color='#3D8AF2' direction='vertical' active-icon='success' active-color='#3D8AF2'>
                  {
                    trackDownList.value.map(e => {
                      return (
                        <Step key={e.id}>
                          <div class={styles['step-box']}>
                            <div class={styles['step-title']}>反馈</div>
                            <div class={styles['step-content']}>
                              <div class={styles['step-content-item']}>
                                <span>{e.username}</span>
                                <span class={styles.department}>{e.depName}</span>
                              </div>
                              <div class={styles['step-content-item']}>
                                <span>时间：</span>
                                <span>{dayjs(e.recordTime).format('YYYY-MM-DD HH:mm:ss')}</span>
                              </div>
                              <div class={styles['step-content-item']}>
                                <span>内容：</span>
                                <span class={styles['engineering-progress']}>{e.feedbackContent || e.checkAcceptContent}</span>
                              </div>
                            </div>
                          </div>
                        </Step>
                      )
                    })
                  }

                </Steps>
              </div>
            </Tab>
          </Tabs>
          <div class={styles['feedback-btn']} v-show={route.query.statusCode !== 'COMPLETED'}>
            <div class={styles['feedback-btn-line']}>
              {
                route.query.statusCode === 'UNDERWAY' &&
                  <Button block type='primary' native-type='submit' onClick={feedbackSubmit}>
                    反馈
                  </Button>
              }
              {
                route.query.statusCode === 'WAIT_ACCEPT' &&
                  <Button block type='primary' native-type='submit' onClick={getProjectCheckAndAccept}>
                    验收
                  </Button>
              }
            </div>
          </div>
        </div>
      </>
  }
})
