import { cubeOuaaService } from '@/api/server'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import { Empty, Cell, CellGroup, RadioGroup, Radio, Button } from 'vant'
import { defineComponent, reactive, ref, watch } from 'vue'

/** 部门列表页 */
export const DepartmentPicker = defineComponent({
  emits: ['submit'],
  props: {
    assetType: {
      type: String,
      default: 'assetType'
    }
  },
  setup: (props, { emit }) => {
    const dataSource = ref<DeptList[]>([])
    const loading = ref(false)
    const checked = reactive({
      id: '',
      name: ''
    })
    // 获取部门列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        dataSource.value = await cubeOuaaService.getDeptList({ enabled: true })
      } catch {
      } finally {
        loading.value = false
      }
    }
    const handleCheck = (item: { id: string;name: string; }): void => {
      checked.id = item.id
      checked.name = item.name
    }
    const handleClick = (): void => {
      emit('submit', checked)
    }
    watch(() => props.assetType, () => {
      dataSource.value = []
      checked.id = ''
      checked.name = ''
      onLoad()
    }, { immediate: true })
    return (): JSX.Element =>
      <div>
        <div style={{ height: '96vh', background: '#f3f7fa' }}>
          <RadioGroup v-model={checked.id} style={{ height: '96vh', overflow: 'auto' }}>
            <CellGroup>
              {
                dataSource.value && dataSource.value.length > 0 &&
                    dataSource.value.map((item) => {
                      return (
                        <Cell title={item.name} key={item} clickable onClick={() => {
                          handleCheck(item)
                        }} v-slots={{ 'right-icon': () => <Radio name={item.id} /> }} />
                      )
                    })
              }
              {(dataSource.value.length === 0) && <Empty description='暂无数据' style='background:#f3f7fa' />}
            </CellGroup>
          </RadioGroup>
        </div>
        <Button type='primary' block size='small' onClick={handleClick}>确定</Button>
      </div>
  }
})
