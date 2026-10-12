import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeModal } from "@ghcloud/cube-app-design";
import type {
  BehaviorAuditStatus,
  BehaviorInputType,
  BehaviorType,
  SafetyCreditBehaviorPageQuery,
  SafetyCreditBehaviorVO,
  SafetyCreditDataSourceVO,
  SafetyCreditEventMappingVO,
  SafetyCreditId,
  SafetyCreditManualBehaviorCommand,
  SafetyCreditMerchantVO,
} from "@ghcloud/cube-safety-credit-service";
import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Input,
  Modal,
  Page,
  PopOver,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
  message,
} from "@ghcloud/cube-ui";

import {
  auditStatusColor,
  auditStatusLabel,
  auditStatusOptions,
  behaviorTypeLabel,
  behaviorTypeOptions,
  cleanText,
  displayText,
  formatDateTime,
  inputTypeLabel,
  inputTypeOptions,
  toQueryPeriod,
} from "../s2/shared";
import { cubeSafetyCreditService } from "@/api/server";

import "../s2/s2.less";

type OptionalBehaviorType = BehaviorType | "";
type OptionalInputType = BehaviorInputType | "";
type OptionalAuditStatus = BehaviorAuditStatus | "";

interface BehaviorQueryForm {
  pageNumber: number;
  pageSize: number;
  merchantName: string;
  applicationName: string;
  eventName: string;
  behaviorType: OptionalBehaviorType;
  inputType: OptionalInputType;
  auditStatus: OptionalAuditStatus;
  period: [string, string];
}

interface ManualBehaviorForm {
  merchantId: string;
  eventId: string;
  behaviorType: BehaviorType;
  occurredTime: string;
  description: string;
  applicationCode: string;
}

function scoreChangeClass(value?: number): string {
  if ((value ?? 0) > 0) {
    return "s2-score-positive";
  }
  if ((value ?? 0) < 0) {
    return "s2-score-negative";
  }
  return "";
}

function normalizeDateTime(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "";
  }
  const normalized = trimmed.replace("T", " ");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

function createManualForm(): ManualBehaviorForm {
  return {
    merchantId: "",
    eventId: "",
    behaviorType: "PENALTY",
    occurredTime: "",
    description: "",
    applicationCode: "",
  };
}

export const BehaviorList = defineComponent({
  name: "BehaviorList",
  setup: () => {
    const loading = ref(false);
    const saving = ref(false);
    const detailLoading = ref(false);
    const rows = ref<SafetyCreditBehaviorVO[]>([]);
    const total = ref(0);
    const detailVisible = ref(false);
    const selectedBehavior = ref<SafetyCreditBehaviorVO | null>(null);
    const merchantLoading = ref(false);
    const merchantOptions = ref<SafetyCreditMerchantVO[]>([]);
    const merchantSearchText = ref("");
    const applicationLoading = ref(false);
    const applicationOptions = ref<SafetyCreditDataSourceVO[]>([]);
    const applicationSearchText = ref("");
    const eventLoading = ref(false);
    const eventOptions = ref<SafetyCreditEventMappingVO[]>([]);
    const eventSearchText = ref("");

    const query = reactive<BehaviorQueryForm>({
      pageNumber: 1,
      pageSize: 10,
      merchantName: "",
      applicationName: "",
      eventName: "",
      behaviorType: "",
      inputType: "",
      auditStatus: "",
      period: ["", ""],
    });

    const form = reactive<ManualBehaviorForm>(createManualForm());
    const [ManualBehaviorModal, manualBehaviorModalApi] = useCubeModal({
      title: "手工行为录入",
      width: "760px",
      onConfirm: () => void saveManualBehavior(),
    });
    let merchantSearchTimer: ReturnType<typeof setTimeout> | undefined;
    let merchantSearchSeq = 0;
    let applicationSearchTimer: ReturnType<typeof setTimeout> | undefined;
    let applicationSearchSeq = 0;
    let eventSearchTimer: ReturnType<typeof setTimeout> | undefined;
    let eventSearchSeq = 0;

    function buildQuery(): SafetyCreditBehaviorPageQuery {
      const payload: SafetyCreditBehaviorPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const merchantName = cleanText(query.merchantName);
      const applicationName = cleanText(query.applicationName);
      const eventName = cleanText(query.eventName);
      const period = toQueryPeriod(query.period);
      if (merchantName !== undefined) {
        payload.merchantName = merchantName;
      }
      if (applicationName !== undefined) {
        payload.applicationName = applicationName;
      }
      if (eventName !== undefined) {
        payload.eventName = eventName;
      }
      if (query.behaviorType !== "") {
        payload.behaviorType = query.behaviorType;
      }
      if (query.inputType !== "") {
        payload.inputType = query.inputType;
      }
      if (query.auditStatus !== "") {
        payload.auditStatus = query.auditStatus;
      }
      if (period !== undefined) {
        payload.period = period;
      }
      return payload;
    }

    async function load(): Promise<void> {
      loading.value = true;
      try {
        const result = await cubeSafetyCreditService.pageBehaviors(buildQuery());
        rows.value = result.records ?? [];
        total.value = result.total ?? 0;
      } finally {
        loading.value = false;
      }
    }

    function resetQuery(): void {
      query.pageNumber = 1;
      query.merchantName = "";
      query.applicationName = "";
      query.eventName = "";
      query.behaviorType = "";
      query.inputType = "";
      query.auditStatus = "";
      query.period = ["", ""];
      void load();
    }

    function changePage(pageNumber: number, pageSize: number): void {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      void load();
    }

    function openCreate(): void {
      Object.assign(form, createManualForm());
      merchantSearchText.value = "";
      applicationSearchText.value = "";
      eventSearchText.value = "";
      eventOptions.value = [];
      manualBehaviorModalApi.open();
      void loadMerchants();
      void loadApplications();
    }

    function buildManualPayload(): SafetyCreditManualBehaviorCommand | undefined {
      const merchantId = cleanText(form.merchantId);
      const applicationCode = cleanText(form.applicationCode);
      const eventId = cleanText(form.eventId);
      const occurredTime = cleanText(normalizeDateTime(form.occurredTime));
      const description = cleanText(form.description);
      if (merchantId === undefined) {
        message.warning("请选择商户");
        return undefined;
      }
      if (applicationCode === undefined) {
        message.warning("请选择来源");
        return undefined;
      }
      if (eventId === undefined) {
        message.warning("请选择事件");
        return undefined;
      }
      if (occurredTime === undefined) {
        message.warning("请选择发生时间");
        return undefined;
      }
      if (description === undefined) {
        message.warning("请输入描述");
        return undefined;
      }
      const payload: SafetyCreditManualBehaviorCommand = {
        merchantId,
        eventId,
        behaviorType: form.behaviorType,
        occurredTime,
        description,
        applicationCode,
      };
      return payload;
    }

    async function saveManualBehavior(): Promise<void> {
      const payload = buildManualPayload();
      if (payload === undefined) {
        return;
      }
      if (saving.value) {
        return;
      }
      saving.value = true;
      manualBehaviorModalApi.setState({ confirmLoading: true });
      try {
        await cubeSafetyCreditService.createManualBehavior(payload);
        message.success("手工行为已提交审核");
        manualBehaviorModalApi.close();
        await load();
      } finally {
        saving.value = false;
        manualBehaviorModalApi.setState({ confirmLoading: false });
      }
    }

    async function openDetail(record: SafetyCreditBehaviorVO): Promise<void> {
      detailVisible.value = true;
      detailLoading.value = true;
      selectedBehavior.value = record;
      try {
        selectedBehavior.value = await cubeSafetyCreditService.getBehavior(record.id);
      } finally {
        detailLoading.value = false;
      }
    }

    async function loadMerchants(keyword = merchantSearchText.value): Promise<void> {
      const searchSeq = ++merchantSearchSeq;
      merchantLoading.value = true;
      try {
        const searchKeyword = cleanText(keyword);
        const result = await cubeSafetyCreditService.pageMerchants({
          pageNumber: 1,
          pageSize: 50,
          ...(searchKeyword === undefined ? {} : { keyword: searchKeyword }),
        });
        if (searchSeq !== merchantSearchSeq) {
          return;
        }
        merchantOptions.value = result.records ?? [];
      } finally {
        if (searchSeq === merchantSearchSeq) {
          merchantLoading.value = false;
        }
      }
    }

    async function loadApplications(keyword = applicationSearchText.value): Promise<void> {
      const searchSeq = ++applicationSearchSeq;
      applicationLoading.value = true;
      try {
        const searchKeyword = cleanText(keyword);
        const result = await cubeSafetyCreditService.pageDataSources({
          pageNumber: 1,
          pageSize: 50,
          enabled: true,
          ...(searchKeyword === undefined ? {} : { keyword: searchKeyword }),
        });
        if (searchSeq !== applicationSearchSeq) {
          return;
        }
        applicationOptions.value = result.records ?? [];
      } finally {
        if (searchSeq === applicationSearchSeq) {
          applicationLoading.value = false;
        }
      }
    }

    async function loadEvents(keyword = eventSearchText.value): Promise<void> {
      const applicationCode = cleanText(form.applicationCode);
      if (applicationCode === undefined) {
        eventOptions.value = [];
        return;
      }
      const searchSeq = ++eventSearchSeq;
      eventLoading.value = true;
      try {
        const searchKeyword = cleanText(keyword);
        const result = await cubeSafetyCreditService.pageDataSourceEvents({
          pageNumber: 1,
          pageSize: 50,
          applicationCode,
          enabled: true,
          ...(searchKeyword === undefined ? {} : { keyword: searchKeyword }),
        });
        if (searchSeq !== eventSearchSeq) {
          return;
        }
        eventOptions.value = result.records ?? [];
      } finally {
        if (searchSeq === eventSearchSeq) {
          eventLoading.value = false;
        }
      }
    }

    function searchMerchants(keyword: string): void {
      merchantSearchText.value = keyword;
      if (merchantSearchTimer !== undefined) {
        clearTimeout(merchantSearchTimer);
      }
      merchantSearchTimer = setTimeout(() => {
        void loadMerchants(keyword);
      }, 250);
    }

    function searchApplications(keyword: string): void {
      applicationSearchText.value = keyword;
      if (applicationSearchTimer !== undefined) {
        clearTimeout(applicationSearchTimer);
      }
      applicationSearchTimer = setTimeout(() => {
        void loadApplications(keyword);
      }, 250);
    }

    function searchEvents(keyword: string): void {
      eventSearchText.value = keyword;
      if (eventSearchTimer !== undefined) {
        clearTimeout(eventSearchTimer);
      }
      eventSearchTimer = setTimeout(() => {
        void loadEvents(keyword);
      }, 250);
    }

    function selectMerchant(value?: SafetyCreditId): void {
      form.merchantId = value === undefined ? "" : String(value);
      merchantSearchText.value = "";
    }

    function selectApplication(value?: SafetyCreditId): void {
      const applicationCode = value === undefined ? "" : String(value);
      form.applicationCode = applicationCode;
      applicationSearchText.value = "";
      form.eventId = "";
      eventSearchText.value = "";
      eventOptions.value = [];
      if (applicationCode !== "") {
        void loadEvents();
      }
    }

    function selectEvent(value?: SafetyCreditId): void {
      const eventId = value === undefined ? "" : String(value);
      form.eventId = eventId;
      eventSearchText.value = "";
      const selected = eventOptions.value.find((item) => item.eventId === eventId);
      if (selected?.applicationCode) {
        form.applicationCode = selected.applicationCode;
      }
      if ((selected?.defaultScore ?? 0) > 0) {
        form.behaviorType = "BONUS";
      } else if (selected !== undefined) {
        form.behaviorType = "PENALTY";
      }
    }

    function merchantOptionLabel(item: SafetyCreditMerchantVO): string {
      return `${displayText(item.merchantName)} / ${displayText(item.merchantCode)}`;
    }

    function applicationOptionLabel(item: SafetyCreditDataSourceVO): string {
      return `${displayText(item.applicationName)} / ${displayText(item.applicationCode)}`;
    }

    function eventOptionLabel(item: SafetyCreditEventMappingVO): string {
      const score = item.defaultScore > 0 ? `+${item.defaultScore}` : String(item.defaultScore);
      return `${displayText(item.eventName)} / ${displayText(item.eventId)} / ${score}`;
    }

    function renderFormInput(label: string, field: keyof Omit<ManualBehaviorForm, "behaviorType">, required = false): JSX.Element {
      return (
        <FormItem class={["form-item", field === "description" ? "wide" : ""]} label={label} required={required}>
          {field === "description" ? (
            <Textarea
              value={form[field]}
              placeholder="请输入描述"
              maxlength={500}
              onUpdate:value={(value: string) => (form[field] = value)}
            />
          ) : field === "occurredTime" ? (
            <DatePicker
              value={form.occurredTime || undefined}
              showTime={{ format: "YYYY-MM-DD HH:mm:ss" }}
              valueFormat="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择发生时间"
              onUpdate:value={(value: string | null | undefined) => (form.occurredTime = value ?? "")}
            />
          ) : (
            <Input value={form[field]} placeholder={`请输入${label}`} onUpdate:value={(value: string) => (form[field] = value)} />
          )}
        </FormItem>
      );
    }

    function renderRemoteSelects(): JSX.Element {
      return (
        <>
          <FormItem class="form-item" label="商户" required>
            <Select
              allowClear
              filterOption={false}
              loading={merchantLoading.value}
              optionFilterProp="label"
              optionLabelProp="label"
              placeholder="请输入或选择商户"
              searchValue={merchantSearchText.value}
              showSearch
              class="source-application-select"
              options={merchantOptions.value.map((item) => ({ label: merchantOptionLabel(item), value: String(item.id) }))}
              value={form.merchantId || undefined}
              onChange={(value: SafetyCreditId | undefined) => selectMerchant(value)}
              onSearch={searchMerchants}
              onClear={() => {
                selectMerchant(undefined);
                void loadMerchants("");
              }}
            />
          </FormItem>
          <FormItem class="form-item" label="来源" required>
            <Select
              allowClear
              filterOption={false}
              loading={applicationLoading.value}
              optionFilterProp="label"
              optionLabelProp="label"
              placeholder="请输入或选择来源"
              searchValue={applicationSearchText.value}
              showSearch
              class="source-application-select"
              options={applicationOptions.value.map((item) => ({ label: applicationOptionLabel(item), value: item.applicationCode }))}
              value={form.applicationCode || undefined}
              onChange={(value: SafetyCreditId | undefined) => selectApplication(value)}
              onSearch={searchApplications}
              onClear={() => {
                selectApplication(undefined);
                void loadApplications("");
              }}
            />
          </FormItem>
          <FormItem class="form-item" label="事件" required>
            <Select
              allowClear
              disabled={form.applicationCode === ""}
              filterOption={false}
              loading={eventLoading.value}
              optionFilterProp="label"
              optionLabelProp="label"
              placeholder={form.applicationCode === "" ? "请先选择来源" : "请输入或选择事件"}
              searchValue={eventSearchText.value}
              showSearch
              class="source-application-select"
              options={eventOptions.value.map((item) => ({ label: eventOptionLabel(item), value: item.eventId }))}
              value={form.eventId || undefined}
              onChange={(value: SafetyCreditId | undefined) => selectEvent(value)}
              onSearch={searchEvents}
              onClear={() => {
                selectEvent(undefined);
                void loadEvents("");
              }}
            />
          </FormItem>
        </>
      );
    }

    const columns = [
      {
        title: "商户",
        dataIndex: "merchantName",
        align: "center",
        width: 170,
        customRender: ({ record }: { record: SafetyCreditBehaviorVO }): JSX.Element => (
          <PopOver content={`${displayText(record.merchantName)} / ${displayText(record.merchantCode)}`}>
            {displayText(record.merchantName)}
          </PopOver>
        ),
      },
      {
        title: "应用",
        dataIndex: "applicationName",
        align: "center",
        width: 150,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "事件",
        dataIndex: "eventName",
        align: "center",
        width: 150,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "行为类型",
        dataIndex: "behaviorType",
        align: "center",
        width: 130,
        customRender: ({ text }: { text?: BehaviorType }): JSX.Element => <Tag color="blue">{behaviorTypeLabel(text)}</Tag>,
      },
      {
        title: "来源",
        dataIndex: "inputType",
        align: "center",
        width: 120,
        customRender: ({ text }: { text?: BehaviorInputType }): string => inputTypeLabel(text),
      },
      {
        title: "审核状态",
        dataIndex: "auditStatus",
        align: "center",
        width: 120,
        customRender: ({ text }: { text?: BehaviorAuditStatus }): JSX.Element => (
          <Tag color={auditStatusColor(text)}>{auditStatusLabel(text)}</Tag>
        ),
      },
      {
        title: "分值变化",
        dataIndex: "scoreChange",
        align: "center",
        width: 110,
        customRender: ({ text }: { text?: number }): JSX.Element => <span class={scoreChangeClass(text)}>{displayText(text)}</span>,
      },
      {
        title: "发生时间",
        dataIndex: "occurredTime",
        align: "center",
        width: 180,
        customRender: ({ text }: { text?: string }): string => formatDateTime(text),
      },
      {
        title: "操作",
        align: "center",
        width: 90,
        fixed: "right",
        customRender: ({ record }: { record: SafetyCreditBehaviorVO }): JSX.Element => (
          <Button type="link" size="small" onClick={() => void openDetail(record)}>
            详情
          </Button>
        ),
      },
    ];

    onMounted(() => {
      void load();
    });

    onBeforeUnmount(() => {
      [merchantSearchTimer, applicationSearchTimer, eventSearchTimer].forEach((timer) => {
        if (timer !== undefined) {
          clearTimeout(timer);
        }
      });
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "商户名称",
        fieldName: "merchantName",
        componentProps: {
          placeholder: "请输入商户名称",
        },
      },
      {
        component: "Input",
        label: "应用名称",
        fieldName: "applicationName",
        componentProps: {
          placeholder: "请输入应用名称",
        },
      },
      {
        component: "Input",
        label: "事件名称",
        fieldName: "eventName",
        componentProps: {
          placeholder: "请输入事件名称",
        },
      },
      {
        component: "Select",
        label: "行为类型",
        fieldName: "behaviorType",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...behaviorTypeOptions],
        },
      },
      {
        component: "Select",
        label: "来源",
        fieldName: "inputType",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...inputTypeOptions],
        },
      },
      {
        component: "Select",
        label: "审核状态",
        fieldName: "auditStatus",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...auditStatusOptions],
        },
      },
      {
        component: "RangePicker",
        label: "发生时间",
        fieldName: "period",
        componentProps: {
          showTime: true,
          valueFormat: "YYYY-MM-DD HH:mm:ss",
          format: "YYYY-MM-DD HH:mm:ss",
          placeholder: ["开始时间", "结束时间"],
        },
      },
    ];

    const [CubeForm] = useCubeForm({
      syncStateRef: query,
      layout: "horizontal",
      schema: searchFormSchema,
      showCollapseButton: true,
      handleSubmit: (data) => {
        query.pageNumber = 1;
        query.merchantName = String(data.merchantName ?? "").trim();
        query.applicationName = String(data.applicationName ?? "").trim();
        query.eventName = String(data.eventName ?? "").trim();
        query.behaviorType = (data.behaviorType ?? "") as OptionalBehaviorType;
        query.inputType = (data.inputType ?? "") as OptionalInputType;
        query.auditStatus = (data.auditStatus ?? "") as OptionalAuditStatus;
        query.period = (data.period ?? ["", ""]) as [string, string];
        void load();
      },
      handleReset: resetQuery,
    });

    const manualBehaviorModalSlots = {
      default: (): JSX.Element => (
        <div class="s2-modal-body">
          <Form class="s2-form-grid" model={form} layout="vertical">
            {renderRemoteSelects()}
            <FormItem class="form-item" label="行为类型" required>
              <Select
                value={form.behaviorType}
                options={behaviorTypeOptions}
                onChange={(value: BehaviorType) => (form.behaviorType = value)}
              />
            </FormItem>
            {renderFormInput("发生时间", "occurredTime", true)}
            {renderFormInput("描述", "description", true)}
          </Form>
        </div>
      ),
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <Button type="primary" onClick={openCreate}>
          手工录入
        </Button>
      ),
      "layout-content": (): JSX.Element => (
        <div class="safety-credit-s2">
          <CubeForm />

          <section class="table-wrap">
            <Table rowKey="id" loading={loading.value} dataSource={rows.value} columns={columns} pagination={false} size="small" />
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <Page current={query.pageNumber} pageSize={query.pageSize} total={total.value} onPageChange={changePage} />
      ),
      default: (): JSX.Element => (
        <>
          <ManualBehaviorModal v-slots={manualBehaviorModalSlots} />

          <Modal
            v-model:visible={detailVisible.value}
            title="行为详情"
            width={820}
            footer={null}
            confirmLoading={detailLoading.value}
            onCancel={() => {
              detailVisible.value = false;
            }}
          >
            {selectedBehavior.value !== null ? (
              <div class="s2-detail-grid">
                <div class="detail-item">
                  <span>商户</span>
                  <strong>{displayText(selectedBehavior.value.merchantName)}</strong>
                </div>
                <div class="detail-item">
                  <span>应用</span>
                  <strong>{displayText(selectedBehavior.value.applicationName)}</strong>
                </div>
                <div class="detail-item">
                  <span>事件</span>
                  <strong>{displayText(selectedBehavior.value.eventName)}</strong>
                </div>
                <div class="detail-item">
                  <span>业务类型</span>
                  <strong>{displayText(selectedBehavior.value.businessType)}</strong>
                </div>
                <div class="detail-item">
                  <span>业务主键</span>
                  <strong>{displayText(selectedBehavior.value.businessKey)}</strong>
                </div>
                <div class="detail-item">
                  <span>行为类型</span>
                  <strong>{behaviorTypeLabel(selectedBehavior.value.behaviorType)}</strong>
                </div>
                <div class="detail-item">
                  <span>来源</span>
                  <strong>{inputTypeLabel(selectedBehavior.value.inputType)}</strong>
                </div>
                <div class="detail-item">
                  <span>分值变化</span>
                  <strong class={scoreChangeClass(selectedBehavior.value.scoreChange)}>
                    {displayText(selectedBehavior.value.scoreChange)}
                  </strong>
                </div>
                <div class="detail-item">
                  <span>发生时间</span>
                  <strong>{formatDateTime(selectedBehavior.value.occurredTime)}</strong>
                </div>
                <div class="detail-item">
                  <span>审核状态</span>
                  <strong>{auditStatusLabel(selectedBehavior.value.auditStatus)}</strong>
                </div>
                <div class="detail-item wide">
                  <span>描述</span>
                  <strong>{displayText(selectedBehavior.value.description)}</strong>
                </div>
              </div>
            ) : null}
          </Modal>
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title="行为记录" v-slots={layoutSlots} showTableXScroll />;
  },
});
