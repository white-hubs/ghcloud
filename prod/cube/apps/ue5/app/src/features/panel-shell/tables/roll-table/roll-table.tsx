import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from "vue";

import scrollParams from "./scroll-params";
import { VIEWPORT_METRICS_CHANGE_EVENT } from "@/application/bootstrap/viewport-coordinator";
import { resolveLayoutPx } from "@/features/cards/base-panel-render/list-scroll-layout";
import { Vue3SeamlessScroll } from "@/features/panel-shell/tables/seamless-scroll";
import { getcurrentData } from "@/infrastructure/utils/common";
import NoData from "@/shared-ui/panel/noData";
import { storeMarket } from "@/visualization-core/stores/other";

import "./roll-table.module.less";

type Align = "left" | "center" | "right";

interface Columns {
  title: string;
  dataIndex: string;
  /** 固定列宽（px）。与 flex 互斥，优先 flex */
  width?: number | string;
  /** 弹性占比，默认未指定 width/flex 时均分为 1 */
  flex?: number | string;
  align?: Align;
  slots?: { customRender?: string };
  customRender?: (value: unknown, record: Record<string, unknown>, index: number) => unknown;
}

export const RollTable = defineComponent({
  name: "RollTable",
  props: {
    column: { type: Array as PropType<Columns[]>, required: true, default: () => [] },
    data: { type: Array as PropType<Record<string, unknown>[]>, required: true, default: () => [] },
    showLength: { type: Number, required: true, default: 4 },
    autoScroll: { type: Boolean, required: false, default: true },
    /** 无缝滚动单行高度，需与行样式 height 一致 */
    rowHeight: { type: Number, required: false, default: 40 },
  },
  emits: ["clickRow"],
  setup(props, { emit, slots }) {
    const piniaStoreMarket = storeMarket();
    const listContainer = ref<HTMLElement | null>(null);
    const { waitTime } = scrollParams();
    const layoutGeneration = ref(0);

    onMounted(() => {
      const bump = (): void => {
        layoutGeneration.value += 1;
      };
      window.addEventListener(VIEWPORT_METRICS_CHANGE_EVENT, bump);
      onBeforeUnmount(() => window.removeEventListener(VIEWPORT_METRICS_CHANGE_EVENT, bump));
    });

    const layoutRowHeight = computed(() => {
      layoutGeneration.value;
      return resolveLayoutPx(props.rowHeight);
    });
    const bodyHeightPx = computed(() => layoutRowHeight.value * Math.max(1, props.showLength));
    const bodyViewportStyle = computed(() => ({
      height: `${bodyHeightPx.value}px`,
      maxHeight: `${bodyHeightPx.value}px`,
      flex: "0 0 auto",
    }));

    watch(
      () => piniaStoreMarket.currentMarketName,
      (n) => {
        if (n !== "") {
          getcurrentData(props.data, n);
        } else {
          getcurrentData(props.data, n, false);
        }
      },
    );

    const styleItem = computed(() => (item: Columns) => {
      const style: Record<string, string | number> = {
        textAlign: item.align || "center",
        boxSizing: "border-box",
        minWidth: 0,
      };

      if (item.flex !== undefined && item.flex !== null && item.flex !== "") {
        const flexGrow = typeof item.flex === "number" ? item.flex : Number(item.flex) || 1;
        style.flex = `${flexGrow} 1 0%`;
        style.width = "auto";
      } else if (item.width != null && Number(item.width) > 0) {
        const fixedWidth = Number(item.width);
        style.flex = `0 0 ${fixedWidth}px`;
        style.width = `${fixedWidth}px`;
        style.maxWidth = `${fixedWidth}px`;
      } else {
        style.flex = "1 1 0%";
        style.width = "auto";
      }

      return style;
    });

    const cellTitle = (record: Record<string, unknown>, td: Columns): string | undefined => {
      if (td.slots || td.customRender) return undefined;
      const value = record?.[td.dataIndex];
      return value == null ? undefined : String(value);
    };

    const clickTableRow = (tr: Record<string, unknown>): void => {
      emit("clickRow", tr);
    };

    const renderCell = (tr: Record<string, unknown>, td: Columns, index: number): JSX.Element => {
      if (td.slots) {
        const slotName = td.slots.customRender;
        return (
          <div class="table-td-inner">
            {td.customRender ? <span>{td.customRender(tr[td.dataIndex], tr, index)}</span> : null}
            {!td.customRender && slotName ? slots[slotName]?.({ record: tr }) : null}
          </div>
        );
      }
      return (
        <span class="table-td-text" style={piniaStoreMarket.currentMarketName == tr[td.dataIndex] ? "color:#6194f7" : ""}>
          {tr[td.dataIndex] as string}
        </span>
      );
    };

    return (): JSX.Element => (
      <>
        {props.data.length > 0 ? (
          <div class="roll-table flex-column">
            <div class="header table-row">
              {props.column.map((td, index) => (
                <div class="table-th" key={`th-${td.dataIndex || index}`} style={styleItem.value(td)}>
                  {td.title}
                </div>
              ))}
            </div>

            {!piniaStoreMarket.currentMarket ? (
              <div class="scroll_warp" ref={listContainer} style={bodyViewportStyle.value}>
                {props.data.length > props.showLength ? (
                  <Vue3SeamlessScroll
                    list={props.data}
                    step={props.autoScroll ? 0.5 : 0}
                    hover
                    singleHeight={props.rowHeight}
                    waitTime={waitTime}
                  >
                    {props.data.map((tr, index) => (
                      <div class="table-tr table-row" key={String(tr?.key ?? `scroll-${index}`)} onClick={() => clickTableRow(tr)}>
                        {props.column.map((td, j) => (
                          <div
                            class="table-td"
                            key={`scroll-${index}-${td.dataIndex || j}`}
                            style={styleItem.value(td)}
                            title={cellTitle(tr, td)}
                          >
                            {renderCell(tr, td, index)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </Vue3SeamlessScroll>
                ) : (
                  props.data.map((tr, index) => (
                    <div class="table-tr table-row" key={String(tr?.key ?? `static-${index}`)} onClick={() => clickTableRow(tr)}>
                      {props.column.map((td, j) => (
                        <div
                          class="table-td"
                          key={`static-${index}-${td.dataIndex || j}`}
                          style={styleItem.value(td)}
                          title={cellTitle(tr, td)}
                        >
                          {renderCell(tr, td, index)}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div class="scroll_warp1" ref={listContainer}>
                {props.data.map((tr, index) => (
                  <div
                    class={["table-tr", "table-row", tr.name === piniaStoreMarket.currentMarket ? "active" : ""]}
                    key={String(tr?.key ?? `market-${index}`)}
                    onClick={() => clickTableRow(tr)}
                  >
                    {props.column.map((td, j) => (
                      <div
                        class="table-td"
                        key={`market-${index}-${td.dataIndex || j}`}
                        style={styleItem.value(td)}
                        title={cellTitle(tr, td)}
                      >
                        {renderCell(tr, td, index)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NoData />
        )}
      </>
    );
  },
});

export default RollTable;
