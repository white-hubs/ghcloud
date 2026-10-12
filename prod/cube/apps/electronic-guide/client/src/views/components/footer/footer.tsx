import { defineComponent, onMounted } from 'vue'
import styles from './index.module.less'
import { pointTypeService } from '@/apis/service'
import { useClientStore } from '@/store/modules/client-store'
import type { PointTypeVo } from '@ghcloud/electronic-guide-service'
import { getAssetsFile } from '@/utils'
import { useMapStore } from '@/store/modules/map-store'
export const Footer = defineComponent({
  setup: () => {
    const clientStore = useClientStore()
    const mapStore = useMapStore()
    const allIcon = getAssetsFile('all-icon.png')
    // const nextPageIcon = getAssetsFile('next-page.png')
    // const currentPage = ref(0)
    const initFirst = {
      id: '',
      name: '全部',
      code: '',
      filePath: allIcon
    }
    onMounted(() => {
      scrollInit()
    })
    const scrollInit = (): void => {
      // 获取要绑定事件的元素
      const nav = document.getElementById('list-container') as unknown as HTMLElement
      let flag: boolean = false // 鼠标按下
      let downX = 0 // 鼠标点击的x下标
      let scrollLeft = 0 // 当前元素滚动条的偏移量
      nav.addEventListener('mousedown', function (event) {
        flag = true
        downX = event.clientX // 获取到点击的x下标
        scrollLeft = this.scrollLeft // 获取当前元素滚动条的偏移量
      })
      nav.addEventListener('mousemove', function (event) {
        if (flag) { // 判断是否是鼠标按下滚动元素区域
          const moveX = event.clientX // 获取移动的x轴
          const scrollX = moveX - downX // 当前移动的x轴下标减去刚点击下去的x轴下标得到鼠标滑动距离
          this.scrollLeft = scrollLeft - scrollX // 鼠标按下的滚动条偏移量减去当前鼠标的滑动距离
        }
      })
      // 鼠标抬起停止拖动
      nav.addEventListener('mouseup', function () {
        flag = false
      })
      // 鼠标离开元素停止拖动
      nav.addEventListener('mouseleave', function () {
        flag = false
      })
    }

    const getData = async (): Promise<void> => {
      const result = await pointTypeService.getPointTypeList()
      const typeList = [...result]
      clientStore.setPointTypeList(typeList)
    }
    const addRegionMarker = (): void => {
      for (const region of clientStore.regionList) {
        const lngLat = [Number(region.coordinate.split(',')[1]), Number(region.coordinate.split(',')[0])] as [number, number]
        const imageUrl = getAssetsFile('region-icon.png')
        mapStore.getMapInstance.addAreaMark(lngLat, imageUrl, region)
      }
    }
    const handleClick = async (item: PointTypeVo): Promise<void> => {
      clientStore.pointSearchParams.typeId = item.id
      await clientStore.getPointList()
      await clientStore.addPointMarkerToMap()
      if (item.id === '') {
        addRegionMarker()
      }
    }
    onMounted(() => {
      getData()
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.list}>
          <div
            class={[styles.all]} onClick={() => {
              handleClick(initFirst)
            }}
          >
            <div class={[styles.item, clientStore.pointSearchParams.typeId === '' && styles.active]}>
              <img class={styles.icon} src={allIcon} alt='' srcset='' />
              <span>全部</span>
            </div>
          </div>
          <div class={styles.listContainer} id='list-container'>
            <div class={styles.listContent}>
              {clientStore.pointTypeList.map(item => {
                return (
                  <div
                    class={['type-list-item', styles.item, clientStore.pointSearchParams.typeId === item.id && styles.active]} key={item.id} onClick={() => {
                      handleClick(item)
                    }}
                  >
                    <img class={styles.icon} src={item.filePath} alt='' srcset='' />
                    <span>{item.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div class={styles.tips}>左右滑动</div>
          <div class={styles.tips}>点击筛选</div>
        </div>
      </div>
    )
  }
})
