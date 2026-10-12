

import { defineComponent, reactive, ref, watch, type VNode } from 'vue'
import { Form, FormItem, DatePicker, Row, Col, Switch, Textarea, type FormInstance } from '@ghcloud/cube-ui'
import { PlanNameInput, TaskTimeLimit, TaskCreateCycle, PersonLiableSelect, CubeSelect, InspectLevelSelect } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import styles from './basic-info.module.less'
import dayjs, { type Dayjs } from 'dayjs'
import { InspectBusinessType } from '@ghcloud/cube-daily-inspection-service'
import { executeCycleOptions, weekCycleOptions } from './constants'
export const BasicInfo = defineComponent({
  props: {
    initFormState: {
      type: Object,
      default: () => ({})
    }
  },
  setup: (props, { expose }) => {
    const formRef = ref<FormInstance>()
    const state = reactive<{
      formState: Record<string, unknown>;
    }>({
      formState: {
        name: '',
        cycle: false,
        typeId: null,
        receiveType: '1',
        receiveIds: [],
        receiveDeptIds: null,
        receivePostIds: null,
        receiveRoleIds: null,
        limitTimeJson: '',
        level: 'GENERAL',
        method: '',
        beginTime: '',
        endTime: '',
        cronId: null,
        cycleType: null,
        hour: '12:00',
        selection: null,
        remark: '',
      }
    })
    const disabledDate = (current: Dayjs): boolean => {
      return current && current < dayjs().endOf('day').add(-1, 'day')
    }
    const range = (start: number, end: number): number[]=> {
      // 生成禁用范围数组
      const result = [];
      for (let i = start; i < end; i++) result.push(i);
      return result;
    }
    const disabledTime = (current: Dayjs): {
      disabledHours: () => number[];
      disabledMinutes?: () => number[];
      disabledSeconds?: () => number[];
    } | object=> {
      if (!current) return {};

      if (current && dayjs(current).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
        // 如果是今天，禁用当前时间之前的小时、分钟、秒
        const now = dayjs();
        return {
          disabledHours: () => range(0, now.hour()),
          disabledMinutes: () =>
            current.hour() === now.hour() ? range(0, now.minute()) : [],
          disabledSeconds: () =>
            current.hour() === now.hour() && current.minute() === now.minute()
              ? range(0, now.second())
              : []
        };
      }
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => []
      }
    }

    const formSchema = [
      {
        fieldName: 'name',
        label: '计划名称',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <PlanNameInput
          {...props} checkNameApi={async (params: unknown) => {
            const payload = params as { planName: string; }
            return cubeDailyInspectionService.checkPlanNameRepeat({
              planName: payload.planName,
              businessType: InspectBusinessType.SMALL_ENGINEERING
            })
          }}
        />,

      },
      {
        fieldName: 'beginTime',
        label: '计划开始时间',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <DatePicker disabledTime={disabledTime} {...props} disabledDate={disabledDate} showTime={ { format: 'YYYY-MM-DD HH:mm:ss' } } valueFormat='YYYY-MM-DD HH:mm:ss' />,
      },
      {
        fieldName: 'endTime',
        label: '计划结束时间',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <DatePicker {...props} showTime={ { format: 'YYYY-MM-DD HH:mm:ss' } } valueFormat='YYYY-MM-DD HH:mm:ss' />,
      },
      {
        fieldName: 'level',
        label: '巡检级别',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <InspectLevelSelect
          {...props}
        />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.level ? formState.level === 'GENERAL' ? '紧急' : '普通' : '--'}</span>
        }
      },
      {
        fieldName: 'typeId',
        label: '巡查类型',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <CubeSelect
          {...props} optionsFetchApi={async () => {
            return cubeDailyInspectionService.getInspectTypeList({
              businessType: InspectBusinessType.SMALL_ENGINEERING
            })
          }}
        />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.typeName}</span>
        }
      },
      {
        fieldName: 'receiveType',
        label: '负责人',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <PersonLiableSelect {...props} />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.receiveNames}</span>
        }
      },
      {
        fieldName: 'method',
        label: '扫码巡查',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <Switch {...props} checkedValue='SCAN_CODE' unCheckedValue='' />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.method ? '是' : '否'}</span>
        }
      },
      {
        fieldName: 'limitTimeJson',
        label: '任务时限',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <TaskTimeLimit {...props} />,
        customRender: (formState: Record<string, unknown>): JSX.Element | string => {
          if (!formState.limitTimeJson) return '--'
          const limitTime = JSON.parse(formState.limitTimeJson as string)
          return <span>{limitTime.day}天{limitTime.hour}小时{limitTime.minute}分钟</span>
        }
      },
      {
        fieldName: 'cycle',
        label: '周期巡查',
        span: 12,
        FormComponent: (props: Record<string, unknown>): JSX.Element => <TaskCreateCycle
          {...props}
          cycleOptionsApi={async () => {
            return cubeDailyInspectionService.getInspectPeriodList({
              businessType: InspectBusinessType.SMALL_ENGINEERING
            })
          }}
        />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          if (!formState.cycle){
            return <span>立即执行</span>
          }
          const executeOption = executeCycleOptions.find(item=>item.value === formState.cycleType)
          if (!executeOption){
            return <span>立即执行</span>
          }
          const cornJson = formState.cronName ? JSON.parse(formState.cronName as string) : null
          if (!cornJson){
            return <span>立即执行</span>
          }
          const selection = cornJson.selection.split(',')
          if (executeOption.value === 'EVERY_WEEK' && Array.isArray(selection)){
            const executeSelection = weekCycleOptions.filter(item=>selection.includes(item.value)).map(item=>item.label).join(',')
            return <span>{executeOption.label}：{executeSelection}：{formState.hour} </span>
          }
          if (executeOption.value === 'EVERY_MONTH' && Array.isArray(selection)){
            const selectionValue = selection.join(',')
            return <span>{executeOption.label}：{selectionValue}号：{formState.hour}</span>
          }
          return <span>{executeOption.label}:{formState.hour}</span>
        }
      },
      {
        fieldName: 'remark',
        label: '备注',
        span: 24,
        FormComponent: (props: Record<string, unknown>): JSX.Element=> <Textarea {...props} />,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.remark || '--'}</span>
        }
      },

    ]
    const rules = {
      name: [
        { required: true, message: '请输入计划名称' },
        { message: '名称不超过32个字', pattern: /^.{1,32}$/g },
      ],
      beginTime: [
        { required: true, message: '请选择计划开始时间' },
        { validator: async (rule: unknown, value: unknown): Promise<Error | void>=>{
          if (state.formState.endTime && (state.formState.endTime as string) < (value as string)) {
            return Promise.reject(new Error('计划开始时间不能大于计划结束时间'))
          }
          return Promise.resolve()
        } }
      ],
      endTime: [
        { validator: async (rule: unknown, value: unknown): Promise<Error | void>=>{
          if (!value){
            return Promise.resolve()
          }
          if (state.formState.beginTime && (state.formState.beginTime as string) > (value as string)) {
            return Promise.reject(new Error('计划结束时间不能小于计划开始时间'))
          }
          return Promise.resolve()
        } },
      ],
      level: [
        { required: true, message: '请选择紧急程度' },
      ],
      receiveType: [
        { required: true, message: '请选择负责人' },
        {
          validator: async (rule: unknown, value: unknown): Promise<Error | void> => {
            if (value === '1' && (state.formState.receiveIds as string[]).length === 0) {
              return Promise.reject(new Error('请选择负责人'))
            } if (value === '2') {
              if (!state.formState.receiveDeptIds && !state.formState.receivePostIds && !state.formState.receiveRoleIds) {
                return Promise.reject(new Error('请选择负责人部门'))
              }
            }
            return Promise.resolve()
          }
        }
      ],
      cycle: [
        {
          validator: async (rule: unknown, value: boolean): Promise<Error | void> => {
            if (value) {
              if (!state.formState.cronId) {
                return Promise.reject(new Error('请选择循环周期'))
              }
              if (state.formState.cronId === 'custom') {
                if (!state.formState.cycleType) {
                  return Promise.reject(new Error('请选择自定义执行周期'))
                }
                if (!state.formState.selection) {
                  return Promise.reject(new Error('请选择自定义执行周期时间'))
                }
                if (!state.formState.hour) {
                  return Promise.reject(new Error('请选择自定义执行周期小时'))
                }
              }
            }
            return Promise.resolve()
          }
        }
      ],
      typeId: [{ required: true, message: '请选择巡检类型', trigger: 'blur' }],
      limitTimeJson: [
        // 请填写任务时限
        { required: true, message: '请填写任务有效期' },
      ],
    }
    const EditForm = (props: { span?: number; }): JSX.Element => (
      <Form
        ref={formRef}
        model={state.formState} rules={rules}
        layout='inline' labelCol={{
          style: {
            width: '120px'
          }
        }}
      >
        <Row gutter={[8 * 12, 12]} style={{ width: '100%' }}>
          {
            formSchema.map((item) => {
              return (
                <Col key={item.fieldName} xxl={item.span || props.span || 8} xl={12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem label={item.label} name={item.fieldName}>{item.FormComponent({
                    value: state.formState[item.fieldName],
                    'onUpdate:value': (val: unknown): void => {
                      state.formState[item.fieldName] = val
                    },
                    receiveIds: state.formState.receiveIds,
                    'onUpdate:receiveIds': (val: unknown): void => {
                      state.formState.receiveIds = val
                    },
                    receiveDeptIds: state.formState.receiveDeptIds,
                    'onUpdate:receiveDeptIds': (val: unknown): void => {
                      state.formState.receiveDeptIds = val
                    },
                    receivePostIds: state.formState.receivePostIds,
                    'onUpdate:receivePostIds': (val: unknown): void => {
                      state.formState.receivePostIds = val
                    },
                    receiveRoleIds: state.formState.receiveRoleIds,
                    'onUpdate:receiveRoleIds': (val: unknown): void => {
                      state.formState.receiveRoleIds = val
                    },
                    cronId: state.formState.cronId,
                    'onUpdate:cronId': (val: unknown): void => {
                      state.formState.cronId = val
                    },
                    cycleType: state.formState.cycleType,
                    'onUpdate:cycleType': (val: unknown): void => {
                      state.formState.cycleType = val
                    },
                    selection: state.formState.selection,
                    'onUpdate:selection': (val: unknown): void => {
                      state.formState.selection = val
                    },
                    hour: state.formState.hour,
                    'onUpdate:hour': (val: unknown): void => {
                      state.formState.hour = val
                    }
                  })}
                  </FormItem>
                </Col>
              )
            })
          }
        </Row>
      </Form>
    )
    const handleSubmit = async (): Promise<Record<string, unknown>> => {
      await formRef.value?.validate()
      return state.formState
    }
    watch(() => props.initFormState, () => {
      if (Object.keys(props.initFormState).length > 0) {
        const cornJson = props.initFormState.cronName ? JSON.parse(props.initFormState.cronName) : {}
        state.formState = {
          ...props.initFormState,
          beginTime: props.initFormState.validBeginTime ? dayjs(props.initFormState.validBeginTime).format('YYYY-MM-DD HH:mm:ss') : null,
          endTime: props.initFormState.validEndTime ? dayjs(props.initFormState.validEndTime).format('YYYY-MM-DD HH:mm:ss') : null,
          receiveIds: (props.initFormState as unknown as Record<string, string>).receiveIds.split(',') || [],
          ...cornJson,
          selection: cornJson.selection ? cornJson.selection.split(',') : [],
          cronId: !props.initFormState.cronId ? cornJson.type : !props.initFormState.cronId
        }
      }
    })
    const route = useRoute()
    expose({
      handleSubmit
    })
    const FieldComponent = (props: { label: string;fieldName: string; span?: number; customRender: ((value: Record<string, unknown>) => VNode | string) | undefined; }): VNode => (
      <Col xxl={props.span || 8} xl={8} lg={8} md={12} sm={12} xs={24}>
        <div class={styles['item-content']}>
          <label>{props.label}：</label>
          <span>{props.customRender ? props.customRender(state.formState) : state.formState[props.fieldName]}</span>
        </div>
      </Col>
    )
    const InfoForm = (): VNode => (
      <div class={styles.container}>
        <Row gutter={[0, 32]}>
          {formSchema.map(item => {
            return (
              <FieldComponent span={8} fieldName={item.fieldName} key={item.fieldName} customRender={item.customRender} label={item.label} />
            )
          })}
        </Row>
      </div>

    )

    return (): JSX.Element => (
      <>
        {route.query.type !== 'info' && <EditForm span={8} />}
        {route.query.type === 'info' && <InfoForm />}
      </>
    )
  }
})
