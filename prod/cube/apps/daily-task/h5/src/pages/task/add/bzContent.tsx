import { defineComponent, onMounted, ref, type VNode,onUnmounted } from 'vue'
import {

  Icon,

  Checkbox,
  CheckboxGroup,
} from 'vant'
import styles from './add.module.less'
import { cubeDailyTaskService } from '@/api/server'
import { useRouter } from 'vue-router'
import { storeInspect } from '@/store/inspect'

interface TableData {
  itemId: number;
  itemName: string;
  checked: boolean;
}

export  const TaskAddBzContent = defineComponent({
  emits: ['transfer',],
  name: 'TaskAddBzContent',
  setup: (props, { emit }) => {
   const router = useRouter()
    const store = storeInspect()
    const selectedIds = ref<number[]>([])

    const tableData = ref<TableData[]>([])

    const getList = async (): Promise<void> => {
      const res = await cubeDailyTaskService.getResultRelation({
          pageNumber: '1',
          pageSize: '1000',
          dailyType:'DAILY_TASK'
      })
        tableData.value = res.records
    }
    onMounted(() => {
      getList()
      selectedIds.value = store.bzSelectIds
    })
    /**
   * 打开/关闭某一行的选中状态，并同步 selectedIds
   */
  const toggleRow = (item: TableData): void => {
    item.checked = !item.checked
    if (item.checked) {
      if (!selectedIds.value.includes(item.itemId)) {
        selectedIds.value.push(item.itemId)
      }
    } else {
      selectedIds.value = selectedIds.value.filter(itemId => itemId !== item.itemId)
    }
    store.updateSelectbzIds(selectedIds.value)
  }

   onUnmounted (()=>{
    // store.updateSelectbzIds(selectedIds.value)
  })

    const addObject = (): void => {
      emit('transfer')
      router.push({
        path: '/task-add-standard'
      })
    }

    return (): VNode => (
      <div class={styles.task_content_page}>
        
        <div class={styles.button_group}>
          <div  onClick={addObject}><Icon name="add-o" size="20"></Icon> 添加标准</div>
        </div>
        <div class={styles.content}>
          <div class={styles.display_table}>

            <div class={styles.display_table_body}>
             <CheckboxGroup
                modelValue={selectedIds.value as any}
                onUpdate:modelValue={(v:number[]) => {
                  selectedIds.value = (v ?? []) as number[]
                  tableData.value.forEach(it => { it.checked = selectedIds.value.includes(it.itemId) })
                }}
              >
                {
                  tableData.value.map((item, index) => (
                    <div
                      class={styles.display_table_row}
                      key={index}
                      onClick={() => toggleRow(item)}
                    >
                      <Checkbox onClick={() => toggleRow(item)} name={item.itemId} />
                      <div class={styles.table_cell}>{item.itemName}</div>
                    </div>
                  ))
                }
              </CheckboxGroup>

            </div>
          </div>
        </div>

       
      </div>
    )
  },
})