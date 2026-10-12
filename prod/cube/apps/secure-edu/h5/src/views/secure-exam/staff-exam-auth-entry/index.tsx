import { HandleExamType, useExamHandleStore } from "../exam-handle-hooks";
import { authStore } from "@/api/auth-store";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { ExamTaskType } from "@ghcloud/cube-secure-edu-service";
import { Loading } from "vant";
import { defineComponent, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

export const StaffExamAuthEntry = defineComponent({
  name: "StaffExamAuthEntry",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const examHandleStore = useExamHandleStore();

    const redirectToLogin = async (): Promise<void> => {
      const redirect = router.resolve({
        path: "/secure-exam/staff-exam-auth",
        query: route.query,
      }).fullPath;
      await router.replace({
        path: "/auth/login",
        query: {
          redirect: encodeURIComponent(redirect),
        },
      });
    };

    const startExam = async (): Promise<void> => {
      if (!authStore.token) {
        await redirectToLogin();
        return;
      }
      await examHandleStore.goExamHandle({
        id: route.query.id as string,
        examPaperId: route.query.examPaperId as string,
        type: HandleExamType.STARTEXAM,
        examDuration: Number(route.query.examDuration as string),
        examTaskType: ExamTaskType.STAFF_EXAM,
      });
    };

    onMounted(() => {
      void startExam();
    });

    return (): JSX.Element => (
      <>
        <CubeNavBar title="考试" showBack />
        <div style={{ paddingTop: "40vh", textAlign: "center" }}>
          <Loading type="spinner">正在进入考试</Loading>
        </div>
      </>
    );
  },
});
