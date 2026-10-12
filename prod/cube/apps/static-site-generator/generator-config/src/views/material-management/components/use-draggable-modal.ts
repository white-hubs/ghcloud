import { nextTick } from "vue";

export function useDraggableModal(wrapClassName: string) {
  const resetPosition = (): void => {
    const modal = document.querySelector(`.${wrapClassName} .static-site-generator-modal`) as HTMLElement | null;
    if (modal) {
      modal.style.left = "";
      modal.style.top = "";
    }
  };

  const initDrag = async (): Promise<void> => {
    // Portal DOM 挂载可能需要额外一次 tick
    await nextTick();
    await nextTick();

    const wrap = document.querySelector(`.${wrapClassName}`) as HTMLElement | null;
    if (!wrap) return;

    const modal = wrap.querySelector(".static-site-generator-modal") as HTMLElement | null;
    if (!modal) return;

    const header = modal.querySelector(".static-site-generator-modal-header") as HTMLElement | null;
    if (!header) return;

    header.style.cursor = "move";

    let startX = 0;
    let startY = 0;
    let initialX = 0;
    let initialY = 0;

    const getCurrentOffset = (): { x: number; y: number } => {
      const left = parseFloat(modal.style.left || "0");
      const top = parseFloat(modal.style.top || "0");
      return { x: Number.isNaN(left) ? 0 : left, y: Number.isNaN(top) ? 0 : top };
    };

    const onMouseMove = (e: MouseEvent): void => {
      const x = initialX + (e.clientX - startX);
      const y = initialY + (e.clientY - startY);
      modal.style.position = "relative";
      modal.style.left = `${x}px`;
      modal.style.top = `${y}px`;
    };

    const onMouseUp = (): void => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (e: MouseEvent): void => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      const current = getCurrentOffset();
      initialX = current.x;
      initialY = current.y;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };

    header.addEventListener("mousedown", onMouseDown);
  };

  return {
    initDrag,
    resetPosition,
  };
}
