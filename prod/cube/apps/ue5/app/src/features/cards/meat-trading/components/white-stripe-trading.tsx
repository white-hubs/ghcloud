import { computed, defineComponent, onMounted, ref, type PropType } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { setTimeType } from "@/infrastructure/utils/common";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "../cards/meat-trading-v2-shared.module.less";

export const WhiteStripeTrading = defineComponent({
  name: "WhiteStripeTrading",
  props: {
    title: { type: String, required: true },
    tableHead: { type: Array as PropType<string[]>, required: true },
    areaAlarmRank: { type: Array as PropType<any[]>, required: true },
  },
  emits: ["getTime", "showMore"],
  setup(props, { emit }) {
    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];
    let topTimeFrame = ref<ModelValueItf>({
      timeType: "THIS_WEEK",
      dateRange: ["", ""],
    });

    const changeTopTimeFrame = () => {
      emit("getTime", setTimeType(topTimeFrame.value.timeType));
    };

    onMounted(() => {
      changeTopTimeFrame();
    });

    const showMore = (item: any) => {
      emit("showMore", item);
    };

    const hasRows = computed(() => Array.isArray(props.areaAlarmRank) && props.areaAlarmRank.length > 0);
    const columnType = computed(() => (props.tableHead.length >= 3 ? "is-three" : "is-two"));
    const iconName = computed(() => (props.title.includes("屠宰") || props.title.includes("供货") ? "meat-supply" : "meat-ranking"));

    const formatNumber = (value: unknown): string => {
      const numericValue = Number(value ?? 0);
      if (!Number.isFinite(numericValue)) return String(value ?? "-");
      return numericValue.toLocaleString();
    };

    const renderRankBody = (isZoom: boolean): JSX.Element => (
      <div class={["meat-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasRows.value ? (
          <div class={["meat-v2-rank-list", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <div class={["meat-v2-rank-head", columnType.value]}>
              {props.tableHead.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            {props.areaAlarmRank.map((item, index) => (
              <div class={["meat-v2-rank-row", columnType.value]} key={`${item.name ?? "rank"}-${index}`} onClick={() => showMore(item)}>
                <div class="meat-v2-rank-main">
                  <span class="meat-v2-rank-index">{index + 1}</span>
                  <span class="meat-v2-rank-name" title={item.name}>
                    {item.name || "-"}
                  </span>
                  {props.tableHead.length < 3 && item.code !== undefined && (
                    <span class="meat-v2-rank-sub">{formatNumber(item.code)} 片</span>
                  )}
                </div>
                {props.tableHead.length >= 3 && (
                  <span class="meat-v2-rank-cell" title={item.phone || item.other || "-"}>
                    {item.phone || item.other || "-"}
                  </span>
                )}
                <span class="meat-v2-rank-value">{formatNumber(item.alarmNum)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div class={["meat-v2-empty", "meat-v2-surface", isZoom ? "is-zoom" : ""]}>
            <NoData />
          </div>
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="meat-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card meat-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={820}
          v-slots={{
            titleIcon: () => <CardTitleIcon name={iconName.value} />,
            extra: () => (
              <div class="meat-v2-toolbar" data-no-zoom>
                <DateInlineForm
                  timeList={timeList}
                  modelValue={topTimeFrame.value}
                  onUpdate:modelValue={(v) => {
                    topTimeFrame.value = v;
                  }}
                  onSearch={changeTopTimeFrame}
                ></DateInlineForm>
              </div>
            ),
            default: () => renderRankBody(false),
            "zoom-content": () => renderRankBody(true),
          }}
        />
      </div>
    );
  },
});

export default WhiteStripeTrading;
