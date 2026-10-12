import { extendStatPage, trainExportAxios } from "@/api/train";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";
import { Button, DatePicker, Form, FormItem, Page, PopOver, Select, message } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
interface Train {
  cultivateMode: string | undefined;
  cultivateTarget: string | undefined;
  themeId: string;
  cultivateTaskStatus: string;
  period: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}
export const TrainingCount = defineComponent({
  setup: () => {
    const trainDate = reactive<Train>({
      cultivateMode: undefined,
      cultivateTarget: undefined,
      themeId: "",
      cultivateTaskStatus: "",
      period: "",
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <Button
            type="primary"
            onClick={() => {
              trainExport();
            }}
          >
            导出
          </Button>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <div class="mt-10px relative">
          <div style="margin-bottom:10px">
            <Form layout="inline">
              <FormItem label="培训类型:">
                <Select
                  v-model:value={trainDate.cultivateTarget}
                  placeholder="请选择培训类型"
                  style="width:240px"
                  options={[
                    {
                      label: "员工",
                      value: "STAFF",
                    },
                    {
                      label: "商户",
                      value: "MERCHANT",
                    },
                  ]}
                />
              </FormItem>
              <FormItem label="培训形式:">
                <Select
                  v-model:value={trainDate.cultivateMode}
                  placeholder="请选择培训形式"
                  style="width:240px"
                  options={[
                    {
                      label: "线上",
                      value: "ONLINE",
                    },
                    {
                      label: "线下",
                      value: "OFFLINE",
                    },
                  ]}
                />
              </FormItem>
              <FormItem label="培训日期:">
                <DatePicker v-model:value={trainDate.period} value={trainDate.period} style="width:240px" />
              </FormItem>
              <FormItem>
                <Button
                  type="primary"
                  onClick={() => {
                    getDate();
                  }}
                >
                  查询
                </Button>
                <Button
                  class="ml-15px"
                  onClick={() => {
                    reset();
                  }}
                >
                  重置
                </Button>
              </FormItem>
            </Form>
          </div>
          <AliasTable
            tableCode="TRAINING_COUNT"
            applicationCode="SECURE_EDU"
            scrollX={1000}
            columns={columns}
            dataSource={dataSource.value}
            class="mt-10px"
            pagination={false}
            rowSelection={false}
          />
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          onPageChange={pageChange}
          v-model:current={trainDate.pageNumber}
          v-model:pageSize={trainDate.pageSize}
          v-model:total={trainDate.total}
        />
      ),
    };
    const dataSource = ref([]);
    const getDate = (): void => {
      extendStatPage(trainDate).then((res) => {
        const { data } = res;
        dataSource.value = data.records as never[];
        trainDate.total = data.total;
      });
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      trainDate.pageNumber = pageNumber || 1;
      trainDate.pageSize = pageSize;
      getDate();
    };
    const columns = [
      {
        title: "序号",
        width: 70,
        align: "center",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "任务名称",

        dataIndex: "name",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "培训主题",
        dataIndex: "themeName",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "培训类型",
        dataIndex: "cultivateTarget",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text === "STAFF" ? "员工" : "商户"}</PopOver>,
      },
      {
        title: "培训形式",
        dataIndex: "cultivateMode",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text === "ONLINE" ? "线上" : "线下"}>{text === "ONLINE" ? "线上" : "线下"}</PopOver>
        ),
      },
      {
        title: "主讲人",
        dataIndex: "speaker",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "负责人",
        dataIndex: "chargeUserName",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "培训时间",
        dataIndex: "cultivateEndTime",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={dayjs(text).format("YYYY-MM-DD HH:mm")}>{dayjs(text).format("YYYY-MM-DD HH:mm")}</PopOver>
        ),
      },
      {
        title: "培训地点",
        dataIndex: "cultivateAddress",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "培训内容",
        dataIndex: "cultivateContent",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "预计参加人数",
        dataIndex: "trainNum",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text}>
            <a
              onClick={() => {
                skipRoute(record, "预计参加人数");
              }}
            >
              {text}
            </a>
          </PopOver>
        ),
      },
      {
        title: "实际参加人数",
        dataIndex: "signedNum",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text}>
            <a
              onClick={() => {
                skipRoute(record, "实际参加人数");
              }}
            >
              {text}
            </a>
          </PopOver>
        ),
      },
      {
        title: "缺勤人数",
        dataIndex: "unsignedNum",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text || "--"}>
            <a
              onClick={() => {
                skipRoute(record, "缺勤人数");
              }}
            >
              {text || "--"}
            </a>
          </PopOver>
        ),
      },
      {
        title: "迟到人数",
        dataIndex: "belatedNum",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text || "--"}>
            <a
              onClick={() => {
                skipRoute(record, "迟到人数");
              }}
            >
              {text || "--"}
            </a>
          </PopOver>
        ),
      },
      {
        title: "是否有考试",
        dataIndex: "hasExam",
        width: 110,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text}>{text}</PopOver>,
      },
      {
        title: "完成考试人数",
        dataIndex: "realityExamUserNumber",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { examTaskId: string } }): JSX.Element => (
          <PopOver content={text || "--"}>
            <a
              onClick={() => {
                skipRouteExam(record, "完成考试人数");
              }}
            >
              {text || "--"}
            </a>
          </PopOver>
        ),
      },
      {
        title: "缺考人数",
        dataIndex: "missExamUserNumber",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { examTaskId: string } }): JSX.Element => (
          <PopOver content={text || "--"}>
            <a
              onClick={() => {
                skipRouteExam(record, "缺考人数");
              }}
            >
              {text || "--"}
            </a>
          </PopOver>
        ),
      },
      {
        title: "不及格人数",
        dataIndex: "noPassedUserNumber",
        width: 110,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { examTaskId: string } }): JSX.Element => (
          <PopOver content={text || "--"}>
            <a
              onClick={() => {
                skipRouteExam(record, "不及格人数");
              }}
            >
              {text || "--"}
            </a>
          </PopOver>
        ),
      },
      {
        title: "考试总分",
        dataIndex: "examPaperScore",
        width: 110,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "平均分",
        dataIndex: "averageScore",
        width: 110,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "及格率",
        dataIndex: "passingRate",
        width: 110,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text === null ? "--" : text + "%"}>{text === null ? "--" : text + "%" || "--"}</PopOver>
        ),
      },
    ];

    const skipRoute = (
      record: {
        id: string;
      },
      type: string,
    ): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/secure-edu/training-detials?id=${record.id}&type=${type}`,
      );
    };
    const skipRouteExam = (
      record: {
        examTaskId: string;
      },
      type: string,
    ): void => {
      history.pushState(
        { current: location.pathname + location.search },
        "",
        `/portal/secure-edu/exam-details?id=${record.examTaskId}&type=${type}`,
      );
    };
    const reset = (): void => {
      Object.assign(trainDate, {
        cultivateMode: undefined,
        cultivateTarget: undefined,
        themeId: "",
        cultivateTaskStatus: "",
        period: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      });
      getDate();
    };
    const trainExport = (): void => {
      trainExportAxios(trainDate)
        .then((res) => {
          const { data } = res;
          const link = document.createElement("a");
          const blob = new Blob([data as BlobPart], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "培训统计.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((res) => {
          logger.error(res);
          message.warn("未查询到数据，无法导出");
        });
    };
    onMounted(() => {
      getDate();
    });
    return (): JSX.Element => (
      <>
        <Layout title="培训统计" v-slots={layoutSlots} />
      </>
    );
  },
});
