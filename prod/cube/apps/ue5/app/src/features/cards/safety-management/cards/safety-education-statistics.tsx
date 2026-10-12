import moment from "moment";
import { computed, defineComponent, onMounted, reactive, ref, provide } from "vue";

import SafetyEducationTable from "../components/safety-education-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { getSafetyEdu, getSafetyEduTheme } from "@/infrastructure/api/safety-education";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./safety-education-statistics.module.less";

const eduTotalIcon = getThemeImage("alarm-count.png");
const colorList = ["#328BF7", "#FFAB10", "#19F8F7", "#EF424A", "#655dd1", "#00f27b"];

type ThemeItem = {
  id: string;
  name: string;
  value: number;
  color: string;
};

export const SafetyEducationStatistics = defineComponent({
  name: "SafetyEducationStatistics",
  setup() {
    const eduTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [moment().startOf("year").format("YYYY-MM-DD 00:00:00"), moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")],
    });
    const secureParameter = reactive({
      period: "",
      themeId: "",
    });
    const secureModalShow = ref(false);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const total = ref(0);
    const chainRatio = ref(0);
    const themeList = ref<ThemeItem[]>([]);

    const hasThemeData = computed(() => themeList.value.length > 0);
    const pieTotal = computed(() => themeList.value.reduce((sum, item) => sum + item.value, 0));
    const chainMeta = computed(() => {
      const value = Number(chainRatio.value);
      if (!Number.isFinite(value)) return { text: "--", up: false, flat: true };
      return { text: `${value}%`, up: value > 0, flat: value === 0 };
    });

    const resolvePeriod = (): string => {
      const range = eduTime.value.dateRange;
      if (range?.[0] && range?.[1]) return `${range[0]},${range[1]}`;
      return `${moment().startOf("year").format("YYYY-MM-DD 00:00:00")},${moment().endOf("year").format("YYYY-MM-DD HH:mm:ss")}`;
    };

    const getEduCount = async (): Promise<void> => {
      const params = {
        period: resolvePeriod(),
        type: eduTime.value.timeType,
      };
      const data = await getSafetyEdu(params);
      chainRatio.value = Number(data?.chainRatio) || 0;
      total.value = Number(data?.totalNum) || 0;
    };

    const getEduStat = async (): Promise<void> => {
      const params = {
        period: resolvePeriod(),
        type: eduTime.value.timeType,
      };
      const data = await getSafetyEduTheme(params);
      const rows = Array.isArray(data) ? data : [];
      themeList.value = rows.map((item: { id?: string; name?: string; totalNum?: number }, index: number) => ({
        id: String(item.id ?? ""),
        name: item.name || "--",
        value: Number(item.totalNum) || 0,
        color: colorList[index % colorList.length],
      }));
    };

    const refresh = async (): Promise<void> => {
      try {
        await Promise.all([getEduCount(), getEduStat()]);
      } catch {
        total.value = 0;
        chainRatio.value = 0;
        themeList.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const openSummary = (): void => {
      secureParameter.themeId = "";
      secureParameter.period = resolvePeriod();
      secureModalShow.value = true;
    };

    const openSecure = (item: ThemeItem | { name?: string; data?: { originData?: ThemeItem } }): void => {
      const resolved = (item as { data?: { originData?: ThemeItem } })?.data?.originData ?? (item as ThemeItem);
      if (!resolved?.name) return;
      const hit = themeList.value.find((row) => row.name === resolved.name || row.id === resolved.id);
      // 「其他」是前端聚合项，没有真实 themeId，下钻按总数口径查全部
      const themeId = hit?.name === "其他" ? "" : hit?.id || resolved.id || "";
      secureParameter.themeId = themeId === "undefined" ? "" : themeId;
      secureParameter.period = resolvePeriod();
      secureModalShow.value = true;
    };

    onMounted(() => {
      void refresh();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={[styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
        <button type="button" class={[styles.statCard, styles.isTotal]} onClick={openSummary}>
          <span class={styles.statIcon} aria-hidden="true">
            <img src={eduTotalIcon} alt="" />
          </span>
          <span class={styles.statContent}>
            <span class={styles.statLabel}>教育任务总数</span>
            <span class={styles.statValueRow}>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={total.value} separator="" duration={1400} />
              </span>
              <span class={styles.chainMeta}>
                <span class={styles.chainLabel}>环比</span>
                {!chainMeta.value.flat ? <span class={[styles.chainArrow, chainMeta.value.up ? styles.chainArrowUp : ""]} /> : null}
                <span class={[styles.chainRatio, chainMeta.value.flat ? "" : chainMeta.value.up ? styles.chainUp : styles.chainDown]}>
                  {chainMeta.value.text}
                </span>
              </span>
            </span>
          </span>
        </button>

        <div class={[styles.analysisSurface, loaded.value && !hasThemeData.value ? styles.isEmpty : ""]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !hasThemeData.value ? (
            <NoData />
          ) : (
            <>
              <div class={styles.chartWrap}>
                <ElevatorAnalysisPie pieData={themeList.value} onClickbar={openSecure}>
                  <div class={styles.pieCenterValue}>
                    <CountTo startVal={0} endVal={pieTotal.value || total.value} separator="" duration={1400} />
                  </div>
                  <div class={styles.pieCenterLabel}>教育任务数</div>
                </ElevatorAnalysisPie>
              </div>
              <div class={[styles.genreList, themeList.value.length > 0 && themeList.value.length <= 4 ? styles.genreListCentered : ""]}>
                {themeList.value.map((item) => (
                  <button
                    type="button"
                    class={styles.genreItem}
                    key={`${isZoom ? "zoom-" : ""}${item.id || item.name}`}
                    onClick={() => openSecure(item)}
                  >
                    <span class={styles.genreName}>
                      <i class={styles.genreColor} style={{ background: item.color }} />
                      <span class={styles.genreNameText} title={item.name}>
                        {item.name}
                      </span>
                    </span>
                    <span class={styles.genreCount}>{item.value}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="安全教育统计"
            class="visual-v2-sub-panel v2-panel-card safety-education-statistics-v2-panel"
            zoomable
            zoom-title="安全教育统计详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-personnel" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={eduTime.value}
                    onUpdate:modelValue={(v) => {
                      eduTime.value = v;
                    }}
                    onSearch={refresh}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <SafetyEducationTable
          showModal={secureModalShow.value}
          onClose={() => {
            secureModalShow.value = false;
          }}
          parameter={secureParameter}
        />
      </>
    );
  },
});

export default SafetyEducationStatistics;
