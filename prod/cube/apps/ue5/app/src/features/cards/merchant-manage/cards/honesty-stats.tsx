import { computed, defineComponent, onMounted, ref } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { visualizationPrice } from "@/infrastructure/api/merchant";

import "./merchant-v2-shared.module.less";

const PANEL_CLASS = "visual-v2-sub-panel v2-panel-card merchant-v2-panel";

export const HonestyStats = defineComponent({
  name: "HonestyStats",
  setup() {
    const statisticsType = ref("honestyScore");
    const typeList = [
      { label: "诚信经营", value: "honestyScore" },
      { label: "商品质量", value: "zScoreAvg" },
      { label: "诚实守信", value: "sScoreAvg" },
      { label: "服务态度", value: "tScoreAvg" },
      { label: "环境卫生", value: "wScoreAvg" },
    ];
    const listData = ref<any[]>([]);
    const currentType = computed(() => typeList.find((item) => item.value === statisticsType.value) || typeList[0]);
    const columns = computed(() => [
      { title: "商户", dataIndex: "companyName" },
      { title: "管理档位", dataIndex: "deviceName" },
      { title: "商户姓名", dataIndex: "owner" },
      { title: currentType.value.label, dataIndex: statisticsType.value },
    ]);

    const formatScore = (value: unknown): string => `${Number(value || 0)}星`;

    const changeStatisticsTime = async () => {
      const res = await visualizationPrice();
      const list = Array.isArray(res) ? res : [];
      listData.value = list.map((item) => ({
        ...item,
        sScoreAvg: formatScore(item?.sScoreAvg),
        tScoreAvg: formatScore(item?.tScoreAvg),
        wScoreAvg: formatScore(item?.wScoreAvg),
        zScoreAvg: formatScore(item?.zScoreAvg),
        honestyScore: formatScore(item?.honestyScore),
      }));
    };

    onMounted(() => {
      changeStatisticsTime();
    });

    const renderExtra = (): JSX.Element => (
      <a-select
        class="merchant-v2-select"
        value={statisticsType.value}
        onUpdate:value={(v) => {
          statisticsType.value = v;
        }}
      >
        {typeList.map((item) => (
          <a-select-option value={item.value} key={item.value}>
            {item.label}
          </a-select-option>
        ))}
      </a-select>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["merchant-v2-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class={["merchant-v2-table", "visual-v2-roll-table", isZoom ? "is-zoom" : ""]}>
          <RollTable column={columns.value} data={listData.value} showLength={isZoom ? 9 : 5} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <div class="merchant-v2-root">
        <SubPanelTemplate
          title="诚信经营值统计"
          class={PANEL_CLASS}
          zoomable
          zoom-title="诚信经营值统计详情"
          zoom-width={900}
          v-slots={{
            titleIcon: () => <CardTitleIcon name="merchant-honesty" />,
            extra: renderExtra,
            default: () => renderBody(false),
            "zoom-content": () => renderBody(true),
          }}
        />
      </div>
    );
  },
});

export default HonestyStats;
