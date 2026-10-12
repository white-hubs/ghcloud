import { cubeMessageCenterService } from '@/api/service'
import { CubeLayout, UserFusionSelect } from '@ghcloud/cube-app-design'
import { Button, CheckboxGroup, Form, FormItem, InputNumber, TabPane, Tabs, message, type FormExpose } from '@ghcloud/cube-ui'
import { usePageName } from '@ghcloud/cube-utils'
import { defineComponent, onMounted, ref, type Ref } from 'vue'
import type { SceneConfigDTO } from '../../../../../message-center/service/src/types'
import './message-config.less'

interface NoticeOption {
  label: string;
  value: string;
}

interface NoticeUserItem {
  type: string;
  ids?: string[];
}

const WORK_CENTER = 'WORK_CENTER'
const ShiftOverMessageNotify = 'SHIFT_OVER_MESSAGE'

export const MessageConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName()
    const activeKey = ref(ShiftOverMessageNotify)
    const loading = ref(false)
    const shiftOverRenderRef = ref<FormExpose>()
    const shiftOverUserRef = ref<{ checkFormData: () => Promise<unknown>; isValid: Ref<boolean> }>()

    const shiftOverClock = ref<{
      noticeWays: string[] | undefined;
      noticeItems: NoticeUserItem;
      label: string;
      sceneCode: string;
      value: number | undefined;
      config: number | undefined;
    }>({
      noticeWays: [],
      noticeItems: { type: 'USER', ids: [] },
      label: '交班提醒',
      sceneCode: ShiftOverMessageNotify,
      value: undefined,
      config: undefined,
    })

    const validateShiftOverCondition = async (): Promise<unknown> => {
      if (shiftOverClock.value.value === undefined || shiftOverClock.value.value === null || Number.isNaN(shiftOverClock.value.value)) {
        return Promise.reject('请输入提醒分钟')
      }
      if (shiftOverClock.value.config === undefined || shiftOverClock.value.config === null || Number.isNaN(shiftOverClock.value.config)) {
        return Promise.reject('请输入指定人员提醒分钟')
      }
      return Promise.resolve(true)
    }

    const shiftOverRules = {
      noticeWays: [{ required: true, message: '请选择通知方式', trigger: 'blur' }],
      value: [{ validator: validateShiftOverCondition, trigger: 'blur' }],
      noticeItems: [{ validator: async (): Promise<unknown> => shiftOverUserRef.value?.checkFormData(), trigger: 'blur' }],
    }

    const shiftOverOptions = ref<NoticeOption[]>([])

    const parseNoticeItems = (
      raw: { objId?: string | null | undefined; objType?: string | null | undefined; objInfo?: unknown }[] | null | undefined,
    ): { type: string; ids: string[] } => {
      if (!raw || raw.length === 0) {
        return { type: 'USER', ids: [] }
      }
      return {
        type: raw[0]?.objType ?? 'USER',
        ids: raw[0]?.objId?.split(',') ?? [],
      }
    }

    const toNoticeWaysDTO = (ways?: string[]): { noticeWay: string }[] => (ways ?? []).map((w) => ({ noticeWay: w }))
    const toNoticeObjsDTO = (items?: NoticeUserItem): { objType: string; objId: string; objInfo: string }[] => [
      {
        objType: items?.type ?? '',
        objId: items?.ids?.join(',') ?? '',
        objInfo: JSON.stringify(items?.ids ?? []),
      },
    ]

    const getData = async (): Promise<void> => {
      const config = await cubeMessageCenterService.getMessageConfig({
        businessType: WORK_CENTER,
      })
      const shiftOverConfig = config.find((item: SceneConfigDTO) => item.sceneCode === ShiftOverMessageNotify)
      if (shiftOverConfig) {
        shiftOverClock.value.noticeWays = (shiftOverConfig.noticeWays ?? []).map((way) => way.noticeWay ?? '')
        shiftOverClock.value.label = shiftOverConfig.label
        shiftOverClock.value.sceneCode = shiftOverConfig.sceneCode
        shiftOverClock.value.value = shiftOverConfig.value ? Number(shiftOverConfig.value) : undefined
        shiftOverClock.value.config = shiftOverConfig.config ? Number(shiftOverConfig.config) : undefined
        shiftOverClock.value.noticeItems = parseNoticeItems(shiftOverConfig.noticeObjs)
      }
      shiftOverOptions.value = await cubeMessageCenterService.sceneNotificationMethod(ShiftOverMessageNotify)
    }

    const save = async (): Promise<void> => {
      try {
        await shiftOverRenderRef.value?.validate()
      } catch {
        activeKey.value = ShiftOverMessageNotify
        return
      }
      loading.value = true
      await cubeMessageCenterService.addMessageConfig({
        businessType: WORK_CENTER,
        sceneConfigDTOS: [
          {
            ...shiftOverClock.value,
            noticeWays: toNoticeWaysDTO(shiftOverClock.value.noticeWays),
            noticeObjs: toNoticeObjsDTO(shiftOverClock.value.noticeItems),
          },
        ],
      })
      loading.value = false
      await getData()
      message.success('保存成功')
    }

    onMounted(() => {
      getData()
    })

    const layoutSlots = {
      'layout-content': (): JSX.Element => (
        <div class="message-config">
          <Tabs activeKey={activeKey.value} type="card" destroyInactiveTabPane={false}>
            <TabPane tab="交班提醒" key={ShiftOverMessageNotify}>
              <Form model={shiftOverClock.value} ref={shiftOverRenderRef} rules={shiftOverRules}>
                <FormItem label="通知条件:" name="value">
                  <div class="condition-line">
                    工作交接后超过{' '}
                    <InputNumber class="input-number-width" max={9999999} min={0} precision={0} v-model:value={shiftOverClock.value.value} /> 分钟，再次推送接班人。
                    超过 <InputNumber class="input-number-width" max={9999999} min={0} precision={0} v-model:value={shiftOverClock.value.config} /> 分钟后，提醒指定人员。
                  </div>
                </FormItem>
                <FormItem label="通知方式:" name="noticeWays">
                  <div class="flex-row">
                    {shiftOverOptions.value.length > 0 && (
                      <CheckboxGroup class="checkbox-margin" v-model:value={shiftOverClock.value.noticeWays} options={shiftOverOptions.value} />
                    )}
                    {shiftOverOptions.value.length === 0 && <span>当前场景未配置可使用的通知方式</span>}
                  </div>
                </FormItem>
                <FormItem label="通知内容:">您有一条待处理交班消息，请及时处理。</FormItem>
                <FormItem label="通知人员:" name="noticeItems">
                  <UserFusionSelect ref={shiftOverUserRef} v-model:typeValue={shiftOverClock.value.noticeItems} />
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      ),
      'footer-page': (): JSX.Element => (
        <Button type="primary" loading={loading.value} onClick={save}>
          保存
        </Button>
      ),
    }

    return (): JSX.Element => <CubeLayout title={pageTitle} v-slots={layoutSlots} />
  },
})
