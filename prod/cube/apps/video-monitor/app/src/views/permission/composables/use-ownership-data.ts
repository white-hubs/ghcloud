/**
 * 权限归属数据管理 Composable
 */
import { ref, computed } from 'vue'
import { useAuthRequest } from '@/hooks/auth-request'
import { getUsersByIds, getOrganizations, getRoles, listUsers } from '@ghcloud/cube-services-client/ouaa.client'
import { getCameraAuth } from '@ghcloud/cube-services-client/video-monitor.client'
import { DeviceAuthGrantTargetType } from '@ghcloud/cube-service-interface/video-monitor'
import type { SelectOption } from '@/types/permission'
import type { Organization, Role, User } from '@ghcloud/cube-service-interface/ouaa'
import { MAX_LIST_SIZE } from '@/constants/permission'
import { message } from 'ant-design-vue'

export const useOwnershipData = () => {
  const selectedDepartments = ref<string[]>([])
  const selectedRoles = ref<string[]>([])
  const selectedStaffs = ref<string[]>([])
  
  // 选项数据
  const departmentOptions = ref<SelectOption[]>([])
  const roleOptions = ref<SelectOption[]>([])
  const userOptions = ref<SelectOption[]>([])
  
  // 选项数据加载状态
  const loadingDepartments = ref(false)
  const loadingRoles = ref(false)
  const loadingUsers = ref(false)
  
  // 搜索关键词
  const departmentSearchKeyword = ref('')
  const roleSearchKeyword = ref('')
  const userSearchKeyword = ref('')

  // 加载部门列表
  const loadDepartments = async (keyword?: string): Promise<void> => {
    if (loadingDepartments.value) return
    loadingDepartments.value = true
    try {
      const orgs = await useAuthRequest(() => getOrganizations({ 
        enabled: true,
        name: keyword
      }))
      // 将组织树结构扁平化
      const flattenOrgs = (orgs: Organization[]): Organization[] => {
        const result: Organization[] = []
        const traverse = (items: Organization[]) => {
          items.forEach(org => {
            result.push(org)
            if (org.children && org.children.length > 0) {
              traverse(org.children)
            }
          })
        }
        traverse(orgs)
        return result
      }
      const flatOrgs = flattenOrgs(orgs)
      departmentOptions.value = flatOrgs.map(org => ({
        label: org.name,
        value: org.id
      }))
    } catch (error) {
      message.error('加载部门列表失败')
    } finally {
      loadingDepartments.value = false
    }
  }
  
  // 加载已选中的部门（用于回显）
  const loadSelectedDepartments = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return
    try {
      const orgs = await useAuthRequest(() => getOrganizations({ ids }))
      const existingIds = new Set(departmentOptions.value.map(opt => opt.value))
      orgs.forEach(org => {
        if (!existingIds.has(org.id)) {
          departmentOptions.value.push({
            label: org.name,
            value: org.id
          })
        }
      })
    } catch (error) {
    }
  }
  
  // 加载角色列表
  const loadRoles = async (): Promise<void> => {
    if (loadingRoles.value) return
    loadingRoles.value = true
    try {
      const roles = await useAuthRequest(() => getRoles())
      roleOptions.value = roles
        .filter(role => role.enabled !== false)
        .map(role => ({
          label: role.name,
          value: role.id
        }))
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      loadingRoles.value = false
    }
  }
  
  // 加载已选中的角色（用于回显）
  const loadSelectedRoles = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return
    try {
      const roles = await useAuthRequest(() => getRoles())
      const existingIds = new Set(roleOptions.value.map(opt => opt.value))
      roles.forEach(role => {
        if (ids.includes(role.id) && !existingIds.has(role.id)) {
          roleOptions.value.push({
            label: role.name,
            value: role.id
          })
        }
      })
    } catch (error) {
    }
  }
  
  // 加载人员列表
  const loadUsers = async (keyword?: string): Promise<void> => {
    if (loadingUsers.value) return
    loadingUsers.value = true
    try {
      const response = await useAuthRequest(() => listUsers({
        keyword,
        pageSize: MAX_LIST_SIZE
      }))
      const users = response.records || []
      const existingIds = new Set(userOptions.value.map(opt => opt.value))
      users.forEach(user => {
        if (!existingIds.has(user.id)) {
          userOptions.value.push({
            label: user.name,
            value: user.id
          })
        }
      })
    } catch (error) {
      message.error('加载人员列表失败')
    } finally {
      loadingUsers.value = false
    }
  }
  
  // 加载已选中的人员（用于回显）
  const loadSelectedUsers = async (ids: string[]): Promise<void> => {
    if (ids.length === 0) return
    try {
      const users = await useAuthRequest(() => getUsersByIds(ids.join(',')))
      const existingIds = new Set(userOptions.value.map(opt => opt.value))
      users.forEach(user => {
        if (!existingIds.has(user.id)) {
          userOptions.value.push({
            label: user.name,
            value: user.id
          })
        }
      })
    } catch (error) {
    }
  }
  
  // 过滤后的选项（支持搜索）
  const filteredDepartmentOptions = computed(() => {
    if (!departmentSearchKeyword.value) return departmentOptions.value
    const keyword = departmentSearchKeyword.value.toLowerCase()
    return departmentOptions.value.filter(opt => 
      opt.label.toLowerCase().includes(keyword)
    )
  })
  
  const filteredRoleOptions = computed(() => {
    if (!roleSearchKeyword.value) return roleOptions.value
    const keyword = roleSearchKeyword.value.toLowerCase()
    return roleOptions.value.filter(opt => 
      opt.label.toLowerCase().includes(keyword)
    )
  })
  
  const filteredUserOptions = computed(() => {
    if (!userSearchKeyword.value) return userOptions.value
    const keyword = userSearchKeyword.value.toLowerCase()
    return userOptions.value.filter(opt => 
      opt.label.toLowerCase().includes(keyword)
    )
  })

  // 加载详情数据中的权限归属信息
  const loadOwnershipFromDetail = async (dataId: string): Promise<void> => {
    try {
      const data = await useAuthRequest(() => getCameraAuth(dataId))
      
      // 转换授权目标
      const deptTargets = data.grantTargets.filter(t => t.targetType === DeviceAuthGrantTargetType.DEPARTMENT)
      const roleTargets = data.grantTargets.filter(t => t.targetType === DeviceAuthGrantTargetType.ROLE)
      const userTargets = data.grantTargets.filter(t => t.targetType === DeviceAuthGrantTargetType.USER)
      
      selectedDepartments.value = deptTargets.flatMap(t => t.targetIds)
      selectedRoles.value = roleTargets.flatMap(t => t.targetIds)
      selectedStaffs.value = userTargets.flatMap(t => t.targetIds)
      
      // 加载已选中的选项数据，确保下拉框能正确显示
      if (selectedDepartments.value.length > 0) {
        await loadSelectedDepartments(selectedDepartments.value)
      }
      if (selectedRoles.value.length > 0) {
        await loadSelectedRoles(selectedRoles.value)
      }
      if (selectedStaffs.value.length > 0) {
        await loadSelectedUsers(selectedStaffs.value)
      }
    } catch (error) {
    }
  }

  return {
    selectedDepartments,
    selectedRoles,
    selectedStaffs,
    departmentOptions,
    roleOptions,
    userOptions,
    loadingDepartments,
    loadingRoles,
    loadingUsers,
    departmentSearchKeyword,
    roleSearchKeyword,
    userSearchKeyword,
    filteredDepartmentOptions,
    filteredRoleOptions,
    filteredUserOptions,
    loadDepartments,
    loadSelectedDepartments,
    loadRoles,
    loadSelectedRoles,
    loadUsers,
    loadSelectedUsers,
    loadOwnershipFromDetail
  }
}

