import styles from "./index.module.less";
import { FileUpload } from "@ghcloud/cube-app-design";
import type { TaskFeedbackRecordVO } from "@ghcloud/cube-daily-task-service";
import { Button, Empty, Modal, PopOver, Table } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, ref, type PropType } from "vue";

export const FeedbackRecord = defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<TaskFeedbackRecordVO[]>,
      default: () => [],
    },
  },
  setup(props) {
    const detailVisible = ref<boolean>(false);
    const currentRecord = ref<TaskFeedbackRecordVO | null>(null);

    const openDetail = (record: TaskFeedbackRecordVO): void => {
      currentRecord.value = record;
      detailVisible.value = true;
    };

    const columns = [
      {
        title: "反馈时间",
        dataIndex: "feedbackTime",
        align: "center",
        customRender: ({ record }: { record: TaskFeedbackRecordVO }): string =>
          record.feedbackTime ? dayjs(record.feedbackTime).format("YYYY-MM-DD HH:mm:ss") : "--",
      },
      {
        title: "反馈人",
        dataIndex: "username",
        align: "center",
        customRender: ({ record }: { record: TaskFeedbackRecordVO }): string => record.username || "--",
      },
      {
        title: "反馈部门",
        dataIndex: "feedbackDepName",
        align: "center",
        customRender: ({ record }: { record: TaskFeedbackRecordVO }): string => record.feedbackDepName ?? record.FeedbackDepName ?? "--",
      },
      {
        title: "当前进度",
        dataIndex: "schedule",
        align: "center",
        customRender: ({ record }: { record: TaskFeedbackRecordVO }): JSX.Element => (
          <span class={styles["feedback-progress"]}>{record.schedule ?? "--"}</span>
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center",
        customRender: ({ record }: { record: TaskFeedbackRecordVO }): JSX.Element => (
          <Button class={styles["feedback-action"]} type="link" onClick={() => openDetail(record)}>
            详情
          </Button>
        ),
      },
    ];

    return (): JSX.Element => (
      <div class={styles["feedback-record"]}>
        {props.dataSource.length > 0 ? (
          <Table
            rowKey={(record: TaskFeedbackRecordVO): string => String(record.id ?? `${record.feedbackTime ?? ""}-${record.username ?? ""}`)}
            columns={columns}
            dataSource={props.dataSource}
            pagination={false}
          />
        ) : (
          <Empty description="暂无反馈记录" />
        )}

        <Modal
          title="反馈"
          v-model:visible={detailVisible.value}
          width="720px"
          onCancel={() => {
            detailVisible.value = false;
            currentRecord.value = null;
          }}
        >
          <div class={styles["feedback-detail-row"]}>
            <div class={styles["feedback-detail-label"]}>任务反馈进度：</div>
            <div class={styles["feedback-detail-value"]}>{currentRecord.value?.schedule ?? "--"}</div>
          </div>
          <div class={styles["feedback-detail-row"]}>
            <div class={styles["feedback-detail-label"]}>反馈描述：</div>
            <div class={styles["feedback-detail-value"]}>
              <PopOver content={currentRecord.value?.description || "--"}>{currentRecord.value?.description || "--"}</PopOver>
            </div>
          </div>
          <div class={styles["feedback-detail-row"]}>
            <div class={styles["feedback-detail-label"]}>文件上传：</div>
            <div class={styles["feedback-detail-value"]}>
              <FileUpload value={currentRecord.value?.fileList ?? []} multiple readonly={true} type="picture-card" />
            </div>
          </div>
        </Modal>
      </div>
    );
  },
});
