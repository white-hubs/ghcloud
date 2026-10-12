import dayjs from "dayjs";
import { defineComponent, reactive, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { Button, message } from "@ghcloud/cube-ui";
import { AliasTable, Layout as GLayout, VerticalLine } from "@ghcloud/generic-component";

import { cubeMaintainService } from "@/api/service";
import { downloadPDF } from "@/utils/pdf.js";

import styles from "./detail.module.less";

export interface FormState {
  id?: string;
  typeName: string;
  code: "";
}
export const Detail = defineComponent({
  setup: () => {
    const pdf = ref();
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const form = reactive({
      titleTime: "",
      title: "",
      total: 0,
      waitingForConfirm: 0,
      waitingForHandle: 0,
      toBeClosed: 0,
      finished: 0,
      analysisTotal: 0,
      analysisWaitingForConfirm: 0,
      analysisWaitingForHandle: 0,
      analysisToBeClosed: 0,
      analysisFinished: 0,
      analysisFirstName: "",
      analysisFirstTime: "",
      analysisFirstReason: "",
      analysisSecondName: "",
      analysisSecondTime: "",
      analysisSecondReason: "",
      analysisThirdName: "",
      analysisAreaTotal: 0,
      analysisAreaWaitingForConfirm: 0,
      analysisAreaWaitingForHandle: 0,
      analysisAreaToBeClosed: 0,
      analysisAreaFinished: 0,
      analysisAreaFirstName: "",
      analysisAreaFirstTime: "",
      analysisAreaFirstReason: "",
      analysisAreaSecondName: "",
      analysisAreaSecondTime: "",
      analysisAreaSecondReason: "",
      analysisAreaThirdName: "",
      analysisAreaThirdTime: "",
      reportOverviewList: [],
      analysisList: [],
      analysisAreaList: [],
      analysisReason: [],
    });
    const columns2 = [
      {
        ellipsis: true,
        title: "设备类型",
        dataIndex: "objTypeName",
        key: "objTypeName",
      },
      {
        ellipsis: true,
        title: "个数",
        dataIndex: "objTypeTotal",
        key: "objTypeTotal",
      },
      {
        ellipsis: true,
        title: "待确认",
        dataIndex: "objTypeConfirm",
        key: "objTypeConfirm",
      },
      {
        ellipsis: true,
        title: "待处理",
        dataIndex: "objTypeHandle",
        key: "objTypeHandle",
      },
      {
        ellipsis: true,
        title: "待关闭",
        dataIndex: "objTypeClosed",
        key: "objTypeClosed",
      },
      {
        ellipsis: true,
        title: "已结束",
        dataIndex: "objTypeFinished",
        key: "objTypeFinished",
      },
    ];
    const columns3 = [
      {
        ellipsis: true,
        title: "区域名称",
        dataIndex: "areaName",
        key: "areaName",
        customRender: ({ text }: { text: string }) => {
          return text || "--";
        },
      },
      {
        ellipsis: true,
        title: "个数",
        dataIndex: "objAreaTotal",
        key: "objAreaTotal",
      },
      {
        ellipsis: true,
        title: "待确认",
        dataIndex: "objAreaConfirm",
        key: "objAreaConfirm",
      },
      {
        ellipsis: true,
        title: "待处理",
        dataIndex: "objAreaHandle",
        key: "objAreaHandle",
      },
      {
        ellipsis: true,
        title: "待关闭",
        dataIndex: "objAreaClosed",
        key: "objAreaClosed",
      },
      {
        ellipsis: true,
        title: "已结束",
        dataIndex: "objAreaFinished",
        key: "objAreaFinished",
      },
    ];
    const columns = [
      {
        title: "提交时间",
        dataIndex: "submitTime",
        key: "submitTime",
        customRender: ({ text }: { text: string }) => {
          const date = new Date(text);
          return text ? dayjs(date).format("YYYY-MM-DD HH:mm:ss") : "--";
        },
      },
      {
        title: "故障单名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "设备",
        dataIndex: "objName",
        key: "objName",
        customRender: ({ text }: { text: string }) => {
          return text || "--";
        },
      },
      {
        ellipsis: true,
        title: "提交人",
        dataIndex: "submitter",
        key: "submitter",
        customRender: ({ text }: { text: string }) => {
          return text || "--";
        },
      },
      {
        ellipsis: true,
        title: "状态",
        dataIndex: "faultStatus",
        key: "faultStatus",
        customRender: ({ text }: { text: string }) => {
          return text || "--";
        },
      },
      {
        ellipsis: true,
        title: "处理结果",
        dataIndex: "faultResult",
        key: "faultResult",
        customRender: ({ text }: { text: string }) => {
          return text || "--";
        },
      },
    ];
    const getList = async (): Promise<void> => {
      try {
        loading.value = true;
        const result = await cubeMaintainService.getReportOverview(route.query.id as string);
        Object.assign(form, result);
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        loading.value = false;
      }
    };
    const goBack = (): void => {
      // router.push(`/${route.query.path}`)
      history.back();
    };
    const handleExport = (): void => {
      downloadPDF(pdf.value, form.title + form.titleTime);
    };

    onMounted(() => {
      getList();
    });
    const OverviewDom = (): VNode => (
      <>
        <div>当前时间段统计共发生总数 [ {form?.total ?? 0} ] 条</div>
        <div class={styles["report-tips"]}>
          其中待确认 [ {form?.waitingForConfirm ?? 0} ] 条，待处理 [ {form?.waitingForHandle ?? 0} ] 条，待关闭 [{form?.toBeClosed ?? 0} ]
          条，已结束 [{form?.finished ?? 0} ] 条
        </div>
        <AliasTable dataSource={form.reportOverviewList} columns={columns} pagination={false} />
      </>
    );
    const DeviceAnalysisDom = (): VNode => (
      <>
        <div class={styles["report-tips"]}>
          当前时间段统计设备类型 [ {form?.analysisTotal ?? 0} ] 个，请特别关注【{form?.analysisFirstName ?? "--"}】的安全维护工作
        </div>
        <AliasTable dataSource={form.analysisList} columns={columns2} pagination={false} />
      </>
    );
    const areaAnalysisDom = (): VNode => (
      <>
        <div class={styles["report-tips"]}>
          当前时间段统计分布区域 [ {form?.analysisAreaTotal ?? 0} ] 个，请特别关注【{form?.analysisAreaFirstName ?? "--"}】的安全维护工作
        </div>
        <AliasTable dataSource={form.analysisAreaList} columns={columns3} pagination={false} />
      </>
    );
    const layoutSlots = {
      "layout-content": () => {
        return (
          <div class={styles["report-detail"]}>
            <div class={styles["report-pdf"]} ref={pdf}>
              <div class={styles["pdf-title"]}>{form?.title ?? "故障报告"}</div>
              <div class={styles["pdf-time"]}>{form?.titleTime ?? null}</div>
              <VerticalLine title="信息总览" />
              {form.total > 0 ||
              form.waitingForConfirm > 0 ||
              form.toBeClosed > 0 ||
              form.finished > 0 ||
              form.reportOverviewList.length > 0 ? (
                OverviewDom()
              ) : (
                <div>当前时间段统计未发生异常,请保持良好的运维工作</div>
              )}
              <VerticalLine title="设备分析" />
              {form.analysisTotal > 0 || form.analysisFirstName || form.analysisList.length > 0 ? (
                DeviceAnalysisDom()
              ) : (
                <div>当前时间段统计未发生异常,请保持良好的运维工作</div>
              )}
              <VerticalLine title="区域分析" />
              {form.analysisAreaTotal > 0 || form.analysisAreaFirstName || form.analysisAreaList.length > 0 ? (
                areaAnalysisDom()
              ) : (
                <div>当前时间段统计未发生异常,请保持良好的运维工作</div>
              )}
            </div>
          </div>
        );
      },
      "footer-page": () => {
        return (
          <>
            <Button onClick={goBack} style="margin-right: 10px">
              返回
            </Button>
            {form.title && (
              <Button onClick={handleExport} type="primary">
                下载
              </Button>
            )}
          </>
        );
      },
    };
    return () => (
      <>
        <GLayout title="报告详情" v-slots={layoutSlots} />
      </>
    );
  },
});
