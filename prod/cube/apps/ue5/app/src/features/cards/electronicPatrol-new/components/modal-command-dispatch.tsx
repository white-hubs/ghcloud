import moment from "moment";
import { defineComponent } from "vue";
import { reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { electronTask, getPatrolTaskByTime } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";

import styles from "./modal-command-dispatch.module.less";

export const ModalCommandDispatch = defineComponent({
  name: "ModalCommandDispatch",
  props: {
    parameter: { type: null, required: false, default: {} },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      parameter?: any;
      showModal: boolean;
    }
    const loading = ref(false);
    const statusObj = {
      IN_EXECUTION: "执行中",
      TO_BE_RECEIVED: "待接收",
      FINISHED: "已结束",
    };
    const commandInfo = reactive({
      taskName: "",
      startTime: "",
      endTime: "",
      executeData: "",
      status: "",
      startDate: "",
      endDate: "",
      id: "",
      executePeriod: [],
    });
    const dataSource = ref([]);
    const table_header = ["巡更点", "所在区域", "巡更人员", "巡更时间", "巡更结果"];
    const getData = async () => {
      const PATROL_POINT_RES_ENUM = {
        ABNORMAL: "异常",
        NORMAL: "正常",
      };
      try {
        loading.value = true;
        const res = await electronTask({ ...props.parameter });
        Object.assign(commandInfo, res);
        commandInfo.startTime = moment(commandInfo.startDate).format("YYYY-MM-DD");
        commandInfo.endTime = moment(commandInfo.endDate).format("YYYY-MM-DD");
        const result = await getPatrolTaskByTime({ taskId: commandInfo.id, executePeriod: commandInfo.executePeriod[0] });
        dataSource.value = result.map((item) => {
          return {
            ...item,
            areaName: item.arae.map((item) => item.name).join("/"),
            patrolTime: item.patrolDate ? moment(item.patrolDate).format("YYYY-MM-DD HH:mm:ss") : "--",
            resulStatusName: item.patrolResult ? PATROL_POINT_RES_ENUM[item.patrolResult] : "--",
          };
        });
      } catch (error) {}
      loading.value = false;
    };

    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          dataSource.value = [];
          getData();
        }
      },
    );

    return (): JSX.Element => (
      <>
        <Modal title="任务详情" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-device">
          <div class="content-body">
            <div class="info-item-title">
              {" "}
              <div class="title-text"> 基本信息</div>
            </div>
            <div class="info-item-form">
              <div class="form-item">
                <div class="form-item-label"> 任务名称:</div>
                <div class="form-item-content"> {commandInfo?.taskName ?? "--"}</div>
              </div>
              <div class="form-item">
                <div class="form-item-label"> 任务时间:</div>
                <div class="form-item-content"> {commandInfo.startTime + "--" + commandInfo.endTime}</div>
              </div>
              <div class="form-item">
                <div class="form-item-label"> 巡更时段:</div>
                <div class="form-item-content"> {commandInfo?.executeData ?? "--"}</div>
              </div>
              <div class="form-item">
                <div class="form-item-label"> 状态:</div>
                <div class="form-item-content"> {statusObj[commandInfo?.status] || "--"}</div>
              </div>
            </div>
          </div>
          <div class="modal-layout">
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.value.length === 0 ? (
                    <div class="no-content">
                      <NoData />
                    </div>
                  ) : (
                    dataSource.value.map((item: Record<string, unknown>, index: number) => (
                      <div key={`${String(item.locationName ?? "row")}-${index}`}>
                        <div class="content">
                          <div>{String(item.locationName ?? "--")}</div>
                          <div>{String(item.areaName || "--")}</div>
                          <div>{String(item.userName || "--")}</div>
                          <div>{String(item.patrolTime || "--")}</div>
                          <div>{String(item.resulStatusName || "--")}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </a-spin>
            </div>
          </div>
        </Modal>
      </>
    );
  },
});

export default ModalCommandDispatch;
