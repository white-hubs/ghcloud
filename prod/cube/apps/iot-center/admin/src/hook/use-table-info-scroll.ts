import { type Ref, ref, onMounted, onBeforeMount } from "vue";

interface UseTableInfoScroll {
  scrollY: Ref<number>;
}

const MARGIN_BOTTOM = 16;
const PADDING_MARGIN = 40;
const MIN_TABLE_HEIGHT = 300;
const INIT_DELAY = 200;

export const useTableInfoScroll = (): UseTableInfoScroll => {
  const scrollY = ref(0);

  const getTableScrollY = (): void => {
    const layoutContent = document.getElementById("cube-layout-content");
    if (!layoutContent) {
      scrollY.value = 0;
      return;
    }

    // 获取 Tab 导航栏高度
    const tabsNav = document.querySelector(".ant-tabs-nav");
    const tabsNavHeight = tabsNav ? tabsNav.getBoundingClientRect().height : 0;

    // 获取表格顶部按钮区域高度
    const topHeader = document.getElementById("top-header");
    // 16px 是 marginBottom
    const topHeaderHeight = topHeader ? topHeader.getBoundingClientRect().height + MARGIN_BOTTOM : 0;

    // 获取表格头部高度
    const tableHeader = document.querySelector("thead");
    const tableHeaderHeight = tableHeader ? tableHeader.getBoundingClientRect().height : 0;

    // 获取分页器高度（如果有）
    const pagination = document.querySelector(".ant-pagination");
    // 16px 是 margin
    const paginationHeight = pagination ? pagination.getBoundingClientRect().height + MARGIN_BOTTOM : 0;

    // 计算可用高度
    const layoutHeight = layoutContent.getBoundingClientRect().height;
    // 40px 是预留的边距
    const availableHeight = layoutHeight - tabsNavHeight - topHeaderHeight - tableHeaderHeight - paginationHeight - PADDING_MARGIN;

    // 最小高度 300px
    scrollY.value = Math.max(availableHeight, MIN_TABLE_HEIGHT);
  };

  onMounted(() => {
    // 延迟执行，确保 DOM 已完全渲染
    setTimeout(() => {
      getTableScrollY();
    }, INIT_DELAY);
    window.addEventListener("resize", getTableScrollY);
  });

  onBeforeMount(() => {
    window.removeEventListener("resize", getTableScrollY);
  });

  return {
    scrollY,
  };
};
