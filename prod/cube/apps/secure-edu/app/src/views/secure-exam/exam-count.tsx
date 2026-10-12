import { getOriganizations } from "@/api/ouaa";
import { examStatPage, examexport, themesList } from "@/api/train";
import { Layout } from "@/components/layout/layout";
import { Button, DatePicker, Form, FormItem, Page, PopOver, Select, Table } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";

interface Train {
  cultivateMode: string;
  examTaskType: string | undefined;
  themeId: string | null;
  organizationId: string | null;
  cultivateTaskStatus: string;
  period: string;
  pageNumber: number;
  pageSize: number;
  total: number;
}
export const ExamCount = defineComponent({
  setup: () => {
    const trainDate = reactive<Train>({
      cultivateMode: "",
      examTaskType: undefined,
      themeId: null,
      organizationId: null,
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
              exportExam();
            }}
          >
            导出
          </Button>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <div class="mt-10px relative">
          <div class="">
            <Form layout="inline">
              <FormItem label="考试类型:">
                <Select
                  v-model:value={trainDate.examTaskType}
                  style="width:240px"
                  options={[
                    {
                      label: "员工考核",
                      value: "STAFF_EXAM",
                    },
                    {
                      label: "商户考核",
                      value: "MERCHANT_EXAM",
                    },
                  ]}
                />
              </FormItem>
              <FormItem label="考试主题:">
                <Select v-model:value={trainDate.themeId} style="width:240px" options={themeslist.value} />
              </FormItem>
              <FormItem label="部门:">
                <Select v-model:value={trainDate.organizationId} style="width:240px" options={origanizationlist.value} />
              </FormItem>
              <FormItem label="培训日期:">
                <DatePicker v-model:value={trainDate.period} style="width:240px" />
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

          <Table
            size="middle"
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
      examStatPage(trainDate).then((res) => {
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
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "考试主题",
        dataIndex: "themeName",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "考试类型",
        dataIndex: "examTaskType",
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={text}>{text === "STAFF_EXAM" ? "员工考核" : "商户考核"}</PopOver>
        ),
      },
      {
        title: "负责人",
        dataIndex: "chargeUserName",
        width: 180,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "考试时间",
        dataIndex: "examStartTime",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => (
          <PopOver content={dayjs(text).format("YYYY-MM-DD HH:mm")}>{dayjs(text).format("YYYY-MM-DD HH:mm")}</PopOver>
        ),
      },
      {
        title: "试卷",
        dataIndex: "examPaperName",
        width: 250,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "总分",
        dataIndex: "examPaperScore",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "预计参加人数",
        dataIndex: "examUserNumber",
        width: 120,
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
        dataIndex: "realityExamUserNumber",
        width: 120,
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
        title: "缺考人数",
        dataIndex: "missExamUserNumber",
        width: 120,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text}>
            <a
              onClick={() => {
                skipRoute(record, "缺考人数");
              }}
            >
              {text}
            </a>
          </PopOver>
        ),
      },
      {
        title: "不及格人数",
        dataIndex: "noPassedUserNumber",
        width: 120,
        ellipsis: true,
        customRender: ({ text, record }: { text: string; record: { id: string } }): JSX.Element => (
          <PopOver content={text}>
            <a
              onClick={() => {
                skipRoute(record, "不及格人数");
              }}
            >
              {text}
            </a>
          </PopOver>
        ),
      },
      {
        title: "平均分",
        dataIndex: "averageScore",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "及格率",
        dataIndex: "passingRate",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={`${text}%`}>{`${text}%`}</PopOver>,
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
        `/portal/secure-edu/exam-details?id=${record.id}&type=${type}`,
      );
    };
    const reset = (): void => {
      Object.assign(trainDate, {
        cultivateMode: "",
        examTaskType: undefined,
        themeId: "",
        cultivateTaskStatus: "",
        period: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      });
      getDate();
    };
    const exportExam = (): void => {
      examexport(trainDate).then((res) => {
        const { data } = res;
        const link = document.createElement("a");
        const blob = new Blob([data as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "考试统计.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    };
    const themeslist = ref([]);
    const origanizationlist = ref([]);
    onMounted(() => {
      getDate();
      themesList().then((res) => {
        const { data } = res;
        themeslist.value = data?.map((the: { name: string; id: string }) => ({
          label: the.name,
          value: the.id,
        })) as never[];
      });
      getOriganizations({ enabled: true }).then((res) => {
        const { data } = res;
        origanizationlist.value = data?.map((the: { name: string; id: string }) => ({
          label: the.name,
          value: the.id,
        })) as never[];
      });
    });

    return (): JSX.Element => (
      <>
        <Layout title="考试统计" v-slots={layoutSlots} />
      </>
    );
  },
});
