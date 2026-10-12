import { TableColumnType, message } from "ant-design-vue";
import dayjs, { Dayjs } from "dayjs";
import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import { UeClient } from "@ghcloud/cube-visual-sdk";

import { alarmStatisticsList, alarmrecords, satalarmlevels } from "@/infrastructure/api/alarm";
import bus from "@/infrastructure/utils/bus";
import enumerateData from "@/infrastructure/utils/enumeratie";
import NoData from "@/shared-ui/panel/noData";

import styles from "./monitoring-content.module.less";

export const MonitoringContent = defineComponent({
  name: "MonitoringContent",
  emits: ["close"],
  setup(_props, ctx) {
    const ueClient = UeClient.getInstance();

    const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();
    interface Props {}
    const entry = ref(window.config.entry);

    const selectForm = ref();
    const time = ref<Dayjs[]>();
    const keyword = ref("");
    const datainfo = reactive<Record<string, any>>({
      period: "",
      alarmLevelId: "",
      alarmStatus: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);
    // 解析表单插槽名
    const formSlot = (item) => {
      return item.slotName ? item.slotName : "noSlot";
    };
    const alarmDetailData = ref({});
    const show = ref(false);
    const detiles = (item) => {
      // bus.emit("openAlarmModal", item);
      alarmDetailData.value = item;
      show.value = true;
    };
    const level = ref([]);
    const table_header = ["标题", "所属区域", "所属设备", "发布时间", "截止时间", "播放时长", "循环次数"];
    const alarmHandleEnumerate = [
      {
        label: "负一楼",
        value: "",
      },
      {
        label: "一楼",
        value: "ALARM_UN_CONFIRMED",
      },
      {
        label: "二楼",
        value: "ALARM_PROGRESS_CONFIRMED",
      },
      {
        label: "三楼",
        value: "ALARM_SUSPEND",
      },
      {
        label: "四楼",
        value: "ALARM_HANDLER",
      },
    ];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getTableData = async () => {
      let leveldata = await satalarmlevels();

      level.value = leveldata;
      level.value.unshift({
        name: "所有",
        id: "",
      });
    };
    const getData = async () => {
      loadingDataSource.value = true;
      if (time.value?.length) {
        datainfo.period = dayjs(time.value[0]).format("YYYY-MM-DD 00:00:00") + "," + dayjs(time.value[1]).format("YYYY-MM-DD 23:59:59");
      } else {
        datainfo.period = "";
      }

      loadingDataSource.value = false;
    };
    const query = () => {
      getData();
    };
    const reset = () => {
      time.value = [];
      keyword.value = "";
      Object.assign(datainfo, {
        period: "",
        alarmLevelId: "",
        alarmStatus: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
      getData();
    };
    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      getTableData();
    });

    return (): JSX.Element => (
      <>
        <div class="modal-layout">
          <div class="table-top">
            <a-form ref="selectForm" model={datainfo} layout="inline">
              <a-form-item label="设备">
                {" "}
                <a-input
                  value={keyword.value}
                  onUpdate:value={(v) => {
                    keyword.value = v;
                  }}
                />
              </a-form-item>
              <a-form-item label="区域" class="handle-status-select">
                <a-select
                  value={datainfo.alarmStatus}
                  onUpdate:value={(v) => {
                    datainfo.alarmStatus = v;
                  }}
                >
                  {alarmHandleEnumerate.map((item) => (
                    <a-select-option value={item.value}> {item.label}</a-select-option>
                  ))}
                </a-select>
              </a-form-item>
              <a-form-item>
                <a-button type="primary" size="small" onClick={query} loading={loadingDataSource.value}>
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
                {dataSource.map((item, index) => (
                  <div>
                    <div class="content">
                      <div> {index + 1}</div>
                      <div> {item.name}</div>
                      <div> {item.market}</div>
                      <div style> {item.type}</div>
                      <div> {item.date}</div>
                      <div> {item.time}</div>
                      <div style={item.status == "在用" ? "color:blue" : "color:green"}> {item.status}</div>
                      <div> {item.manger}</div>
                      <div> {item.area}</div>
                      <div> {item.user}</div>
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
      </>
    );
  },
});

export default MonitoringContent;
