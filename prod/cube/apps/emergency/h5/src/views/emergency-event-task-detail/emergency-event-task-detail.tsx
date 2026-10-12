import dayjs from "dayjs";
import { Icon, showImagePreview, showNotify } from "vant";
import { computed, defineComponent, onMounted, shallowRef } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { CubeAppService } from "@ghcloud/cube-app-js-sdk";
import type {
  EmergencyEventFeedbackVO,
  EmergencyEventOperationLogVO,
  EmergencyEventTaskPageVO,
  EmergencyEventVO,
} from "@ghcloud/cube-emergency-service/src/type";

import { cubeEmergencyService } from "@/api/server";

import styles from "./emergency-event-task-detail.module.less";

type DetailTab = "task" | "plan" | "progress";

interface FeedbackImage {
  id: string;
  name: string;
  path: string;
}

interface ActivityRecord {
  id: string;
  createTime?: string;
  label: string;
  content?: string;
  imagePath?: string;
}

interface PlanSection {
  title: string;
  content: string;
}

const tabs: Array<{ id: DetailTab; label: string }> = [
  { id: "task", label: "任务详情" },
  { id: "plan", label: "预案内容" },
  { id: "progress", label: "执行情况" },
];

const statusLabels: Record<NonNullable<EmergencyEventTaskPageVO["status"]>, string> = {
  WAITING: "待执行",
  EXECUTING: "执行中",
  COMPLETED: "已完成",
  STOPPED: "已停止",
};
const eventLevelLabels: Record<string, string> = {
  IMPORTANT: "重要",
  ORDINARY: "普通",
  LEVEL_ONE: "一级",
  LEVEL_TWO: "二级",
  LEVEL_THREE: "三级",
};
const eventStatusLabels: Record<string, string> = {
  WAITING_RESPONSE: "待响应",
  RUNNING: "进行中",
  COMPLETED: "已完成",
  TERMINATED: "已终止",
};
const eventSourceLabels: Record<string, string> = {
  ALARM: "真实事件",
  FILE: "预案演练",
};
const businessLabel = (value: string | undefined, labels: Record<string, string>): string => (value ? labels[value] || value : "--");
const formatTime = (value?: string): string => (value ? dayjs(value).format("MM-DD HH:mm") : "--");
const resolveFileUrl = (path?: string): string | undefined => {
  if (!path || /^(https?:|data:|\/\/)/i.test(path)) return path;
  return `http://192.168.0.243:40201/${path.replace(/^\//, "")}`;
};
const parseContent = (value?: string): string[] => {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // 兼容历史普通文本。
  }
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
};
const parsePlanSections = (html?: string): PlanSection[] => {
  if (!html) return [];
  const document = new DOMParser().parseFromString(html, "text/html");
  const headings = Array.from(document.body.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  if (!headings.length) {
    const content = document.body.textContent?.replace(/\s+/g, " ").trim();
    return content ? [{ title: "预案正文", content }] : [];
  }
  return headings
    .map((heading, index) => {
      const content: string[] = [];
      let sibling = heading.nextElementSibling;
      while (sibling && !headings.includes(sibling)) {
        const text = sibling.textContent?.replace(/\s+/g, " ").trim();
        if (text) content.push(text);
        sibling = sibling.nextElementSibling;
      }
      return {
        title: heading.textContent?.replace(/\s+/g, " ").trim() || `第${index + 1}节`,
        content: content.join("\n"),
      };
    })
    .filter((section) => section.content);
};

export const EmergencyEventTaskDetail = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const activeTab = shallowRef<DetailTab>("task");
    const loading = shallowRef(true);
    const task = shallowRef<EmergencyEventTaskPageVO>();
    const canExecute = computed(() => task.value?.status === "WAITING" || task.value?.status === "EXECUTING");
    const event = shallowRef<EmergencyEventVO>();
    const eventTasks = shallowRef<EmergencyEventTaskPageVO[]>([]);
    const operationLogs = shallowRef<EmergencyEventOperationLogVO[]>([]);
    const feedbackRecords = shallowRef<EmergencyEventFeedbackVO[]>([]);
    const feedback = shallowRef("");
    const feedbackImages = shallowRef<FeedbackImage[]>([]);
    const expandedPlanSections = shallowRef<Record<number, boolean>>({ 0: true });
    const submitting = shallowRef(false);
    const isOverdue = (item: EmergencyEventTaskPageVO): boolean =>
      item.status !== "COMPLETED" && !!item.deadline && dayjs().isAfter(dayjs(item.deadline));
    const isCompletedLate = (item: EmergencyEventTaskPageVO): boolean =>
      item.status === "COMPLETED" && !!item.completedAt && !!item.deadline && dayjs(item.completedAt).isAfter(dayjs(item.deadline));
    const isLate = (item: EmergencyEventTaskPageVO): boolean => isOverdue(item) || isCompletedLate(item);
    const progress = computed(() => {
      const total = eventTasks.value.length;
      const completed = eventTasks.value.filter((item) => item.status === "COMPLETED").length;
      return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
    });
    const executionSteps = computed(() => parseContent(task.value?.executionContent));
    const equipmentItems = computed(() => parseContent(task.value?.equipment));
    const planSections = computed(() => parsePlanSections(task.value?.planContentHtml));
    const progressStats = computed(() => ({
      completed: eventTasks.value.filter((item) => item.status === "COMPLETED").length,
      overdue: eventTasks.value.filter((item) => isLate(item)).length,
      executing: eventTasks.value.filter((item) => item.status === "EXECUTING").length,
      waiting: eventTasks.value.filter((item) => item.status === "WAITING").length,
      stopped: eventTasks.value.filter((item) => item.status === "STOPPED").length,
    }));
    const taskExecutorText = (item: EmergencyEventTaskPageVO): string => {
      if (item.executorName) return item.executorId === task.value?.executorId ? `${item.executorName}（我）` : item.executorName;
      return item.executorId ? `执行人 ${item.executorId}` : "未分配";
    };
    const taskResultText = (item: EmergencyEventTaskPageVO): string => {
      if (item.status !== "COMPLETED") return isOverdue(item) ? "未完成" : statusLabels[item.status || "WAITING"];
      if (!item.completedAt || !item.deadline) return "已完成";
      const lagMinutes = dayjs(item.completedAt).diff(dayjs(item.deadline), "minute");
      return `${lagMinutes > 0 ? "+" : ""}${lagMinutes}分钟`;
    };
    const activityRecords = computed<ActivityRecord[]>(() =>
      [
        ...operationLogs.value
          .filter((log) => log.operationType !== "TASK_FEEDBACK")
          .map((log) => ({
            id: `operation-${log.id}`,
            createTime: log.createTime,
            label: log.operationName || log.operationType || "操作记录",
          })),
        ...feedbackRecords.value.map((feedback) => ({
          id: `feedback-${feedback.id}`,
          createTime: feedback.createTime,
          label: feedback.feedbackType === "IMAGE" ? "反馈图片" : "反馈内容",
          content: feedback.content,
          imagePath: resolveFileUrl(feedback.filePath),
        })),
      ].sort((left, right) => dayjs(left.createTime).valueOf() - dayjs(right.createTime).valueOf()),
    );

    const loadData = async (): Promise<void> => {
      try {
        loading.value = true;
        const queryTaskId = route.query.taskId ?? route.query.id;
        let taskId = typeof queryTaskId === "string" ? queryTaskId : String(queryTaskId ?? "");
        if (!/^\d+$/.test(taskId)) {
          const taskPage = await cubeEmergencyService.getMyEmergencyEventTasksPage({ pageNumber: 1, pageSize: 1 });
          taskId = taskPage.records[0]?.id ?? "";
        }
        if (!taskId) {
          showNotify({ type: "warning", message: "暂无可执行任务" });
          return;
        }
        const detail = await cubeEmergencyService.getEmergencyEventTaskDetail(taskId);
        task.value = detail;
        expandedPlanSections.value = { 0: true };
        if (!detail.emergencyEventId) {
          showNotify({ type: "danger", message: "任务未关联事件" });
          return;
        }
        const [eventDetail, tasks, logs, feedbacks] = await Promise.all([
          cubeEmergencyService.getEmergencyEventDetail(detail.emergencyEventId),
          cubeEmergencyService.getEmergencyEventTasks(detail.emergencyEventId),
          cubeEmergencyService.getEmergencyEventOperationLogs(detail.emergencyEventId),
          cubeEmergencyService.getEmergencyEventTaskFeedbacks(detail.id),
        ]);
        event.value = eventDetail;
        eventTasks.value = tasks;
        operationLogs.value = logs.filter((item) => item.emergencyEventTaskId === detail.id);
        feedbackRecords.value = feedbacks;
      } catch {
        showNotify({ type: "danger", message: "获取任务详情失败" });
      } finally {
        loading.value = false;
      }
    };

    const submitFeedback = async (): Promise<void> => {
      if (!canExecute.value || submitting.value) return;
      if (!task.value || (!feedback.value.trim() && !feedbackImages.value.length)) {
        showNotify({ type: "warning", message: "请填写反馈内容或上传照片" });
        return;
      }
      try {
        submitting.value = true;
        if (feedback.value.trim()) {
          await cubeEmergencyService.createEmergencyEventTaskFeedback(task.value.id, {
            feedbackType: "TEXT",
            content: feedback.value.trim(),
          });
        }
        for (const image of feedbackImages.value) {
          await cubeEmergencyService.createEmergencyEventTaskFeedback(task.value.id, {
            feedbackType: "IMAGE",
            fileId: image.id,
          });
        }
        feedback.value = "";
        feedbackImages.value = [];
        await loadData();
        showNotify({ type: "success", message: "反馈已提交" });
      } catch {
        showNotify({ type: "danger", message: "反馈提交失败" });
      } finally {
        submitting.value = false;
      }
    };

    const uploadFeedbackImages = async (): Promise<void> => {
      try {
        const files = await CubeAppService.getInstance().uploadImage(String(3 - feedbackImages.value.length), {
          uploadMethod: ["camera", "album"],
        });
        feedbackImages.value = [
          ...feedbackImages.value,
          ...files
            .filter((file) => file.id && file.path)
            .map((file) => ({ id: file.id, name: file.name, path: file.path }))
            .filter((file) => !feedbackImages.value.some((image) => image.id === file.id)),
        ].slice(0, 3);
      } catch {
        showNotify({ type: "danger", message: "照片上传失败" });
      }
    };

    const removeFeedbackImage = (id: string): void => {
      feedbackImages.value = feedbackImages.value.filter((image) => image.id !== id);
    };

    const previewFeedbackImage = (path: string): void => {
      const images = activityRecords.value.flatMap((record) => (record.imagePath ? [record.imagePath] : []));
      showImagePreview(images, images.indexOf(path));
    };

    const togglePlanSection = (index: number): void => {
      expandedPlanSections.value = {
        ...expandedPlanSections.value,
        [index]: !expandedPlanSections.value[index],
      };
    };

    const completeTask = async (): Promise<void> => {
      if (!task.value || !canExecute.value || submitting.value) return;
      try {
        submitting.value = true;
        await cubeEmergencyService.completeEmergencyEventTask(task.value.id);
        await loadData();
        showNotify({ type: "success", message: "任务已完成" });
      } catch {
        showNotify({ type: "danger", message: "任务完成失败" });
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      void loadData();
    });
    document.title = "任务执行";
    return () => (
      <div class={styles.page}>
        <CubeNavBar showBack title={event.value?.eventCode || "任务执行"} onClickLeft={() => router.back()} />
        <nav class={styles.tabs} aria-label="任务信息栏目">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              class={[styles.tab, activeTab.value === tab.id && styles.active]}
              onClick={() => {
                activeTab.value = tab.id;
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {!loading.value && !task.value && <p class={styles.empty}>未查询到任务数据</p>}
        {task.value && (
          <main class={styles.content}>
            {activeTab.value === "task" && (
              <>
                <section class={styles.card}>
                  <div class={styles.statusRow}>
                    <span class={styles.statusTag}>{task.value.status ? statusLabels[task.value.status] : "未知状态"}</span>
                    <span>{task.value.status ? statusLabels[task.value.status] : "--"}</span>
                  </div>
                  <h1>{task.value.name || "未命名任务"}</h1>
                  <p>事件：{event.value?.name || "--"}</p>
                  <strong class={styles.deadline}>⏱ 截止 {formatTime(task.value.deadline)}</strong>
                  <div class={styles.meta}>
                    <span>执行人：{task.value.executorName || "--"}</span>
                    <span>预计 {task.value.durationMinutes || "--"} 分钟</span>
                  </div>
                </section>
                <section class={styles.card}>
                  <h2>📍 执行地点</h2>
                  <div class={styles.location}>{task.value.locationDesc || "--"}</div>
                </section>
                <section class={styles.card}>
                  <h2>📋 操作步骤</h2>
                  {executionSteps.value.length ? (
                    <ol class={styles.steps}>
                      {executionSteps.value.map((step, index) => (
                        <li key={`${index}-${step}`}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <p>--</p>
                  )}
                </section>
                <section class={styles.card}>
                  <h2>📦 所需装备</h2>
                  {equipmentItems.value.length ? (
                    <div class={styles.equipment}>
                      {equipmentItems.value.map((item, index) => (
                        <span key={`${index}-${item}`}>{item}</span>
                      ))}
                    </div>
                  ) : (
                    <p>--</p>
                  )}
                </section>
                <section class={styles.card}>
                  <h2>🔗 联动设备</h2>
                  {task.value.devices?.length ? (
                    task.value.devices.map((device) => (
                      <div class={styles.device} key={device.id}>
                        <span>{device.deviceName || "未命名设备"}</span>
                        <small>{device.deviceCode || "--"}</small>
                      </div>
                    ))
                  ) : (
                    <p>暂无联动设备</p>
                  )}
                </section>
                <section class={styles.card}>
                  <h2>⏱ 操作记录</h2>
                  {activityRecords.value.length ? (
                    <div class={styles.timeline}>
                      {activityRecords.value.map((record) => (
                        <div class={styles.activity} key={record.id}>
                          <p>
                            {formatTime(record.createTime)} {record.label}
                            {record.content ? `：${record.content}` : ""}
                          </p>
                          {record.imagePath && (
                            <img
                              class={styles.activityImage}
                              src={record.imagePath}
                              alt="反馈图片"
                              onClick={() => previewFeedbackImage(record.imagePath!)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>暂无操作记录</p>
                  )}
                </section>
                {canExecute.value && (
                  <section class={styles.card}>
                    <h2>📝 任务反馈</h2>
                    <textarea
                      value={feedback.value}
                      placeholder="填写现场反馈"
                      rows={2}
                      onInput={(event) => {
                        feedback.value = (event.target as HTMLTextAreaElement).value;
                      }}
                    />
                    <div class={styles.feedbackImages}>
                      {feedbackImages.value.map((image) => (
                        <div class={styles.feedbackImage} key={image.id}>
                          <img src={image.path} alt={image.name || "反馈照片"} />
                          <button onClick={() => removeFeedbackImage(image.id)}>×</button>
                        </div>
                      ))}
                      {feedbackImages.value.length < 3 && (
                        <button
                          class={styles.addImage}
                          aria-label="拍照/相册"
                          disabled={submitting.value}
                          onClick={() => void uploadFeedbackImages()}
                        >
                          <Icon name="photograph" size="1em" />
                        </button>
                      )}
                    </div>
                  </section>
                )}
                {canExecute.value && (
                  <div class={styles.actions}>
                    <button
                      class={styles.feedback}
                      disabled={submitting.value}
                      onClick={() => {
                        void submitFeedback();
                      }}
                    >
                      提交反馈
                    </button>
                    <button
                      class={styles.complete}
                      disabled={submitting.value}
                      onClick={() => {
                        void completeTask();
                      }}
                    >
                      点击完成
                    </button>
                  </div>
                )}
              </>
            )}
            {activeTab.value === "plan" && (
              <section class={styles.card}>
                <h2>事件信息</h2>
                <div class={styles.eventInfo}>
                  <span>
                    事件名称<strong>{event.value?.name || "--"}</strong>
                  </span>
                  <span>
                    事件代号<strong>{event.value?.eventCode || "--"}</strong>
                  </span>
                  <span>
                    事件等级<strong>{businessLabel(event.value?.levelCode, eventLevelLabels)}</strong>
                  </span>
                  <span>
                    事件状态<strong>{businessLabel(event.value?.status, eventStatusLabels)}</strong>
                  </span>
                  <span>
                    事件来源<strong>{businessLabel(event.value?.sourceType, eventSourceLabels)}</strong>
                  </span>
                  <span>
                    发生时间<strong>{formatTime(event.value?.occurredAt)}</strong>
                  </span>
                  <span class={styles.eventInfoWide}>
                    预案名称<strong>{task.value.planName || "--"}</strong>
                  </span>
                </div>
                {planSections.value.length ? (
                  <div class={styles.planSections}>
                    {planSections.value.map((section, index) => (
                      <div class={styles.collapseSection} key={`${index}-${section.title}`}>
                        <button class={styles.collapseHeader} onClick={() => togglePlanSection(index)}>
                          <span>{section.title}</span>
                          <span>{expandedPlanSections.value[index] ? "⌃" : "⌄"}</span>
                        </button>
                        {expandedPlanSections.value[index] && <div class={styles.collapseBody}>{section.content}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div class={styles.planSection}>
                      <h2>执行内容</h2>
                      {executionSteps.value.length ? (
                        <ol class={styles.steps}>
                          {executionSteps.value.map((step, index) => (
                            <li key={`${index}-${step}`}>{step}</li>
                          ))}
                        </ol>
                      ) : (
                        <p>--</p>
                      )}
                    </div>
                    <div class={styles.planSection}>
                      <h2>所需装备</h2>
                      {equipmentItems.value.length ? (
                        <div class={styles.equipment}>
                          {equipmentItems.value.map((item, index) => (
                            <span key={`${index}-${item}`}>{item}</span>
                          ))}
                        </div>
                      ) : (
                        <p>--</p>
                      )}
                    </div>
                  </>
                )}
                <div class={styles.planSection}>
                  <h2>任务备注</h2>
                  <p class={styles.preformatted}>{task.value.remark || "--"}</p>
                </div>
              </section>
            )}
            {activeTab.value === "progress" && (
              <>
                <section class={styles.card}>
                  <h2>任务总进度</h2>
                  <div class={styles.progressSummary}>
                    <strong>{progress.value.percent}%</strong>
                    <span>
                      已完成 {progress.value.completed}/{progress.value.total}
                    </span>
                  </div>
                  <div class={styles.progress}>
                    <i style={{ width: `${progress.value.percent}%` }} />
                  </div>
                  <div class={styles.progressMeta}>
                    <span class={styles.progressCompleted}>🟢 已完成 {progressStats.value.completed}</span>
                    <span class={styles.progressOverdue}>🔴 超时 {progressStats.value.overdue}</span>
                    <span class={styles.progressExecuting}>🟠 执行中 {progressStats.value.executing}</span>
                    <span class={styles.progressWaiting}>⚪ 待执行 {progressStats.value.waiting}</span>
                    {progressStats.value.stopped > 0 && <span>⚫ 已停止 {progressStats.value.stopped}</span>}
                  </div>
                </section>
                <section class={[styles.card, styles.executionRows]}>
                  {eventTasks.value.length ? (
                    eventTasks.value.map((item) => (
                      <div
                        class={[
                          styles.executionRow,
                          isLate(item) && styles.executionRowOverdue,
                          item.status === "COMPLETED" && styles.executionRowCompleted,
                        ]}
                        key={item.id}
                      >
                        <div class={styles.executionTaskMain}>
                          <span class={styles.executionIcon}>
                            {item.status === "COMPLETED" ? "✓" : isOverdue(item) ? "✗" : item.status === "STOPPED" ? "■" : "●"}
                          </span>
                          <span>{item.name || "未命名任务"}</span>
                        </div>
                        <div class={styles.executionTaskMeta}>
                          <span>{taskExecutorText(item)}</span>
                          <small
                            class={
                              isLate(item)
                                ? styles.executionOverdue
                                : item.status === "COMPLETED"
                                  ? styles.executionCompleted
                                  : styles.executionPending
                            }
                          >
                            {taskResultText(item)}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>暂无事件任务</p>
                  )}
                </section>
              </>
            )}
          </main>
        )}
      </div>
    );
  },
});
