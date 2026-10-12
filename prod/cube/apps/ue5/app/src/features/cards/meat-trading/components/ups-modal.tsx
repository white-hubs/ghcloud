import { CaretUpOutlined } from "@ant-design/icons-vue";
import type { TableColumnType } from "ant-design-vue";
import { Tabs, TabPane, Table } from "ant-design-vue";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import tableData from "./tableData";
import Modal from "@/features/equipment/modal-table/modal";

import styles from "./ups-modal.module.less";

export const UpsModal = defineComponent({
  name: "UpsModal",
  props: {
    title: { type: String, required: true, default: "报警记录" },
    showModal: { type: Boolean, required: true, default: false },
  },
  setup(props, ctx) {
    interface Props {
      title: string;
      showModal: boolean;
    }
    const activeKey = ref("1");
    const dataSource = ref([
      {
        t: "2022-07-23",
        k: "15534.00",
      },
      {
        t: "2022-07-23",
        k: "15534.00",
      },
      {
        t: "2022-07-23",
        k: "15534.00",
      },
      {
        t: "2022-07-23",
        k: "15534.00",
      },
      {
        t: "2022-07-23",
        k: "15534.00",
      },
    ]);
    const columns = ref<TableColumnType[]>([
      {
        title: "时间",
        dataIndex: "t",
        sorter: true,
      },
      {
        title: "重量(kg)",
        dataIndex: "k",
        sorter: true,
      },
    ]);
  },
});

export default UpsModal;
