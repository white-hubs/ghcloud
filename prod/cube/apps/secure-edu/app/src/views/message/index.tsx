

// import { defineComponent } from 'vue'

// export const TrainingTask = defineComponent({
//   setup: () => {
//     return () => <div>培训任务</div>
//   }
// })

import { addsatmsgconfig, satmsgconfig, satmsgconfigs } from '@/api/message'
import { Layout } from '@/components/layout/layout'
import { Button, Checkbox, TabPane, Tabs, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
// import {  } from '@ghcloud/cube-ui'
export const Message = defineComponent({

  setup: () => {
    const activeKey = ref('1')
    const tabchange = (): void => {
      activeKey.value = activeKey.value === '1' ? '2' : '1'
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs activeKey={activeKey.value} onTabChange={tabchange} type='card'>
              <TabPane tab='培训' key='1'>
                {
                  trainmessage.value.map((res, index) => {
                    return (
                      <div key={index}>
                        <div class='text-18px'>{res.title}</div>
                        <div class='p-30px pt-10px'>
                          <div>
                            <div class='flex'>
                              <div>通知条件: <span class='ml-10px'>培训任务下发即提醒</span> </div>
                            </div>
                            <div class='flex mt-15px'>
                              <div> 通知方式:</div>
                              {res.options.map(item => {
                                return (
                                  <div key={item.value} class='ml-15px'> <Checkbox v-model:checked={item.disable}>{item.label}</Checkbox></div>
                                )
                              })}
                            </div>
                          </div>
                          <div class='mt-15px'>
                            通知内容：<span class='ml-5px'>{res.content}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }

              </TabPane>
              <TabPane tab='考试' key='2'>
                {
                  exammessage.value.map((res, index) => {
                    return (
                      <div key={index}>
                        <div class='text-18px'>{res.title}</div>
                        <div class='p-30px pt-10px'>
                          <div>
                            <div class='flex'>
                              <div>通知条件:<span class='ml-10px'>考试任务下发即提醒</span> </div>
                            </div>
                            <div class='flex mt-15px'>
                              <div> 通知方式:</div>
                              {res.options.map(item => {
                                return (
                                  <div key={item.value}> <Checkbox class='ml-15px' v-model:checked={item.disable}>{item.label}</Checkbox></div>
                                )
                              })}
                            </div>
                          </div>
                          <div class='mt-15px'>
                            通知内容：<span class='ml-5px'>{res.content}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }

              </TabPane>
            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' onClick={() => {
              save()
            }}>保存</Button>
          </>
        )
      }
    }
    const exammessage = ref<{
      title: string;
      notifyExpression: string;
      options: {
        label: string;
        value: string;
        disable: boolean;
      }[];
      content: string;
      msgTmpContent: string;
      satMsgDefineCode: string;
      effectiveDays?: number;
      enabled?: boolean;
      id?: string;
      msgTmpId?: string;
    }[]>([
      {
        title: '通知参加考试的人员',
        notifyExpression: 'EXAM_TASK_USERS',
        options: [
          { label: '短信', value: 'CHANNEL_SMS', disable: false },
          { label: 'PC站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'APP站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'app推送', value: 'CHANNEL_APP', disable: false },
          // { label: '语音通知', value: 'CHANNEL_VOICE', disable: false }
        ],
        content: '您有一条来源于安全教育的消息，【考试主题 】将在 【考试开始时间】 进行，请合理安排您的时间及时参加考试',
        msgTmpContent: '您有一条来源于安全教育的消息，${examTaskName}将在${examStartTime}进行，请合理安排您的时间及时参加考试',
        satMsgDefineCode: 'EXAM_TASK_PUBLISHED',

      },
      {
        title: '考试负责人',
        notifyExpression: 'EXAM_CHARGE_USER',
        options: [
          { label: '短信', value: 'CHANNEL_SMS', disable: false },
          { label: 'PC站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'APP站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'app推送', value: 'CHANNEL_APP', disable: false },
          // { label: '语音通知', value: 'CHANNEL_VOICE', disable: false }
        ],
        content: '您有一条来源于安全教育的消息，您负责 【考试主题】 将在 【考试开始时间】 进行，请及时协调人员参加',
        msgTmpContent: '您有一条来源于安全教育的消息，您负责${examTaskName}将在${examStartTime}进行，请及时协调人员参加',
        satMsgDefineCode: 'EXAM_TASK_PUBLISHED',
      },
    ])
    const trainmessage = ref<{
      title: string;
      notifyExpression: string;
      options: {
        label: string;
        value: string;
        disable: boolean;
      }[];
      content: string;
      msgTmpContent: string;
      satMsgDefineCode: string;
      effectiveDays?: number;
      enabled?: boolean;
      id?: string;
      msgTmpId?: string;
    }[]>([
      {
        title: '通知参加培训的人员',
        notifyExpression: 'CULTIVATE_TASK_USERS',
        options: [
          { label: '短信', value: 'CHANNEL_SMS', disable: false },
          { label: 'PC站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'APP站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'app推送', value: 'CHANNEL_APP', disable: false },
          // { label: '语音通知', value: 'CHANNEL_VOICE', disable: false }
        ],
        content: '您有一条来源于安全教育的消息， 【培训主题】 将在 【培训开始时间】 进行，请合理安排您的时间及时参加培训',
        msgTmpContent: '您有一条来源于安全教育的消息，${cultivateTaskName}将在${cultivateStartTime}进行，请合理安排您的时间及时参加培训',
        satMsgDefineCode: 'CULTIVATE_TASK_PUBLISHED',
      },
      {
        title: '培训负责人',
        notifyExpression: 'CULTIVATE_CHARGE_USERS',
        options: [
          { label: '短信', value: 'CHANNEL_SMS', disable: false },
          { label: 'PC站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'APP站内', value: 'CHANNEL_SITE', disable: false },
          { label: 'app推送', value: 'CHANNEL_APP', disable: false },
          // { label: '语音通知', value: 'CHANNEL_VOICE', disable: false }
        ],
        content: '您有一条来源于安全教育的消息，您负责 【培训主题】 将在 【培训开始时间】 进行，请及时协调人员参加',
        msgTmpContent: '您有一条来源于安全教育的消息，您负责${cultivateTaskName}将在${cultivateStartTime}进行，请及时协调人员参加',
        satMsgDefineCode: 'CULTIVATE_TASK_PUBLISHED',
      },
    ])
    const loading = ref(false)
    const save = (): void => {
      loading.value = true
      const trainmessageData = trainmessage.value.map(res => {
        return {
          msgTmpContent: res.msgTmpContent,
          satMsgChannelConfigModifyParams: res.options.filter(op => op.disable).map(item => {
            return {
              channelType: item.value,
              terminal: item.label === 'PC站内' ? 'bimops-manage-web' : 'bimops-manage-app',
              terminalName: item.label === 'PC站内' ? '常德高铁站web' : '常德高铁站app',
            }
          }),
          effectiveDays: res.effectiveDays,
          enabled: res.enabled,
          id: res.id,
          msgTmpId: res.msgTmpId,
          satMsgDefineCode: res.satMsgDefineCode,
          notifyExpression: res.notifyExpression

        }
      })
      const exammessageData = exammessage.value.map(res => {
        return {
          msgTmpContent: res.msgTmpContent,
          satMsgChannelConfigModifyParams: res.options.filter(op => op.disable).map(item => {
            return {
              channelType: item.value,
              terminal: item.label === 'PC站内' ? 'bimops-manage-web' : 'bimops-manage-app',
              terminalName: item.label === 'PC站内' ? '常德高铁站web' : '常德高铁站app',
            }
          }),
          effectiveDays: res.effectiveDays,
          enabled: res.enabled,
          id: res.id,
          msgTmpId: res.msgTmpId,
          satMsgDefineCode: res.satMsgDefineCode,
          notifyExpression: res.notifyExpression

        }
      })

      if (satmsgconfigslist.value.length === 0) {
        addsatmsgconfig({
          params: [...trainmessageData, ...exammessageData]
        }).then(() => {
          loading.value = false
          getData()
        }).catch(() => {
          loading.value = false
        })
      } else {
        satmsgconfig({
          params: [...trainmessageData, ...exammessageData]
        }).then(() => {
          loading.value = false
          getData()
        }).catch(() => {
          loading.value = false
        })
      }
      message.success('保存成功')
    }

    const satmsgconfigslist = ref([])
    const getData = (): void => {
      satmsgconfigs({
        satMsgDefineCodes: 'EXAM_TASK_PUBLISHED ,CULTIVATE_TASK_PUBLISHED'
      }).then(res => {
        const { data } = res
        satmsgconfigslist.value = data as never[]

        const train = satmsgconfigslist.value.filter((trainres: { satMsgDefineCode: string; }) => trainres.satMsgDefineCode === 'CULTIVATE_TASK_PUBLISHED')
        const exam = satmsgconfigslist.value.filter((trainres: { satMsgDefineCode: string; }) => {
          return trainres.satMsgDefineCode === 'EXAM_TASK_PUBLISHED'
        })

        if (exam.length > 0) {
          exammessage.value = exam.map((tramess: {
            effectiveDays: number;
            enabled: boolean;
            id: string;
            msgTmpContent: string;
            msgTmpId: string;
            notifyExpression: string;
            satMsgChannelConfigVOS: { channelType: string;terminal: string; }[];
            satMsgDefineCode: string;

          }) => {
            return {
              effectiveDays: tramess.effectiveDays,
              enabled: tramess.enabled,
              id: tramess.id,
              msgTmpContent: tramess.msgTmpContent,
              msgTmpId: tramess.msgTmpId,
              notifyExpression: tramess.notifyExpression,
              satMsgDefineCode: tramess.satMsgDefineCode,
              title: tramess.notifyExpression === 'EXAM_TASK_USERS' ? '通知参加考试的人员' : '考试负责人',
              options: [
                { label: '短信', value: 'CHANNEL_SMS', disable: setdisable('CHANNEL_SMS', tramess.satMsgChannelConfigVOS) },
                { label: 'PC站内', value: 'CHANNEL_SITE', disable: setdisablezl('CHANNEL_SITEbimops-manage-web', tramess.satMsgChannelConfigVOS) },
                { label: 'APP站内', value: 'CHANNEL_SITE', disable: setdisablezl('CHANNEL_SITEbimops-manage-app', tramess.satMsgChannelConfigVOS) },
                { label: 'app推送', value: 'CHANNEL_APP', disable: setdisable('CHANNEL_APP', tramess.satMsgChannelConfigVOS) },

                // { label: '语音通知', value: 'CHANNEL_VOICE', disable: setdisable('CHANNEL_VOICE', tramess.satMsgChannelConfigVOS) }
              ],
              content: tramess.notifyExpression === 'EXAM_TASK_USERS' ? '您有一条来源于安全教育的消息，【考试主题】 将在 【考试开始时间】 进行，请合理安排您的时间及时参加考试' : '您有一条来源于安全教育的消息，您负责 【考试主题】 将在 【考试开始时间】 进行，请及时协调人员参加'

            }
          })
        }
        if (train.length > 0) {
          trainmessage.value = train.map((tramess: {
            effectiveDays: number;
            enabled: boolean;
            id: string;
            msgTmpContent: string;
            msgTmpId: string;
            notifyExpression: string;
            satMsgChannelConfigVOS: { channelType: string;terminal: string; }[];
            satMsgDefineCode: string;

          }) => {
            return {
              effectiveDays: tramess.effectiveDays,
              enabled: tramess.enabled,
              id: tramess.id,
              msgTmpContent: tramess.msgTmpContent,
              msgTmpId: tramess.msgTmpId,
              notifyExpression: tramess.notifyExpression,
              satMsgDefineCode: tramess.satMsgDefineCode,
              title: tramess.notifyExpression === 'CULTIVATE_TASK_USERS' ? '通知参加培训的人员' : '培训负责人',
              options: [
                { label: '短信', value: 'CHANNEL_SMS', disable: setdisable('CHANNEL_SMS', tramess.satMsgChannelConfigVOS) },
                { label: 'PC站内', value: 'CHANNEL_SITE', disable: setdisablezl('CHANNEL_SITEbimops-manage-web', tramess.satMsgChannelConfigVOS) },
                { label: 'APP站内', value: 'CHANNEL_SITE', disable: setdisablezl('CHANNEL_SITEbimops-manage-app', tramess.satMsgChannelConfigVOS) },
                { label: 'app推送', value: 'CHANNEL_APP', disable: setdisable('CHANNEL_APP', tramess.satMsgChannelConfigVOS) },
                // { label: '语音通知', value: 'CHANNEL_VOICE', disable: setdisable('CHANNEL_VOICE', tramess.satMsgChannelConfigVOS) }
              ],
              content: tramess.notifyExpression === 'CULTIVATE_TASK_USERS' ? '您有一条来源于安全教育的消息，【培训主题】 将在 【培训开始时间】 进行，请合理安排您的时间及时参加培训' : '您有一条来源于安全教育的消息，您负责 【培训主题】 将在 【培训开始时间】 进行，请及时协调人员参加'

            }
          })
        }
      })
    }
    const setdisable = (value: string, arr: { channelType: string; }[]): boolean => {
      const ishave = arr.findIndex(res => res.channelType === value)
      return ishave !== -1
    }
    const setdisablezl = (value: string, arr: { channelType: string;terminal: string; }[]): boolean => {
      const ishave = arr.findIndex(res => {
        return res.channelType + res.terminal === value
      })
      return ishave !== -1
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <Layout title='消息通知' v-slots={layoutSlots} />
      </>
  }
})
