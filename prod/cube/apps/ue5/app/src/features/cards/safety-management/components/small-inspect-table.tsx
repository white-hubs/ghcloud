import dayjs from "dayjs";
import { defineComponent } from "vue";
import { reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { renderPopoverText } from "@/features/equipment/modal-table/render-popover-text";
import { inspectTaskPageV2 } from "@/infrastructure/api/maintain";
import NoData from "@/shared-ui/panel/noData";

import styles from "./small-inspect-table.module.less";

export const SmallInspectTable = defineComponent({
  name: "SmallInspectTable",
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
    const datainfo = reactive({
      keyword: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const dataSource = ref([]);
    const table_header = ["任务名称", "巡检类型	", "任务类型", "任务级别", "执行人", "发布人", "发布时间", "状态"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      try {
        loading.value = true;
        const res = await inspectTaskPageV2({ ...datainfo, ...props.parameter });
        const statusObj = {
          EXECUTING: "待巡检",
          OVER: "已完成",
          EXPIRE: "已过期",
          STOP: "已终止",
          CONFIRM: "待确认",
          SPLIT: "待拆解",
          ACCEPT: "待接收",
        };
        dataSource.value = res.records.map((item) => {
          return {
            ...item,
            status: statusObj[item.status],
          };
        });
        datainfo.total = res.total;
      } catch (error) {}
      loading.value = false;
    };

    const closeModal = () => {
      Object.assign(datainfo, {
        keyword: "",
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      });
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
        <Modal title="巡检任务" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-device">
          <div class="modal-layout">
            <div style="margin-top: 15px">
              <div class="table_header">
                {table_header.map((item) => (
                  <div> {item}</div>
                ))}
              </div>
              <a-spin spinning={loading.value}>
                <div class="table_content">
                  {dataSource.length === 0 && (
                    <div class="no-content">
                      {" "}
                      <NoData />
                    </div>
                  )}
                  {dataSource.map((item) => (
                    <div>
                      <div class="content">
                        <div>{renderPopoverText(item.name)}</div>
                        <div>{renderPopoverText(item.typeName || "--")}</div>
                        <div>{renderPopoverText(item.isCheck ? "稽查" : "普通")}</div>
                        <div>{renderPopoverText(item.level === "GENERAL" ? "普通" : "紧急")}</div>
                        <div>{renderPopoverText(item.receiveNames || "--")}</div>
                        <div>{renderPopoverText(item.publisherName || "--")}</div>
                        <div>{renderPopoverText(item.createTime ? dayjs(item.createTime).format("YYYY-MM-DD") : "--")}</div>
                        <div>{renderPopoverText(item.status || "--")}</div>
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

export default SmallInspectTable;
