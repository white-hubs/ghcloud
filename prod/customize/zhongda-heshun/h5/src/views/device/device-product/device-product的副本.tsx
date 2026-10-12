import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from './device-product.module.less'
import { Search, Empty, Popup, Button, Toast, List } from 'vant'
import { useRoute, useRouter } from 'vue-router'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { getAssetsFile } from '@/utils/index'
import { cubeDeviceCenterService } from '@/api/server'
import { SkeletonBody } from '@/components/skeleton-body/skeleton-body'
import type { ProductCategoryTree, Product } from '@ghcloud/cube-iot-center-service'
import { storeKill } from '@/store/kill'
import { useScanCode } from '@/hooks/use-scan-code'

/**
 * 设备添加页面组件
 */
export const DeviceProduct = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(false)
    useMetaTitle()
    const router = useRouter()
    const route = useRoute()
    const showDevicePicker = ref(false)
    const loading = ref(true)
    // 搜索关键字
    const keyword = ref('')

    const store = storeKill()
    const { scanCodeResult, handleScanResult } = useScanCode()
    
    // 设备类型选项卡
    const tabActive = ref('')
    const tabs = ref<ProductCategoryTree[]>([])
    const allTabs = ref<ProductCategoryTree[]>([])
    const currentTabLevel = ref(0) // 当前标签级别
    const parentTabIds = ref<string[]>([]) // 父级标签ID列表
    const categoryPath = ref<string[]>([]) // 分类路径，用于面包屑导航
    
    // 设备列表数据
    const deviceList = ref<any[]>([])
    const deviceListFinished = ref(false) // 设备列表是否加载完成
    const deviceListLoading = ref(false) // 设备列表加载状态
    

    // 设备列表分页参数
    const tableSearch = reactive({
      pageNumber: 1,
      pageSize: 20,
      prodCategoryId: undefined as string | undefined,
      prodName: undefined as string | undefined,
      total: 0
    })
    
    // 加载状态
    const modalLoading = ref(false)
    
    // 处理返回按钮点击
    const handleBack = (): void => {
      router.back()
    }
    
    // 处理搜索
    const onSearch = (val: string): void => {
      tableSearch.pageNumber = 1
      deviceList.value = []
      deviceListFinished.value = false
      
      getContactProduct(tabActive.value || '')
    }
    
    /**
     * 处理设备类型切换
     * 如果选中的分类有子节点，则展开子节点
     * 如果没有子节点，则加载该分类下的产品列表
     */
    const onTabChange = (tab: ProductCategoryTree): void => {
      // 如果有子节点，则展开子节点
      if (tab.children && tab.children.length > 0) {
        parentTabIds.value.push(tabActive.value)
        categoryPath.value.push(tab.itemLabel)
        currentTabLevel.value++
        // 更新标签页为子节点
        tabs.value = tab.children
        tabActive.value = '' // 清空当前选中，等待用户选择子分类
      } else {
        // 没有子节点，直接切换
        tabActive.value = tab.id
        resetDeviceList()
        getContactProduct(tab.id)
      }
    }
    
    /**
     * 返回上一级标签
     * 根据当前级别和父级ID列表，找到上一级的标签列表并显示
     */
    const goBackTab = (): void => {
      if (currentTabLevel.value > 0) {
        currentTabLevel.value--
        const parentId = parentTabIds.value.pop() || ''
        categoryPath.value.pop() // 移除当前路径
        
        // 查找父级节点的同级节点
        let parentTabs: ProductCategoryTree[] = allTabs.value
        
        // 遍历父级ID列表，找到当前级别的父节点
        for (let i = 0; i < currentTabLevel.value; i++) {
          const id = parentTabIds.value[i]
          const parent = findCategoryById(parentTabs, id)
          if (parent && parent.children) {
            parentTabs = parent.children
          }
        }
        
        tabs.value = parentTabs
        tabActive.value = parentId
        resetDeviceList()
        if (parentId) {
          getContactProduct(parentId)
        }
      }
    }
    
    /**
     * 根据ID在分类树中查找节点
     */
    const findCategoryById = (categories: ProductCategoryTree[], id: string): ProductCategoryTree | undefined => {
      for (const category of categories) {
        if (category.id === id) {
          return category
        }
        if (category.children && category.children.length > 0) {
          const found = findCategoryById(category.children, id)
          if (found) return found
        }
      }
      return undefined
    }
    
    // 重置设备列表
    const resetDeviceList = (): void => {
      deviceList.value = []
      tableSearch.pageNumber = 1
      deviceListFinished.value = false
    }
    
    // 处理设备选择
    const handleSelectDevice = (product: Product): void => {
      store.selectProduct = product
      // 选择设备后的逻辑
      const { type } = route.query
      if (['hand', 'scan'].includes(type as string)) {
        handleDeviceAdd(type as 'hand' | 'scan')
      } else {
        showDevicePicker.value = true
      }
    }
    
    /**
     * 获取产品分类数据
     * 使用getProductCategoryTree获取完整的分类树结构
     */
    const getTableData = async (isLoadMore = false): Promise<void> => {
      try {
        if (!isLoadMore) {
          loading.value = true
        }
        modalLoading.value = true
        
        // 使用getProductCategoryTree获取完整的分类树
        const treeData = await cubeDeviceCenterService.getProductCategoryTree()
        
        if (treeData && treeData.length > 0) {
          allTabs.value = treeData // 保存完整的分类树
          
          // 如果是在顶级，显示顶级分类
          if (currentTabLevel.value === 0) {
            tabs.value = treeData
            
            // 默认选中第一个分类
            // if (!tabActive.value && treeData.length > 0) {
            //   const firstCategory = treeData[0]
            //   if (firstCategory.children && firstCategory.children.length > 0) {
            //     // 如果第一个分类有子分类，不自动选中，等待用户选择
            //     tabActive.value = ''
            //   } else {
            //     // 如果没有子分类，直接选中并加载产品
            //     tabActive.value = firstCategory.id
            //     // getContactProduct(firstCategory.id)
            //   }
            // }
          }
        }
      } catch (error) {
        Toast.fail('获取产品分类失败')
      } finally {
        modalLoading.value = false
        loading.value = false
      }
    }
    
    // 获取品类关联产品
    const getContactProduct = async (categoryId?: string): Promise<void> => {
      try {
        if (tableSearch.pageNumber === 1) {
          deviceListLoading.value = true
        }
        
        tableSearch.prodCategoryId = categoryId
        
        const params = {
          pageNumber: tableSearch.pageNumber,
          pageSize: tableSearch.pageSize,
          prodName: tableSearch.prodName || undefined,
          prodCategoryId: categoryId
        }
        
        const { records, total } = await cubeDeviceCenterService.getProductPage(params) as {
          records: any[];
          total: number;
        }
        
        if (tableSearch.pageNumber === 1) {
          deviceList.value = records || []
        } else {
          // 追加数据
          deviceList.value = [...deviceList.value, ...(records || [])]
        }
        
        tableSearch.total = total
        deviceListFinished.value = deviceList.value.length >= total
      } catch (error) {
        Toast.fail('获取产品列表失败')
        if (tableSearch.pageNumber === 1) {
          deviceList.value = []
        }
      } finally {
        deviceListLoading.value = false
      }
    }
    
    // 加载更多设备
    const loadMoreDevices = async (): Promise<void> => {
      if (!deviceListFinished.value && !deviceListLoading.value) {
        tableSearch.pageNumber++
        await getContactProduct(tabActive.value)
      }
    }
    
    const onCancel = () => {
      showDevicePicker.value = false
    }
    
    const handleDeviceAdd =  async (type: 'scan' | 'hand'): Promise<void> => {
      if(type === 'scan'){
        scanCodeResult.value = {}
        await handleScanResult()
      }
      if (type === 'hand') {
        router.push({ path: '/device-manual-add' })
      }
      showDevicePicker.value = false
    }
    
    // 监听搜索关键字变化
    watch(() => tableSearch.prodName, (newVal) => {
      if (newVal === '') {
        // 清空搜索时重新加载
        resetDeviceList()
        if (tabActive.value) {
          getContactProduct(tabActive.value)
        }
      }
    })
    
    onMounted(() => {
      // 获取设备类型和设备列表
      getTableData()
      getContactProduct()
    })
    
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles.searchBox}>
          <Search
            v-model={tableSearch.prodName}
            placeholder="产品名称"
            onSearch={onSearch}
            shape="round"
          />
        </div>
        {
          loading.value ? <SkeletonBody/> :
          <div class={styles.content}>
            {/* 标签导航栏 */}
            <div class={styles.navbar}>
              {currentTabLevel.value > 0 && (
                <div class={[styles.tab, styles.backTab]} onClick={goBackTab}>
                  返回上级
                </div>
              )}
              
              {/* 分类路径 */}
              {categoryPath.value.length > 0 && (
                <div class={styles.categoryPath}>
                  {categoryPath.value.join(' > ')}
                </div>
              )}
              
              {/* 标签列表 */}
              <List
                loading={modalLoading.value}
                finished={true} // 使用getProductCategoryTree获取完整树，不需要分页加载
                immediateCheck={false}
              >
                {tabs.value.map((tab) => (
                  <div 
                    class={[styles.tab, tabActive.value === tab.id ? styles.active : '']} 
                    onClick={() => onTabChange(tab)} 
                    key={tab.id}
                  >
                    <span class={(tab.children && tab.children.length > 0)?styles.hasChildrenTab:''}>
                      {tab.itemLabel}
                    </span>
                      
                    {tab.children && tab.children.length > 0 && (
                      <span class={styles.hasChildren}>&gt;</span>
                    )}
                  </div>
                ))} 
              </List>
            </div>
            
            {/* 设备列表 */}
            <div class={styles.deviceList}>
              <List
                loading={deviceListLoading.value}
                finished={deviceListFinished.value}
                onLoad={loadMoreDevices}
                immediateCheck={false}
                loadingText="加载中..."
                finishedText="没有更多了"
              >
                {deviceList.value.length > 0 ? (
                  <div class={styles.grid}>
                    {deviceList.value.map(device => (
                      <div 
                        class={styles.deviceItem} 
                        key={device.id}
                        onClick={() => handleSelectDevice(device)}
                      >
                        <div class={styles.deviceIcon}>
                          <img src={getAssetsFile('device-default.png')} alt="设备图标" />
                        </div>
                        <div class={styles.deviceInfo}>
                          <div class={styles.deviceName}>{device.prodName}</div>
                          <div class={styles.deviceCode}>{device.prodBrandName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty description="暂无产品" />
                )}
              </List>
            </div>
          </div>
        }
        
        <Popup 
          v-model:show={showDevicePicker.value} 
          position="bottom" 
          round
          closeOnClickOverlay={true}
          onClickOverlay={onCancel}
          teleport='#app'
        >
          <div class={styles['add-device']}>
            <div class={styles['add-title']}>选择添加方式</div>
            <div class={styles['add-flex']}>
              <div class={styles['add-item']} onClick={() => handleDeviceAdd('scan')}>
                <img class={styles['add-item-icon']} src={getAssetsFile('scan-add.png')} alt="扫码添加" />
                <div class={styles['add-item-text']}>扫码添加</div>
              </div>
              <div class={styles['add-item']} onClick={() => handleDeviceAdd('hand')}>
                <img class={styles['add-item-icon']} src={getAssetsFile('handle-add.png')} alt="手动添加" />
                <div class={styles['add-item-text']}>手动添加</div>
              </div>
            </div>
            <Button class={styles['bottom-button']} onClick={onCancel}>取消</Button>
          </div>
        </Popup>
      </div>
    )
  }
})