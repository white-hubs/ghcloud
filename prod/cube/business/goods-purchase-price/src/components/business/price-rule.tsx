import { Button, Col, Form, FormItem, InputNumber, Row, Select, TreeSelect } from '@ghcloud/cube-ui'
import { defineComponent, type PropType, ref, onMounted, reactive } from 'vue'
import '@/styles/common.less'
import { getCategoryTree } from '@/api/price-plan'
import type { FormExpose, RuleObject } from '@ghcloud/cube-ui/src/components/form/form'
interface RuleState {
  goodsCategoryIds?: string[] | number[] | undefined;
  priceType?: string | undefined;
  compareCondition?: string | undefined;
  compareValue?: number | undefined;
  goodsCategoryNames?: string[] | undefined;
}
export const PriceRule = defineComponent({
  props: {
    ruleArr: {
      type: Array<RuleState>,
      default: () => []
    },
    ruleData: {
      type: Object as PropType<RuleState>,
      default: () => ({})
    },
    isDetail: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:value'],
  setup: (props, { expose }) => {
    const categoryOptions = ref([])
    const getCategoryOption = async (): Promise<void> => {
      const { data } = await getCategoryTree({})
      categoryOptions.value = data
    }
    onMounted(async () => {
      await getCategoryOption()
    })
    const compareConditionOptions = ref([
      { label: '>', value: '>' },
      { label: '>=', value: '>=' },
      { label: '<', value: '<' },
      { label: '<=', value: '<=' },
      { label: '==', value: '==' },
    ])
    const priceTypeOptions = ref([
      { label: '最高价', value: 'MAX' },
      { label: '中间价', value: 'MID' },
      { label: '最低价', value: 'MIN' },
      { label: '最高价较上一次涨幅', value: 'MAX_INCREASE' },
      { label: '中间价较上一次涨幅', value: 'MID_INCREASE' },
      { label: '最低价较上一次涨幅', value: 'MIN_INCREASE' },
      { label: '最低价较上一次跌幅', value: 'MAX_DECREASE' },
      { label: '中间价较上一次跌幅', value: 'MID_DECREASE' },
      { label: '最高价较上一次跌幅', value: 'MIN_DECREASE' },
    ])
    const formRef = ref<FormExpose>()
    const dynamicValidateForm = reactive<{ ruleList: RuleState[]; }>({
      ruleList: props.ruleArr
    })
    const formRules: Record<string, RuleObject[]> = {
      goodsCategoryIds: [{ required: true, message: '请选择采价商品品类', trigger: 'change' }],
      priceType: [{ required: true, message: '请选择价格', trigger: 'change' }],
      compareCondition: [{ required: true, message: '请选择条件', trigger: 'change' }],
      compareValue: [{ required: true, message: '请输入价格', trigger: 'change' }],
    }
    const removeRule = (item: RuleState) => {
      const index = dynamicValidateForm.ruleList.indexOf(item)
      if (index !== -1) {
        dynamicValidateForm.ruleList.splice(index, 1)
      }
    }
    const addRule = async (): Promise<void> => {
      dynamicValidateForm.ruleList.push({
        goodsCategoryIds: [],
        priceType: undefined,
        compareCondition: undefined,
        compareValue: undefined,
      })
    }
    const validateForm = async (): Promise<unknown> => {
      try {
        return formRef.value?.validate()
      } catch {
      }
    }
    const resetForm = async (): Promise<void> => {
      try {
        formRef.value?.resetFields()
      } catch {
      }
    }
    expose({
      validateForm,
      resetForm,
      addRule
    })
    return (): JSX.Element => {
      return (
        <>
          {
            !props.isDetail && <Button class='rule-add' type='link' onClick={() => {
              addRule()
            }}>添加</Button>
          }
          <Form
            ref={formRef} model={dynamicValidateForm} labelCol={{ style: { width: '80px' } }}
            style='width: 100%;overflow: hidden;'
          >
            {
              dynamicValidateForm.ruleList.map((rule, index) => {
                return (
                  <Row gutter={16}>
                    <Col span={6}>
                      <FormItem label='品类' name={['ruleList', index, 'goodsCategoryIds']} rules={formRules.goodsCategoryIds}>
                        {
                          props.isDetail
                            ? <span>{rule.goodsCategoryNames ? rule.goodsCategoryNames?.toString() : '--'}</span>
                            : <TreeSelect
                              class='rule-item w-180'
                              showSearch
                              treeNodeFilterProp='name'
                              v-model:value={rule.goodsCategoryIds} treeData={categoryOptions.value} treeCheckStrictly fieldNames={{ label: 'name', value: 'id', children: 'children' }} placeholder='请选择采价商品品类'
                            />
                        }
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label='价格类型' name={['ruleList', index, 'priceType']} rules={formRules.priceType}>
                        {
                          props.isDetail
                            ? <span>{priceTypeOptions.value.find(e => e.value === rule.priceType)?.label ?? '--'}</span>
                            : <Select class='rule-item' v-model:value={rule.priceType} options={priceTypeOptions.value} placeholder='请选择价格类型' />
                        }
                      </FormItem>
                    </Col>
                    <Col span={6}>
                      <FormItem label='条件' name={['ruleList', index, 'compareCondition']} rules={formRules.compareCondition}>
                        {
                          props.isDetail
                            ? <span>{compareConditionOptions.value.find(e => e.value === rule.compareCondition)?.label ?? '--'}</span>
                            : <Select class='rule-item' v-model:value={rule.compareCondition} options={compareConditionOptions.value} placeholder='请选择条件' />
                        }
                      </FormItem>
                    </Col>
                    <Col span={6} style='display:flex;'>
                      <FormItem label='价格' name={['ruleList', index, 'compareValue']} rules={formRules.compareValue}>
                        {
                          props.isDetail
                            ? <span>{rule.compareValue?.toFixed(2) ?? '--'}</span>
                            : <InputNumber class='rule-item w-180' precision={2} v-model:value={rule.compareValue} placeholder='请输入价格' />
                        }
                      </FormItem>
                      {
                        !props.isDetail && <Button type='link' danger onClick={() => {
                          removeRule(rule)
                        }}>删除</Button>
                      }
                    </Col>
                  </Row>
                )
              })
            }
          </Form>
        </>
      )
    }
  }
})
