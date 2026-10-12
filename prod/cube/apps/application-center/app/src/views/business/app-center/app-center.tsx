import { defineComponent, ref, onMounted } from 'vue'
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import styles from './app-center.module.less'
import { AppCard } from './app-card/app-card'
import { cubeApplicationCenterService } from '@/api/service'
import type { ApplicationEntity, ApplicationTypeEntity } from '@ghcloud/cube-application-center-service'
import '@wangeditor/editor/dist/css/style.css'

export const AppCenter = defineComponent({
  setup () {
    const searchValue = ref('')
    const activeType = ref('all')
    const filteredApps = ref<ApplicationEntity[]>([])
    const appTypes = ref<ApplicationTypeEntity[]>([])
    const typeListRef = ref<HTMLDivElement | null>(null)
    const typeItemRefs = ref<Map<string, HTMLDivElement>>(new Map())
    const searchInputRef = ref<HTMLInputElement | null>(null)

    // 根据搜索和类型过滤应用
    const filterApps = async (): Promise<void> => {
      filteredApps.value = await cubeApplicationCenterService.getMarketApplications({
        keyword: searchValue.value,
        applicationGroupId: activeType.value === 'all' ? '' : activeType.value,
      })
    }

    const filterAppTypes = async (): Promise<void> => {
      appTypes.value = await cubeApplicationCenterService.getApplicationTypeList()
      appTypes.value.unshift({
        id: 'all',
        name: '全部场景',
      })
    }

    // 处理搜索输入
    const handleSearchInput = (e: Event): void => {
      searchValue.value = (e.target as HTMLInputElement).value
      activeType.value = 'all'
      filterApps()
    }

    // 清除搜索内容
    const clearSearch = (): void => {
      searchValue.value = ''
      activeType.value = 'all'
      filterApps()
      if (searchInputRef.value) {
        searchInputRef.value.focus()
      }
    }

    // 处理类型切换
    const handleTypeChange = (typeId: string): void => {
      activeType.value = typeId
      filterApps()
      scrollToActiveType(typeId)
    }

    // 滚动到选中的类型按钮（滚动到中间位置）
    const scrollToActiveType = (typeId: string): void => {
      if (!typeListRef.value) return

      const activeItem = typeItemRefs.value.get(typeId)
      if (!activeItem) return

      const container = typeListRef.value
      const containerRect = container.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()

      // 计算元素相对于容器的位置
      const scrollLeft = container.scrollLeft
      const itemLeft = itemRect.left - containerRect.left + scrollLeft
      const itemWidth = itemRect.width
      const containerWidth = containerRect.width

      // 计算目标滚动位置：让选中元素居中
      const targetScrollLeft = itemLeft + (itemWidth / 2) - (containerWidth / 2)

      // 滚动到目标位置
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth'
      })
    }

    // 设置类型按钮引用
    const setTypeItemRef = (el: HTMLDivElement | null, typeId: string): void => {
      if (el) {
        typeItemRefs.value.set(typeId, el)
      }
    }

    onMounted(() => {
      filterAppTypes()
      filterApps()
    })

    return (): JSX.Element => (
      <div class={styles['app-center']}>
        {/* 顶部搜索区域 */}
        <div class={styles['search-section']}>
          <div class={styles['search-content']}>
            <h1 class={styles['title']}>
              应用中心
            </h1>
            <p class={styles['subtitle']}>
              古河云科技深耕技术，打造企业级SaaS平台，为客户提供全场景的产品与服务。
            </p>
            <div class={styles['search-box']}>
              <div class={styles['custom-search-input']}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="搜索你感兴趣的应用"
                  value={searchValue.value}
                  onInput={handleSearchInput}
                  class={styles['search-input-field']}
                  maxlength={50}
                />
                <div class={styles['search-input-suffix']}>
                  {searchValue.value && (
                    <CloseCircleOutlined
                      class={styles['clear-icon']}
                      onClick={clearSearch}
                    />
                  )}
                  <SearchOutlined class={styles['search-icon']} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 应用分类区域 */}
        <div class={styles['category-section']}>
          <div class={styles['type-scroll-container']} ref={typeListRef}>
            <div class={styles['type-list']}>
              {appTypes.value.map(type => (
                <div
                  key={type.id}
                  class={[
                    styles['type-item'],
                    { [styles.active]: activeType.value === type.id }
                  ]}
                  onClick={() => handleTypeChange(type.id)}
                  ref={(el) => setTypeItemRef(el as HTMLDivElement, type.id)}
                >
                  {type.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 应用列表区域 */}
        <div class={styles['apps-section']}>
          <div class={styles['apps-grid']}>
            {filteredApps.value.map(app => (
              <div class={styles['app-item']} key={app.id}>
                <AppCard app={app} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
})