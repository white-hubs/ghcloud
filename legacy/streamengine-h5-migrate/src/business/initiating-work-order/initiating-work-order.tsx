import { Bar } from "../../component/bar/bar";
import bus from "../../infrastructure/bus";
import TabForm from "../tab-form/tab-form.vue";
import { BusinessType } from "./order-list/order";
import { usePageTitle } from "./use-page-title";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { Dialog } from "vant";
import { defineComponent, onMounted, onUnmounted, ref, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

export const InitiatingWorkOrder = defineComponent({
  setup: () => {
    try {
      cubeAppService.onVisibilityNativeAppBar(false);
    } catch (error) {}
    const route = useRoute();
    const router = useRouter();
    const taskQueen = JSON.parse(sessionStorage.getItem("taskQueen") as string);
    const businessType = (route.query.businessType as string) ?? taskQueen?.[0]?.businessType ?? "";
    const processId = (route.query.processId as string) ?? taskQueen?.[0]?.processId ?? "";

    // 使用 Composable 共享状态管理页面标题
    const { pageTitle: sharedPageTitle } = usePageTitle();
    const defaultTitle = BusinessType.get(businessType) ?? "工单";
    const pageTitle = ref<string>(sharedPageTitle.value || defaultTitle);
    watch(
      () => sharedPageTitle.value,
      (newTitle) => {
        if (newTitle) {
          pageTitle.value = newTitle;
        }
      },
      { immediate: true },
    );

    bus.on("closePage", (val) => {
      if (getEnvironment() === "cubeApp") {
        val ? cubeAppService.backPage(val) : cubeAppService.backPage();
      } else {
        history.back();
      }
    });
    const showNextDialog = ref(false);
    bus.on("endTask", (val) => {
      showNextDialog.value = true;
    });
    onUnmounted(() => {
      sessionStorage.removeItem("query");
      bus.off("closePage");
    });
    const rightDom = (): VNode => (
      <div
        style="color: var(--van-primary-color);"
        onClick={() => {
          router.push({ path: "/personal-order-list", query: { businessType, type: "personal" } });
        }}
      >
        申请记录
      </div>
    );

    return () => (
      <div style={{ minHeight: "100vh", width: "100vw", background: "#f3f7fa" }}>
        <Bar title={pageTitle.value} right={rightDom()} isShowRight={processId === ""} />
        <TabForm />
        <Dialog
          showCancelButton
          v-model:show={showNextDialog.value}
          confirm-button-disabled={JSON.parse(sessionStorage.getItem("taskQueen") as string)?.length <= 1}
          cancelButtonText="退出"
          confirmButtonText="下一个"
          onCancel={() => {
            sessionStorage.removeItem("taskQueen");
            router.go(-1);
          }}
          onConfirm={() => {
            const list = JSON.parse(sessionStorage.getItem("taskQueen") as string);
            if (list && list.length > 0) {
              sessionStorage.setItem("taskQueen", JSON.stringify(list.slice(1, list.length)));
              router.go(0);
            }
          }}
        ></Dialog>
      </div>
    );
  },
});
