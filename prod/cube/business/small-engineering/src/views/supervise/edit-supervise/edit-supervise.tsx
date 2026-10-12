import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { Layout } from '@ghcloud/generic-component'
import { Tabs, TabPane, Button, Space, message, AntModal } from '@ghcloud/cube-ui'
import { BasicInfo } from './basic-info/basic-info'
import { PatrolRecords } from './patrol-records/patrol-records'
import { RectifyRecords } from './rectify-records/rectify-records'
import { useRoute } from 'vue-router'
import { Accept, scheduledetail, schedulefeedback } from '@/api/supervise'
import type { SuperviseDetailVo } from '@/api/type'
import type { AcceptType, ScheduleType } from '@/api/supervise'
import FeedBackModel from '../components/feedback-model'
import CheckModal from '../components/check-accept-model'
export const EditSupervise = defineComponent({
  setup: () => {
    const route = useRoute()
    const basicInfo = ref<{ submit: () => Promise<void>;getProgressList: () => Promise<void>; }>()
    const state = reactive<{
      activeKey: string;
      feedbackVisible: boolean;
      checkVisible: boolean;
      feedbackLoading: boolean;
      checkLoading: boolean;
      details: SuperviseDetailVo;
      submitLoading: boolean;
    }>({
      activeKey: '1',
      feedbackVisible: false,
      checkVisible: false,
      checkLoading: false,
      submitLoading: false,
      feedbackLoading: false,
      details: {
        id: '',
        projectName: '',
        status: '',
        schedule: 0,
        statusCode: '',
        duration: '',
        superviseDepId: '',
        superviseDepList: [],
        constructB: '',
        partyB: '',
        depName: '',
        superviseUser: [],
        safetyDockUser: [],
        completionTime: '',
        checkAcceptResult: '',
        checkAcceptRemark: '',
        checkFiles: [],
        projectType: '',
        projectTypeName: '',
        constructionSite: '',
        superviseDep: '',
        superviseUsers: '',
        remarks: '',
        projectFiles: [],
        typeId: '',
        safetyDockUserId: ''
      }
    })
    const isInfo = computed(() => !!(route.query.id && !route.query.edit))
    const title = computed(() => {
      if (route.query.edit) {
        return '编辑'
      }
      if (route.query.id) {
        return '详情'
      }
      return '新建'
    })
    const id = computed(() => route.query.id as string ?? '')
    const getDetails = async (): Promise<void> => {
      if (!route.query.id) return
      message.loading('加载中...')
      const result = await scheduledetail(id.value)
      state.details = result.data
      message.destroy()
    }
    const handleSubmit = async (): Promise<void> => {
      try {
        state.submitLoading = true
        await basicInfo.value?.submit()
      } finally {
        state.submitLoading = false
      }
    }
    const modalInfoState = computed(() => {
      return {
        scheduleId: state.details.id,
        schedule: state.details.schedule
      }
    })
    const handleCheckOk = async (formState: AcceptType): Promise<void> => {
      try {
        state.checkLoading = true
        await Accept(formState)
        getDetails()
        basicInfo.value?.getProgressList()
        state.checkVisible = false
      } finally {
        state.checkLoading = false
      }
    }
    const handleFeedbackOk = async (formState: ScheduleType): Promise<void> => {
      if (formState.schedule === 100) {
        AntModal.confirm({
          title: '提示',
          content: '是否确认完成',
          onOk: async () => {
            try {
              state.feedbackLoading = true
              await schedulefeedback(formState)
              getDetails()
              basicInfo.value?.getProgressList()
              state.feedbackVisible = false
            } finally {
              state.feedbackLoading = false
            }
          }
        })
        return
      }
      try {
        state.feedbackLoading = true
        await schedulefeedback(formState)
        getDetails()
        basicInfo.value?.getProgressList()
        state.feedbackVisible = false
      } finally {
        state.feedbackLoading = false
      }
    }

    onMounted(() => {
      getDetails()
    })
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <Tabs v-model:activeKey={state.activeKey}>
            <TabPane tab='工程信息' key='1'>
              <BasicInfo id={id.value} details={state.details} info={isInfo.value} ref={basicInfo} />
            </TabPane>
            {isInfo.value &&
              <TabPane tab='巡查记录' key='2'>
                <PatrolRecords />
              </TabPane>}
            {
              isInfo.value &&
              <TabPane tab='整改记录' key='3'>
                <RectifyRecords />
              </TabPane>
            }
          </Tabs>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <Space>
            <Button onClick={() => {
              history.back()
            }}
            >返回
            </Button>
            {!isInfo.value && <Button type='primary' loading={state.submitLoading} onClick={handleSubmit}>{route.query.edit ? '保存' : '提交'}</Button>}
            {state.details.status === '进行中' &&
              <Button
                type='primary' onClick={() => {
                  state.feedbackVisible = true
                }}
              >反馈
              </Button>}
            {state.details.status === '待验收' &&
              <Button
                type='primary' onClick={() => {
                  state.checkVisible = true
                }}
              >验收
              </Button>}
          </Space>
        )
      }
    }
    return (): JSX.Element => (
      <Layout title={`工程${title.value}`} v-slots={layoutSlots}>
        <FeedBackModel loading={state.feedbackLoading} onOk={handleFeedbackOk} v-model:visible={state.feedbackVisible} feedbackInfo={modalInfoState.value} />
        <CheckModal onOk={handleCheckOk} v-model:visible={state.checkVisible} checkInfo={modalInfoState.value} />
      </Layout>
    )
  }
})
