import { onMounted, onUnmounted, shallowRef } from "vue";

const TABLE_HEADER_HEIGHT = 48;
const MIN_TABLE_BODY_HEIGHT = 120;

/**
 * 根据关联列表可用高度计算表体滚动区域，使表头与底部分页始终可见。
 */
export const useAssociationTableScroll = () => {
  const tableWrapRef = shallowRef<HTMLElement>();
  const tableScrollY = shallowRef(MIN_TABLE_BODY_HEIGHT);
  let resizeObserver: ResizeObserver | undefined;

  const updateTableScrollY = (): void => {
    const containerHeight = tableWrapRef.value?.clientHeight ?? 0;
    if (containerHeight <= 0) {
      return;
    }
    tableScrollY.value = Math.max(Math.floor(containerHeight - TABLE_HEADER_HEIGHT), MIN_TABLE_BODY_HEIGHT);
  };

  onMounted(() => {
    if (!tableWrapRef.value) {
      return;
    }
    resizeObserver = new ResizeObserver(updateTableScrollY);
    resizeObserver.observe(tableWrapRef.value);
    updateTableScrollY();
  });

  onUnmounted(() => {
    resizeObserver?.disconnect();
  });

  return {
    tableWrapRef,
    tableScrollY,
  };
};
