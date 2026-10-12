import {
  Button,
  DropdownItem,
  DropdownMenu,
  Field,
  List,
  Picker,
  Popup,
  PullRefresh,
  Search,
  Tag,
  showConfirmDialog,
  showToast,
} from "vant";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import type {
  PublicOpinionAlertEventVO,
  PublicOpinionAlertPushRecordVO,
  PublicOpinionAlertReceiverVO,
  PublicOpinionAlertVO,
  PushStatus,
  WarningLevel,
} from "@ghcloud/cube-service-interface/security-opinion";

import { Bar } from "@/components/bar/bar";
import {
  PAGE_SIZE,
  PUSH_STATUS_LABEL,
  PUSH_STATUS_OPTIONS,
  SENTIMENT_LABEL,
  WARNING_LEVEL_LABEL,
  WARNING_LEVEL_OPTIONS,
  WARNING_LEVEL_TAG,
} from "@/constants";
import { securityOpinionApi } from "@/services/security-opinion-api";
import { formatDateTime } from "@/utils/format-datetime";

import styles from "./alert-management.module.less";

function parseIds(text: string): string[] {
  return text
    .split(/[,\n，、\s]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function nodeText(node: { node?: string; content?: string; description?: string }): string {
  return node.node || node.content || node.description || "-";
}

function alertKey(item: PublicOpinionAlertVO): string {
  const raw = item as PublicOpinionAlertVO & { opinionId?: string | number; id?: string | number };
  const id = raw.opinionId ?? raw.id;
  return id === undefined || id === null || id === "" ? "" : String(id);
}

function isArchivedEvent(event?: PublicOpinionAlertEventVO | null): boolean {
  return String(event?.status ?? event?.eventStatus ?? event?.archiveStatus ?? "").toUpperCase() === "ARCHIVED";
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function receiverKey(receiver: PublicOpinionAlertReceiverVO): string {
  return receiver.userId || receiver.id;
}

function receiverLabel(receiver: PublicOpinionAlertReceiverVO): string {
  const name = receiver.name || receiver.userName || `用户${receiverKey(receiver)}`;
  const mobile = receiver.mobile ? ` ${receiver.mobile}` : "";
  const org = receiver.organizationName ? `（${receiver.organizationName}）` : "";
  return `${name}${mobile}${org}`;
}

function receiverName(receiver: PublicOpinionAlertReceiverVO): string {
  return receiver.userName || receiver.name || `用户${receiverKey(receiver)}`;
}

function nowTimeValues(): string[] {
  const now = new Date();
  return [String(now.getFullYear()), pad2(now.getMonth() + 1), pad2(now.getDate()), pad2(now.getHours()), pad2(now.getMinutes())];
}

function formatActionTime(values: string[]): string {
  const [year, month, rawDay, hour, minute] = values;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const day = pad2(Math.min(Number(rawDay), lastDay));
  return `${year}-${month}-${day} ${hour}:${minute}:00`;
}

export const AlertManagementPage = defineComponent({
  name: "AlertManagementPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const rows = ref<PublicOpinionAlertVO[]>([]);
    const activeAlert = ref<PublicOpinionAlertVO | null>(null);
    const refreshing = ref(false);
    const loading = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const requestSeq = ref(0);
    const manualVisible = ref(false);
    const manualTarget = ref<PublicOpinionAlertVO | null>(null);
    const manualIds = ref("");
    const pushRecords = ref<PublicOpinionAlertPushRecordVO[]>([]);
    const eventDetail = ref<PublicOpinionAlertEventVO | null>(null);
    const archiveVisible = ref(false);
    const actionTimePickerVisible = ref(false);
    const actionTimePickerValues = ref(nowTimeValues());
    const operatorVisible = ref(false);
    const operatorKeyword = ref("");
    const operatorRows = ref<PublicOpinionAlertReceiverVO[]>([]);
    const operatorPageNumber = ref(1);
    const operatorTotal = ref(0);
    const operatorLoading = ref(false);
    const operatorFinished = ref(false);
    const operatorRequestSeq = ref(0);

    const filters = reactive({
      keyword: "",
      warningLevel: "" as WarningLevel | "",
      pushStatus: "" as PushStatus | "",
    });

    const archiveForm = reactive({
      archiveRemark: "",
      actionTime: "",
      actionType: "",
      actionContent: "",
      operatorUserId: "",
      operatorName: "",
    });

    const yearOptions = Array.from({ length: 7 }, (_, index) => {
      const year = new Date().getFullYear() - 1 + index;
      return { text: `${year}年`, value: String(year) };
    });
    const monthOptions = Array.from({ length: 12 }, (_, index) => ({ text: `${pad2(index + 1)}月`, value: pad2(index + 1) }));
    const dayOptions = Array.from({ length: 31 }, (_, index) => ({ text: `${pad2(index + 1)}日`, value: pad2(index + 1) }));
    const hourOptions = Array.from({ length: 24 }, (_, index) => ({ text: `${pad2(index)}时`, value: pad2(index) }));
    const minuteOptions = Array.from({ length: 60 }, (_, index) => ({ text: `${pad2(index)}分`, value: pad2(index) }));
    const actionTimeColumns = [yearOptions, monthOptions, dayOptions, hourOptions, minuteOptions];

    const loadList = async (resetPage = false): Promise<void> => {
      if (loading.value && !resetPage) return;
      const seq = requestSeq.value + 1;
      requestSeq.value = seq;
      if (resetPage) {
        pageNumber.value = 1;
        total.value = 0;
        rows.value = [];
        finished.value = false;
      }
      loading.value = true;
      const currentPage = pageNumber.value;
      try {
        const result = await securityOpinionApi.pageAlerts({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          keyword: filters.keyword.trim() || undefined,
          warningLevel: filters.warningLevel || undefined,
          pushStatus: filters.pushStatus || undefined,
        });
        if (seq !== requestSeq.value) return;
        total.value = result.total ?? 0;
        rows.value = resetPage ? result.records : [...rows.value, ...result.records];
        pageNumber.value = currentPage + 1;
        finished.value = (total.value > 0 && rows.value.length >= total.value) || result.records.length < PAGE_SIZE;
      } finally {
        if (seq === requestSeq.value) {
          loading.value = false;
          refreshing.value = false;
        }
      }
    };

    const reset = (): void => {
      filters.keyword = "";
      filters.warningLevel = "";
      filters.pushStatus = "";
      void loadList(true);
    };

    const onRefresh = async (): Promise<void> => {
      refreshing.value = true;
      await loadList(true);
    };

    const openManual = (item: PublicOpinionAlertVO): void => {
      manualTarget.value = item;
      manualIds.value = "";
      manualVisible.value = true;
    };

    const replaceAlert = (target: PublicOpinionAlertVO, next: PublicOpinionAlertVO): void => {
      const targetKey = alertKey(target);
      rows.value = rows.value.map((item) => (alertKey(item) === targetKey ? { ...item, ...next } : item));
      if (manualTarget.value && alertKey(manualTarget.value) === targetKey) {
        manualTarget.value = { ...manualTarget.value, ...next };
      }
    };

    const refreshAlert = async (target: PublicOpinionAlertVO): Promise<void> => {
      try {
        replaceAlert(target, await securityOpinionApi.getAlert(alertKey(target)));
      } catch {
        showToast("推送状态刷新失败，请稍后重新查询");
      }
    };

    const push = async (item: PublicOpinionAlertVO, ids?: string[]): Promise<void> => {
      await securityOpinionApi.pushAlert(alertKey(item), ids?.length ? { receiverUserIds: ids } : {});
      manualVisible.value = false;
      showToast("推送任务已提交");
      await refreshAlert(item);
    };

    const loadEvent = async (eventId?: string): Promise<void> => {
      eventDetail.value = null;
      if (!eventId) {
        return;
      }
      eventDetail.value = await securityOpinionApi.getAlertEvent(eventId);
    };

    const loadDetailByOpinionId = async (opinionId: string): Promise<void> => {
      activeAlert.value = null;
      pushRecords.value = [];
      eventDetail.value = null;
      try {
        const detail = await securityOpinionApi.getAlert(opinionId);
        activeAlert.value = detail;
        pushRecords.value = await securityOpinionApi.listAlertPushRecords(opinionId);
        await loadEvent(detail.relatedEventId);
      } catch {
        showToast("预警详情加载失败");
      }
    };

    const openDetail = (item: PublicOpinionAlertVO): void => {
      const key = alertKey(item);
      if (!key) {
        showToast("缺少预警ID，无法查看详情");
        return;
      }
      void router.push({ path: "/alerts", query: { opinionId: key } });
    };

    const resetArchiveForm = (): void => {
      archiveForm.archiveRemark = "";
      archiveForm.actionTime = "";
      archiveForm.actionType = "";
      archiveForm.actionContent = "";
      archiveForm.operatorUserId = "";
      archiveForm.operatorName = "";
      actionTimePickerValues.value = nowTimeValues();
      operatorKeyword.value = "";
      operatorRows.value = [];
      operatorPageNumber.value = 1;
      operatorTotal.value = 0;
      operatorFinished.value = false;
      operatorRequestSeq.value += 1;
    };

    const openArchive = (): void => {
      resetArchiveForm();
      archiveVisible.value = true;
      void loadOperators(true);
    };

    const loadOperators = async (resetPage = false): Promise<void> => {
      if (operatorLoading.value && !resetPage) return;
      if (!resetPage && operatorFinished.value) return;
      const seq = operatorRequestSeq.value + 1;
      operatorRequestSeq.value = seq;
      if (resetPage) {
        operatorPageNumber.value = 1;
        operatorTotal.value = 0;
        operatorRows.value = [];
        operatorFinished.value = false;
      }
      operatorLoading.value = true;
      const currentPage = operatorPageNumber.value;
      try {
        const result = await securityOpinionApi.pageAlertReceivers({
          pageNumber: currentPage,
          pageSize: PAGE_SIZE,
          keyword: operatorKeyword.value.trim() || undefined,
        });
        if (seq !== operatorRequestSeq.value) return;
        operatorTotal.value = result.total ?? 0;
        const existing = new Map<string, PublicOpinionAlertReceiverVO>();
        (resetPage ? [] : operatorRows.value).forEach((receiver) => existing.set(receiverKey(receiver), receiver));
        result.records.forEach((receiver) => existing.set(receiverKey(receiver), receiver));
        operatorRows.value = Array.from(existing.values());
        operatorPageNumber.value = currentPage + 1;
        operatorFinished.value =
          result.records.length < PAGE_SIZE || (operatorTotal.value > 0 && operatorRows.value.length >= operatorTotal.value);
      } finally {
        if (seq === operatorRequestSeq.value) {
          operatorLoading.value = false;
        }
      }
    };

    const searchOperators = (keyword = ""): void => {
      operatorKeyword.value = keyword;
      void loadOperators(true);
    };

    const openOperatorPicker = (): void => {
      operatorVisible.value = true;
      if (!operatorRows.value.length && !operatorLoading.value) {
        void loadOperators(true);
      }
    };

    const selectOperator = (receiver: PublicOpinionAlertReceiverVO): void => {
      archiveForm.operatorUserId = receiverKey(receiver);
      archiveForm.operatorName = receiverName(receiver);
      operatorVisible.value = false;
    };

    const confirmActionTime = ({ selectedValues }: { selectedValues: string[] }): void => {
      actionTimePickerValues.value = selectedValues.map(String);
      archiveForm.actionTime = formatActionTime(actionTimePickerValues.value);
      actionTimePickerVisible.value = false;
    };

    const archiveEvent = async (): Promise<void> => {
      if (!eventDetail.value?.eventId) return;
      if (!archiveForm.archiveRemark.trim()) {
        showToast("请填写归档说明");
        return;
      }
      if (!archiveForm.actionTime) {
        showToast("请选择应对时间");
        return;
      }
      if (!archiveForm.actionType.trim()) {
        showToast("请填写应对类型");
        return;
      }
      if (!archiveForm.actionContent.trim()) {
        showToast("请填写应对内容");
        return;
      }
      if (!archiveForm.operatorUserId) {
        showToast("请选择操作人");
        return;
      }
      await showConfirmDialog({ title: "事件归档", message: "确认将该预警事件归档？" });
      await securityOpinionApi.archiveAlertEvent(eventDetail.value.eventId, {
        archiveRemark: archiveForm.archiveRemark.trim(),
        responseActions: [
          {
            actionTime: archiveForm.actionTime,
            actionType: archiveForm.actionType.trim(),
            actionContent: archiveForm.actionContent.trim(),
            operatorUserId: archiveForm.operatorUserId,
            operatorName: archiveForm.operatorName.trim(),
          },
        ],
      });
      archiveVisible.value = false;
      eventDetail.value = await securityOpinionApi.getAlertEvent(eventDetail.value.eventId);
      showToast("事件已归档，可生成复盘报告");
      void loadList(true);
    };

    const goReviewReport = (): void => {
      if (!eventDetail.value?.eventId) return;
      if (!isArchivedEvent(eventDetail.value)) {
        showToast("请先归档事件后再生成复盘报告");
        return;
      }
      void router.push({ path: "/review-reports", query: { eventId: eventDetail.value.eventId } });
    };

    onMounted(() => {
      document.title = "预警管理";
      void loadList(true);
    });

    watch(
      () => route.query.opinionId,
      (value) => {
        const opinionId = typeof value === "string" ? value : "";
        if (opinionId) {
          void loadDetailByOpinionId(opinionId);
          return;
        }
        activeAlert.value = null;
        pushRecords.value = [];
        eventDetail.value = null;
      },
      { immediate: true },
    );

    const levelTag = (item: PublicOpinionAlertVO): JSX.Element => (
      <Tag type={WARNING_LEVEL_TAG[String(item.warningLevel ?? "").toUpperCase()] ?? "primary"} plain>
        {item.warningLevelText || WARNING_LEVEL_LABEL[String(item.warningLevel ?? "").toUpperCase()] || "-"}
      </Tag>
    );

    const card = (item: PublicOpinionAlertVO): JSX.Element => (
      <div key={item.id} class={styles.card} onClick={() => openDetail(item)}>
        <div class={styles.cardHeader}>
          <div class={styles.title}>{item.title}</div>
          {levelTag(item)}
        </div>
        <div class={styles.summary}>{item.summary || item.content || "-"}</div>
        <div class={styles.metaGrid}>
          <span>AI分析热度：{item.heatIndex ?? "-"}</span>
          <span>推送：{item.pushStatusText || PUSH_STATUS_LABEL[String(item.pushStatus ?? "")] || "-"}</span>
          <span>来源：{item.source || "-"}</span>
          <span>情感：{SENTIMENT_LABEL[item.sentiment]}</span>
          <span>预警：{formatDateTime(item.alertTime)}</span>
          <span>次数：{item.pushCount ?? 0}</span>
        </div>
        <div class={styles.actions}>
          <Button
            class={styles.pushButton}
            size="small"
            type="primary"
            plain
            onClick={(event) => {
              event.stopPropagation();
              openManual(item);
            }}
          >
            推送
          </Button>
        </div>
      </div>
    );

    const detail = (item: PublicOpinionAlertVO): JSX.Element => (
      <div class={styles.detailPage}>
        <Bar name="预警详情" isShowRight={false} />
        <section class={styles.card}>
          <div class={styles.cardHeader}>
            <div class={styles.title}>{item.title}</div>
            {levelTag(item)}
          </div>
          <div class={styles.summary}>{item.summary || item.content || "-"}</div>
          <div class={styles.metaGrid}>
            <span>AI分析热度：{item.heatIndex ?? "-"}</span>
            <span>推送：{item.pushStatusText || PUSH_STATUS_LABEL[String(item.pushStatus ?? "")] || "-"}</span>
            <span>来源：{item.source || "-"}</span>
            <span>情感：{SENTIMENT_LABEL[item.sentiment]}</span>
            <span>预警：{formatDateTime(item.alertTime)}</span>
            <span>次数：{item.pushCount ?? 0}</span>
          </div>
        </section>
        <section class={styles.card}>
          <div class={styles.sectionTitle}>预警事件</div>
          {eventDetail.value ? (
            <>
              <div class={styles.eventMeta}>
                热度 {eventDetail.value.heatIndex ?? "-"} · {formatDateTime(eventDetail.value.alertTime)}
              </div>
              {(eventDetail.value.timeline ?? []).map((node, idx) => (
                <div key={`${node.time}-${idx}`} class={styles.timelineLine}>
                  <span>{formatDateTime(node.actionTime || node.time)}</span>
                  <div>{nodeText(node)}</div>
                </div>
              ))}
            </>
          ) : (
            <div class={styles.empty}>暂无关联事件</div>
          )}
        </section>
        <section class={styles.card}>
          <div class={styles.sectionTitle}>推送记录</div>
          {pushRecords.value.length ? (
            pushRecords.value.map((record) => (
              <div key={record.id} class={styles.recordLine}>
                <span>接收人：{record.receiverName || "-"}</span>
                <span>渠道：{record.channelText || "-"}</span>
                <span>状态：{record.pushStatusText || PUSH_STATUS_LABEL[String(record.pushStatus ?? "")] || "-"}</span>
                <span>时间：{formatDateTime(record.pushTime)}</span>
                <span>失败原因：{record.failureReason || record.responseMessage || "-"}</span>
              </div>
            ))
          ) : (
            <div class={styles.empty}>暂无推送记录</div>
          )}
        </section>
      </div>
    );

    return (): JSX.Element =>
      activeAlert.value ? (
        detail(activeAlert.value)
      ) : (
        <div class={styles.page}>
          <Bar name="预警管理" isShowRight={false} onReset={reset} onSubmit={() => void loadList(true)} />
          <div class={styles.searchBar}>
            <Search
              v-model={filters.keyword}
              placeholder="搜索预警标题、摘要"
              shape="round"
              class={styles.search}
              onSearch={() => void loadList(true)}
              onClear={() => void loadList(true)}
            />
          </div>
          <div class={styles.filterBar}>
            <DropdownMenu overlay={false} class={styles.dropdownMenu}>
              <DropdownItem
                v-model={filters.warningLevel}
                title={`等级：${WARNING_LEVEL_OPTIONS.find((item) => item.value === filters.warningLevel)?.label ?? "全部"}`}
                options={WARNING_LEVEL_OPTIONS}
                onChange={() => void loadList(true)}
              />
              <DropdownItem
                v-model={filters.pushStatus}
                title={`状态：${PUSH_STATUS_OPTIONS.find((item) => item.value === filters.pushStatus)?.label ?? "全部"}`}
                options={PUSH_STATUS_OPTIONS}
                onChange={() => void loadList(true)}
              />
            </DropdownMenu>
          </div>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <List
              class={styles.list}
              v-model:loading={loading.value}
              finished={finished.value}
              finishedText={rows.value.length ? "— 没有更多了 —" : "暂无预警"}
              onLoad={() => void loadList()}
            >
              {rows.value.map(card)}
            </List>
          </PullRefresh>
          <Popup v-model:show={manualVisible.value} position="bottom" round>
            <div class={styles.popupBody}>
              <div class={styles.popupTitle}>手动推送预警</div>
              <div class={styles.popupText}>{manualTarget.value?.title}</div>
              <Field v-model={manualIds.value} label="接收人ID" placeholder="多个ID用逗号分隔" />
              <Button
                block
                type="primary"
                disabled={!manualTarget.value}
                onClick={() => manualTarget.value && void push(manualTarget.value, parseIds(manualIds.value))}
              >
                确认推送
              </Button>
            </div>
          </Popup>
          <Popup v-model:show={archiveVisible.value} position="bottom" round>
            <div class={styles.popupBody}>
              <div class={styles.popupTitle}>事件归档</div>
              <Field v-model={archiveForm.archiveRemark} required label="归档说明" type="textarea" rows={2} placeholder="填写归档说明" />
              <Field
                modelValue={archiveForm.actionTime}
                required
                readonly
                isLink
                label="应对时间"
                placeholder="请选择应对时间"
                onClick={() => {
                  actionTimePickerVisible.value = true;
                }}
              />
              <Field v-model={archiveForm.actionType} required label="应对类型" placeholder="如：发布公告/内部核查" />
              <Field v-model={archiveForm.actionContent} required label="应对内容" type="textarea" rows={2} placeholder="补充应对措施" />
              <Field
                modelValue={archiveForm.operatorName}
                required
                readonly
                isLink
                label="操作人"
                placeholder="请选择操作人"
                onClick={openOperatorPicker}
              />
              <Button block type="primary" onClick={() => void archiveEvent()}>
                确认归档
              </Button>
            </div>
          </Popup>
          <Popup v-model:show={actionTimePickerVisible.value} position="bottom" round>
            <Picker
              title="选择应对时间"
              columns={actionTimeColumns}
              onConfirm={confirmActionTime}
              onCancel={() => {
                actionTimePickerVisible.value = false;
              }}
            />
          </Popup>
          <Popup v-model:show={operatorVisible.value} position="bottom" round style={{ maxHeight: "78vh" }}>
            <div class={styles.popupBody}>
              <div class={styles.popupTitle}>选择操作人</div>
              <Search
                v-model={operatorKeyword.value}
                placeholder="搜索姓名、手机号或组织"
                shape="round"
                onSearch={searchOperators}
                onClear={() => searchOperators("")}
              />
              <List
                class={styles.operatorList}
                v-model:loading={operatorLoading.value}
                finished={operatorFinished.value}
                onLoad={() => void loadOperators()}
              >
                {operatorRows.value.map((receiver) => (
                  <div key={receiverKey(receiver)} class={styles.operatorItem} onClick={() => selectOperator(receiver)}>
                    <div class={styles.operatorName}>{receiverName(receiver)}</div>
                    <div class={styles.operatorMeta}>
                      {[receiver.mobile, receiver.organizationName].filter(Boolean).join(" · ") || receiverKey(receiver)}
                    </div>
                  </div>
                ))}
              </List>
            </div>
          </Popup>
        </div>
      );
  },
});
