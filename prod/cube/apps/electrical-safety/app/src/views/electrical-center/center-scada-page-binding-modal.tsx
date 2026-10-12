import { defineComponent, shallowRef, watch, type PropType } from "vue";

import { Modal, Select, message } from "@ghcloud/cube-ui";

import type { ScadaPageSummary } from "@/utils/scada-pages";

export const CenterScadaPageBindingModal = defineComponent({
  name: "CenterScadaPageBindingModal",
  props: {
    open: { type: Boolean, default: false },
    submitting: { type: Boolean, default: false },
    pages: { type: Array as PropType<ScadaPageSummary[]>, default: () => [] },
    currentPageId: { type: String, default: "" },
  },
  emits: ["cancel", "submit"],
  setup(props, { emit }) {
    const pendingPageId = shallowRef<string | undefined>();

    watch(
      () => props.open,
      (open) => {
        if (open) {
          pendingPageId.value = props.currentPageId || undefined;
        }
      },
    );

    const submit = (): void => {
      if (!pendingPageId.value) {
        message.warning("请选择要绑定的多设备二维组态");
        return;
      }
      emit("submit", pendingPageId.value);
    };

    return (): JSX.Element => (
      <Modal
        visible={props.open}
        title={props.currentPageId ? "切换电气中心二维组态" : "绑定电气中心二维组态"}
        width="520px"
        wrapClassName="electrical-viewport-modal"
        okText={props.currentPageId ? "确认切换" : "确认绑定"}
        confirmLoading={props.submitting}
        destroyOnClose
        onCancel={() => emit("cancel")}
        onOk={submit}
      >
        <div class="center-scada-binding-form">
          <span>多设备组态页面</span>
          <Select
            showSearch
            optionFilterProp="label"
            value={pendingPageId.value}
            options={props.pages.map((page) => ({
              label: `${page.name}（${page.bindableElements?.length ?? 0} 个待绑定图元）`,
              value: page.id,
            }))}
            placeholder="请选择电气中心组态"
            disabled={props.submitting}
            style={{ width: "100%" }}
            onUpdate:value={(value?: string) => (pendingPageId.value = value)}
          />
          <small>绑定页面后，将继续为画布中标记“需要运行端绑定设备”的图元绑定设施房。</small>
        </div>
      </Modal>
    );
  },
});
