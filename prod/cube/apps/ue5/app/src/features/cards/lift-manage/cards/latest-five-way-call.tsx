import { defineComponent, onMounted, ref } from "vue";

import LiftModal from "../lift-modal";
import UniversalPanelCardIcon from "@/features/cards/universal-panel/_shared/universal-panel-card-icon";
import { UNIVERSAL_PANEL_V2_CLASS, universalPanelZoomClass } from "@/features/cards/universal-panel/_shared/universal-panel-v2";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { liftFiveCallLogPage } from "@/infrastructure/api/securitymanagement";

import styles from "./latest-five-way-call.module.less";

export const LatestFiveWayCall = defineComponent({
  name: "LatestFiveWayCall",
  setup(_props, ctx) {
    const showModal = ref(false);
    void ctx;

    const columns = ref([
      { title: "电梯编号", dataIndex: "liftNumber", width: 100 },
      { title: "处理内容", dataIndex: "callContent" },
      { title: "处理状态", dataIndex: "handlingSituation", width: 110 },
    ]);

    const tableData = ref<Array<Record<string, unknown>>>([]);
    const handleAll = (): void => {
      showModal.value = true;
    };

    // 获取五方通话数据
    const getLiftFiveCallLogPage = async () => {
      const res = await liftFiveCallLogPage({
        pageNumber: 1,
        pageSize: 10,
      });
      tableData.value = res.records.map((e: any) => {
        return {
          liftNumber: e.liftNumber,
          callContent: e.handlingSituation ? e.callContent : "--",
          handlingSituation: e.handlingSituation ? "已处理" : "未处理",
        };
      });
    };

    onMounted(() => {
      getLiftFiveCallLogPage();
    });

    const renderBody = (isZoom: boolean): JSX.Element => (
      <div class={["up-card-body", styles.cardBody, isZoom ? styles.isZoom : "", ...(isZoom ? universalPanelZoomClass : [])]} data-no-zoom>
        <div class={styles.tableSurface}>
          <RollTable column={columns.value} data={tableData.value} showLength={4} />
        </div>
      </div>
    );

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="最新五方通话"
            class={`${UNIVERSAL_PANEL_V2_CLASS} lift-five-way-call-v2-panel`}
            zoomable
            zoom-title="最新五方通话详情"
            zoom-width={760}
            v-slots={{
              titleIcon: () => <UniversalPanelCardIcon name="trend" />,
              extra: () => (
                <div class={styles.dataTitle} data-no-zoom>
                  <button type="button" class={styles.dataTitleRight} onClick={() => handleAll()} aria-label="查看全部五方通话记录">
                    查看更多{">>"}
                  </button>
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <LiftModal
          showModal={showModal.value}
          onClose={() => {
            showModal.value = false;
          }}
        />
      </>
    );
  },
});

export default LatestFiveWayCall;
