import { defineComponent, onMounted, reactive, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import ModalUserTable from "@/features/cards/security-overview/components/modal-user-table";
import ModalWorkTable from "@/features/cards/security-overview/components/modal-work-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { arrangeTodayStat } from "@/infrastructure/api/attendance";
import { workOrderCompletionStatistics } from "@/infrastructure/api/flow";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "@/features/cards/access-control/_shared/access-control-v2-shared.module.less";
import "@/features/cards/overview/cards/overview-v2-shared.module.less";
import "./security-manage-trend.module.less";

interface ManageLegendItem {
  name: string;
  color: string;
  value: number;
  type: "flow-order" | "staff";
  key: string;
}

export const SecurityManageTrend = defineComponent({
  name: "SecurityManageTrend",
  props: {
    title: { type: String, required: false, default: "管理态势分析" },
  },
  setup(props) {
    const workModalShow = ref(false);
    const userModalShow = ref(false);
    const roundData = reactive([
      {
        statistic: { title: "完成率", value: "0", unit: "%" },
        legendList: [
          { name: "未完成工单", color: "#FFAB10", value: 0, type: "flow-order" as const, key: "ACTIVE" },
          { name: "已完成工单", color: "#2AE8BD", value: 0, type: "flow-order" as const, key: "FINISHED" },
        ] as ManageLegendItem[],
      },
      {
        statistic: { title: "在岗率", value: "0", unit: "%" },
        legendList: [
          { name: "在岗员工", color: "#2989FF", value: 0, type: "staff" as const, key: "WORKING" },
          { name: "离岗员工", color: "#FFAB10", value: 0, type: "staff" as const, key: "LEAVE_POST" },
        ] as ManageLegendItem[],
      },
    ]);

    const getWorkNumber = async (): Promise<void> => {
      const res = await workOrderCompletionStatistics({
        appCodes: ["ATTENDANCE_MANAGEMENT", "PERSONNELMANAGEMENT", "OFFICIAL_MANAGEMENT", "HIDDENDANGER", "FAULT"].join(","),
      });
      const orderFinished = res.find((e) => e.result === "FINISHED")?.number ?? 0;
      const orderUnFinished = res.find((e) => e.result === "UNFINISHED")?.number ?? 0;
      roundData[0].statistic.value =
        orderFinished + orderUnFinished ? ((orderFinished / (orderFinished + orderUnFinished)) * 100).toFixed(0) : "0";
      roundData[0].legendList[0].value = orderUnFinished;
      roundData[0].legendList[1].value = orderFinished;

      const req = await arrangeTodayStat();
      roundData[1].statistic.value = req.totalCount ? ((req.workCount / req.totalCount) * 100).toFixed(0) : "0";
      roundData[1].legendList[0].value = req.workCount;
      roundData[1].legendList[1].value = req.totalCount - req.workCount;
    };

    const workParameter = ref<Record<string, any>>({ status: "" });
    const userParameter = ref<Record<string, any>>({ status: "" });
    const handelClickWork = (item?: ManageLegendItem): void => {
      if (!item) return;
      workModalShow.value = false;
      userModalShow.value = false;
      userParameter.value = {};
      workParameter.value = {};
      if (item.type === "staff") {
        userParameter.value = { workBool: item.key === "WORKING" };
        userModalShow.value = true;
      }
      if (item.type === "flow-order") {
        workParameter.value = { status: item.key };
        workModalShow.value = true;
      }
    };

    onMounted(() => {
      void getWorkNumber();
    });

    const renderManageCard = (item: (typeof roundData)[number]): JSX.Element => {
      const valueText = String(item.statistic.value ?? "0").replace("%", "");
      const pieData = item.legendList.map((legend) => ({
        name: legend.name,
        value: legend.value,
        color: legend.color,
      }));
      return (
        <div class="safe-manage-trend-card" key={item.statistic.title}>
          <div class="safe-manage-pie-wrap">
            <ElevatorAnalysisPie class="safe-manage-pie" pie-class="safe-manage-pie-chart" pieData={pieData}>
              <div class="safe-manage-pie-center">
                <div class="safe-manage-pie-value">
                  {valueText}
                  <span>%</span>
                </div>
                <div class="safe-manage-pie-label">{item.statistic.title}</div>
              </div>
            </ElevatorAnalysisPie>
          </div>
          <div class="manage-status-list">
            {item.legendList.map((legend) => {
              const unit = legend.type === "staff" ? "人" : "个";
              return (
                <button
                  type="button"
                  class={["manage-status-item", legend.key === "FINISHED" || legend.color === "#2AE8BD" ? "is-success" : ""]}
                  key={legend.key}
                  onClick={() => handelClickWork(legend)}
                >
                  <span class="manage-status-head">
                    <span class="manage-status-name">
                      <i class="manage-status-dot" style={{ backgroundColor: legend.color }} />
                      <span class="manage-status-name-text" title={legend.name}>
                        {legend.name}
                      </span>
                    </span>
                    <span class="manage-status-value" style={{ color: legend.color }}>
                      <CountTo startVal={0} endVal={legend.value} separator="" duration={1200} />
                      <em class="manage-status-unit">{unit}</em>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["safe-manage-trend-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {roundData.map((item) => renderManageCard(item))}
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root overview-v2-root">
          <SubPanelTemplate
            title={props.title}
            class="visual-v2-sub-panel v2-panel-card access-control-v2-panel access-control-card-theme overview-v2-panel safe-overview-panel safe-manage-trend-panel"
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-management" />,
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalWorkTable showModal={workModalShow.value} onClose={() => (workModalShow.value = false)} parameter={workParameter.value} />
        <ModalUserTable showModal={userModalShow.value} onClose={() => (userModalShow.value = false)} parameter={userParameter.value} />
      </>
    );
  },
});

export default SecurityManageTrend;
