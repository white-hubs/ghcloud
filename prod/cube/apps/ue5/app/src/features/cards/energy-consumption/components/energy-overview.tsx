import { CaretDownOutlined } from "@ant-design/icons-vue";
import moment from "moment";
import { defineComponent, onMounted, reactive, ref } from "vue";

import { getEnergyUnit } from "../utils/energy-units";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, usageStatTypeSingle, yearEnergyConversion } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";

import "./energy-overview.module.less";

const titleIcon = getThemeImage("company-intro.png");
const energyUsageIcon = getThemeImage("energy-consumption-statistics.png");
const comprehensiveEnergyIcon = getThemeImage("comprehensive-energy-consumption.png");
const carbonEmissionsIcon = getThemeImage("carbon-emissions.png");

const getPopupContainer = (): HTMLElement => document.body;

interface OverviewMetric {
  key: string;
  label: string;
  unit: string;
  value: number;
  ratio: number | null;
  iconSrc: string;
  tone: "usage" | "energy" | "carbon";
}

interface SelectOption {
  label: string;
  value: string;
}

export const EnergyOverview = defineComponent({
  name: "EnergyOverview",
  props: {
    title: { type: String, required: true, default: "全年能耗概览" },
  },
  setup(props) {
    const deviceStateList = ref<SelectOption[]>([]);
    const timeList = ref<SelectOption[]>([]);

    const overviewParams = reactive({
      type: "",
      time: "",
    });

    const visitingData = ref<OverviewMetric[]>([
      { key: "usage", label: "用能", unit: "", value: 0, ratio: 0, iconSrc: energyUsageIcon, tone: "usage" },
      { key: "energy", label: "折合能耗", unit: "tce", value: 0, ratio: 0, iconSrc: comprehensiveEnergyIcon, tone: "energy" },
      { key: "carbon", label: "碳排量", unit: "kgCO₂e", value: 0, ratio: 0, iconSrc: carbonEmissionsIcon, tone: "carbon" },
    ]);

    const parseRatio = (value: number | string | null | undefined): number | null => {
      if (value === null || value === undefined) {
        return null;
      }
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const changeEnergyCarbonTime = async (): Promise<void> => {
      let currentData = await usageStatTypeSingle({
        period: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().format("YYYY-MM-DD HH:mm:ss")].join(","),
        instrumentType: overviewParams.type,
      });
      let previousData = await yearEnergyConversion({ period: overviewParams.time, instrumentType: overviewParams.type });

      if (!currentData) {
        currentData = { ddValue: 0, dcValue: 0, zhValue: 0 };
      }
      if (!previousData) {
        previousData = { ddValue: 0, dcValue: 0, zhValue: 0 };
      }

      const ddRatio =
        previousData.ddValue !== 0
          ? parseRatio((((currentData.ddValue - previousData.ddValue) * 100) / previousData.ddValue).toFixed(0))
          : null;
      const dcRatio =
        previousData.dcValue !== 0
          ? parseRatio((((currentData.dcValue - previousData.dcValue) * 100) / previousData.dcValue).toFixed(0))
          : null;
      const zhRatio =
        previousData.zhValue !== 0
          ? parseRatio((((currentData.zhValue - previousData.zhValue) * 100) / previousData.zhValue).toFixed(0))
          : null;

      const usageUnit = getEnergyUnit(overviewParams.type);
      visitingData.value[0].unit = usageUnit || "";
      visitingData.value[0].value = currentData.ddValue;
      visitingData.value[1].value = currentData.zhValue;
      visitingData.value[2].value = currentData.dcValue;
      visitingData.value[0].ratio = ddRatio;
      visitingData.value[1].ratio = zhRatio;
      visitingData.value[2].ratio = dcRatio;
    };

    const getYearsSince = (): void => {
      const currentYear = new Date().getFullYear();
      const today = moment().format("MM-DD 00:00:00");
      const years: SelectOption[] = [];

      for (let year = 2013; year <= currentYear - 1; year += 1) {
        years.push({
          label: `${year}年`,
          value: [
            moment(`${year}-01-01 00:00:00`).startOf("year").format("YYYY-MM-DD 00:00:00"),
            moment(`${year}-${today}`).format("YYYY-MM-DD 00:00:00"),
          ].join(","),
        });
      }

      timeList.value = years;
      overviewParams.time = years[years.length - 1]?.value ?? "";
    };

    const getCollectConfigList = async (): Promise<void> => {
      const res = await collectConfigList();
      deviceStateList.value = res.map((item) => ({
        label: item.categoryName,
        value: item.categoryCode,
      }));
      overviewParams.type = deviceStateList.value[0]?.value ?? "";
    };

    onMounted(async () => {
      getYearsSince();
      await getCollectConfigList();
      await changeEnergyCarbonTime();
    });

    const renderHeaderFilters = (): JSX.Element => (
      <div class="energy-v2-filter-group" data-no-zoom>
        <a-select
          value={overviewParams.type}
          onUpdate:value={(value: string) => {
            overviewParams.type = value;
          }}
          class="panel-filter-select energy-v2-type-select"
          popupClassName="visual-data-modal-dropdown"
          dropdownClassName="visual-data-modal-dropdown"
          getPopupContainer={getPopupContainer}
          dropdownMatchSelectWidth={false}
          onChange={changeEnergyCarbonTime}
          v-slots={{
            suffixIcon: () => <CaretDownOutlined class="energy-v2-type-filter-arrow" />,
          }}
        >
          {deviceStateList.value.map((item) => (
            <a-select-option key={item.value} value={item.value}>
              {item.label}
            </a-select-option>
          ))}
        </a-select>
        <a-select
          value={overviewParams.time}
          onUpdate:value={(value: string) => {
            overviewParams.time = value;
          }}
          class="panel-filter-select energy-v2-type-select energy-v2-compare-select"
          popupClassName="visual-data-modal-dropdown"
          dropdownClassName="visual-data-modal-dropdown"
          getPopupContainer={getPopupContainer}
          dropdownMatchSelectWidth={false}
          onChange={changeEnergyCarbonTime}
          v-slots={{
            suffixIcon: () => <CaretDownOutlined class="energy-v2-type-filter-arrow" />,
          }}
        >
          {timeList.value.map((item) => (
            <a-select-option key={item.value} value={item.value}>
              {item.label}
            </a-select-option>
          ))}
        </a-select>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-overview-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["energy-overview-grid", isZoom ? "is-zoom" : ""]}>
          {visitingData.value.map((item) => {
            const ratio = item.ratio;
            const ratioTone = ratio === null ? "is-flat" : ratio > 0 ? "is-up" : "is-down";
            return (
              <div class={["energy-overview-card", `is-${item.tone}`]} key={`${isZoom ? "zoom-" : ""}${item.key}`}>
                <span class="energy-overview-icon" aria-hidden="true">
                  <img src={item.iconSrc} alt="" />
                </span>
                <div class="energy-overview-content">
                  <div class="energy-overview-meta">
                    <div class="energy-overview-label-row">
                      <span class="energy-overview-label">{item.label}</span>
                      {item.unit ? <span class="energy-overview-unit">{item.unit}</span> : null}
                    </div>
                  </div>
                  <div class="energy-overview-main">
                    <div class="energy-overview-value">
                      <CountTo startVal={0} endVal={item.value} separator="" duration={2000} />
                    </div>
                    <div class={["energy-overview-ratio", ratioTone]}>
                      <span class="energy-overview-ratio-label">同比</span>
                      {ratio !== null ? (
                        <>
                          <span class="energy-overview-ratio-arrow" aria-hidden="true" />
                          <span class="energy-overview-ratio-value">{ratio}%</span>
                        </>
                      ) : (
                        <span class="energy-overview-ratio-value">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-overview-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel energy-overview-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={640}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => renderHeaderFilters(),
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default EnergyOverview;
