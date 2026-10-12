import styles from "./work-handover-detail.module.less";
import { cubeWorkCenterService } from "@/api/service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Space, Table, Form, FormItem, PopOver, ImagePreviewGroup, Image } from "@ghcloud/cube-ui";
import { kkFilePreview, type FileState } from "@ghcloud/cube-utils";
import type { HandoverRecordDetailVO, FileVO } from "@ghcloud/cube-work-center-service/src/type";
import dayjs from "dayjs";
import { defineComponent, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";

export const taskStatus = {
  TODO: "待办",
  DONE: "已办",
};
export const taskStatusColor = new Map([
  ["TODO", "#1d66ff"],
  ["DONE", "#6ab539"],
]);

export const WorkHandoverDetail = defineComponent({
  setup: () => {
    // Const { buttonText, operate } = useListOperate()
    const route = useRoute();
    const state = reactive({
      detail: {} as HandoverRecordDetailVO,
      loading: false,
    });
    const getDetailInfo = async (): Promise<void> => {
      const id = route.query.id as string;
      if (!id) {
        return;
      }
      try {
        const res = await cubeWorkCenterService.getHandoverDetail({ id });
        state.detail = res;
      } catch {}
    };

    onMounted(async () => {
      await getDetailInfo();
    });

    const columns = [
      {
        title: "任务名称",
        dataIndex: "taskName",
        align: "center",
        width: 220,
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "任务时间",
        dataIndex: "taskTime",
        width: 180,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || ""}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "任务类型",
        dataIndex: "businessTypeName",
        width: 100,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        title: "任务状态",
        dataIndex: "businessStatusName",
        width: 120,
        align: "center",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      // {
      //   DataIndex: 'action',
      //   Title: '操作',
      //   Width: 120,
      //   Align: 'center',
      //   CustomRender: ({ record } : { record: TaskRecord }): JSX.Element => {
      //     Const type = record?.status === 'TODO' ? 'waiting' :  record?.status === 'DONE' ? 'done' : 'waiting'
      //     Return (
      //       <Button type='link' size="small" onClick={() => {
      //         Operate(record, type)
      //       }}>{buttonText(record)}</Button>
      //     )
      //   },
      // },
    ];
    const previewFile = (item: FileVO): void => {
      item.name = `${item.name}.${item.type}`;
      kkFilePreview(item as unknown as FileState);
    };
    const isImage = (file: FileVO): boolean => {
      const imageTypes = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
      return !!file.type && imageTypes.includes(file.type.toLowerCase());
    };
    const layoutSlots = {
      "layout-content": () => (
        <div class={styles["detail-content"]}>
          <Form layout="horizontal">
            <FormItem label="交班人">
              <span>{state.detail?.shiftOverUserName ?? "--"}</span>
            </FormItem>
          </Form>
          <Form layout="vertical">
            <FormItem label="交接事项">
              <Table columns={columns} size={"small"} dataSource={state.detail?.shiftOverTask} scrollY={300} rowKey="id" />
            </FormItem>
          </Form>
          <Form layout="horizontal">
            <FormItem label="其他的事项或问题">
              <span>{state?.detail?.remarks ?? "--"}</span>
            </FormItem>
          </Form>
          <Form layout="horizontal">
            <FormItem label="附件">
              {state?.detail?.files?.length > 0 ? (
                <>
                  <ImagePreviewGroup>
                    {state?.detail?.files
                      .filter((file) => isImage(file))
                      .map((file, n) => (
                        <Image key={file.id || n} src={file.path} style={{ width: "100px", height: "100px" }} width={100} height={100} />
                      ))}
                  </ImagePreviewGroup>
                  {state?.detail?.files
                    .filter((file) => !isImage(file))
                    .map((file, n) => (
                      <div key={file.id || n} class={styles["file-item"]} onClick={() => previewFile(file)}>
                        <a>{`${file.name}.${file.type}`}</a>
                      </div>
                    ))}
                </>
              ) : (
                <div>--</div>
              )}
            </FormItem>
          </Form>
        </div>
      ),
      "footer-page": () => (
        <Space>
          <Button
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </Space>
      ),
    };

    return () => <CubeLayout title="工作交接记录详情" v-slots={layoutSlots} />;
  },
});
