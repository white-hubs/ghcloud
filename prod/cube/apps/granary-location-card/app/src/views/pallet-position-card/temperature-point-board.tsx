import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, Teleport, watch } from "vue";
import type { PropType } from "vue";

import type { WarehouseTemperatureReportPoint } from "@/api/location-card-types";

const EMPTY_TEXT = "--";
const WAREHOUSE_124_TEMP_POINT_COLUMNS = 8;
const WAREHOUSE_124_ROWS_PER_FLOOR = 5;

type TemperatureBoardLayout = "cylinder" | "warehouse-123" | "warehouse-124" | "generic";

interface TemperaturePointCell {
  key: string;
  point?: WarehouseTemperatureReportPoint;
}

interface TemperaturePointRow {
  id: string;
  label: string;
  cells: TemperaturePointCell[];
  floorLabel?: string;
}

interface ActiveTemperaturePointTooltip {
  cableNo: number;
  temperature: string;
  left: number;
  top: number;
}

type TemperatureTone = "low" | "normal" | "high" | null;

const chunk = <T,>(list: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let index = 0; index < list.length; index += size) {
    result.push(list.slice(index, index + size));
  }
  return result;
};

const isValidTemperature = (value: number | null | undefined): value is number => {
  return value != null && Number.isFinite(value) && value !== -128;
};

const getNumericSuffix = (value: string): number | null => {
  const matched = value.trim().match(/(?:C|S)?(\d+)$/i);
  if (matched == null) {
    return null;
  }
  const numberValue = Number(matched[1]);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const normalizeCableNo = (value: string): string => {
  const numberValue = getNumericSuffix(value);
  return numberValue == null ? value.trim().toUpperCase() : String(numberValue);
};

const normalizeLayerNo = (value: string): string => {
  const numberValue = getNumericSuffix(value);
  return numberValue == null ? value.trim().toUpperCase() : `S${numberValue}`;
};

const resolveTemperatureBoardLayout = (warehouseLabel: string | null): TemperatureBoardLayout => {
  switch (warehouseLabel) {
    case "103仓":
    case "111仓":
      return "cylinder";
    case "123仓":
      return "warehouse-123";
    case "124仓":
      return "warehouse-124";
    default:
      return "generic";
  }
};

const formatTemperature = (point: WarehouseTemperatureReportPoint | undefined): string => {
  return isValidTemperature(point?.temperature) ? point.temperature.toFixed(1) : EMPTY_TEXT;
};

export const TemperaturePointBoard = defineComponent({
  name: "TemperaturePointBoard",
  props: {
    reportRows: {
      type: Array as PropType<WarehouseTemperatureReportPoint[][]>,
      required: true,
    },
    warehouseLabel: {
      type: String as PropType<string | null>,
      default: null,
    },
    temperatureRangeMin: {
      type: Number as PropType<number | null>,
      default: null,
    },
    temperatureRangeMax: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  setup: (props) => {
    const activeTooltip = ref<ActiveTemperaturePointTooltip | null>(null);
    const cylinderElement = shallowRef<HTMLDivElement | null>(null);
    const isCylinderHovered = shallowRef(false);
    let cylinderScrollTimer: ReturnType<typeof window.setInterval> | null = null;
    let cylinderScrollDirection = 1;
    const layout = computed(() => resolveTemperatureBoardLayout(props.warehouseLabel));
    const flatPoints = computed(() => props.reportRows.flat());
    const pointMatrix = computed(() => {
      const matrix = new Map<string, WarehouseTemperatureReportPoint>();
      flatPoints.value.forEach((point) => {
        matrix.set(`${normalizeCableNo(point.cableNo)}__${normalizeLayerNo(point.pointNo)}`, point);
      });
      return matrix;
    });
    const cylinderLayerNos = computed<number[]>(() => {
      const layerNos = new Set<number>();
      flatPoints.value.forEach((point) => {
        const layerNo = getNumericSuffix(normalizeLayerNo(point.pointNo));
        if (layerNo != null) {
          layerNos.add(layerNo);
        }
      });
      return [...layerNos].sort((a, b) => b - a);
    });
    const genericColumnCount = computed(() => Math.max(1, ...props.reportRows.map((row) => row.length)));
    const genericFloors = computed<TemperaturePointRow[][]>(() => {
      return props.reportRows.map((row, rowIndex) => [
        {
          id: `generic-${rowIndex}`,
          label: row[0]?.pointNo || String(rowIndex + 1),
          cells: Array.from({ length: genericColumnCount.value }, (_, colIndex) => ({
            key: `generic-${rowIndex}-${colIndex}`,
            point: row[colIndex],
          })),
        },
      ]);
    });
    const warehouse124Floors = computed<TemperaturePointRow[][]>(() => {
      return chunk(props.reportRows, WAREHOUSE_124_ROWS_PER_FLOOR).map((floor, floorIndex) =>
        floor.map((row, rowIndex) => ({
          id: `warehouse-124-${floorIndex}-${rowIndex}`,
          label: row[0]?.pointNo || String(rowIndex + 1),
          cells: Array.from({ length: WAREHOUSE_124_TEMP_POINT_COLUMNS }, (_, colIndex) => ({
            key: `warehouse-124-${floorIndex}-${rowIndex}-${colIndex}`,
            point: row[colIndex],
          })),
        })),
      );
    });
    const warehouse123Floors = computed<TemperaturePointRow[][]>(() => {
      return [4, 3, 2, 1].map((layerNo) => {
        const layerLabel = `S${layerNo}`;
        return Array.from({ length: 6 }, (_, rowIndex) => ({
          id: `warehouse-123-${layerLabel}-${rowIndex}`,
          label: String(rowIndex + 1),
          floorLabel: rowIndex === 0 ? layerLabel : undefined,
          cells: Array.from({ length: 9 }, (_, columnIndex) => {
            const cableNo = rowIndex * 9 + columnIndex + 1;
            return {
              key: `warehouse-123-${layerLabel}-${cableNo}`,
              point: pointAt(cableNo, layerLabel),
            };
          }),
        }));
      });
    });
    const genericHeaders = computed(() => Array.from({ length: genericColumnCount.value }, (_, index) => String(index + 1)));
    const pointAt = (cableNo: number, layerNo: string): WarehouseTemperatureReportPoint | undefined => {
      return pointMatrix.value.get(`${cableNo}__${layerNo}`);
    };
    const getTemperatureTone = (point: WarehouseTemperatureReportPoint | undefined): TemperatureTone => {
      if (!isValidTemperature(point?.temperature) || props.temperatureRangeMin == null || props.temperatureRangeMax == null) {
        return null;
      }
      if (point.temperature < props.temperatureRangeMin) {
        return "low";
      }
      return point.temperature > props.temperatureRangeMax ? "high" : "normal";
    };
    const temperatureRangeTitle = (): string | undefined => {
      if (props.temperatureRangeMin == null || props.temperatureRangeMax == null) {
        return undefined;
      }
      return `温度分级区间：${props.temperatureRangeMin}℃ 至 ${props.temperatureRangeMax}℃`;
    };
    const pointTitle = (cableNo: number, layerNo: string, point: WarehouseTemperatureReportPoint | undefined): string => {
      return `C${cableNo} · ${layerNo} · ${formatTemperature(point)}℃`;
    };
    const showPointTooltip = (
      event: MouseEvent | FocusEvent,
      cableNo: number,
      point: WarehouseTemperatureReportPoint | undefined,
    ): void => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const rect = target.getBoundingClientRect();
      activeTooltip.value = {
        cableNo,
        temperature: formatTemperature(point),
        left: rect.left + rect.width / 2,
        top: rect.top - 8,
      };
    };
    const hidePointTooltip = (): void => {
      activeTooltip.value = null;
    };
    const stopCylinderAutoScroll = (): void => {
      if (cylinderScrollTimer != null) {
        window.clearInterval(cylinderScrollTimer);
        cylinderScrollTimer = null;
      }
    };
    const startCylinderAutoScroll = (): void => {
      stopCylinderAutoScroll();
      const element = cylinderElement.value;
      if (isCylinderHovered.value || layout.value !== "cylinder" || element == null || element.scrollHeight <= element.clientHeight) {
        return;
      }
      cylinderScrollTimer = window.setInterval(() => {
        const scrollElement = cylinderElement.value;
        if (scrollElement == null || isCylinderHovered.value) {
          stopCylinderAutoScroll();
          return;
        }
        const maxScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
        if (maxScrollTop <= 0) {
          stopCylinderAutoScroll();
          return;
        }
        const nextScrollTop = scrollElement.scrollTop + cylinderScrollDirection * 2;
        if (nextScrollTop >= maxScrollTop) {
          scrollElement.scrollTop = maxScrollTop;
          cylinderScrollDirection = -1;
        } else if (nextScrollTop <= 0) {
          scrollElement.scrollTop = 0;
          cylinderScrollDirection = 1;
        } else {
          scrollElement.scrollTop = nextScrollTop;
        }
      }, 42);
    };
    const pauseCylinderAutoScroll = (): void => {
      isCylinderHovered.value = true;
      stopCylinderAutoScroll();
    };
    const resumeCylinderAutoScroll = (): void => {
      isCylinderHovered.value = false;
      startCylinderAutoScroll();
    };
    watch(
      [layout, () => props.reportRows],
      () => {
        void nextTick().then(startCylinderAutoScroll);
      },
      { flush: "post" },
    );
    onMounted(startCylinderAutoScroll);
    onBeforeUnmount(stopCylinderAutoScroll);
    const renderFloatingTooltip = (): JSX.Element | null => {
      const tooltip = activeTooltip.value;
      if (tooltip == null) {
        return null;
      }
      return (
        <Teleport to="body">
          <div class="ppc-temperature-point-tooltip" role="tooltip" style={{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }}>
            <strong>C{tooltip.cableNo}</strong>
            <span>{tooltip.temperature}℃</span>
          </div>
        </Teleport>
      );
    };
    const renderCell = (cell: TemperaturePointCell): JSX.Element => {
      const tone = getTemperatureTone(cell.point);
      return (
        <span
          key={cell.key}
          title={tone == null ? undefined : temperatureRangeTitle()}
          class={{
            "ppc-temp-point-chip": true,
            "ppc-temp-point-chip--low": tone === "low",
            "ppc-temp-point-chip--normal": tone === "normal",
            "ppc-temp-point-chip--high": tone === "high",
          }}
        >
          {formatTemperature(cell.point)}
        </span>
      );
    };
    const renderStandardBoard = (
      floors: TemperaturePointRow[][],
      headers: string[],
      configured: boolean,
      warehouse123 = false,
      warehouse124 = false,
    ): JSX.Element => {
      return (
        <div
          class={[
            "ppc-temp-point-board",
            configured ? "ppc-temp-point-board--configured" : "",
            warehouse123 ? "ppc-temp-point-board--warehouse-123" : "",
            warehouse124 ? "ppc-temp-point-board--warehouse-124" : "",
          ]}
          style={`--ppc-temp-point-columns: ${headers.length}`}
        >
          <div class="ppc-temp-point-head">
            <span class="ppc-temp-point-head__corner">
              <span>电缆号</span>
              <span>层级</span>
            </span>
            {headers.map((header) => (
              <span key={header} class="ppc-temp-point-head__col">
                {header}
              </span>
            ))}
          </div>
          <div class="ppc-temp-point-body">
            {props.reportRows.length === 0 ? (
              <div class="ppc-temp-point-empty">暂无温度点位数据</div>
            ) : (
              floors.map((floor, floorIndex) => (
                <div key={`floor-${floorIndex}`} class="ppc-temp-point-floor">
                  {floor[0]?.floorLabel != null ? <span class="ppc-temp-point-floor__layer-label">{floor[0].floorLabel}</span> : null}
                  {floor.map((row) => (
                    <div key={row.id} class="ppc-temp-point-row">
                      <span class="ppc-temp-point-row__idx">{row.label}</span>
                      {row.cells.map(renderCell)}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      );
    };
    const renderCylinderLayer = (layerNo: number): JSX.Element => {
      const layerLabel = `S${layerNo}`;
      const rings = [
        { id: 1, start: 1, count: 4, xRadius: 15.5, yRadius: 11.5 },
        { id: 2, start: 5, count: 6, xRadius: 31, yRadius: 25 },
        { id: 3, start: 11, count: 10, xRadius: 45.5, yRadius: 46 },
      ];
      return (
        <div key={layerLabel} class="ppc-temperature-cylinder__layer">
          <span class="ppc-temperature-cylinder__layer-label">{layerLabel}</span>
          <div class="ppc-temperature-cylinder__section">
            {rings.map((ring) => (
              <div key={ring.id} class={["ppc-temperature-cylinder__ring", `ppc-temperature-cylinder__ring--${ring.id}`]} />
            ))}
            {rings.flatMap((ring) =>
              Array.from({ length: ring.count }, (_, index) => {
                const cableNo = ring.start + index;
                const point = pointAt(cableNo, layerLabel);
                const tone = getTemperatureTone(point);
                const angle = -45 + (360 / ring.count) * index;
                const radians = (angle * Math.PI) / 180;
                const left = 50 + Math.cos(radians) * ring.xRadius;
                const top = 50 + Math.sin(radians) * ring.yRadius;
                const ornamentCount = ring.id;
                const ornaments = Array.from({ length: ornamentCount }, (_, ornamentOffset) => {
                  const ornamentIndex = ornamentOffset + 1;
                  const ornamentAngle = angle + ((360 / ring.count) * ornamentIndex) / (ornamentCount + 1);
                  const ornamentRadians = (ornamentAngle * Math.PI) / 180;
                  return {
                    left: 50 + Math.cos(ornamentRadians) * ring.xRadius,
                    top: 50 + Math.sin(ornamentRadians) * ring.yRadius,
                    index: ornamentIndex,
                  };
                });
                return [
                  <span
                    key={`${layerLabel}-${cableNo}`}
                    aria-label={pointTitle(cableNo, layerLabel, point)}
                    tabindex={0}
                    onMouseenter={(event) => showPointTooltip(event, cableNo, point)}
                    onMouseleave={hidePointTooltip}
                    onFocus={(event) => showPointTooltip(event, cableNo, point)}
                    onBlur={hidePointTooltip}
                    class={{
                      "ppc-temperature-cylinder__point": true,
                      [`ppc-temperature-cylinder__point--ring-${ring.id}`]: true,
                      "ppc-temperature-cylinder__point--low": tone === "low",
                      "ppc-temperature-cylinder__point--normal": tone === "normal",
                      "ppc-temperature-cylinder__point--high": tone === "high",
                    }}
                    style={{ left: `${left}%`, top: `${top}%` }}
                  >
                    {formatTemperature(point)}
                  </span>,
                  ...ornaments.map((ornament) => (
                    <span
                      key={`${layerLabel}-${cableNo}-ornament-${ornament.index}`}
                      aria-hidden="true"
                      class={["ppc-temperature-cylinder__ornament", `ppc-temperature-cylinder__ornament--ring-${ring.id}`]}
                      style={{ left: `${ornament.left}%`, top: `${ornament.top}%` }}
                    />
                  )),
                ];
              }),
            )}
          </div>
        </div>
      );
    };
    const renderCylinder = (): JSX.Element => {
      return (
        <div
          ref={cylinderElement}
          class="ppc-temperature-cylinder"
          onMouseenter={pauseCylinderAutoScroll}
          onMouseleave={resumeCylinderAutoScroll}
        >
          <div class="ppc-temperature-cylinder__body">{cylinderLayerNos.value.map(renderCylinderLayer)}</div>
        </div>
      );
    };
    return () => {
      let board: JSX.Element;
      if (props.reportRows.length === 0) {
        board = renderStandardBoard([], ["1"], false);
      } else if (layout.value === "cylinder") {
        board = renderCylinder();
      } else if (layout.value === "warehouse-123") {
        board = renderStandardBoard(
          warehouse123Floors.value,
          Array.from({ length: 9 }, (_, index) => String(index + 1)),
          true,
          true,
        );
      } else if (layout.value === "warehouse-124") {
        board = renderStandardBoard(
          warehouse124Floors.value,
          Array.from({ length: WAREHOUSE_124_TEMP_POINT_COLUMNS }, (_, index) => String(index + 1)),
          true,
          false,
          true,
        );
      } else {
        board = renderStandardBoard(genericFloors.value, genericHeaders.value, false);
      }
      return (
        <>
          {board}
          {renderFloatingTooltip()}
        </>
      );
    };
  },
});
