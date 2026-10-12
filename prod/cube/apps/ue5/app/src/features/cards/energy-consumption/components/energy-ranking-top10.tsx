import { CaretDownOutlined } from "@ant-design/icons-vue";
import { defineComponent, onMounted, ref } from "vue";

import { EnergyRankList } from "../_shared/energy-rank-list";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { collectConfigList, projectStatCategory } from "@/infrastructure/api/energy";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import DateInlineForm, { ModelValueItf } from "@/shared-ui/panel/dateInlineForm";

import "./energy-ranking-top10.module.less";

const titleIcon = getThemeImage("regional-pedestrian-flow-ranking.png");

type SelectOption = { label: string; value: string };
type RankItem = { name: string; value: number };

const getPopupContainer = (): HTMLElement => document.body;

export const EnergyRankingTop10 = defineComponent({
  name: "EnergyRankingTop10",
  props: {
    title: { type: String, required: true, default: "区域用能排名Top10" },
  },
  setup(props) {
    const instrumentType = ref("electricity_meter");
    const deviceStateList = ref<SelectOption[]>([]);
    const timeFrame = ref<ModelValueItf>({ timeType: "THIS_MONTH", dateRange: [] });
    const rankList = ref<RankItem[]>([]);

    const fetchData = async (): Promise<void> => {
      const params = {
        period: timeFrame.value.dateRange?.join(",") ?? "",
        instrumentType: instrumentType.value,
        projectCategory: "AREA",
      };
      try {
        const res = await projectStatCategory(params);
        const list = Array.isArray(res) ? [...res] : [];
        list.sort((a, b) => Number(b.value) - Number(a.value));
        rankList.value = list.slice(0, 10).map((item) => ({
          name: item.name,
          value: Number(item.value) || 0,
        }));
      } catch {
        rankList.value = [];
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
        rankList.value = [];
      }
    };

    onMounted(() => {
      void loadConfigList();
    });

    const renderTypeSelect = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-type-select-bar", isZoom ? "is-zoom" : ""]} data-no-zoom>
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
            <a-select-option key={`${isZoom ? "zoom-" : ""}${item.value}`} value={item.value}>
              {item.label}
            </a-select-option>
          ))}
        </a-select>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["energy-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        {renderTypeSelect(isZoom)}
        <EnergyRankList list={rankList.value} isZoom={isZoom} />
      </div>
    );

    return (): JSX.Element => (
      <div class="v2-panel-root energy-ranking-top10-v2-root">
        <SubPanelTemplate
          title={props.title}
          class="visual-v2-sub-panel v2-panel-card energy-v2-panel energy-ranking-top10-v2-panel"
          zoomable
          zoom-title={`${props.title}详情`}
          zoom-width={720}
          v-slots={{
            titleIcon: () => <img src={titleIcon} alt="" class="energy-v2-title-icon" />,
            extra: () => (
              <div class="energy-v2-filter-group" data-no-zoom>
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

export default EnergyRankingTop10;
