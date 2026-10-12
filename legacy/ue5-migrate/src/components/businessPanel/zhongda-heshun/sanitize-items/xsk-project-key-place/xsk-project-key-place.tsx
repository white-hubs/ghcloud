import { type VNode, defineComponent, onMounted, ref, computed, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import { ScrollTabs } from '../../components/scroll-tabs/scroll-tabs'
import { Button, Popover, Skeleton } from 'ant-design-vue'
import RollTable from "@/components/businessPanel/public/rollTable/index.vue";
import styles from './xsk-project-key-place.module.less'
import { cubeZDDataVizService } from '@/api/service'
import type { KeyPlacePageVO } from '@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto'
import NoData from "@/components/businessPanel/public/noData.vue";
import { clearMap } from '@/pages/event/register/gis'
import { createKeyPlaceMarker } from '../../utils/gis-helper'
import { createKeyPlaceModal } from '../../utils/modal-helper'
import { projectStore } from '../../store/project'

/** 项目重点场所 */
export const XSKProjectKeyPlace = defineComponent({
  setup () {
    const columns = ref([
      {
        title: "重点场所",
        dataIndex: "placeName",
      },
      {
        title: "场所分类",
        dataIndex: "placeTypeName",
      },
      {
        title: "所属项目",
        dataIndex: "projectName",
        slots: {
          customRender: "projectName",
        },
      },
      {
        title: "操作",
        dataIndex: "operate",
        slots: {
          customRender: "operate",
        },
      },
    ]);
    const activeKey = ref('all')
    const total = ref(0)
    const data = ref<KeyPlacePageVO[]>([])
    const loading = ref(false)

    // 根据placeTypeName分类统计数量
    const placeTypeStats = computed(() => {
      const stats: Record<string, number> = {}
      data.value.forEach(item => {
        const typeName = item.placeTypeName || '其他'
        stats[typeName] = (stats[typeName] || 0) + 1
      })
      return stats
    })

    const tabList = computed(() => {
      const stats = placeTypeStats.value
      const tabs = [
        { text: `全部(${total.value})`, key: 'all' },
      ]
      Object.entries(stats).forEach(([typeName, count]) => {
        tabs.push({
          text: `${typeName}(${count})`,
          key: typeName
        })
      })

      return tabs
    })

    const placeList = computed(() => {
      if (activeKey.value === 'all') {
        return data.value
      }
      return data.value.filter(item => item.placeTypeName === activeKey.value)
    })

    const getData = async (projectId?: string): Promise<void> => {
      try {
        loading.value = true
        const res = await cubeZDDataVizService.getKeyPlacesListAll({ projectId })
        if (res) {
          data.value = res ?? []
          total.value = data.value?.length || 0
        }
      } catch {
      } finally {
        setTimeout(()=>{
          loading.value = false
        }, 500)
      }
    }
    const store = projectStore()
    watch(() => store.currentProject, () => {
      if (store.currentProject) {
        getData(store.currentProject?.id as string)
      }
    })
    onMounted(()=>{
      getData()
    })
    const operateSlots = {
      projectName: (e: { key: number;record: KeyPlacePageVO; }): string => {
        return e.record?.projectName || '--'
      },
      operate: (e: { key: number;record: KeyPlacePageVO; }): JSX.Element => {
        if (e.record?.latitude && e.record?.longitude) {
          return <div style={{ color: '#5ea6ff' }} onClick={() => handlePosition(e.record)}>定位</div>
        } else {
          return <Popover content={'该场所未配置经纬度'}>
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', cursor: 'not-allowed' }}>定位</div>
          </Popover>
        }
      }
    }
    const handlePosition = (data: KeyPlacePageVO): void => {
      clearMap()
      createKeyPlaceMarker(data, { lat: data.latitude, lng: data.longitude }, true)
    }
    const handleMoreClick = async (): Promise<void> => {
      createKeyPlaceModal('项目重点场所列表')
    }
    return (): VNode => (
      <SubPanelTemplate v-slots={{ extra: () => <Button type='link' size='small' style={{ color: '#b0c5ff', fontSize: '18px' }} onClick={handleMoreClick} >更多&gt;&gt;</Button> }}>
        {data.value.length === 0 && <NoData />}
        <Skeleton active loading={loading.value} paragraph={{ rows: 1 }}>
          <ScrollTabs
            list={tabList.value}
            showPageBtn={tabList.value.length > 4}
            onTabClick={(tab)=>{
              activeKey.value = tab.key
            }}
          ></ScrollTabs>
        </Skeleton>
        <div class={styles.table}>
          {placeList.value.length === 0 && <NoData />}
          <Skeleton active loading={loading.value} paragraph={{ rows: 5 }}>
            <RollTable column={columns.value} data={placeList.value} showLength={3} v-slots={operateSlots} />
          </Skeleton>
        </div>
      </SubPanelTemplate>
    )
  },
})