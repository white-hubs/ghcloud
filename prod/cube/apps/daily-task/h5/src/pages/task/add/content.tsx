import { defineComponent, onMounted, reactive, ref, computed, type VNode } from 'vue'
import {
  Icon,
  List,
  Empty,
} from 'vant'
import styles from './add.module.less'

import { useRouter } from 'vue-router'
import { storeInspect } from '@/store/inspect'
import { cubeDailyTaskService } from '@/api/server'

interface TaskCategory {
  id: string;
  name: string;
    ids:{
    id:string;
    typeId:string,
    standardList?: {
      description: string;
      id: string;
      name: string;
      typeId: string;
        }[];}[];
  api:string;
  appAPI:string;
}
export  const TaskAddContent = defineComponent({
  name: 'TaskAddContent',
  emits: ['transfer',],
  setup: (props, { emit }) => {
    const store = storeInspect()
    const router = useRouter()
    const search = reactive({
     pageNumber:0,
     pageSize:20,
    })
    const tableHeader = ref('DEVICE')
    const typeList = ref<TaskCategory[]>()

    const tableData = ref([])
    const loading = ref(false)
    const finished = ref(false)
    // const 
      // 获取数据
      const onLoad = async (): Promise<void> => {
        try {
          loading.value = true
          search.pageNumber++
        //  const res = ...
          let api = ''
            const selectTabs = typeList.value?.filter(item=>item.id===tableHeader.value)??[]
            if(selectTabs.length){
              api = selectTabs[0].api
            }else{
              return;
            }
            if(!selectTabs[0].ids.length){
              tableData.value = []
              return;
            }
            const params = {
              pageNumber: search.pageNumber,
              pageSize: search.pageSize,
              // typeIds: selectTabs[0].ids
              ids:selectTabs[0].ids.map((item) =>{
                return item.id
              })
            }
          const res =  await (cubeDailyTaskService as any)[api as keyof typeof cubeDailyTaskService](params)
        
          // const res = []
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!tableData.value) {
          tableData.value = []
        }
        if (search.pageNumber === 1) {
          tableData.value = []
        }
        tableData.value = [...tableData.value, ...res.records]
        } catch (error) {
          finished.value = true
        } finally {
          //  finished.value = true
          loading.value = false
        }
      }
    const addObject = (): void => {
      store.copyTaskCategory()
      emit('transfer')
      router.push({
        path: '/task-add-object'
      })
    }

    const tabsClick = (item): void => {
      tableHeader.value = item.id
      tableData.value = []
      search.pageNumber = 0
      onLoad()
    }
    const clear = (index:number): void => {
      tableData.value.splice(index,1)
      typeList.value?.map((item) =>{
        if(item.id===tableHeader.value){
          item.ids.splice(index,1)
        }
      })
      if(typeList.value){
        store.updateTaskCategory(typeList.value)
      }
    }
    onMounted(() => {
      typeList.value = store.typeList
      onLoad()
    })
    return (): VNode => (
      <div class={styles.task_content_page}>
        
        {/* <Search v-model={search.keyword} placeholder='根据对象名称进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} /> */}
        <div class={styles.button_group}>
          <div  onClick={addObject}><Icon name="add-o" size="20"></Icon> 添加任务对象</div>
          {/* <div  ><Icon name="add-o" size="20"></Icon> 添加任务标准</div> */}
        </div>
        <div class={styles.content}>
          <div class={styles.display_table}>
            <div class={styles.table_header}>
              {
                typeList.value?.map((item, index) => (
                  <div class={[styles.tabs,tableHeader.value===item.id?styles.active:'']} onClick={()=>{tabsClick(item)}} key={index}>{item.name}</div>
                ))
              }
            </div>
            <div class={styles.display_table_body}>
              <div class={styles.display_table_body_content}>
                <List
                    v-model:loading={loading.value}
                    finished={finished.value}
                    finished-text={tableData.value.length === 0 ? '' : '暂无更多数据'}
                    onLoad={onLoad}
                  >
                    {
                      tableData.value.length?tableData.value.map((item, index) => (
                        <div class={styles.display_table_row} key={index}>
                          <div class={styles.table_cell}>{item.name}</div>
                          <div class={styles.table_clear} onClick={() =>clear(index)}>
                            <Icon name="clear" style={{color:'#a3a8ac'}} size="20"></Icon>
                          </div>
                        </div>
                      )):<Empty description='暂无数据' />
                    }
                    
                  </List>
                </div>
            </div>
          </div>
        </div>

     
      </div>
    )
  },
})