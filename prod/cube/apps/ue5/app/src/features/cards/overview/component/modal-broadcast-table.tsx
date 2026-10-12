import dayjs from "dayjs";
import { defineComponent } from "vue";
import { reactive, ref, watch } from "vue";

import Modal from "@/features/equipment/modal-table/modal";
import { getPropertyDetailedPage } from "@/infrastructure/api/attendance";
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
    // import { playRecordPage } from '@/infrastructure/api/broadcast'

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
      typeId: "",
    });

    const dataSource = ref([]);
    const table_header = ["资产名称", "资产类别", "原值", "资产状态", "财务编码", "使用部门"];
    const onShowSizeChange = (current, size) => {
      datainfo.pageNumber = current;
      datainfo.pageSize = size;
      getData();
    };
    const getData = async () => {
      try {
        loading.value = true;
        const res = await getPropertyDetailedPage({ ...datainfo, ...props.parameter });
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
        <Modal title="资产列表" show={props.showModal} onClose={closeModal} wrapClassName="modal-table-device">
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
                        <div> {item.name}</div>
                        <div> {item.typeName || "--"}</div>
                        <div> {item.priceTotal || "--"}</div>
                        <div> {item.statusName || "--"}</div>
                        <div> {item.financeNumber || "--"}</div>
                        <div> {item.financeNumber || "--"}</div>
                        <div> {item.receiveDepName || "--"}</div>
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
