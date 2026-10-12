import { defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import { getAssetsFile } from '@/utils'
import { useClientStore } from '@/store/modules/client-store'
import type { PointVo, RegionVo } from '@ghcloud/electronic-guide-service'
export const PointItem = defineComponent({
  props: {
    pointState: {
      type: Object as PropType<PointVo>,
      default: () => ({}),
    }
  },
  emits: ['checked'],
  setup: (props, { emit }) => {
    const clientStore = useClientStore()
    const areaIcon = getAssetsFile('area-icon.png')
    const localIcon = getAssetsFile('local-icon.png')
    const defaultMerchant = getAssetsFile('default-merchant.png')
    const handleClickItem = async (): Promise<void> => {
      clientStore.checkPointId = props.pointState.id
      const area = findById(clientStore.regionTreeList, props.pointState.areaId)
      if (area) {
        if (area.level === 1) {
          clientStore.regionId = area.id
          clientStore.secondaryId = ''
          clientStore.leafId = ''
          clientStore.setLeafList([])
        } else if (area.level === 2) {
          clientStore.regionId = area.id
          clientStore.secondaryId = ''
          clientStore.setSecondaryList(area.children ?? [])
          clientStore.leafId = ''
          clientStore.setLeafList([])
        } else if (area.level === 3) {
          clientStore.regionId = area.parentId as unknown as string
          clientStore.setSecondaryList(area.children ?? [])
          clientStore.secondaryId = area.id
          clientStore.leafId = ''
          clientStore.setLeafList([])
        } else if (area.level === 4) {
          const threeLevel = findById(clientStore.regionTreeList, area.parentId as unknown as string)
          const secondLevel = findById(clientStore.regionTreeList, threeLevel?.parentId as unknown as string) as unknown as RegionVo
          clientStore.regionId = secondLevel?.id as unknown as string
          clientStore.setSecondaryList(secondLevel.children ?? [])
          clientStore.secondaryId = area.parentId as unknown as string
          clientStore.setLeafList(threeLevel?.children ?? [])
          clientStore.leafId = area.id
        }
      }

      emit('checked', {
        ...props.pointState,
        filePath: props.pointState.filePath
      })
    }
    const findById = (tree: RegionVo[], id: string): RegionVo | undefined => {
      // 深度遍历查找
      for (const node of tree) {
        if (node.id === id) {
          return node // 找到匹配的节点，返回它
        }
        if (node.children) {
          const found = findById(node.children, id)
          if (found) {
            return found // 在子节点中找到匹配的节点，返回它
          }
        }
      }
      return undefined // 如果没有找到，返回 undefined
    }
    return (): JSX.Element => (
      <div class={[styles.container, clientStore.checkPointId === props.pointState.id && styles.active]} onClick={handleClickItem}>
        <div class={styles.image}>
          <img src={props.pointState.filePath || defaultMerchant} alt='' />
        </div>
        <div class={styles.info}>
          <div class={styles.name}>
            {props.pointState.name}
          </div>
          <div class={styles.area}>
            <img src={areaIcon} alt='' />
            <div>{props.pointState.areaName}</div>
          </div>
          <div class={styles.local}>
            <img src={localIcon} alt='' />
            <div>{props.pointState.address}</div>
          </div>
        </div>
      </div>
    )
  }
})
