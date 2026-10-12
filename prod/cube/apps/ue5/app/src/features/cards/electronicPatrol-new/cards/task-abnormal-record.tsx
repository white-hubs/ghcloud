import { defineComponent, onMounted, reactive, ref, provide } from "vue";

import ModalCommandDispatch from "../components/modal-command-dispatch";
import CardTitleIcon from "@/features/cards/_shared/card-title-icon/card-title-icon";
import RollTable from "@/features/panel-shell/tables/roll-table/roll-table";
import SubPanelTemplate from "@/features/panel-shell/templates/sub-panel-template/sub-panel-template";
import { taskAbnormalList, taskAbnormalNum } from "@/infrastructure/api/maintain";
import CountTo from "@/shared-ui/panel/count-to/count-to";
import DateInlineForm from "@/shared-ui/panel/dateInlineForm";
import NoData from "@/shared-ui/panel/noData";
import { panelCardLoadedKey } from "@/shared-ui/panel/panel-card-loaded-context";
import PanelCardLoading from "@/shared-ui/panel/panel-card-loading";
import { ModelValueItf } from "@/shared-ui/panel/types";

import styles from "./task-abnormal-record.module.less";

type TaskRow = {
  taskId?: string;
  taskName?: string;
  timePeriod?: string;
  state?: string;
  username?: string;
  key?: string | number;
};

const toNumber = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const resolveStateTone = (state?: string): string => {
  const text = String(state ?? "").trim();
  if (!text || text === "--") return "";
  if (/结束|完成|已处理|已办/.test(text)) return styles.isEnded;
  if (/未处理|待处理|进行|执行中/.test(text)) return styles.isPending;
  if (/正常|通过/.test(text)) return styles.isDone;
  if (/异常|告警|失败/.test(text)) return styles.isAbnormal;
  return "";
};

export const TaskAbnormalRecord = defineComponent({
  name: "TaskAbnormalRecord",
  setup() {
    const taskExceptionTime = ref<ModelValueItf>({
      timeType: "THIS_YEAR",
      dateRange: [],
    });
    const summary = reactive({
      total: 0,
      undo: 0,
      finished: 0,
    });
    const patrolData = ref<TaskRow[]>([]);
    const loaded = ref(false);
    provide(panelCardLoadedKey, loaded);
    const commandParameter = ref<Record<string, unknown>>({ id: "" });
    const commandModalShow = ref(false);

    const column = [
      {
        title: "任务名称",
        dataIndex: "taskName",
        flex: 1.35,
        align: "left" as const,
      },
      {
        title: "时间段",
        dataIndex: "timePeriod",
        flex: 1.05,
        align: "center" as const,
      },
      {
        title: "状态",
        dataIndex: "state",
        flex: 0.75,
        align: "center" as const,
        slots: { customRender: "state" },
      },
      {
        title: "执行人",
        dataIndex: "username",
        flex: 0.75,
        align: "center" as const,
      },
    ];

    const tableSlots = {
      state: ({ record }: { record: TaskRow }) => (
        <span class={[styles.statusTag, resolveStateTone(record.state)]}>{record.state || "--"}</span>
      ),
    };

    const changeTaskException = async (): Promise<void> => {
      try {
        const params = {
          type: taskExceptionTime.value.timeType,
          period: taskExceptionTime.value.dateRange?.join(",") ?? "",
        };
        const [res, data] = await Promise.all([
          taskAbnormalNum(params),
          taskAbnormalList({
            ...params,
            pageNumber: 1,
            pageSize: 50,
          }),
        ]);
        summary.total = toNumber(res?.abnormalNum);
        summary.undo = toNumber(res?.undoNum);
        summary.finished = toNumber(res?.finishedNum);
        const rows = Array.isArray(data?.records) ? data.records : [];
        patrolData.value = rows.map((item: TaskRow, index: number) => ({
          ...item,
          key: item.taskId ?? `${item.taskName ?? "task"}-${index}`,
          taskName: item.taskName || "--",
          timePeriod: item.timePeriod || "--",
          state: item.state || "--",
          username: item.username || "--",
        }));
      } catch {
        summary.total = 0;
        summary.undo = 0;
        summary.finished = 0;
        patrolData.value = [];
      } finally {
        loaded.value = true;
      }
    };

    const clickRow = (params: TaskRow): void => {
      commandParameter.value = { id: params.taskId ?? "" };
      commandModalShow.value = true;
    };

    onMounted(() => {
      void changeTaskException();
    });

    const renderBody = (isZoom: boolean): JSX.Element => {
      if (!loaded.value) {
        return <PanelCardLoading zoom={isZoom} />;
      }

      return (
        <div class={["task-abnormal-record-v2-panel", styles.cardBody, isZoom ? styles.isZoom : ""]} data-no-zoom>
          <div class={styles.statsRow}>
            <div class={[styles.statCard, styles.isDanger]}>
              <span class={styles.statLabel}>异常任务数</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={summary.total} separator="" duration={1400} />
                <em class={styles.statUnit}>个</em>
              </span>
            </div>
            <div class={[styles.statCard, styles.isAmber]}>
              <span class={styles.statLabel}>未处理</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={summary.undo} separator="" duration={1400} />
                <em class={styles.statUnit}>个</em>
              </span>
            </div>
            <div class={[styles.statCard, styles.isSuccess]}>
              <span class={styles.statLabel}>已处理</span>
              <span class={styles.statValue}>
                <CountTo startVal={0} endVal={summary.finished} separator="" duration={1400} />
                <em class={styles.statUnit}>个</em>
              </span>
            </div>
          </div>

          <div class={[styles.tableSurface, "visual-v2-roll-table"]}>
            {patrolData.value.length === 0 ? (
              <div class={styles.emptySurface}>
                <NoData />
              </div>
            ) : (
              <RollTable
                column={column}
                data={patrolData.value}
                showLength={isZoom ? 7 : 5}
                rowHeight={isZoom ? 44 : 40}
                onClickRow={clickRow}
                v-slots={tableSlots}
              />
            )}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <>
        <div class="v2-panel-root">
          <SubPanelTemplate
            title="任务异常记录"
            class="visual-v2-sub-panel v2-panel-card task-abnormal-record-v2-panel"
            zoomable
            zoom-title="任务异常记录详情"
            zoom-width={900}
            v-slots={{
              titleIcon: () => <CardTitleIcon name="overview-alarm" />,
              extra: () => (
                <div class={styles.headerToolbar} data-no-zoom>
                  <DateInlineForm
                    modelValue={taskExceptionTime.value}
                    onUpdate:modelValue={(v) => {
                      taskExceptionTime.value = v;
                    }}
                    onSearch={changeTaskException}
                  />
                </div>
              ),
              default: () => renderBody(false),
              "zoom-content": () => renderBody(true),
            }}
          />
        </div>
        <ModalCommandDispatch
          showModal={commandModalShow.value}
          parameter={commandParameter.value}
          onClose={() => {
            commandModalShow.value = false;
          }}
        />
      </>
    );
  },
});

export default TaskAbnormalRecord;
