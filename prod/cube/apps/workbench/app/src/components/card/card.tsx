import { CloseOutlined } from "@ant-design/icons-vue";
import { defineComponent, computed } from "vue";
import { useRoute } from "vue-router";

import WorkbenchIcon from "../icon/workbench-icon";

import "./card.less";

interface CardProps {
  closable?: boolean;
  title?: string;
  icon?: string;
}

export default defineComponent({
  name: "PanelCard",
  props: {
    closable: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "面板标题",
    },
    icon: {
      type: String,
      default: "icon-lishiyingyong",
    },
  },
  emits: ["close"],
  setup(props: CardProps, { emit, slots }) {
    const route = useRoute();

    const handleClose = (): void => {
      emit("close");
    };

    const closeShow = computed(() => route?.path === "/workbench" && props.closable);

    return (): JSX.Element => (
      <div class="card-container">
        {closeShow.value && (
          <div class="card-close" onClick={handleClose}>
            <CloseOutlined />
          </div>
        )}
        <div class="card-header">
          <div class="card-header-title">
            <WorkbenchIcon iconClass={props.icon ?? ""} />
            {props.title}
          </div>
          <div class="card-header-btn">{slots.btn?.()}</div>
        </div>
        <div class="card-content">{slots.default?.()}</div>
      </div>
    );
  },
});
