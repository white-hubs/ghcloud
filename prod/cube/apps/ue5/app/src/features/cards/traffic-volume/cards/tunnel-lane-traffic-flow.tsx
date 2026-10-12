import { defineComponent, onMounted, reactive, ref } from "vue";

import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { differentTunnels } from "@/infrastructure/api/securitymanagement";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import stackedColumn from "@/shared-ui/panel/charts/stacked-column/stackedColumn";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "./tunnel-lane-traffic-flow.module.less";

const vehicleTrendIcon = getThemeImage("vehicle-trend.png");

export const TunnelLaneTrafficFlow = defineComponent({
  name: "TunnelLaneTrafficFlow",
  setup() {
    const loading = ref(false);
    const equipmentAlarmTime = ref<ModelValueItf>({
      timeType: "TODAY",
      dateRange: [],
    });

    const buildUtilization = reactive({
      xData: [] as string[],
      yData: [
        { name: "驶入", data: [] as number[] },
        { name: "驶出", data: [] as number[] },
      ],
    });

    const listData = reactive<Array<Record<string, unknown>>>([]);
    const column = reactive([
      { title: "车道", dataIndex: "lane", width: 120 },
      { title: "驶入数量", dataIndex: "inNum" },
      { title: "驶出数量", dataIndex: "outNum" },
    ]);

    const changeHandleEquipmentAlarmTime = async (): Promise<void> => {
      loading.value = true;
      try {
        const params = {
          type: equipmentAlarmTime.value.timeType,
          period: equipmentAlarmTime.value.dateRange.join(","),
        };
        const res = await differentTunnels(params);
        buildUtilization.xData = res.map((e) => e.lane);
        buildUtilization.yData[0].data = res.map((e) => e.inNum);
        buildUtilization.yData[1].data = res.map((e) => e.outNum);
        listData.splice(0, listData.length, ...res);
      } catch {
        // keep previous data on failure
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      void changeHandleEquipmentAlarmTime();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["v2-panel-body", "tunnel-lane-body", isZoom ? "tunnel-lane-v2-panel is-zoom" : ""]} data-no-zoom>
        {loading.value ? (
          <PanelCardLoading zoom={isZoom} />
        ) : (
          <>
            <div class={["v2-chart-panel", "chart-panel", isZoom ? "is-zoom" : ""]}>
              <stackedColumn unit="辆" xData={buildUtilization.xData} yData={buildUtilization.yData} />
            </div>
            <div class={["table-footer", isZoom ? "is-zoom" : ""]}>
              <RollTable column={column} data={listData} />
            </div>
          </>
        )}
      </div>
    );

    return () => (
      <div class="v2-panel-root tunnel-lane-v2-root">
        <SubPanelTemplate
          title="隧道不同车道车流量分析"
          class="visual-v2-sub-panel v2-panel-card tunnel-lane-v2-panel"
          zoomable
          zoom-title="隧道不同车道车流量分析详情"
          zoom-width={760}
          v-slots={{
            titleIcon: () => <img src={vehicleTrendIcon} alt="" class="title-icon-img" />,
            extra: () => (
              <div class="header-toolbar" data-no-zoom>
                <DateInlineForm
                  modelValue={equipmentAlarmTime.value}
                  onUpdate:modelValue={(v) => {
                    equipmentAlarmTime.value = v;
                  }}
                  onSearch={changeHandleEquipmentAlarmTime}
                />
              </div>
            ),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default TunnelLaneTrafficFlow;
