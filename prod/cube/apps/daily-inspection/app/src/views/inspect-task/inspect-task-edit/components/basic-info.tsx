import { defineComponent, reactive, ref, watch, type VNode } from 'vue'
import { Form, FormItem, Row, Col, Switch, Textarea, type FormInstance } from '@ghcloud/cube-ui'
import { PlanNameInput, TaskTimeLimit, PersonLiableSelect, CubeSelect, InspectLevelSelect, PersonLiableSelectCheck } from '@ghcloud/cube-app-design'
import { cubeDailyInspectionService } from '@/api/server'
import { useRoute } from 'vue-router'
import styles from './basic-info.module.less'
import dayjs from 'dayjs'
import { taskStatusOptions } from '@ghcloud/cube-daily-inspection-service'

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
        checkUserType:'1',    
        checkUserIds: [],
        checkRoleIds: null,
        checkPostIds: null,
        checkDeptIds: null,
        limitTimeJson: '',
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
    const formSchema = ref( [
      {
        fieldName: 'name',
        label: '任务名称',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <PlanNameInput
          {...props} checkNameApi={async (params: unknown) => {
            const payload = params as { planName: string; }
            return cubeDailyInspectionService.checkPlanNameRepeat({
              planName: payload.planName
            })
          }}
        />,

      },
      {
        fieldName: 'typeId',
        label: '巡查类型',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <CubeSelect
          {...props} optionsFetchApi={async () => {
            return cubeDailyInspectionService.getInspectTypeList()
          }}
        />,
      },
      {
        fieldName: 'level',
        label: '巡检级别',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <InspectLevelSelect
          {...props}
        />,
      },
      {
        fieldName: 'receiveType',
        label: '负责人',
        span: 24,
        FormComponent: (props: Record<string, unknown>): JSX.Element => <PersonLiableSelect {...props} />,
      },
      // {
      //   fieldName: 'isSplit',
      //   label: '是否需要拆解任务',
      //   FormComponent: (props: Record<string, unknown>): JSX.Element => <Switch {...props}/>,
      // },
      {
        fieldName: 'isCheck',
        label: '是否需要稽查',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <Switch onChange={(value)=>{
            if(value){
              formSchema.value.push(      
                {
              fieldName: 'checkUserType',
              label: '稽查人',
              span: 24,
              FormComponent: (props: Record<string, unknown>): JSX.Element => <PersonLiableSelectCheck {...props} />,
              // customRender: (formState: Record<string, unknown>): JSX.Element => {
              //   return <span>{formState.receiveNames}</span>
              // }
            },)
            }else{
              formSchema.value.splice(formSchema.value.length-1,1)
            }
            
          }}  {...props}/>,
      },
      {
        fieldName: 'method',
        label: '扫码巡查',
        FormComponent: (props: Record<string, unknown>): JSX.Element => <Switch {...props} checkedValue='SCAN_CODE' unCheckedValue='' />,
      },
      {
        fieldName: 'limitTimeJson',
        label: '任务有效期',
        span:24,
        FormComponent: (props: Record<string, unknown>): JSX.Element => <TaskTimeLimit {...props} />,
      },
      {
        fieldName: 'remark',
        label: '备注',
        span: 24,
        FormComponent: (props: Record<string, unknown>): JSX.Element => <Textarea {...props} />
      },
 
    ])
    const detailsSchema = [
      // {
      //   fieldName: 'tenant',
      //   label: '编号',
      // },
      {
        fieldName: 'name',
        label: '任务名称',
      },
      {
        fieldName: 'planName',
        label: '所属计划',
        customRender: (formState: Record<string, unknown>): JSX.Element | string => {
          const value = formState.planName;
          if (!value) {
            return '--'
          }
          return (
            <a onClick={() => {
              history.pushState({}, '', `/portal/daily-inspection/inspect-plan-edit?type=info&id=${formState.planId}`)
            }}
            >{value || '--'}
            </a>
          )
        }
      },
      {
        fieldName: 'publisherName',
        label: '发布人',
      },
      {
        fieldName: 'typeName',
        label: '巡查类型',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.typeName || '--'}</span>
        }
      },
      {
        fieldName: 'level',
        label: '巡检级别',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.level === 'GENERAL' ? '紧急' : '普通  '}</span>
        }
      },
      {
        fieldName: 'receiveNames',
        label: '执行人',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.receiveNames}</span>
        }
      },
      {
        fieldName: 'updateTime',
        label: '发布时间',
        customRender: (formState: Record<string, string>): JSX.Element => {
          return <span>{dayjs(formState.updateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        }
      },
      {
        fieldName: 'validEndTime',
        label: '截止时间',
        customRender: (formState: Record<string, string>): JSX.Element => {
          return <span>{dayjs(formState.validEndTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        }
      },
      {
        fieldName: 'limitTimeJson',
        label: '任务有效期',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          try {
            if (!formState.limitTimeJson) return <span>--</span>;
            const timeLimit = JSON.parse(formState.limitTimeJson as string);
            const { day = 0, hour = 0, minute = 0 } = timeLimit;
            const parts: string[] = [];
            if (day > 0) parts.push(`${day}天`);
            if (hour > 0) parts.push(`${hour}小时`);
            if (minute > 0) parts.push(`${minute}分钟`);
            return <span>{parts.length > 0 ? parts.join('') : '--'}</span>;
          } catch {
            return <span>{formState.limitTimeJson ?? '--'}</span>;
          }
        },
      },
      {
        fieldName: 'targetNum',
        label: '巡检对象数',
      },
      {
        fieldName: 'status',
        label: '任务状态',
        customRender: (formState: Record<string, string>): JSX.Element => {
          return <span>{taskStatusOptions[formState.status as keyof typeof taskStatusOptions]}</span>
        }
      },
      { label: '协同人', fieldName: 'assistNames' },
    ]
    const rules = {
      name: [
        { required: true, message: '请输入计划名称' },
        { message: '名称不超过32个字', pattern: /^.{1,32}$/g },
      ],
      level: [
        { required: true, message: '请选择巡检级别' },
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
        checkUserType: [
        { required: true, message: '请选择稽查人' },
        {
          validator: async (rule: unknown, value: unknown): Promise<Error | void> => {
            if (value === '1' && (state.formState.checkUserIds as string[]).length === 0) {
              return Promise.reject(new Error('请选择稽查人'))
            } if (value === '2') {
              if (!state.formState.checkRoleIds && !state.formState.checkPostIds && !state.formState.checkDeptIds) {
                return Promise.reject(new Error('请选择稽查人部门'))
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
        <Row gutter={[ 12, 12]} style={{ width: '100%' }}>
          {
            formSchema.value.map((item) => {
              const isPersonField = item.fieldName === 'receiveType' || item.fieldName === 'checkUserType'
              const renderedField = item.FormComponent({
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
                checkUserIds: state.formState.checkUserIds,
                'onUpdate:checkUserIds': (val: unknown): void => {
                  state.formState.checkUserIds = val
                },
                checkPostIds: state.formState.checkPostIds,
                'onUpdate:checkPostIds': (val: unknown): void => {
                  state.formState.checkPostIds = val
                },
                checkDeptIds: state.formState.checkDeptIds,
                'onUpdate:checkDeptIds': (val: unknown): void => {
                  state.formState.checkDeptIds = val
                },
                checkRoleIds: state.formState.checkRoleIds,
                'onUpdate:checkRoleIds': (val: unknown): void => {
                  state.formState.checkRoleIds = val
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
              })
              return (
                <Col key={item.fieldName} xxl={item.span || props.span || 8} xl={item.span ?? 12} lg={24} md={24} sm={24} xs={24}>
                  <FormItem 
                    label={item.label}
                    name={item.fieldName} 
                    style={{
                      display: "flex",
                      alignItems: "start",
                      flexWrap: "nowrap",
                    }}
                  >{isPersonField ? <div class={styles['person-select-wrap']}>{renderedField}</div> : renderedField}
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
        const formState = props.initFormState as Record<string, any>
        state.formState = {
          ...formState,
          beginTime: formState.validBeginTime ? dayjs(formState.validBeginTime).format('YYYY-MM-DD HH:mm:ss') : '',
          endTime: formState.validEndTime ? dayjs(formState.validEndTime).format('YYYY-MM-DD HH:mm:ss') : '',
          receiveIds: formState.receiveIds ? (formState.receiveIds as string).split(',') : [],
          checkUserIds: formState.checkUserIds ? (formState.checkUserIds as string).split(',') : [],
        }
      }
    }, { deep: true, immediate: true })
    const route = useRoute()
    expose({
      handleSubmit
    })
    const FieldComponent = (props: { label: string;fieldName: string; span?: number; customRender: ((value: Record<string, string>) => VNode | string) | undefined; }): VNode => (
      <Col xxl={props.span || 8} xl={8} lg={8} md={12} sm={12} xs={24}>
        <div class={styles['item-content']}>
          <label>{props.label}：</label>
          <span>{props.customRender ? props.customRender(state.formState as unknown as Record<string, string>) : (state.formState[props.fieldName] || '--')}</span>
        </div>
      </Col>
    )
    const InfoForm = (): VNode => (
      <div class={styles.container}>
        <Row gutter={[0, 32]}>
          {detailsSchema.map(item => {
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
