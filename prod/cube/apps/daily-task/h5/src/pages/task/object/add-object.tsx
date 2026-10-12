import { defineComponent, onMounted, reactive, ref, computed, type VNode } from 'vue'
import {
  Tabs,
  Tab,
  showNotify,
} from 'vant'
import styles from './object.module.less'
import {TabsBody} from './tabs-body'
import { CubeNavBar } from '@ghcloud/cube-app-generic-component'
import { storeInspect } from '@/store/inspect'
import { getEnvironment } from '@ghcloud/cube-app-js-sdk/src/js/cube-h5-config'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { cubeDailyTaskService } from '@/api/server'
/**
 * 初始化并渲染任务新增页面
 * - 使用 Vant 组件搭建表单
 * - 提供项目选择、日期选择、类型选择、文本输入、图片上传与提交
 */
export  const TaskAddObject = defineComponent({
  name: 'TaskAddObject',
  setup (): () => VNode {
  const store = storeInspect()

   const tabs = ref<{ id: string; name: string; ids: {id:string;typeId:string;tagIds:string[];old?:boolean;standardList?: { description: string; id: string; name: string; typeId: string; }[]}[]; api: string; appAPI: string; removeCount?: number; }[]>([ {
      name: '设备',
      id: 'DEVICE',
      api: 'getDevicePage',
      appAPI: 'getDevicePageID',
      ids:[]
    },
    {
      name: '档位',
      id: 'STALL',
      api: 'getStallPage',
      appAPI: 'getStallPageID',
      ids:[]
    },
    {
      name: '资产',
      id: 'PROPERTY',
      api: 'getPropertyPage',
      appAPI: 'getPropertyPageID',
      ids:[]
    },    
    {
      name: '现场点',
      id: 'SITE_POINT',
      api: 'getScenePointPage',
      appAPI: 'getScenePointPageID',
      ids:[]
    },    
    // {
    //   name: '巡更点',
    //   id: 'PATROL_POINT',
    //   api: 'getPatrolPointPage',
    //   appAPI: 'getPatrolPointPageID',
    //   ids:[]
    // },
    {
      name: '风险点',
      id: 'RISK_SOURCE',
      api: 'getRiskPage',
      appAPI: 'getRiskPageID',
      ids:[]
    },
    {
      name: '小散工程',
      id: 'SMALL_ENGINEERING',
      api: 'getProjectPage',
      appAPI: 'getProjectPageID',
      ids:[]
    },])
    onMounted(() =>{
      tabs.value = store.typeList
    })
   const cancel = () =>{
    if (getEnvironment() === 'cubeApp') {
        cubeAppService.backPage()
      } else {
        history.back()
      }
  }
  /**
   * 校验并转换所选对象ID
   * 入参为所选 targets 列表，返回移除数量和修正后的 targets
   */
  const checkIds = async (
    params: { targets: { id: string; typeId: string;tagIds:string[] }[] }
  ): Promise<{ removeCount: number; targets: { id: string; typeId: string;tagIds:string[]; }[] }> => {
    const data = await cubeDailyTaskService.getTargetIdsByTypeIds(params) as {
      removeCount: number
      targets: { id: string; typeId: string;tagIds:string[]; }[]
    }
    return data 
  }
  /**
   * 批量获取标准列表（并发执行）
   * 入参为一个 category 和去重后的 typeId 列表，返回以 typeId 为 key 的标准数组映射
   */
  const getbzList = async (
    params: { type: string; typeIds: string[] }
  ): Promise<Record<string, { description: string; id: string; name: string; typeId: string }[]>> => {
    const typeIds = Array.from(new Set((params.typeIds ?? []).filter(Boolean)))
    if (typeIds.length === 0) return {}
    const resp = await cubeDailyTaskService.getDailyStandardByTypeIds({ type: params.type, typeIds,dailyType:'DAILY_TASK' })
    return resp as Record<string, { description: string; id: string; name: string; typeId: string }[]>
  }
  /**
   * 并发校验所有已选择对象，记录各项移除数量，更新 ids 为返回的 targets，
   * 等待全部接口完成后合计移除数量并统一提示
   */
  const submitBarProps = async (): Promise<void> => {
    const candidates = tabs.value.filter(t => Array.isArray(t.ids) && t.ids.length > 0)
    if (candidates.length === 0) {
      showNotify({ message: '未选择任务对象' })
      return
    }

    const results = await Promise.allSettled(
      candidates.map(async (item) => {
        const res = await checkIds({ targets: item.ids.filter(i => !i.old) })
        item.removeCount = res.removeCount
        const oldIds = item.ids.filter(i => i.old)
        item.ids = res.targets.concat(oldIds)
        return res.removeCount
      })
    )

    const totalRemoved = results.reduce((sum, r) => {
      return sum + (r.status === 'fulfilled' ? (r.value as number) : 0)
    }, 0)
    if(totalRemoved > 0){
      showNotify({
      type: 'warning',
      message: `已移除 ${totalRemoved} 项无效对象`
    })
    }
    

    await Promise.allSettled(
      tabs.value.map(async (item) => {
        const typeIds = Array.from(new Set((item.ids ?? []).map(i => i.typeId).filter(Boolean)))
        if (typeIds.length === 0) return
        const bzMap = await getbzList({ type: item.id, typeIds })
        item.ids = (item.ids ?? []).map(i => ({
          ...i,
          standardList: bzMap[i.typeId] ?? []
        }))
      })
    )

    tabs.value = [...tabs.value]
    store.updateTaskCategory(tabs.value)
    cancel()
  }
    return (): VNode => (
      <div class="task-object-page">
        <CubeNavBar onClickLeft={() =>{
          store.updateTaskCategory(store.copyList)
        }} showBack title="任务对象" />
        <div class={styles.task_object_body}>
        <Tabs>
          {
            tabs.value.map((item,key) =>{
              return <Tab title={item.name} key={key}>
                <TabsBody id={item.id} api={item.api} onChange={(value) =>{
                  item.ids = value
                }} onSubmit={() =>{
                  submitBarProps()
                  
                }}  appApi={item.appAPI} selected={JSON.parse(JSON.stringify(item.ids))}></TabsBody>
              </Tab>
            })
          }

        </Tabs>
    </div>
      </div>
    )
  },
})