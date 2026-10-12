/**
 * 监控范围相关工具函数
 */
import type { DeviceAuthScope, DeviceAuthGrantTarget } from '@ghcloud/cube-service-interface/video-monitor'
import { DeviceAuthScopeType, DeviceAuthGrantTargetType } from '@ghcloud/cube-service-interface/video-monitor'
import { queryVideoMonitorDeviceByAreaOrGroupAndTag } from '@ghcloud/cube-services-client/video-monitor.client'
import { useAuthRequest } from '@/hooks/auth-request'
import type { ScopeTreeNode, DeviceInfo, DeviceDisplay } from '@/types/permission'
import { convertDeviceInstanceToDeviceInfo } from './permission'
import { logger } from '@/logger'

/**
 * 构建授权范围数据
 */
export const buildAuthScopes = (
  selectedAreaKeys: string[],
  selectedGroupKeys: string[],
  selectedDeviceKeys: string[],
  areaNodeMap: Map<string, ScopeTreeNode>,
  groupNodeMap: Map<string, ScopeTreeNode>,
  deviceDictionary: Record<string, DeviceInfo>
): DeviceAuthScope[] => {
  const scopes: DeviceAuthScope[] = []
  // 区域范围
  selectedAreaKeys.forEach(key => {
    const node = areaNodeMap.get(key)
    if (node) {
      scopes.push({
        scopeType: DeviceAuthScopeType.DEVICE_AREA,
        scopeName: node.title,
        scopeId: key
      })
    }
  })

  // 分组范围
  selectedGroupKeys.forEach(key => {
    const node = groupNodeMap.get(key)
    if (node) {
      scopes.push({
        scopeType: DeviceAuthScopeType.DEVICE_GROUP,
        scopeName: node.title,
        scopeId: key
      })
    }
  })

  // 设备范围
  selectedDeviceKeys.forEach(deviceId => {
    const device = deviceDictionary[deviceId]
    if (device) {
      scopes.push({
        scopeType: DeviceAuthScopeType.DEVICE,
        scopeName: device.name,
        scopeId: deviceId
      })
    }
  })

  return scopes
}

/**
 * 构建授权目标数据
 */
export const buildGrantTargets = (
  selectedDepartments: string[],
  selectedRoles: string[],
  selectedStaffs: string[]
): DeviceAuthGrantTarget[] => {
  const targets: DeviceAuthGrantTarget[] = []

  if (selectedDepartments.length > 0) {
    targets.push({
      targetType: DeviceAuthGrantTargetType.DEPARTMENT,
      targetIds: selectedDepartments
    })
  }

  if (selectedRoles.length > 0) {
    targets.push({
      targetType: DeviceAuthGrantTargetType.ROLE,
      targetIds: selectedRoles
    })
  }

  if (selectedStaffs.length > 0) {
    targets.push({
      targetType: DeviceAuthGrantTargetType.USER,
      targetIds: selectedStaffs
    })
  }

  return targets
}

/**
 * 根据区域ID查询设备
 */
export const queryDevicesByAreas = async (
  areaIds: string[],
  areaNodeMap: Map<string, ScopeTreeNode>,
  deviceDictionary: Record<string, DeviceInfo>
): Promise<DeviceDisplay[]> => {
  if (areaIds.length === 0) return []
  const devices: DeviceDisplay[] = []
  try {
    // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按区域查询设备
    const deviceInstances = await useAuthRequest(async () => queryVideoMonitorDeviceByAreaOrGroupAndTag({
      areaIds: areaIds
    }))
    // 为每个设备找到对应的区域节点，用于显示 fromScope
    deviceInstances.forEach(device => {
      const deviceInfo = convertDeviceInstanceToDeviceInfo(device)
      // 找到第一个匹配的区域节点
      const matchedAreaId = areaIds.find(id => {
        const node = areaNodeMap.get(id)
        return node !== undefined
      })
      const node = matchedAreaId ? areaNodeMap.get(matchedAreaId) : undefined
      devices.push({
        ...deviceInfo,
        fromScope: `区域 · ${node?.title || areaIds[0]}`
      })
      // 更新设备字典
      deviceDictionary[device.id] = deviceInfo
    })
  } catch (error) {
    logger.error('查询区域设备失败:', error)
  }
  return devices
}

/**
 * 根据分组ID查询设备
 */
export const queryDevicesByGroups = async (
  groupIds: string[],
  groupNodeMap: Map<string, ScopeTreeNode>,
  deviceDictionary: Record<string, DeviceInfo>
): Promise<DeviceDisplay[]> => {
  if (groupIds.length === 0) return []
  const devices: DeviceDisplay[] = []
  try {
    // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按分组查询设备
    const deviceInstances = await useAuthRequest(async () => queryVideoMonitorDeviceByAreaOrGroupAndTag({
      groupIds: groupIds
    }))
    // 为每个设备找到对应的分组节点，用于显示 fromScope
    deviceInstances.forEach(device => {
      const deviceInfo = convertDeviceInstanceToDeviceInfo(device)
      // 找到第一个匹配的分组节点
      const matchedGroupId = groupIds.find(id => {
        const node = groupNodeMap.get(id)
        return node !== undefined
      })
      const node = matchedGroupId ? groupNodeMap.get(matchedGroupId) : undefined
      devices.push({
        ...deviceInfo,
        fromScope: `分组 · ${node?.title || groupIds[0]}`
      })
      // 更新设备字典
      deviceDictionary[device.id] = deviceInfo
    })
  } catch (error) {
    logger.error('查询分组设备失败:', error)
  }
  return devices
}

/**
 * 根据设备ID查询设备
 */
export const queryDevicesByIds = async (
  deviceIds: string[],
  deviceDictionary: Record<string, DeviceInfo>
): Promise<DeviceDisplay[]> => {
  if (deviceIds.length === 0) return []
  const devices: DeviceDisplay[] = []
  try {
    // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按设备ID查询设备
    const deviceInstances = await useAuthRequest(async () => queryVideoMonitorDeviceByAreaOrGroupAndTag({
      deviceIds: deviceIds
    }))
    deviceInstances.forEach(device => {
      const deviceInfo = convertDeviceInstanceToDeviceInfo(device)
      devices.push({
        ...deviceInfo,
        fromScope: '直接选择'
      })
      // 更新设备字典
      deviceDictionary[device.id] = deviceInfo
    })
  } catch (error) {
    logger.error('查询设备失败:', error)
  }
  return devices
}

