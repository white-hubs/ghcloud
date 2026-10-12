import { cubeDeviceSuperviseService } from '@/api/service'
import { logger } from '@/logger'
import type { AlarmDetail, AlarmInfo, AlarmLevel } from '@/types/alarm-type'
import { Form, FormItem, InputNumber, RadioGroup, Select, type FormExpose } from '@ghcloud/cube-ui'
import { VerticalLine } from '@ghcloud/generic-component'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

/** 设备通知配置-报警信息 */
export const NoticeConfigAlarmInfo = defineComponent({
  setup: (props, { expose }) => {
    const { id } = useRoute().query as { id: string; }
    const formInstance = ref<FormExpose>()
    const formState = reactive<AlarmInfo>({
      thresholdValue: undefined,
      enable: undefined,
      levelId: undefined,
    })
    const baseInfo = ref<AlarmDetail>({})

    const formRules = {
      thresholdValue: [{ required: true, message: '请输入报警阈值', trigger: 'blur' }],
      enable: [{ required: true, message: '请设置报警开关', trigger: 'blur' }],
      levelId: [{ required: true, message: '请选择报警级别', trigger: 'blur' }],
    }

    const getData = async (): Promise<unknown> => {
      try {
        return formInstance.value?.validate()
      } catch {
      }
    }

    const levelOptions = ref<AlarmLevel[]>([])
    const queryData = async (): Promise<void> => {
      try {
        levelOptions.value = await cubeDeviceSuperviseService.getAlarmLevels()
      } catch (error) {
        logger.error(error)
      }
    }

    const loading = ref(false)
    const getAlarmInfo = async (): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeDeviceSuperviseService.getAlarmConfigDetail(id)
        if (res) {
          const data = res as AlarmInfo
          formState.thresholdValue = data.thresholdValue
          formState.enable = data.enable
          formState.levelId = data.levelId
          baseInfo.value = res as AlarmDetail
        }
      } catch (error) {
        logger.error(error)
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getAlarmInfo()
      queryData()
    })
    expose({
      getData
    })

    return (): JSX.Element=>
      <>
        <VerticalLine title='报警信息' style='margin-top:20px' />
        <Form style={{ margin: '10px 0 0 40px', width: '60%' }} model={formState} rules={formRules} ref={formInstance}>
          <FormItem label='报警设备' style='width:50%;display:inline-flex'>{baseInfo.value.name || '--'}</FormItem>
          <FormItem label='报警阈值' style='width:50%;display:inline-flex' name='thresholdValue'>
            <InputNumber placeholder='请输入报警阈值' v-model:value={formState.thresholdValue} min={1} max={100} />
          </FormItem>
          <FormItem label='报警开关' style='width:50%;display:inline-flex' name='enable'>
            <RadioGroup
              v-model:value={formState.enable}
              options={[
                { label: '开', value: true },
                { label: '关', value: false },
              ]}
            />
          </FormItem>
          <FormItem label='报警级别' style='width:50%;display:inline-flex' name='levelId'>
            <Select
              v-model:value={formState.levelId}
              placeholder='请选择报警级别'
              options={levelOptions.value}
              fieldNames={{ label: 'name', value: 'id' }}
              getPopupContainer={(e: { parentNode: unknown; }) => e.parentNode}
            />
          </FormItem>
        </Form>
      </>
  }
})
