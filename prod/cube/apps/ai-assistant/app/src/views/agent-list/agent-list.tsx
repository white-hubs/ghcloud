import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { CubeLayout } from '@ghcloud/cube-app-design'
import { Button } from '@ghcloud/cube-ui'
import { getAgentList, saveAgentList } from '@/api/server'
import type { Agent } from '@/api/type'
import styles from './agent-list.module.less'
import Sortable from 'sortablejs'

export const AgentList = defineComponent({
  name: 'AgentList',
  setup (){
    const agentList = ref<Agent[]>([])
    // let sortable: Sortable;
    onMounted(async () => {
      agentList.value = await getAgentList()
      nextTick(()=>{
        const listDom = document.querySelector('#agent-list')
        if (!listDom) return

        // sortable = new Sortable(listDom as HTMLElement, {
        //   group: {
        //     name: 'agentList',
        //   },
        //   animation: 150,
        //   onUpdate: (evt): void => {
        //     const { oldIndex, newIndex } = evt
        //     if (typeof oldIndex === 'undefined' || typeof newIndex === 'undefined') return
        //     const [removed] = agentList.value.splice(oldIndex, 1)
        //     agentList.value.splice(newIndex, 0, removed)
        //     saveAgentList(agentList.value)
        //   }
        // })
      })
    })
    onBeforeUnmount(()=>{
      // sortable?.destroy()
    })
    return (): JSX.Element => (
      <CubeLayout title='智能体' showFooter={false}>
        {
          {
            'layout-header': () => <Button type='primary' onClick={()=>{
              history.pushState({ current: location.pathname + location.search }, "", '/portal/ai-assistant/agent-config')
            }}>创建</Button>,
            'layout-content': () =>
              <div class={styles['agent-list']} id='agent-list'>
                {
                  agentList.value.map(e=>{
                    return <div class={styles['item']} key={e.id} onClick={()=>{
                      history.pushState({ current: location.pathname + location.search }, "", `/portal/ai-assistant/agent-config?id=${e.id}`)
                    }}>
                      <img src={e.avatar.path} alt={e.name} />
                      <div class={styles['name']}>
                        <span>{e.name}</span>
                        <span>{e.description}</span>
                      </div>
                    </div>
                  })
                }
              </div>
          }
        }
      </CubeLayout>
    )
  }
})