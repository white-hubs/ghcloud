import { computed, defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { getFlowOrderPage } from "@/infrastructure/api/flow";
import NoData from "@/shared-ui/panel/noData";
import { useVisualTheme } from "@/visualization-core/hooks/use-visual-theme";

import "@/features/equipment/modal-table/modal-equipmentAll-table.module.less";

import styles from "./modal-work-table.module.less";

export const ModalWorkTable = defineComponent({
  name: "ModalWorkTable",
  props: {
    parameter: { type: null, required: false, default: {} },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { currentTheme } = useVisualTheme();
    const modalWrapClassName = computed(
      () => `modal-table-alarm modal-table-device equipment-data-list-modal device-records-theme-${currentTheme.value}`,
    );
    interface Props {
      parameter?: any;
      showModal: boolean;
    }
    const application = [
      { label: "考勤管理", value: "ATTENDANCE_MANAGEMENT" },
      { label: "人事管理", value: "PERSONNELMANAGEMENT" },
      { label: "行政管理", value: "OFFICIAL_MANAGEMENT" },
      { label: "隐患排查", value: "HIDDENDANGER" },
      { label: "故障报修", value: "FAULT" },
      { label: "维保作业", value: "MAINTENANCE" },
      { label: "日常巡检", value: "INSPECTION" },
    ];
    const loading = ref(false);
    const selectForm = ref();
    const datainfo = reactive({
      application: "",
      status: "",
      period: "",
      applicationCodes: [],
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const show = ref(false);

    const table_header = ["工单编码", "工单名称", "部门", "状态"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      try {
        loading.value = true;
        const res = await getFlowOrderPage({
          ...datainfo,
          applicationCodes: datainfo.application ? datainfo.application : application.map((e) => e.value).join(","),
        });
        dataSource.value = res.records;
        datainfo.total = res.total;
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };
    const query = () => {
      getData();
    };
    const reset = () => {
      Object.assign(datainfo, {
        ...props.parameter,
        keyword: "",
        status: props.parameter.status ?? "",
        application: props.parameter.application ?? "",
        period: props.parameter.period ?? "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      getData();
    };
    const closeModal = () => {
      Object.assign(datainfo, {
        keyword: "",
        status: props.parameter.status ?? "",
        application: props.parameter.application ?? "",
        period: props.parameter.period ?? "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          dataSource.value = [];
          Object.assign(datainfo, {
            ...props.parameter,
            keyword: "",
            status: props.parameter.status ?? "",
            application: props.parameter.application ?? "",
            period: props.parameter.period ?? "",
            pageSize: 10,
            pageNumber: 1,
            total: 0,
          });
          getData();
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="工单列表" show={props.showModal && !show.value} onClose={closeModal} wrapClassName={modalWrapClassName.value}>
          <div class="modal-layout">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline">
                <a-form-item label="应用">
                  <a-select
                    value={datainfo.application}
                    onUpdate:value={(v) => {
                      datainfo.application = v;
                    }}
                    style="width: 100px;"
                  >
                    <a-select-option value> 全部</a-select-option>
                    {application.map((item) => (
                      <a-select-option value={item.value} key={item.value}>
                        {" "}
                        {item.label}
                      </a-select-option>
                    ))}
                  </a-select>
                </a-form-item>
                <a-form-item label="状态">
                  <a-select
                    value={datainfo.status}
                    onUpdate:value={(v) => {
                      datainfo.status = v;
                    }}
                  >
                    <a-select-option value> 全部</a-select-option>
                    <a-select-option value="FINISHED"> 已完成</a-select-option>
                    <a-select-option value="ACTIVE"> 未完成</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" size="middle" onClick={query} loading={loading.value}>
                    {" "}
                    查询
                  </a-button>
                  <a-button size="middle" style="margin-left: 15px" onClick={reset}>
                    {" "}
                    重置
                  </a-button>
                </a-form-item>
              </a-form>
            </div>
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.value.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <NoData />
                    </div>
                  )}
                  {dataSource.value.map((item) => (
                    <div key={item.formNo}>
                      <div class="content">
                        <div>{renderPopoverText(item.formNo)}</div>
                        <div>{renderPopoverText(item.instanceName)}</div>
                        <div>{renderPopoverText(item.startUserInfo.organizationName)}</div>
                        <div>{renderPopoverText(item.status === "ACTIVE" ? "未完成" : "已完成")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </a-spin>
            </div>
            <div style="height: 30px">
              {" "}
              <a-pagination
                style="float: right; margin-top: 15px"
                current={datainfo.pageNumber}
                onUpdate:current={(v) => {
                  datainfo.pageNumber = v;
                }}
                page-size={datainfo.pageSize}
                onUpdate:page-size={(v) => {
                  datainfo.pageSize = v;
                }}
                onChange={onShowSizeChange}
                total={datainfo.total}
              />
            </div>
          </div>
        </Modal>
      </>
    );
  },
});

export default ModalWorkTable;
