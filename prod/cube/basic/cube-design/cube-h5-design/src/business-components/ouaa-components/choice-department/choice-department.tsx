import { Button, Cell, CellGroup, Empty, Radio, RadioGroup } from 'vant'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { cubeOuaaService } from '../../../api/service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'

export const ChoiceDepartment = defineComponent({
  emits: ['chosen'],
  props: {
    chosen: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup (props, { emit }) {
    document.title = '选择部门'
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const concatList = ref<DeptList[]>([])
    onMounted(() => {
      onLoad()
    })
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        concatList.value = await cubeOuaaService.getDeptList()
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const chosen = ref({
      id: '',
      name: ''
    })
    const cellDom = (item: DeptList): object => {
      return {
        title: () =>
          <div>
            {item.name}
          </div>,
        'right-icon': () => <Radio name={item.id} />
      }
    }
    const handleSubmit = async (): Promise<void> => {
      emit('chosen', chosen.value)
    }
    watch(() => props.chosen, () => {
      chosen.value.id = props.chosen.id
      chosen.value.name = props.chosen.name
    })
    return (): JSX.Element =>
      <div>
        <div style={{ height: '94vh', overflow: 'auto' }}>
          <RadioGroup v-model={chosen.value.id}>
            <CellGroup inset>
              {
                concatList.value.map(item =>
                  <Cell clickable key={item.id} onClick={() => {
                    chosen.value.id = item.id; chosen.value.name = item.name
                  }} v-slots={cellDom(item)} />)
              }
            </CellGroup>
          </RadioGroup>
          {(concatList.value.length === 0) && <Empty description='暂无数据' />}
        </div>
        <Button size='small' block type='primary' onClick={handleSubmit}>提交</Button>
      </div>
  }
})
