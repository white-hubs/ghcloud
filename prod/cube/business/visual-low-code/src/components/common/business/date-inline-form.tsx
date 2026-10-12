import { defineComponent, type PropType } from 'vue'
import { Form, FormItem, Select } from '@ghcloud/visual-view-ui'
import '@/components/common/business/style/sub-panel-template.less'
interface ModelValueItf {
  timeType: string;
  dateRange: string[];
}
export default defineComponent({
  name: 'DateInlineForm',
  props: {
    modelValue: {
      type: Object as PropType<ModelValueItf>,
      default: {
        timeType: 'THIS_WEEK',
        dateRange: ['', ''],
      }
    },
    timeList: {
      type: Array as PropType<{ label: string; value: string; }[]>,
      default: [
        { label: '今日', value: 'TODAY' },
        { label: '本周', value: 'THIS_WEEK' },
        { label: '上周', value: 'LAST_WEEK' },
        { label: '本月', value: 'THIS_MONTH' },
        { label: '今年', value: 'THIS_YEAR' }
      ]
    }
  },
  setup: (props) => {
    return () => {
      return (
        <>
          <Form>
            <FormItem>
              <Select
                v-model:value={props.modelValue.timeType} options={props.timeList}
              />
            </FormItem>
          </Form>
        </>
      )
    }
  }
})
