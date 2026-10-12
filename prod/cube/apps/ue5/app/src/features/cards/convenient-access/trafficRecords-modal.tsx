import zhCN from "ant-design-vue/es/locale/zh_CN";
import moment from "moment";
import { defineComponent } from "vue";
import { ref, reactive, onMounted, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal-layout";
import { withPopoverColumns } from "@/features/equipment/modal-table/render-popover-text";
import { getDoorEventRecord, passedNumByDay, visualizationEvent } from "@/infrastructure/api/door";

import styles from "./trafficRecords-modal.module.less";

export const TrafficRecordsModal = defineComponent({
  name: "TrafficRecordsModal",
  props: {
    showModal: { type: Boolean, required: true, default: false },
    params: { type: null, required: true, default: {} },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      showModal: boolean;
      params: any;
    }
    const passingPersonnel = ref(0);
    const statusOptions = [
      {
        value: "DO_PASS",
        label: "通过",
      },
      {
        value: "DO_REFUSE",
        label: "拒绝",
      },
    ];
    const columns = withPopoverColumns([
      {
        title: "时间",
        dataIndex: "eventTime",
        key: "eventTime",
        ellipsis: true,
        align: "center",
        width: 160,
        customRender: ({ text }) => {
          return text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--";
        },
      },
      {
        title: "门禁名称",
        dataIndex: "doorName",
        key: "doorName",
        ellipsis: true,
        align: "center",
        width: 160,
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行人员",
        dataIndex: "personName",
        key: "personName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行方式",
        dataIndex: "eventWay",
        key: "eventWay",
        ellipsis: true,
        align: "center",
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行事件",
        dataIndex: "eventName",
        key: "eventName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }) => {
          return text ? text : "--";
        },
      },
      {
        title: "通行结果",
        dataIndex: "eventResult",
        key: "eventResult",
        ellipsis: true,
        align: "center",
        customRender: ({ text }) => {
          return text == "DO_PASS" ? "通过" : "拒绝";
        },
      },
    ]);
    const current = ref(1);
    const total = ref(0);
    const dataSource = ref([]);
    const search = reactive<Record<string, any>>({
      date: [],
      eventResult: "",
      keyword: "",
      typeName: "",
      pageSize: 10,
      pageNumber: 1,
    });
    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          search.date = props.params.date ? props.params.date : [];
          search.eventResult = props.params.eventResult;
          query();
        }
      },
    );
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
        keyword: search.keyword,
        period: arr ? arr.join(",") : "",
        pageNumber: current.value,
        eventResult: search.eventResult,
        pageSize: 10,
      };
      let res = await getDoorEventRecord(param);
      passingPersonnel.value = await passedNumByDay({
        period: arr ? arr.join(",") : "",
        keyword: search.keyword,
        eventResult: search.eventResult,
      });
      total.value = res.total;
      dataSource.value = res.records;
    };
    const reset = () => {
      search.keyword = "";
      search.eventResult = "";
      search.date = [];
      ((search.pageSize = 10), (search.pageNumber = 1), query());
    };

    return (): JSX.Element => (
      <>
        <Modal
          title="通行记录"
          width={1000}
          modelValue={props.showModal}
          onUpdate:modelValue={(v) => {
            props.showModal = v;
          }}
          onClose={closeModal}
          wrapClassName="traffic-records-modal"
        >
          <template>
            <div class="modal-layout">
              <div class="table-top">
                <a-form ref="selectForm" model={search} layout="inline">
                  <a-form-item label="时间">
                    <a-config-provider locale={zhCN}>
                      <a-range-picker
                        value={search.date}
                        onUpdate:value={(v) => {
                          search.date = v;
                        }}
                        value-format="YYYY-MM-DD"
                        getPopupContainer={() => document.body}
                        popupClassName="visual-data-modal-dropdown"
                        dropdownClassName="visual-data-modal-dropdown"
                      />
                    </a-config-provider>
                  </a-form-item>
                  <a-form-item label="门禁名称">
                    <a-input
                      style="width: 150px"
                      value={search.keyword}
                      onUpdate:value={(v) => {
                        search.keyword = v;
                      }}
                    />
                  </a-form-item>
                  <a-form-item label="通行结果">
                    <a-select
                      style="width: 100px"
                      value={search.eventResult}
                      onUpdate:value={(v) => {
                        search.eventResult = v;
                      }}
                      getPopupContainer={() => document.body}
                      popupClassName="visual-data-modal-dropdown"
                      dropdownClassName="visual-data-modal-dropdown"
                    >
                      {statusOptions.map((item) => (
                        <a-select-option value={item.value}>{item.label}</a-select-option>
                      ))}
                    </a-select>
                  </a-form-item>
                  <a-form-item>
                    <a-button type="primary" size="middle" onClick={query(1)}>
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
              <div class="table-staff">
                通行人员：
                {passingPersonnel.value}名
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

export default TrafficRecordsModal;
