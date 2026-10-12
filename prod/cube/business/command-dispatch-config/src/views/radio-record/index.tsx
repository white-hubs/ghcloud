import dayjs from "dayjs";
import { defineComponent, reactive, onMounted, ref } from "vue";

import { useCubeQueryState } from "@ghcloud/cube-app-design";
import { Form, FormItem, Input, DateRangePicker, Button, Select, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { getFileForPage } from "@/apis/radio-record";
import { GLayout } from "@/components/common/layout";
import { GPagination } from "@/components/common/pagination";
interface RadioRecordQueryState {
  code: string;
  period: string;
  fileType: string | null;
  pageNumber: number;
  pageSize: number;
  total: number;
}

export const RadioRecord = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();

    const queryState = useCubeQueryState<RadioRecordQueryState>({
      initialState: {
        code: "",
        fileType: "video",
        period: "",
        pageNumber: 1,
        pageSize: 10,
        total: 0,
      },
      storage: "url",
      cacheFields: ["code", "fileType", "period", "pageNumber", "pageSize"],
      resolveValue: (field, raw) => {
        if (field === "pageNumber" || field === "pageSize") {
          return Number(raw);
        }
        return raw;
      },
    });

    const state = reactive<{
      loading: boolean;
      dataSource: unknown[];
    }>({
      loading: false,
      dataSource: [],
    });
    const periodRange = ref<string[]>([]);
    const selectOption = [
      { label: "语音呼叫", value: "voice" },
      { label: "视频呼叫", value: "video" },
    ];
    const callType = {
      voice: "语音呼叫",
      video: "视频呼叫",
    };
    const getList = async (): Promise<void> => {
      try {
        state.loading = true;
        const params = {
          ...queryState.state,
          period: periodRange.value ? periodRange.value.join(",") : "",
        };
        const { data } = await getFileForPage(params);
        state.dataSource = data.records;
        queryState.update({ total: data.total });
        queryState.writeCache();
      } catch {
      } finally {
        state.loading = false;
      }
    };
    const columns = [
      {
        title: "主叫",
        dataIndex: "caller",
        key: "caller",
      },
      {
        title: "被叫",
        dataIndex: "callee",
        key: "callee",
      },
      {
        title: "呼叫类型",
        dataIndex: "type",
        key: "type",
        customRender: ({ text }: { text: keyof typeof callType }): string => callType[text] || "--",
      },
      {
        title: "开始时间",
        dataIndex: "fileCreateTime",
        key: "fileCreateTime",
        customRender: ({ text }: { text: string }): string => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "结束时间",
        dataIndex: "fileEndTime",
        key: "fileEndTime",
        customRender: ({ text }: { text: string }): string => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : ""),
      },
      {
        title: "操作",
        dataIndex: "operate",
        key: "operate",
        customRender: ({ record }: { record: Record<string, unknown> }): JSX.Element => (
          <>
            <Button
              onClick={() => {
                handlePlay(record);
              }}
              type="link"
            >
              播放
            </Button>
          </>
        ),
      },
    ];
    const handlePlay = (record: Record<string, unknown>): void => {
      const url = record.url as string;
      if (url.endsWith(".mp3") || url.endsWith(".mp4")) {
        window.open(record.url as string);
      } else {
        message.warning("音频合成中请稍后再试");
      }
    };
    // const previewFile = async (file: { url: string; name: string; }): Promise<void> => {
    //   try {
    //     const downloadUrl = file.url
    //     await fetch(downloadUrl).then(async (res) =>
    //       res.blob().then((blob) => {
    //         const a = document.createElement('a')
    //         const url = window.URL.createObjectURL(blob)
    //         a.href = url
    //         a.download = file.name
    //         a.click()
    //         message.success('下载成功')
    //         window.URL.revokeObjectURL(url)
    //       })
    //     )
    //   } catch (error) {
    //   }
    // }
    // const handleDownload = (record: Record<string, unknown>): void => {
    //   previewFile({ url: record.url as string, name: record.name as string })
    // }
    const handleSearch = (): void => {
      queryState.resetPage();
      queryState.writeCache();
      getList();
    };
    const handleReset = (): void => {
      queryState.update({
        code: "",
        fileType: "video",
      });
      queryState.resetPage();
      queryState.clearCache();
      periodRange.value = [];
      getList();
    };
    const changePage = (pageNumber: number, pageSize: number): void => {
      queryState.setPage(pageNumber, pageSize);
      getList();
    };
    onMounted(() => {
      getList();
    });

    const layoutSlots = {
      "content-search": (): JSX.Element => (
        <Form layout="inline">
          <FormItem label="时间段">
            <DateRangePicker v-model:value={periodRange.value} picker="date" />
          </FormItem>
          <FormItem label="呼叫类型">
            <Select allowClear options={selectOption} v-model:value={queryState.state.fileType} style={{ width: "200px" }} />
          </FormItem>
          <FormItem>
            <Input placeholder="号码搜索" v-model:value={queryState.state.code} />
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
        <AliasTable
          columns={columns}
          scrollY={500}
          loading={state.loading}
          dataSource={state.dataSource}
          pagination={false}
          applicationCode="COMMAND_DISPATCH"
          tableCode="RADIO_RECORD"
        />
      ),
      "footer-page": (): JSX.Element => (
        <GPagination
          current={queryState.state.pageNumber}
          pageSize={queryState.state.pageSize}
          total={queryState.state.total ?? 0}
          onChange={changePage}
        />
      ),
    };
    return (): JSX.Element => <GLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
