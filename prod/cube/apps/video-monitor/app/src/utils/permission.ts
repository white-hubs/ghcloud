/**
 * 权限管理工具函数
 */
import type { DeviceAuth } from '@ghcloud/cube-service-interface/video-monitor'
import { DeviceAuthGrantTargetType, DeviceAuthScopeType } from '@ghcloud/cube-service-interface/video-monitor'
import { getUsersByIds, getOrganizations, getRoles } from '@ghcloud/cube-services-client/ouaa.client'
import { useAuthRequest } from '@/hooks/auth-request'
import type { OwnershipItem, ScopeItem, PermissionRecord, ScopeTreeNode, DeviceInfo } from '@/types/permission'
import type { Area } from '@ghcloud/cube-service-interface/metadata'
import type { DeviceGroup } from '@ghcloud/cube-service-interface/device-center'
import type { DeviceInstance } from '@ghcloud/cube-service-interface/device-center'
import { logger } from '@/logger'

/**
 * 将接口数据转换为前端显示格式（异步，需要调用接口获取名称）
 */
export const mapDeviceAuthToRecord = async (
  item: DeviceAuth,
  nameMap: Map<string, string>
): Promise<PermissionRecord> => {
  // 将授权范围转换为显示数组，根据 scopeType 区分类型
  const monitorScope: ScopeItem[] = item.authScopes.map(scope => {
    let type: ScopeItem['type'] = 'device'
    if (scope.scopeType === DeviceAuthScopeType.DEVICE_AREA) {
      type = 'area'
    } else if (scope.scopeType === DeviceAuthScopeType.DEVICE_GROUP) {
      type = 'group'
    } else if (scope.scopeType === DeviceAuthScopeType.DEVICE) {
      type = 'device'
    }
    return {
      type,
      name: scope.scopeName
    }
  })

  // 将授权目标转换为显示数组，根据 targetType 和 targetIds 获取对应的名称
  const ownership: OwnershipItem[] = []

  for (const target of item.grantTargets) {
    if (target.targetIds.length === 0) continue

    if (target.targetType === DeviceAuthGrantTargetType.DEPARTMENT) {
      // 部门：调用接口获取名称
      try {
        const orgs = await useAuthRequest(async () => getOrganizations({ ids: target.targetIds }))
        orgs.forEach(org => {
          ownership.push({ type: 'department', name: org.name })
          nameMap.set(org.id, org.name)
        })
      } catch (error) {
        logger.error('获取部门名称失败:', error)
        // 失败时使用 ID 作为后备
        target.targetIds.forEach(id => {
          const name = nameMap.get(id) || id
          ownership.push({ type: 'department', name })
        })
      }
    } else if (target.targetType === DeviceAuthGrantTargetType.ROLE) {
      // 角色：调用接口获取所有角色，然后过滤
      try {
        const roles = await useAuthRequest(async () => getRoles())
        const roleMap = new Map(roles.map(r => [r.id, r.name]))
        target.targetIds.forEach(id => {
          const name = roleMap.get(id) || nameMap.get(id) || id
          ownership.push({ type: 'role', name })
          if (!nameMap.has(id)) {
            nameMap.set(id, name)
          }
        })
      } catch (error) {
        logger.error('获取角色名称失败:', error)
        target.targetIds.forEach(id => {
          const name = nameMap.get(id) || id
          ownership.push({ type: 'role', name })
        })
      }
    } else if (target.targetType === DeviceAuthGrantTargetType.USER) {
      // 人员：调用接口获取名称
      try {
        const users = await useAuthRequest(async () => getUsersByIds(target.targetIds.join(',')))
        users.forEach(user => {
          ownership.push({ type: 'user', name: user.name })
          nameMap.set(user.id, user.name)
        })
      } catch (error) {
        logger.error('获取人员名称失败:', error)
        target.targetIds.forEach(id => {
          const name = nameMap.get(id) || id
          ownership.push({ type: 'user', name })
        })
      }
    }
  }

  return {
    id: item.id,
    monitorScope,
    devicesCount: item.deviceCount,
    ownership
  }
}

/**
 * 将 Area 数据转换为 ScopeTreeNode
 */
export const convertAreaToScopeTreeNode = (area: Area): ScopeTreeNode => {
  const node: ScopeTreeNode = {
    key: area.id,
    title: area.aliasName || area.name,
    deviceIds: undefined // 设备关联信息需要从其他接口获取
  }
  if (area.children && area.children.length > 0) {
    node.children = area.children.map(convertAreaToScopeTreeNode)
  }
  return node
}

/**
 * 将 Area[] 转换为 ScopeTreeNode[]
 */
export const convertAreasToScopeTree = (areas: Area[]): ScopeTreeNode[] => {
  return areas.map(convertAreaToScopeTreeNode)
}

/**
 * 将 DeviceGroup 转换为 ScopeTreeNode
 */
export const convertGroupToScopeTreeNode = (group: DeviceGroup): ScopeTreeNode => {
  return {
    key: group.id,
    title: group.name,
    deviceIds: undefined // 设备关联信息需要从其他接口获取
  }
}

/**
 * 将 DeviceInstance 转换为 DeviceInfo
 */
export const convertDeviceInstanceToDeviceInfo = (device: DeviceInstance & { deviceName?: string; deviceCode?: string; }): DeviceInfo => {
  // 兼容不同的字段名：deviceName/deviceCode 或 name/code
  const name = device.name || device.deviceName || ''
  const code = device.code || device.deviceCode || ''
  return {
    id: device.id || '',
    code: code,
    name: name,
    region: device.thirdPartyId || '' // 使用 thirdPartyId 作为 region，如果没有则使用空字符串
  }
}

/**
 * 构建键值映射表
 */
export const buildKeyMap = (
  data: ScopeTreeNode[],
  map = new Map<string, ScopeTreeNode>()
): Map<string, ScopeTreeNode> => {
  data.forEach((node) => {
    map.set(node.key, node)
    if (node.children) {
      buildKeyMap(node.children, map)
    }
  })
  return map
}

/**
 * 将 checkedKeys 转换为字符串数组
 */
export const toCheckedKeys = (keys: string[] | { checked: string[]; }): string[] => {
  if (Array.isArray(keys)) {
    return keys as string[]
  }
  return (keys.checked ?? []) as string[]
}

