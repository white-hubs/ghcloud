import styles from "./index.module.less";
import { cubeOuaaService } from "@/api/server";
import type { ExamUser } from "@ghcloud/cube-secure-edu-service";
import { Empty, Image } from "vant";
import { computed, defineComponent, onMounted, reactive, ref, shallowRef, type PropType } from "vue";

type FilterType = "dept" | "status";
interface FilterOption {
  value: string;
  text: string;
}

export const PersonList = defineComponent({
  props: {
    dataList: {
      type: Array as PropType<ExamUser[]>,
      default: () => [],
    },
  },
  setup: (props) => {
    const statusObj: Record<string, string> = {
      STAY_EXAM: "待考试",
      EXAMINED: "已考试",
      MISS_EXAM: "缺考",
    };
    const search = reactive({
      deptId: "",
      examStatus: "",
    });
    const deptOptions = ref<FilterOption[]>([]);
    const examStatusOptions = ref<FilterOption[]>([
      { text: "所有状态", value: "" },
      { text: "待考试", value: "STAY_EXAM" },
      { text: "已考试", value: "EXAMINED" },
      { text: "缺考", value: "MISS_EXAM" },
    ]);
    const activeFilter = shallowRef<FilterType | null>(null);
    const activeOptions = computed(() => (activeFilter.value === "dept" ? deptOptions.value : examStatusOptions.value));
    const activeValue = computed(() => (activeFilter.value === "dept" ? search.deptId : search.examStatus));
    const userList = computed(() => {
      let list = [...props.dataList];
      if (search.deptId) {
        list = list.filter((c) => c.userDepartmentId === search.deptId);
      }
      if (search.examStatus) {
        list = list.filter((e) => e.examStatus === search.examStatus);
      }
      return list;
    });
    const getOptionText = (options: FilterOption[], value: string): string =>
      options.find((option) => option.value === value)?.text || options[0]?.text || "";
    const toggleFilter = (type: FilterType): void => {
      activeFilter.value = activeFilter.value === type ? null : type;
    };
    const handleSelectOption = (value: string): void => {
      if (activeFilter.value === "dept") {
        search.deptId = value;
      }
      if (activeFilter.value === "status") {
        search.examStatus = value;
      }
      activeFilter.value = null;
    };
    const getDeptData = async (): Promise<void> => {
      const result = await cubeOuaaService.getDeptList({ enabled: true });
      deptOptions.value = result.map((item) => ({
        value: item.id,
        text: item.name,
      }));
      deptOptions.value.unshift({ value: "", text: "所有部门" });
    };
    onMounted(() => {
      getDeptData();
    });
    return (): JSX.Element => (
      <div class={styles.personList}>
        <div class={styles.tips}>
          参与培训人员：<span>{userList.value.filter((item) => item.score !== null).length}/</span>
          {userList.value.length}
        </div>
        <div class={styles.searchWrap}>
          <div class={styles.searchBar}>
            <button
              type="button"
              class={[styles.filterItem, activeFilter.value === "dept" && styles.activeFilterItem]}
              onClick={() => toggleFilter("dept")}
            >
              {getOptionText(deptOptions.value, search.deptId)}
            </button>
            <button
              type="button"
              class={[styles.filterItem, activeFilter.value === "status" && styles.activeFilterItem]}
              onClick={() => toggleFilter("status")}
            >
              {getOptionText(examStatusOptions.value, search.examStatus)}
            </button>
          </div>
          {activeFilter.value && (
            <div class={styles.optionPanel}>
              {activeOptions.value.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  class={[styles.optionItem, activeValue.value === option.value && styles.activeOptionItem]}
                  onClick={() => handleSelectOption(option.value)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
        <div class={styles.list}>
          {userList.value.map((item) => (
            <div class={styles.item} key={item.id}>
              <Image
                width="60"
                height="60"
                style={{ flexShrink: 0 }}
                round
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
              />
              <div class={styles.content}>
                <div class={styles.top}>
                  <div class={styles.name}>{item.userName}</div>
                  <div class={[styles.status, styles[item.examStatus]]}>{statusObj[item.examStatus]}</div>
                </div>
                <div class={styles.info}>
                  <div class={styles.infoItem}>
                    <span class={styles.infoLabel}>部门：</span> <span>{item.userDepartmentName || "--"}</span>
                  </div>
                  <div class={styles.infoItem}>
                    <span class={styles.infoLabel}>电话：</span> <span>{item.userPhone || "--"}</span>
                  </div>
                  <div class={styles.infoItem}>
                    <span class={styles.infoLabel}>职位：</span> <span> {item.userPostName || "--"}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!userList.value.length && <Empty description="暂无数据" />}
        </div>
      </div>
    );
  },
});
