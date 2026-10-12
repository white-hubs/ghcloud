import { computed, defineComponent, onMounted, ref } from 'vue'
import styles from './area-nav.module.less'
import { useStateStore } from '@/pages/state/use-state-store'
import { getAreaList } from '@/api/mdata'
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";// 引入swiper样式（按需导入）
import "swiper/css/navigation"; // 轮播图两边的左右箭头
import { Pagination, Navigation, Scrollbar } from "swiper";
import { eventInstance } from '@/pages/event/event'

export const AreaNav = defineComponent({
  name: 'AreaNav',
  setup () {
    const { globalState, getAreaById } = useStateStore()
    const currenList = computed(() => {
      let res = []
      if (globalState.business.currentAreaId){
        const currentArea = getAreaById(globalState.business.currentAreaId)
        if (currentArea.children.length){
          res = currentArea.children
        }
        // 如果没有下级区域，就返回当前区域的上级区域
        if (currentArea.parentId) {
          const parentArea = getAreaById(currentArea.parentId)
          res = parentArea?.children || []
        }
      } else {
        res = globalState.business.area
      }
      return res.sort((a, b) => {
        return a.sort - b.sort
      })
    })
    const selected = ref({ id: '', name: '' })
    const pageSize = 10
    const page = ref(1)
    const showPageButton = computed(() => {
      return currenList.value.length > pageSize
    })
    const showAreaNav = computed(() => {
      if (!globalState.menuVisible){
        return false
      }
      if (!globalState.panel.visible) {
        return false
      }
      if (!globalState.panel.leftPanelName) {
        return false
      }
      return globalState.panel.switchScene === 'BUILD' && globalState.business.area.length
    })

    const changeBuild = (item): void => {
      if (!item.children.length) {
        selected.value = item
      }
      eventInstance.emitEvent('handelClickBuild', item)
    }

    const back = (): void => {
      selected.value = { id: '', name: '' }
      eventInstance.emitEvent('backPreAreaLevel')
    }


    onMounted(async () => {
      const res = await getAreaList();
      if (res.length) {
        globalState.business.area = res
      }
    })

    return (): JSX.Element =>
      <div class={`${styles['tag-container']} ${showAreaNav.value ? styles['show'] : styles['hide']}`}>
        {
          globalState.business.currentAreaLeave > 1 &&
          <div class={styles['tag-item']} onClick={back}>返回</div>
        }
        <div
          class={`${styles['tag-item']} ${page.value === 1 ? styles['disabled'] : ''}`}
          style={{ display: showPageButton.value ? 'block' : 'none' }}>
          上一页
        </div>
        {
          currenList.value.length > 0 &&
          <Swiper
            class={styles['swiper-area']}
            modules={[Pagination, Navigation, Scrollbar]}
            slides-per-view={currenList.value.length < pageSize ? currenList.value.length : pageSize}
            slides-per-group={pageSize}
            direction="vertical"
          >
            {
              currenList.value.map((item) => {
                return (
                  <SwiperSlide key={item.id}>
                    <div
                      class={`${styles['tag-item']} ${item.id === selected.value?.id ? styles['active'] : ''}`}
                      onClick={() => {
                        changeBuild(item)
                      }}
                    >
                      { item.name }
                    </div>
                  </SwiperSlide>
                )
              })
            }
          </Swiper>
        }
        <div
          class={`${styles['tag-item']} ${page.value === Math.ceil(currenList.value.length / pageSize) ? styles['disabled'] : ''}`}
          style={{ visibility: showPageButton.value ? 'visible' : 'hidden' }}>
          下一页
        </div>
      </div>
  }
})