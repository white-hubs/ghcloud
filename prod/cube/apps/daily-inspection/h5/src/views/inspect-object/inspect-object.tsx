import { Button, Empty, Field, List, Popup, PullRefresh, Checkbox, CheckboxGroup, Search, Picker } from 'vant'
import { defineComponent, onMounted, reactive, ref, computed, type VNode, type PropType } from 'vue'
import styles from './inspect-object.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { cubeMaintainService } from '@/api/server'
import { useRoute, useRouter } from 'vue-router'
import type { ReplicableTargetVO } from '@ghcloud/cube-maintain-service'
import { storeInspect } from '@/store/inspect'
import { CopyBar } from '../inspection-execute/components/bar'
interface Props {
  selectList: ReplicableTargetVO[];
  id: string;
}

export const InspectObject = defineComponent({
  emits: ['submit', 'back'],
  props: {
    selectList: {
      type: Array as PropType<ReplicableTargetVO[]>,
      default: () => {
        return []
      }
    },
    id: {
      type: String,
      default: ''
    }
  },
  setup (props: Props, { emit }) {
    useMetaTitle()
    const router = useRouter()
    const route = useRoute()
    const id = props.id
    const store = storeInspect()

    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 100,
      keyword: '',
      id: id || '',
      targetCategory: ''
    })
    const checkboxRefs = ref<(typeof Checkbox & { toggle: () => void; })[]>([]);
    const checkType = ref<{ text: string; value: string; } | null>(null)
    const showType = ref(false)
    const typeOptions = ref([
      { text: '档位', value: 'STALL' },
      { text: '设备', value: 'DEVICE' },
      { text: '资产', value: 'PROPERTY' },
      { text: '现场点', value: 'SITE_POINT' },
      { text: '风险源', value: 'RISK_SOURCE' },
      { text: '小散工程', value: 'SMALL_ENGINEERING' },
    ])
    const typeName = computed(() => {
      if (checkType.value) {
        return checkType.value.text
      }
      return ''
    })

    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const showPopUp = ref(false)
    const concatList = ref<ReplicableTargetVO[]>([])
    const checkedList = ref<ReplicableTargetVO[]>(props.selectList)
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeMaintainService.getInspectReplicableTarget(search)
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!concatList.value) {
          concatList.value = []
        }
        if (search.pageNumber === 1) {
          concatList.value = []
        }
        concatList.value = [...concatList.value, ...res.records]
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const checkedIds = ref<number[]>([])

    onMounted(() => {
      onLoad()
      checkedIds.value = props.selectList.map(item => item.recordId)
    })
    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const searchDom = {
      action: (): VNode => <div onClick={() => {
        showPopUp.value = true
      }}>筛选</div>
    }
    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }
    const handleSubmit = async (): Promise<void> => {
      emit('submit', checkedList.value)
    }
    const handleEnter = (): void => {
      search.pageNumber = 0
      search.keyword = ''
      search.targetCategory = checkType.value?.value || ''
      onLoad()
      showPopUp.value = false
    }
    const toggle = (item: ReplicableTargetVO, index: number): void => {
      // checkboxRefs.value[index]?.toggle();
      // store.checkedIds = checkedIds.value
      checkedList.value = concatList.value?.filter(item => checkedIds.value.includes(item.recordId)) || []
    }
    const typeString = (type:string) =>{
     const typeList = typeOptions.value.find(item => item.value === type)
      if(typeList){
        return typeList.text
      }
      else{
        return '--'
      }
    }
    return (): VNode=>
      <div class={styles.inspect}>
        {/* <CubeNavBar title='选择对象' showBack /> */}
        <CopyBar name={'选择巡检对象'} onBack={()=>{
        // isCopy.value = false
          emit('back')
        }}
        />
        <Search v-model={search.keyword} placeholder='根据对象名称进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} />
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['inspect-list-pull-refresh']}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={concatList.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            <CheckboxGroup v-model={checkedIds.value}>
              <div class={styles['list']}>
                {
                  concatList.value.map((item, index) => {
                    return <div key={item.recordId} class={styles.card} onClick={() => {
                      toggle(item, index)
                    }}>
                      <div class={styles.info}>
                        <div class={styles.title}>
                          <span>{item.targetName}</span>
                        </div>
                        <div class={styles.detail}>
                          <span>对象类型：</span>
                          <span>{typeString(item.targetCategory??'')}</span>
                        </div>
                        <div class={styles.detail}>
                          <span>区域：</span>
                          <span>{item.areaName ?? '--'}</span>
                        </div>
                      </div>
                      <div class={styles.checkbox}>
                        <Checkbox name={item.recordId} shape='square' ref={el => {
                          if (el) {
                            checkboxRefs.value[index] = el as unknown as typeof Checkbox & { toggle: () => void; }
                          }
                        }} />
                      </div>
                    </div>
                  })
                }
              </div>
            </CheckboxGroup>
            {(concatList.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
          </List>
        </PullRefresh>
        <div class={styles['inspect-operate']}>
          <div class={styles.operateTips}>
            已选：<span>{checkedIds.value.length}</span> 个
          </div>
          <Button type='primary' size='small' loading-text='确定' onClick={handleSubmit}>确定</Button>
        </div>
        <Popup
          v-model:show={showPopUp.value}
          position='right'
          style={{ width: '80%', height: '100%' }}
          onClose={() => {
            showPopUp.value = false
          }}
        >
          <div class={styles.filter}>
            <Field
              v-model={typeName.value}
              label='对象类型'
              isLink
              placeholder='请选择对象类型'
              readonly
              onClick={() => {
                showType.value = true
              }}
            />
          </div>
          <div class={styles.button}>
            <Button class={styles.btn} type='default' block size='small' onClick={() => {
              checkType.value = null
              search.targetCategory = ''
            }}>重置</Button>
            <Button class={styles.btn} type='primary' size='small' block onClick={handleEnter}>确定</Button>
          </div>
        </Popup>
        <Popup v-model:show={showType.value} round position='bottom'>
          <Picker
            title='对象类型'
            columns={typeOptions.value}
            onConfirm={({ selectedOptions }: { selectedOptions: { text: string;value: string; }[]; }) => {
              checkType.value = selectedOptions[0]
              showType.value = false
            }}
            onCancel={() => {
              showType.value = false
            }}
          />
        </Popup>
      </div>
  }
})
