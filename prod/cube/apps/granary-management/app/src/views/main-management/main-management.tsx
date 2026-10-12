import { Checkbox, Modal, Select, Tree } from "ant-design-vue";
import { computed, defineComponent, reactive, ref, type VNode } from "vue";
import { useRouter } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type {
  LiangcangBoundWarehousePageItem,
  OuaaDepartmentItem,
  OuaaRoleItem,
  OuaaStaffItem,
} from "@ghcloud/cube-granary-management-service";
import { hasPermission } from "@ghcloud/cube-permission-codes";
import { Button, Input, message, Page, PopOver } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";
import { appFunctionCodes } from "@/permission";

import "./main-management.less";

interface GranaryRow {
  id: string;
  radarDeviceId: string;
  name: string;
  category: string;
  level: string;
  maxHeight: string;
  volume: string;
  relatedDeviceCount: string;
  boundProductTypes: string;
  /** 分页项 `copyAllowed`：仅在为 `true` 或未返回时允许展示复制链接；显式 `false` 不展示 */
  copyAllowed: boolean;
}

type BindingTab = "bound" | "unbound";

const PERMISSION_DIMENSION_DEPT = "DEPT";
const PERMISSION_DIMENSION_ROLE = "ROLE";
const LOCATION_CARD_APP_PATH = "/apps/granary";

interface PermissionDeptListItem {
  id: string;
  name: string;
  depth: number;
}

interface PermissionDeptTreeNode {
  key: string;
  title: string;
  children?: PermissionDeptTreeNode[];
}

const formatHeightDisplay = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return "--";
  }
  return `${v} m`;
};

const formatVolumeDisplay = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return "--";
  }
  return `${v} m³`;
};

const formatCountDisplay = (v: number | null | undefined): string => {
  if (v == null || !Number.isFinite(v)) {
    return "--";
  }
  return String(v);
};

/** 与粮仓绑定接口 `personIds` 字符串对齐，便于勾选回显 */
const mapStaffToPermissionUser = (user: OuaaStaffItem): { id: string; name: string } => ({
  id: String(user.id ?? "").trim(),
  name: user.name ?? "--",
});

const getDeptId = (dept: OuaaDepartmentItem): string => String(dept.id ?? "").trim();

const mapBoundItemToRow = (item: LiangcangBoundWarehousePageItem): GranaryRow => ({
  id: String(item.warehouseId),
  radarDeviceId: String(item.radarDeviceId ?? ""),
  name: item.granaryName ?? "--",
  category: item.category ?? "--",
  level: item.level ?? "--",
  maxHeight: formatHeightDisplay(item.maxHeight),
  volume: formatVolumeDisplay(item.granaryVolume),
  relatedDeviceCount: formatCountDisplay(item.relatedDeviceCount),
  boundProductTypes: item.boundProductTypes != null && item.boundProductTypes.trim() !== "" ? item.boundProductTypes : "--",
  copyAllowed: item.copyAllowed !== false,
});

const renderCell = (text?: string): VNode => {
  const v = text || "--";
  return <PopOver content={v}>{v}</PopOver>;
};

/**
 * 嵌入子应用 / 非安全上下文下 `navigator.clipboard` 常不可用，需 fallback。
 */
const buildShareAbsoluteUrl = (warehouseId: string): string => {
  const url = new URL(LOCATION_CARD_APP_PATH, window.location.origin);
  url.searchParams.set("wid", warehouseId);
  return url.toString();
};

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText != null) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* 走 execCommand */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

export const MainManagement = defineComponent({
  name: "MainManagement",
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const permissionCode = appFunctionCodes.mainManagement?.permission;
    const hasPermissionConfigPermission = computed(() => permissionCode == null || hasPermission(permissionCode));
    const searchParams = reactive<{
      pageNumber: number;
      pageSize: number;
      total: number;
      granaryName: string;
    }>({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      granaryName: "",
    });
    const bindingTab = ref<BindingTab>("bound");
    const permissionVisible = ref(false);
    const permissionLoading = ref(false);
    const permissionDeptList = ref<PermissionDeptListItem[]>([]);
    const permissionDeptTreeData = ref<PermissionDeptTreeNode[]>([]);
    const permissionExpandedDeptKeys = ref<string[]>([]);
    const permissionRoleList = ref<OuaaRoleItem[]>([]);
    const permissionUsers = ref<Array<{ id: string; name: string }>>([]);
    const permissionSelectedUserIds = ref<string[]>([]);
    const permissionActiveDeptId = ref("");
    const permissionActiveRoleId = ref("");
    const permissionDimension = ref<string>(PERMISSION_DIMENSION_DEPT);
    const permissionCurrentRow = ref<GranaryRow | null>(null);
    const permissionDeptRaw = ref<OuaaDepartmentItem[]>([]);
    const permissionSavedUserIdsMap = reactive<Record<string, string[]>>({});
    const permissionFilter = reactive({
      keyword: "",
    });

    const buildPermissionDeptList = (depts: OuaaDepartmentItem[]): PermissionDeptListItem[] => {
      const result: PermissionDeptListItem[] = [];
      const walk = (nodes: OuaaDepartmentItem[], depth = 0): void => {
        nodes.forEach((node) => {
          const id = getDeptId(node);
          if (id !== "") {
            result.push({ id, name: node.name ?? "--", depth });
          }
          if (Array.isArray(node.children) && node.children.length > 0) {
            walk(node.children, depth + 1);
          }
        });
      };
      walk(depts);
      return result;
    };

    const buildPermissionDeptTree = (depts: OuaaDepartmentItem[]): PermissionDeptTreeNode[] => {
      return depts
        .map((dept) => ({
          key: getDeptId(dept),
          title: dept.name ?? "--",
          children: Array.isArray(dept.children) ? buildPermissionDeptTree(dept.children) : [],
        }))
        .filter((node) => node.key !== "");
    };

    const collectExpandableDeptKeys = (depts: OuaaDepartmentItem[]): string[] => {
      const keys: string[] = [];
      const walk = (nodes: OuaaDepartmentItem[]): void => {
        nodes.forEach((node) => {
          if (Array.isArray(node.children) && node.children.length > 0) {
            const id = getDeptId(node);
            if (id !== "") {
              keys.push(id);
            }
            walk(node.children);
          }
        });
      };
      walk(depts);
      return keys;
    };

    const collectParentPath = (nodes: OuaaDepartmentItem[], targetId: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const nodeId = getDeptId(node);
        const nextPath = nodeId === "" ? path : [...path, nodeId];
        if (nodeId === targetId) {
          return nextPath;
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
          const found = collectParentPath(node.children, targetId, nextPath);
          if (found != null) {
            return found;
          }
        }
      }
      return null;
    };

    const loadDeptUsers = async (deptId: string, keyword: string): Promise<void> => {
      permissionLoading.value = true;
      try {
        const resp = await cubeGranaryManagementService.getStaffPage({
          enabled: true,
          organizationId: deptId,
          ...(keyword !== "" ? { keyword } : {}),
        });
        permissionUsers.value = resp.records.map(mapStaffToPermissionUser);
      } finally {
        permissionLoading.value = false;
      }
    };

    const ensureDeptLoaded = async (): Promise<void> => {
      if (permissionDeptRaw.value.length > 0) {
        return;
      }
      permissionLoading.value = true;
      try {
        const depts = await cubeGranaryManagementService.getDeptList({ enabled: true });
        permissionDeptRaw.value = depts;
        permissionDeptList.value = buildPermissionDeptList(depts);
        permissionDeptTreeData.value = buildPermissionDeptTree(depts);
      } finally {
        permissionLoading.value = false;
      }
    };

    const ensureRoleLoaded = async (): Promise<void> => {
      if (permissionRoleList.value.length > 0) {
        return;
      }
      permissionLoading.value = true;
      try {
        permissionRoleList.value = await cubeGranaryManagementService.getRoleList({ enabled: true });
      } finally {
        permissionLoading.value = false;
      }
    };

    const openPermissionModal = async (record: GranaryRow): Promise<void> => {
      permissionCurrentRow.value = record;
      permissionVisible.value = true;
      permissionDimension.value = PERMISSION_DIMENSION_DEPT;
      permissionFilter.keyword = "";
      const warehouseId = Number(record.id);
      if (Number.isFinite(warehouseId)) {
        const boundUserIds = await cubeGranaryManagementService.getWarehousePermissionBindings(warehouseId);
        permissionSelectedUserIds.value = [...boundUserIds];
      } else {
        const savedUserIds = permissionSavedUserIdsMap[record.id] ?? [];
        permissionSelectedUserIds.value = [...savedUserIds];
      }
      await ensureDeptLoaded();
      const firstDeptId = permissionDeptList.value[0]?.id ?? "";
      permissionActiveDeptId.value = firstDeptId;
      permissionActiveRoleId.value = "";
      permissionExpandedDeptKeys.value = collectExpandableDeptKeys(permissionDeptRaw.value);
      if (firstDeptId !== "") {
        await loadDeptUsers(firstDeptId, "");
      } else {
        permissionUsers.value = [];
      }
    };

    const handlePermissionSearch = async (): Promise<void> => {
      const keyword = permissionFilter.keyword.trim();
      if (permissionDimension.value === PERMISSION_DIMENSION_DEPT) {
        permissionLoading.value = true;
        try {
          const depts = await cubeGranaryManagementService.getDeptList({
            enabled: true,
            ...(keyword !== "" ? { name: keyword } : {}),
          });
          permissionDeptRaw.value = depts;
          permissionDeptList.value = buildPermissionDeptList(depts);
          permissionDeptTreeData.value = buildPermissionDeptTree(depts);
          const firstDeptId = permissionDeptList.value[0]?.id ?? "";
          permissionActiveDeptId.value = firstDeptId;
          permissionExpandedDeptKeys.value = collectExpandableDeptKeys(depts);
          if (firstDeptId !== "") {
            await loadDeptUsers(firstDeptId, "");
          } else {
            permissionUsers.value = [];
          }
        } finally {
          permissionLoading.value = false;
        }
        return;
      }

      if (permissionDimension.value === PERMISSION_DIMENSION_ROLE) {
        permissionLoading.value = true;
        try {
          const roles = await cubeGranaryManagementService.getRoleList({
            enabled: true,
            ...(keyword !== "" ? { keyword } : {}),
          });
          permissionRoleList.value = roles;
          const firstRoleId = roles[0]?.id ?? "";
          permissionActiveRoleId.value = firstRoleId;
          if (firstRoleId !== "") {
            const users = await cubeGranaryManagementService.postUserList({
              enabled: true,
              roleIds: [firstRoleId],
            });
            permissionUsers.value = users.map(mapStaffToPermissionUser);
          } else {
            permissionUsers.value = [];
          }
        } finally {
          permissionLoading.value = false;
        }
        return;
      }
    };

    const handlePermissionDeptChange = async (deptId: string): Promise<void> => {
      if (deptId === "" || deptId === permissionActiveDeptId.value) {
        return;
      }
      permissionActiveDeptId.value = deptId;
      permissionFilter.keyword = "";
      await loadDeptUsers(deptId, "");
    };

    const handlePermissionDeptSelect = (selectedKeys: Array<string | number>): void => {
      const deptId = String(selectedKeys[0] ?? "");
      if (deptId === "") {
        return;
      }
      void handlePermissionDeptChange(deptId);
    };

    const handlePermissionRoleChange = async (roleId: string): Promise<void> => {
      if (roleId === "" || roleId === permissionActiveRoleId.value) {
        return;
      }
      permissionActiveRoleId.value = roleId;
      permissionFilter.keyword = "";
      permissionLoading.value = true;
      try {
        const users = await cubeGranaryManagementService.postUserList({
          enabled: true,
          roleIds: [roleId],
        });
        permissionUsers.value = users.map(mapStaffToPermissionUser);
      } finally {
        permissionLoading.value = false;
      }
    };

    const handlePermissionDimensionChange = async (value: string): Promise<void> => {
      permissionDimension.value = value;
      permissionFilter.keyword = "";
      if (value === PERMISSION_DIMENSION_DEPT) {
        await ensureDeptLoaded();
        const firstDeptId = permissionDeptList.value[0]?.id ?? "";
        permissionActiveDeptId.value = firstDeptId;
        if (firstDeptId !== "") {
          await loadDeptUsers(firstDeptId, "");
        } else {
          permissionUsers.value = [];
        }
        return;
      }
      if (value === PERMISSION_DIMENSION_ROLE) {
        await ensureRoleLoaded();
        const firstRoleId = permissionRoleList.value[0]?.id ?? "";
        permissionActiveRoleId.value = firstRoleId;
        if (firstRoleId !== "") {
          permissionLoading.value = true;
          try {
            const users = await cubeGranaryManagementService.postUserList({
              enabled: true,
              roleIds: [firstRoleId],
            });
            permissionUsers.value = users.map(mapStaffToPermissionUser);
          } finally {
            permissionLoading.value = false;
          }
        } else {
          permissionUsers.value = [];
        }
        return;
      }
    };

    const handlePermissionUserCheck = (userId: string, checked: boolean): void => {
      if (checked) {
        if (!permissionSelectedUserIds.value.includes(userId)) {
          permissionSelectedUserIds.value = [...permissionSelectedUserIds.value, userId];
        }
        return;
      }
      permissionSelectedUserIds.value = permissionSelectedUserIds.value.filter((id) => id !== userId);
    };

    const handlePermissionConfirm = async (): Promise<void> => {
      if (permissionCurrentRow.value == null) {
        return;
      }
      const userIds = [...permissionSelectedUserIds.value];
      await cubeGranaryManagementService.bindWarehousePermissionBindings({
        warehouseId: Number(permissionCurrentRow.value.id),
        personIds: userIds,
      });
      permissionSavedUserIdsMap[permissionCurrentRow.value.id] = userIds;
      permissionVisible.value = false;
      message.success("权限配置已保存");
      tableApi.query();
    };

    const handlePermissionCancel = (): void => {
      permissionVisible.value = false;
    };

    const handlePageChange = (pageNumber: number, pageSize: number): void => {
      searchParams.pageNumber = pageNumber || 1;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };

    const setBindingTab = (tab: BindingTab): void => {
      if (bindingTab.value === tab) {
        return;
      }
      bindingTab.value = tab;
      searchParams.pageNumber = 1;
      tableApi.query();
    };

    const copyLink = async (record: GranaryRow): Promise<void> => {
      const url = buildShareAbsoluteUrl(record.id);
      const ok = await copyTextToClipboard(url);
      if (ok) {
        message.success("链接已复制");
      } else {
        message.error(`复制失败，请手动复制：${url}`);
      }
    };

    const goToGranaryView = (record: GranaryRow): void => {
      void router.push({
        path: "/main-management/unbind",
        query: {
          granaryId: record.id,
          listName: record.name,
          listCategory: record.category,
          listLevel: record.level,
          listMaxHeight: record.maxHeight,
          listVolume: record.volume,
          readonly: "1",
        },
      });
    };

    const goToAssociateEdit = (record: GranaryRow): void => {
      const q: Record<string, string> = { warehouseId: record.id };
      if (record.radarDeviceId.trim() !== "") {
        q.radarDeviceId = record.radarDeviceId.trim();
      }
      void router.push({
        path: "/main-management/associate-devices",
        query: q,
      });
    };

    const columns = [
      {
        title: "粮仓名称",
        dataIndex: "name",
        width: 200,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "类别",
        dataIndex: "category",
        width: 140,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "等级",
        dataIndex: "level",
        width: 100,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "最大高度",
        dataIndex: "maxHeight",
        width: 120,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "仓内容积",
        dataIndex: "volume",
        width: 120,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "关联设备数",
        dataIndex: "relatedDeviceCount",
        width: 120,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "关联产品",
        dataIndex: "boundProductTypes",
        width: 220,
        ellipsis: true,
        align: "left" as const,
        customRender: ({ text }: { text: string }): VNode => renderCell(text),
      },
      {
        title: "操作",
        dataIndex: "action",
        fixed: "right" as const,
        width: 300,
        align: "right" as const,
        customRender: ({ record }: { record: GranaryRow }): VNode => (
          <span class="main-management-table-actions">
            {record.copyAllowed ? (
              <Button type="link" size="small" onClick={() => void copyLink(record)}>
                复制链接
              </Button>
            ) : null}
            <Button type="link" size="small" onClick={() => goToGranaryView(record)}>
              查看
            </Button>
            <Button type="link" size="small" onClick={() => goToAssociateEdit(record)}>
              编辑
            </Button>
            {hasPermissionConfigPermission.value ? (
              <Button type="link" size="small" onClick={() => void openPermissionModal(record)}>
                权限
              </Button>
            ) : null}
          </span>
        ),
      },
    ];

    const [CubeTable, tableApi] = useCubeTable({
      rowKey: "id",
      columns,
      fetchApi: async () => {
        const nameQ = searchParams.granaryName.trim();
        const bindingStatus = bindingTab.value === "bound";
        const page = await cubeGranaryManagementService.getBoundWarehouseInfoPage(
          nameQ === ""
            ? { pageNumber: searchParams.pageNumber, pageSize: searchParams.pageSize, bindingStatus }
            : {
                pageNumber: searchParams.pageNumber,
                pageSize: searchParams.pageSize,
                radarName: nameQ,
                bindingStatus,
              },
        );
        return {
          ...page,
          records: page.records.map(mapBoundItemToRow),
        };
      },
      fetchLoaded: (page) => {
        searchParams.total = page.total;
      },
    });

    const [CubeForm] = useCubeForm({
      layout: "horizontal",
      schema: [
        {
          component: "Input",
          fieldName: "granaryName",
          label: "粮仓名称",
          componentProps: {
            placeholder: "请输入",
            allowClear: true,
            maxlength: 20,
            showCount: true,
            style: { width: "220px" },
          },
        },
      ],
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (values) => {
        searchParams.granaryName = String(values.granaryName ?? "");
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.granaryName = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
    });

    return (): VNode => (
      <div class="main-management-root">
        <CubeLayout
          title={pageTitle ?? "粮仓管理"}
          v-slots={{
            "layout-content": () => (
              <div class="main-management-page">
                <div class="main-management-query">
                  <div class="main-management-bind-toggle">
                    <Button type={bindingTab.value === "bound" ? "primary" : "default"} onClick={() => setBindingTab("bound")}>
                      已绑定
                    </Button>
                    <Button type={bindingTab.value === "unbound" ? "primary" : "default"} onClick={() => setBindingTab("unbound")}>
                      未绑定
                    </Button>
                  </div>
                  <CubeForm />
                </div>
                <div class="main-management-table-wrap">
                  <CubeTable />
                </div>
              </div>
            ),
            "footer-page": () => (
              <Page
                current={searchParams.pageNumber}
                pageSize={searchParams.pageSize}
                total={searchParams.total}
                onPageChange={handlePageChange}
              />
            ),
          }}
        />
        <Modal
          title="权限配置"
          open={permissionVisible.value}
          width={680}
          destroyOnClose={false}
          onCancel={handlePermissionCancel}
          v-slots={{
            footer: () => (
              <div class="main-management-permission-footer">
                <Button onClick={handlePermissionCancel}>取消</Button>
                <Button type="primary" onClick={() => void handlePermissionConfirm()}>
                  确定
                </Button>
              </div>
            ),
          }}
        >
          <div class="main-management-permission-modal">
            <div class="main-management-permission-filter">
              <Select
                class="main-management-permission-dept-select"
                value={permissionDimension.value}
                options={[
                  { label: "部门", value: PERMISSION_DIMENSION_DEPT },
                  { label: "角色", value: PERMISSION_DIMENSION_ROLE },
                ]}
                placeholder="部门"
                onChange={(v: string | number | undefined) => void handlePermissionDimensionChange(String(v ?? PERMISSION_DIMENSION_DEPT))}
              />
              <div class="main-management-permission-filter-input-wrap">
                <Input
                  v-model:value={permissionFilter.keyword}
                  placeholder="搜索筛选"
                  maxlength={50}
                  showCount={false}
                  allowClear
                  onPressEnter={() => void handlePermissionSearch()}
                />
              </div>
              <Button type="primary" onClick={() => void handlePermissionSearch()}>
                搜索
              </Button>
            </div>
            <div class="main-management-permission-content">
              <div class="main-management-permission-dept-pane">
                {permissionDimension.value === PERMISSION_DIMENSION_ROLE ? (
                  <div class="main-management-permission-role-pane">
                    {permissionRoleList.value.map((role) => (
                      <div
                        key={role.id}
                        class={["main-management-permission-role-item", permissionActiveRoleId.value === role.id ? "is-active" : ""]}
                        onClick={() => void handlePermissionRoleChange(role.id)}
                      >
                        {role.name ?? "--"}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Tree
                    treeData={permissionDeptTreeData.value}
                    selectedKeys={permissionActiveDeptId.value === "" ? [] : [permissionActiveDeptId.value]}
                    expandedKeys={permissionExpandedDeptKeys.value}
                    onSelect={handlePermissionDeptSelect}
                    onExpand={(keys: Array<string | number>) => {
                      permissionExpandedDeptKeys.value = keys.map((key) => String(key));
                    }}
                  />
                )}
              </div>
              <div class="main-management-permission-user-pane">
                {permissionLoading.value ? (
                  <div class="main-management-permission-loading">加载中...</div>
                ) : permissionUsers.value.length === 0 ? (
                  <div class="main-management-permission-empty">暂无人员</div>
                ) : (
                  permissionUsers.value.map((user) => (
                    <div key={user.id} class="main-management-permission-user-item">
                      <Checkbox
                        checked={permissionSelectedUserIds.value.includes(user.id)}
                        onChange={(e: { target?: { checked?: boolean } }) => {
                          handlePermissionUserCheck(user.id, Boolean(e.target?.checked));
                        }}
                      >
                        {user.name}
                      </Checkbox>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
});
