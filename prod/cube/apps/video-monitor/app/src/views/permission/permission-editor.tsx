import { Button, Card, Checkbox, Empty, List, Select, Space, Tabs, Tag, Tree, message, Input } from "ant-design-vue";
import type { TreeProps } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { defineComponent, ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";

import type { DeviceInstance, DeviceGroup } from "@ghcloud/cube-service-interface/device-center";
import type { Area } from "@ghcloud/cube-service-interface/metadata";
import type { Organization } from "@ghcloud/cube-service-interface/ouaa";
import type { DeviceAuthScope, DeviceAuthGrantTarget } from "@ghcloud/cube-service-interface/video-monitor";
import { DeviceAuthScopeType, DeviceAuthGrantTargetType } from "@ghcloud/cube-service-interface/video-monitor";
import { listAllArea } from "@ghcloud/cube-services-client/metadata.client";
import { getUsersByIds, getOrganizations, getRoles, listUsers } from "@ghcloud/cube-services-client/ouaa.client";
import {
  createCameraAuth,
  updateCameraAuth,
  getCameraAuth,
  listVideoMonitorDevice,
  listVideoMonitorGroup,
  queryVideoMonitorDeviceByAreaOrGroupAndTag,
} from "@ghcloud/cube-services-client/video-monitor.client";

import { useAuthRequest } from "@/hooks/auth-request";

import "./permission-editor.less";

interface DeviceInfo {
  id: string;
  code: string;
  name: string;
  region: string;
}

interface ScopeTreeNode {
  key: string;
  title: string;
  deviceIds?: string[];
  children?: ScopeTreeNode[];
}

interface DeviceDisplay extends DeviceInfo {
  fromScope: string;
}

// 将 Area 数据转换为 ScopeTreeNode
const convertAreaToScopeTreeNode = (area: Area): ScopeTreeNode => {
  const node: ScopeTreeNode = {
    key: area.id,
    title: area.aliasName || area.name,
    deviceIds: undefined, // 设备关联信息需要从其他接口获取
  };
  if (area.children && area.children.length > 0) {
    node.children = area.children.map(convertAreaToScopeTreeNode);
  }
  return node;
};

// 将 Area[] 转换为 ScopeTreeNode[]
const convertAreasToScopeTree = (areas: Area[]): ScopeTreeNode[] => areas.map(convertAreaToScopeTreeNode);

// 将 DeviceGroup 转换为 ScopeTreeNode
const convertGroupToScopeTreeNode = (group: DeviceGroup): ScopeTreeNode => ({
  key: group.id,
  title: group.name,
  deviceIds: undefined, // 设备关联信息需要从其他接口获取
});

// 将 DeviceInstance 转换为 DeviceInfo
const convertDeviceInstanceToDeviceInfo = (device: DeviceInstance | any): DeviceInfo => {
  // 兼容不同的字段名：deviceName/deviceCode 或 name/code
  const name = device.name || device.deviceName || "";
  const code = device.code || device.deviceCode || "";
  return {
    id: device.id || "",
    code: code,
    name: name,
    region: device.thirdPartyId || "", // 使用 thirdPartyId 作为 region，如果没有则使用空字符串
  };
};

// 选项数据接口类型
interface SelectOption {
  label: string;
  value: string;
}

const buildKeyMap = (data: ScopeTreeNode[], map = new Map<string, ScopeTreeNode>()): Map<string, ScopeTreeNode> => {
  data.forEach((node) => {
    map.set(node.key, node);
    if (node.children) {
      buildKeyMap(node.children, map);
    }
  });
  return map;
};

const toCheckedKeys = (keys: Key[] | { checked: Key[] }): string[] => {
  if (Array.isArray(keys)) {
    return keys as string[];
  }
  return (keys.checked ?? []) as string[];
};

export default defineComponent({
  name: "PermissionEditor",
  props: {
    mode: {
      type: String,
      default: "create",
    },
    id: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const scopeTab = ref<"area" | "group" | "device">("area");
    const areaTreeData = ref<ScopeTreeNode[]>([]);
    const areaNodeMap = ref<Map<string, ScopeTreeNode>>(new Map());
    const groupTreeData = ref<ScopeTreeNode[]>([]);
    const groupNodeMap = ref<Map<string, ScopeTreeNode>>(new Map());
    const deviceList = ref<DeviceInfo[]>([]);
    const deviceDictionary = ref<Record<string, DeviceInfo>>({});
    const selectedAreaKeys = ref<string[]>([]);
    const selectedGroupKeys = ref<string[]>([]);
    const selectedDeviceKeys = ref<string[]>([]);
    const areaDevices = ref<DeviceDisplay[]>([]);
    const groupDevices = ref<DeviceDisplay[]>([]);
    const derivedDevices = ref<DeviceDisplay[]>([]);
    const selectedDepartments = ref<string[]>([]);
    const selectedRoles = ref<string[]>([]);
    const selectedStaffs = ref<string[]>([]);

    // 选项数据
    const departmentOptions = ref<SelectOption[]>([]);
    const roleOptions = ref<SelectOption[]>([]);
    const userOptions = ref<SelectOption[]>([]);

    // 选项数据加载状态
    const loadingDepartments = ref(false);
    const loadingRoles = ref(false);
    const loadingUsers = ref(false);

    // 搜索关键词
    const areaSearchKeyword = ref("");
    const groupSearchKeyword = ref("");
    const deviceSearchKeyword = ref("");
    const departmentSearchKeyword = ref("");
    const roleSearchKeyword = ref("");
    const userSearchKeyword = ref("");

    const isReadonly = computed(() => props.mode === "detail");
    const pageTitle = computed(() => {
      if (props.mode === "create") {
        return "新增监控权限";
      }
      if (props.mode === "edit") {
        return "编辑监控权限";
      }
      return "权限详情";
    });

    const manualDevices = computed<DeviceDisplay[]>(() =>
      selectedDeviceKeys.value
        .map((id) => deviceDictionary.value[id])
        .filter((item): item is DeviceInfo => Boolean(item))
        .map((item) => ({
          ...item,
          fromScope: "直接选择",
        })),
    );

    // 过滤后的区域树数据
    const filteredAreaTreeData = computed(() => {
      if (!areaSearchKeyword.value) {
        return areaTreeData.value;
      }
      const filterTree = (nodes: ScopeTreeNode[]): ScopeTreeNode[] =>
        nodes
          .filter((node) => {
            const matches = node.title.toLowerCase().includes(areaSearchKeyword.value.toLowerCase());
            const filteredChildren = node.children ? filterTree(node.children) : [];
            if (matches || filteredChildren.length > 0) {
              return {
                ...node,
                children: filteredChildren.length > 0 ? filteredChildren : node.children,
              };
            }
            return false;
          })
          .map((node) => ({
            ...node,
            children: node.children ? filterTree(node.children) : undefined,
          }));
      return filterTree(areaTreeData.value);
    });

    // 过滤后的分组树数据
    const filteredGroupTreeData = computed(() => {
      if (!groupSearchKeyword.value) {
        return groupTreeData.value;
      }
      return groupTreeData.value.filter((node) => node.title.toLowerCase().includes(groupSearchKeyword.value.toLowerCase()));
    });

    // 过滤后的设备列表
    const filteredDeviceList = computed(() => {
      if (!deviceSearchKeyword.value) {
        return deviceList.value;
      }
      const keyword = deviceSearchKeyword.value.toLowerCase();
      return deviceList.value.filter(
        (device) =>
          device.name.toLowerCase().includes(keyword) ||
          device.code.toLowerCase().includes(keyword) ||
          device.region.toLowerCase().includes(keyword),
      );
    });

    const loading = ref(false);

    // 将接口数据转换为前端显示格式
    const loadDetailData = async (): Promise<void> => {
      // 获取要加载的数据 ID：优先使用 props.id，如果没有则使用路由查询参数中的 copyFrom（复制功能）
      const copyFromId = route.value.query.copyFrom;
      const dataId = props.id || (Array.isArray(copyFromId) ? copyFromId[0] : copyFromId) || undefined;
      if (!dataId || typeof dataId !== "string") {
        return;
      }
      loading.value = true;
      try {
        const data = await useAuthRequest(() => getCameraAuth(dataId));

        // 转换授权范围
        const areaScopes = data.authScopes.filter((s) => s.scopeType === DeviceAuthScopeType.DEVICE_AREA);
        const groupScopes = data.authScopes.filter((s) => s.scopeType === DeviceAuthScopeType.DEVICE_GROUP);
        const deviceScopes = data.authScopes.filter((s) => s.scopeType === DeviceAuthScopeType.DEVICE);

        // 提前设置标签页，避免用户看到切换动作
        if (areaScopes.length > 0) {
          scopeTab.value = "area";
        } else if (groupScopes.length > 0) {
          scopeTab.value = "group";
        } else if (deviceScopes.length > 0) {
          scopeTab.value = "device";
        }

        // 尝试通过 scopeName 匹配树节点（因为 scopeId 可能是数据库 ID，与 mock 数据的 key 不匹配）
        const findNodeByScopeName = (scopeName: string, nodeMap: Map<string, ScopeTreeNode>): string | null => {
          for (const [key, node] of nodeMap.entries()) {
            if (node.title === scopeName) {
              return key;
            }
          }
          return null;
        };

        // 优先通过 scopeId 匹配，如果匹配不上再通过 scopeName 匹配
        const matchedAreaKeys = areaScopes
          .map((s) => {
            // 先尝试通过 scopeId 直接匹配
            const areaMap = areaNodeMap.value;
            if (areaMap && typeof areaMap.get === "function" && areaMap.get(s.scopeId)) {
              return s.scopeId;
            }
            // 再尝试通过 scopeName 匹配
            return findNodeByScopeName(s.scopeName, areaNodeMap.value);
          })
          .filter((key): key is string => key !== null);

        const matchedGroupKeys = groupScopes
          .map((s) => {
            // 先尝试通过 scopeId 直接匹配
            const groupMap = groupNodeMap.value;
            if (groupMap && typeof groupMap.get === "function" && groupMap.get(s.scopeId)) {
              return s.scopeId;
            }
            // 再尝试通过 scopeName 匹配
            return findNodeByScopeName(s.scopeName, groupNodeMap.value);
          })
          .filter((key): key is string => key !== null);

        // 使用 nextTick 批量设置值，避免 watch 被多次触发
        await nextTick();
        selectedAreaKeys.value = matchedAreaKeys.length > 0 ? matchedAreaKeys : areaScopes.map((s) => s.scopeId);
        selectedGroupKeys.value = matchedGroupKeys.length > 0 ? matchedGroupKeys : groupScopes.map((s) => s.scopeId);
        selectedDeviceKeys.value = deviceScopes.map((s) => s.scopeId);

        // 加载设备详情
        if (deviceScopes.length > 0) {
          await loadDeviceDetails(deviceScopes.map((s) => s.scopeId));
        }

        // 注意：不需要显式调用同步设备函数，因为 watch 监听器会在 selectedAreaKeys 或 selectedGroupKeys 变化时自动调用对应的同步函数

        // 转换授权目标
        const deptTargets = data.grantTargets.filter((t) => t.targetType === DeviceAuthGrantTargetType.DEPARTMENT);
        const roleTargets = data.grantTargets.filter((t) => t.targetType === DeviceAuthGrantTargetType.ROLE);
        const userTargets = data.grantTargets.filter((t) => t.targetType === DeviceAuthGrantTargetType.USER);

        selectedDepartments.value = deptTargets.flatMap((t) => t.targetIds);
        selectedRoles.value = roleTargets.flatMap((t) => t.targetIds);
        selectedStaffs.value = userTargets.flatMap((t) => t.targetIds);

        // 加载已选中的选项数据，确保下拉框能正确显示
        if (selectedDepartments.value.length > 0) {
          await loadSelectedDepartments(selectedDepartments.value);
        }
        if (selectedRoles.value.length > 0) {
          await loadSelectedRoles(selectedRoles.value);
        }
        if (selectedStaffs.value.length > 0) {
          await loadSelectedUsers(selectedStaffs.value);
        }
      } catch (error) {
        message.error("加载数据失败");
      } finally {
        loading.value = false;
      }
    };

    // 将前端数据转换为接口格式
    const buildAuthScopes = (): DeviceAuthScope[] => {
      const scopes: DeviceAuthScope[] = [];

      // 区域范围
      selectedAreaKeys.value.forEach((key) => {
        const node = areaNodeMap.value.get(key);
        if (node) {
          scopes.push({
            scopeType: DeviceAuthScopeType.DEVICE_AREA,
            scopeName: node.title,
            scopeId: key,
          });
        }
      });

      // 分组范围
      selectedGroupKeys.value.forEach((key) => {
        const node = groupNodeMap.value.get(key);
        if (node) {
          scopes.push({
            scopeType: DeviceAuthScopeType.DEVICE_GROUP,
            scopeName: node.title,
            scopeId: key,
          });
        }
      });

      // 设备范围
      selectedDeviceKeys.value.forEach((deviceId) => {
        const device = deviceDictionary.value[deviceId];
        if (device) {
          scopes.push({
            scopeType: DeviceAuthScopeType.DEVICE,
            scopeName: device.name,
            scopeId: deviceId,
          });
        }
      });

      return scopes;
    };

    // 将前端数据转换为授权目标格式
    const buildGrantTargets = (): DeviceAuthGrantTarget[] => {
      const targets: DeviceAuthGrantTarget[] = [];

      if (selectedDepartments.value.length > 0) {
        targets.push({
          targetType: DeviceAuthGrantTargetType.DEPARTMENT,
          targetIds: selectedDepartments.value,
        });
      }

      if (selectedRoles.value.length > 0) {
        targets.push({
          targetType: DeviceAuthGrantTargetType.ROLE,
          targetIds: selectedRoles.value,
        });
      }

      if (selectedStaffs.value.length > 0) {
        targets.push({
          targetType: DeviceAuthGrantTargetType.USER,
          targetIds: selectedStaffs.value,
        });
      }

      return targets;
    };

    const totalDevices = computed<DeviceDisplay[]>(() => {
      const union = new Map<string, DeviceDisplay>();
      derivedDevices.value.forEach((device) => union.set(device.id, device));
      manualDevices.value.forEach((device) => union.set(device.id, device));
      return Array.from(union.values());
    });

    const scopeSummary = computed(() => ({
      areaCount: selectedAreaKeys.value.length,
      groupCount: selectedGroupKeys.value.length,
      deviceCount: manualDevices.value.length,
    }));

    // 根据区域ID查询设备
    const queryDevicesByAreas = async (areaIds: string[]): Promise<DeviceDisplay[]> => {
      if (areaIds.length === 0) {
        return [];
      }
      const devices: DeviceDisplay[] = [];
      try {
        // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按区域查询设备
        const deviceInstances = await useAuthRequest(() =>
          queryVideoMonitorDeviceByAreaOrGroupAndTag({
            areaIds: areaIds,
          }),
        );
        // 为每个设备找到对应的区域节点，用于显示 fromScope
        deviceInstances.forEach((device) => {
          const deviceInfo = convertDeviceInstanceToDeviceInfo(device);
          // 找到第一个匹配的区域节点
          const matchedAreaId = areaIds.find((id) => {
            const node = areaNodeMap.value.get(id);
            return node !== undefined;
          });
          const node = matchedAreaId ? areaNodeMap.value.get(matchedAreaId) : undefined;
          devices.push({
            ...deviceInfo,
            fromScope: `区域 · ${node?.title || areaIds[0]}`,
          });
          // 更新设备字典
          deviceDictionary.value[device.id] = deviceInfo;
        });
      } catch (error) {}
      return devices;
    };

    // 根据分组ID查询设备
    const queryDevicesByGroups = async (groupIds: string[]): Promise<DeviceDisplay[]> => {
      if (groupIds.length === 0) {
        return [];
      }
      const devices: DeviceDisplay[] = [];
      try {
        // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按分组查询设备
        const deviceInstances = await useAuthRequest(() =>
          queryVideoMonitorDeviceByAreaOrGroupAndTag({
            groupIds: groupIds,
          }),
        );
        // 为每个设备找到对应的分组节点，用于显示 fromScope
        deviceInstances.forEach((device) => {
          const deviceInfo = convertDeviceInstanceToDeviceInfo(device);
          // 找到第一个匹配的分组节点
          const matchedGroupId = groupIds.find((id) => {
            const node = groupNodeMap.value.get(id);
            return node !== undefined;
          });
          const node = matchedGroupId ? groupNodeMap.value.get(matchedGroupId) : undefined;
          devices.push({
            ...deviceInfo,
            fromScope: `分组 · ${node?.title || groupIds[0]}`,
          });
          // 更新设备字典
          deviceDictionary.value[device.id] = deviceInfo;
        });
      } catch (error) {}
      return devices;
    };

    // 根据设备ID查询设备
    const queryDevicesByIds = async (deviceIds: string[]): Promise<DeviceDisplay[]> => {
      if (deviceIds.length === 0) {
        return [];
      }
      const devices: DeviceDisplay[] = [];
      try {
        // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口按设备ID查询设备
        const deviceInstances = await useAuthRequest(() =>
          queryVideoMonitorDeviceByAreaOrGroupAndTag({
            deviceIds: deviceIds,
          }),
        );
        deviceInstances.forEach((device) => {
          const deviceInfo = convertDeviceInstanceToDeviceInfo(device);
          devices.push({
            ...deviceInfo,
            fromScope: "直接选择",
          });
          // 更新设备字典
          deviceDictionary.value[device.id] = deviceInfo;
        });
      } catch (error) {}
      return devices;
    };

    // 同步直接选择的设备（更新设备字典，供 manualDevices 使用）
    const syncManualDevices = async (): Promise<void> => {
      if (selectedDeviceKeys.value.length === 0) {
        return;
      }
      try {
        // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口查询设备，更新设备字典
        await queryDevicesByIds(selectedDeviceKeys.value);
      } catch (error) {}
    };

    // 防抖定时器
    let syncAreaDevicesTimer: ReturnType<typeof setTimeout> | null = null;
    let syncGroupDevicesTimer: ReturnType<typeof setTimeout> | null = null;

    // 同步区域设备
    const syncAreaDevices = async (): Promise<void> => {
      const areaDevicesResult = await queryDevicesByAreas(selectedAreaKeys.value);
      areaDevices.value = areaDevicesResult;
      // 更新合并的设备列表
      const union = new Map<string, DeviceDisplay>();
      areaDevicesResult.forEach((device) => union.set(device.id, device));
      groupDevices.value.forEach((device) => union.set(device.id, device));
      derivedDevices.value = Array.from(union.values());
    };

    // 同步分组设备
    const syncGroupDevices = async (): Promise<void> => {
      const groupDevicesResult = await queryDevicesByGroups(selectedGroupKeys.value);
      groupDevices.value = groupDevicesResult;
      // 更新合并的设备列表
      const union = new Map<string, DeviceDisplay>();
      areaDevices.value.forEach((device) => union.set(device.id, device));
      groupDevicesResult.forEach((device) => union.set(device.id, device));
      derivedDevices.value = Array.from(union.values());
    };

    // 分别监听区域和分组的变化，只查询对应的设备
    watch(
      selectedAreaKeys,
      async () => {
        // 清除之前的定时器，实现防抖
        if (syncAreaDevicesTimer) {
          clearTimeout(syncAreaDevicesTimer);
        }
        syncAreaDevicesTimer = setTimeout(async () => {
          await syncAreaDevices();
          syncAreaDevicesTimer = null;
        }, 100);
      },
      { deep: true },
    );

    watch(
      selectedGroupKeys,
      async () => {
        // 清除之前的定时器，实现防抖
        if (syncGroupDevicesTimer) {
          clearTimeout(syncGroupDevicesTimer);
        }
        syncGroupDevicesTimer = setTimeout(async () => {
          await syncGroupDevices();
          syncGroupDevicesTimer = null;
        }, 100);
      },
      { deep: true },
    );

    watch(
      selectedDeviceKeys,
      async () => {
        await syncManualDevices();
      },
      { deep: true },
    );

    // 监听标签切换，加载对应的数据
    watch(scopeTab, async (newTab) => {
      if (newTab === "device" && deviceList.value.length === 0) {
        await loadDeviceList();
      }
      if (newTab === "group" && groupTreeData.value.length === 0) {
        await loadGroupTreeData();
      }
    });

    const handleRemoveManualDevice = (deviceId: string): void => {
      if (isReadonly.value) {
        return;
      }
      selectedDeviceKeys.value = selectedDeviceKeys.value.filter((id) => id !== deviceId);
    };

    const handleClearManualDevices = (): void => {
      if (isReadonly.value) {
        return;
      }
      selectedDeviceKeys.value = [];
    };

    const handleClearScopes = (): void => {
      if (isReadonly.value) {
        return;
      }
      selectedAreaKeys.value = [];
      selectedGroupKeys.value = [];
      selectedDeviceKeys.value = [];
      areaDevices.value = [];
      groupDevices.value = [];
      derivedDevices.value = [];
    };

    const handleSave = async (): Promise<void> => {
      if (isReadonly.value) {
        router.push({ name: "PermissionList" });
        return;
      }
      if (!totalDevices.value.length) {
        message.warning("请先选择监控范围");
        return;
      }

      const authScopes = buildAuthScopes();
      const grantTargets = buildGrantTargets();

      if (grantTargets.length === 0) {
        message.warning("请至少选择一个权限归属");
        return;
      }

      loading.value = true;
      try {
        if (props.mode === "create") {
          await useAuthRequest(() =>
            createCameraAuth({
              authScopes,
              grantTargets,
            }),
          );
          message.success("创建成功");
        } else if (props.mode === "edit" && props.id) {
          await useAuthRequest(() =>
            updateCameraAuth(props.id!, {
              authScopes,
              grantTargets,
            }),
          );
          message.success("更新成功");
        }
        router.push({ name: "PermissionList" });
      } catch (error) {
        message.error(props.mode === "create" ? "创建失败" : "更新失败");
      } finally {
        loading.value = false;
      }
    };

    const handleCancel = (): void => {
      // router.push({ name: "PermissionList" });
      history.back();
    };

    // 加载区域树数据
    const loadAreaTreeData = async (): Promise<void> => {
      try {
        const response = await useAuthRequest(() => listAllArea());
        // 处理不同的响应格式：可能是 { records: [...] } 或直接是数组
        let areas: Area[] = [];
        if (Array.isArray(response)) {
          areas = response;
        } else if (response && typeof response === "object") {
          areas = (response as any).records || (response as any).data || [];
        }
        areaTreeData.value = convertAreasToScopeTree(areas);
        areaNodeMap.value = buildKeyMap(areaTreeData.value);
      } catch (error) {
        message.error("加载区域数据失败");
      }
    };

    // 加载监控分组数据
    const loadGroupTreeData = async (): Promise<void> => {
      try {
        // 检查函数是否存在
        if (typeof listVideoMonitorGroup !== "function") {
          // 尝试动态导入
          try {
            const module = await import("@ghcloud/cube-services-client/video-monitor.client");
            if (typeof module.listVideoMonitorGroup === "function") {
              const response = await useAuthRequest(() =>
                module.listVideoMonitorGroup({
                  pageNumber: 1,
                  pageSize: 1000,
                }),
              );
              const groups = response.records || [];
              groupTreeData.value = groups.map(convertGroupToScopeTreeNode);
              groupNodeMap.value = buildKeyMap(groupTreeData.value);
              return;
            }
          } catch (importError) {
            // 动态导入失败，继续使用静态导入
          }
          return;
        }
        const response = await useAuthRequest(() =>
          listVideoMonitorGroup({
            pageNumber: 1,
            pageSize: 1000,
          }),
        );
        const groups = response.records || [];
        groupTreeData.value = groups.map(convertGroupToScopeTreeNode);
        groupNodeMap.value = buildKeyMap(groupTreeData.value);
      } catch (error) {
        message.error("加载监控分组数据失败");
      }
    };

    // 加载设备列表
    const loadDeviceList = async (): Promise<void> => {
      try {
        const response = await useAuthRequest(() =>
          listVideoMonitorDevice({
            pageNumber: 1,
            pageSize: 1000,
          }),
        );
        const deviceInstances = response.records || [];
        deviceList.value = deviceInstances.map(convertDeviceInstanceToDeviceInfo);
        deviceInstances.forEach((device) => {
          const deviceInfo = convertDeviceInstanceToDeviceInfo(device);
          deviceDictionary.value[device.id] = deviceInfo;
        });
      } catch (error) {
        message.error("加载设备列表失败");
      }
    };

    // 加载设备详情（用于回显）
    const loadDeviceDetails = async (deviceIds: string[]): Promise<void> => {
      if (deviceIds.length === 0) {
        return;
      }
      try {
        // 使用 queryVideoMonitorDeviceByAreaOrGroupAndTag 接口查询设备详情
        await queryDevicesByIds(deviceIds);
      } catch (error) {}
    };

    // 加载部门列表
    const loadDepartments = async (keyword?: string): Promise<void> => {
      if (loadingDepartments.value) {
        return;
      }
      loadingDepartments.value = true;
      try {
        const orgs = await useAuthRequest(() =>
          getOrganizations({
            enabled: true,
            name: keyword,
          }),
        );
        // 将组织树结构扁平化
        const flattenOrgs = (orgs: Organization[]): Organization[] => {
          const result: Organization[] = [];
          const traverse = (items: Organization[]) => {
            items.forEach((org) => {
              result.push(org);
              if (org.children && org.children.length > 0) {
                traverse(org.children);
              }
            });
          };
          traverse(orgs);
          return result;
        };
        const flatOrgs = flattenOrgs(orgs);
        departmentOptions.value = flatOrgs.map((org) => ({
          label: org.name,
          value: org.id,
        }));
      } catch (error) {
        message.error("加载部门列表失败");
      } finally {
        loadingDepartments.value = false;
      }
    };

    // 加载已选中的部门（用于回显）
    const loadSelectedDepartments = async (ids: string[]): Promise<void> => {
      if (ids.length === 0) {
        return;
      }
      try {
        const orgs = await useAuthRequest(() => getOrganizations({ ids }));
        const existingIds = new Set(departmentOptions.value.map((opt) => opt.value));
        orgs.forEach((org) => {
          if (!existingIds.has(org.id)) {
            departmentOptions.value.push({
              label: org.name,
              value: org.id,
            });
          }
        });
      } catch (error) {}
    };

    // 加载角色列表
    const loadRoles = async (): Promise<void> => {
      if (loadingRoles.value) {
        return;
      }
      loadingRoles.value = true;
      try {
        const roles = await useAuthRequest(() => getRoles());
        roleOptions.value = roles
          .filter((role) => role.enabled !== false)
          .map((role) => ({
            label: role.name,
            value: role.id,
          }));
      } catch (error) {
        message.error("加载角色列表失败");
      } finally {
        loadingRoles.value = false;
      }
    };

    // 加载已选中的角色（用于回显）
    const loadSelectedRoles = async (ids: string[]): Promise<void> => {
      if (ids.length === 0) {
        return;
      }
      try {
        const roles = await useAuthRequest(() => getRoles());
        const existingIds = new Set(roleOptions.value.map((opt) => opt.value));
        roles.forEach((role) => {
          if (ids.includes(role.id) && !existingIds.has(role.id)) {
            roleOptions.value.push({
              label: role.name,
              value: role.id,
            });
          }
        });
      } catch (error) {}
    };

    // 加载人员列表
    const loadUsers = async (keyword?: string): Promise<void> => {
      if (loadingUsers.value) {
        return;
      }
      loadingUsers.value = true;
      try {
        const response = await useAuthRequest(() =>
          listUsers({
            keyword,
            pageSize: 100,
          }),
        );
        const users = response.records || [];
        const existingIds = new Set(userOptions.value.map((opt) => opt.value));
        users.forEach((user) => {
          if (!existingIds.has(user.id)) {
            userOptions.value.push({
              label: user.name,
              value: user.id,
            });
          }
        });
      } catch (error) {
        message.error("加载人员列表失败");
      } finally {
        loadingUsers.value = false;
      }
    };

    // 加载已选中的人员（用于回显）
    const loadSelectedUsers = async (ids: string[]): Promise<void> => {
      if (ids.length === 0) {
        return;
      }
      try {
        const users = await useAuthRequest(() => getUsersByIds(ids.join(",")));
        const existingIds = new Set(userOptions.value.map((opt) => opt.value));
        users.forEach((user) => {
          if (!existingIds.has(user.id)) {
            userOptions.value.push({
              label: user.name,
              value: user.id,
            });
          }
        });
      } catch (error) {}
    };

    // 过滤后的选项（支持搜索）
    const filteredDepartmentOptions = computed(() => {
      if (!departmentSearchKeyword.value) {
        return departmentOptions.value;
      }
      const keyword = departmentSearchKeyword.value.toLowerCase();
      return departmentOptions.value.filter((opt) => opt.label.toLowerCase().includes(keyword));
    });

    const filteredRoleOptions = computed(() => {
      if (!roleSearchKeyword.value) {
        return roleOptions.value;
      }
      const keyword = roleSearchKeyword.value.toLowerCase();
      return roleOptions.value.filter((opt) => opt.label.toLowerCase().includes(keyword));
    });

    const filteredUserOptions = computed(() => {
      if (!userSearchKeyword.value) {
        return userOptions.value;
      }
      const keyword = userSearchKeyword.value.toLowerCase();
      return userOptions.value.filter((opt) => opt.label.toLowerCase().includes(keyword));
    });

    onMounted(async () => {
      try {
        await Promise.all([loadAreaTreeData(), loadGroupTreeData(), loadDepartments(), loadRoles(), loadUsers()]);
        // 编辑/详情模式或复制模式都需要加载数据
        const copyFromId = route.value.query.copyFrom;
        const hasCopyFrom = copyFromId && (Array.isArray(copyFromId) ? copyFromId.length > 0 : true);
        if (props.mode !== "create" || hasCopyFrom) {
          await loadDetailData();
        }
      } catch (error) {}
    });

    const renderTree = (data: ScopeTreeNode[], checked: string[], onChange: (keys: string[]) => void): any => {
      const treeProps: TreeProps = {
        checkable: true,
        blockNode: true,
        disabled: isReadonly.value,
        checkedKeys: checked,
        treeData: data,
        onCheck: (keys: Key[] | { checked: Key[] }) => {
          if (isReadonly.value) {
            return;
          }
          onChange(toCheckedKeys(keys));
        },
      };
      return <Tree {...treeProps} />;
    };

    const displayedDevices = computed<DeviceDisplay[]>(() => {
      if (scopeTab.value === "device") {
        return manualDevices.value;
      } else if (scopeTab.value === "group") {
        return groupDevices.value;
      }
      return areaDevices.value;
    });
    const allowManualActions = computed(() => scopeTab.value === "device" && !isReadonly.value);
    const allowManualClear = computed(() => scopeTab.value === "device" && manualDevices.value.length > 0 && !isReadonly.value);

    const renderManualClearButton = (): any => {
      if (!allowManualClear.value) {
        return null;
      }
      return (
        <Button type="link" onClick={handleClearManualDevices}>
          清空
        </Button>
      );
    };

    const pageStyle = "padding:16px;display:flex;flex-direction:column;gap:16px;overflow:auto;height:calc(100% + 16px);";
    const titleStyle = "font-size:18px;font-weight:600;color:var(--vm-text-primary);";
    const contentStyle = "display:flex;flex-direction:column;gap:16px;";
    const scopeStyle =
      "background:var(--vm-bg-card);border:1px solid var(--vm-border);border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:16px;";
    const scopeHeaderStyle = "display:flex;justify-content:space-between;align-items:center;";
    const scopeBodyStyle = "display:grid;grid-template-columns:320px 1fr;gap:16px;height:400px;max-height:400px;";
    const scopeLeftStyle =
      "border-right:1px solid var(--vm-border);padding-right:12px;height:100%;display:flex;flex-direction:column;overflow:hidden;";
    const scopeRightStyle = "height:100%;display:flex;flex-direction:column;overflow:hidden;";
    const scopeLeftContentStyle = { flex: 1, overflowY: "auto" as const, overflowX: "hidden" as const, minHeight: 0 };
    const ownershipStyle = "background:var(--vm-bg-card);border-radius:8px;padding:16px;display:flex;flex-direction:column;gap:8px";
    const ownershipItemStyle = "display:flex;align-items:center;gap:16px;padding:8px 0;";
    const ownershipLabelStyle = "width:80px;text-align:right;color:var(--vm-text-primary);flex-shrink:0;";
    const ownershipBodyStyle = {
      padding: "0px",
    };
    const ownershipHeadStyle = {
      minHeight: "0px",
    };
    const actionsStyle = "display:flex;justify-content:flex-end;";

    return () => (
      <div style={pageStyle}>
        <div style={titleStyle}>{pageTitle.value}</div>

        <div style={contentStyle}>
          <div style={scopeStyle}>
            <div style={scopeHeaderStyle}>
              <Space>
                <div>监控范围</div>
                <Tag>区域 {scopeSummary.value.areaCount}</Tag>
                <Tag color="blue">分组 {scopeSummary.value.groupCount}</Tag>
                <Tag color="green">设备 {scopeSummary.value.deviceCount}</Tag>
              </Space>
              <Button type="link" disabled={isReadonly.value} onClick={handleClearScopes}>
                清空选择
              </Button>
            </div>
            <div style={scopeBodyStyle}>
              <div style={scopeLeftStyle}>
                <Tabs
                  class="permission-editor-tab-content"
                  activeKey={scopeTab.value}
                  onChange={(key: string | number) => {
                    scopeTab.value = String(key) as "area" | "group" | "device";
                  }}
                  style={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}
                >
                  <Tabs.TabPane key="area" tab="区域" style={{ height: "100%" }} class={{}}>
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                      <div style={{ marginBottom: "8px", flexShrink: 0 }}>
                        <Input
                          placeholder="搜索区域"
                          value={areaSearchKeyword.value}
                          onUpdate:value={(val: string) => {
                            areaSearchKeyword.value = val;
                          }}
                          allowClear
                        />
                      </div>
                      <div style={scopeLeftContentStyle}>
                        {renderTree(filteredAreaTreeData.value, selectedAreaKeys.value, (keys) => {
                          selectedAreaKeys.value = keys;
                        })}
                      </div>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane key="group" tab="监控分组">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                      <div style={{ marginBottom: "8px", flexShrink: 0 }}>
                        <Input
                          placeholder="搜索分组"
                          value={groupSearchKeyword.value}
                          onUpdate:value={(val: string) => {
                            groupSearchKeyword.value = val;
                          }}
                          allowClear
                        />
                      </div>
                      <div style={scopeLeftContentStyle}>
                        {renderTree(filteredGroupTreeData.value, selectedGroupKeys.value, (keys) => {
                          selectedGroupKeys.value = keys;
                        })}
                      </div>
                    </div>
                  </Tabs.TabPane>
                  <Tabs.TabPane key="device" tab="设备">
                    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                      <div style={{ marginBottom: "8px", flexShrink: 0 }}>
                        <Input
                          placeholder="搜索设备（名称/编号/区域）"
                          value={deviceSearchKeyword.value}
                          onUpdate:value={(val: string) => {
                            deviceSearchKeyword.value = val;
                          }}
                          allowClear
                        />
                      </div>
                      <div style={scopeLeftContentStyle}>
                        <Checkbox.Group
                          value={selectedDeviceKeys.value}
                          onChange={(vals: any[]) => {
                            if (isReadonly.value) {
                              return;
                            }
                            selectedDeviceKeys.value = vals.filter((v) => typeof v === "string") as string[];
                          }}
                        >
                          <Space direction="vertical" style={{ width: "100%" }}>
                            {filteredDeviceList.value.map((device) => (
                              <Checkbox key={device.id} value={device.id} disabled={isReadonly.value}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span>
                                    {device.name || "未知设备"}（{device.code || device.id || "未知编号"}）
                                  </span>
                                  {device.region && (
                                    <span style={{ color: "var(--vm-text-primary)", fontSize: "12px" }}>{device.region}</span>
                                  )}
                                </div>
                              </Checkbox>
                            ))}
                          </Space>
                        </Checkbox.Group>
                      </div>
                    </div>
                  </Tabs.TabPane>
                </Tabs>
              </div>
              <div style={scopeRightStyle}>
                <Card
                  size="small"
                  title={`已选设备（${displayedDevices.value.length}）`}
                  extra={renderManualClearButton()}
                  style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}
                  bodyStyle={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px" }}
                >
                  {displayedDevices.value.length ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={displayedDevices.value}
                      renderItem={({ item }: { item: DeviceDisplay }) => (
                        <List.Item
                          key={item.id}
                          actions={
                            allowManualActions.value
                              ? [
                                  <Button
                                    key={`remove-${item.id}`}
                                    type="link"
                                    danger
                                    size="small"
                                    onClick={() => handleRemoveManualDevice(item.id)}
                                  >
                                    移除
                                  </Button>,
                                ]
                              : []
                          }
                        >
                          <List.Item.Meta
                            title={`${item.name || "未知设备"}（${item.code || item.id || "未知编号"}）`}
                            description={`${item.region || ""} · ${item.fromScope}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description={scopeTab.value === "device" ? "请选择设备" : "请选择左侧区域或分组"} />
                  )}
                </Card>
              </div>
            </div>
          </div>

          <Card title="权限归属" style={ownershipStyle} bodyStyle={ownershipBodyStyle} headStyle={ownershipHeadStyle}>
            {/* 部门选择 - 详情模式下如果没有选择则隐藏 */}
            {(!isReadonly.value || selectedDepartments.value.length > 0) && (
              <div style={ownershipItemStyle}>
                <div style={ownershipLabelStyle}>部门</div>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  style="width: 100%"
                  placeholder="请选择部门（支持搜索）"
                  disabled={isReadonly.value}
                  loading={loadingDepartments.value}
                  value={selectedDepartments.value}
                  options={filteredDepartmentOptions.value}
                  searchValue={departmentSearchKeyword.value}
                  onSearch={(value: string) => {
                    departmentSearchKeyword.value = value;
                    if (value) {
                      loadDepartments(value);
                    }
                  }}
                  onFocus={() => {
                    if (departmentOptions.value.length === 0) {
                      loadDepartments();
                    }
                  }}
                  onUpdate:value={(value: any) => {
                    selectedDepartments.value = Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
                  }}
                />
              </div>
            )}

            {/* 角色选择 - 详情模式下如果没有选择则隐藏 */}
            {(!isReadonly.value || selectedRoles.value.length > 0) && (
              <div style={ownershipItemStyle}>
                <div style={ownershipLabelStyle}>角色</div>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                  style="width: 100%"
                  placeholder="请选择角色（支持搜索）"
                  disabled={isReadonly.value}
                  loading={loadingRoles.value}
                  value={selectedRoles.value}
                  options={filteredRoleOptions.value}
                  searchValue={roleSearchKeyword.value}
                  onSearch={(value: string) => {
                    roleSearchKeyword.value = value;
                  }}
                  onFocus={() => {
                    if (roleOptions.value.length === 0) {
                      loadRoles();
                    }
                  }}
                  onUpdate:value={(value: any) => {
                    selectedRoles.value = Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
                  }}
                />
              </div>
            )}

            {/* 人员选择 - 详情模式下如果没有选择则隐藏 */}
            {(!isReadonly.value || selectedStaffs.value.length > 0) && (
              <div style={ownershipItemStyle}>
                <div style={ownershipLabelStyle}>人员</div>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  filterOption={false}
                  style="width: 100%"
                  placeholder="请选择人员（支持搜索）"
                  disabled={isReadonly.value}
                  loading={loadingUsers.value}
                  value={selectedStaffs.value}
                  options={filteredUserOptions.value}
                  searchValue={userSearchKeyword.value}
                  onSearch={(value: string) => {
                    userSearchKeyword.value = value;
                    if (value) {
                      loadUsers(value);
                    }
                  }}
                  onFocus={() => {
                    if (userOptions.value.length === 0) {
                      loadUsers();
                    }
                  }}
                  onUpdate:value={(value: any) => {
                    selectedStaffs.value = Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];
                  }}
                />
              </div>
            )}
          </Card>
        </div>

        <div style={actionsStyle}>
          <Space>
            <Button onClick={handleCancel} disabled={loading.value}>
              {isReadonly.value ? "返回" : "取消"}
            </Button>
            <Button type="primary" disabled={isReadonly.value || loading.value} onClick={handleSave} loading={loading.value}>
              保存
            </Button>
          </Space>
        </div>
      </div>
    );
  },
});
