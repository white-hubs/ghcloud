import { CaretDownOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, onMounted, ref } from "vue";

import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, projectStatCategory } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "./sub-proportion.module.less";

const titleIcon = getThemeImage("comprehensive-energy-consumption.png");
const PIE_COLORS = ["#328BF7", "#19F8F7", "#FFC700", "#EF424A", "#26C2BC", "#A78BFA", "#8c8f96"];

type PieItem = { name: string; value: number; color: string };
type SelectOption = { label: string; value: string };

const getPopupContainer = (): HTMLElement => document.body;

export const SubProportion = defineComponent({
  name: "SubProportion",
  props: {
    title: { type: String, required: true, default: "分项用能占比" },
  },
  setup(props) {
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const instrumentType = ref("electricity_meter");
    const deviceStateList = ref<SelectOption[]>([]);
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const pieData = ref<PieItem[]>([]);
    const hasData = computed(() => pieData.value.some((item) => item.value > 0));
    const totalValue = computed(() => pieData.value.reduce((sum, item) => sum + Number(item.value || 0), 0));

    const fetchData = async (): Promise<void> => {
      const params = {
        type: timeFrame.value.timeType,
        period: timeFrame.value.dateRange?.join(",") ?? "",
        projectCategory: "ITEM",
        instrumentType: instrumentType.value,
      };
      try {
        const res = await projectStatCategory(params);
        const list = Array.isArray(res) ? res : [];
        pieData.value = list.map((item, index) => ({
          name: item.name,
          value: Number(item.zhValue) || 0,
          color: PIE_COLORS[index % PIE_COLORS.length],
        }));
      } catch {
        pieData.value = [];
      }
    };

    const loadConfigList = async (): Promise<void> => {
      try {
        const res = await collectConfigList();
        deviceStateList.value = res.map((item) => ({
          label: item.categoryName,
          value: item.categoryCode,
        }));
        if (deviceStateList.value.length) {
          instrumentType.value = deviceStateList.value[0].value;
        }
        await fetchData();
      } catch {
        deviceStateList.value = [];
        pieData.value = [];
      }
    };

    onMounted(() => {
      void loadConfigList();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {hasData.value ? (
          <div class={["energy-v2-proportion", isZoom ? "is-zoom" : ""]}>
            <div class={["energy-v2-pie-wrap", isZoom ? "is-zoom" : ""]}>
              <ElevatorAnalysisPie
                class="elevator-analysis-left"
                radius={isMinimalWhite.value ? "78" : "75"}
                ringVariant={pieRingVariant.value}
                pieData={pieData.value}
              >
                <div class="energy-v2-pie-center-value">{totalValue.value}</div>
                <div class="energy-v2-pie-center-label">分项</div>
              </ElevatorAnalysisPie>
            </div>
            <div class={["energy-v2-legend-list", isZoom ? "is-zoom" : ""]}>
              {pieData.value.map((item) => (
                <div class="energy-v2-legend-item" key={`${isZoom ? "zoom-" : ""}${item.name}`}>
                  <div class="energy-v2-legend-left">
                    <span class="energy-v2-legend-color" style={{ background: item.color }} />
                    <span class="energy-v2-legend-name" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span class="energy-v2-legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <NoData />
        )}
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root sub-proportion-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel sub-proportion-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
                <a-select
                  value={instrumentType.value}
                  onUpdate:value={(v: string) => {
                    instrumentType.value = v;
                  }}
                  class="energy-v2-type-select panel-filter-select"
                  popupClassName="visual-data-modal-dropdown"
                  dropdownClassName="visual-data-modal-dropdown"
                  getPopupContainer={getPopupContainer}
                  dropdownMatchSelectWidth={false}
                  onChange={fetchData}
                  v-slots={{
                    suffixIcon: () => <CaretDownOutlined />,
                  }}
                >
                  {deviceStateList.value.map((item) => (
                    <a-select-option key={item.value} value={item.value}>
                      {item.label}
                    </a-select-option>
                  ))}
                </a-select>
                <DateInlineForm
                  modelValue={timeFrame.value}
                  onUpdate:modelValue={(v) => {
                    timeFrame.value = {
                      timeType: v?.timeType || "THIS_MONTH",
                      dateRange: [...(v?.dateRange ?? [])],
                    };
                  }}
                  onSearch={fetchData}
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

export default SubProportion;
