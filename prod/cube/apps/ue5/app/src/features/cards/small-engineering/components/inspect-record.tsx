import dayjs from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import inspect from "./inspect-detail/index";
import {
  inspectAnalysisTaskRecordPage,
  inspectElectronMobileChargePage,
  inspectElectronMobileParkingPage,
  inspectElectronMobileParkingStat,
} from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";
import { storeArea } from "@/visualization-core/stores/area";

import styles from "./inspect-record.module.less";

export const InspectRecord = defineComponent({
  name: "InspectRecord",
  props: {
    parameter: { type: Object, required: true },
  },
  emits: ["close"],
  setup(props, ctx) {
    interface Props {
      parameter: Record<string, any>;
    }
    const time = ref(props.parameter.period);

    const datainfo = reactive<Record<string, unknown>>({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);
    const table_header = ["巡检对象", "所属巡检任务", "巡检时间", "巡检人", "巡检结果", "操作"];

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
      };
      let data = {
        records: [],
        total: 0,
      };
      if (props.parameter.title === "工程巡查异常记录") {
        data = await inspectAnalysisTaskRecordPage({ ...params, result: "ABNORMAL" });
      } else if (props.parameter.title === "电动车违规停放记录") {
        data = await inspectElectronMobileParkingPage(params);
      } else if (props.parameter.title === "电动车违规充电记录") {
        data = await inspectElectronMobileChargePage(params);
      }
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
      inspectParameter.value.id = record.id;
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
                      <div> {item.targetName || "--"}</div>
                      <div> {item.taskName || "临时巡检"}</div>
                      <div>{item.time ? dayjs(item.time).format("YYYY-MM-DD HH:mm") : "--"}</div>
                      <div> {item.nickname || "--"}</div>
                      <div class={item.result}>
                        {" "}
                        {item.result ? (item.result === "NORMAL" ? "正常" : item.result === "ABNORMAL" ? "异常" : "") : "--"}
                      </div>
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
        {detailModalShow && <inspect ref="inspectRef" onClose={closeModal} parameter={inspectParameter}></inspect>}
      </>
    );
  },
});

export default InspectRecord;
