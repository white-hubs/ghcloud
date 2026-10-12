import type { PageResult } from "@/api/common-type";
import { examTaskDel, examTaskPublish, examTaskWithdraw, getExamTaskPage } from "@/api/exam-test";
import { cubeSecureEduHeadQuartersService, cubeSecureEduPublicService, errorMsgHandler } from "@/api/server";
import ThemeSelectInput from "@/components/business/theme-select-input/theme-select-input";
import { Layout } from "@/components/layout/layout";
import { PageOff } from "@/components/page-off/page-off";
import { useAntDTheme } from "@/hook/use-antd-theme";
import { useHeadMode } from "@/hook/use-head-mode";
import { useTableScroll } from "@/hook/use-table-scroll";
import { logger } from "@/logger";
import { ExamTaskStatus, ExamTaskStatusOptions, ExamTaskType, ExamTaskTypeOptions } from "@/types/exam-task";
import {
  AntModal,
  Button,
  DownOutlined,
  DropDown,
  Form,
  FormItem,
  Input,
  Menu,
  MenuItem,
  Page,
  PopConfirm,
  PopOver,
  Select,
  Table,
  message,
  DatePicker,
  Space,
} from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import QRCode from "qrcode";
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import useClipboard from "vue-clipboard3";
import { useRoute } from "vue-router";

export const ExamTask = defineComponent({
  setup: () => {
    const { id: marketUrlId, headTenant, marketTenant } = useRoute().query;
    const { themeInject } = useAntDTheme();
    const formState = reactive({
      examTaskType: undefined,
      themeId: undefined,
      examTaskStatus: undefined,
      sourceCode: undefined,
      period: "",
      keyword: "",
    });
    const examTypeOptions = ExamTaskTypeOptions;
    const examStatusOptions = ExamTaskStatusOptions;
    const { isHeadMode, isOutSideLink, basePath } = useHeadMode();

    const add = (): void => {
      history.pushState({ current: location.pathname + location.search }, "", `${basePath}/exam-task-form?action=add`);
    };
    const editRow = (record: { id: string; examTaskStatus: ExamTaskStatus; sourceCode?: string }, detail?: boolean): void => {
      if (!detail) {
        if (record.examTaskStatus === ExamTaskStatus.STAY_EXAM) {
          message.warning("请撤回后再编辑");
          return;
        }
        if (record.examTaskStatus === ExamTaskStatus.IN_PROGRESS) {
          message.warning("考试正在进行中");
          return;
        }
        if (record.examTaskStatus === ExamTaskStatus.ENDED) {
          message.warning("考试已结束");
          return;
        }
      }
      let isHeadTask = false;
      if (isOutSideLink.value || record.sourceCode === "HEADQUARTERS") {
        isHeadTask = true;
      }
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `${basePath}/exam-task-form?id=${record.id}&action=${detail ? "detail" : "edit"}${isHeadTask ? "&isHeadTask=true" : ""}${isOutSideLink.value ? "&isOutSideLink=true" : ""}`,
      );
      if (isOutSideLink.value) {
        setTimeout(() => {
          window.location.reload();
        }, 0);
      }
    };
    const delRow = (record: { id: string; examTaskStatus: ExamTaskStatus; sourceCode?: string }): void => {
      if (isOutSideLink.value || record.sourceCode === "HEADQUARTERS") {
        message.warning("集团发布的任务不支持删除操作");
        return;
      }
      if (record.examTaskStatus === ExamTaskStatus.STAY_EXAM) {
        message.warning("请撤回后再删除");
        return;
      }
      if (record.examTaskStatus === ExamTaskStatus.IN_PROGRESS) {
        message.warning("考试正在进行中");
        return;
      }
      AntModal.confirm({
        centered: true,
        content: "确定要删除该项?",
        async onOk() {
          try {
            if (isHeadMode.value) {
              await cubeSecureEduHeadQuartersService.deleteExamTask(record.id).catch(() => message.error("操作错误"));
            } else {
              await examTaskDel({ id: record.id });
            }
            AntModal.destroyAll();
            message.success("操作成功");
            getTableData();
          } catch (error) {
            errorMsgHandler(error);
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const withDrawRow = (record: { id: string; examTaskStatus: ExamTaskStatus }): void => {
      if (record.examTaskStatus === ExamTaskStatus.UNPUBLISHED) {
        message.warning("考试任务未发布");
        return;
      }
      if (record.examTaskStatus === ExamTaskStatus.ENDED) {
        message.warning("考试已结束");
        return;
      }
      if (record.examTaskStatus === ExamTaskStatus.IN_PROGRESS) {
        message.warning("考试正在进行中");
        return;
      }
      AntModal.confirm({
        centered: true,
        content: "确定要撤回该项?",
        async onOk() {
          try {
            if (isHeadMode.value) {
              await cubeSecureEduHeadQuartersService.withdrawExamTask(record.id);
            } else if (isOutSideLink.value) {
              await cubeSecureEduPublicService.withdrawExamTask(record.id);
            } else {
              await examTaskWithdraw({ id: record.id });
            }
            AntModal.destroyAll();
            message.success("操作成功");
            getTableData();
          } catch (error) {
            errorMsgHandler(error);
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const shareLinkRow = async (): Promise<void> => {
      let url = `${window.location.origin}/apps/secure-edu/h5/#/secure-exam`;
      if (isOutSideLink.value) {
        url += `?marketTenant=${marketTenant}&headTenant=${headTenant}`;
      }

      const { toClipboard } = useClipboard();
      await toClipboard(url);
      message.success("复制成功");
    };
    const qrcodeRow = async (record: { id: string; name: string }): Promise<void> => {
      let url = `${window.location.origin}/apps/secure-edu/h5/#/secure-exam/detail?id=${encodeURIComponent(record.id)}`;
      if (isOutSideLink.value) {
        url += `&marketTenant=${encodeURIComponent(String(marketTenant))}&headTenant=${encodeURIComponent(String(headTenant))}`;
      }
      const canvas = document.getElementById("exam-task-qrcode") as HTMLCanvasElement | null;
      if (!canvas) {
        return;
      }
      await QRCode.toCanvas(canvas, url, { width: 500, margin: 1 });
      const dataUrl = canvas.toDataURL("image/png");
      const img = document.createElement("img");
      img.src = dataUrl;
      document.querySelector(".exam-task-qrcode-area")?.appendChild(img);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${record.name || "exam"}.png`;
      document.querySelector(".exam-task-qrcode-area")?.appendChild(link);
      link.click();
      document.querySelector(".exam-task-qrcode-area")?.removeChild(link);
      document.querySelector(".exam-task-qrcode-area")?.removeChild(img);
    };
    const getQrcodeButtonText = (examTaskType: ExamTaskType): string =>
      examTaskType === ExamTaskType.STAFF_EXAM ? "员工二维码" : "商户二维码";
    const publishRow = async (record: { id: string; examTaskStatus: ExamTaskStatus }): Promise<void> => {
      if (record.examTaskStatus !== ExamTaskStatus.UNPUBLISHED) {
        message.warning("当前状态不支持发布");
        return;
      }
      try {
        loading.value = true;
        if (isHeadMode.value) {
          await cubeSecureEduHeadQuartersService.publishExamTask(record.id);
        } else if (isOutSideLink.value) {
          await cubeSecureEduPublicService.publishExamTask(record.id);
        } else {
          await examTaskPublish({ id: record.id });
        }
        message.success("操作成功");
        getTableData();
      } catch (error) {
        errorMsgHandler(error);
      } finally {
        loading.value = false;
      }
    };

    const toExamPaperDetail = (record: { id: string; examPaper: { id: string; name: string } }): void => {
      if (record.id && record.examPaper.id) {
        history.pushState(
          { current: location.pathname + location.search },
          "",
          `${basePath}/exam-paper-detail?id=${record.id}&examPaperId=${record.examPaper.id}`,
        );
      }
    };

    const columns = computed(() => {
      const res = [
        {
          title: "序号",
          width: 70,
          align: "center",
          customRender: ({ index }: { index: number }): string => `${index + 1}`,
        },
        {
          title: "任务名称",
          dataIndex: "name",
          width: 150,
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "考试主题",
          dataIndex: "themeName",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "考试类型",
          align: "center",
          width: 80,
          dataIndex: "examTaskType",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => {
            const type = ExamTaskTypeOptions.find((e) => (e.value as string) === text)?.label ?? "--";
            return <PopOver content={type}>{type}</PopOver>;
          },
        },
        {
          title: "负责人",
          dataIndex: "chargeUserName",
          align: "center",
          width: 100,
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "考试开始时间",
          dataIndex: "examStartTime",
          ellipsis: true,
          customRender: ({ text }: { text: number }): JSX.Element => {
            const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "--";
            return <PopOver content={time}>{time}</PopOver>;
          },
        },
        {
          title: "考试结束时间",
          dataIndex: "examEndTime",
          ellipsis: true,
          customRender: ({ text }: { text: number }): JSX.Element => {
            const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm") : "--";
            return <PopOver content={time}>{time}</PopOver>;
          },
        },
        {
          title: "试卷",
          dataIndex: "examPapers",
          ellipsis: true,
          width: 150,
          customRender: ({ record }: { text: string; record: { id: string; examPapers: { id: string; name: string }[] } }): JSX.Element => (
            <Space direction="vertical">
              {record.examPapers.map((e) => (
                <Button
                  type="link"
                  onClick={() => {
                    toExamPaperDetail({ id: record.id, examPaper: e });
                  }}
                  size="small"
                  style={{ maxWidth: "100%" }}
                  key={e.id}
                >
                  <span style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name || "--"}</span>
                </Button>
              ))}
            </Space>
          ),
        },
        {
          title: "考试说明",
          dataIndex: "remark",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "参加人数",
          align: "center",
          width: 80,
          dataIndex: "examUserNumber",
          ellipsis: true,
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text || "--"}</PopOver>,
        },
        {
          title: "状态",
          align: "center",
          width: 170,
          dataIndex: "examTaskStatus",
          ellipsis: true,
          customRender: ({ text }: { text: ExamTaskStatus }): JSX.Element => {
            const status = ExamTaskStatusOptions.find((e) => (e.value as ExamTaskStatus) === text)?.label ?? "--";
            let color = "black";
            if (text === ExamTaskStatus.UNPUBLISHED) {
              color = "red";
            } else if (text === ExamTaskStatus.IN_PROGRESS) {
              color = "orange";
            } else if (text === ExamTaskStatus.STAY_EXAM) {
              color = "green";
            }
            return (
              <PopOver content={status}>
                {" "}
                <span style={{ color }}>{status}</span>
              </PopOver>
            );
          },
        },
        {
          title: "操作",
          dataIndex: "action",
          width: 230,
          customRender: ({
            record,
          }: {
            record: { id: string; examTaskType: ExamTaskType; examTaskStatus: ExamTaskStatus; name: string };
          }): JSX.Element => (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  void qrcodeRow(record);
                }}
              >
                {getQrcodeButtonText(record.examTaskType)}
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  editRow(record, true);
                }}
              >
                详情
              </Button>
              {!isOutSideLink.value && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    editRow(record);
                  }}
                >
                  编辑
                </Button>
              )}
              <PopConfirm
                title="确认发布该任务？"
                onConfirm={() => {
                  publishRow(record);
                }}
              >
                <Button type="link" size="small">
                  发布
                </Button>
              </PopConfirm>
              <DropDown
                v-slots={{
                  default: () => <DownOutlined />,
                  overlay: () => (
                    <Menu>
                      <MenuItem>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => {
                            delRow(record);
                          }}
                          style={{ width: "100%" }}
                        >
                          删除
                        </Button>
                      </MenuItem>
                      {!isHeadMode.value && (
                        <MenuItem>
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              shareLinkRow();
                            }}
                            style={{ width: "100%" }}
                          >
                            分享链接
                          </Button>
                        </MenuItem>
                      )}
                      <MenuItem>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => {
                            withDrawRow(record);
                          }}
                          style={{ width: "100%" }}
                        >
                          撤回
                        </Button>
                      </MenuItem>
                    </Menu>
                  ),
                }}
              />
            </>
          ),
        },
      ];

      if (!isHeadMode.value && !isOutSideLink.value) {
        res.splice(3, 0, {
          title: "任务来源",
          dataIndex: "sourceCode",
          align: "center",
          width: 100,
          ellipsis: true,
          customRender: ({ text }: { text: string }) => {
            const res = text === "HEADQUARTERS" ? "集团下发" : "自建任务";
            return <PopOver content={res}>{res}</PopOver>;
          },
        });
      }
      return res;
    });

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          ...formState,
        };
        if (params.period) {
          params.period =
            dayjs(params.period).startOf("days").format("YYYY-MM-DD HH:mm:ss") +
            "," +
            dayjs(params.period).endOf("days").format("YYYY-MM-DD HH:mm:ss");
        }
        const res: { data: PageResult } = {
          data: {
            total: 0,
            records: [],
            pages: 0,
          },
        };

        if (isHeadMode.value) {
          res.data = await cubeSecureEduHeadQuartersService.getExamTaskPage(params);
        } else if (isOutSideLink.value) {
          const data = await cubeSecureEduPublicService.getExamTaskPage({
            ...params,
            tenant: headTenant as unknown as number,
            marketTenant: marketTenant as unknown as number,
          });
          res.data = data;
        } else {
          const { data } = await getExamTaskPage(params);
          res.data = data;
        }

        if (res.data) {
          const { records, total } = res.data;
          dataSource.value = records;
          pagination.value.total = total;
        }
      } catch (error) {
        logger.error(error);
      } finally {
        loading.value = false;
      }
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    const reset = (): void => {
      formState.examTaskType = undefined;
      formState.themeId = undefined;
      formState.examTaskStatus = undefined;
      formState.sourceCode = undefined;
      formState.period = "";
      formState.keyword = "";
      queryForm();
    };
    const { scrollYAxis } = useTableScroll();
    const pageOff = ref(false);

    onMounted(async () => {
      if (isOutSideLink.value) {
        themeInject();
        // 外链状态检查
        const marketTaskUrl = await cubeSecureEduPublicService.getMarketTaskUrl({
          id: marketUrlId as string,
          taskType: "EXAM_TASK",
        });
        if (!marketTaskUrl.enabled) {
          pageOff.value = true;
          return;
        }
      }
      getTableData();
    });

    const layoutSlots = {
      "layout-header": (): JSX.Element | boolean =>
        !isOutSideLink.value && (
          <Button type="primary" onClick={add}>
            新增
          </Button>
        ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            {!isHeadMode.value && !isOutSideLink.value && (
              <FormItem label="任务来源" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
                <Select
                  v-model:value={formState.sourceCode}
                  style={{ width: "140px" }}
                  options={[
                    { value: "HEADQUARTERS", label: "集团下发" },
                    { value: "LOCAL_CREATE", label: "自建任务" },
                  ]}
                />
              </FormItem>
            )}
            <FormItem label="考试类型" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <Select v-model:value={formState.examTaskType} style={{ width: "180px" }} options={examTypeOptions} />
            </FormItem>
            <FormItem label="考试主题" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <ThemeSelectInput v-model:value={formState.themeId} style={{ width: "180px" }} />
            </FormItem>
            <FormItem label="考试状态" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <Select v-model:value={formState.examTaskStatus} style={{ width: "180px" }} options={examStatusOptions} />
            </FormItem>
            <FormItem label="考试开始日期" style={{ paddingRight: 0, marginRight: "5px", marginBottom: "10px" }}>
              <DatePicker v-model:value={formState.period} style={{ width: "180px" }} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.keyword} placeholder="任务名称、考试主题" showCount={false} />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <Table
            columns={columns.value}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            size="small"
            scrollY={scrollYAxis.value}
          />
          <div class="exam-task-qrcode-area" style={{ display: "none" }}>
            <canvas id="exam-task-qrcode" />
          </div>
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => <>{!pageOff.value ? <Layout title="考试任务" v-slots={layoutSlots} /> : <PageOff />}</>;
  },
});
