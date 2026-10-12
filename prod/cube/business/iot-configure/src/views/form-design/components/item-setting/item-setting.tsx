import { Button, Card, Form, FormItem, Input, Select, Space } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch } from 'vue'
import styles from './item-setting.module.less'
import { useFormDesignStore } from '@/pinia-store/form-design'
import { Empty, Modal } from 'ant-design-vue'
import { DefaultValue } from './components/default-value/default-value'
import { dataTypeOptions } from '../../core/widget'
import RadioGroup from '@ghcloud/cube-ui/src/components/radio-group/radio-group'
import { OptionsSetting } from './components/options-setting/options-setting'
import { WidgetUI } from '../../core/widget-ui/widget-ui'

/** 表单项参数面板 */
export const ItemSetting = defineComponent({
  setup () {
    const { formDesign } = useFormDesignStore()
    const conditionVisible = ref(false)
    const conditionModalTitle = ref('')

    watch(()=>formDesign.formItemSelect?.key, ()=>{
      if (formDesign.formItemSelect && !formDesign.formItemSelect?.condition){
        formDesign.formItemSelect.condition = { type: 'ALWAYS' };
      }
    }, { immediate: true })

    return (): JSX.Element =>
      <Card title='表单项' class={styles['widget-panel']}>
        {
          !formDesign.formItemSelect
            ? <Empty />
            :
            <Form>
              <FormItem label='表单项名称'>
                <Input v-model:value={formDesign.formItemSelect.label} />
              </FormItem>
              <FormItem label='对应Code'>
                <Input v-model:value={formDesign.formItemSelect.props.code} />
              </FormItem>
              <FormItem label='数据类型' v-show={formDesign.formItemSelect.name !== 'textAlert'}>
                <Select options={dataTypeOptions} v-model:value={formDesign.formItemSelect.props.dataType} onChange={()=>{
                  formDesign.formItemSelect && (formDesign.formItemSelect.props.value = undefined)
                }} />
              </FormItem>
              <FormItem label='提示词' v-show={formDesign.formItemSelect.name !== 'textAlert'}>
                <Input v-model:value={formDesign.formItemSelect.props.placeholder} />
              </FormItem>
              {
                ['select', 'radioGroup', 'checkboxGroup'].includes(formDesign.formItemSelect.name) &&
                <FormItem label='选项'>
                  <OptionsSetting />
                </FormItem>
              }
              <FormItem label='是否必填' v-show={formDesign.formItemSelect.name !== 'textAlert'}>
                <RadioGroup options={[{ label: '是', value: true }, { label: '否', value: false }]} v-model:value={formDesign.formItemSelect.props.required} />
              </FormItem>
              <FormItem label='默认值'>
                <DefaultValue />
              </FormItem>
              <FormItem label='显示条件'>
                <Space>
                  <span>
                    {
                      formDesign.formItemSelect?.condition?.type === 'CONDITION' ? '条件显示' : '总是显示'
                    }
                  </span>
                  <Button type='primary' ghost onClick={()=>{
                    if (!formDesign.formItemSelect){
                      return
                    }
                    if (!formDesign.formItemSelect?.condition){
                      formDesign.formItemSelect.condition = { type: 'ALWAYS' };
                    }
                    conditionModalTitle.value = formDesign.formItemSelect?.label + '的显示条件'
                    conditionVisible.value = true
                  }}>设置</Button>
                </Space>
              </FormItem>

              <Modal title={conditionModalTitle.value} v-model:visible={conditionVisible.value} footer={null} centered width={1000}>
                {
                  formDesign.formItemSelect.condition &&
                    <>
                      <RadioGroup
                        style={{ marginBottom: '10px', display: 'block' }}
                        options={[{ label: '总是显示', value: 'ALWAYS' }, { label: '条件显示', value: 'CONDITION' }]}
                        v-model:value={formDesign.formItemSelect.condition.type}
                        onChange={() => {
                          if (formDesign.formItemSelect && formDesign.formItemSelect.condition) {
                            formDesign.formItemSelect.condition.value = [undefined, 'EQ', undefined];
                          }
                        }}
                      />
                      {
                        formDesign.formItemSelect.condition.type === 'CONDITION' &&
                        <>
                          <Space>
                            <span>当表单项</span>
                            <Select
                              style={{ width: '100px' }}
                              options={formDesign.formList.filter(e => e.key !== formDesign.formItemSelect?.key)}
                              fieldNames={{ label: 'label', value: 'key' }}
                              v-model:value={formDesign.formItemSelect.condition.value![0]}
                              onChange={(val) => {
                                if (formDesign.formItemSelect && formDesign.formItemSelect.condition){
                                  formDesign.formItemSelect.condition.value = [val, 'EQ', undefined]
                                }
                              }}
                            />
                            <span>的值</span>
                            <Select
                              style={{ width: '100px' }}
                              options={[
                                { label: '等于', value: 'EQ' },
                                { label: '不等于', value: 'NEQ' },
                                { label: '包含', value: 'IN' },
                                { label: '不包含', value: 'NOT_IN' }
                              ]}
                              v-model:value={formDesign.formItemSelect.condition.value![1]}
                            />
                            {
                              formDesign.formList.find(e=>e.key === formDesign.formItemSelect?.condition.value?.[0]) &&
                              <>
                                <WidgetUI
                                  style={{ minWidth: '220px' }}
                                  formItem={formDesign.formList.find(e=>e.key === formDesign.formItemSelect?.condition.value?.[0])}
                                  v-model:value={formDesign.formItemSelect.condition.value![2]}
                                />
                                <span>时显示</span>
                              </>
                            }
                          </Space>
                          <p>{JSON.stringify(formDesign.formItemSelect?.condition?.value)}</p>
                        </>
                      }
                    </>
                }
              </Modal>

            </Form>
        }
      </Card>
  }
})
