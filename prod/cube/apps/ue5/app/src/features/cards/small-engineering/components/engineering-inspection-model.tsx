import dayjs, { Dayjs } from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { cubeSmallEngineeringService } from "@/infrastructure/api/service";

import styles from "./engineering-inspection-model.module.less";

export const EngineeringInspectionModel = defineComponent({
  name: "EngineeringInspectionModel",
  props: {
    parameter: { type: Object, required: true },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      parameter: Record<string, any>;
      showModal: boolean;
    }
    enum QueryScoped {
      ALL = "ALL",
      /** 请示中 */
      APPLYING = "APPLYING",
      /** 签约中 */
      SIGNING = "SIGNING",
      /** 进行中 */
      UNDERWAY = "UNDERWAY",
      /** 已完成 */
      COMPLETED = "COMPLETED",
      /** 待验收 */
      WAIT_ACCEPT = "WAIT_ACCEPT",
    }

    const selectForm = ref();
    const time = ref<Dayjs[]>(
      props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [],
    );
    const keyword = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);

    const table_header = ["编号", "小散工程名称", "乙方", "完成时限", "监管部门", "监管负责人", "工程阶段"];
    function statusText(status: QueryScoped): string {
      switch (status) {
        case QueryScoped.ALL:
          return "";
        case QueryScoped.APPLYING:
          return "请示中";
        case QueryScoped.SIGNING:
          return "签约中";
        case QueryScoped.UNDERWAY:
          return "进行中";
        case QueryScoped.WAIT_ACCEPT:
          return "待验收";
        case QueryScoped.COMPLETED:
          return "已完成";
        default:
          return "--";
      }
    }
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      loadingDataSource.value = true;
      if (time.value?.length) {
        datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
      } else {
        datainfo.period = "";
      }
      datainfo.keyword = keyword.value;
      if (props.parameter.queryScoped === "ALL") {
        const res = await cubeSmallEngineeringService.getProjectNodeList({
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
          keyword: datainfo.keyword || undefined,
          period: datainfo.period,
        });
        dataSource.value = res.records;
        datainfo.total = res.total;
      } else if ([QueryScoped.UNDERWAY, QueryScoped.WAIT_ACCEPT, QueryScoped.COMPLETED].includes(props.parameter.queryScoped)) {
        const res = await cubeSmallEngineeringService.projectScheduleList({
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
          status: props.parameter.queryScoped,
          keyword: datainfo.keyword || undefined,
          period: datainfo.period,
        });
        dataSource.value = res.records;
        datainfo.total = res.total;
      }

      loadingDataSource.value = false;
    };

    const reset = () => {};
    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          datainfo.pageNumber = 1;

          getData();
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="报警记录" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-alarm">
          <div class="modal-layout">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline">
                <a-form-item label="名称">
                  {" "}
                  <a-input
                    value={keyword.value}
                    onUpdate:value={(v) => {
                      keyword.value = v;
                    }}
                  />
                </a-form-item>
                <a-form-item>
                  <a-button type="primary" size="small" onClick={getData} loading={loadingDataSource.value}>
                    {" "}
                    查询
                  </a-button>
                  <a-button size="small" style="margin-left: 15px" onClick={reset}>
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
              <a-spin spinning={loadingDataSource.value}>
                <div class="table_content">
                  {dataSource.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <NoData />
                    </div>
                  )}
                  {dataSource.map((item) => (
                    <div>
                      <div class="content">
                        <div> {item.projectNum}</div>
                        <div> {item.projectName}</div>
                        <div> {item.partyB || "--"}</div>
                        <div> {dayjs(item.completionTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                        <div> {item.depName}</div>
                        <div> {item.superviseUserName || "--"}</div>
                        <div> {statusText(item.status)}</div>
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

export default EngineeringInspectionModel;
