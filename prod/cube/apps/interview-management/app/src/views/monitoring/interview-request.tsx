import { InterviewModal } from "./interview-modal";
import styles from "./monitoring.module.less";
import { cubeSecurityService } from "@/api/service";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
import type { MeetingApplyType } from "@ghcloud/cube-security-management-service";
import { Button, Form, FormItem, Input, Table, DateRangePicker } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
interface SearchType {
  pageNumber: number;
  pageSize: number;
  meetingPeriod: string;
  applyPersonName?: string;
  visitedPerson?: string;
}
interface TableData {
  name: string;
  id: string;
  code: string;
  areaName: string;
}
export const InterviewRequest = defineComponent({
  setup: () => {
    const total = ref<number>(0);
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      meetingPeriod: "",
      applyPersonName: "",
      visitedPerson: "",
    });
    const currentId = ref("");
    const visibleModal = ref(false);
    const tableLoading = ref<boolean>(false);
    const scrollY = ref<number>(400);
    const tableData = ref<MeetingApplyType[]>([]);
    const meetingType = new Map([
      ["0", "亲友会见"],
      ["1", "法律咨询"],
      ["2", "工作事宜"],
    ]);
    // 查询会见申请表格数据===================================================================================================
    // 获取会见申请表格数据
    const getMeetingApplyPage = async (): Promise<void> => {
      tableLoading.value = true;
      try {
        const res = await cubeSecurityService.getMeetingApplyPage(search);
        tableLoading.value = false;
        total.value = res.total;
        tableData.value = res.records;
      } catch {
        tableLoading.value = false;
      }
    };
    onMounted(() => {
      getMeetingApplyPage();
    });
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page;
      search.pageSize = pageSize;
      getMeetingApplyPage();
    };
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1;
      search.pageSize = size;
      getMeetingApplyPage();
    };
    const handleSearch = (): void => {
      search.pageNumber = 1;
      getMeetingApplyPage();
    };
    const handleReset = (): void => {
      search.pageNumber = 1;
      search.meetingPeriod = "";
      search.applyPersonName = "";
      search.visitedPerson = "";
      getMeetingApplyPage();
    };
    const handleDetail = (id: string): void => {
      currentId.value = id;
      visibleModal.value = true;
    };
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: "申请记录号",
        dataIndex: "applyCode",
        key: "applyCode",
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "申请时间",
        dataIndex: "applyTime",
        key: "applyTime",
        customRender: ({ text }: { text: number }): string => dayjs(text).format("YYYY-MM-DD HH:mm:ss") || "-",
      },
      {
        title: "申请人",
        dataIndex: "applyPersonName",
        key: "applyPersonName",
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "会见类型",
        dataIndex: "meetingType",
        key: "meetingType",
        customRender: ({ text }: { text: string }): string => meetingType.get(text) || "-",
      },
      {
        title: "会见人姓名",
        dataIndex: "meetingPersons",
        key: "meetingPersons",
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "会见随行人员",
        dataIndex: "accompanyingPersonCount",
        key: "accompanyingPersonCount",
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "被见人",
        dataIndex: "visitedPersons",
        key: "visitedPersons",
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "会见事由",
        dataIndex: "meetingReason",
        key: "meetingReason",
      },
      {
        title: "会见时间",
        dataIndex: "meetingTime",
        key: "meetingTime",
        customRender: ({ record }: { record: MeetingApplyType }): JSX.Element => (
          <>
            {dayjs(record?.meetingStartTime ?? "").format("YYYY-MM-DD HH:mm") ?? "--"}-
            {dayjs(record?.meetingEndTime ?? "").format("HH:mm") ?? "--"}
          </>
        ),
      },
      {
        title: "审批结果",
        dataIndex: "approvalResult",
        key: "approvalResult",
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        customRender: ({ record }: { record: TableData }): JSX.Element => (
          <Button
            type="link"
            onClick={() => {
              handleDetail(record.id);
            }}
          >
            详情
          </Button>
        ),
      },
    ];

    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      "content-search": (): JSX.Element => (
        <Form layout="inline">
          <FormItem label="会见日期">
            <DateRangePicker v-model:value={search.meetingPeriod} />
          </FormItem>
          <FormItem label="申请人">
            <Input placeholder="请输入姓名查询" v-model:value={search.applyPersonName} />
          </FormItem>
          <FormItem label="被见人">
            <Input placeholder="请输入姓名查询" v-model:value={search.visitedPerson} />
          </FormItem>
          <FormItem>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </FormItem>
        </Form>
      ),
      "content-table": (): JSX.Element => (
        <>
          <div class={styles["content-right"]}>
            <Table
              columns={recordTableColumns}
              data-source={tableData.value}
              loading={tableLoading.value}
              scrollY={scrollY.value}
              rowKey="id"
              pagination={false}
            />
            <div class={styles["table-footer"]}>
              <GPagination
                current={search.pageNumber}
                pageSize={search.pageSize}
                total={total.value}
                onChangePage={changePage}
                onChangeSize={changeSize}
              />
            </div>
          </div>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <GLayout title="会见申请" showFooter={false} v-slots={gLayoutSlots} />
        {visibleModal.value ? (
          <InterviewModal
            id={currentId.value}
            type="申请"
            visible={visibleModal.value}
            onClose={() => {
              visibleModal.value = false;
            }}
          />
        ) : null}
      </>
    );
  },
});
