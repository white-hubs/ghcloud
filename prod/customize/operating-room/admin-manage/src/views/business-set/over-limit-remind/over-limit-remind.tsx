import { cubeOperatingRoomService } from '@/api/service'
import { Layout } from '@/components/layout/layout'
import { TimeUnit } from '@ghcloud/cube-operating-room-service'
import { Button, CheckboxGroup, Form, FormItem, InputNumber, TabPane, Tabs, message } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
export const OverLimitRemind = defineComponent({
  setup: () => {
    const activeKey = ref('START_CLOCK')
    const startClock = ref<{
      times: number;
      noticeWays: string[];
      noticeOptions: {
        value: string;
        label: string;
        terminal: string;
        terminalName: string;
      }[];
    }>({
      times: 0,
      noticeWays: [],
      noticeOptions: [
        {
          value: 'CHANNEL_SMS',
          label: '短信',
          terminal: '',
          terminalName: '',
        },
        {
          value: 'CHANNEL_SITE',
          label: '站内消息',
          terminal: 'bimops-manage-web',
          terminalName: '常德高铁站web',
        },
        {
          value: 'CHANNEL_APP',
          label: 'APP推送',
          terminal: 'bimops-manage-app',
          terminalName: '常德高铁站app',
        },
        // {
        //   value: 'CHANNEL_VOICE',
        //   label: '语音通知',
        //   terminal: 'bimops-manage-app',
        //   terminalName: '常德高铁站app',
        // }
      ]
    })
    const tabChange = (value: string): void => {
      activeKey.value = value
    }
    const layoutSlots = {
      'layout-content': (): JSX.Element => {
        return (
          <>
            <Tabs style={{ margin: '10px 0 0 0' }} activeKey={activeKey.value} onTabChange={tabChange} type='card'>
              <TabPane tab='指标超限提醒' key='START_CLOCK'>
                <Form style={{ textAlign: 'left' }}>
                  <FormItem label='通知条件:'>指标超限<InputNumber style='width:200px!important;margin-left:5px;' max={999} min={0} v-model:value={startClock.value.times} /> 分钟，未恢复正常提醒</FormItem>
                  <FormItem label='通知方式:'>
                    <div style='display: flex; flex-direction: row; flex-wrap: wrap;'>
                      {startClock.value.noticeOptions.length && <CheckboxGroup class='ml-15px' v-model:value={startClock.value.noticeWays} options={startClock.value.noticeOptions} />}
                      {!startClock.value.noticeOptions.length && <span>当前场景未配置可使用的通知方式</span>}
                    </div>
                  </FormItem>
                  <FormItem label='消息模板:'>指标【室内压力】超限5分钟还未恢复正常，请尽快处理</FormItem>
                </Form>
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
    const save = async (): Promise<void> => {
      loading.value = true
      await cubeOperatingRoomService.saveNotifyConfig({
        notifyChannels: startClock.value.noticeWays ? startClock.value.noticeWays.join(',') : '',
        times: startClock.value.times,
        timeUnit: TimeUnit.SECONDS,
      })
      setTimeout(() => {
        loading.value = false
      }, 1000)
      getData()
      message.success('保存成功')
    }

    const getData = async (): Promise<void> => {
      const res = await cubeOperatingRoomService.getNotifyConfigDetail()
      if (res) {
        startClock.value.times = res.times ?? 0
        startClock.value.noticeWays = res.notifyChannels?.split(',') ?? []
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element =>
      <>
        <Layout title='指标超限提醒' v-slots={layoutSlots} />
      </>
  }
})
