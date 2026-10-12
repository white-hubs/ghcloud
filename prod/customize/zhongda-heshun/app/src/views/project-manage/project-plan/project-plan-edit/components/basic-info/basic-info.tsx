import { defineComponent, reactive, ref, watch, onMounted, type PropType, computed } from 'vue'
import { Form, FormItem, Input, Select, DatePicker, InputNumber, Switch } from '@ghcloud/cube-ui'
import type { FormExpose } from '@ghcloud/cube-ui'
import styles from './basic-info.module.less'
import { ProjectSelect } from '@/components/project-select/project-select'
import { UserSelectPage } from '@ghcloud/cube-app-design'
import TextArea from 'ant-design-vue/es/input/TextArea'
import { months, weeks } from './basic'
import { TimePicker } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useRoute } from 'vue-router'

interface FormState {
  planName: string;
  projectId: string | null;
  beginTime: string;
  endTime: string;
  type: string | null;
  projectLeaderId: string | null;
  projectLeaderName?: string;
  projectName?: string;
  taskTimeLimitConfig: {
    day: number;
    hour: number;
    minute: number;
  };
  remark: string;
  status: boolean;
  taskGenerationCycleConfigs: {
    type: string;
    day?: string;
    time: string;
  }[];
  time: string;
}

export const BasicInfo = defineComponent({
  name: 'BasicInfo',
  emits: ['projectChange'],
  props: {
    initFormState: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({})
    }
  },
  setup: (props, { expose, emit }) => {
    const route = useRoute()
    const type = route.query.type as string
    const isDetailView = type === 'info'
    const formRef = ref<FormExpose>()
    const weeksValue = ref<string[]>([])
    const monthsValue = ref<string[]>([])
    const taskGenerateTimeOptions = [
      {
        label: '每天',
        value: 'DAILY'
      },
      {
        label: '每周',
        value: 'WEEKLY'
      },
      {
        label: '每月',
        value: 'MONTHLY'
      }
    ]
    const inputWidth = computed(() => {
      if (formState.type === 'DAILY' || formState.type === null){
        return '50%'
      } else {
        return '33.33%'
      }
    })
    const formState = reactive<FormState>({
      planName: '',
      projectId: null,
      beginTime: '',
      endTime: '',
      type: null,
      projectLeaderId: null,
      taskTimeLimitConfig: {
        day: 0,
        hour: 0,
        minute: 0
      },
      remark: '',
      status: true,
      taskGenerationCycleConfigs: [],
      time: ''
    })

    const rules = {
      planName: [
        { required: true, message: '请输入计划名称', trigger: 'blur' }
      ],
      projectId: [
        { required: true, message: '请选择所属项目', trigger: 'change' }
      ],
      beginTime: [
        { required: true, message: '请选择计划开始时间', trigger: 'change' }
      ],
      endTime: [
        { required: true, message: '请选择计划结束时间', trigger: 'change' }
      ],
      type: [
        { required: true, message: '请选择任务生成时间', trigger: 'change' }
      ],
      projectLeaderId: [
        { required: true, message: '请选择项目负责人', trigger: 'change' }
      ]
    }

    /**
     * @description: 处理表单提交
     */
    const handleSubmit = async (): Promise<FormState> => {
      await formRef.value?.validate()
      return { ...formState }
    }

    /**
     * @description: 监听初始化数据变化
     */
    watch(
      () => props.initFormState,
      (newVal) => {
        if (newVal && Object.keys(newVal).length > 0) {
          Object.assign(formState, newVal)
          const newBeginTime = newVal.beginTime as string;
          const newEndTime = newVal.endTime as string;
          formState.beginTime = dayjs(new Date(newBeginTime)).format('YYYY-MM-DD')
          formState.endTime = dayjs(new Date(newEndTime)).format('YYYY-MM-DD')
          formState.status = (newVal.enable as string) === 'ENABLE';
          const newTaskGenerationCycleConfigs = newVal.taskGenerationCycleConfigs as {
            type: string;
            day?: string;
            time: string;
          }[]
          newTaskGenerationCycleConfigs.map((item) =>{
            formState.type = item.type
            formState.time = item.time
            if (item.type === 'WEEKLY'){
              weeksValue.value.push(item.day?.toString() ?? '')
            } else if (item.type === 'MONTHLY'){
              monthsValue.value.push(item.day?.toString() ?? '')
            }
          })
          if (type === 'copy'){
            formState.planName = formState.planName + '-副本-' + dayjs().format('YYYY-MM-DD')
          }
        }
      }
    )

    onMounted(() => {

    })
    const typeChange = (): void =>{
      weeksValue.value = []
      monthsValue.value = []
    }
    const taskGenerationCycleConfigsChange = (): void =>{
      if (formState.type === 'WEEKLY'){
        formState.taskGenerationCycleConfigs = weeksValue.value?.map((item: string) =>{
          return {
            type: formState.type ?? '',
            day: item,
            time: formState.time
          }
        }) ?? []
      } else if (formState.type === 'MONTHLY'){
        formState.taskGenerationCycleConfigs = monthsValue.value?.map((item: string) =>{
          return {
            type: formState.type ?? '',
            day: item,
            time: formState.time
          }
        }) ?? []
      } else {
        formState.taskGenerationCycleConfigs = [{
          type: formState.type ?? '',
          time: formState.time
        }]
      }

    }
    // 暴露方法给父组件
    expose({
      handleSubmit
    })

    /**
     * @description: 获取任务生成周期显示文本
     */
    const getTaskGenerationCycleText = (): string => {
      const typeMap = {
        'DAILY': '每天',
        'WEEKLY': '每周',
        'MONTHLY': '每月'
      }
      const typeText = typeMap[formState.type as keyof typeof typeMap] || ''

      if (formState.type === 'WEEKLY') {
        const weekMap = { '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '7': '周日' }
        const weekTexts = weeksValue.value.map(day => weekMap[day as keyof typeof weekMap]).join('、')
        return `${typeText} ${weekTexts} ${formState.time}`
      } else if (formState.type === 'MONTHLY') {
        const monthTexts = monthsValue.value.join('、')
        return `${typeText} ${monthTexts}号 ${formState.time}`
      }
      return `${typeText} ${formState.time}`
    }

    /**
     * @description: 获取任务时间限制显示文本
     */
    const getTaskTimeLimitText = (): string => {
      const { day, hour, minute } = formState.taskTimeLimitConfig
      const parts = []
      if (day > 0) parts.push(`${day}天`)
      if (hour > 0) parts.push(`${hour}时`)
      if (minute > 0) parts.push(`${minute}分`)
      return parts.length > 0 ? parts.join('') : '0分'
    }

    const projectChanges = (value: string, option: { value: string;label: string;beginTime: number;endTime: number; }): void=>{
      formState.beginTime = dayjs(option.beginTime).format('YYYY-MM-DD')
      formState.endTime = dayjs(option.endTime).format('YYYY-MM-DD')
      emit('projectChange', value)
    }

    return (): JSX.Element => (
      <div class={styles['basic-info']}>
        {isDetailView ? (
          // 详情展示模式
          <div class={styles['detail-view']}>
            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>计划名称：</span>
                  <span class={styles['detail-value']}>{formState.planName || '--'}</span>
                </div>
              </div>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>所属项目：</span>
                  <span class={styles['detail-value']}>{formState.projectName || '--'}</span>
                </div>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>计划生效时间：</span>
                  <span class={styles['detail-value']}>{formState.beginTime || '--'}</span>
                </div>
              </div>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>计划截止时间：</span>
                  <span class={styles['detail-value']}>{formState.endTime || '--'}</span>
                </div>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>任务生成周期：</span>
                  <span class={styles['detail-value']}>{getTaskGenerationCycleText()}</span>
                </div>
              </div>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>项目负责人：</span>
                  <span class={styles['detail-value']}>{formState.projectLeaderName || '--'}</span>
                </div>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>任务时间：</span>
                  <span class={styles['detail-value']}>{getTaskTimeLimitText()}</span>
                </div>
              </div>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>备注：</span>
                  <span class={styles['detail-value']}>{formState.remark || '--'}</span>
                </div>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <div class={styles['detail-item']}>
                  <span class={styles['detail-label']}>状态：</span>
                  <span class={styles['detail-value']}>{formState.status ? '启用' : '禁用'}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 原有的表单编辑模式
          <Form
            ref={formRef}
            model={formState}
            rules={rules}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
          >
            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <FormItem label="计划名称" name="planName">
                  <Input
                    v-model:value={formState.planName}
                    placeholder="请输入计划名称"
                  />
                </FormItem>
              </div>
              <div class={styles['form-col']}>
                <FormItem label="所属项目" name="projectId">
                  <ProjectSelect v-model:value={formState.projectId} onChange={(value, option) => {
                    projectChanges(value, option)
                  }} />
                </FormItem>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <FormItem label="计划生效时间" name="beginTime">
                  <DatePicker
                    v-model:value={formState.beginTime}
                    placeholder="请选择开始时间"
                    style={{ width: '100%' }}
                    showTime
                    format="YYYY-MM-DD"
                  />
                </FormItem>
              </div>
              <div class={styles['form-col']}>
                <FormItem label="计划截止时间" name="endTime">
                  <DatePicker
                    v-model:value={formState.endTime}
                    placeholder="请选择结束时间"
                    style={{ width: '100%' }}
                    showTime
                    format="YYYY-MM-DD"
                  />
                </FormItem>
              </div>
            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <FormItem label="任务生成周期" name="type">
                  <div class={styles['duration-inputs']}>
                    <Select
                      v-model:value={formState.type}
                      placeholder="请选择"
                      style={{ width: inputWidth.value }}
                      options={taskGenerateTimeOptions}
                      onChange={typeChange}
                    >
                    </Select>
                    {formState.type === 'WEEKLY' &&
                    <Select
                      v-model:value={weeksValue.value}
                      placeholder="请选择"
                      style={{ width: inputWidth.value }}
                      mode="multiple"
                      options={weeks}
                      onChange={taskGenerationCycleConfigsChange}
                    >
                    </Select>
                    }

                    {formState.type === 'MONTHLY' && <Select
                      v-model:value={monthsValue.value}
                      placeholder="请选择"
                      style={{ width: inputWidth.value }}
                      mode="multiple"
                      onChange={ taskGenerationCycleConfigsChange}
                      options={months}
                    >
                    </Select>}
                    <TimePicker
                      placeholder="日期选择"
                      // style={{ marginLeft: '8px', width: '150px' }}
                      style={{ width: inputWidth.value }}
                      v-model:value={formState.time}
                      onChange={ taskGenerationCycleConfigsChange}
                      format='HH:mm'
                      valueFormat='HH:mm'
                    />
                  </div>
                </FormItem>
              </div>
              <div class={styles['form-col']}>
                <FormItem label="项目负责人" name="projectLeaderId">
                  <UserSelectPage selectedValue={formState.projectLeaderId ?? ''} v-model:value={formState.projectLeaderId}
                  />
                </FormItem>
              </div>
            </div>
            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <FormItem label="任务时限">
                  <div class={styles['duration-inputs']}>
                    <InputNumber
                      v-model:value={formState.taskTimeLimitConfig.day}
                      min={0}
                      placeholder="0"
                    />
                    <span class={styles['duration-unit']}>天</span>
                    <InputNumber
                      v-model:value={formState.taskTimeLimitConfig.hour}
                      min={0}
                      max={23}
                      placeholder="0"

                    />
                    <span class={styles['duration-unit']}>时</span>
                    <InputNumber
                      v-model:value={formState.taskTimeLimitConfig.minute}
                      min={0}
                      max={59}
                      placeholder="0"

                    />
                    <span class={styles['duration-unit']}>分</span>
                  </div>
                </FormItem>
              </div>
              <div class={styles['form-col']}>
                <FormItem label="备注">
                  <TextArea
                    v-model:value={formState.remark}
                    placeholder="请输入备注信息"
                    rows={3}
                  />
                </FormItem>
              </div>

            </div>

            <div class={styles['form-row']}>
              <div class={styles['form-col']}>
                <FormItem label="状态" name="status">
                  <Switch checkedChildren={'启用'} unCheckedChildren={'禁用'} v-model:value={formState.status} />
                </FormItem>
              </div>
              <div class={styles['form-col']}>

              </div>
            </div>

          </Form>
        )}
      </div>
    )
  }
})