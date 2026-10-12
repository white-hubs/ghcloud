import { Ref } from "vue";

export const useDragPosition = (modalRef: Ref<HTMLElement | null>) => {
  const startDrag = (e: MouseEvent) => {
    const modal = modalRef.value;
    if (!modal) return;

    const rect = modal.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    const move = (ev: MouseEvent) => {
      let newLeft = ev.clientX - offsetX;
      let newTop = ev.clientY - offsetY;

      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const minLeft = halfWidth;
      const maxLeft = windowWidth - halfWidth;
      const minTop = halfHeight;
      const maxTop = windowHeight - halfHeight;

      if (newLeft < minLeft) newLeft = minLeft;
      if (newLeft > maxLeft) newLeft = maxLeft;
      if (newTop < minTop) newTop = minTop;
      if (newTop > maxTop) newTop = maxTop;

      modal.style.left = `${newLeft}px`;
      modal.style.top = `${newTop}px`;
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  return {
    startDrag,
  };
};
