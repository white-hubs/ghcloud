import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { ExamListItem } from "./components/exam-list-item/index";
import styles from "./index.module.less";
import { authStore } from "@/api/auth-store";
import { cubeSecureEduService, cubeSecureEduPublicService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { Search, PullRefresh, List, Empty, showNotify } from "vant";
import { defineComponent, onMounted, onUnmounted, reactive } from "vue";
import { useRouter } from "vue-router";
interface StateProp {
  refreshing: boolean;
  examTaskStatus: string;
  examList: Record<string, string | number>[];
  loading: boolean;
  finished: boolean;
  listLoading: boolean;
  keyword: string;
  finishedText: string;
}
// interface ErrorState {
//   toJSON: () => { errorMessage: string; };
// }
export const ExamList = defineComponent({
  setup: () => {
    const page = {
      pageNumber: 1,
      pageSize: 10,
      pages: 1,
    };
    useMetaTitle();
    const router = useRouter();
    const state = reactive<StateProp>({
      refreshing: false,
      finished: false,
      listLoading: false,
      examTaskStatus: "",
      finishedText: "没有更多了",
      keyword: "",
      examList: [],
      loading: false,
    });
    const statusOption = [
      {
        title: "全部",
        value: "",
      },
      {
        title: "待考试",
        value: "STAY_EXAM",
      },
      {
        title: "进行中",
        value: "IN_PROGRESS",
      },
      {
        title: "已结束",
        value: "ENDED",
      },
    ];
    const isApp = sessionStorage.getItem("isApp");
    const getList = async (): Promise<void> => {
      try {
        const authenticated = Boolean(authStore.token);
        const marketTenant = sessionStorage.getItem("marketTenant");
        const headTenant = sessionStorage.getItem("headTenant");
        const params = authenticated
          ? {
              ...page,
              examTaskStatus: state.examTaskStatus,
              keyword: state.keyword,
            }
          : {
              ...page,
              examTaskStatus: state.examTaskStatus,
              keyword: state.keyword,
              marketTenant: marketTenant ? Number(marketTenant) : "",
              tenant: headTenant ? Number(headTenant) : "",
              userIdentify: localStorage.getItem("browserId") ?? "",
            };
        state.listLoading = true;
        const result = authenticated
          ? await cubeSecureEduService.getSafetyExamPage(params)
          : await cubeSecureEduPublicService.getSafetyExamPage(params);
        state.examList = page.pageNumber === 1 ? [...result.records] : [...state.examList, ...result.records];
        page.pages = result.pages;
        if (result.pages >= page.pageNumber) {
          state.finishedText = page.pageNumber > 1 ? "没有更多了" : "";
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      } finally {
        state.listLoading = false;
      }
    };
    const handleChangeTab = (value: string): void => {
      state.examTaskStatus = value;
      page.pageNumber = 1;
      getList();
    };
    const handlePopState = (): void => {
      history.pushState(null, "", location.href);
      router.push({
        path: "/entry",
      });
    };
    onMounted(() => {
      getList();
      history.pushState(null, "", location.href);
      isApp && window.addEventListener("popstate", handlePopState, false);
    });
    onUnmounted(() => {
      window.removeEventListener("popstate", handlePopState, false);
    });
    const handleNextPage = async (): Promise<void> => {
      if (page.pageNumber >= page.pages) {
        state.finished = true;
        return;
      }
      page.pageNumber += 1;
      await getList();
      state.loading = false;
    };
    const handleSearch = (): void => {
      page.pageNumber = 1;
      getList();
    };
    const handleRefresh = async (): Promise<void> => {
      page.pageNumber = 1;
      await getList();
      state.finished = false;
      state.loading = false;
      state.refreshing = false;
    };
    return (): JSX.Element => (
      <div class={styles.container}>
        <CubeNavBar title="考试列表" showBack />
        <Search shape="round" placeholder="根据考试任务名称搜索" v-model={state.keyword} onSearch={handleSearch} />
        <div class={styles.statusTabs}>
          {statusOption.map((item) => (
            <button
              class={[styles.statusTab, state.examTaskStatus === item.value ? styles.active : ""]}
              key={item.value}
              type="button"
              onClick={() => handleChangeTab(item.value)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <PullRefresh
          v-model={state.refreshing}
          onRefresh={handleRefresh}
          v-slots={{
            default: () => (
              <List
                class={styles.list}
                v-model:loading={state.loading}
                finishedText={state.finishedText}
                finished={state.finished}
                onLoad={handleNextPage}
                immediateCheck={false}
                v-slots={{
                  default: () => (
                    <>
                      {state.examList.length !== 0 && state.examList.map((item) => <ExamListItem examProp={item} key={item.id} />)}
                      {!state.examList.length && <Empty description="暂无数据" />}
                    </>
                  ),
                }}
              />
            ),
          }}
        />
      </div>
    );
  },
});
