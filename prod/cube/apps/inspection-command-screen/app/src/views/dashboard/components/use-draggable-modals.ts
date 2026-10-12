import { onBeforeUnmount, onMounted } from "vue";

interface DragState {
  modal: HTMLElement;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const readOffset = (modal: HTMLElement): { x: number; y: number } => ({
  x: Number(modal.dataset.dragX || 0),
  y: Number(modal.dataset.dragY || 0),
});

/** 让当前大屏的 Modal 标题栏可拖拽，避免改动公共 cube-ui Modal 行为。 */
export const useDraggableModals = (): void => {
  let state: DragState | null = null;

  const onMouseDown = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    const header = target?.closest(
      ".draggable-modal-wrap .inspection-command-screen-modal-header, .draggable-modal-wrap .ant-modal-header",
    ) as HTMLElement | null;
    if (!header || target?.closest(".inspection-command-screen-modal-close, .ant-modal-close")) {
      return;
    }
    const modal = header.closest(".inspection-command-screen-modal, .ant-modal") as HTMLElement | null;
    if (!modal) {
      return;
    }
    const offset = readOffset(modal);
    state = {
      modal,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    document.body.style.userSelect = "none";
    event.preventDefault();
  };

  const onMouseMove = (event: MouseEvent): void => {
    if (!state) {
      return;
    }
    const nextX = state.originX + event.clientX - state.startX;
    const nextY = state.originY + event.clientY - state.startY;
    state.modal.dataset.dragX = String(nextX);
    state.modal.dataset.dragY = String(nextY);
    state.modal.style.transform = `translate(${nextX}px, ${nextY}px)`;
  };

  const onMouseUp = (): void => {
    state = null;
    document.body.style.userSelect = "";
  };

  onMounted(() => {
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "";
  });
};
