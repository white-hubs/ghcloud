import { InterviewModal } from "./interview-modal.tsx";
import styles from "./monitoring.module.less";
import { cubeSecurityService } from "@/api/service.ts";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
import type { MeetingRecordType } from "@ghcloud/cube-security-management-service";
import { Button, DateRangePicker, Form, FormItem, Input, Table } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
interface SearchType {
  pageNumber: number;
  pageSize: number;
  visitedPerson: string;
  meetingPeriod: string;
}
export const InterviewRecord = defineComponent({
  setup: () => {
    const total = ref<number>(0);
    const search = reactive<SearchType>({
      pageNumber: 1,
      pageSize: 10,
      visitedPerson: "",
      meetingPeriod: "",
    });
    const tableLoading = ref<boolean>(false);
    const scrollY = ref<number>(400);
    const tableData = ref<MeetingRecordType[]>([]);
    const visibleModal = ref(false);
    const meetingType = new Map([
      ["0", "亲友会见"],
      ["1", "法律咨询"],
      ["2", "工作事宜"],
    ]);
    // 查询会见记录表格数据===================================================================================================
    // 获取会见记录表格数据
    const getMeetingRecordPage = async (): Promise<void> => {
      tableLoading.value = true;
      try {
        const res = await cubeSecurityService.getMeetingPage(search);
        tableLoading.value = false;
        total.value = res.total;
        tableData.value = res.records;
      } catch {
        tableLoading.value = false;
      }
    };
    onMounted(() => {
      getMeetingRecordPage();
    });
    const changePage = (page: number, pageSize: number): void => {
      search.pageNumber = page;
      search.pageSize = pageSize;
      getMeetingRecordPage();
    };
    const changeSize = (current: number, size: number): void => {
      search.pageNumber = 1;
      search.pageSize = size;
      getMeetingRecordPage();
    };
    const handleSearch = (): void => {
      search.pageNumber = 1;
      getMeetingRecordPage();
    };
    const handleReset = (): void => {
      search.pageNumber = 1;
      search.visitedPerson = "";
      search.meetingPeriod = "";
      getMeetingRecordPage();
    };
    const currentId = ref("");
    const handleDetail = (item: MeetingRecordType, type: string): void => {
      if (type === "detail") {
        currentId.value = item.id;
        visibleModal.value = true;
      } else {
        const audio = document.getElementById("audio") as HTMLAudioElement;
        audio.play();
      }
    };
    // 表格列名==========================================================================================================
    const recordTableColumns = [
      {
        title: "会见记录号",
        dataIndex: "meetingCode",
        key: "meetingCode",
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
        customRender: ({ text }: { text: string }): string => text || "-",
      },
      {
        title: "会见时间",
        dataIndex: "meetingTime",
        key: "meetingTime",
        customRender: ({ record }: { record: MeetingRecordType }): JSX.Element => (
          <>
            {dayjs(record?.meetingStartTime ?? "").format("YYYY-MM-DD HH:mm") ?? "--"}-
            {dayjs(record?.meetingEndTime ?? "").format("HH:mm") ?? "--"}
          </>
        ),
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        align: "center",
        customRender: ({ record }: { record: MeetingRecordType }): JSX.Element => (
          <>
            <Button
              type="link"
              onClick={() => {
                handleDetail(record, "detail");
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              onClick={() => {
                handleDetail(record, "audio");
              }}
            >
              录音播放
              <audio id="audio" src={record.meetingProcessAudio} />
            </Button>
          </>
        ),
      },
    ];
    // 布局插槽==========================================================================================================
    const gLayoutSlots = {
      "content-search": (): JSX.Element => (
        <Form layout="inline">
          <FormItem label="会见时间">
            <DateRangePicker v-model:value={search.meetingPeriod} />
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
        <GLayout title="会见记录" showFooter={false} v-slots={gLayoutSlots} />
        {visibleModal.value ? (
          <InterviewModal
            id={currentId.value}
            type="记录"
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
