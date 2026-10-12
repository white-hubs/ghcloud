import { defineComponent, ref, onMounted } from "vue";
import { Button, CheckboxGroup, FormItem, TabPane, Tabs, Form, message, type FormExpose } from '@ghcloud/cube-ui'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { usePageName } from '@ghcloud/cube-utils';
import { cubeMessageCenterService } from "@/api/service";
import { addNewMessage, getNewMessage } from '@/api/message';

const applicationCode = "OUTSOURCE_REPAIR";

// 定义消息类型常量
const MESSAGE_TYPE = {
  DISTRIBUTED: "MAINTAIN_OUTSOURCE_REPAIR_DISTRIBUTED", // 接收工单
  SOLVE: "MAINTAIN_OUTSOURCE_REPAIR_SOLVE", // 处理工单
  CONFIRM: "MAINTAIN_OUTSOURCE_REPAIR_CONFIRM", // 待确认
  RECEIVED: "MAINTAIN_OUTSOURCE_REPAIR_RECEIVED", // 已接收
  HANDLED: "MAINTAIN_OUTSOURCE_REPAIR_HANDLED", // 已处理
};

interface NoticeObjs {
  label: string;
  value: string;
}

export const MessageConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref(MESSAGE_TYPE.DISTRIBUTED)
    const distributedClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: '接收工单',
      sceneCode: MESSAGE_TYPE.DISTRIBUTED,
    })
    const solveClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: '处理工单',
      sceneCode: MESSAGE_TYPE.SOLVE,
    })
    const confirmClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: '待确认',
      sceneCode: MESSAGE_TYPE.CONFIRM,
    })
    const receivedClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: '已接收',
      sceneCode: MESSAGE_TYPE.RECEIVED,
    })
    const handledClock = ref<{
      noticeWays: string[] | undefined;
      label: string;
      sceneCode: string;
    }>({
      noticeWays: [],
      label: '已处理',
      sceneCode: MESSAGE_TYPE.HANDLED,
    })

    const distributedRef = ref<FormExpose>()
    const solveRef = ref<FormExpose>()
    const confirmRef = ref<FormExpose>()
    const receivedRef = ref<FormExpose>()
    const handledRef = ref<FormExpose>()
    const tabeRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
    }

    const mapMsgTmpContent = (content: string): string => {
      return content
        .replace("${userName}", "【用户名称】")
        .replace("${tenantName}", "【企业名称】")
        .replace("${outsourceEvent}", "【委外维修】")
        .replace("${outsourceName}", "【委外维修单名称】")
        .replace("${handleResult}", "【处理结果】")
        .replace("${address}", "http://www.dfadf.com/adfadf.html");
    }

    const tabchange = (value: string): void => {
      activeKey.value = value
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <div class='message-config'>
            <Tabs activeKey={activeKey.value} onTabChange={tabchange} type='card'>
              <TabPane tab={distributedClock.value.label} key={distributedClock.value.sceneCode}>
                <Form model={distributedClock.value} ref={distributedRef} rules={tabeRules}>
                  <FormItem label='通知人员:'>通知委外公司责任人</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.distributedClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={distributedClock.value.noticeWays} options={noticeObjs.value.distributedClock} />}
                      {!noticeObjs.value.distributedClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>{mapMsgTmpContent('${userName}您好，您有一条来自${tenantName}的委外维修工单，请点击下面的链接确认接收该工单：${address}')}</FormItem>
                </Form>
              </TabPane>
              <TabPane tab={solveClock.value.label} key={solveClock.value.sceneCode}>
                <Form model={solveClock.value} ref={solveRef} rules={tabeRules}>
                  <FormItem label='通知人员:'>通知委外公司责任人</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.solveClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={solveClock.value.noticeWays} options={noticeObjs.value.solveClock} />}
                      {!noticeObjs.value.solveClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>{mapMsgTmpContent('${userName}您好，您有一条来自${tenantName}的委外维修工单，请点击下面的链接进行处理结果提交：${address}')}</FormItem>
                </Form>
              </TabPane>
              <TabPane tab={confirmClock.value.label} key={confirmClock.value.sceneCode}>
                <Form model={confirmClock.value} ref={confirmRef} rules={tabeRules}>
                  <FormItem label='通知人员:'>通知委外公司责任人</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.confirmClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={confirmClock.value.noticeWays} options={noticeObjs.value.confirmClock} />}
                      {!noticeObjs.value.confirmClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>{mapMsgTmpContent('您有一条来自${outsourceEvent}${outsourceName}的确认事项，请及时处理')}</FormItem>
                </Form>
              </TabPane>
              <TabPane tab={receivedClock.value.label} key={receivedClock.value.sceneCode}>
                <Form model={receivedClock.value} ref={receivedRef} rules={tabeRules}>
                  <FormItem label='通知人员:'>通知委外公司责任人</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.receivedClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={receivedClock.value.noticeWays} options={noticeObjs.value.receivedClock} />}
                      {!noticeObjs.value.receivedClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>{mapMsgTmpContent('您好，来源于${outsourceEvent}，名称为：${outsourceName}已被${userName}接受，处理结果为：${handleResult}')}</FormItem>
                </Form>
              </TabPane>
              <TabPane tab={handledClock.value.label} key={handledClock.value.sceneCode}>
                <Form model={handledClock.value} ref={handledRef} rules={tabeRules}>
                  <FormItem label='通知人员:'>通知委外公司责任人</FormItem>
                  <FormItem label='通知方式:' name='noticeWays'>
                    <div class='flex-row'>
                      {noticeObjs.value.handledClock.length && <CheckboxGroup class='checkbox-margin' v-model:value={handledClock.value.noticeWays} options={noticeObjs.value.handledClock} />}
                      {!noticeObjs.value.handledClock.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模版:'>{mapMsgTmpContent('您好，来源于${outsourceEvent}，名称为：${outsourceName}已被${userName}处理完成，处理结果为：${handleResult}')}</FormItem>
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
      distributedClock: NoticeObjs[];
      solveClock: NoticeObjs[];
      confirmClock: NoticeObjs[];
      receivedClock: NoticeObjs[];
      handledClock: NoticeObjs[];
    }>({
      distributedClock: [],
      solveClock: [],
      confirmClock: [],
      receivedClock: [],
      handledClock: [],
    })
    const save = async (): Promise<void> => {
      try {
        await distributedRef.value?.validate()
      } catch {
        activeKey.value = MESSAGE_TYPE.DISTRIBUTED
        return
      }
      try {
        await solveRef.value?.validate()
      } catch {
        activeKey.value = MESSAGE_TYPE.SOLVE
        return
      }
      try {
        await confirmRef.value?.validate()
      } catch {
        activeKey.value = MESSAGE_TYPE.CONFIRM
        return
      }
      try {
        await receivedRef.value?.validate()
      } catch {
        activeKey.value = MESSAGE_TYPE.RECEIVED
        return
      }
      try {
        await handledRef.value?.validate()
      } catch {
        activeKey.value = MESSAGE_TYPE.HANDLED
        return
      }

      loading.value = true
      const distributedWay = distributedClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const solveWay = solveClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const confirmWay = confirmClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const receivedWay = receivedClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      const handledWay = handledClock.value?.noticeWays?.map(item => {
        return {
          noticeWay: item
        }
      })
      await addNewMessage({
        businessType: applicationCode,
        sceneConfigDTOS: [
          {
            ...distributedClock.value,
            noticeWays: distributedWay
          },
          {
            ...solveClock.value,
            noticeWays: solveWay
          },
          {
            ...confirmClock.value,
            noticeWays: confirmWay
          },
          {
            ...receivedClock.value,
            noticeWays: receivedWay
          },
          {
            ...handledClock.value,
            noticeWays: handledWay
          }
        ]
      })
      loading.value = false
      getData()
      message.success('保存成功')
    }
    const getDistributedClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: applicationCode,
        label: MESSAGE_TYPE.DISTRIBUTED,
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      distributedClock.value.noticeWays = noticeWays
      distributedClock.value.label = data[0].label
      distributedClock.value.sceneCode = data[0].sceneCode
    }
    const getSolveClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: applicationCode,
        label: MESSAGE_TYPE.SOLVE,
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      solveClock.value.noticeWays = noticeWays
      solveClock.value.label = data[0].label
      solveClock.value.sceneCode = data[0].sceneCode
    }
    const getConfirmClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: applicationCode,
        label: MESSAGE_TYPE.CONFIRM,
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      confirmClock.value.noticeWays = noticeWays
      confirmClock.value.label = data[0].label
      confirmClock.value.sceneCode = data[0].sceneCode
    }
    const getReceivedClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: applicationCode,
        label: MESSAGE_TYPE.RECEIVED,
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      receivedClock.value.noticeWays = noticeWays
      receivedClock.value.label = data[0].label
      receivedClock.value.sceneCode = data[0].sceneCode
    }
    const getHandledClock = async (): Promise<void> => {
      const { data } = await getNewMessage({
        businessType: applicationCode,
        label: MESSAGE_TYPE.HANDLED,
      })
      if (data.length === 0) return
      const noticeWays = data[0].noticeWays?.map(e => {
        return e.noticeWay ?? ''
      })
      handledClock.value.noticeWays = noticeWays
      handledClock.value.label = data[0].label
      handledClock.value.sceneCode = data[0].sceneCode
    }

    const getData = async (): Promise<void> => {
      getDistributedClock()
      getSolveClock()
      getConfirmClock()
      getReceivedClock()
      getHandledClock()
      noticeObjs.value.distributedClock = await getNoticeOption(MESSAGE_TYPE.DISTRIBUTED)
      noticeObjs.value.solveClock = await getNoticeOption(MESSAGE_TYPE.SOLVE)
      noticeObjs.value.confirmClock = await getNoticeOption(MESSAGE_TYPE.CONFIRM)
      noticeObjs.value.receivedClock = await getNoticeOption(MESSAGE_TYPE.RECEIVED)
      noticeObjs.value.handledClock = await getNoticeOption(MESSAGE_TYPE.HANDLED)
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