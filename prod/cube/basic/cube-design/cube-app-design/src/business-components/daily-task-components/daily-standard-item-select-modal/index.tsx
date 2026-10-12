import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { DailyStandardItemTable } from "../daily-standard-item-table";
import type { StandardItemModel } from "@ghcloud/cube-daily-task-service";
import { defineComponent, nextTick, ref } from "vue";
interface Props {
  title: string;
}
/** 标准项选择弹窗 */
export const DailyStandardItemSelectModalTable = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const standardItemTableRef = ref<{
      getStandardItemSelectedRows: () => StandardItemModel[];
      setStandardItemSelectedKeys: (keys: string[]) => void;
    }>();

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "800px",
      onConfirm: async () => {
        emit("enter", standardItemTableRef.value?.getStandardItemSelectedRows() || []);
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
    });
    const openModal = (keys?: string[]): void => {
      modalApi.open();
      void nextTick(() => {
        standardItemTableRef.value?.setStandardItemSelectedKeys(keys || []);
      });
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => (
        <>
          <DailyStandardItemTable ref={standardItemTableRef} />
        </>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
