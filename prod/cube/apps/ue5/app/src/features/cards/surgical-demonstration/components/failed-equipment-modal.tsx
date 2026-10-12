import zhCN from "ant-design-vue/es/locale/zh_CN";
import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, reactive, ref } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { alarmStatisticsList } from "@/infrastructure/api/alarm";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./failed-equipment-modal.module.less";

export const FailedEquipmentModal = defineComponent({
  name: "FailedEquipmentModal",
  props: {
    parameter: { type: null, required: false, default: {} },
    title: { type: String, required: true, default: "" },
    showModal: { type: Boolean, required: true, default: false },
    alarmStatusEnum: { type: String, required: true, default: "" },
    date: { type: Array, required: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const statusOptions = ref([
      {
        value: "ALARM_UN_CONFIRMED",
        label: "待接收",
      },
      {
        value: "ALARM_PROGRESS_CONFIRMED",
        label: "处理中",
      },
      {
        value: "ALARM_SUSPEND",
        label: "已挂起",
      },
      {
        value: "ALARM_HANDLER",
        label: "已处理",
      },
    ]);
    const { globalState } = useStateStore();

    const columns = withPopoverColumns([
      {
        title: "序号",
        dataIndex: "index",
        key: "index",
        ellipsis: true,
        align: "center",
        width: 80,
      },
      {
        title: "设备编码",
        dataIndex: "alarmTargetCode",
        key: "alarmTargetCode",
        align: "center",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "设备名称",
        dataIndex: "alarmTargetName",
        align: "center",
        key: "alarmTargetName",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        key: "areaName",
        align: "center",
        ellipsis: true,
      },
      {
        title: "异常类型",
        dataIndex: "alarmTargetTypeName",
        key: "alarmTargetTypeName",
        align: "center",
        ellipsis: true,
      },
      {
        title: "异常上报时间",
        dataIndex: "alarmTime",
        key: "alarmTime",
        width: 180,
        align: "center",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
        },
      },
      {
        title: "当前状态",
        dataIndex: "alarmStatusName",
        key: "alarmStatusName",
        ellipsis: true,
      },
    ]);
    interface Props {
      parameter?: any;
      title: string;
      showModal: boolean;
      alarmStatusEnum: string;
      date?: string[];
    }
    const closeModal = () => {
      emit("close");
    };

    const loading = ref(false);
    const selectForm = ref();

    interface RowItem {
      id: string | number;
      time: string;
      code: string;
      name: string;
      typeName: string;
      status: string;
      area: string;
    }
    const dataSource = ref([]);

    const search = reactive<Record<string, any>>({
      ...props.parameter,
      alarmStatusEnum: props.alarmStatusEnum,
      date: props.date,
      keyword: "",
      area: "",
      typeName: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const onShowSizeChange = async (current, size) => {
      search.pageNumber = current;
      search.pageSize = size;
      search.date = "";
      await query();
    };
    const query = async () => {
      let params = {
        alarmStatus: search.alarmStatusEnum,
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        keyword: search.keyword,
        pageSize: search.pageSize,
        pageNumber: search.pageNumber,
        period: search.date
          ? `${moment(search.date[0]).format("YYYY-MM-DD 00:00:00")},${moment(search.date[1]).format("YYYY-MM-DD 23:59:59")}`
          : "",
      };
      let res: any = await alarmStatisticsList(params);
      search.total = res.total;
      res.records.forEach((item, index) => {
        item.index = index + 1;
      });
      dataSource.value = res.records;
    };
    const reset = () => {
      search.pageNumber = 1;
      search.alarmStatusEnum = props.alarmStatusEnum;
      search.date = props.date;
      search.keyword = "";
      query();
    };

    onMounted(() => {
      query();
    });

    return (): JSX.Element => (
      <>
        <Modal
          title={props.title}
          width={1040}
          modelValue={props.showModal}
          onUpdate:modelValue={(v) => {
            props.showModal = v;
          }}
          onClose={closeModal}
          wrapClassName="modal-table-device"
        >
          <template>
            <div class="modal-layout">
              <div class="table-top">
                <a-form ref="selectForm" model={search} layout="inline">
                  <a-form-item label="时间">
                    {" "}
                    <a-config-provider locale={zhCN}>
                      {" "}
                      <a-range-picker
                        value={search.date}
                        onUpdate:value={(v) => {
                          search.date = v;
                        }}
                        value-format="YYYY-MM-DD"
                      />
                    </a-config-provider>
                  </a-form-item>
                  <a-form-item label="状态">
                    <a-select
                      style="width: 100px"
                      value={search.alarmStatusEnum}
                      onUpdate:value={(v) => {
                        search.alarmStatusEnum = v;
                      }}
                    >
                      {statusOptions.map((item) => (
                        <a-select-option value={item.value}> {item.label}</a-select-option>
                      ))}
                    </a-select>
                  </a-form-item>
                  <a-form-item label="设备名称">
                    {" "}
                    <a-input
                      style="width: 150px"
                      value={search.keyword}
                      onUpdate:value={(v) => {
                        search.keyword = v;
                      }}
                    ></a-input>
                  </a-form-item>
                  <a-form-item>
                    <a-button type="primary" size="middle" loading={loading.value} onClick={query}>
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
                {" "}
                <a-table pagination={false} columns={columns} dataSource={dataSource.value}></a-table>
              </div>
              <div style="height: 30px">
                {" "}
                <a-pagination
                  style="float: right; margin-top: 15px"
                  current={search.pageNumber}
                  onUpdate:current={(v) => {
                    search.pageNumber = v;
                  }}
                  page-size={search.pageSize}
                  onUpdate:page-size={(v) => {
                    search.pageSize = v;
                  }}
                  onChange={onShowSizeChange}
                  total={search.total}
                />
              </div>
            </div>
          </template>
        </Modal>
      </>
    );
  },
});

export default FailedEquipmentModal;
