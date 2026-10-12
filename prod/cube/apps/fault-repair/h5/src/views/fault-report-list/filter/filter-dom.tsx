import { defineComponent, ref, watch, type VNode } from 'vue'
import styles from '../fault-report-list.module.less'
import { Field, Form, Radio, RadioGroup } from 'vant'
export const FilterDom = defineComponent({
  emits: ['searchForm'],
  props: {
    searchForm: {
      type: Object,
      default: () => {
        return {
          pageNumber: 0,
          total: 1,
          pageSize: 10,
          type: '',
        }
      }
    }
  },
  setup: (props, { emit }) => {
    const search = ref<Record<string, string | number>>({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      type: '',
    })
    // 状态
    const typeList = [
      { title: '日报', name: 'REPORT_DAY' },
      { title: '周报', name: 'REPORT_WEEK' },
      { title: '月报', name: 'REPORT_MONTH' },
    ]
    // 选择状态查询
    const changeType = (value: string): void => {
      search.value.type = value
    }
    const typeDom = (): VNode =>
      <RadioGroup v-model={search.value.type} direction='horizontal' icon-size='14px' onChange={changeType}>
        {
          typeList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${search.value.type === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.value.type === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })
    watch(() => search.value, () => {
      emit('searchForm', search.value)
    }, { immediate: true, deep: true })
    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>报告类型</p>
          <Field style={{ padding: '0px' }} name='type' v-slots={{ input: typeDom() }} />
        </Form>
      </div>
  }
})
