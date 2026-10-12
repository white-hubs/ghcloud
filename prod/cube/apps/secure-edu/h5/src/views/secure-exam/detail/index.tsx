import { useMetaTitle } from "../../hooks/use-meta-title-hook";
import { BasicInfo } from "./components/basic-info/index";
import { ExamPaperList } from "./components/exam-paper-list";
import { ExamRecord } from "./components/exam-record";
import { PersonList } from "./components/person-list";
import styles from "./index.module.less";
import { authStore } from "@/api/auth-store";
import { cubeSecureEduService, cubeSecureEduPublicService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { ExamTaskType, type ExamDetailState } from "@ghcloud/cube-secure-edu-service";
import dayjs from "dayjs";
import { Button, showNotify } from "vant";
import { defineComponent, onMounted, reactive, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";

type DetailTabName = "basicInfo" | "personList" | "examPaper" | "examRecord";

const detailTabs: { title: string; name: DetailTabName }[] = [
  { title: "基础资料", name: "basicInfo" },
  { title: "考试人员", name: "personList" },
  { title: "试卷", name: "examPaper" },
  { title: "考试记录", name: "examRecord" },
];

export const ExamDetail = defineComponent({
  setup: () => {
    const route = useRoute();
    useMetaTitle();
    const router = useRouter();
    const activeTab = shallowRef<DetailTabName>("basicInfo");
    const state = reactive<{
      details: ExamDetailState;
    }>({
      details: {
        id: "",
        name: "",
        themeId: "",
        themeName: "",
        examStartTime: 0,
        examEndTime: 0,
        examPaperId: "",
        examPaperName: "",
        examPaperContent: "",
        chargeUserId: "",
        chargeUserName: "",
        timed: false,
        examDuration: 0,
        examDurationUnit: "",
        retake: false,
        retakeNumber: 0,
        examTaskType: "",
        examTaskTypeName: "",
        examUserNumber: 0,
        examTaskStatus: "",
        examTaskStatusName: "",
        remark: "",
        examUsers: [],
        examFrequencyLimit: false,
      },
    });
    const statusObj: Record<string, string> = {
      STAY_EXAM: "待考试",
      IN_PROGRESS: "进行中",
      ENDED: "已结束",
    };
    // 获取考试详情
    const getDetail = async (): Promise<void> => {
      try {
        const authenticated = Boolean(authStore.token);
        const params = { id: route.query.id as string, userIdentify: localStorage.getItem("browserId") };
        const res = authenticated
          ? await cubeSecureEduService.getExamDetail(params)
          : await cubeSecureEduPublicService.getExamDetail(params);
        state.details = {
          ...res,
          id: res.id || (route.query.id as string) || "",
          examUsers: res.examUsers || [],
        };
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      }
    };
    const handleStartExam = (): void => {
      if (state.details.examFrequencyLimit) {
        showNotify({ type: "warning", message: "已达到考试次数限制" });
        return;
      }
      const startExamQuery = {
        id: state.details.id,
        examPaperId: state.details.examPaperId,
        examDuration: state.details.examDuration,
        examTaskType: state.details.examTaskType,
      };
      if (state.details.examTaskType === ExamTaskType.STAFF_EXAM) {
        localStorage.removeItem("userInfo");
        router.push({
          path: "/secure-exam/staff-exam-auth",
          query: startExamQuery,
        });
        return;
      }
      if (state.details.examTaskType === ExamTaskType.MERCHANT_EXAM) {
        localStorage.removeItem("userInfo");
        router.push({
          path: "/secure-exam/sign-in",
          query: startExamQuery,
        });
        return;
      }
      showNotify({ type: "warning", message: "考试类型异常，暂无法开始考试" });
    };
    const canShowStartExam = (): boolean => {
      const { canExam, examTaskStatus } = state.details as ExamDetailState & { canExam?: boolean | null };
      return examTaskStatus === "IN_PROGRESS" && canExam !== false;
    };
    onMounted(() => {
      getDetail();
    });
    const renderTabContent = (): JSX.Element => {
      if (activeTab.value === "personList") {
        return <PersonList dataList={state.details.examUsers} />;
      }
      if (activeTab.value === "examPaper") {
        return <ExamPaperList details={state.details} />;
      }
      if (activeTab.value === "examRecord") {
        return <ExamRecord details={state.details} />;
      }
      return <BasicInfo details={state.details} />;
    };
    return (): JSX.Element => (
      <>
        <CubeNavBar title="考试详情" showBack />
        <div class={styles.container}>
          <div class={styles.examInfo}>
            <div class={styles.title}>
              <div class={styles.examName}>{state.details.name}</div>
              <div class={[styles.status, styles[state.details.examTaskStatus]]}>{statusObj[state.details.examTaskStatus]}</div>
            </div>
            <div class={styles.info}>
              <div class={styles.infoItem}>
                <div class={styles.infoItemLabel}>负责人：</div>
                <div class={styles.infoItemValue}>{state.details.chargeUserName}</div>
              </div>
              <div class={styles.infoItem}>
                <div class={styles.infoItemLabel}>考试时间：</div>
                <div class={styles.infoItemValue}>
                  {dayjs(state.details.examStartTime).format("MM-DD HH:mm")} ~ {dayjs(state.details.examEndTime).format("MM-DD HH:mm")}
                </div>
              </div>
              <div class={styles.infoItem}>
                <div class={styles.infoItemLabel}>考试说明：</div>
                <div class={styles.infoItemValue}>{state.details.remark || "--"}</div>
              </div>
            </div>
          </div>
          <div class={styles.tabsContainer}>
            <div class={styles.tabs}>
              {detailTabs.map((tab) => (
                <button
                  key={tab.name}
                  type="button"
                  class={[styles.tab, activeTab.value === tab.name && styles.activeTab]}
                  onClick={() => {
                    activeTab.value = tab.name;
                  }}
                >
                  {tab.title}
                </button>
              ))}
              <div
                class={styles.tabLine}
                style={{
                  left: `${detailTabs.findIndex((tab) => tab.name === activeTab.value) * 25 + 12.5}%`,
                }}
              />
            </div>
            <div class={styles.tabContent}>{renderTabContent()}</div>
          </div>
          {canShowStartExam() && (
            <div class={styles.operate}>
              <Button round block type="primary" native-type="submit" onClick={handleStartExam}>
                开始考试
              </Button>
            </div>
          )}
        </div>
      </>
    );
  },
});
