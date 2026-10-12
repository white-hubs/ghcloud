import { AlertOutlined, RollbackOutlined, WarningOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent, provide } from "vue";
import { ref, onMounted, watch, computed } from "vue";

import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import EquipmentDetailPanel from "@/features/equipment/equipmentdetails/index";
import { renderPopoverText, toDisplayText } from "@/features/equipment/modal-table/render-popover-text";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList, getstatus } from "@/infrastructure/api/alarm";
import { AlarmTakeNotesList } from "@/infrastructure/api/models/alarm";
import { VideoType } from "@/infrastructure/api/models/vmonitor";
import { cubeDeviceCenterService, cubeFileService } from "@/infrastructure/api/service";
import bus from "@/infrastructure/utils/bus";
import { DeviceTypeIcon } from "@/infrastructure/utils/enumeratie";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import H5Video from "@/shared-ui/panel/H5Video";
import NoData from "@/shared-ui/panel/noData";
import { panelCardTitleKey } from "@/shared-ui/panel/panel-card-title-context";
import { eventInstance } from "@/visualization-core/event/event";
import { iotSocketStore } from "@/visualization-core/stores/iotSocketStore";
import { storeMarket } from "@/visualization-core/stores/other";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./device-details-panel.module.less";

type AlarmStatusTone = "pending" | "processing" | "suspend" | "done" | "default";

export const DeviceDetailsPanel = defineComponent({
  name: "DeviceDetailsPanel",
  setup(_props, ctx) {
    const { globalState } = useStateStore();
    const piniaStoreMarket = storeMarket();
    provide(
      panelCardTitleKey,
      computed(() => "设备信息"),
    );
    const deviceType = ref();
    const type = ref();
    const spinning = ref(false);
    const dataInfo = ref<any>({
      baseArchivesInfo: {
        picture: "",
        thirdPartyId: "",
        code: "",
        area: {
          name: "",
        },
        manager: {
          name: "",
        },
        department: {
          name: "",
        },
        status: {
          onlineState: false,
        },
      },
      productInfo: {
        name: "",
        productCategory: {
          name: "",
          code: "",
        },
        modelName: "",
      },
      expandInfo: {
        factoryInfo: {
          usefulLife: "",
        },
      },
    });
    const piniaIot = iotSocketStore();
    const dataSource = ref<AlarmTakeNotesList[]>([]);
    const pagination = ref({
      pageSize: 5,
      pageNumber: 1,
      total: 0,
    });
    const total = ref(0);
    const handlingNum = ref(0);
    const readData = ref<any>([]);
    const attributeValueRead = ref();
    const attributeValue = ref({});
    const showDetailPanel = ref(false);
    const readAndWritData = ref<any>([
      {
        attributeName: "",
        attributeKeyValueVos: [],
        attributeCode: "",
      },
    ]);
    const resolveAlarmStatusTone = (record: AlarmTakeNotesList): AlarmStatusTone => {
      const code = String(record.alarmStatus ?? "").trim();
      const name = String(record.alarmStatusName ?? "").trim();
      if (code === "ALARM_UN_CONFIRMED" || name.includes("待")) return "pending";
      if (code === "ALARM_PROGRESS_CONFIRMED" || name.includes("处理中")) return "processing";
      if (code === "ALARM_SUSPEND" || name.includes("挂起")) return "suspend";
      if (code === "ALARM_HANDLER" || name.includes("已处理") || name.includes("完成")) return "done";
      return "default";
    };
    const columns = [
      {
        title: "异常类型",
        dataIndex: "alarmTypeName",
        flex: 0.95,
        customRender: (value) => renderPopoverText(toDisplayText(value)),
      },
      {
        title: "上报时间",
        dataIndex: "alarmTime",
        flex: 1.25,
        align: "left" as const,
        customRender: (value) => renderPopoverText(toDisplayText(value)),
      },
      {
        title: "异常详情",
        dataIndex: "alarmEventName",
        flex: 1.4,
        align: "left" as const,
        customRender: (value) => renderPopoverText(toDisplayText(value)),
      },
      {
        title: "当前状态",
        dataIndex: "alarmStatusName",
        flex: 0.8,
        slots: { customRender: "alarmStatusName" },
      },
    ];
    const deviceRelationship = ref({
      type: "子设备",
      name: "",
    });

    const positioning = async () => {
      eventInstance.emitEvent("locateToDevice", {
        deviceCode: dataInfo.value.baseArchivesInfo.code,
        prodCategory: dataInfo.value.productInfo.name,
      });
    };
    const getDeviceInstanceDetail = async (id) => {
      spinning.value = true;
      dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: id });
      deviceType.value = DeviceTypeIcon[dataInfo.value.productInfo.name as keyof typeof DeviceTypeIcon];
      type.value = DeviceTypeIcon[dataInfo.value.productInfo.productCategory.name as keyof typeof DeviceTypeIcon];
      spinning.value = false;

      if (id !== panelCurrentDeviceId.value) {
        dataInfo.value.slaveDeviceList = [
          {
            id: panelCurrentDeviceId.value,
            name: deviceRelationship.value.name,
          },
        ];
      } else {
        deviceRelationship.value.name = dataInfo.value.baseArchivesInfo.name;
      }
      if (dataInfo.value.productInfo.picture) {
        cubeFileService.getFileInfo(dataInfo.value.productInfo.picture).then((res) => {
          dataInfo.value.productInfo.path = res.path;
        });
      }
    };
    const getTableData = () => {
      alarmStatisticsList({
        alarmTargetCode: panelCurrentDeviceId.value,
        pageSize: pagination.value.pageSize,
        pageNumber: pagination.value.pageNumber,
      }).then((res) => {
        dataSource.value = res.records.map((item) => {
          return {
            ...item,
            alarmTime: dayjs(item.alarmTime).format("YYYY-MM-DD HH:mm:ss"),
          };
        });
        total.value = res.total;
        pagination.value.total = res.total;
      });
      getstatus({ alarmTargetCode: panelCurrentDeviceId.value }).then((res) => {
        handlingNum.value = res.alarmStatusStatistics[1].alarmNum;
      });
    };
    const getDeviceIotData = async () => {
      const { dataArr } = await piniaIot.iotSocket.deviceDetail({
        deviceId: panelCurrentDeviceId.value,
        withSnapShot: true,
        withPropertySpec: true,
      });
      readData.value = dataArr.filter((item) => item.permission === "READ");
      readAndWritData.value = dataArr.filter((item) => item.permission === "READ_WRITE");
      attributeValueRead.value = Object.fromEntries(readData.value.map((item: any) => [item.attributeCode, item.value]));
      attributeValue.value = Object.fromEntries(readAndWritData.value.map((item: any) => [item.attributeCode, item.value]));
    };
    const showMore = () => {
      showDetailPanel.value = true;
    };
    const closeDetailPanel = () => {
      showDetailPanel.value = false;
    };
    const changeDeviceRelationship = (data) => {
      deviceRelationship.value.type = deviceRelationship.value.type === "父设备" ? "子设备" : "父设备";
      getDeviceInstanceDetail(data.id);
    };

    const goBack = () => {
      // const emergencyDeviceBack = globalState.business.emergencyDeviceBack
      // if (emergencyDeviceBack) {
      //   globalState.panel.visible = false
      //   globalState.panel.leftPanelName = 'floorEquipment'
      //   globalState.panel.rightPanelName = 'emergency-drill'
      //   globalState.panel.universalPanelVo.left = { items: '' }
      //   globalState.panel.universalPanelVo.right = { items: '' }
      //   setTimeout(() => {
      //     globalState.panel.visible = true
      //   }, 500);
      //   return
      // }
      piniaStoreMarket.panelCurrentDeviceId = "";
      globalState.business.panelCurrentDeviceId = "";
      // bus.emit("exitPatrol");
      eventInstance.emitEvent("verifyModelStatus");
      eventInstance.emitEvent("switchBusinessPanel");
    };
    const panelCurrentDeviceId = computed(() => {
      return piniaStoreMarket.panelCurrentDeviceId || globalState.business.panelCurrentDeviceId;
    });
    watch(
      () => panelCurrentDeviceId.value,
      async (val: any) => {
        if (val) {
          await getDeviceInstanceDetail(panelCurrentDeviceId.value);
          await getTableData();
          await getDeviceIotData();
        }
      },
      { immediate: true },
    );
    onMounted(() => {
      document.querySelector(`.${styles.deviceDetailsBox}`)?.removeAttribute("title");
    });

    const clickCamera = (item: VideoType) => {
      bus.emit("switchCamera", item);
    };
    const tableSlots = {
      alarmStatusName: ({ record }: { record: AlarmTakeNotesList }) => (
        <span class={[styles.statusTag, styles[`status${resolveAlarmStatusTone(record).replace(/^\w/, (s) => s.toUpperCase())}`]]}>
          {toDisplayText(record.alarmStatusName)}
        </span>
      ),
    };

    return (): JSX.Element => {
      const info = dataInfo.value;
      const reads = readData.value;
      const readValues = attributeValueRead.value || {};
      const online = Boolean(info?.baseArchivesInfo?.status?.onlineState);
      const categoryCode = String(info?.productInfo?.productCategory?.code || "");
      const showRealtime = reads.length > 0 && !categoryCode.includes("A003");
      const showMonitor =
        (info?.productInfo?.name === "监控" || Number(deviceType.value) <= 3 || Number(type.value) <= 3) &&
        Boolean(info?.baseArchivesInfo?.thirdPartyId);
      const deviceName = toDisplayText(info?.baseArchivesInfo?.name);

      return (
        <>
          <div class={styles.deviceDetailsBox}>
            <a-spin spinning={spinning.value}>
              <div class="v2-panel-root">
                <SubPanelTemplate
                  title="设备信息"
                  class="visual-v2-sub-panel v2-panel-card device-details-v2-panel"
                  v-slots={{
                    titleIcon: () => <CardTitleIcon name="overview-device" />,
                    extra: () => (
                      <button type="button" class={styles.backBtn} onClick={goBack}>
                        返回
                        <RollbackOutlined />
                      </button>
                    ),
                    default: () => (
                      <div class={styles.cardBody}>
                        <div class={styles.basicInfo}>
                          <div class={styles.basicInfoName}>{renderPopoverText(deviceName, { className: styles.basicInfoNameText })}</div>
                          <div class={styles.basicInfoOperate}>
                            <div class={styles.actionBtn} onClick={positioning}>
                              定位
                            </div>
                            <div class={styles.actionBtn} onClick={showMore}>
                              详情
                            </div>
                          </div>
                        </div>
                        <div class={styles.basicInfoBox}>
                          <div class={styles.infoImg}>
                            <a-image width="100%" height="100%" src={info?.productInfo?.path || getAssetsImage("overView45.png")}></a-image>
                          </div>
                          <div class={styles.basicInfoList}>
                            <div class={styles.basicInfoItem}>
                              <div class={styles.basicInfoItemLabel}>设备状态</div>
                              <div class={[styles.basicInfoItemValue, online ? styles.isOnline : styles.isOffline]}>
                                {online ? "在线" : "离线"}
                              </div>
                            </div>
                            <div class={styles.basicInfoItem}>
                              <div class={styles.basicInfoItemLabel}>设备编码</div>
                              <div class={styles.basicInfoItemValue}>{info?.baseArchivesInfo?.code || "暂无"}</div>
                            </div>
                            <div class={styles.basicInfoItem}>
                              <div class={styles.basicInfoItemLabel}>产品名称</div>
                              <div class={styles.basicInfoItemValue}>{info?.productInfo?.name || "暂无"}</div>
                            </div>
                          </div>
                        </div>
                        {info?.slaveDeviceList?.length ? (
                          <div class={styles.deviceGrid}>
                            <div class={[styles.deviceItem, styles.deviceType]}>{deviceRelationship.value.type}</div>
                            {info.slaveDeviceList.map((item) => (
                              <div class={styles.deviceItem} key={item.id} onClick={() => changeDeviceRelationship(item)}>
                                {item.name}
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {showRealtime ? (
                          <div class={styles.sectionBlock}>
                            <div class={styles.sectionTitle}>实时数据</div>
                            <div class={styles.realtimeGrid}>
                              {reads.map((item) => {
                                const mapped = item.attributeKeyValueVos?.length && item.attributeKeyValueVos[0]?.value;
                                const mappedLabel =
                                  item.attributeKeyValueVos?.find((e) => e.value === readValues[item.attributeCode])?.keyName ||
                                  item.attributeKeyValueVos?.find((e) => e.value === readValues[item.attributeCode])?.label ||
                                  "--";
                                const displayValue = mapped
                                  ? mappedLabel
                                  : `${readValues[item.attributeCode] || "--"}${readValues[item.attributeCode] ? item.unitName : ""}`;
                                return (
                                  <div class={styles.realtimeItem} key={item.attributeCode}>
                                    <div class={styles.realtimeItemLabel}>{item.attributeName}</div>
                                    <div class={styles.realtimeItemValue}>{displayValue}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                        {showMonitor ? (
                          <div class={styles.sectionBlock}>
                            <div class={styles.sectionTitle}>实时监控</div>
                            <div class={styles.videoBox} onClick={() => clickCamera(info.baseArchivesInfo)}>
                              <H5Video cameraItem={{ deviceId: info.baseArchivesInfo.id }}></H5Video>
                            </div>
                          </div>
                        ) : null}
                        <div class={styles.sectionBlock}>
                          <div class={styles.sectionTitle}>异常记录</div>
                          <div class={styles.statsRow}>
                            <div class={[styles.statCard, styles.isDanger]}>
                              <span class={styles.statLabel}>
                                <AlertOutlined class={styles.statIconDanger} />
                                告警总次数
                              </span>
                              <span class={styles.statValue}>{total.value}</span>
                            </div>
                            <div class={[styles.statCard, styles.isAmber]}>
                              <span class={styles.statLabel}>
                                <WarningOutlined class={styles.statIconAmber} />
                                处理中
                              </span>
                              <span class={styles.statValue}>{handlingNum.value}</span>
                            </div>
                          </div>
                          <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
                            {dataSource.value.length === 0 ? (
                              <div class={styles.emptySurface}>
                                <NoData />
                              </div>
                            ) : (
                              <RollTable
                                column={columns}
                                data={dataSource.value}
                                showLength={4}
                                rowHeight={40}
                                v-slots={tableSlots}
                              ></RollTable>
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  }}
                />
              </div>
            </a-spin>
          </div>
          {showDetailPanel.value ? (
            <EquipmentDetailPanel
              id={info?.baseArchivesInfo?.id || panelCurrentDeviceId.value}
              activeData="基本信息"
              onClose={closeDetailPanel}
            />
          ) : null}
        </>
      );
    };
  },
});

export default DeviceDetailsPanel;
