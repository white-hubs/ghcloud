import moment from "moment";
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, Transition } from "vue";

import ModalAlarmTableNew from "@/features/equipment/modal-table/modal-alarm-tableNew";
import ModalEquipmentAllTable from "@/features/equipment/modal-table/modal-equipmentAll-table";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmrecords, recordStatus } from "@/infrastructure/api/alarm";
import { byTagProperties, getDeviceBuyArea, getDeviceNumber } from "@/infrastructure/api/device";
import { cubeDeviceCenterService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { setDeviceData } from "@/infrastructure/utils/common";
import { getThemeImage } from "@/infrastructure/utils/getImage";
import { buildVisualMenuTagCode, buildVisualMenuTagCodes } from "@/infrastructure/utils/visual-menu-tag";
import ElevatorAnalysisPie from "@/shared-ui/panel/charts/pie/elevator-analysis-pie";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import noData from "@/shared-ui/panel/noData";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";
import { setSpecialCamera } from "@/visualization-core/scene/scene-actions";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "./fire-rightV2.module.less";

const processedIcon = getThemeImage("alarm-count-handled.png");
const alarmHandlingIcon = getThemeImage("alarm-count-unhandled.png");
const alarmTotalIcon = getThemeImage("alarm-count.png");
const alarmRecordIcon = getThemeImage("alarm-record.png");
const offlineDeviceIcon = getThemeImage("device-total-offline.png");
const onlineDeviceIcon = getThemeImage("device-total-online.png");
const deviceTotalIcon = getThemeImage("device-total.png");
const fireDeviceIcon = getThemeImage("fire-device.png");
const fireMonitoringIcon = getThemeImage("fire-monitoring.png");
const firePipeItemIcon = getThemeImage("fire-pipe-item.png");
const firePipeIcon = getThemeImage("fire-pipe.png");

const cardIcons = {
  deviceTotal: deviceTotalIcon,
  onlineDevice: onlineDeviceIcon,
  offlineDevice: offlineDeviceIcon,
  alarmTotal: alarmTotalIcon,
  alarmHandling: alarmHandlingIcon,
  processed: processedIcon,
} as const;

const parseMonitorValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getMonitorDecimals = (value: unknown) => {
  if (value === null || value === undefined) return 0;
  const str = String(value).trim();
  if (!str) return 0;
  const dotIndex = str.indexOf(".");
  if (dotIndex === -1) return 0;
  return Math.min(str.slice(dotIndex + 1).length, 3);
};

const PIPE_CAROUSEL_INTERVAL_MS = 10_000;
const ALARM_VISIBLE_ROWS = 5;
const ALARM_ROW_HEIGHT = 30;
const ALARM_HEADER_HEIGHT = 30;
const ALARM_TABLE_HEIGHT = ALARM_HEADER_HEIGHT + ALARM_ROW_HEIGHT * ALARM_VISIBLE_ROWS;
const alarmTableViewportStyle = {
  height: `calc(var(--font-size-scale, 1) * ${ALARM_TABLE_HEIGHT}px)`,
  maxHeight: `calc(var(--font-size-scale, 1) * ${ALARM_TABLE_HEIGHT}px)`,
  overflow: "hidden",
  flex: "0 0 auto",
};

const renderAlarmStatus = (record: { alarmStatus: string }): JSX.Element => {
  if (record.alarmStatus === "ALARM_UN_CONFIRMED") {
    return <span class="status is-pending">待处理</span>;
  }
  if (record.alarmStatus === "ALARM_PROGRESS_CONFIRMED") {
    return <span class="status is-processing">处理中</span>;
  }
  return <span class="status is-done">已处理</span>;
};

export const FireRightV2 = defineComponent({
  name: "FireRightV2",
  setup() {
    const { globalState } = useStateStore();
    const { currentTheme } = useVisualTheme();
    const isMinimalWhite = computed(() => currentTheme.value === "minimal-white");
    const pieRingVariant = computed(() => (isMinimalWhite.value ? "clean" : "default"));

    const cardList = ref<Array<{ label: string; value: unknown; unit: string; id: string }>>([]);
    const twoCardList = ref<Array<Array<{ label: string; value: unknown; unit: string; id: string }>>>([]);
    const carousel = ref(0);
    const carouselDir = ref<1 | -1>(1);
    const alarmRecordTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const equipmentStatistics = reactive({
      title: "末端水压监测",
      total: 0,
    });
    const listData = ref<any[]>([]);
    const pieData = ref<any[]>([]);
    const alarmListLoaded = ref(false);
    const alarmModalShow = ref(false);
    const deviceModalShow = ref(false);
    let timer: ReturnType<typeof setInterval> | null = null;

    const parameter = reactive({
      areaIds: "",
      alarmStatus: undefined as string | undefined,
      dateRange: [] as string[],
      timeType: "THIS_YEAR" as string,
    });

    const deviceParameter = reactive({
      anyAreaId: "" as string | undefined,
      deviceState: undefined as boolean | undefined,
      filterAreaIds: [] as string[],
      tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
      dateRange: [] as string[],
    });

    const deviceStatisticsData = reactive({
      title: "报警数",
      total: 48,
      itemize: [
        {
          name: "未处理数",
          label: "已处理数",
          value: 23,
          offline: 15,
          key: "OFFLINE",
        },
      ],
    });

    const deviceStatusData = reactive({
      title: "设备总数",
      total: 48,
      online: 23,
      offline: 15,
    });

    const colors = ["#2B7FFF", "#4DA6FF", "#00C2E0", "#7EB8FF", "#B5D4FF"];

    const deviceStatCards = computed(() => [
      {
        label: deviceStatusData.title,
        value: deviceStatusData.total,
        cardClass: "is-total",
        iconSrc: cardIcons.deviceTotal,
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        label: "在线设备",
        value: deviceStatusData.online,
        cardClass: "is-online",
        iconSrc: cardIcons.onlineDevice,
        valueClass: "is-online-value",
        clickKey: "在线设备",
      },
      {
        label: "离线设备",
        value: deviceStatusData.offline,
        cardClass: "is-offline",
        iconSrc: cardIcons.offlineDevice,
        valueClass: "is-offline-value",
        clickKey: "离线设备",
      },
    ]);

    const alarmStatCards = computed(() => [
      {
        cardClass: "is-total",
        iconSrc: cardIcons.alarmTotal,
        value: deviceStatisticsData.total,
        label: deviceStatisticsData.title,
        valueClass: "",
        clickKey: undefined as string | undefined,
      },
      {
        cardClass: "is-processed",
        iconSrc: cardIcons.processed,
        value: deviceStatisticsData.itemize[0].offline,
        label: deviceStatisticsData.itemize[0].label,
        valueClass: "is-processed-value",
        clickKey: "已处理数",
      },
      {
        cardClass: "is-pending",
        iconSrc: cardIcons.alarmHandling,
        value: deviceStatisticsData.itemize[0].value,
        label: deviceStatisticsData.itemize[0].name,
        valueClass: "is-pending-value",
        clickKey: "未处理数",
      },
    ]);

    const column = reactive([
      { title: "报警时间", dataIndex: "alarmTime", width: 148, align: "left" },
      { title: "报警级别", dataIndex: "alarmLevelName", align: "left", flex: 1 },
      { title: "报警事件", dataIndex: "alarmEventName", align: "left", flex: 1.2 },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        align: "left",
        width: 64,
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const zoomColumn = reactive([
      { title: "报警时间", dataIndex: "alarmTime", width: 180, align: "left" },
      { title: "报警级别", dataIndex: "alarmLevelName", align: "left", flex: 1 },
      { title: "报警事件", dataIndex: "alarmEventName", align: "left", flex: 1.2 },
      {
        title: "状态",
        dataIndex: "alarmStatus",
        align: "left",
        width: 72,
        slots: { customRender: "alarmStatus" },
      },
    ]);

    const getAlarmRecords = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmRecordTime.value.dateRange.join(","),
        type: alarmRecordTime.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const data = await alarmrecords(params);
      listData.value = data.records.map((item: any) => ({
        ...item,
        alarmTime: moment(item.alarmTime).format("MM-DD HH:mm"),
      }));
    };

    const getAlarmStatus = async () => {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        period: alarmRecordTime.value.dateRange.join(","),
        type: alarmRecordTime.value.timeType,
        pageSize: 50,
        pageNumber: 1,
      };
      const res = await recordStatus(params);
      deviceStatisticsData.total = res.alarmNum;
      deviceStatisticsData.itemize[0].offline = res.alarmHandlerNum;
      deviceStatisticsData.itemize[0].value = res.alarmUnresolvedHandlerNum;
    };

    const changeAlarmRecordDate = async () => {
      alarmListLoaded.value = false;
      try {
        await Promise.all([getAlarmRecords(), getAlarmStatus()]);
      } finally {
        alarmListLoaded.value = true;
      }
    };

    const changeDate = async () => {
      const res1 = await byTagProperties({
        tagCode: "builtin.usage::liquid.level.sensors",
        iotPropertyCodes: ["hydraulics"],
      });
      const res2 = await byTagProperties({
        tagCode: "builtin.usage::fire.water_pressure.device",
        iotPropertyCodes: ["pressure"],
      });
      const res = [...res1, ...res2];
      equipmentStatistics.total = res.length ? res.length : 0;
      cardList.value = [];
      res.forEach((item: any) => {
        item.iotProperties.forEach((iot: any) => {
          cardList.value.push({
            label: item.deviceName,
            value: iot.originalValue || 0,
            unit: iot?.attributeUnitName || "",
            id: item.id,
          });
        });
      });
      twoCardList.value = [];
      const chunkSize = 4;
      for (let i = 0; i < cardList.value.length; i += chunkSize) {
        const chunk = cardList.value.slice(i, i + chunkSize);
        while (chunk.length < chunkSize) {
          const remaining = chunkSize - chunk.length;
          chunk.push(...cardList.value.slice(0, remaining));
        }
        twoCardList.value.push(chunk);
      }
      if (timer) clearInterval(timer);
      timer = null;
      if (twoCardList.value.length > 1) {
        timer = setInterval(() => {
          const last = twoCardList.value.length - 1;
          goToPipePage(carousel.value >= last ? 0 : carousel.value + 1);
        }, PIPE_CAROUSEL_INTERVAL_MS);
      }
    };

    const goToPipePage = (idx: number): void => {
      const pageCount = twoCardList.value.length;
      if (pageCount <= 1 || idx === carousel.value || idx < 0 || idx >= pageCount) return;
      const last = pageCount - 1;
      if (carousel.value === last && idx === 0) carouselDir.value = 1;
      else if (carousel.value === 0 && idx === last) carouselDir.value = -1;
      else carouselDir.value = idx > carousel.value ? 1 : -1;
      carousel.value = idx;
    };

    const handlecurrentUps = async (value: { id: string }) => {
      const res = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: value.id });
      setSpecialCamera(res.productInfo.productCategory.name, res.baseArchivesInfo.code);
    };

    const alarmClickItemize = (value?: string) => {
      if (value === "未处理数") {
        parameter.alarmStatus = "ALARM_UN_CONFIRMED";
      } else if (value === "已处理数") {
        parameter.alarmStatus = "ALARM_HANDLER";
      } else {
        parameter.alarmStatus = undefined;
      }
      parameter.timeType = alarmRecordTime.value.timeType;
      const range = alarmRecordTime.value.dateRange;
      if (!range?.[0] || !range?.[1]) {
        parameter.dateRange = [
          moment().startOf("year").format("YYYY-MM-DD 00:00:00"),
          moment().endOf("year").format("YYYY-MM-DD 23:59:59"),
        ];
      } else {
        parameter.dateRange = [...range];
      }
      alarmModalShow.value = true;
    };

    const bindStatCardPointer = (handler: () => void) => ({
      type: "button" as const,
      onClick: (event: MouseEvent) => {
        event.stopPropagation();
        handler();
      },
      onPointerdown: (event: PointerEvent) => {
        event.stopPropagation();
      },
    });

    const closeModal = () => {
      alarmModalShow.value = false;
    };

    const handelClickRow = (record: any) => {
      if ((window as any).config.entry === "views") {
        bus.emit("setOpenAlarmModal", { ...record, hidePanel: true });
      } else {
        bus.emit("openAlarmModal", record);
      }
    };

    const getDeviceDistribution = async () => {
      const res = await getDeviceNumber({ tagCodes: buildVisualMenuTagCode(globalState.business.currentMenu) });
      deviceStatusData.total = res.totalNumber;
      deviceStatusData.online = res.normalNumber;
      deviceStatusData.offline = res.offlineNumber;
      const data = await getDeviceBuyArea({
        tagCodes: buildVisualMenuTagCodes(globalState.business.currentMenu),
        areaLevel: globalState.business.currentAreaLeave,
      });
      pieData.value = setDeviceData(data, colors);
    };

    const handelClickItemize = (value?: string) => {
      deviceParameter.filterAreaIds = [];
      if (value === "离线设备") {
        deviceParameter.deviceState = false;
      } else if (value === "在线设备") {
        deviceParameter.deviceState = true;
      } else {
        deviceParameter.deviceState = undefined;
      }
      deviceParameter.anyAreaId = globalState.business.currentAreaId;
      deviceModalShow.value = true;
    };

    const handleClickPie = async (value: { name: string }) => {
      if (value.name === "其他") {
        deviceParameter.anyAreaId = undefined;
        deviceParameter.filterAreaIds = pieData.value.map((e) => e.areaId);
        deviceModalShow.value = true;
      } else {
        deviceParameter.filterAreaIds = [];
        const findItem = pieData.value.find((res) => res.name === value.name);
        if (findItem) {
          deviceParameter.anyAreaId = findItem.areaId;
          deviceModalShow.value = true;
        }
      }
    };

    const renderSensorCard = (item: { label: string; value: unknown; unit: string; id: string }, keyPrefix: string): JSX.Element => (
      <div key={`${keyPrefix}-${item.id}-${item.label}`} class="pipe-sensor-card" onClick={() => handlecurrentUps(item)}>
        <div class="pipe-sensor-icon" aria-hidden="true">
          <img src={firePipeItemIcon} alt="" class="pipe-sensor-icon-svg" />
        </div>
        <div class="pipe-sensor-meta">
          <div class="pipe-sensor-name" title={item.label}>
            {item.label}
          </div>
          <div class="pipe-sensor-value-block">
            <CountTo
              key={`pipe-${keyPrefix}-${item.id}-${item.label}`}
              class="pipe-sensor-value"
              startVal={0}
              endVal={parseMonitorValue(item.value)}
              decimals={getMonitorDecimals(item.value)}
              separator=""
              duration={1800}
            />
            {item.unit ? <span class="pipe-sensor-unit">{item.unit}</span> : null}
          </div>
        </div>
      </div>
    );

    const renderPipeBody = (isZoom: boolean): JSX.Element => {
      const currentCards = twoCardList.value[carousel.value] ?? [];
      const pageKey = `card-${carousel.value}`;
      const zoomCards = cardList.value;

      return (
        <div class={["fire-panel-body", "fire-pipe-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
          <div class={["pipe-summary-banner", isZoom ? "is-zoom" : ""]}>
            <div class="pipe-summary-glow" aria-hidden="true" />
            <div class="pipe-summary-inner">
              <div class="pipe-summary-icon" aria-hidden="true">
                <img src={fireMonitoringIcon} alt="" class="pipe-summary-icon-svg" />
              </div>
              <div class="pipe-summary-content">
                <div class="pipe-summary-label">{equipmentStatistics.title}</div>
                <div class="pipe-summary-value-row">
                  <CountTo
                    class="pipe-summary-value"
                    startVal={0}
                    endVal={equipmentStatistics.total}
                    separator=""
                    duration={2200}
                    decimals={0}
                  />
                  <span class="pipe-summary-unit">个</span>
                </div>
              </div>
            </div>
          </div>
          {zoomCards.length ? (
            isZoom ? (
              <div class="pipe-sensor-section">
                <div class="monitor-card-grid pipe-monitor-grid is-zoom-page">
                  {zoomCards.map((item) => renderSensorCard(item, "zoom-all"))}
                </div>
              </div>
            ) : (
              <div class="pipe-sensor-section">
                <div class={["pipe-monitor-viewport", carouselDir.value < 0 ? "is-prev" : "is-next"]}>
                  <Transition name="pipe-page">
                    <div class="monitor-card-grid pipe-monitor-grid" key={pageKey}>
                      {currentCards.map((item) => renderSensorCard(item, pageKey))}
                    </div>
                  </Transition>
                </div>
                {twoCardList.value.length > 1 ? (
                  <div class="pipe-carousel-dots">
                    {twoCardList.value.map((_, idx) => (
                      <button
                        key={`pipe-dot-${idx}`}
                        type="button"
                        class={["pipe-dot", carousel.value === idx ? "is-active" : ""]}
                        aria-label={`第${idx + 1}页`}
                        onClick={() => goToPipePage(idx)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          ) : (
            <noData />
          )}
        </div>
      );
    };

    const renderDeviceBody = (isZoom: boolean): JSX.Element => (
      <div class={["fire-device-panel", "fire-panel-body", "fire-device-body", isZoom ? "is-zoom" : ""]} data-no-zoom>
        <div class="stats-row" data-no-zoom>
          {deviceStatCards.value.map((item) => (
            <button
              key={`${isZoom ? "zoom-" : ""}${item.label}`}
              {...bindStatCardPointer(() => handelClickItemize(item.clickKey))}
              class={["stat-card", item.cardClass]}
            >
              <div class="stat-icon stat-icon-image" aria-hidden="true">
                <img src={item.iconSrc} alt="" class="stat-icon-img" />
              </div>
              <div class="stat-content">
                <div class="stat-label">{item.label}</div>
                <div class={["stat-value", item.valueClass]}>
                  <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />
                </div>
              </div>
            </button>
          ))}
        </div>
        <div class={["device-chart-row", isZoom ? "is-zoom" : "", isMinimalWhite.value ? "is-clean-ring" : ""]}>
          <div class={["chart-pie-wrap", isZoom ? "is-zoom" : ""]}>
            <ElevatorAnalysisPie
              class="elevator-analysis-left"
              radius={isMinimalWhite.value ? "78" : "75"}
              ringVariant={pieRingVariant.value}
              pieData={pieData.value}
              onClickbar={handleClickPie}
              v-slots={{
                default: () => (
                  <>
                    <div class="pie-center-value">
                      <CountTo startVal={0} endVal={deviceStatusData.total} separator="" duration={2000} />
                    </div>
                    <div class="pie-center-label">设备总数</div>
                  </>
                ),
              }}
            />
          </div>
          <div class={["legend-list", isZoom ? "is-zoom" : ""]}>
            {pieData.value.map((item) => (
              <button
                type="button"
                key={`${isZoom ? "zoom-" : ""}${item.name}`}
                class="legend-item"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClickPie(item);
                }}
                onPointerdown={(event) => event.stopPropagation()}
              >
                <span class="legend-left">
                  <i class="legend-color" style={{ backgroundColor: item.color }} />
                  <span class="legend-name" title={item.name}>
                    {item.name}
                  </span>
                </span>
                <span class="legend-value">
                  {item.value}
                  <em class="legend-unit">个</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );

    const renderAlarmListBody = (isZoom: boolean): JSX.Element => {
      if (!alarmListLoaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <>
          <div class="stats-row" data-no-zoom>
            {alarmStatCards.value.map((item) => (
              <button
                key={`${isZoom ? "zoom-" : ""}${item.label}`}
                {...bindStatCardPointer(() => alarmClickItemize(item.clickKey))}
                class={["stat-card", item.cardClass]}
              >
                <div class="stat-icon stat-icon-image" aria-hidden="true">
                  <img src={item.iconSrc} alt="" class="stat-icon-img" />
                </div>
                <div class="stat-content">
                  <div class="stat-label">{item.label}</div>
                  <div class={["stat-value", item.valueClass]}>
                    {isZoom ? item.value : <CountTo startVal={0} endVal={item.value} separator="" duration={4000} />}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {!listData.value.length ? (
            <noData />
          ) : (
            <div
              class={["table-panel", "visual-v2-roll-table", "fire-alarm-roll-table", isZoom ? "is-zoom" : ""]}
              style={isZoom ? undefined : alarmTableViewportStyle}
            >
              {isZoom ? (
                <div class="zoom-table-viewport">
                  <RollTable
                    column={zoomColumn}
                    data={listData.value}
                    showLength={9999}
                    class="zoom-roll-table"
                    onClickRow={handelClickRow}
                    v-slots={{
                      alarmStatus: ({ record }: { record: { alarmStatus: string } }) => renderAlarmStatus(record),
                    }}
                  />
                </div>
              ) : (
                <RollTable
                  column={column}
                  data={listData.value}
                  showLength={ALARM_VISIBLE_ROWS}
                  rowHeight={ALARM_ROW_HEIGHT}
                  onClickRow={handelClickRow}
                  v-slots={{
                    alarmStatus: ({ record }: { record: { alarmStatus: string } }) => renderAlarmStatus(record),
                  }}
                />
              )}
            </div>
          )}
        </>
      );
    };

    onMounted(() => {
      getDeviceDistribution();
      changeDate();
      void changeAlarmRecordDate();
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    return () => (
      <div class="fire-right-v2-root">
        <SubPanelTemplate
          title="消防管网监测"
          class="visual-v2-sub-panel fire-panel-v2 fire-pipe-panel"
          zoomable
          zoom-title="消防管网监测详情"
          zoom-width={860}
          v-slots={{
            titleIcon: () => <img src={firePipeIcon} alt="" class="title-card-icon" />,
            default: () => renderPipeBody(false),
            "zoom-content": () => renderPipeBody(true),
          }}
        />

        <div class="alarm-event">
          <SubPanelTemplate
            title="消防设备分布情况"
            class="visual-v2-sub-panel fire-panel-v2 fire-device-panel"
            zoomable
            zoom-title="消防设备分布情况详情"
            zoom-width={720}
            v-slots={{
              titleIcon: () => <img src={fireDeviceIcon} alt="" class="title-card-icon" />,
              default: () => renderDeviceBody(false),
              "zoom-content": () => renderDeviceBody(true),
            }}
          />
        </div>

        <div class="alarm-event">
          <SubPanelTemplate
            title="报警列表"
            class="visual-v2-sub-panel fire-panel-v2 fire-alarm-list-panel"
            zoomable
            zoom-title="报警列表详情"
            zoom-width={860}
            v-slots={{
              titleIcon: () => <img src={alarmRecordIcon} alt="" class="title-card-icon" />,
              extra: () => (
                <DateInlineForm
                  modelValue={alarmRecordTime.value}
                  onUpdate:modelValue={(v) => {
                    alarmRecordTime.value = v;
                  }}
                  data-no-zoom
                  onSearch={changeAlarmRecordDate}
                />
              ),
              default: () => (
                <div class="fire-panel-body" data-no-zoom>
                  {renderAlarmListBody(false)}
                </div>
              ),
              "zoom-content": () => (
                <div class="fire-panel-body is-zoom fire-alarm-list-zoom" data-no-zoom>
                  {renderAlarmListBody(true)}
                </div>
              ),
            }}
          />
        </div>

        {alarmModalShow.value ? <ModalAlarmTableNew showModal={alarmModalShow.value} parameter={parameter} onClose={closeModal} /> : null}
        {deviceModalShow.value ? (
          <ModalEquipmentAllTable
            showModal={deviceModalShow.value}
            parameter={deviceParameter}
            onClose={() => {
              deviceModalShow.value = false;
            }}
          />
        ) : null}
      </div>
    );
  },
});

export default FireRightV2;
