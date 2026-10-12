import { defineComponent } from "vue";
import { ref, reactive, onMounted } from "vue";

import Modal from "@/features/equipment/modal-table/modal";

import styles from "./uspTransactionModel.module.less";

export const UspTransactionModel = defineComponent({
  name: "UspTransactionModel",
  props: {
    title: { type: String, required: true, default: "UPS" },
    showModal: { type: Boolean, required: true, default: false },
  },
  setup(props, ctx) {
    interface Props {
      title: string;
      showModal: boolean;
    }
  },
});

export default UspTransactionModel;
