import { computed, defineComponent, type PropType } from "vue";

import { RiskDetail } from "./risk-types";
import Modal from "@/features/equipment/modal-table/modal";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./modal-risk-table.module.less";

const UE5_RISK_ASSETS = "/resource/v1/ue5-migrate/components/businessPanel/security-overview/assets";

const LEVEL_LABEL: Record<string, string> = {
  ONE_LEVEL: "一级报警",
  TWO_LEVEL: "二级报警",
  THREE_LEVEL_AND_FOUR_LEVEL: "三级报警/四级报警",
};

const LEVEL_IMG: Record<string, [string, string]> = {
  ONE_LEVEL: ["a0.png", "redj.png"],
  TWO_LEVEL: ["a0.png", "yellowj.png"],
  THREE_LEVEL_AND_FOUR_LEVEL: ["a0.png", "yellowj.png"],
  FOUR_LEVEL: ["a0.png", "bluej.png"],
};

const EQUIPMENT_UNFILED: Record<string, string> = {
  FLAMMABLE_EQUIPMENT: "当前市场易燃设备未建档",
  FIRE_FIGHTING_EQUIPMENT: "当前市场消防设备未建档",
  TRANSPORT_DEVICES: "当前市场电动车设备未建档",
  ELECTRIC_VEHICLE: "当前市场电动车设备未建档",
};

const EQUIPMENT_FILED: Record<string, string> = {
  FLAMMABLE_EQUIPMENT: "当前市场易燃设备已建档",
  FIRE_FIGHTING_EQUIPMENT: "当前市场消防设备已建档",
  TRANSPORT_DEVICES: "当前市场电动车设备已建档",
  ELECTRIC_VEHICLE: "当前市场电动车设备已建档",
};

const getRiskImage = (url: string): string => `${UE5_RISK_ASSETS}/${url}`;

export const ModalRiskTable = defineComponent({
  name: "ModalRiskTable",
  props: {
    parameter: { type: Object as PropType<Record<string, unknown>>, required: false, default: () => ({}) },
    showModal: { type: Boolean, required: true, default: false },
    riskDetail: { type: Object as PropType<RiskDetail>, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const wrapClassName = computed(
      () =>
        `modal-table-alarm modal-table-device equipment-data-list-modal risk-index-list-modal device-records-theme-${currentTheme.value}`,
    );

    const closeModal = (): void => {
      emit("close");
    };

    const renderSectionScore = (score: number): JSX.Element => (
      <div class="risk-section-score">
        <div class="risk-section-score-main">
          <img src={getRiskImage("left.png")} alt="" />
          <span class="risk-section-score-label">该项目本周总计得分</span>
          <CountTo class="risk-section-score-value" startVal={0} endVal={score} duration={1600} separator="" />
          <span class="risk-unit">分</span>
        </div>
        <img class="risk-section-score-deco" src={getRiskImage("right.png")} alt="" />
      </div>
    );

    const renderLevelCard = (item: { alarmLevel?: string; totalNum?: number; riskIndex?: number }, countLabel: string): JSX.Element => {
      const levelKey = item.alarmLevel || "ONE_LEVEL";
      const imgs = LEVEL_IMG[levelKey] || LEVEL_IMG.ONE_LEVEL;
      return (
        <div class="risk-level-card" key={`${countLabel}-${levelKey}`}>
          <div class="risk-level-card-title">
            <img src={getRiskImage(imgs[0])} alt="" />
            <span class="risk-level-card-name">{LEVEL_LABEL[levelKey] || levelKey}</span>
            <img src={getRiskImage(imgs[1])} alt="" />
          </div>
          <div class="risk-level-card-metrics">
            <div class="risk-metric">
              <span class="risk-metric-label">{countLabel}</span>
              <span class="risk-metric-value">
                <CountTo startVal={0} endVal={Number(item.totalNum) || 0} duration={1600} separator="" />
                <em class="risk-unit">个</em>
              </span>
            </div>
            <i class="risk-metric-divider" />
            <div class="risk-metric">
              <span class="risk-metric-label">该项总计得分</span>
              <span class="risk-metric-value">
                <CountTo startVal={0} endVal={Number(item.riskIndex) || 0} duration={1600} separator="" />
                <em class="risk-unit">分</em>
              </span>
            </div>
          </div>
        </div>
      );
    };

    const renderHazardCard = (title: string, countLabel: string, totalNum?: number, riskIndex?: number): JSX.Element => (
      <div class="risk-hazard-block" key={title}>
        <div class="risk-section-name">{title}</div>
        <div class="risk-hazard-card">
          <div class="risk-level-card-metrics">
            <div class="risk-metric is-with-icon">
              <img src={getRiskImage("warn.png")} alt="" />
              <span class="risk-metric-label">{countLabel}</span>
              <span class="risk-metric-value">
                <CountTo startVal={0} endVal={Number(totalNum) || 0} duration={1600} separator="" />
                <em class="risk-unit">个</em>
              </span>
            </div>
            <i class="risk-metric-divider" />
            <div class="risk-metric is-with-icon">
              <span class="risk-metric-label">该项总计得分</span>
              <img src={getRiskImage("bluej.png")} alt="" />
              <span class="risk-metric-value">
                <CountTo startVal={0} endVal={Number(riskIndex) || 0} duration={1600} separator="" />
                <em class="risk-unit">分</em>
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    const propertyDetails = computed(() => props.riskDetail?.propertyFilingRiskIndex?.propertyCategoryDetails ?? []);

    return (): JSX.Element => (
      <Modal title="安全风险指数列表" show={props.showModal} onClose={closeModal} width="1100px" wrapClassName={wrapClassName.value}>
        <div class="risk-index-main">
          <div class="risk-section-header">
            <div class="risk-section-name">报警情况</div>
            <div class="risk-section-hint">时间统计维度：以周为单位计分呈现上周的风险指数</div>
          </div>
          {renderSectionScore(props.riskDetail?.alarmSituationRiskIndex?.riskIndex ?? 0)}
          <div class="risk-level-grid">
            {(props.riskDetail?.alarmSituationRiskIndex?.alarmLevelIndexDetails ?? []).map((item) => renderLevelCard(item, "报警数"))}
          </div>

          <div class="risk-section-name is-spaced">报警未响应情况</div>
          {renderSectionScore(props.riskDetail?.alarmUnConfirmedRiskIndex?.riskIndex ?? 0)}
          <div class="risk-level-grid">
            {(props.riskDetail?.alarmUnConfirmedRiskIndex?.alarmLevelIndexDetails ?? []).map((item) =>
              renderLevelCard(item, "未响应报警数"),
            )}
          </div>

          <div class="risk-hazard-grid">
            {renderHazardCard(
              "隐患情况",
              "隐患数",
              props.riskDetail?.hiddenDangerRiskIndex?.totalNum,
              props.riskDetail?.hiddenDangerRiskIndex?.riskIndex,
            )}
            {renderHazardCard(
              "隐患未响应情况",
              "未响应隐患数",
              props.riskDetail?.hiddenDangerUnConfirmedRiskIndex?.totalNum,
              props.riskDetail?.hiddenDangerUnConfirmedRiskIndex?.riskIndex,
            )}
          </div>

          <div class="risk-section-name is-spaced">风险源建档情况</div>
          {propertyDetails.value.length > 0 ? (
            <div class="risk-level-grid">
              {propertyDetails.value.map((item) => {
                const scored = Number(item.riskIndex) !== 0;
                const category = String(item.propertyCategory || "");
                return (
                  <div class="risk-filing-card" key={category}>
                    <img class="risk-filing-icon" src={getAssetsImage("sn/put-on-record.png")} alt="" />
                    <div class="risk-filing-body">
                      <div class="risk-filing-title">
                        <span>{scored ? EQUIPMENT_UNFILED[category] || category : EQUIPMENT_FILED[category] || category}</span>
                        <img src={getRiskImage("bluej.png")} alt="" />
                      </div>
                      {scored ? (
                        <div class="risk-metric">
                          <span class="risk-metric-label">该项总计得分</span>
                          <span class="risk-metric-value">
                            <CountTo startVal={0} endVal={Number(item.riskIndex) || 0} duration={1600} separator="" />
                            <em class="risk-unit">分</em>
                          </span>
                        </div>
                      ) : (
                        <div class="risk-filing-note">该项不记分</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div class="risk-empty">
              <NoData />
            </div>
          )}
        </div>
      </Modal>
    );
  },
});

export default ModalRiskTable;
