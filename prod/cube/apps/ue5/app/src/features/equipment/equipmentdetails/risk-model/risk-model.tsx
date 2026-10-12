import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { getCodeRiskDetailed, getRiskDetailed } from "@/infrastructure/api/property";
import { getAssetsImage } from "@/infrastructure/utils/getImage";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";
import "./risk-model.module.less";

interface RiskDetailData {
  serialNumber?: string;
  typeName?: string;
  attribute?: string;
  stallName?: string;
  maintenanceDepName?: string;
  receiveUserName?: string;
  usageDate?: string;
  name?: string;
  areaName?: string;
  sitePointName?: string;
  number?: string | number;
  receiveUserPhone?: string;
  receiveDepName?: string;
  files?: Array<{ path?: string }>;
  partsDetails?: Array<Record<string, unknown>>;
}

const createDefaultRiskData = (): RiskDetailData => ({
  serialNumber: "",
  typeName: "",
  attribute: "",
  stallName: "",
  maintenanceDepName: "",
  receiveUserName: "",
  usageDate: "",
  name: "",
  areaName: "",
  sitePointName: "",
  number: "",
  receiveUserPhone: "",
  receiveDepName: "",
  files: [],
  partsDetails: [],
});

export const RiskModel = defineComponent({
  name: "RiskModel",
  props: {
    id: {
      type: [String],
      default: "",
    },
    code: {
      type: [String],
      default: "",
    },
    isequ: {
      type: Boolean,
      default: false,
    },
    PanelName: {
      type: Object,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(() => `risk-detail-modal-wrap device-records-theme-${currentTheme.value}`);
    const tabsList = ref<string[]>(["基本信息", "配件信息"]);
    const activeTabs = ref("基本信息");
    const ellipsisWithPopover = { showTitle: false };
    const columns = [
      {
        title: "配件编号",
        key: "code",
        align: "center" as const,
        dataIndex: "code",
        width: 160,
        ellipsis: ellipsisWithPopover,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "配件名称",
        key: "name",
        align: "center" as const,
        dataIndex: "name",
        width: 180,
        ellipsis: ellipsisWithPopover,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
      {
        title: "到期时间",
        key: "expireDate",
        dataIndex: "expireDate",
        align: "center" as const,
        width: 180,
        ellipsis: ellipsisWithPopover,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--"),
      },
      {
        title: "备注",
        key: "remarks",
        dataIndex: "remarks",
        align: "center" as const,
        ellipsis: ellipsisWithPopover,
        customRender: ({ text }: { text?: string }) => renderPopoverText(text),
      },
    ];
    const riskData = ref<RiskDetailData>(createDefaultRiskData());
    const infoData = ref({
      name: "风险源信息",
    });
    const closeModal = () => {
      emit("close", true);
    };
    const getPropertyDetail = async () => {
      let data: RiskDetailData | undefined;
      if (props.id) {
        data = await getRiskDetailed(props.id);
      } else if (props.code) {
        data = await getCodeRiskDetailed(props.code);
      }
      riskData.value = {
        ...createDefaultRiskData(),
        ...(data || {}),
        files: Array.isArray(data?.files) ? data.files : [],
        partsDetails: Array.isArray(data?.partsDetails) ? data.partsDetails : [],
      };
    };
    onMounted(() => {
      getPropertyDetail();
    });

    return (): JSX.Element => (
      <Modal title={infoData.value.name} show={true} width="900px" wrapClassName={modalWrapClassName.value} onClose={closeModal}>
        <div class="risk-detail-modal-content flex-column">
          <div class="content-tabs">
            {tabsList.value.map((item) => (
              <div
                key={item}
                class={item === activeTabs.value ? "active" : ""}
                onClick={() => {
                  activeTabs.value = item;
                }}
              >
                <div>{item}</div>
              </div>
            ))}
          </div>
          <div class="conent-body">
            {activeTabs.value === "基本信息" && (
              <div class="info-content">
                <div class="info-img">
                  <a-image width="100%" height="100%" src={riskData.value.files?.[0]?.path || getAssetsImage("overView45.png")} />
                </div>
                <div class="info-item" style="width: 80%">
                  <div style="width: 45%">
                    <div class="info-name">
                      风险源编码:
                      <span> {riskData.value.serialNumber || "--"}</span>
                    </div>
                    <div class="info-name">
                      风险源分类:
                      <span> {riskData.value.typeName || "--"}</span>
                    </div>
                    <div class="info-name">
                      关联档位:
                      <span> {riskData.value.stallName || "--"}</span>
                    </div>
                    <div class="info-name">
                      属性:
                      <span> {riskData.value.attribute || "--"}</span>
                    </div>
                    <div class="info-name">
                      维护部门:
                      <span> {riskData.value.maintenanceDepName || "--"}</span>
                    </div>
                    <div class="info-name">
                      使用人:
                      <span> {riskData.value.receiveUserName || "--"}</span>
                    </div>
                    <div class="info-name">
                      使用到期日期:
                      <span> {riskData.value.usageDate ? dayjs(riskData.value.usageDate).format("YYYY-MM-DD") : "--"}</span>
                    </div>
                  </div>
                  <div style="width: 50%; margin-left: 20px">
                    <div class="info-name">
                      风险源名称:
                      <span> {riskData.value.name || "--"}</span>
                    </div>
                    <div class="info-name">
                      所在区域:
                      <span> {riskData.value.areaName || "--"}</span>
                    </div>
                    <div class="info-name">
                      关联现场点:
                      <span> {riskData.value.sitePointName || "--"}</span>
                    </div>
                    <div class="info-name">
                      数量:
                      <span> {riskData.value.number || "--"}</span>
                    </div>
                    <div class="info-name">
                      使用部门:
                      <span> {riskData.value.receiveDepName || "--"}</span>
                    </div>
                    <div class="info-name">
                      联系方式:
                      <span> {riskData.value.receiveUserPhone || "--"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTabs.value === "配件信息" && (
              <div class={`parts-panel modal-table-device device-records-theme-${currentTheme.value}`}>
                {(riskData.value.partsDetails?.length ?? 0) > 0 ? (
                  <div class="table-wrapper">
                    <a-table
                      class="device-records-table"
                      scroll={{ y: 300 }}
                      dataSource={riskData.value.partsDetails}
                      columns={columns}
                      pagination={false}
                      rowKey={(row: Record<string, unknown>, index?: number) => String(row.code ?? row.id ?? index ?? 0)}
                    />
                  </div>
                ) : (
                  <NoData />
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  },
});

export default RiskModel;
