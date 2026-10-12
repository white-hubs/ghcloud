/**
 * 权限列表表格列定义
import { SCOPE_TYPE_LABEL_MAP, SCOPE_TYPE_COLOR_MAP, OWNERSHIP_TYPE_LABEL_MAP, OWNERSHIP_TYPE_COLOR_MAP } from "@/constants/permission";
import type { PermissionRecord, ScopeItem, OwnershipItem } from "@/types/permission";
 */
import { OWNERSHIP_TYPE_COLOR_MAP, OWNERSHIP_TYPE_LABEL_MAP, SCOPE_TYPE_COLOR_MAP, SCOPE_TYPE_LABEL_MAP } from "@/constants/permission";
import type { OwnershipItem, PermissionRecord, ScopeItem } from "@/types/permission";
import type { TableProps } from "ant-design-vue";
import { Button, Space, Tag } from "ant-design-vue";

interface CreateColumnsOptions {
  onEdit: (record: PermissionRecord) => void;
  onCopy: (record: PermissionRecord) => void;
  onDetail: (record: PermissionRecord) => void;
  onDelete: (record: PermissionRecord) => void;
  onShowScopeDetail?: (record: PermissionRecord) => void;
  onShowOwnershipDetail?: (record: PermissionRecord) => void;
}

const getScopeTypeLabel = (type: ScopeItem["type"]): string => SCOPE_TYPE_LABEL_MAP[type] || "";

const getScopeTypeColor = (type: ScopeItem["type"]): string => SCOPE_TYPE_COLOR_MAP[type] || "default";

const getOwnershipTypeLabel = (type: OwnershipItem["type"]): string => OWNERSHIP_TYPE_LABEL_MAP[type] || "";

const getOwnershipTypeColor = (type: OwnershipItem["type"]): string => OWNERSHIP_TYPE_COLOR_MAP[type] || "default";

// 表格中最大显示条数
const MAX_DISPLAY_COUNT = 10;

export const createPermissionTableColumns = (options: CreateColumnsOptions): TableProps<PermissionRecord>["columns"] => [
  {
    title: "监控范围",
    dataIndex: "monitorScope",
    key: "monitorScope",
    ellipsis: true,
    align: "center",
    width: 300,
    customRender: ({ record }): unknown => {
      const displayItems = record.monitorScope.slice(0, MAX_DISPLAY_COUNT);
      const hasMore = record.monitorScope.length > MAX_DISPLAY_COUNT;

      return (
        <Space wrap size={4}>
          {displayItems.map((scope, index) => (
            <Tag key={`${record.id}-scope-${index}`} color={getScopeTypeColor(scope.type)} style={{ border: "1px solid" }}>
              {getScopeTypeLabel(scope.type)}：{scope.name}
            </Tag>
          ))}
          {hasMore && options.onShowScopeDetail && (
            <Button
              type="link"
              size="small"
              style={{ padding: "0 4px", height: "auto" }}
              onClick={() => options.onShowScopeDetail?.(record)}
            >
              查看更多（{record.monitorScope.length}）
            </Button>
          )}
        </Space>
      );
    },
  },
  {
    title: "涉及设备数",
    dataIndex: "devicesCount",
    key: "devicesCount",
    width: 140,
    align: "center",
  },
  {
    title: "权限归属",
    dataIndex: "ownership",
    key: "ownership",
    ellipsis: true,
    align: "center",
    width: 300,
    customRender: ({ record }): unknown => {
      const displayItems = record.ownership.slice(0, MAX_DISPLAY_COUNT);
      const hasMore = record.ownership.length > MAX_DISPLAY_COUNT;

      return (
        <Space wrap size={4}>
          {displayItems.map((owner, index) => (
            <Tag key={`${record.id}-${owner.type}-${index}`} color={getOwnershipTypeColor(owner.type)} style={{ border: "1px solid" }}>
              {getOwnershipTypeLabel(owner.type)}：{owner.name}
            </Tag>
          ))}
          {hasMore && options.onShowOwnershipDetail && (
            <Button
              type="link"
              size="small"
              style={{ padding: "0 4px", height: "auto" }}
              onClick={() => options.onShowOwnershipDetail?.(record)}
            >
              查看更多（{record.ownership.length}）
            </Button>
          )}
        </Space>
      );
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 240,
    align: "center",
    ellipsis: true,
    customRender: ({ record }) => (
      <Space size={[4, 0]} wrap style={{ justifyContent: "center", width: "100%" }}>
        <Button type="link" size="small" onClick={() => options.onEdit(record)}>
          编辑
        </Button>
        <Button type="link" size="small" onClick={() => options.onCopy(record)}>
          复制
        </Button>
        <Button type="link" size="small" onClick={() => options.onDetail(record)}>
          详情
        </Button>
        <Button type="link" size="small" danger onClick={() => options.onDelete(record)}>
          删除
        </Button>
      </Space>
    ),
  },
];
