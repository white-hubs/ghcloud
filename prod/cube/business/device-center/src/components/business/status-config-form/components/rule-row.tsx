import { defineComponent, type PropType } from 'vue'
import { FormItem, Select, Button, Row, Col } from '@ghcloud/cube-ui'
import type { CompareType, ProductProp } from '@ghcloud/cube-iot-center-service'
import type { Rule } from '../types'
import styles from '../status-config-form.module.less'

export const RuleRow = defineComponent({
  name: 'RuleRow',
  props: {
    rule: {
      type: Object as PropType<Rule>,
      required: true
    },
    configIndex: {
      type: Number,
      required: true
    },
    ruleIndex: {
      type: Number,
      required: true
    },
    propertyOptions: {
      type: Array as PropType<ProductProp[]>,
      default: () => []
    },
    operatorOptions: {
      type: Array as PropType<CompareType[]>,
      default: () => []
    },
    getFieldStatus: {
      type: Function as PropType<(fieldName: string) => { validateStatus: string; help: string; }>,
      required: true
    },
    onPropertyChange: {
      type: Function as PropType<() => void>,
      required: true
    },
    onChange: {
      type: Function as PropType<() => void>,
      required: true
    },
    onRemove: {
      type: Function as PropType<() => void>,
      required: true
    },
    renderValueInput: {
      type: Function as PropType<() => JSX.Element | null>,
      required: true
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <Row class={styles.ruleRow}>
        <Col span={4}>
          <FormItem
            name={`statusConfigs.${props.configIndex}.conditions.rules.${props.ruleIndex}.property`}
            {...props.getFieldStatus(`statusConfigs.${props.configIndex}.conditions.rules.${props.ruleIndex}.property`)}
          >
            <Select
              v-model:value={props.rule.property}
              options={props.propertyOptions}
              placeholder="请选择属性"
              onChange={props.onPropertyChange}
              style={{ width: '100%' }}
              fieldNames={{ label: 'name', value: 'propCode' }}
              allowClear
            />
          </FormItem>
        </Col>
        <Col span={4}>
          <FormItem
            name={`statusConfigs.${props.configIndex}.conditions.rules.${props.ruleIndex}.operator`}
            {...props.getFieldStatus(`statusConfigs.${props.configIndex}.conditions.rules.${props.ruleIndex}.operator`)}
          >
            <Select
              v-model:value={props.rule.operator}
              options={props.operatorOptions}
              placeholder="请选择操作符"
              onChange={props.onChange}
              style={{ width: '100%' }}
              fieldNames={{ label: 'itemLabel', value: 'itemValue' }}
              allowClear
            />
          </FormItem>
        </Col>
        <Col span={4}>
          {props.renderValueInput()}
        </Col>
        <Col span={4} class={styles.deleteButtonCol}>
          <Button type="link" danger class={styles.deleteButton} onClick={props.onRemove}>删除</Button>
        </Col>
      </Row>
    )
  }
})