

import { Layout } from '@/components/layout/layout'
import { Button, CheckboxGroup, FormItem, InputNumber, TabPane, Tabs, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { addnewmessage, getnewmessage } from '@/api/message'
import { UserSelect, type ItemDataType, type NoticeObj } from './user-select'
import type { AssemblyNoticeObjDTO } from '@/typings/global'
import { usePageName } from '@ghcloud/cube-utils'
import { cubeMessageCenterService } from '@/api/service'
interface NoticeObjs {
  label: string;
  value: string;
}
export const Message = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref('PRICING_TASK_PUBLISHED_NOTIFY')
    const taskPublishedClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: 'PRICING_TASK_PUBLISHED_NOTIFY',
      sceneCode: 'PRICING_TASK_PUBLISHED_NOTIFY'
    })
    const startClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
      value: number;
    }>({
      value: 0,
      noticeWays: [],
      label: 'PRICING_TASK_RECEIVED_NOTIFY',
      sceneCode: 'PRICING_TASK_RECEIVED_NOTIFY'
    })
    const taskCompleteClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: 'PRICING_TASK_COMPLETE_NOTIFY',
      sceneCode: 'PRICING_TASK_COMPLETE_NOTIFY'
    })
    const priceWarnClock = ref<{
      noticeWays: string[] | undefined;
      noticeObjs: unknown[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      noticeObjs: [],
      label: 'PRICE_WARN_PUBLISHED_USER_NOTIFY',
      sceneCode: 'PRICE_WARN_PUBLISHED_USER_NOTIFY'
    })

    const tabchange = (value: string): void => {
      activeKey.value = value
    }
    const userSelectRef = ref<{ validateForm: () => Promise<{ users: NoticeObj[]; data: ItemDataType[]; } | null>; }>()
    const userSelectData = ref<ItemDataType[]>([])
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs activeKey={activeKey.value} onTabChange={tabchange} type='card'>
              <TabPane tab='任务下发' key='PRICING_TASK_PUBLISHED_NOTIFY'>
                <FormItem label='通知方式:'>
                  <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                    {noticeObjs.value.taskPublishedClock.length && <CheckboxGroup class='ml-15px' v-model:value={taskPublishedClock.value.noticeWays} options={noticeObjs.value.taskPublishedClock} />}
                    {!noticeObjs.value.taskPublishedClock.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label='通知内容:'>您收到【采价任务名称】采价任务，请及时完成采价并提交采价结果</FormItem>
              </TabPane>
              <TabPane tab='超时未接收' key='PRICING_TASK_RECEIVED_NOTIFY'>
                <FormItem label='通知条件:'>任务下发 <InputNumber style='width:200px!important' max={99999} min={0} v-model:value={startClock.value.value} /> 分钟后仍旧未接收时提醒</FormItem>
                <FormItem label='通知方式:'>
                  <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                    {noticeObjs.value.startClock.length && <CheckboxGroup class='ml-15px' v-model:value={startClock.value.noticeWays} options={noticeObjs.value.startClock} />}
                    {!noticeObjs.value.startClock.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label='通知内容:'>您有一条【采价任务名称】未被接收，请及时前往接收处理</FormItem>
              </TabPane>
              <TabPane tab='超时未完成' key='PRICING_TASK_COMPLETE_NOTIFY'>
                <FormItem label='通知条件:'>任务超时未完成提醒时</FormItem>
                <FormItem label='通知方式:'>
                  <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                    {noticeObjs.value.taskCompleteClock.length && <CheckboxGroup class='ml-15px' v-model:value={taskCompleteClock.value.noticeWays} options={noticeObjs.value.taskCompleteClock} />}
                    {!noticeObjs.value.taskCompleteClock.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label='通知内容:'>您有一条【采价任务名称】任务已超时，还未完成，请及时前往处理</FormItem>
              </TabPane>
              <TabPane tab='采价预警' key='PRICE_WARN_PUBLISHED_USER_NOTIFY'>
                <UserSelect itemData={userSelectData.value} ref={userSelectRef} />
                <FormItem label='通知方式:'>
                  <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                    {noticeObjs.value.priceWarnClock.length && <CheckboxGroup class='ml-15px' v-model:value={priceWarnClock.value.noticeWays} options={noticeObjs.value.priceWarnClock} />}
                    {!noticeObjs.value.priceWarnClock.length && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label='通知内容:'>【当前时间】【采价任务名称】【商品品类】触发采价预警，报警原因：【采价预警名称】</FormItem>
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
      // const { data } = await getNoticeCode('PRICING_TASK_RECEIVED_NOTIFY')
      // if (data) {
      //   plainOptions.value = plainOptions.value.filter(e => (data as { channelCodes: string[]; }).channelCodes.find((ele: string) => ele === e.value))
      // } else {
      //   plainOptions.value = []
      // }
    }
    const noticeObjs = ref<{
      taskPublishedClock: NoticeObjs[];
      startClock: NoticeObjs[];
      taskCompleteClock: NoticeObjs[];
      priceWarnClock: NoticeObjs[];
    }>({
      taskPublishedClock: [],
      startClock: [],
      taskCompleteClock: [],
      priceWarnClock: []
    })
    const save = async (): Promise<void> => {
      loading.value = true
      const startway = startClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskPublishedClockway = taskPublishedClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const taskCompleteClockway = taskCompleteClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const priceWarnClockway = priceWarnClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const userSelect = await userSelectRef.value?.validateForm()
      if (!userSelect) {
        loading.value = false
        activeKey.value = 'PRICE_WARN_PUBLISHED_USER_NOTIFY'
        message.warning('请选择采价预警通知人员')
        return
      }
      let noticeUsers: AssemblyNoticeObjDTO[] = []
      if (userSelect?.users) {
        noticeUsers = userSelect.users.map(item => {
          return {
            objType: item.objType,
            objId: item.targetConfig?.map(i => (i as { id: string; }).id).join(','),
            objInfo: null
          }
        })
        noticeUsers[0].objInfo = JSON.stringify(userSelect.users)
      }
      await addnewmessage({
        businessType: 'GOODSPURCHASEPRICE',
        sceneConfigDTOS: [
          {
            ...taskPublishedClock.value,
            noticeWays: taskPublishedClockway
          },
          {
            ...startClock.value,
            noticeWays: startway
          },
          {
            ...taskCompleteClock.value,
            noticeWays: taskCompleteClockway
          },
          {
            ...priceWarnClock.value,
            noticeWays: priceWarnClockway,
            noticeObjs: noticeUsers
          }
        ]
      })
      loading.value = false
      getData()
      message.success('保存成功')
    }

    const getStart = async (): Promise<void> => {
      const { data } = await getnewmessage({
        businessType: 'GOODSPURCHASEPRICE',
        label: 'PRICING_TASK_RECEIVED_NOTIFY'
      })
      if (data.length === 0) return

      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      startClock.value.noticeWays = noticeWays
      startClock.value.label = data[0].label
      startClock.value.sceneCode = data[0].sceneCode
      startClock.value.value = data[0].value
    }
    const getTaskPublishedClock = async (): Promise<void> => {
      const { data } = await getnewmessage({
        businessType: 'GOODSPURCHASEPRICE',
        label: 'PRICING_TASK_PUBLISHED_NOTIFY'
      })
      if (data.length === 0) return

      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      taskPublishedClock.value.noticeWays = noticeWays
      taskPublishedClock.value.label = data[0].label
      taskPublishedClock.value.sceneCode = data[0].sceneCode
    }
    const getTaskCompleteClock = async (): Promise<void> => {
      const { data } = await getnewmessage({
        businessType: 'GOODSPURCHASEPRICE',
        label: 'PRICING_TASK_COMPLETE_NOTIFY'
      })
      if (data.length === 0) return

      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      taskCompleteClock.value.noticeWays = noticeWays
      taskCompleteClock.value.label = data[0].label
      taskCompleteClock.value.sceneCode = data[0].sceneCode
    }
    const getPriceWarnClock = async (): Promise<void> => {
      const { data } = await getnewmessage({
        businessType: 'GOODSPURCHASEPRICE',
        label: 'PRICE_WARN_PUBLISHED_USER_NOTIFY'
      })
      if (data.length === 0) return

      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      priceWarnClock.value.noticeWays = noticeWays
      priceWarnClock.value.label = data[0].label
      priceWarnClock.value.sceneCode = data[0].sceneCode
      userSelectData.value = data[0]?.noticeObjs && JSON.parse(data[0]?.noticeObjs[0]?.objInfo ?? '')
    }

    const getData = async (): Promise<void> => {
      getTaskPublishedClock()
      getStart()
      getTaskCompleteClock()
      getPriceWarnClock()
      getNoticeOption('PRICING_TASK_PUBLISHED_NOTIFY')
      noticeObjs.value.taskPublishedClock = await getNoticeOption('PRICING_TASK_PUBLISHED_NOTIFY')
      noticeObjs.value.startClock = await getNoticeOption('PRICING_TASK_RECEIVED_NOTIFY')
      noticeObjs.value.taskCompleteClock = await getNoticeOption('PRICING_TASK_COMPLETE_NOTIFY')
      noticeObjs.value.priceWarnClock = await getNoticeOption('PRICE_WARN_PUBLISHED_USER_NOTIFY')
    }

    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
      </>
  }
})
