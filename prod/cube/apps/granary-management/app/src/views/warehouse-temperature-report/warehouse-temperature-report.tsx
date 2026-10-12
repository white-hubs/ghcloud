import { Select } from "ant-design-vue";
import { computed, defineComponent, onMounted, ref, watch, type VNode } from "vue";

import { CubeLayout, useCubeTable } from "@ghcloud/cube-app-design";
import type { LiangcangWarehouseTemperatureReportPointVO } from "@ghcloud/cube-granary-management-service";
import { BASE_API } from "@ghcloud/cube-protocol";
import { Button, message } from "@ghcloud/cube-ui";
import type { ColumnType } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeGranaryManagementService } from "@/api/service";

import "./warehouse-temperature-report.less";

type CellTone = "low" | "normal" | "high" | "empty";

const DEFAULT_CABLES_PER_GROUP = 9;
const WAREHOUSE_124_COLUMNS = 8;
const WAREHOUSE_124_ROWS_PER_LAYER = 5;
const WAREHOUSE_CORRESPONDING_ID = "WAREHOUSE_CORRESPONDING_ID";
const WAREHOUSE_CORRESPONDING_ID_URL = `${BASE_API}/dictionary/getSysDictionaryByCodeAndItemCode`;

interface WarehouseTemperatureLayout {
  columns: number;
  layers: number;
}

interface WarehouseCorrespondingId {
  label: string;
  id: string;
  col: number;
  row: number | null;
}

interface TemperatureCell {
  value: number | null;
  tone: CellTone;
}

interface TemperatureTableRow {
  id: string;
  pointNo?: string;
  layerNo?: string;
  isLayerGap?: boolean;
  isCableGroupHeader?: boolean;
  [key: string]: string | boolean | TemperatureCell | undefined;
}

interface ConfiguredTemperatureColumn {
  cableNo: string;
  points: Array<LiangcangWarehouseTemperatureReportPointVO | undefined>;
}

const FALLBACK_WAREHOUSE_TEMPERATURE_LAYOUTS: Record<string, WarehouseTemperatureLayout> = {
  "103仓": { columns: 10, layers: 9 },
  "111仓": { columns: 10, layers: 9 },
  "123仓": { columns: 9, layers: 4 },
};

const removeJsonTrailingCommas = (raw: string): string => {
  let result = "";
  let inString = false;
  let escaping = false;
  for (let index = 0; index < raw.length; index += 1) {
    const char = raw[index];
    if (inString) {
      result += char;
      if (escaping) {
        escaping = false;
      } else if (char === "\\") {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }
    if (char === ",") {
      let nextIndex = index + 1;
      while (nextIndex < raw.length && /\s/.test(raw[nextIndex])) {
        nextIndex += 1;
      }
      if (raw[nextIndex] === "}" || raw[nextIndex] === "]") {
        continue;
      }
    }
    result += char;
  }
  return result;
};

const parseWarehouseCorrespondingIds = (raw: unknown): WarehouseCorrespondingId[] => {
  if (typeof raw === "string") {
    try {
      return parseWarehouseCorrespondingIds(JSON.parse(raw) as unknown);
    } catch {
      try {
        return parseWarehouseCorrespondingIds(JSON.parse(removeJsonTrailingCommas(raw)) as unknown);
      } catch {
        return [];
      }
    }
  }
  if (Array.isArray(raw)) {
    return raw.flatMap((item) => parseWarehouseCorrespondingIds(item));
  }
  if (raw == null || typeof raw !== "object") {
    return [];
  }
  const row = raw as Record<string, unknown>;
  const col = Number(row.col);
  const rowCount = Number(row.row);
  if (typeof row.label === "string" && (typeof row.id === "string" || typeof row.id === "number") && Number.isInteger(col) && col > 0) {
    return [{ label: row.label, id: String(row.id), col, row: Number.isInteger(rowCount) && rowCount > 0 ? rowCount : null }];
  }
  return Object.values(row).flatMap((value) => parseWarehouseCorrespondingIds(value));
};

const loadWarehouseCorrespondingIds = async (): Promise<WarehouseCorrespondingId[]> => {
  const url = new URL(WAREHOUSE_CORRESPONDING_ID_URL, window.location.origin);
  url.searchParams.set("itemCode", WAREHOUSE_CORRESPONDING_ID);
  url.searchParams.set("code", WAREHOUSE_CORRESPONDING_ID);
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Warehouse corresponding dictionary request failed: ${resp.status}`);
  }
  return parseWarehouseCorrespondingIds(await resp.json());
};

const parsePointNo = (pointNo: string): number | null => {
  const value = Number(pointNo);
  return Number.isFinite(value) ? value : null;
};

const parseLayerNo = (pointNo: string): number | null => {
  const matched = pointNo.trim().match(/^S?(\d+)$/i);
  if (matched == null) {
    return null;
  }
  const value = Number(matched[1]);
  return Number.isFinite(value) ? value : null;
};

const chunk = <T,>(list: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    result.push(list.slice(i, i + size));
  }
  return result;
};

const formatTemperature = (value: number | null): string => (value == null ? "--" : `${value}℃`);

const isValidTemperature = (value: number | null | undefined): value is number => {
  return value != null && Number.isFinite(value) && value !== -128;
};

const renderTemperatureCell = (
  cell: TemperatureCell | undefined,
  temperatureRangeMin: number | null,
  temperatureRangeMax: number | null,
  fullCell = false,
): VNode => {
  const text = formatTemperature(cell?.value ?? null);
  const title =
    cell?.tone !== "empty" && temperatureRangeMin != null && temperatureRangeMax != null
      ? `温度分级区间：${formatTemperature(temperatureRangeMin)} 至 ${formatTemperature(temperatureRangeMax)}`
      : undefined;
  if (fullCell) {
    return (
      <span title={title} class={`warehouse-temperature-report-temperature is-full-cell is-${cell?.tone ?? "empty"}`}>
        {text}
      </span>
    );
  }
  return (
    <span title={title} class={`warehouse-temperature-report-temperature is-${cell?.tone ?? "empty"}`}>
      {text}
    </span>
  );
};

export const WarehouseTemperatureReport = defineComponent({
  name: "WarehouseTemperatureReport",
  setup: () => {
    const { pageTitle } = usePageName();
    const warehouseOptions = ref<Array<{ label: string; value: number }>>([]);
    const selectedWarehouseId = ref<number | null>(null);
    const selectedCableNo = ref<string>("ALL");
    const loading = ref(false);
    const reportData = ref<LiangcangWarehouseTemperatureReportPointVO[][]>([]);
    const temperatureRangeMin = ref<number | null>(null);
    const temperatureRangeMax = ref<number | null>(null);
    const warehouseCorrespondingIds = ref<WarehouseCorrespondingId[]>([]);
    const selectedWarehouseCorrespondingId = computed(() => {
      return warehouseCorrespondingIds.value.find((item) => item.id === String(selectedWarehouseId.value));
    });
    const selectedWarehouseLayoutLabel = computed(() => selectedWarehouseCorrespondingId.value?.label.trim() ?? "");
    const selectedWarehouseLayout = computed<WarehouseTemperatureLayout | null>(() => {
      const matched = selectedWarehouseCorrespondingId.value;
      if (matched == null) {
        return null;
      }
      const fallback = FALLBACK_WAREHOUSE_TEMPERATURE_LAYOUTS[selectedWarehouseLayoutLabel.value] ?? null;
      if (matched.row != null) {
        return { columns: matched.col, layers: matched.row };
      }
      return fallback;
    });
    const isWarehouse124 = computed(() => selectedWarehouseLayoutLabel.value === "124仓");
    const selectedWarehouseName = computed(() => {
      return warehouseOptions.value.find((item) => item.value === selectedWarehouseId.value)?.label ?? "粮仓";
    });
    const cablesPerGroup = computed(() => {
      if (selectedWarehouseId.value == null) {
        return DEFAULT_CABLES_PER_GROUP;
      }
      if (selectedWarehouseLayout.value != null) {
        return selectedWarehouseLayout.value.columns;
      }
      return selectedWarehouseCorrespondingId.value?.col ?? DEFAULT_CABLES_PER_GROUP;
    });

    const cableOptions = computed(() => {
      const set = new Set<string>();
      reportData.value.flat().forEach((item) => {
        if (item.cableNo.trim() !== "") {
          set.add(item.cableNo);
        }
      });
      return [{ label: "全部", value: "ALL" }, ...Array.from(set).map((cableNo) => ({ label: cableNo, value: cableNo }))];
    });

    const flatReportPoints = computed(() => reportData.value.flat());

    const visibleCableNos = computed<string[]>(() => {
      const set = new Set<string>();
      flatReportPoints.value.forEach((item) => {
        const cableNo = item.cableNo.trim() === "" ? "--" : item.cableNo;
        if (selectedCableNo.value !== "ALL" && cableNo !== selectedCableNo.value) {
          return;
        }
        set.add(cableNo);
      });
      return Array.from(set).sort((a, b) => {
        const left = Number(a);
        const right = Number(b);
        if (Number.isFinite(left) && Number.isFinite(right)) {
          return left - right;
        }
        return a.localeCompare(b);
      });
    });

    const pointNos = computed<string[]>(() => {
      if (selectedWarehouseLayout.value != null) {
        const layerCount = selectedWarehouseLayout.value.layers;
        return Array.from({ length: layerCount }, (_, index) => `S${layerCount - index}`);
      }
      const set = new Set<string>();
      flatReportPoints.value.forEach((item) => {
        const cableNo = item.cableNo.trim() === "" ? "--" : item.cableNo;
        if (selectedCableNo.value !== "ALL" && cableNo !== selectedCableNo.value) {
          return;
        }
        const pointNo = item.pointNo.trim() === "" ? "--" : item.pointNo;
        set.add(pointNo);
      });
      return Array.from(set).sort((a, b) => {
        const left = parsePointNo(a) ?? parseLayerNo(a);
        const right = parsePointNo(b) ?? parseLayerNo(b);
        if (left != null && right != null) {
          return right - left;
        }
        return a.localeCompare(b);
      });
    });

    const pointMatrix = computed(() => {
      const matrix = new Map<string, LiangcangWarehouseTemperatureReportPointVO>();
      flatReportPoints.value.forEach((item) => {
        const cableNo = item.cableNo.trim() === "" ? "--" : item.cableNo;
        if (selectedCableNo.value !== "ALL" && cableNo !== selectedCableNo.value) {
          return;
        }
        const pointNo = item.pointNo.trim() === "" ? "--" : item.pointNo;
        matrix.set(`${cableNo}__${pointNo}`, item);
      });
      return matrix;
    });

    const cableGroups = computed(() => chunk(visibleCableNos.value, cablesPerGroup.value));
    const configuredColumns = computed<ConfiguredTemperatureColumn[]>(() => {
      if (selectedWarehouseLayout.value == null) {
        return [];
      }
      return visibleCableNos.value.map((cableNo) => ({
        cableNo,
        points: pointNos.value.map((pointNo) => pointMatrix.value.get(`${cableNo}__${pointNo}`)),
      }));
    });
    const configuredColumnGroups = computed(() => chunk(configuredColumns.value, cablesPerGroup.value));
    const warehouse124Layers = computed(() => chunk(reportData.value, WAREHOUSE_124_ROWS_PER_LAYER));
    const loadWarehouseCableColumnDictionary = async (): Promise<void> => {
      try {
        warehouseCorrespondingIds.value = await loadWarehouseCorrespondingIds();
      } catch {
        warehouseCorrespondingIds.value = [];
      }
    };

    const loadWarehouseOptions = async (): Promise<void> => {
      const list = await cubeGranaryManagementService.getBoundWarehouseSimpleList();
      warehouseOptions.value = list.map((item) => ({
        label: item.name,
        value: item.warehouseId,
      }));
      if (warehouseOptions.value.length > 0) {
        selectedWarehouseId.value = warehouseOptions.value[0].value;
      }
    };

    const loadReport = async (): Promise<void> => {
      if (selectedWarehouseId.value == null) {
        reportData.value = [];
        temperatureRangeMin.value = null;
        temperatureRangeMax.value = null;
        return;
      }
      const warehouseId = selectedWarehouseId.value;
      loading.value = true;
      try {
        const [report, config] = await Promise.all([
          cubeGranaryManagementService.getWarehouseTemperatureReport({ warehouseId }),
          cubeGranaryManagementService.getLocationCardConfigDetail(warehouseId).catch(() => null),
        ]);
        reportData.value = report;
        const configuredRangeMin = config?.profile?.temperatureRangeMin;
        const configuredRangeMax = config?.profile?.temperatureRangeMax;
        temperatureRangeMin.value =
          typeof configuredRangeMin === "number" && Number.isFinite(configuredRangeMin) ? configuredRangeMin : null;
        temperatureRangeMax.value =
          typeof configuredRangeMax === "number" && Number.isFinite(configuredRangeMax) ? configuredRangeMax : null;
      } finally {
        loading.value = false;
      }
    };

    const resolveCellTone = (item: LiangcangWarehouseTemperatureReportPointVO | undefined): CellTone => {
      if (!isValidTemperature(item?.temperature)) {
        return "empty";
      }
      if (temperatureRangeMin.value != null && temperatureRangeMax.value != null) {
        if (item.temperature < temperatureRangeMin.value) {
          return "low";
        }
        if (item.temperature > temperatureRangeMax.value) {
          return "high";
        }
      }
      return "normal";
    };

    const normalTableColumns = computed<ColumnType[]>(() => [
      {
        title: selectedWarehouseLayout.value == null ? "点位号 / 电缆号" : "电缆号",
        dataIndex: selectedWarehouseLayout.value == null ? "pointNo" : "layerNo",
        width: 120,
        align: "center",
        customRender: ({ text }: { text: string }) => <span class="warehouse-temperature-report-point-cell">{text}</span>,
      },
      ...Array.from({ length: selectedWarehouseLayout.value?.columns ?? visibleCableNos.value.length }, (_, index) => ({
        title: selectedWarehouseLayout.value == null ? `${visibleCableNos.value[index]}号` : String(index + 1),
        dataIndex: `cable_${index}`,
        width: 96,
        align: "center",
        customRender: ({ record }: { record: TemperatureTableRow }) => {
          if (record.isCableGroupHeader === true) {
            return <span class="warehouse-temperature-report-layer-header-cell">{record[`cable_${index}`] as string | undefined}</span>;
          }
          return renderTemperatureCell(
            record[`cable_${index}`] as TemperatureCell | undefined,
            temperatureRangeMin.value,
            temperatureRangeMax.value,
            true,
          );
        },
      })),
    ]);

    const normalTableData = computed<TemperatureTableRow[]>(() => {
      if (selectedWarehouseLayout.value != null) {
        return configuredColumnGroups.value.flatMap((group, groupIndex) => {
          const headerRow: TemperatureTableRow = {
            id: `cable-group-${groupIndex}-header`,
            layerNo: "电缆号",
            isCableGroupHeader: true,
          };
          group.forEach((column, index) => {
            headerRow[`cable_${index}`] = `${column.cableNo}号`;
          });
          const rows = pointNos.value.map((pointNo, layerIndex) => {
            const row: TemperatureTableRow = {
              id: `cable-group-${groupIndex}-layer-${pointNo}`,
              layerNo: pointNo,
            };
            Array.from({ length: selectedWarehouseLayout.value?.columns ?? group.length }, (_, index) => {
              const point = group[index]?.points[layerIndex];
              row[`cable_${index}`] =
                point == null
                  ? { value: null, tone: "empty" }
                  : { value: isValidTemperature(point.temperature) ? point.temperature : null, tone: resolveCellTone(point) };
            });
            return row;
          });
          return groupIndex === 0 ? rows : [headerRow, ...rows];
        });
      }
      return pointNos.value.map((pointNo) => {
        const row: TemperatureTableRow = {
          id: `point-${pointNo}`,
          pointNo,
        };
        visibleCableNos.value.forEach((cableNo, index) => {
          const point = pointMatrix.value.get(`${cableNo}__${pointNo}`);
          row[`cable_${index}`] =
            point == null
              ? { value: null, tone: "empty" }
              : { value: isValidTemperature(point.temperature) ? point.temperature : null, tone: resolveCellTone(point) };
        });
        return row;
      });
    });

    const warehouse124TableColumns = computed<ColumnType[]>(() => {
      return [
        {
          title: "电缆号",
          dataIndex: "rowNo",
          width: 48,
          align: "center",
          customRender: ({ record, text }: { record: TemperatureTableRow; text: string }) => {
            if (record.isLayerGap === true) {
              return <span class="warehouse-temperature-report-point-cell">电缆号</span>;
            }
            return <span class="warehouse-temperature-report-point-cell">{text}</span>;
          },
        },
        ...Array.from({ length: WAREHOUSE_124_COLUMNS }, (_, index) => ({
          title: String(index + 1),
          dataIndex: `column_${index}`,
          width: 96,
          align: "center",
          customRender: ({ record }: { record: TemperatureTableRow }) => {
            if (record.isLayerGap === true) {
              return <span class="warehouse-temperature-report-layer-header-cell">{index + 1}</span>;
            }
            return renderTemperatureCell(
              record[`column_${index}`] as TemperatureCell | undefined,
              temperatureRangeMin.value,
              temperatureRangeMax.value,
              true,
            );
          },
        })),
      ];
    });

    const warehouse124TableData = computed<TemperatureTableRow[]>(() => {
      return warehouse124Layers.value.flatMap((layer, layerIndex) => {
        const rows = layer.map((row, rowIndex) => {
          const tableRow: TemperatureTableRow = {
            id: `warehouse-124-layer-${layerIndex}-row-${rowIndex}`,
            rowNo: String(rowIndex + 1),
          };
          Array.from({ length: WAREHOUSE_124_COLUMNS }, (_, index) => {
            const point = row[index];
            tableRow[`column_${index}`] = {
              value: isValidTemperature(point?.temperature) ? point.temperature : null,
              tone: resolveCellTone(point),
            };
          });
          return tableRow;
        });
        if (layerIndex >= warehouse124Layers.value.length - 1) {
          return rows;
        }
        return [
          ...rows,
          {
            id: `warehouse-124-layer-gap-${layerIndex}`,
            isLayerGap: true,
          },
        ];
      });
    });

    const tableColumns = computed<ColumnType[]>(() => {
      return isWarehouse124.value ? warehouse124TableColumns.value : normalTableColumns.value;
    });

    const tableData = computed<TemperatureTableRow[]>(() => {
      return isWarehouse124.value ? warehouse124TableData.value : normalTableData.value;
    });

    const [CubeTable, tableApi] = useCubeTable({
      columns: [],
      dataSource: [],
      autoFetch: false,
      pagination: false,
      rowKey: "id",
      customRow: (record) => {
        if ((record as TemperatureTableRow).isLayerGap === true) {
          return {
            class: "warehouse-temperature-report-layer-gap-row",
          };
        }
        if ((record as TemperatureTableRow).isCableGroupHeader === true) {
          return {
            class: "warehouse-temperature-report-cable-group-header-row",
          };
        }
        return {};
      },
    });

    watch(
      [tableColumns, tableData, loading],
      () => {
        tableApi.setColumns(tableColumns.value);
        tableApi.setDataSource(tableData.value);
        tableApi.loading.value = loading.value;
      },
      { immediate: true },
    );

    const resetFilters = (): void => {
      selectedCableNo.value = "ALL";
    };

    const exportCsv = (): void => {
      if (isWarehouse124.value) {
        if (reportData.value.length === 0) {
          message.warning("暂无可导出数据");
          return;
        }
        const lines: string[][] = [];
        const warehouse124Header = ["电缆号", ...Array.from({ length: WAREHOUSE_124_COLUMNS }, (_, index) => String(index + 1))];
        warehouse124Layers.value.forEach((layer, layerIndex) => {
          lines.push(warehouse124Header);
          layer.forEach((row, rowIndex) => {
            lines.push([
              String(rowIndex + 1),
              ...Array.from({ length: WAREHOUSE_124_COLUMNS }, (_, index) => {
                const value = row[index]?.temperature;
                return formatTemperature(isValidTemperature(value) ? value : null);
              }),
            ]);
          });
        });
        downloadCsv(lines);
        return;
      }

      if (
        (selectedWarehouseLayout.value == null ? visibleCableNos.value.length : configuredColumns.value.length) === 0 ||
        pointNos.value.length === 0
      ) {
        message.warning("暂无可导出数据");
        return;
      }

      const lines: string[][] = [];
      if (selectedWarehouseLayout.value != null) {
        configuredColumnGroups.value.forEach((group, groupIndex) => {
          lines.push(["电缆号", ...group.map((column) => `${column.cableNo}号`)]);
          pointNos.value.forEach((pointNo, layerIndex) => {
            const row: string[] = [pointNo];
            group.forEach((column) => {
              const value = column.points[layerIndex]?.temperature;
              row.push(formatTemperature(isValidTemperature(value) ? value : null));
            });
            lines.push(row);
          });
          if (groupIndex < configuredColumnGroups.value.length - 1) {
            lines.push([]);
          }
        });
        downloadCsv(lines);
        return;
      }

      cableGroups.value.forEach((group, groupIndex) => {
        lines.push(["点位号", ...group.map((cableNo) => `${cableNo}号`)]);
        pointNos.value.forEach((pointNo) => {
          const row: string[] = [pointNo];
          group.forEach((cableNo) => {
            const point = pointMatrix.value.get(`${cableNo}__${pointNo}`);
            row.push(formatTemperature(isValidTemperature(point?.temperature) ? point.temperature : null));
          });
          lines.push(row);
        });
        if (groupIndex < cableGroups.value.length - 1) {
          lines.push([]);
        }
      });

      downloadCsv(lines);
    };

    const downloadCsv = (lines: string[][]): void => {
      const csvLines = [[`粮仓：${selectedWarehouseName.value}`], [], ...lines];
      const csv = csvLines.map((line) => line.map((item) => `"${item.replaceAll('"', '""')}"`).join(",")).join("\n");

      const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const warehouseName = selectedWarehouseName.value.replace(/[\\/:*?"<>|]/g, "_");
      link.download = `${warehouseName}-粮情温度报表.csv`;
      link.click();
      URL.revokeObjectURL(url);
    };

    onMounted(async () => {
      try {
        await Promise.all([loadWarehouseOptions(), loadWarehouseCableColumnDictionary()]);
        await loadReport();
      } catch {
        message.error("加载温度报表失败");
      }
    });

    return (): VNode => (
      <CubeLayout title={pageTitle ?? "温度报表"} showFooter={false}>
        {{
          "layout-header": () => (
            <div class="layout-header-item">
              <Button type="primary" onClick={exportCsv}>
                导出Excel
              </Button>
            </div>
          ),
          "layout-content": () => (
            <div class="warehouse-temperature-report-page">
              <div class="warehouse-temperature-report-panel">
                <div class="warehouse-temperature-report-filters">
                  <label>
                    <span>粮仓选择</span>
                    <Select
                      class="warehouse-temperature-report-select"
                      value={selectedWarehouseId.value ?? undefined}
                      options={warehouseOptions.value}
                      onChange={async (value: number) => {
                        selectedWarehouseId.value = value;
                        selectedCableNo.value = "ALL";
                        await loadReport();
                      }}
                    />
                  </label>

                  {!isWarehouse124.value ? (
                    <label>
                      <span>电缆号</span>
                      <Select
                        class="warehouse-temperature-report-select"
                        value={selectedCableNo.value}
                        options={cableOptions.value}
                        onChange={(value: string) => {
                          selectedCableNo.value = value;
                        }}
                      />
                    </label>
                  ) : null}

                  <Button onClick={resetFilters}>重置</Button>
                </div>

                <div class={["warehouse-temperature-report-table-wrap", isWarehouse124.value ? "is-warehouse-124" : ""]}>
                  <CubeTable />
                </div>
              </div>
            </div>
          ),
        }}
      </CubeLayout>
    );
  },
});
