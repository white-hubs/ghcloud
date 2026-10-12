import { Button, CheckboxGroup, FormItem, InputNumber, message, TabPane, Tabs } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { cubeMessageCenterService, cubeBracingService } from '@/api/service'
import { Layout } from '@/components/layout/layout'
import { usePageName } from '@ghcloud/cube-utils'

//  任务创建通知
//  TASK_CREATE("DISINFECTION_TASK_CREATE"),
//  任务即将到期通知
//  TASK_LAPSE("DISINFECTION_TASK_LAPSE"),
//  任务到期未完成通知
//  TASK_LAPSE_UNFINISHED("DISINFECTION_TASK_LAPSE_UNFINISHED");
export const Message = defineComponent({

  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref('DISINFECTION_TASK_CREATE')
    const noticeWayScene = ref<Record<'taskCreate' | 'taskLapse' | 'taskLapseUnfinished', { label: string; value: string; }[]>>({
      taskCreate: [],
      taskLapse: [],
      taskLapseUnfinished: []
    })
    const tabChange = (value: string): void => {
      activeKey.value = value
    }
    const uuid = (): string => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    const taskCreateList = ref([{
      id: uuid(),
      label: 'DISINFECTION_TASK_CREATE',
      noticeObjs: [{
        objId: [],
        objType: '',
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'DISINFECTION_TASK_CREATE',
      value: 1,
      name: null
    }])
    const taskLapseList = ref([{
      id: uuid(),
      label: 'DISINFECTION_TASK_LAPSE',
      noticeObjs: [{
        objId: [],
        objType: '',
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'DISINFECTION_TASK_LAPSE',
      value: 1,
      name: null
    }])
    const taskLapseUnfinishedList = ref([{
      id: uuid(),
      label: 'DISINFECTION_TASK_LAPSE_UNFINISHED',
      noticeObjs: [{
        objId: [],
        objType: '',
        id: uuid()
      }],
      noticeWays: [],
      sceneCode: 'DISINFECTION_TASK_LAPSE_UNFINISHED',
      value: 1,
      name: null
    }])
    const addTaskLapseList = (): void => {
      taskLapseList.value.push(
        {
          id: uuid(),
          label: 'DISINFECTION_TASK_LAPSE',
          noticeObjs: [{
            objId: [],
            objType: '',
            id: uuid()
          }],
          noticeWays: [],
          sceneCode: 'DISINFECTION_TASK_LAPSE',
          value: 1,
          name: null
        }
      )
    }

    const getTab1 = async (): Promise<void> => {
      const  data  = await cubeBracingService.getMessage({
        businessType: 'PROJECT_MANAGE',
        label: 'DISINFECTION_TASK_CREATE'
      })
      noticeWayScene.value.taskCreate = await cubeMessageCenterService.sceneNotificationMethod('DISINFECTION_TASK_CREATE')
      
      if (!data.length){
        return
      }
      taskCreateList.value = data.map((item: { noticeWays: { noticeWay: string; }[]; noticeObjs: { objId: string[]; objType: string[]; }[]; }) => {
        item.noticeWays = (item.noticeWays.map((e: { noticeWay: string; }) => e.noticeWay) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map((e) => ({
          ...e,
          objId: (e.objId as unknown as string).split(',') as unknown as never[],
        }))
        return item
      })
    }
    const getTab2 = async (): Promise<void> => {
      const  data  = await cubeBracingService.getMessage({
        businessType: 'PROJECT_MANAGE',
        label: 'DISINFECTION_TASK_LAPSE'
      })
      noticeWayScene.value.taskLapse = await cubeMessageCenterService.sceneNotificationMethod('DISINFECTION_TASK_LAPSE')
      if (!data.length){
        return
      }
      taskLapseList.value = data.map((item: { noticeWays: { noticeWay: string; }[]; noticeObjs: { objId: string[]; objType: string[]; }[]; }) => {
        item.noticeWays = (item.noticeWays.map((e: { noticeWay: string; }) => e.noticeWay) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map((e) => ({
          ...e,
          objId: (e.objId as unknown as string).split(',') as unknown as never[],
        }))
        return item
      })
    }
    const getTab3 = async (): Promise<void> => {
      const  data  = await cubeBracingService.getMessage({
        businessType: 'PROJECT_MANAGE',
        label: 'DISINFECTION_TASK_LAPSE_UNFINISHED'
      })
      noticeWayScene.value.taskLapseUnfinished = await cubeMessageCenterService.sceneNotificationMethod('DISINFECTION_TASK_LAPSE_UNFINISHED')
      if (!data.length){
        return
      }
      taskLapseUnfinishedList.value = data.map((item: { noticeWays: { noticeWay: string; }[]; noticeObjs: { objId: string[]; objType: string[]; }[]; }) => {
        item.noticeWays = (item.noticeWays.map((e: { noticeWay: string; }) => e.noticeWay) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map((e) => ({
          ...e,
          objId: (e.objId as unknown as string).split(',') as unknown as never[],
        }))
        return item
      })
    }
    const getData = async (): Promise <void> => {
      getTab1()
      getTab2()
      getTab3()
    }

    const loading = ref(false)
    const save = async (): Promise<void> => {
      loading.value = true
      const taskCreate = taskCreateList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          // @ts-ignore
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? '' : obs.objId.join(',') as unknown as never[]
          return obs
        })
        return item
      })
      const taskLapse = taskLapseList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          // @ts-ignore
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? '' : obs.objId.join(',') as unknown as never[]
          return obs
        })
        return item
      })
      const taskLapseUnfinished = taskLapseUnfinishedList.value.map(item => {
        item.noticeWays = (item.noticeWays.map(way => {
          return {
            noticeWay: way
          }
        }) as unknown as never[])
        item.noticeObjs = item.noticeObjs.map(obs => {
          // @ts-ignore
          (obs as { objId: unknown[]; }).objId = obs.objId.length === 0 ? '' : obs.objId.join(',') as unknown as never[]

          return obs
        })
        return item
      })
      try {
        await cubeBracingService.addMessage({
          businessType: 'PROJECT_MANAGE',
          sceneConfigDTOS: [
            ...taskCreate,
            ...taskLapse,
            ...taskLapseUnfinished
          ]
        })
        loading.value = false
        message.success('保存成功')
        getData()
      } catch {
        loading.value = false
        message.error('请完整填写数据')
      }
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs activeKey={activeKey.value} onTabChange={tabChange} type='card'>
              <TabPane tab='任务创建通知' key='DISINFECTION_TASK_CREATE'>
                {taskCreateList.value.map((item) => {
                  return (
                    <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                      <div>
                        <FormItem label='通知条件:'>任务下发即提醒</FormItem>
                        <FormItem label='通知方式:'>
                          <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                            {noticeWayScene.value.taskCreate.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={noticeWayScene.value.taskCreate} />}
                          </div>
                        </FormItem>
                        <FormItem label='通知内容:'>您收到【任务名称】，请及时接收任务</FormItem>
                      </div>
                    </div>
                  )
                })}
              </TabPane>
              <TabPane tab='任务即将到期通知' key='DISINFECTION_TASK_LAPSE'>
                <Button type='primary' onClick={addTaskLapseList}>添加</Button>
                <div>
                  {taskLapseList.value.map((item, itemIndex) => {
                    return (
                      <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                        <div>
                          <FormItem label='通知条件:'>距离任务时限到期还有<InputNumber style='width:100px!important' max={999} min={1} v-model:value={item.value} /> 分钟提醒 </FormItem>
                          <FormItem label='通知方式:'>
                            <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                              {noticeWayScene.value.taskLapse.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={noticeWayScene.value.taskLapse} />}
                            </div>
                          </FormItem>
                          <FormItem label='通知内容:'>您负责的【任务名称】，将在【配置的通知条件（例：30分钟）】后到期，请及时抓紧时间完成</FormItem>

                        </div>
                        <div>
                          {itemIndex !== 0 && <Button danger onClick={() => {
                            taskLapseList.value.splice(itemIndex, 1)
                          }}>删除</Button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </TabPane>
              <TabPane tab='任务到期未完成通知' key='DISINFECTION_TASK_LAPSE_UNFINISHED'>
                {taskLapseUnfinishedList.value.map((item) => {
                  return (
                    <div key={item.id} style={{ border: '1px solid #e8e8e8', padding: '10px', width: '60%', display: 'flex', alignItems: 'center', marginTop: '10px', justifyContent: 'space-between' }}>
                      <div>
                        <FormItem label='通知条件:'>任务时限到期且没有完成即通知</FormItem>
                        <FormItem label='通知方式:'>
                          <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                            {noticeWayScene.value.taskLapseUnfinished.length === 0 ? <span>当前场景未配置可使用的通知方式</span> : <CheckboxGroup class='ml-15px' v-model:value={item.noticeWays} options={noticeWayScene.value.taskLapseUnfinished} />}
                          </div>
                        </FormItem>
                        <FormItem label='通知内容:'>由【执行人】负责的【任务名称】当前已到期但任务还未完成，请知悉</FormItem>
                      </div>
                    </div>
                  )
                })}
              </TabPane>
            </Tabs>
          </>
        )
      },
      'footer-page': (): JSX.Element => {
        return (
          <>
            <Button type='primary' loading={loading.value} onClick={() => {
              save()
            }} style={{ marginRight: '10px' }}>保存</Button>
          </>
        )
      }
    }


    onMounted(async () => {
      getData()

    })
    return (): JSX.Element => <Layout title={pageTitle} v-slots={layoutSlots} showFooter />
  }
})
