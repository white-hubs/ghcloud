/**
 * 监控范围数据管理 Composable
 */
import { ref, computed, watch } from 'vue'
import { nextTick } from 'vue'
import { useAuthRequest } from '@/hooks/auth-request'
import { listAllArea } from '@ghcloud/cube-services-client/metadata.client'
import { listVideoMonitorGroup, listVideoMonitorDevice } from '@ghcloud/cube-services-client/video-monitor.client'
import { getCameraAuth } from '@ghcloud/cube-services-client/video-monitor.client'
import { DeviceAuthScopeType } from '@ghcloud/cube-service-interface/video-monitor'
import type { ScopeTreeNode, DeviceDisplay, DeviceInfo } from '@/types/permission'
import { convertAreasToScopeTree, convertGroupToScopeTreeNode, convertDeviceInstanceToDeviceInfo, buildKeyMap } from '@/utils/permission'
import { queryDevicesByAreas, queryDevicesByGroups, queryDevicesByIds } from '@/utils/scope'
import { DEBOUNCE_DELAY, MAX_LIST_SIZE } from '@/constants/permission'
import { message } from 'ant-design-vue'
import type { Area } from '@ghcloud/cube-service-interface/metadata'
import type { DeviceGroup } from '@ghcloud/cube-service-interface/device-center'

export const useScopeData = () => {
  const scopeTab = ref<'area' | 'group' | 'device'>('area')
  const areaTreeData = ref<ScopeTreeNode[]>([])
  const areaNodeMap = ref<Map<string, ScopeTreeNode>>(new Map())
  const groupTreeData = ref<ScopeTreeNode[]>([])
  const groupNodeMap = ref<Map<string, ScopeTreeNode>>(new Map())
  const deviceList = ref<DeviceInfo[]>([])
  const deviceDictionary = ref<Record<string, DeviceInfo>>({})
  const selectedAreaKeys = ref<string[]>([])
  const selectedGroupKeys = ref<string[]>([])
  const selectedDeviceKeys = ref<string[]>([])
  const areaDevices = ref<DeviceDisplay[]>([])
  const groupDevices = ref<DeviceDisplay[]>([])
  const derivedDevices = ref<DeviceDisplay[]>([])
  
  // 搜索关键词
  const areaSearchKeyword = ref('')
  const groupSearchKeyword = ref('')
  const deviceSearchKeyword = ref('')

  // 过滤后的区域树数据
  const filteredAreaTreeData = computed(() => {
    if (!areaSearchKeyword.value) return areaTreeData.value
    const filterTree = (nodes: ScopeTreeNode[]): ScopeTreeNode[] => {
      return nodes.filter(node => {
        const matches = node.title.toLowerCase().includes(areaSearchKeyword.value.toLowerCase())
        const filteredChildren = node.children ? filterTree(node.children) : []
        if (matches || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren.length > 0 ? filteredChildren : node.children
          }
        }
        return false
      }).map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined
      }))
    }
    return filterTree(areaTreeData.value)
  })
  
  // 过滤后的分组树数据
  const filteredGroupTreeData = computed(() => {
    if (!groupSearchKeyword.value) return groupTreeData.value
    return groupTreeData.value.filter(node => 
      node.title.toLowerCase().includes(groupSearchKeyword.value.toLowerCase())
    )
  })
  
  // 过滤后的设备列表
  const filteredDeviceList = computed(() => {
    if (!deviceSearchKeyword.value) return deviceList.value
    const keyword = deviceSearchKeyword.value.toLowerCase()
    return deviceList.value.filter(device => 
      device.name.toLowerCase().includes(keyword) ||
      device.code.toLowerCase().includes(keyword) ||
      device.region.toLowerCase().includes(keyword)
    )
  })

  // 加载区域树数据
  const loadAreaTreeData = async (): Promise<void> => {
    try {
      const response = await useAuthRequest(() => listAllArea())
      // 处理不同的响应格式：可能是 { records: [...] } 或直接是数组
      let areas: Area[] = []
      if (Array.isArray(response)) {
        areas = response
      } else if (response && typeof response === 'object') {
        areas = (response as any).records || (response as any).data || []
      }
      areaTreeData.value = convertAreasToScopeTree(areas)
      areaNodeMap.value = buildKeyMap(areaTreeData.value)
    } catch (error) {
      message.error('加载区域数据失败')
    }
  }
  
  // 加载监控分组数据
  const loadGroupTreeData = async (): Promise<void> => {
    try {
      // 检查函数是否存在
      if (typeof listVideoMonitorGroup !== 'function') {
        // 尝试动态导入
        try {
          const module = await import('@ghcloud/cube-services-client/video-monitor.client')
          if (typeof module.listVideoMonitorGroup === 'function') {
            const response = await useAuthRequest(() => module.listVideoMonitorGroup({
              pageNumber: 1,
              pageSize: MAX_LIST_SIZE
            }))
            const groups = response.records || []
            groupTreeData.value = groups.map(convertGroupToScopeTreeNode)
            groupNodeMap.value = buildKeyMap(groupTreeData.value)
            return
          }
        } catch (importError) {
          // 动态导入失败，继续使用静态导入
        }
        return
      }
      const response = await useAuthRequest(() => listVideoMonitorGroup({
        pageNumber: 1,
        pageSize: MAX_LIST_SIZE
      }))
      const groups = response.records || []
      groupTreeData.value = groups.map(convertGroupToScopeTreeNode)
      groupNodeMap.value = buildKeyMap(groupTreeData.value)
    } catch (error) {
      message.error('加载监控分组数据失败')
    }
  }
  
  // 加载设备列表
  const loadDeviceList = async (): Promise<void> => {
    try {
      const response = await useAuthRequest(() => listVideoMonitorDevice({
        pageNumber: 1,
        pageSize: MAX_LIST_SIZE
      }))
      const deviceInstances = response.records || []
      deviceList.value = deviceInstances.map(convertDeviceInstanceToDeviceInfo)
      deviceInstances.forEach(device => {
        const deviceInfo = convertDeviceInstanceToDeviceInfo(device)
        deviceDictionary.value[device.id] = deviceInfo
      })
    } catch (error) {
      message.error('加载设备列表失败')
    }
  }

  // 同步直接选择的设备（更新设备字典，供 manualDevices 使用）
  const syncManualDevices = async (): Promise<void> => {
    if (selectedDeviceKeys.value.length === 0) return
    try {
      await queryDevicesByIds(selectedDeviceKeys.value, deviceDictionary.value)
    } catch (error) {
    }
  }

  // 防抖定时器
  let syncAreaDevicesTimer: ReturnType<typeof setTimeout> | null = null
  let syncGroupDevicesTimer: ReturnType<typeof setTimeout> | null = null
  
  // 同步区域设备
  const syncAreaDevices = async (): Promise<void> => {
    const areaDevicesResult = await queryDevicesByAreas(selectedAreaKeys.value, areaNodeMap.value, deviceDictionary.value)
    areaDevices.value = areaDevicesResult
    // 更新合并的设备列表
    const union = new Map<string, DeviceDisplay>()
    areaDevicesResult.forEach(device => union.set(device.id, device))
    groupDevices.value.forEach(device => union.set(device.id, device))
    derivedDevices.value = Array.from(union.values())
  }
  
  // 同步分组设备
  const syncGroupDevices = async (): Promise<void> => {
    const groupDevicesResult = await queryDevicesByGroups(selectedGroupKeys.value, groupNodeMap.value, deviceDictionary.value)
    groupDevices.value = groupDevicesResult
    // 更新合并的设备列表
    const union = new Map<string, DeviceDisplay>()
    areaDevices.value.forEach(device => union.set(device.id, device))
    groupDevicesResult.forEach(device => union.set(device.id, device))
    derivedDevices.value = Array.from(union.values())
  }
  
  // 分别监听区域和分组的变化，只查询对应的设备
  watch(selectedAreaKeys, async () => {
    // 清除之前的定时器，实现防抖
    if (syncAreaDevicesTimer) {
      clearTimeout(syncAreaDevicesTimer)
    }
    syncAreaDevicesTimer = setTimeout(async () => {
      await syncAreaDevices()
      syncAreaDevicesTimer = null
    }, DEBOUNCE_DELAY)
  }, { deep: true })
  
  watch(selectedGroupKeys, async () => {
    // 清除之前的定时器，实现防抖
    if (syncGroupDevicesTimer) {
      clearTimeout(syncGroupDevicesTimer)
    }
    syncGroupDevicesTimer = setTimeout(async () => {
      await syncGroupDevices()
      syncGroupDevicesTimer = null
    }, DEBOUNCE_DELAY)
  }, { deep: true })
  
  watch(selectedDeviceKeys, async () => {
    await syncManualDevices()
  }, { deep: true })
  
  // 监听标签切换，加载对应的数据
  watch(scopeTab, async (newTab) => {
    if (newTab === 'device' && deviceList.value.length === 0) {
      await loadDeviceList()
    }
    if (newTab === 'group' && groupTreeData.value.length === 0) {
      await loadGroupTreeData()
    }
  })

  // 加载详情数据中的范围信息
  const loadScopeFromDetail = async (dataId: string): Promise<void> => {
    try {
      const data = await useAuthRequest(() => getCameraAuth(dataId))
      
      // 转换授权范围
      const areaScopes = data.authScopes.filter(s => s.scopeType === DeviceAuthScopeType.DEVICE_AREA)
      const groupScopes = data.authScopes.filter(s => s.scopeType === DeviceAuthScopeType.DEVICE_GROUP)
      const deviceScopes = data.authScopes.filter(s => s.scopeType === DeviceAuthScopeType.DEVICE)
      
      // 尝试通过 scopeName 匹配树节点（因为 scopeId 可能是数据库 ID，与 mock 数据的 key 不匹配）
      const findNodeByScopeName = (scopeName: string, nodeMap: Map<string, ScopeTreeNode>): string | null => {
        for (const [key, node] of nodeMap.entries()) {
          if (node.title === scopeName) {
            return key
          }
        }
        return null
      }
      
      // 优先通过 scopeId 匹配，如果匹配不上再通过 scopeName 匹配
      const matchedAreaKeys = areaScopes.map(s => {
        // 先尝试通过 scopeId 直接匹配
        const areaMap = areaNodeMap.value
        if (areaMap && typeof areaMap.get === 'function' && areaMap.get(s.scopeId)) {
          return s.scopeId
        }
        // 再尝试通过 scopeName 匹配
        return findNodeByScopeName(s.scopeName, areaNodeMap.value)
      }).filter((key): key is string => key !== null)
      
      const matchedGroupKeys = groupScopes.map(s => {
        // 先尝试通过 scopeId 直接匹配
        const groupMap = groupNodeMap.value
        if (groupMap && typeof groupMap.get === 'function' && groupMap.get(s.scopeId)) {
          return s.scopeId
        }
        // 再尝试通过 scopeName 匹配
        return findNodeByScopeName(s.scopeName, groupNodeMap.value)
      }).filter((key): key is string => key !== null)
      
      // 使用 nextTick 批量设置值，避免 watch 被多次触发
      await nextTick()
      selectedAreaKeys.value = matchedAreaKeys.length > 0 ? matchedAreaKeys : areaScopes.map(s => s.scopeId)
      selectedGroupKeys.value = matchedGroupKeys.length > 0 ? matchedGroupKeys : groupScopes.map(s => s.scopeId)
      selectedDeviceKeys.value = deviceScopes.map(s => s.scopeId)
      
      // 加载设备详情
      if (deviceScopes.length > 0) {
        await queryDevicesByIds(deviceScopes.map(s => s.scopeId), deviceDictionary.value)
      }
    } catch (error) {
    }
  }

  const handleClearScopes = (): void => {
    selectedAreaKeys.value = []
    selectedGroupKeys.value = []
    selectedDeviceKeys.value = []
    areaDevices.value = []
    groupDevices.value = []
    derivedDevices.value = []
  }

  return {
    scopeTab,
    areaTreeData,
    areaNodeMap,
    groupTreeData,
    groupNodeMap,
    deviceList,
    deviceDictionary,
    selectedAreaKeys,
    selectedGroupKeys,
    selectedDeviceKeys,
    areaDevices,
    groupDevices,
    derivedDevices,
    areaSearchKeyword,
    groupSearchKeyword,
    deviceSearchKeyword,
    filteredAreaTreeData,
    filteredGroupTreeData,
    filteredDeviceList,
    loadAreaTreeData,
    loadGroupTreeData,
    loadDeviceList,
    loadScopeFromDetail,
    handleClearScopes
  }
}

