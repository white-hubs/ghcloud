import dayjs from "dayjs";
import { defineComponent } from "vue";
import { reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { playRecordPage } from "@/infrastructure/api/broadcast";
import NoData from "@/shared-ui/panel/noData";

import styles from "./modal-broadcast-table.module.less";

export const ModalBroadcastTable = defineComponent({
  name: "ModalBroadcastTable",
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
    const table_header = ["广播时间", "模板名称", "广播内容", "广播次数", "广播终端", "操作人"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      try {
        loading.value = true;
        const res = await playRecordPage({ ...datainfo, ...props.parameter });
        dataSource.value = res.records;
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
        <Modal title="广播记录" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-device">
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
                        <div> {item.broadcastTime ? dayjs(item.broadcastTime).format("YYYY-MM-DD") : "--"}</div>
                        <div> {item.broadcastTemplateName}</div>
                        <div> {item.broadcastPlayContent || "--"}</div>
                        <div> {item.broadcastPlayNum || "--"}</div>
                        <div> {item.broadcastPlayDevices || "--"}</div>
                        <div> {item.operatorByName || "--"}</div>
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

export default ModalBroadcastTable;
