import { Button, Icon, showNotify } from "vant";
import { defineComponent, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubeAppBusinessBridge } from "@ghcloud/cube-app-js-sdk";

import { useMetaTitle } from "../hooks/use-meta-title-hook";

import styles from "./temporary-inspection-complete.module.less";

export const TemporaryInspectionComplete = defineComponent({
  setup() {
    useMetaTitle();
    const router = useRouter();
    const route = useRoute();

    const returnPagePath = (route.query?.returnPagePath as string) ?? "/entry";
    const inspectionId = (route.query?.inspectionId as string) ?? (route.query?.recordId as string) ?? "";
    const targetId = (route.query?.targetId as string) ?? "";
    const targetCategory = (route.query?.targetCategory as string) ?? "";
    const targetName = (route.query?.targetName as string) ?? "";

    const validateWorkOrderParams = (): boolean => {
      if (targetId && targetCategory && targetName) {
        return true;
      }
      showNotify({ type: "warning", message: "缺少必要参数，暂无法转工单" });
      return false;
    };

    const back = (): void => {
      router.replace({ path: returnPagePath || "/entry" });
    };

    const continueInspection = async (): Promise<void> => {
      if (targetId && targetCategory) {
        router.push({
          path: "/inspection-object",
          query: {
            targetId,
            targetCategory,
            returnPagePath,
            backPath: route.fullPath,
          },
        });
        return;
      }
      try {
        const codeEntity = await CubeAppBusinessBridge.handleBusinessScanCodeToObject();
        const nextTargetId = codeEntity?.entityId ?? "";
        const nextTargetCategory = codeEntity?.entityType ?? "";
        if (nextTargetId && nextTargetCategory) {
          router.replace({
            path: "/inspection-object",
            query: { targetId: nextTargetId, targetCategory: nextTargetCategory, returnPagePath, backPath: route.fullPath },
          });
          return;
        }
        showNotify({ type: "danger", message: "实体对象数据异常" });
      } catch {
        showNotify({ type: "danger", message: "未查询到绑定对象" });
      }
    };

    const goToWorkOrder = (businessType: "HIDDENDANGER" | "FAULT"): void => {
      if (!validateWorkOrderParams()) {
        return;
      }
      if (!inspectionId) {
        showNotify({ type: "warning", message: "巡检记录标识缺失，工单会发起但可能无法自动关联" });
      }
      const taskName = businessType === "HIDDENDANGER" ? "隐患单" : "故障单";
      const item = {
        inspectionId,
        targetId,
        targetCategory,
        targetName,
      };
      sessionStorage.setItem("cube-app-maintenance-object-data", JSON.stringify(item));
      sessionStorage.setItem("inspection-object-data", JSON.stringify({ ...item, taskName, businessType }));
      window.location.href = `/streamengineH5/initiating-work-order?processType=ADD&businessType=${businessType}`;
    };

    const goToHazardGovernance = (): void => {
      if (!validateWorkOrderParams()) {
        return;
      }
      const query = new URLSearchParams({
        sourceType: "INSPECTION",
        applicationCode: "INSPECTION",
        returnPath: returnPagePath,
        backPath: route.fullPath,
        targetId,
        targetCategory,
        targetName,
      });
      if (inspectionId) {
        query.set("sourceEventId", inspectionId);
      }
      window.location.href = `/apps/@ghcloud/cube-hazard-governance-h5#/hazard-report?${query.toString()}`;
    };

    return (): VNode => (
      <>
        <CubeNavBar showBack title="巡检完成" />
        <div class={styles.wrapper}>
          <div class={styles.content}>
            <div class={styles.icon}>
              <Icon size="80" name="checked" />
            </div>
            <div class={styles.message}>巡查结果提交成功</div>
            <Button block onClick={back}>
              返回
            </Button>
            <Button block type="primary" onClick={continueInspection}>
              继续巡检
            </Button>
            <Button
              block
              type="primary"
              onClick={() => {
                goToHazardGovernance();
              }}
            >
              隐患治理
            </Button>
            <Button
              block
              type="primary"
              onClick={() => {
                goToWorkOrder("FAULT");
              }}
            >
              故障报修
            </Button>
          </div>
        </div>
      </>
    );
  },
});
