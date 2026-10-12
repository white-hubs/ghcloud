import { defineComponent, ref, watch, type VNode } from 'vue'
import styles from '../consumable-list.module.less'
import { Button, Field, Form, Radio, RadioGroup } from 'vant'
export const FilterDom = defineComponent({
  emits: ['submit'],
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
    watch(() => props.searchForm, () => {
      search.value = props.searchForm
    }, { immediate: true, deep: true })
    const typeList = [
      { name: '', title: '全部' },
      { name: 'STOCK_MAX', title: '库存上限' },
      { name: 'STOCK_MIN', title: '库存下限' },
    ]
    // 选择类型查询
    const changeType = (value: string): void => {
      search.value.type = value
    }
    // 选择类型
    const typeDom = (): VNode =>
      <RadioGroup v-model={search.value.type} direction='horizontal' icon-size='14px' onChange={changeType}>
        {
          typeList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${search.value.type === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.value.type === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    return (): JSX.Element =>
      <div class={styles.filter}>
        <Form>
          <p>库存限制</p>
          <div>
            <Field style={{ padding: '0px' }} name='type' v-slots={{ input: typeDom() }} />
          </div>
        </Form>
        <div class={styles['filter-button']}>
          <div style={{ marginRight: '16px', width: '60px' }} onClick={() => {
            search.value.type = ''
          }}>
            重置
          </div>
          <Button block size='small' type='primary' onClick={() => {
            emit('submit', search)
          }}>
            提交
          </Button>
        </div>
      </div>
  }
})
