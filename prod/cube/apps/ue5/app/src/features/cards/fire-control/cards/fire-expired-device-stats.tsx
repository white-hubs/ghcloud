import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch, provide } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import FireExpiredDeviceTable from "../components/fire-expired-device-table";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { expiredChain, expiredPage } from "@/infrastructure/api/device";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./fire-expired-device-stats.module.less";

const deviceTotalIcon = getThemeImage("device-total.png");

const expireStatusMap: Record<string, string> = {
  SPLIT: "待拆解",
  ACCEPT: "待接收",
  EXECUTING: "进行中",
  OVER: "已完成",
  EXPIRE: "已过期",
};

type ExpiredDeviceRow = {
  code?: string;
  name?: string;
  genreName?: string;
  usefulLifeYear?: string | number;
  expireStatus?: string;
};

const formatChainRatio = (value: unknown): { text: string; up: boolean; flat: boolean } => {
  if (value === null || value === undefined || value === "" || value === "--") {
    return { text: "--", up: false, flat: true };
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return { text: "--", up: false, flat: true };
  }
  return { text: `${num}%`, up: num > 0, flat: num === 0 };
};

export const FireExpiredDeviceStats = defineComponent({
  name: "FireExpiredDeviceStats",
  setup() {
    const ueClient = UeClient.getInstance();
    const { globalState } = useStateStore();

    let timer: ReturnType<typeof setInterval> | null = null;
    const timeFrame = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const listData = ref<ExpiredDeviceRow[]>([]);
    const totalNumber = ref(0);
    const chainRatio = ref<unknown>(null);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const showModal = ref(false);
    const modalParameter = reactive({
      period: "",
      type: "THIS_YEAR",
    });

    const chainMeta = computed(() => formatChainRatio(chainRatio.value));

    const column = [
      { title: "设备名称", dataIndex: "name", width: 120 },
      { title: "设备类型", dataIndex: "genreName" },
      { title: "使用年限", dataIndex: "usefulLifeYear", width: 72 },
      {
        title: "操作",
        dataIndex: "deviceStatus",
        slots: { customRender: "deviceStatus" },
        width: 64,
      },
    ];

    const clickRow = (record: ExpiredDeviceRow): void => {
      if (!record?.code) return;
      ueClient.send("focusActor", { id: record.code });
    };

    const openExpiredModal = (): void => {
      modalParameter.period = timeFrame.value.dateRange?.join(",") ?? "";
      modalParameter.type = timeFrame.value.timeType || "THIS_YEAR";
      showModal.value = true;
    };

    const changeTopTimeFrame = async (): Promise<void> => {
      const param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: timeFrame.value.dateRange?.join(",") ?? "",
        type: timeFrame.value.timeType,
      };
      try {
        const pageRes = await expiredPage(param);
        const records = Array.isArray(pageRes?.records) ? pageRes.records : [];
        listData.value = records.map((item: ExpiredDeviceRow & { expireStatus?: string }) => ({
          ...item,
          expireStatus: expireStatusMap[item.expireStatus || ""] || item.expireStatus || "--",
        }));
        const chainRes = await expiredChain(param);
        totalNumber.value = Number(chainRes?.totalNumber) || 0;
        chainRatio.value = chainRes?.chainRatio;
      } catch {
        listData.value = [];
        totalNumber.value = 0;
        chainRatio.value = null;
      } finally {
        loaded.value = true;
      }
    };

    const startLoop = (): void => {
      if (timer) clearInterval(timer);
      timer = setInterval(
        () => {
          void changeTopTimeFrame();
        },
        (window as any).config.pageLoopRequestTime,
      );
    };

    watch(
      () => globalState.business.currentAreaId,
      () => {
        startLoop();
        void changeTopTimeFrame();
      },
    );

    onMounted(() => {
      void changeTopTimeFrame();
      startLoop();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    const tableSlots = {
      deviceStatus: ({ record }: { record: ExpiredDeviceRow }) => (
        <button
          type="button"
          class={styles.locateBtn}
          onClick={(event) => {
            event.stopPropagation();
            clickRow(record);
          }}
        >
          定位
        </button>
      ),
    };

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={[
          styles.cardBody,
          isZoom ? styles.isZoom : "",
          isZoom ? "fire-expired-device-stats-v2-panel fire-expired-device-stats-zoom" : "",
        ]}
        data-no-zoom
      >
        <div class={styles.statsRow}>
          <button type="button" class={[styles.statCard, styles.isTotal, styles.isClickable]} onClick={openExpiredModal}>
            <span class={styles.statIcon} aria-hidden="true">
              <img src={deviceTotalIcon} alt="" />
            </span>
            <span class={styles.statContent}>
              <span class={styles.statLabel}>到期设备数</span>
              <span class={styles.statValueRow}>
                <span class={styles.statValue}>
                  <CountTo startVal={0} endVal={totalNumber.value} separator="" duration={1600} />
                </span>
                <span class={styles.statUnit}>台</span>
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
        </div>
        <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : listData.value.length === 0 ? (
            <div class={styles.emptySurface}>
              <NoData />
            </div>
          ) : (
            <RollTable
              column={column}
              data={listData.value}
              showLength={isZoom ? 10 : 4}
              onClickRow={openExpiredModal}
              v-slots={tableSlots}
            />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="消防到期设备统计"
            class="visual-v2-sub-panel v2-panel-card fire-expired-device-stats-v2-panel"
            zoomable
            zoom-title="消防到期设备统计详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-device" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={timeFrame.value}
                    onUpdate:modelValue={(v) => {
                      timeFrame.value = v;
                    }}
                    onSearch={changeTopTimeFrame}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <FireExpiredDeviceTable
          showModal={showModal.value}
          parameter={modalParameter}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default FireExpiredDeviceStats;
