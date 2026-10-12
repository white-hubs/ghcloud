import { Button, CheckboxGroup, FormItem, InputNumber, TabPane, Tabs, message, Form, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, type Ref } from 'vue'
import { CubeLayout, InspectTypeAndUser, type InspectTypeAndUserItem } from '@ghcloud/cube-app-design'
import { cubeMessageCenterService } from '@/api/server'
import { addNewMessage, getNewMessage } from '@/api/message'
import { usePageName } from '@ghcloud/cube-utils'
import './message-config.less'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'

interface NoticeObjs {
  label: string;
  value: string;
}

const inspectionTaskNotify = 'TASK_GENERATE'
const taskFailureNotify = 'TASK_LAPSE'
const taskFailureIncompleteNotify = 'TASK_LAPSE_UNFINISHED'
const taskRecordErrorNotify = 'TASK_RECORD_ERROR'
const codeForLabel = {
  TASK_GENERATE: '巡查任务',
  TASK_LAPSE: '任务即将失效',
  TASK_LAPSE_UNFINISHED: '任务失效未完成',
  TASK_RECORD_ERROR: '任务异常',
}
export const MessageConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref(inspectionTaskNotify)
    const inspectionTaskClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: codeForLabel[inspectionTaskNotify],
      sceneCode: inspectionTaskNotify
    })
    const taskFailureClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
      value: number;
    }>({
      value: 0,
      noticeWays: [],
      label: codeForLabel[taskFailureNotify],
      sceneCode: taskFailureNotify
    })
    const taskFailureIncompleteClock = ref<{
      noticeWays: string[] | undefined;
      noticeItems: InspectTypeAndUserItem[];
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      noticeItems: [],
      label: codeForLabel[taskFailureIncompleteNotify],
      sceneCode: taskFailureIncompleteNotify
    })
    const taskRecordErrorClock = ref<{
      noticeWays: string[] | undefined;
      noticeItems: InspectTypeAndUserItem[];
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      noticeItems: [],
      label: codeForLabel[taskRecordErrorNotify],
      sceneCode: taskRecordErrorNotify
    })

    const inspectionTaskRenderRef = ref<FormExpose>()
    const inspectionTaskRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
    }
    const taskFailureRenderRef = ref<FormExpose>()
    const taskFailureRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
    }
    const taskFailureIncompleteRenderRef = ref<FormExpose>()
    const inspectTypeAndUserRef = ref<{ checkFormData: () => Promise<unknown>; isValid: Ref<boolean>; }>()
    const taskFailureIncompleteRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
      noticeItems: [{ validator: async (): Promise<unknown> => inspectTypeAndUserRef.value?.checkFormData(), trigger: 'blur' }]
    }
    const taskRecordErrorRenderRef = ref<FormExpose>()
    const inspectTypeAndUserRecordErrorRef = ref<{ checkFormData: () => Promise<unknown>; isValid: Ref<boolean>; }>()
    const taskRecordErrorRenderRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
      noticeItems: [{ validator: async (): Promise<unknown> => inspectTypeAndUserRecordErrorRef.value?.checkFormData(), trigger: 'blur' }]
    }

    const tabchange = (value: string): void => {
      activeKey.value = value
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class='message-config'>
            <Tabs activeKey={activeKey.value} onTabChange={tabchange} type='card'>
              <TabPane tab='巡查任务' key={inspectionTaskNotify}>
                <Form model={inspectionTaskClock.value} ref={inspectionTaskRenderRef} rules={inspectionTaskRules}>
                  <FormItem label='通知条件:'>任务下发即提醒</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.inspectionTaskClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={inspectionTaskClock.value.noticeWays} options={noticeObjs.value.inspectionTaskClock} />}
                      {!noticeObjs.value.inspectionTaskClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>【巡查任务名称】巡查任务已建立，请及时关注该任务</FormItem>
                </Form>
              </TabPane>
              <TabPane tab='任务即将失效' key={taskFailureNotify}>
                <Form model={taskFailureClock.value} ref={taskFailureRenderRef} rules={taskFailureRules}>
                  <FormItem label='通知条件:'>距离任务失效时间还有 <InputNumber class='input-number-width' max={99999} min={0} v-model:value={taskFailureClock.value.value} /> 分钟提醒</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.taskFailureClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={taskFailureClock.value.noticeWays} options={noticeObjs.value.taskFailureClock} />}
                      {!noticeObjs.value.taskFailureClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>您负责的【巡检任务名称】巡检任务，任务将在【配置的通知条件（例：30分钟）】后失效，请及时接收任务进行巡检</FormItem>
                </Form>
              </TabPane>
              <TabPane tab='任务失效未完成' key={taskFailureIncompleteNotify}>
                <Form model={taskFailureIncompleteClock.value} ref={taskFailureIncompleteRenderRef} rules={taskFailureIncompleteRules}>
                  <FormItem label='通知条件:'>巡检任务且没有完成即通知</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.taskFailureIncompleteClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={taskFailureIncompleteClock.value.noticeWays} options={noticeObjs.value.taskFailureIncompleteClock} />}
                      {!noticeObjs.value.taskFailureIncompleteClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='通知内容:'>由【巡检任务责任人】负责的【巡检任务名称】没有完成且当前已经失效，请知悉</FormItem>
                  <FormItem label='通知人员:' name='noticeItems'>
                    <InspectTypeAndUser businessType={InspectBusinessType.SMALL_ENGINEERING} ref={inspectTypeAndUserRef} v-model:value={taskFailureIncompleteClock.value.noticeItems} />
                  </FormItem>
                </Form>
              </TabPane>
              <TabPane tab='任务异常' key={taskRecordErrorNotify}>
                <Form model={taskRecordErrorClock.value} ref={taskRecordErrorRenderRef} rules={taskRecordErrorRenderRules}>
                  <FormItem label='通知条件:'>任务异常通知</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.taskRecordErrorClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={taskRecordErrorClock.value.noticeWays} options={noticeObjs.value.taskRecordErrorClock} />}
                      {!noticeObjs.value.taskRecordErrorClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='通知内容:'>由【巡检任务责任人】负责的【巡检任务名称】没有完成且当前已经失效，请知悉</FormItem>
                  <FormItem label='通知人员:' name='noticeItems'>
                    <InspectTypeAndUser businessType={InspectBusinessType.SMALL_ENGINEERING} ref={inspectTypeAndUserRecordErrorRef} v-model:value={taskRecordErrorClock.value.noticeItems} />
                  </FormItem>
                </Form>
              </TabPane>
            </Tabs>
          </div>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' loading={loading.value} onClick={() => {
              save()
            }}>保存</Button>
          </>
        )
      }
    }

    const loading = ref(false)
    const getNoticeOption = async (code: string): Promise<{
      label: string;
      value: string;
    }[]> => {
      return cubeMessageCenterService.sceneNotificationMethod(code)
    }
    const noticeObjs = ref<{
      inspectionTaskClock: NoticeObjs[];
      taskFailureClock: NoticeObjs[];
      taskFailureIncompleteClock: NoticeObjs[];
      taskRecordErrorClock: NoticeObjs[];
    }>({
      inspectionTaskClock: [],
      taskFailureClock: [],
      taskFailureIncompleteClock: [],
      taskRecordErrorClock: []
    })
    const save = async (): Promise<void> => {
      try {
        await inspectionTaskRenderRef.value?.validate()
      } catch {
        activeKey.value = inspectionTaskNotify
        return
      }
      try {
        await taskFailureRenderRef.value?.validate()
      } catch {
        activeKey.value = taskFailureNotify
        return
      }
      try {
        await taskFailureIncompleteRenderRef.value?.validate()
      } catch {
        activeKey.value = taskFailureIncompleteNotify
        return
      }
      try {
        await taskRecordErrorRenderRef.value?.validate()
      } catch {
        activeKey.value = taskRecordErrorNotify
        return
      }

      loading.value = true
      const inspectionTaskWay = inspectionTaskClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskFailureWay = taskFailureClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskFailureIncompleteClockWay = taskFailureIncompleteClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskRecordErrorWay = taskRecordErrorClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskFailureIncompleteClockObj = taskFailureIncompleteClock.value?.noticeItems?.map(item => {
        return {
          objId: item.key,
          objType: item.inspectionType,
          objInfo: JSON.stringify(item.inspectionUsers)
        }
      })
      const taskRecordErrorObj = taskRecordErrorClock.value?.noticeItems?.map(item => {
        return {
          objId: item.key,
          objType: item.inspectionType,
          objInfo: JSON.stringify(item.inspectionUsers)
        }
      })
      await addNewMessage({
        businessType: InspectBusinessType.SMALL_ENGINEERING,
        sceneConfigDTOS: [
          {
            ...inspectionTaskClock.value,
            noticeWays: inspectionTaskWay
          },
          {
            ...taskFailureClock.value,
            noticeWays: taskFailureWay
          },
          {
            ...taskFailureIncompleteClock.value,
            noticeWays: taskFailureIncompleteClockWay,
            noticeObjs: taskFailureIncompleteClockObj,
          },
          {
            ...taskRecordErrorClock.value,
            noticeWays: taskRecordErrorWay,
            noticeObjs: taskRecordErrorObj,
          }
        ]
      })
      loading.value = false
      getData()
      message.success('保存成功')
    }

    const getInspectionTaskClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: InspectBusinessType.SMALL_ENGINEERING,
        label: codeForLabel[inspectionTaskNotify]
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      inspectionTaskClock.value.noticeWays = noticeWays
      inspectionTaskClock.value.label = data[0].label
      inspectionTaskClock.value.sceneCode = data[0].sceneCode
    }
    const getTaskFailureClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: InspectBusinessType.SMALL_ENGINEERING,
        label: codeForLabel[taskFailureNotify]
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      taskFailureClock.value.noticeWays = noticeWays
      taskFailureClock.value.label = data[0].label
      taskFailureClock.value.sceneCode = data[0].sceneCode
      taskFailureClock.value.value = data[0].value
    }
    const getTaskFailureIncompleteClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: InspectBusinessType.SMALL_ENGINEERING,
        label: codeForLabel[taskFailureIncompleteNotify]
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      const noticeItems: InspectTypeAndUserItem[] = data[0].noticeObjs?.map(e => {
        // 处理 JSON 字符串
        let users = []
        try {
          if (typeof e.objInfo === 'string') {
            users = JSON.parse(e.objInfo)
            // 确保解析后的结果是数组
            users = Array.isArray(users) ? users : [users]
          } else if (Array.isArray(e.objInfo)) {
            users = e.objInfo
          } else if (e.objInfo) {
            users = [e.objInfo]
          }
        } catch {
          users = []
        }
        return {
          key: e.objId ?? `${Date.now()}`,
          inspectionType: e.objType ?? '',
          inspectionUsers: users,
        }
      }) ?? []
      taskFailureIncompleteClock.value.noticeWays = noticeWays
      taskFailureIncompleteClock.value.label = data[0].label
      taskFailureIncompleteClock.value.sceneCode = data[0].sceneCode
      taskFailureIncompleteClock.value.noticeItems = noticeItems
    }
    const getTaskRecordErrorClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: InspectBusinessType.SMALL_ENGINEERING,
        label: codeForLabel[taskRecordErrorNotify]
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      const noticeItems: InspectTypeAndUserItem[] = data[0].noticeObjs?.map(e => {
        // 处理 JSON 字符串
        let users = []
        try {
          if (typeof e.objInfo === 'string') {
            users = JSON.parse(e.objInfo)
            // 确保解析后的结果是数组
            users = Array.isArray(users) ? users : [users]
          } else if (Array.isArray(e.objInfo)) {
            users = e.objInfo
          } else if (e.objInfo) {
            users = [e.objInfo]
          }
        } catch {
          users = []
        }
        return {
          key: e.objId ?? `${Date.now()}`,
          inspectionType: e.objType ?? '',
          inspectionUsers: users,
        }
      }) ?? []
      taskRecordErrorClock.value.noticeWays = noticeWays
      taskRecordErrorClock.value.label = data[0].label
      taskRecordErrorClock.value.sceneCode = data[0].sceneCode
      taskRecordErrorClock.value.noticeItems = noticeItems
    }

    const getData = async (): Promise<void> => {
      getInspectionTaskClock()
      getTaskFailureClock()
      getTaskFailureIncompleteClock()
      getTaskRecordErrorClock()
      noticeObjs.value.inspectionTaskClock = await getNoticeOption(inspectionTaskNotify)
      noticeObjs.value.taskFailureClock = await getNoticeOption(taskFailureNotify)
      noticeObjs.value.taskFailureIncompleteClock = await getNoticeOption(taskFailureIncompleteNotify)
      noticeObjs.value.taskRecordErrorClock = await getNoticeOption(taskRecordErrorNotify)
    }

    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <CubeLayout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
