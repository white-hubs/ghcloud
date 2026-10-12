import { defineComponent, reactive, watch, type VNode } from 'vue'
import { Row, Col} from '@ghcloud/cube-ui'
import styles from './basic-info.module.less'
import dayjs from 'dayjs'

export const BasicInfo = defineComponent({
  props: {
    initFormState: {
      type: Object,
      default: () => ({})
    }
  },
  setup: (props) => {
    const state = reactive<{
      formState: Record<string, unknown>;
    }>({
      formState: {
        id: '',
        targetId: '',
        targetName: '',
        targetCategory: '',
        areaName: '',
        organizationName: '',
        time: 0,
        result: '',
        dailyNum: 0,
        dailyErrNum: 0,
        dailyList: [],
        temporaryNum: 0,
        temporaryErrNum: 0,
        temporaryList: []
      }
    })
    const detailsSchema = [
      {
        fieldName: 'targetName',
        label: '对象名称',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState?.targetName || '--'}</span>
        }
      },
      {
        fieldName: 'targetCategory',
        label: '对象类型',
        customRender: (formState: Record<string, unknown>): JSX.Element | string => {
          const obj: Record<string, string> = {
            DEVICE: '设备',
            STALL: '档位',
            PROPERTY: ' 资产',
            SITE_POINT: '现场点',
            RISK_SOURCE: '风险源',
            SMALL_ENGINEERING: '小散工程',
          }
          const value = formState?.targetCategory as string;
          return (
            <span>{value ? obj[value] : '--'}</span>
          )
        }
      },
      {
        fieldName: 'areaName',
        label: '所在区域',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState?.areaName || '--'}</span>
        }
      },
      {
        fieldName: 'organizationName',
        label: '所属部门',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState?.organizationName || '--'}</span>
        }
      },
      {
        fieldName: 'time',
        label: '最后一次巡检时间',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          const value = formState?.time ? dayjs(formState?.time as string).format('YYYY-MM-DD HH:mm:ss') : "--";
          return <span>{value}</span>
        }
      },
      {
        fieldName: 'result',
        label: '最近一次巡检结果',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <>
           {formState?.result ? (formState?.result === 'NORMAL' ? <span>正常</span> : <span style={{ color: '#ff4158'}}>异常</span>) : '--'}
          </>
        }
      },
    ]
    watch(() => props.initFormState, () => {
      if (Object.keys(props.initFormState).length > 0) {
        state.formState = {
          ...props.initFormState,
        }
      }
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
        <InfoForm />
      </>
    )
  }
})
