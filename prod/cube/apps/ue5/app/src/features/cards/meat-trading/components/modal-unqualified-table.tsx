import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import { defineComponent } from "vue";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { onBeforeUnmount } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { MeatTradeRankVO } from "@/infrastructure/api/models/slide";
import { meatTradeTestingPage } from "@/infrastructure/api/slide-tianjin";
import NoData from "@/shared-ui/panel/noData";

import styles from "./modal-unqualified-table.module.less";

export const ModalUnqualifiedTable = defineComponent({
  name: "ModalUnqualifiedTable",
  props: {
    itemData: {
      type: null,
      required: true,
      default: () => ({
        id: "",
        timeRange: "",
        startDate: "",
        endDate: "",
        meatTestingItem: "",
        meatTestingItemCode: "",
        meatTestingItemName: "",
        totalCheckNumSum: 0,
        totalSum: 0,
        notPassSum: 0,
        prevTotalCheckNumSum: 0,
        prevTotalSum: 0,
        prevNotPassSum: 0,
        checkNumSumRate: 0,
        totalSumRate: 0,
        notPassSumRate: 0,
      }),
    },
    timeType: { type: String, required: false, default: "TODAY" },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit }) {
    // 定义数据项的接口
    interface UnqualifiedItem {
      id: string;
      supplierId: string;
      supplierName: string;
      porkReportCode: string;
      checkResult: string;
      inspectorName: string;
    }

    interface Props {
      itemData: MeatTradeRankVO;
      timeType: string;
      showModal: boolean;
    }

    const loading = ref<boolean>(false);
    const timeList = [
      { label: "今日", value: "TODAY" },
      { label: "近7天", value: "THIS_WEEK" },
      { label: "近30天", value: "THIS_MONTH" },
      { label: "近1年", value: "THIS_YEAR" },
    ];

    const table_header = computed((): string[] => ["商家名称", "商家编号", "批次号", props.itemData.meatTestingItemName, "登记员"]);

    const timeTitle = computed((): string => {
      const time = timeList.find((item) => item.value === props.timeType);
      return time?.label || "今日";
    });

    const currentTimeTitle = computed((): string => {
      if (props.timeType === "TODAY") {
        return `${dayjs().subtract(1, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_WEEK") {
        return `${dayjs().subtract(7, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_MONTH") {
        return `${dayjs().subtract(30, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_YEAR") {
        return `${dayjs().subtract(365, "day").format("YYYY-MM-DD")} - ${dayjs().format("YYYY-MM-DD")}`;
      }
      return "";
    });

    const lastTimeTitle = computed((): string => {
      if (props.timeType === "TODAY") {
        return `${dayjs().subtract(2, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(1, "day").format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_WEEK") {
        return `${dayjs().subtract(15, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(8, "day").format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_MONTH") {
        return `${dayjs().subtract(61, "month").format("YYYY-MM-DD")} - ${dayjs().subtract(31, "day").format("YYYY-MM-DD")}`;
      } else if (props.timeType === "THIS_YEAR") {
        return `${dayjs().subtract(731, "day").format("YYYY-MM-DD")} - ${dayjs().subtract(366, "day").format("YYYY-MM-DD")}`;
      }
      return "";
    });

    const period = computed((): string => {
      if (props.timeType === "TODAY") {
        return `${dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;
      } else if (props.timeType === "THIS_WEEK") {
        return `${dayjs().subtract(7, "day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;
      } else if (props.timeType === "THIS_MONTH") {
        return `${dayjs().subtract(30, "day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;
      } else if (props.timeType === "THIS_YEAR") {
        return `${dayjs().subtract(365, "day").format("YYYY-MM-DD HH:mm:ss")},${dayjs().format("YYYY-MM-DD HH:mm:ss")}`;
      }
      return "";
    });

    const datainfo = reactive({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref<UnqualifiedItem[]>([]);
    const show = ref<boolean>(false);

    const onShowSizeChange = (current: number, size: number): void => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };

    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const data = await meatTradeTestingPage({
          itemCode: props.itemData.meatTestingItemCode,
          type: props.timeType,
          period: period.value,
          pageNumber: datainfo.pageNumber,
          pageSize: datainfo.pageSize,
        });
        dataSource.value = data.records;
        datainfo.total = data.total;
      } catch (error) {
      } finally {
        loading.value = false;
      }
    };

    const closeModal = (): void => {
      emit("close");
    };

    watch(
      () => props.showModal,
      () => {
        if (props.showModal) {
          datainfo.pageNumber = 1;
          getData();
        }
      },
    );

    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      if (document.querySelector(".alarmDetail-modal")) {
        show.value = false;
        return;
      }
    };

    onMounted(() => {
      window.addEventListener("keydown", handleEsc);
      getData();
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEsc);
    });

    return (): JSX.Element => (
      <>
        <Modal
          title={props.itemData.meatTestingItemName}
          show={props.showModal && !show.value}
          onClose={closeModal}
          wrapClassName="modal-table-device"
        >
          <div class="modal-layout">
            <div class="table-top">
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-label">
                    {timeTitle.value}
                    {props.itemData.meatTestingItemName}
                    检测不合格数：
                  </span>
                  <span class="stat-value unqualified">{props.itemData.notPassSum}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label"> 总批次数：</span>
                  <span class="stat-value total">{props.itemData.totalSum}</span>
                </div>
                <div class="stat-item ratio-item">
                  <span class="ratio-label"> 环比</span>
                  {props.itemData.notPassSum >= 0 && <caret-up-outlined class="ratio-icon up" />}
                  <caret-down-outlined class="ratio-icon down" />
                  <span class={props.itemData.notPassSum >= 0 ? "ratio-value up" : "ratio-value down"}>{props.itemData.notPassSum}%</span>
                </div>
              </div>
              <div class="time-display">
                <div class="time-range-info">
                  {currentTimeTitle.value}
                  vs
                  {lastTimeTitle.value}
                </div>
              </div>
            </div>
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div key={item}> {item}</div>
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
                  {dataSource.value.map((item) => (
                    <div key={item.id}>
                      <div class="content">
                        <div> {item.supplierName}</div>
                        <div> {item.supplierId}</div>
                        <div> {item.porkReportCode}</div>
                        <div> {item.checkResult}</div>
                        <div> {item.inspectorName}</div>
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

export default ModalUnqualifiedTable;
