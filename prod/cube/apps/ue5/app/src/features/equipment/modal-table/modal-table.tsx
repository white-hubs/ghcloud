import type { TableColumnType } from "ant-design-vue";
import { defineComponent } from "vue";
import { onMounted, ref } from "vue";

import Form from "./form";
import Modal from "./modal";
import type { FormItem } from "./type";

export const ModalTable = defineComponent({
  name: "ModalTable",
  props: {
    title: { type: String, required: true, default: "报警记录" },
    showModal: { type: Boolean, required: true, default: false },
    selectItem: { type: Array, required: true, default: () => [] },
    dataSource: { type: Array, required: true, default: () => [] },
    columns: { type: Array, required: true, default: () => [] },
    requestData: { type: Function, required: false },
  },
  setup(props, ctx) {
    interface Props {
      title: string;
      showModal: boolean;
      selectItem: FormItem[];
      dataSource: unknown[];
      columns: TableColumnType[];
      requestData?: Function;
    }
    const selectForm = ref();
  },
});

export default ModalTable;
