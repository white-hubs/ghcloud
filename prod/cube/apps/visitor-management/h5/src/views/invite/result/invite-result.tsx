import styles from "./invite-result.module.less";
import { cubeVisitorManagementService } from "@/api/server";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { getAssetsFile } from "@/utils";
import { cubeWxService } from "@ghcloud/cube-app-js-sdk";
import { getRouteParams } from "@ghcloud/cube-auth-utils";
import { Button, Empty, Loading, showNotify } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

// 邀约结果
export const InviteResult = defineComponent({
  setup() {
    useMetaTitle();
    const detail = ref();
    const qrCode = ref();
    const loading = ref(false);
    const isWxMini = ref(false);
    const timeRange = ref();
    const formatTimeRange = (str: string): string => {
      if (!str) {
        return "";
      }

      const timeStr = str.replace(/[[\]]/g, "");
      const times = timeStr.split(", ").map((time) => time.slice(0, -3));
      const result = times.join(" - ");
      return result;
    };
    const goHome = async (): Promise<void> => {
      const params = getRouteParams();
      if (isWxMini.value || params.terminal === "bimops-manage-app") {
        cubeWxService.backHome();
      } else {
        history.back();
      }
    };
    const getProcessDetail = async (processId: string): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeVisitorManagementService.getReservationDetailProcess({ processInsId: processId });
        detail.value = res ?? null;
        qrCode.value = res.appointmentCode ?? "";
        timeRange.value = formatTimeRange(res?.timeStr || "");
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        showNotify({ type: "danger", message: errorMessage || "请求失败" });
      } finally {
        loading.value = false;
      }
    };
    onMounted(async () => {
      const { processId } = useRoute().query as { processId: string };
      // 访客邀请 - 查看访问详情
      await getProcessDetail(processId);
      isWxMini.value = await cubeWxService.getWxEnv();
    });
    return (): JSX.Element => (
      <div class={styles.wrapper}>
        <div class={styles.container}>
          {loading.value && (
            <Loading type="spinner" size="24px" vertical>
              加载中...
            </Loading>
          )}
          <div class={styles.code}>
            <img src={getAssetsFile("result.png")} width="50" alt="" />
            <div class={styles.status}>预约成功</div>
            <div>访问请出示二维码</div>
            {qrCode.value ? (
              <div class={styles["code-img"]}>
                <img src={qrCode.value} alt="" width="200" height="200" />
              </div>
            ) : (
              <Empty description="暂无图片" />
            )}
          </div>
          <div class={styles.msg}>
            <div class={styles.item}>
              <span>访问区域: </span>
              <span>{detail.value?.areaName || "--"}</span>
            </div>
            <div class={styles.item}>
              <span>访问日期: </span>
              <span>{detail.value?.dayStr || "--"}</span>
            </div>
            <div class={styles.item}>
              <span>访问时段: </span>
              <span>{timeRange.value || "--"}</span>
            </div>
            <div class={styles.item}>
              <span>访问人员: </span>
              <span>{detail.value?.name || "--"}</span>
            </div>
          </div>
        </div>
        <div style={{ border: "none", margin: "30px 15px" }}>
          <Button color="rgba(255,255,255,0.5)" block style={{ border: "none" }} onClick={goHome}>
            返回首页
          </Button>
        </div>
      </div>
    );
  },
});
