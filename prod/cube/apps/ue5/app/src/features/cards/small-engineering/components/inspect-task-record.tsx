import dayjs from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import inspectTaskDetail from "./inspect-detail/inspect-task-detail";
import {
  inspectAnalysisTaskExecuteUser,
  inspectAnalysisTaskRecordPage,
  inspectElectronMobileChargePage,
  inspectElectronMobileParkingPage,
  inspectElectronMobileParkingStat,
} from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";

import styles from "./inspect-task-record.module.less";

export const InspectTaskRecord = defineComponent({
  name: "InspectTaskRecord",
  props: {
    parameter: { type: Object, required: true },
  },
  emits: ["close"],
  setup(props, ctx) {
    interface Props {
      parameter: Record<string, any>;
    }
    const resultType = {
      ABNORMAL: "异常",
      NORMAL: "正常",
    };
    const taskStatus = {
      SPLIT: "待拆解",
      ACCEPT: "待接收",
      EXECUTING: "进行中",
      OVER: "已完成",
      EXPIRE: "已过期",
      STOP: "已终止",
      CONFIRM: "待确认",
      OVERTIME: "超时完成",
    };
    const time = ref(props.parameter.period);

    const datainfo = reactive<Record<string, unknown>>({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);
    const table_header = ["任务名称", "巡检类型", "执行人", "进度", "巡检对象数", "状态", "结果", "操作"];

    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };

    const getList = async () => {
      if (Array.isArray(datainfo.period)) datainfo.period = datainfo.period.join(",");
      const params = {
        period: datainfo.period,
        pageSize: datainfo.pageSize,
        pageNumber: datainfo.pageNumber,
        businessType: props.parameter.businessType,
        result: props.parameter.result,
      };

      const data = await inspectAnalysisTaskExecuteUser(params);
      dataSource.value = data.records;
      datainfo.total = data.total;
      loadingDataSource.value = false;
    };
    const getData = async () => {
      loadingDataSource.value = true;
      if (time.value?.length) {
        datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
      }
      getList();
    };

    const detailModalShow = ref<boolean>(false);
    const inspectParameter = ref<Record<string, any>>({
      id: "",
      businessType: "",
    });
    const clickRow = (record) => {
      document.querySelector(".ant-modal-content").style.opacity = "0";
      inspectParameter.value.businessType = props.parameter.businessType;
      inspectParameter.value.id = record.taskId;
      detailModalShow.value = true;
    };
    const inspectRef = ref();
    const closeModal = () => {
      document.querySelector(".ant-modal-content").style.opacity = "1";
      detailModalShow.value = false;
    };
    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <>
        <div class="modal-layout">
          <div style="margin-top: 15px; height: 420px; overflow-y: auto">
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
                {dataSource.map((item, index) => (
                  <div>
                    <div class="content">
                      <div> {item.taskName || "--"}</div>
                      <div> {item.typeName || "--"}</div>
                      <div> {item.taskExecuteUser || "--"}</div>
                      <div> {item.recordCompletionRate}</div>
                      <div> {item.targetNum || "--"}</div>
                      <div> {taskStatus[item?.status] || "--"}</div>
                      <div> {resultType[item?.result] || "--"}</div>
                      <div>
                        {" "}
                        <a style="color: #5eacff;" onClick={clickRow(item)}>
                          {" "}
                          详情
                        </a>
                      </div>
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
              show-size-changer
              page-size={datainfo.pageSize}
              onUpdate:page-size={(v) => {
                datainfo.pageSize = v;
              }}
              onChange={onShowSizeChange}
              total={datainfo.total}
              show-total={(total) => `共 ${total} 条`}
            />
          </div>
        </div>
        {detailModalShow && <inspect-task-detail ref="inspectRef" onClose={closeModal} parameter={inspectParameter}></inspect-task-detail>}
      </>
    );
  },
});

export default InspectTaskRecord;
