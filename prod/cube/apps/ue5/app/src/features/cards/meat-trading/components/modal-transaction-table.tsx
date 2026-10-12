import { defineComponent } from "vue";
import { onMounted, reactive, ref, watch } from "vue";
import { onBeforeUnmount } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { supplTradeRank } from "@/infrastructure/api/slide-tianjin";
import NoData from "@/shared-ui/panel/noData";

import styles from "./modal-transaction-table.module.less";

export const ModalTransactionTable = defineComponent({
  name: "ModalTransactionTable",
  props: {
    type: { type: String, required: false, default: "TODAY" },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    interface Props {
      type?: string;
      showModal: boolean;
    }

    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "WEEK" },
      { label: "近30天", value: "MONTH" },
      { label: "近1年", value: "YEAR" },
    ];

    const loading = ref(false);
    let timeType = ref<string>(props.type);

    const handleTimeTypeChange = () => {
      datainfo.pageNumber = 1;
      getData();
    };

    // 将小数转为整数显示
    const formatLinkRatio = (value: number): string => {
      if (value === null || value === undefined) return "0%";
      // 四舍五入取整数
      return `${Math.round(value)}%`;
    };

    const datainfo = reactive({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const show = ref(false);

    const table_header = ["排名", "商家名称", "联系方式", "交易重量（kg）", "环比"];

    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };

    const getData = async () => {
      try {
        loading.value = true;
        let data = await supplTradeRank({ type: timeType.value, pageNumber: datainfo.pageNumber, pageSize: datainfo.pageSize });
        dataSource.value = data.records;
        datainfo.total = data.total;
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      emit("close");
    };
    watch(
      () => props.showModal,
      () => {
        timeType.value = props.type;
        if (props.showModal) {
          datainfo.pageNumber = 1;
          getData();
        }
      },
    );

    onMounted(() => {
      window.addEventListener("keydown", handleEsc);
      getData();
    });

    // esc按键返回事件
    const handleEsc = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector(".alarmDetail-modal")) {
        show.value = false;
        return;
      }
    };
    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEsc);
    });

    return (): JSX.Element => (
      <>
        <Modal title="白条交易排名信息" show={props.showModal && !show.value} onClose={closeModal} wrapClassName="modal-table-device">
          <div class="modal-layout">
            <div class="table-top">
              <a-form ref="selectForm" model={datainfo} layout="inline">
                <a-radio-group
                  value={timeType.value}
                  onUpdate:value={(v) => {
                    timeType.value = v;
                  }}
                  onChange={handleTimeTypeChange}
                  class="time-type-buttons"
                >
                  {timeList.map((item) => (
                    <a-radio-button key={item.value} value={item.value}>
                      {" "}
                      {item.label}
                    </a-radio-button>
                  ))}
                </a-radio-group>
              </a-form>
            </div>
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.value.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <NoData />
                    </div>
                  )}
                  {dataSource.value.map((item, index) => (
                    <div>
                      <div class="content">
                        <div> {item.sort ?? index + 1}</div>
                        <div> {item.supplyName}</div>
                        <div> {item.supplierCode}</div>
                        <div> {item.tradeWeight}</div>
                        <div class="ratio">
                          <div class={["downtriangle", item.qoqTradeWeight > 0 && "uptriangle"]}></div>
                          <div class={[item.qoqTradeWeight > 0 ? "up" : "down"]}> {formatLinkRatio(item.qoqTradeWeight)}</div>
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

export default ModalTransactionTable;
