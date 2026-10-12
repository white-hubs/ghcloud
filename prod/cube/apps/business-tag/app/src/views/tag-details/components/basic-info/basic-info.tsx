import { defineComponent, reactive, watch, type VNode } from 'vue'
import { Row, Col } from '@ghcloud/cube-ui'
import styles from './basic-info.module.less'
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
      formState: {}
    })
    const formSchema = [
      {
        fieldName: 'name',
        label: '标签名称',
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.name || '--'}</span>
        }
      },
      {
        fieldName: 'description',
        label: '标签描述',
        span: 24,
        customRender: (formState: Record<string, unknown>): JSX.Element => {
          return <span>{formState.description || '--'}</span>
        }
      },
    ]

    watch(() => props.initFormState, () => {
      state.formState = {
          ...props.initFormState,
        }
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
        <InfoForm />
      </>
    )
  }
})
