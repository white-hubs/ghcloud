import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import {
  Search,
  PullRefresh,
  List,
  CellGroup,
  Cell,
  Checkbox,
  Popup,
  Picker,
  Button,
  showNotify,
  showDialog,
  Tabs,
  Tab,
  type PickerOption
} from 'vant'
import { cubeDailyTaskService } from '@/api/server'
import styles from './task-dispatch.module.less'
import { useRoute, useRouter } from 'vue-router'
import { status } from '../type'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
/**
 * 创建任务分发页面，支持筛选巡检结果、对象状态、部门与对象选择指派
 */
export const TaskDispatch = defineComponent({
  name: 'TaskDispatch',
  setup (): () => VNode {
    const search = reactive({
      keyword: '',
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      result: '',
      status: '',
      deptId: '',
      tagId: ''
    })

    const dataSource = ref<{
      id: string;
      name: string;
      address?: string;
      status?: string;
      result?: string;
      inspector?: string;
      targetLntAndLat: string;
      allowAssign?: boolean;
    }[]>([])
    const route = useRoute()
    const router = useRouter()
    const id = route.query.id as string
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)

    // const showFilterPopup = ref(false)
    const showDeptPicker = ref(false)
    const deptColumns = ref<{ text: string; value: string; }[]>([])
    const checkedIds = ref<string[]>([])
    const allChecked = ref(false)

    // const resultOptions = [
    //   { name: 'NORMAL', title: '正常' },
    //   { name: 'ABNORMAL', title: '异常' }
    // ]

    // const statusOptions = [
    //   { name: 'ALL', title: '全部' },
    //   { name: 'ACCEPT', title: '待接收' },
    //   { name: 'EXECUTING', title: '待巡检' },
    //   { name: 'OVER', title: '已巡检' },
    //   { name: 'EXPIRE', title: '已过期' },
    //   { name: 'STOP', title: '已终止' }
    // ]

    /**
     * 加载部门选项
     */
    // const loadDeptList = async (): Promise<void> => {
    //   const list = await cubeOuaaService.getDeptList({ enabled: true })
    //   deptColumns.value = (list ?? []).map((x: { id: string; name: string; }) => ({
    //     text: x.name,
    //     value: x.id
    //   }))
    // }
    const selectedTags = ref<{ id: string; name: string; }[]>([])

    interface TagNode {
      id: string;
      name: string;
      childList?: TagNode[];
    }

    /**
     * 加载标签选项
     */
    const loadLabelList = async (): Promise<void> => {
      const list = await cubeDailyTaskService.getTaskTags({ taskId: id }) as unknown as string[]
      const res = await cubeDailyTaskService.getTagTreeList({}) as unknown as TagNode[]

      const findNameInTree = (tree: TagNode[], targetId: string): string | null => {
        for (const node of tree) {
          if (node.id === targetId) {
            return node.name
          }
          if (node.childList && node.childList.length > 0) {
            const foundName = findNameInTree(node.childList, targetId)
            if (foundName) return foundName
          }
        }
        return null
      }

      const result = list.map((tagId) => {
        const name = findNameInTree(res, tagId)
        return name ? { id: tagId, name } : null
      }).filter((item): item is { id: string; name: string; } => item !== null)

      selectedTags.value = [{ id: '', name: '全部' }, ...result]
    }

    /**
     * 列表加载
     */
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyTaskService.getRelateformId({
          pageNumber: search.pageNumber.toString(),
          pageSize: search.pageSize.toString(),
          taskId: id,
          dailyType: 'DAILY_TASK',
          keyword: search.keyword,
          tagId: search.tagId
        })
        search.total = res.total ?? search.total

        if (res.total <= search.pageSize) finished.value = true
        if ((res.records ?? []).length < search.pageSize) finished.value = true
        if (search.pageNumber === 1) dataSource.value = []

        const mapped = (res.records ?? []).map((r: {
          id?: unknown; targetId?: unknown;
          taskName?: unknown; targetName?: unknown; name?: unknown;
          location?: unknown; areaName?: unknown; area?: { pathName?: unknown; };
          status?: unknown; result?: unknown;
          executorName?: unknown;
          targetLntAndLat?: unknown;
          allowAssign?: unknown;
        }) => ({
          id: String(r.id ?? r.targetId ?? ''),
          name: String(r.taskName ?? r.targetName ?? r.name ?? '--'),
          address: String(r.location ?? r.areaName ?? r.area?.pathName ?? '--'),
          status: String(r.status ?? ''),
          result: String(r.result ?? ''),
          inspector: String(r.executorName ?? '--'),
          targetLntAndLat: String(r.targetLntAndLat ?? ''),
          allowAssign: Boolean(r.allowAssign ?? true),
        }))
        dataSource.value = [...dataSource.value, ...mapped]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    /**
     * 列表刷新
     */
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }

    /**
     * 关键词搜索
     */
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }

    const checkedIdsMethod = async (): Promise<string[]> => {
      return dataSource.value.filter(x => x.allowAssign !== false).map(x => x.id)
    }
    /**
     * 选择巡检结果
     */
    // const changeResult = (value: string): void => {
    //   search.result = value
    // }

    /**
     * 选择对象状态
     */
    // const changeStatus = (value: string): void => {
    //   search.status = value
    // }

    /**
     * 确认部门选择
     */
    const onConfirmDept = ({ selectedOptions }: { selectedOptions: PickerOption[]; }): void => {
      search.deptId = (selectedOptions?.[0]?.value as string) ?? ''
      showDeptPicker.value = false
    }

    /**
     * 切换单项选择
     */
    const toggleCheck = (id: string): void => {
      const item = dataSource.value.find(x => x.id === id)
      if (item && item.allowAssign === false) return
      if (checkedIds.value.includes(id)) {
        checkedIds.value = checkedIds.value.filter(x => x !== id)
      } else {
        checkedIds.value = [...checkedIds.value, id]
      }
      const selectableCount = dataSource.value.filter(x => x.allowAssign !== false).length
      allChecked.value = checkedIds.value.length > 0 && checkedIds.value.length === selectableCount
    }

    /**
     * 全选/反选
     */
    const toggleAll = async (): Promise<void> => {
      if (allChecked.value) {
        checkedIds.value = []
        allChecked.value = false
      } else {
        checkedIds.value = await checkedIdsMethod()
        const selectableCount = dataSource.value.filter(x => x.allowAssign !== false).length
        allChecked.value = checkedIds.value.length === selectableCount && selectableCount > 0
      }
    }

    /**
     * 提交筛选
     */
    // const submitFilter = (): void => {
    //   showFilterPopup.value = false
    //   onSearch()
    // }

    /**
     * 指派动作
     */
    const handleAssign = (): void => {
      if (!checkedIds.value.length) {
        showNotify({ type: 'warning', message: '请先选择对象' })
        return
      }
      router.push({
        path: '/task-handOver',
        query: {
          id,
          obj: checkedIds.value.join(',')
        }
      })
      // showNotify({ type: 'success', message: `已选择 ${checkedIds.value.length} 个对象` })
    }

    onMounted(async () => {
      // await loadDeptList()
      loadLabelList()
      onLoad()
    })

    // const FilterPanel = (): VNode => (
    //   <div style={{ padding: '12px' }}>
    //     <div style={{ marginBottom: '12px' }}>巡检结果</div>
    //     <Field style={{ padding: '0px', marginBottom: '12px' }}
    //       name='result'
    //       v-slots={{
    //         input: () => (
    //           <RadioGroup v-model={search.result} direction='horizontal' icon-size='14px' onChange={(v: string) => changeResult(v)}>
    //             {resultOptions.map(item => (
    //               <Radio key={item.name} name={item.name}
    //                 style={{ color: `${search.result === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.result === item.name ? '#E6EFFF' : '#F8F9F9'}`, marginRight: '8px' }}
    //                 v-slots={{ icon: () => <div style={{ width: '90px', textAlign: 'center' }}>{item.title}</div> }}
    //               />
    //             ))}
    //           </RadioGroup>
    //         )
    //       }}
    //     />
    //     <div style={{ marginBottom: '12px' }}>对象状态</div>
    //     <Field style={{ padding: '0px', marginBottom: '12px' }}
    //       name='status'
    //       v-slots={{
    //         input: () => (
    //           <RadioGroup v-model={search.status} direction='horizontal' icon-size='14px' onChange={(v: string) => changeStatus(v)}>
    //             {statusOptions.map(item => (
    //               <Radio key={item.name} name={item.name}
    //                 style={{ color: `${search.status === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.status === item.name ? '#E6EFFF' : '#F8F9F9'}`, marginRight: '8px' }}
    //                 v-slots={{ icon: () => <div style={{ width: '90px', textAlign: 'center' }}>{item.title}</div> }}
    //               />
    //             ))}
    //           </RadioGroup>
    //         )
    //       }}
    //     />
    //     <div style={{ marginBottom: '12px' }}>部门</div>
    //     <Field
    //       is-link
    //       readonly
    //       name='dept'
    //       placeholder='选择部门'
    //       modelValue={deptColumns.value.find(x => x.value === search.deptId)?.text ?? ''}
    //       onClick={() => {
    //         showDeptPicker.value = true
    //       }}
    //     />
    //     <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
    //       <Button block onClick={() => {
    //         search.result = ''; search.status = ''; search.deptId = ''
    //       }}>重置</Button>
    //       <Button block type='primary' onClick={submitFilter}>确定</Button>
    //     </div>
    //   </div>
    // )
    // const searchDom = {
    //   action: (): VNode =>
    //     <Icon name="filter-o" onClick={() => {
    //      showFilterPopup.value = true
    //    }} size="20" />
    // }
    const openPicker = (e:Event,item: {
      id: string;
      name: string;
      address?: string;
      status?: string;
      result?: string;
      inspector?: string;
      targetLntAndLat: string;
    }): void => {
      e.stopPropagation()
      if (getEnvironment() === 'cubeApp') {
        const latAndLon = item.targetLntAndLat.split(',')
        cubeAppService.openTripartiteMap({
          type: 'route',
          latitude: Number(latAndLon[1]),
          longitude: Number(latAndLon[0]),
          address: item.address ?? ''
        })
        return
      }
      showDialog({ message: '请使用应用打开' })
      // const isWeixinBrowser = /micromessenger/i.test(navigator.userAgent)
      // if (isWeixinBrowser) {
      //   showDialog({ message: '请使用浏览器或在应用中打开' })
      // } else {
      //   showPicker.value = true
      //   currentObj.value = item
      // }
    }
    return (): VNode => (
      <div class="task-dispatch-page">
        <CubeNavBar showBack title="选择对象" />
        <div style={{ padding: '12px' }}>
          <Search v-model={search.keyword} placeholder='搜索巡检对象' show-action={false} onSearch={onSearch} onClear={onSearch} onCancel={onSearch} />
        </div>
        <Tabs v-model:active={search.tagId} onClickTab={onSearch}>
          {selectedTags.value.map(tag => (
            <Tab title={tag.name} name={tag.id} key={tag.id} />
          ))}
        </Tabs>

        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: 'calc(100vh - 224px)', marginTop: '10px', overflow: 'auto' }}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              dataSource.value.map(item => (
                <CellGroup inset style={{ marginBottom: '12px' }} key={item.id}>
                  <Cell clickable onClick={() => item.allowAssign !== false && toggleCheck(item.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <Checkbox shape='square' disabled={item.allowAssign === false} modelValue={checkedIds.value.includes(item.id)} />
                      <div style={{ flex: 1 }} class={styles.cellContent}>
                        <div class={styles.cellTitle}>

                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                          {/* <Tag size='medium' type='primary'>{item.status=='WAIT'?'待处理':'' }</Tag> */}
                          <div class={styles.tags} style={{ backgroundColor: status[item.status as keyof typeof status]?.background, color: status[item.status as keyof typeof status]?.color }}> {status[item.status as keyof typeof status]?.name ?? ''} </div>

                        </div>
                        <div class={styles.cellTitleFlex} style={{ color: '#999', marginTop: '6px' }}>具体地址：{item.address || '--'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                          <div class={styles.cellTitleFlex}>处理人：{item.inspector || '--'}</div>
                          {item.targetLntAndLat && <Button size='small' onClick={(e:Event) =>{
                            openPicker(e,item)
                          }} type='primary'>导航</Button>}
                        </div>
                      </div>
                    </div>
                  </Cell>
                  <Cell>
                    {/* <div style={{ color: '#1677ff', textAlign: 'center' }}>开始巡检</div> */}
                  </Cell>
                </CellGroup>
              ))
            }
          </List>
        </PullRefresh>

        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '10px 12px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }} onClick={toggleAll}>
            <Checkbox shape='square' modelValue={allChecked.value} />
            <div>全选</div>
            <div style={{ color: '#1677ff' }}>已选：{checkedIds.value.length} 个</div>
          </div>
          <Button type='primary' block onClick={handleAssign}>分发</Button>
        </div>

        {/* <Popup v-model:show={showFilterPopup.value} position='right' style={{ width: '90vw', height: '100vh' }}>
          {FilterPanel()}
        </Popup> */}

        <Popup v-model:show={showDeptPicker.value} position='bottom'>
          <Picker
            columns={deptColumns.value}
            onConfirm={onConfirmDept}
            onCancel={() => (showDeptPicker.value = false)}
          />
        </Popup>
      </div>
    )
  }
})