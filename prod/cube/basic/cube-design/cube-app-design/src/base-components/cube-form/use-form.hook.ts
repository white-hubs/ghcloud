import { debounce } from "../../utils";
import { onMounted, onUnmounted, type Ref, ref } from "vue";
export const useFormHooks = (): {
  columns: Ref<number>;
} => {
  const columns = ref(4);
  const calcFormCol = (): void => {
    const gridContainer = document.getElementById("cube-query-form-container") as HTMLDivElement;
    const containerWidth = gridContainer.offsetWidth;
    const gridItem = gridContainer.querySelector(".cube-design-form-item") as unknown as HTMLDivElement;
    const itemWidth = gridItem.offsetWidth;
    const calculatedColumns = Math.floor(containerWidth / itemWidth) - 1;
    columns.value = isNaN(calculatedColumns) ? 1 : calculatedColumns;
  };
  const debounceCalcFormCol = debounce(calcFormCol, 500);
  onMounted(() => {
    calcFormCol();
    window.addEventListener("resize", debounceCalcFormCol);
  });
  onUnmounted(() => {
    window.removeEventListener("resize", debounceCalcFormCol);
  });
  return {
    columns,
  };
};
