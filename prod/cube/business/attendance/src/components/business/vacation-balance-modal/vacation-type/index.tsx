import { getHolidayRuleNotLimit } from '@/api/staff-leave'
import { CheckboxGroup, Form, FormItem, type FormExpose } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'

export interface HolidayRule {
  name: string; unit: string; id: string;
}
interface Props {
  value: string[];
  title: string;
}

export const VacationType = defineComponent({
  props: ['value', 'title'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit, expose }) => {
    const formRef = ref<FormExpose>()
    const formState = reactive({
      holidayIdList: undefined
    })
    const formRules = {
      holidayIdList: [{ required: true, message: '请选择假期类型', trigger: 'blur' }],
    }
    const vacationTypeOptions = ref<{ label: string; value: string; }[]>([])
    const getVacationType = async (): Promise<void> => {
      try {
        const res = await getHolidayRuleNotLimit()
        if (res.data) {
          vacationTypeOptions.value = res.data && Array.isArray(res.data)
            ? res.data.map((item: HolidayRule) => {
              return {
                label: item.name,
                value: item.id
              }
            })
            : []
        }
      } catch (error) {
      }
    }
    onMounted(() => {
      getVacationType()
    })
    expose({
      formRef
    })
    return (): VNode =>
      <>
        <Form ref={formRef} model={formState} labelCol={{ style: { width: '80px' } }} rules={formRules}>
          <FormItem label='假期类型' name='holidayIdList' style={{ paddingTop: '10px' }}>
            <CheckboxGroup
              v-model:value={formState.holidayIdList}
              options={vacationTypeOptions.value}
              onChange={(val: string[]) => {
                emit('update:value', val)
                const list = vacationTypeOptions.value.filter(item => val.includes(item.value))
                emit('change', list)
              }}
            />
          </FormItem>
        </Form>
      </>
  }
})
