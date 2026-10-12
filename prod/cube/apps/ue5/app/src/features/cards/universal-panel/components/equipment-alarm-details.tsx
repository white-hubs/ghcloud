import { defineComponent, onMounted, ref, provide } from "vue";

import UniversalPanelCardIcon from "../_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "../_shared/universal-panel-v2";
import ModalAlarmTable from "@/features/equipment/modal-table/modal-alarm-tableNew";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import "../_shared/universal-panel-v2-shared.less";

import styles from "./equipment-alarm-details.module.less";

export const EquipmentAlarmDetails = defineComponent({
  name: "EquipmentAlarmDetails",
  props: {
    title: { type: String, required: true, default: "设备报警明细" },
  },
  setup(props) {
    const { globalState } = useStateStore();
    const alarmParameter = ref<Record<string, any>>({});
    const deviceModal = ref<boolean>(false);
    const alarmListData = ref<any[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const alarmColumn = [
      {
        title: "设备名称",
        dataIndex: "alarmTargetName",
        width: 120,
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
      },
      {
        title: "报警事件",
        dataIndex: "alarmEventName",
      },
      {
        title: "当前状态",
        dataIndex: "status",
        width: 140,
        slots: {
          customRender: "alarmStatus",
        },
      },
    ];

    const handleAll = () => {
      deviceModal.value = true;
    };
    const closeModal = () => {
      deviceModal.value = false;
    };

    async function getAlarmTakeNotes() {
      const params = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        pageSize: 50,
        pageNumber: 1,
      };
      const res: any = await alarmStatisticsList(params);
      loaded.value = true;
      alarmListData.value = res.records.map((item: Record<string, unknown>) => ({
        ...item,
      }));
    }

    onMounted(() => {
      void getAlarmTakeNotes();
    });

    const renderAlarmStatus = ({ record }: { record: Record<string, string> }) => (
      <>
        {record.alarmStatus === "ALARM_UN_CONFIRMED" && <span class={styles.statusPending}>待接收</span>}
        {record.alarmStatus === "ALARM_PROGRESS_CONFIRMED" ? <span class={styles.statusProcessing}>处理中</span> : null}
        <span class={styles.statusDone}>已处理</span>
      </>
    );

    const renderMoreLink = (): JSX.Element => (
      <div class="header-toolbar" data-no-zoom>
        <button type="button" class={styles.moreLink} onClick={handleAll}>
          更多
        </button>
      </div>
    );

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div
        class={["up-card-body", styles.cardBody, isZoom ? styles.zoomBody : "", ...(isZoom ? universalPanelZoomClass : [])]}
        data-no-zoom
      >
        <div class={["up-table-surface", "up-surface", styles.tableSurface]}>
          {!loaded.value ? (
            <PanelCardLoading zoom={isZoom} />
          ) : !alarmListData.value.length ? (
            <div class="up-empty">
              <NoData />
            </div>
          ) : (
            <RollTable
              column={alarmColumn}
              data={alarmListData.value}
              showLength={isZoom ? 8 : 4}
              v-slots={{ alarmStatus: renderAlarmStatus }}
            />
          )}
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title={props.title}
            class={`${UNIVERSAL_PANEL_V2_CLASS} equipment-alarm-details-v2-panel`}
            zoomable
            zoom-title={`${props.title}详情`}
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="alarm" />,
              extra: () => renderMoreLink(),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalAlarmTable show-modal={deviceModal.value} onClose={closeModal} parameter={alarmParameter.value} />
      </>
    );
  },
});

export default EquipmentAlarmDetails;
