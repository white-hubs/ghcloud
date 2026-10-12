import zhCN from "ant-design-vue/es/locale/zh_CN";
import dayjs, { Dayjs } from "dayjs";
import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";

import { alarmPage } from "@/infrastructure/api/maintain";
import { organizationsList } from "@/infrastructure/api/ouaa";
import { looseWorksList } from "@/infrastructure/api/safety-management";
import enumerateData from "@/infrastructure/utils/enumeratie";
import NoData from "@/shared-ui/panel/noData";

import styles from "./abnormal-equipment.module.less";

export const AbnormalEquipment = defineComponent({
  name: "AbnormalEquipment",
  emits: ["close"],
  setup(_props, ctx) {
    const { alarmLeaveOptions, alarmStatusOptions } = enumerateData();

    const entry = ref(window.config.entry);
    const selectForm = ref();
    const dataInfo = reactive<Record<string, any>>({
      pageSize: 10,
      pageNumber: 1,
      keyword: "",
      total: 0,
    });

    const dataSource = ref([]);
    const loadingDataSource = ref(false);
    const departmentData = ref([]);
    const table_header = ["序号", "设备编码", "设备名称", "所属区域", "异常类型", "异常上报时间"];

    const onShowSizeChange = (current, size) => {
      dataInfo.pageNumber = current;
      dataInfo.pageSize = size;
      getData();
    };

    const getlist = async () => {
      const data = await alarmPage(dataInfo);
      dataSource.value = data.records;
      dataInfo.total = data.total;
    };
    const getData = async () => {
      loadingDataSource.value = true;
      getlist();
      loadingDataSource.value = false;
    };
    const query = () => {
      getData();
    };
    const reset = () => {
      Object.assign(dataInfo, {
        keyword: "",
        pageSize: 10,
        pageNumber: 1,
      });
      getData();
    };
    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      getData();
    });

    return (): JSX.Element => (
      <>
        <div class="modal-layout">
          <div class="table-top">
            <a-form ref="selectForm" model={dataInfo} layout="inline">
              <a-form-item>
                {" "}
                <a-input
                  value={dataInfo.keyword}
                  onUpdate:value={(v) => {
                    dataInfo.keyword = v;
                  }}
                  placeholder="设备名称"
                />
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
                      <div> {item.alarmContent}</div>
                      <div> {item.alarmTime}</div>
                      <div> {item.alarmPoint}</div>
                      <div> {item.patrolRecordId}</div>
                      <div> {item.alarmResult}</div>
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
              current={dataInfo.pageNumber}
              onUpdate:current={(v) => {
                dataInfo.pageNumber = v;
              }}
              page-size={dataInfo.pageSize}
              onUpdate:page-size={(v) => {
                dataInfo.pageSize = v;
              }}
              onChange={onShowSizeChange}
              total={dataInfo.total}
            />
          </div>
        </div>
      </>
    );
  },
});

export default AbnormalEquipment;
