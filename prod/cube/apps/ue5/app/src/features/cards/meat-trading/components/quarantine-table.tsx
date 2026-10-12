import { Pagination } from "ant-design-vue";
import type { TableColumnType } from "ant-design-vue";
import { Tabs, TabPane, Table } from "ant-design-vue";
import moment from "moment";
import { defineComponent } from "vue";
import { onMounted, ref, watch } from "vue";

import tableData from "./tableData";
import Modal from "@/features/equipment/modal-table/modal";
import { pratiqueregister, statdate } from "@/infrastructure/api/slide";
import { setTimeType } from "@/infrastructure/utils/common";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./quarantine-table.module.less";

export const QuarantineTable = defineComponent({
  name: "QuarantineTable",
  props: {
    title: { type: String, required: true, default: "报警记录" },
    total: { type: Number, required: true },
    type: { type: null, required: true },
    seven: { type: Number, required: true },
    showModal: { type: Boolean, required: true, default: false },
  },
  emits: ["close"],
  setup(props, { emit, expose }) {
    const UE5_MEAT_IMG = "/resource/v1/ue5-migrate/components/businessPanel/meat-trading/img";
    const qua_blue = `${UE5_MEAT_IMG}/qwa_blue.png`;
    const qua_yellow = `${UE5_MEAT_IMG}/qua_yellow.png`;

    interface Props {
      title: string;
      total: number;
      type: ModelValueItf;
      seven: number;
      showModal: boolean;
    }
    const activeKey = ref(0);
    const dataSource = ref([
      {
        name: "成农批",
      },
    ]);
    const columns = ref<TableColumnType[]>([
      {
        title: "商家名称",
        dataIndex: "supplierName",
        sorter: true,
      },
      {
        title: "批次号",
        dataIndex: "porkReportCode",
        sorter: true,
      },
      {
        title: "理货片数",
        dataIndex: "slices",
        sorter: true,
      },
      {
        title: "检疫票数",
        dataIndex: "pratiqueTickets",
        sorter: true,
      },

      {
        title: "品类名称",
        dataIndex: "goodsCategoryName",
        sorter: true,
      },
      {
        title: "登记员",
        dataIndex: "registerName",
        sorter: true,
      },
    ]);
    const tablparams = ref({
      period: "",
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const tabslist = ref([]);
    const getTime = async () => {
      let data = await statdate({ type: setTimeType(props.type) });

      tabslist.value = [
        {
          key: 0,
          time: formaterTime(data.currentDate.begin) + "," + formaterTime(data.currentDate.end),
        },
        {
          key: 1,
          time: formaterTime(data.lastDate.begin) + "," + formaterTime(data.lastDate.end),
        },
      ];
      tablparams.value.period = formaterTime(data.currentDate.begin) + "," + formaterTime(data.currentDate.end);
      getlist();
      // props.requestData(selectForm.value.onSubmit())
    };
    const onShowSizeChange = (current: number, pageSize: number) => {
      tablparams.value.pageSize = pageSize;
      tablparams.value.pageNumber = current;
      getlist();
    };
    const getlist = async () => {
      const pratiqueregisterdata = await pratiqueregister(tablparams.value);
      dataSource.value = pratiqueregisterdata.records;
      tablparams.value.total = pratiqueregisterdata.total;
    };
    const formaterTime = (time) => {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    };
    const changetabs = (n) => {
      tablparams.value.period = tabslist.value[n].time;
      getlist();
    };
    watch(
      () => props.showModal,
      (n) => {
        if (n) {
          getTime();
        }
      },
    );
    expose({});
    onMounted(() => {
      // getTableData()
    });

    return (): JSX.Element => (
      <>
        <Modal title={props.title} show={props.showModal} onClose={() => emit("close")}>
          <div class="modal-layout">
            <div class="top">
              <div class="top_content">
                <div> 批次总数</div>
                <div style="font-size: 24px; color: #2989ff">
                  {props.total}
                  <img src={qua_blue} />
                </div>
              </div>
              <div class="top_content">
                <div> 检疫不合格</div>
                <div style="font-size: 24px; color: #ffab10">
                  {props.seven}
                  <img src={qua_yellow} />
                </div>
              </div>
            </div>
            <Tabs
              activeKey={activeKey.value}
              onUpdate:activeKey={(v) => {
                activeKey.value = v;
              }}
              onChange={changetabs}
            >
              {tabslist.map((item) => (
                <TabPane key={item.key} tab={item.time}>
                  <tableData dataSource={dataSource.value} columns={columns.value}></tableData>
                  <div style="margin-top:10px;text-align: right;">
                    {" "}
                    <Pagination
                      current={tablparams.pageNumber}
                      onUpdate:current={(v) => {
                        tablparams.pageNumber = v;
                      }}
                      pageSize={tablparams.pageSize}
                      onUpdate:pageSize={(v) => {
                        tablparams.pageSize = v;
                      }}
                      show-size-changer
                      total={tablparams.total}
                      onShowSizeChange={onShowSizeChange}
                    ></Pagination>
                  </div>
                </TabPane>
              ))}
            </Tabs>
          </div>
        </Modal>
      </>
    );
  },
});

export default QuarantineTable;
