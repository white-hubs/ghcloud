import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { DailyStandardTable } from "../daily-standard-table";
import type { StandardModel } from "@ghcloud/cube-daily-task-service";
import { defineComponent, ref, nextTick } from "vue";
interface Props {
  title: string;
}
/** 标准选择弹窗 */
export const DailyStandardSelectModalTable = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const standardTableRef = ref<{
      getStandardSelectedRows: () => StandardModel[];
      setStandardSelectedKeys: (keys: string[]) => void;
    }>();

    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "800px",
      onConfirm: async () => {
        emit("enter", standardTableRef.value?.getStandardSelectedRows() || []);
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
        standardTableRef.value?.setStandardSelectedKeys(keys || []);
      });
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => (
        <>
          <DailyStandardTable ref={standardTableRef} enable={true} />
        </>
      ),
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
