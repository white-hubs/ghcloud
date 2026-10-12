import zhCN from "ant-design-vue/es/locale/zh_CN";
import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { visualizationEvent } from "@/infrastructure/api/door";
import { storeMenu } from "@/visualization-core/stores/menu";
import { useStateStore } from "@/visualization-core/stores/use-state-store";

import styles from "./trafficRecords.module.less";

export const TrafficRecords = defineComponent({
  name: "TrafficRecords",
  props: {
    parameter: { type: null, required: false, default: {} },
    title: { type: String, required: true, default: "" },
    showModal: { type: Boolean, required: true, default: false },
    eventResult: { type: String, required: true, default: "" },
    date: { type: Array, required: true },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const { globalState } = useStateStore();

    interface Props {
      parameter?: any;
      title: string;
      showModal: boolean;
      eventResult: string;
      date: string[];
    }
    const statusOptions = ref([
      { value: "DO_PASS", label: "正常" },
      { value: "DO_REFUSE", label: "异常" },
    ]);
    const columns = withPopoverColumns([
      {
        title: "时间",
        dataIndex: "eventTime",
        key: "eventTime",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
        },
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
        key: "doorName",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
        key: "eventWay",
        ellipsis: true,
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行结果",
        dataIndex: "eventResult",
        key: "eventResult",
        ellipsis: true,
        customRender: ({ text }) => {
          return text == "DO_PASS" ? "通过" : "拒绝";
        },
      },
    ]);
    const current = ref(1);
    const total = ref(0);
    const dataSource = ref([]);
    const search = reactive<Record<string, any>>({
      eventResult: props.eventResult,
      date: props.date,
      keyword: "",
      typeName: "",
      pageSize: 10,
      pageNumber: 1,
    });
    const closeModal = () => {
      emit("close");
    };
    const query = async (pageNumber?: number) => {
      if (pageNumber) {
        current.value = pageNumber;
      }
      let time = search.date ? search.date : [];
      let arr = time.map((item, index) => {
        if (index === 0) {
          item = moment(item).format("YYYY-MM-DD 00:00:00");
        } else {
          item = moment(item).format("YYYY-MM-DD 23:59:59");
        }
        return item;
      });
      let param = {
        sceneType: globalState.business.currentMenu,
        areaId: globalState.business.currentAreaId,
        eventResult: search.eventResult,
        keyword: search.keyword,
        period: arr ? arr.join(",") : "",
        pageNumber: current.value,
        pageSize: 10,
      };
      let res = await visualizationEvent(param);
      total.value = res.total;
      dataSource.value = res.records;
    };
    const reset = () => {
      search.eventResult = "DO_PASS";
      search.keyword = "";
      search.date = props.date;
      query();
    };
    onMounted(() => {
      query();
    });

    return (): JSX.Element => (
      <>
        <Modal
          title="通行记录"
          width={1200}
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
                  <a-form-item label="通行结果">
                    <a-select
                      style="width: 100px"
                      value={search.eventResult}
                      onUpdate:value={(v) => {
                        search.eventResult = v;
                      }}
                    >
                      {statusOptions.map((item) => (
                        <a-select-option value={item.value}> {item.label}</a-select-option>
                      ))}
                    </a-select>
                  </a-form-item>
                  <a-form-item label="门禁名称">
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
                    <a-button
                      type="primary"
                      size="middle"
                      onClick={() => {
                        query(1);
                      }}
                    >
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
              <div class="room-home-bottom">
                <a-table pagination={false} columns={columns} dataSource={dataSource.value}></a-table>
                <a-pagination
                  style="text-align: right;margin-top: 10px;"
                  onChange={query}
                  current={current.value}
                  onUpdate:current={(v) => {
                    current.value = v;
                  }}
                  total={total.value}
                />
              </div>
            </div>
          </template>
        </Modal>
      </>
    );
  },
});

export default TrafficRecords;
