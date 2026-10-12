import "../components.less";
import { cubeMessageCenterService } from "../../../../api/service";
import type { AlarmLineRuleRef, RuleLineType } from "./alarm-rule-model";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber, Modal, Select, Table, type TablePaginationConfig } from "antd";
import type { ColumnsType } from "antd/es/table";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState, type Key } from "react";
import { getOptionLabel, ReadonlyDescriptions } from "../common/read-only/read-only";

interface LineLossPickRow {
  id: string;
  lineName: string;
  fromDevice?: { id?: string; name?: string };
  toDevice?: { id?: string; name?: string };
}

function parseCondition(condition: string): { op: string; value: string } {
  const [opRaw, valueRaw] = condition.split(",");
  const op = opRaw || ">";
  const value = valueRaw ?? "";
  if (![">", ">=", "<", "<=", "=", "!="].includes(op)) {
    return { op: ">", value: condition };
  }

  return { op, value };
}

function buildCondition(op: string, value: string): string {
  return `${op},${value}`;
}

function toNumberOrNull(value: string): number | null {
  if (!value) {
    return null;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return null;
  }
  return num;
}

/** 展示为中文，value 仍为符号，与 condition 存储格式一致 */
const compareOptions: { label: string; value: string }[] = [
  { label: "大于", value: ">" },
  { label: "大于等于", value: ">=" },
  { label: "小于", value: "<" },
  { label: "小于等于", value: "<=" },
  { label: "等于", value: "=" },
  { label: "不等于", value: "!=" },
];

export const AlarmLineRule = forwardRef<AlarmLineRuleRef, { info: RuleLineType }>(({ info }, ref) => {
  useImperativeHandle(ref, () => ({
    getValue,
  }));
  const urlParams = useMemo(() => new URLSearchParams(location.search), []);
  const readonly = urlParams.get("type") === "detail";

  const [ruleData, setRuleData] = useState<RuleLineType>({ condition: buildCondition(">", ""), lineIdList: [] });

  const getValue = async (): Promise<RuleLineType> => ruleData;

  const activeLineIdList = (ruleData.lineIdList ?? []) as (number | string)[];

  const [addLineOpen, setAddLineOpen] = useState(false);
  const [linePickerLoading, setLinePickerLoading] = useState(false);
  const [linePickerQuery, setLinePickerQuery] = useState("");
  const [selectedLineIds, setSelectedLineIds] = useState<string[]>([]);
  const [selectedLineRows, setSelectedLineRows] = useState<LineLossPickRow[]>([]);
  const [tableData, setTableData] = useState<LineLossPickRow[]>([]);
  const [linePickerList, setLinePickerList] = useState<LineLossPickRow[]>([]);
  const [linePickerTotal, setLinePickerTotal] = useState(0);
  const [linePickerPagination, setLinePickerPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 6,
    showSizeChanger: false,
  });

  useEffect(() => {
    if (info) {
      const connectionList = info.connectionList ?? [];
      setSelectedLineIds(info.lineIdList.map((id) => String(id)));
      setSelectedLineRows(connectionList);
      const newData = connectionList.map((item, key) => ({
        key: key + 1,
        ...item,
      }));
      setTableData(newData);
      setRuleData({
        condition: info.condition,
        lineIdList: newData.map((item) => item.id),
      });
    }
  }, [info]);
  // 只初始化一次即可：该组件通过 ref.getValue 向外输出最新值

  useEffect(() => {
    if (!addLineOpen) {
      return;
    }
    fetchLineLossList({ pageNumber: 1 });
  }, [addLineOpen]);

  // const tableData = useMemo(
  //   () =>
  //     // activeLineIdList.map((id, idx) => {
  //     //   const lineId = String(id);
  //     //   const row = selectedLineRows.find((r) => r.id === lineId);
  //     //   return {
  //     //     key: lineId,
  //     //     index: idx + 1,
  //     //     id: lineId,
  //     //     name: row?.lineName ?? `线路 ${lineId}`,
  //     //     start: row?.fromDevice?.name ?? "-",
  //     //     end: row?.toDevice?.name ?? "-",
  //     //   };
  //     // }),
  //     selectedLineRows.map((item, index) => {
  //       return {
  //         key: item.id,
  //         name: item.name,
  //       };
  //     })[(activeLineIdList, selectedLineRows)],
  // );

  const columns: ColumnsType = useMemo(() => {
    const baseColumns: ColumnsType = [
      { title: "序号", dataIndex: "key", key: "key", width: 80 },
      { title: "线路名称", dataIndex: "lineName", key: "lineName" },
    ];
    if (readonly) {
      return [
        ...baseColumns,
        {
          title: "关联设备",
          key: "devices",
          render: (_value, record) => {
            const from = record.fromDevice?.name ?? "-";
            const to = record.toDevice?.name ?? "-";
            return `${from} / ${to}`;
          },
        },
      ];
    }
    return [
      ...baseColumns,
      {
        title: "操作",
        key: "action",
        width: 80,
        render: (_value, record) => (
          <Button
            type="link"
            onClick={() => {
              removeLine(record.id);
            }}
          >
            删除
          </Button>
        ),
      },
    ];
  }, [readonly]);

  const linePickerColumns: ColumnsType<LineLossPickRow> = useMemo(
    () => [
      { title: "线路名称", dataIndex: "lineName", key: "lineName" },

      {
        title: "设备",
        key: "devices",
        render: (_v, r) => {
          const from = r.fromDevice?.name ?? "-";
          const to = r.toDevice?.name ?? "-";
          return `${from} / ${to}`;
        },
      },
    ],
    [],
  );

  const linePickerPagedData = useMemo((): LineLossPickRow[] => linePickerList, [linePickerList]);

  /** 跨页勾选时 antd 的 selectedRows 仅含当前页，需与历史选中行按 id 合并，表头「全选」才能正确生效 */
  const mergeLinePickerSelection = useCallback((newKeys: Key[], rowsFromEvent: LineLossPickRow[]) => {
    const newIds = newKeys.map((k) => String(k));
    setSelectedLineIds(newIds);
    setSelectedLineRows((prev) => {
      const prevById = new Map(prev.map((r) => [r.id, r]));
      for (const r of rowsFromEvent) {
        prevById.set(r.id, r);
      }
      return newIds.map((id) => prevById.get(id)).filter((x): x is LineLossPickRow => x !== undefined);
    });
  }, []);

  /** 将当前查询条件下的全部线路（分页拉齐）并入已选 */
  const handleSelectAllQueryResults = useCallback(async () => {
    if (linePickerTotal <= 0) {
      return;
    }
    setLinePickerLoading(true);
    try {
      const lineName = linePickerQuery.trim();
      const pageSize = 500;
      const totalPages = Math.max(1, Math.ceil(linePickerTotal / pageSize));
      const allList: LineLossPickRow[] = [];
      for (let page = 1; page <= totalPages; page++) {
        const res = await cubeMessageCenterService.getLineLossList({
          pageNumber: page,
          pageSize,
          lineName,
        });
        const rawRecords = (res as unknown as { records?: unknown }).records;
        const list = Array.isArray(rawRecords) ? (rawRecords as LineLossPickRow[]) : [];
        allList.push(...list);
      }
      setSelectedLineIds((prev) => [...new Set([...prev, ...allList.map((r) => String(r.id))])]);
      setSelectedLineRows((prev) => {
        const byId = new Map(prev.map((r) => [r.id, r]));
        for (const r of allList) {
          byId.set(r.id, r);
        }
        const mergedIds = [...new Set([...prev.map((r) => r.id), ...allList.map((r) => r.id)])];
        return mergedIds.map((id) => byId.get(id)).filter((x): x is LineLossPickRow => x !== undefined);
      });
    } catch (_ignore) {
      // ignore
    } finally {
      setLinePickerLoading(false);
    }
  }, [linePickerTotal, linePickerQuery]);

  return (
    <div>
      {readonly ? (
        <ReadonlyDescriptions
          items={[
            {
              label: "线损率",
              value: `${getOptionLabel(compareOptions, parseCondition(ruleData.condition || buildCondition(">", "")).op)} ${
                parseCondition(ruleData.condition || buildCondition(">", "")).value || "-"
              }%`,
            },
          ]}
        />
      ) : (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span>线损率</span>
          {(() => {
            const parsed = parseCondition(ruleData.condition || buildCondition(">", ""));
            const numValue = toNumberOrNull(parsed.value);
            return (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 0" }}>
                <Select
                  value={parsed.op}
                  style={{ width: 120 }}
                  disabled={readonly}
                  options={compareOptions}
                  onChange={(op) => {
                    setRuleData(() => {
                      const nextValue = parsed.value;
                      return {
                        ...ruleData,
                        condition: buildCondition(op, nextValue),
                      };
                    });
                  }}
                  getPopupContainer={() => document.querySelector(".alarm-container") as unknown as HTMLElement}
                />
                <InputNumber
                  value={numValue}
                  style={{ width: 160 }}
                  disabled={readonly}
                  placeholder="请输入具体值"
                  min={0}
                  max={100}
                  precision={2}
                  step={0.01}
                  stringMode
                  onChange={(value) => {
                    setRuleData(() => {
                      const nextValue = value ?? "";
                      return {
                        ...ruleData,
                        condition: buildCondition(parsed.op, String(nextValue)),
                      };
                    });
                  }}
                />
                <span>%</span>
              </div>
            );
          })()}
        </div>
      )}

      <div style={{ marginTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>涉及线路</span>
          {!readonly && (
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => {
                setAddLineOpen(true);
                setLinePickerQuery("");
                // 打开弹窗时回显已选线路
                setSelectedLineIds(activeLineIdList.map((id) => String(id)));
                setLinePickerPagination((prev) => ({ ...prev, current: 1 }));
              }}
            >
              添加
            </Button>
          )}
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <Table
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={tableData}
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ["5", "10", "20", "50", "100"],
          }}
          locale={{ emptyText: "暂无数据" }}
        />
      </div>

      <Modal
        title={
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div>选择线路</div>
            <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>显示有线损值的线路，可批量添加</div>
          </div>
        }
        open={addLineOpen}
        width={980}
        onCancel={() => setAddLineOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddLineOpen(false)}>
            取消
          </Button>,
          <Button
            key="ok"
            type="primary"
            disabled={selectedLineIds.length === 0}
            onClick={() => {
              applySelectedLines();
              setAddLineOpen(false);
            }}
          >
            添加
          </Button>,
        ]}
        destroyOnClose
        maskClosable={false}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <Input
            style={{ width: 260 }}
            placeholder="名称"
            value={linePickerQuery}
            onChange={(e) => setLinePickerQuery(e.target.value)}
            onPressEnter={() => {
              fetchLineLossList({ pageNumber: 1, lineName: linePickerQuery.trim() });
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              fetchLineLossList({ pageNumber: 1, lineName: linePickerQuery.trim() });
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              setLinePickerQuery("");
              fetchLineLossList({ pageNumber: 1, lineName: "" });
            }}
          >
            重置
          </Button>
          <Button disabled={linePickerTotal === 0 || linePickerLoading} onClick={handleSelectAllQueryResults}>
            全选当前查询结果
          </Button>
        </div>

        <Table<LineLossPickRow>
          size="small"
          rowKey="id"
          columns={linePickerColumns}
          dataSource={linePickerPagedData}
          loading={linePickerLoading}
          rowSelection={{
            type: "checkbox",
            preserveSelectedRowKeys: true,
            selectedRowKeys: selectedLineIds,
            onChange: (keys, rows) => {
              mergeLinePickerSelection(keys, rows);
            },
          }}
          pagination={{
            ...linePickerPagination,
            total: linePickerTotal,
            onChange: (page, pageSize) => {
              setLinePickerPagination((prev) => ({ ...prev, current: page, pageSize }));
              fetchLineLossList({ pageNumber: page, pageSize, lineName: linePickerQuery.trim() });
            },
            position: ["bottomRight"],
          }}
        />
      </Modal>
    </div>
  );

  function applySelectedLines(): void {
    const newData = selectedLineRows.map((item, key) => ({
      key: key + 1,
      ...item,
    }));
    setTableData(newData);
    setRuleData({
      ...ruleData,
      lineIdList: newData.map((item) => item.id),
    });
  }

  function removeLine(lineId: string): void {
    setTableData((prev) => {
      const filtered = prev.filter((row) => String(row.id) !== lineId);
      return filtered.map((item, idx) => ({
        ...item,
        key: idx + 1,
      }));
    });
    setRuleData((prevRule) => ({
      ...prevRule,
      lineIdList: prevRule.lineIdList.filter((id) => String(id) !== lineId),
    }));
  }

  async function fetchLineLossList(params?: { pageNumber?: number; pageSize?: number; lineName?: string }): Promise<void> {
    setLinePickerLoading(true);
    try {
      const pageNumber = params?.pageNumber ?? Number(linePickerPagination.current ?? 1);
      const pageSize = params?.pageSize ?? Number(linePickerPagination.pageSize ?? 6);
      const lineName = params?.lineName ?? linePickerQuery.trim();

      const res = await cubeMessageCenterService.getLineLossList({
        pageNumber,
        pageSize,
        lineName,
      });

      const rawTotal = (res as unknown as { total?: unknown }).total;
      setLinePickerTotal(Number(rawTotal ?? 0));

      const rawRecords = (res as unknown as { records?: unknown }).records;
      const list = Array.isArray(rawRecords) ? rawRecords : [];
      const nextList = list as LineLossPickRow[];
      setLinePickerList(nextList);

      setLinePickerPagination((prev) => ({
        ...prev,
        current: pageNumber,
        pageSize,
      }));
    } catch (_ignore) {
      setLinePickerList([]);
      setLinePickerTotal(0);
    } finally {
      setLinePickerLoading(false);
    }
  }
});
