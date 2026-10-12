import { computed, defineComponent } from "vue";
import { reactive, ref } from "vue";

import modalBroadcastTable from "../../component/modal-broadcast-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getRiskSource } from "@/infrastructure/api/attendance";
import PlanPie from "@/shared-ui/panel/charts/pie/planePie";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import PieList from "@/shared-ui/panel/pieList";
import { ModelValueItf } from "@/shared-ui/panel/types";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "../overview-v2-shared.module.less";

export const ManagementSituation = defineComponent({
  name: "ManagementSituation",
  setup() {
    interface Itemize {
      color: string;
      value: number;
      label: string;
      ratio: number;
      name: string;
      typeId?: string;
    }

    const workOrderTime = ref<ModelValueItf>();
    const riskPieData = ref<Itemize[]>([]);
    const ModalShow = ref(false);
    const Parameter = ref({
      typeId: "",
    });
    const riskData = reactive<{
      totalNum: number;
    }>({
      totalNum: 0,
    });
    const deviceSituationColors = ref<string[]>(["#FFAB10", "#2F8DFF", "#F14545", "#19F8F7"]);
    const hasRiskData = computed(() => riskPieData.value.length > 0);

    const handelClickDeviceItemize = (value: any) => {
      Parameter.value.typeId = value.typeId;
      ModalShow.value = true;
    };

    const getRisk = async () => {
      if (!workOrderTime.value) return;
      const res = await getRiskSource({
        period: workOrderTime.value.dateRange.join(","),
        dimension: "",
        eventResult: "",
        typeNames: [],
      });
      riskPieData.value = res.typeVOList.map((item: any, index: number) => {
        return {
          label: `${item.typeName}(${item.ratio * 100}%)`,
          value: item.totalNum,
          ratio: item.totalNum,
          color: deviceSituationColors.value[index % 4],
          name: item.typeName,
          typeId: item.typeId,
        };
      });
      Object.assign(riskData, res);
    };

    const changeHandleworkOrderTime = () => {
      getRisk();
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["overview-v2-body", isZoom ? "is-zoom access-control-v2-panel access-control-card-theme" : ""]} data-no-zoom>
        {hasRiskData.value ? (
          <div class="overview-v2-management-list" data-no-zoom>
            {riskPieData.value.slice(0, isZoom ? 8 : 4).map((item) => (
              <div class="overview-v2-management-item access-control-surface" key={item.name} data-no-zoom>
                <span class="overview-v2-management-name">{item.name}</span>
                <strong class="overview-v2-management-value">{item.value}</strong>
              </div>
            ))}
          </div>
        ) : null}
        <div class={["overview-v2-pie-row", "access-control-surface", isZoom ? "is-zoom" : ""]} data-no-zoom>
          {hasRiskData.value ? (
            <>
              <PlanPie pieData={riskPieData.value} showZeroAsEmptyRing class="overview-v2-pie" pie-class="overview-v2-pie-chart">
                <div class="overview-v2-pie-center">
                  <div class="total-num">{riskData.totalNum}</div>
                  <div>风险总数</div>
                </div>
              </PlanPie>
              <PieList
                roundPieData={riskPieData.value}
                onHandelClickItemize={handelClickDeviceItemize}
                class={["overview-v2-pie-list", isZoom ? "pie-list-zoom" : ""]}
              />
            </>
          ) : (
            <div class={["overview-v2-empty", isZoom ? "is-zoom" : ""]}>
              <NoData />
            </div>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="overview-v2-root">
          <SubPanelTemplate
            title="管理态势"
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel"
            zoomable
            zoom-title="管理态势详情"
            zoom-width={820}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-management" />,
              extra: () => (
                <div class="access-control-header-toolbar" data-no-zoom>
                  <DateInlineForm
                    modelValue={workOrderTime.value}
                    onUpdate:modelValue={(v) => {
                      workOrderTime.value = v;
                    }}
                    onSearch={changeHandleworkOrderTime}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <modal-broadcast-table
          show-modal={ModalShow.value}
          parameter={Parameter.value}
          onClose={() => {
            ModalShow.value = false;
          }}
        ></modal-broadcast-table>
      </>
    );
  },
});

export default ManagementSituation;
