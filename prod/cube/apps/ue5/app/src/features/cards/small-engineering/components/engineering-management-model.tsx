import dayjs, { Dayjs } from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { cubeSmallEngineeringService } from "@/infrastructure/api/service";
import noData from "@/shared-ui/panel/noData";

import styles from "./engineering-management-model.module.less";

export const EngineeringManagementModel = defineComponent({
  name: "EngineeringManagementModel",
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
      /** 异常数 */
      ABNORMAL = "ABNORMAL",
    }

    const selectForm = ref();
    const time = ref<Dayjs[]>(
      props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [],
    );
    const keyword = ref("");
    const queryScoped = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);
    const statusOptions = [
      {
        label: "全部",
        value: "ALL",
      },
      {
        label: "异常",
        value: "ABNORMAL",
      },
      {
        label: "进行中",
        value: "UNDERWAY",
      },
      {
        label: "待验收",
        value: "WAIT_ACCEPT",
      },
      {
        label: "已完成",
        value: "COMPLETED",
      },
    ];
    const all_table_header = ["小散工程名称", "工程时间", "施工方", "工程阶段"];
    const table_header = ["小散工程名称", "乙方", "完成时限", "监管部门", "监管负责人", "工程阶段"];
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
        case QueryScoped.ABNORMAL:
          return "异常数";
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
      try {
        if (queryScoped.value === "ALL") {
          const res = await cubeSmallEngineeringService.getProjectNodeList({
            pageNumber: datainfo.pageNumber,
            pageSize: datainfo.pageSize,
            keyword: datainfo.keyword || undefined,
            period: datainfo.period,
          });
          dataSource.value = res.records;
          datainfo.total = res.total;
        } else {
          const res = await cubeSmallEngineeringService.projectScheduleList({
            pageNumber: datainfo.pageNumber,
            pageSize: datainfo.pageSize,
            status: queryScoped.value,
            keyword: datainfo.keyword || undefined,
            period: datainfo.period,
          });
          dataSource.value = res.records;
          datainfo.total = res.total;
        }
      } catch (error) {}

      loadingDataSource.value = false;
    };

    const reset = () => {
      datainfo.pageNumber = 1;
      time.value = props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [];
      queryScoped.value = props.parameter.queryScoped;
      keyword.value = "";
      getData();
    };
    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          datainfo.pageNumber = 1;
          queryScoped.value = props.parameter.queryScoped;
          time.value =
            props.parameter.dateRange?.length > 1 ? [dayjs(props.parameter.dateRange[0]), dayjs(props.parameter.dateRange[1])] : [];
          getData();
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="小散工程统计" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-alarm">
          <div class="modal-layout">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline">
                <a-form-item label="名称">
                  {" "}
                  <a-input
                    placeholder="请输入名称"
                    value={keyword.value}
                    onUpdate:value={(v) => {
                      keyword.value = v;
                    }}
                  />
                </a-form-item>
                <a-form-item label="工程状态">
                  <a-select
                    onChange={getData}
                    style="width: 100px"
                    value={queryScoped.value}
                    onUpdate:value={(v) => {
                      queryScoped.value = v;
                    }}
                  >
                    {statusOptions.map((item) => (
                      <a-select-option value={item.value}> {item.label}</a-select-option>
                    ))}
                  </a-select>
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
              {queryScoped === "ALL" && (
                <div class="table_header">
                  {all_table_header.map((item) => (
                    <div> {item}</div>
                  ))}
                </div>
              )}
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
                      <noData />
                    </div>
                  )}
                  {queryScoped === "ALL" ? (
                    <template>
                      {dataSource.map((item) => (
                        <div>
                          <div class="content">
                            <div> {item.projectName}</div>
                            <div> {dayjs(item.completionTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                            <div> {item.partyB || "--"}</div>
                            <div> {statusText(item.status)}</div>
                          </div>
                        </div>
                      ))}
                    </template>
                  ) : null}
                  <template>
                    {dataSource.map((item) => (
                      <div>
                        <div class="content">
                          <div> {item.projectName}</div>
                          <div> {item.partyB || "--"}</div>
                          <div> {dayjs(item.completionTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                          <div> {item.depName}</div>
                          <div> {item.superviseUserName || "--"}</div>
                          <div> {statusText(item.statusCode)}</div>
                        </div>
                      </div>
                    ))}
                  </template>
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

export default EngineeringManagementModel;
