import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { playRecordTop } from "@/infrastructure/api/conference";
import StackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "./management-meetings-v2-shared.module.less";

const buildDateRange = (timeType: string): string[] => {
  const dateFormat = "YYYY-MM-DD HH:mm:ss";
  if (timeType === "TODAY") {
    return [moment().format("YYYY-MM-DD 00:00:00"), moment().format(dateFormat)];
  }
  if (timeType === "THIS_WEEK") {
    return [
      moment().startOf("week").add(1, "days").format("YYYY-MM-DD 00:00:00"),
      moment().endOf("week").add(1, "days").format(dateFormat),
    ];
  }
  if (timeType === "THIS_MONTH") {
    return [moment().startOf("month").format("YYYY-MM-DD 00:00:00"), moment().endOf("months").format(dateFormat)];
  }
  if (timeType === "THIS_YEAR") {
    return [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format(dateFormat)];
  }
  return ["", ""];
};

export const MeetingRoomUtilization = defineComponent({
  name: "MeetingRoomUtilization",
  props: {
    title: { type: String, required: false, default: "会议室利用率分析" },
  },
  setup(props) {
    const takeNotes = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: buildDateRange("TODAY"),
    });
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const hasRealUtilizationData = ref(false);
    const buildUtilization = reactive<{
      xData: string[];
      yData: { name: string; data: number[] }[];
    }>({
      xData: [],
      yData: [
        { name: "使用率", data: [] },
        { name: "未使用率", data: [] },
      ],
    });

    const getPlayRecordTop = async (): Promise<void> => {
      try {
        if (!takeNotes.value.dateRange?.[0] || !takeNotes.value.dateRange?.[1]) {
          takeNotes.value = {
            ...takeNotes.value,
            dateRange: buildDateRange(takeNotes.value.timeType || "TODAY"),
          };
        }
        // 对齐旧版：仅传 period
        const res = await playRecordTop({ period: takeNotes.value.dateRange.join(",") });
        buildUtilization.xData = [];
        buildUtilization.yData[0].data = [];
        buildUtilization.yData[1].data = [];
        const rows = Array.isArray(res) ? res : [];
        hasRealUtilizationData.value = rows.length > 0;
        rows.forEach((item: { name?: string; usageRate?: number; unusedRate?: number }) => {
          buildUtilization.xData.push(String(item?.name || "--"));
          buildUtilization.yData[0].data.push(Number(item?.usageRate || 0));
          buildUtilization.yData[1].data.push(Number(item?.unusedRate || 0));
        });
      } catch {
        buildUtilization.xData = [];
        buildUtilization.yData[0].data = [];
        buildUtilization.yData[1].data = [];
        hasRealUtilizationData.value = false;
      } finally {
        loaded.value = true;
      }
    };

    onMounted(() => {
      void getPlayRecordTop();
    });

    const hasData = computed(() => loaded.value && hasRealUtilizationData.value && buildUtilization.xData.length > 0);

    const renderDateForm = (): JSX.Element => (
      <div class="meeting-manage-header-toolbar access-control-header-toolbar" data-no-zoom>
        <DateInlineForm
          modelValue={takeNotes.value}
          onUpdate:modelValue={(v) => {
            takeNotes.value = v;
          }}
          onSearch={getPlayRecordTop}
        />
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["meeting-manage-v2-body", isZoom ? "is-zoom access-control-v2-panel access-control-card-theme" : ""]}>
        <div class="meeting-manage-chart-surface">
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : hasData.value ? (
            <div class="meeting-manage-chart meeting-manage-stacked-chart">
              <StackedColumn unit="%" xData={buildUtilization.xData} yData={buildUtilization.yData} />
            </div>
          ) : (
            <div class={["meeting-manage-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="meeting-manage-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme meeting-manage-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="meeting-utilization" />,
            extra: renderDateForm,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default MeetingRoomUtilization;
