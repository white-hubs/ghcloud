import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { StandardItemContentTable } from "../standard-item-content-table";
import type { StandardItemContent } from "../standard-item-content-table/type";
import { defineComponent, ref, nextTick, type ComponentPublicInstance } from "vue";

interface Props {
  title?: string;
}

/** 标准项编辑弹窗组件（用于手动添加和编辑临时标准） */
export const StandardItemEditModal = defineComponent({
  props: ["title"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    // 标准项内容表格 ref
    type StandardItemContentTableInstance = ComponentPublicInstance & {
      checkData: () => Promise<StandardItemContent[]>;
      isValid: boolean;
      initContent: (data: StandardItemContent[]) => void;
    };
    const standardItemContentTableRef = ref<StandardItemContentTableInstance>();

    const [CubeModal, modalApi] = useCubeModal({
      title: props.title || "新增标准",
      width: "1400px",
      onConfirm: async () => {
        // 验证并获取数据
        if (!standardItemContentTableRef.value) {
          return;
        }

        try {
          const contentList = await standardItemContentTableRef.value.checkData();
          emit("enter", contentList);
          modalApi.close();
        } catch {
          // 验证失败，不关闭弹窗
        }
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
    });

    const openModal = (): void => {
      modalApi.open();
      // 重置表格数据
      nextTick(() => {
        if (standardItemContentTableRef.value) {
          standardItemContentTableRef.value.initContent([]);
        }
      });
    };

    expose({
      openModal,
    });

    const modalSlots = {
      default: (): JSX.Element => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "600px",
            padding: "16px 0",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            <StandardItemContentTable
              ref={standardItemContentTableRef}
              value={[]}
              readonly={false}
              scrollY={450}
              action="add"
              showAdd={true}
              editContentPolicy="all"
              showItemName={true}
            />
          </div>
        </div>
      ),
    };

    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
