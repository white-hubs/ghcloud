import { defineComponent, onBeforeUnmount, onMounted, reactive, ref } from "vue";

import { CubeLayout, useCubeForm, useCubeModal } from "@ghcloud/cube-app-design";
import type {
  CreditStatus,
  SafetyCreditIndustryType,
  SafetyCreditId,
  SafetyCreditMerchantCommand,
  SafetyCreditMerchantImportResultVO,
  SafetyCreditMerchantPageQuery,
  SafetyCreditMerchantVO,
  SafetyCreditOuaaUserVO,
} from "@ghcloud/cube-safety-credit-service";
import {
  Button,
  Form,
  FormItem,
  Input,
  Modal,
  Page,
  PopConfirm,
  PopOver,
  Select,
  Space,
  Table,
  Tag,
  Textarea,
  message,
  type FormExpose,
} from "@ghcloud/cube-ui";

import {
  creditStatusColor,
  creditStatusLabel,
  creditStatusOptions,
  displayText,
  industryTypeLabel,
  industryTypeOptions,
} from "../s2/shared";
import { cubeSafetyCreditService } from "@/api/server";

import "./merchant-list.less";

type OptionalIndustryType = SafetyCreditIndustryType | "";
type OptionalAccountId = SafetyCreditId | "";
type OptionalCreditStatus = CreditStatus | "";

interface MerchantFormState extends Omit<SafetyCreditMerchantCommand, "industryType" | "ouaaUserId"> {
  industryType: OptionalIndustryType;
  ouaaUserId: OptionalAccountId;
}

interface MerchantQueryState extends Omit<SafetyCreditMerchantPageQuery, "industryType" | "creditStatus"> {
  industryType: OptionalIndustryType;
  creditStatus: OptionalCreditStatus;
}

type MerchantFormField = Exclude<keyof MerchantFormState, "ouaaUserId">;
type TextMerchantFormField = Exclude<MerchantFormField, "industryType">;

interface MerchantFormItem {
  label: string;
  field: MerchantFormField;
  required?: boolean;
  multiline?: boolean;
}

const formItems: MerchantFormItem[] = [
  { label: "编码", field: "merchantCode", required: true },
  { label: "名称", field: "merchantName", required: true },
  { label: "园区", field: "parkName" },
  { label: "行业", field: "industryType" },
  { label: "区域", field: "areaName" },
  { label: "铺位", field: "stallNo" },
  { label: "负责人", field: "principalName" },
  { label: "手机号", field: "principalPhone" },
  { label: "经营范围", field: "businessScope", multiline: true },
  { label: "备注", field: "remark", multiline: true },
];

const optionalFields = [
  "parkName",
  "industryType",
  "areaName",
  "stallNo",
  "principalName",
  "principalPhone",
  "businessScope",
  "remark",
] as const;

function createEmptyForm(): MerchantFormState {
  return {
    merchantCode: "",
    ouaaUserId: "",
    merchantName: "",
    parkName: "",
    industryType: "",
    areaName: "",
    stallNo: "",
    principalName: "",
    principalPhone: "",
    businessScope: "",
    remark: "",
  };
}

function toForm(record: SafetyCreditMerchantVO): MerchantFormState {
  return {
    merchantCode: record.merchantCode ?? "",
    ouaaUserId: record.ouaaUserId ?? "",
    merchantName: record.merchantName ?? "",
    parkName: record.parkName ?? "",
    industryType: record.industryType ?? "",
    areaName: record.areaName ?? "",
    stallNo: record.stallNo ?? "",
    principalName: record.principalName ?? "",
    principalPhone: record.principalPhone ?? "",
    businessScope: record.businessScope ?? "",
    remark: record.remark ?? "",
  };
}

function cleanText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? undefined : trimmed;
}

function toPayload(form: MerchantFormState): SafetyCreditMerchantCommand {
  const payload: SafetyCreditMerchantCommand = {
    merchantCode: form.merchantCode.trim(),
    merchantName: form.merchantName.trim(),
  };
  if (form.ouaaUserId !== "") {
    payload.ouaaUserId = form.ouaaUserId;
  }
  for (const field of optionalFields.filter((item) => item !== "industryType")) {
    const value = form[field]?.trim();
    if (value !== undefined && value !== "") {
      payload[field] = value;
    }
  }
  if (form.industryType !== undefined && form.industryType !== "") {
    payload.industryType = form.industryType;
  }
  return payload;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getStatusTag(record: SafetyCreditMerchantVO): JSX.Element {
  return <Tag color={creditStatusColor(record.creditStatus)}>{creditStatusLabel(record.creditStatus)}</Tag>;
}

export const MerchantList = defineComponent({
  name: "MerchantList",
  setup: () => {
    const loading = ref(false);
    const importing = ref(false);
    const rows = ref<SafetyCreditMerchantVO[]>([]);
    const fileInputRef = ref<HTMLInputElement>();
    const formRenderRef = ref<FormExpose>();
    const editingId = ref<string | number>();
    const importResultVisible = ref(false);
    const importResult = ref<SafetyCreditMerchantImportResultVO | null>(null);
    const ouaaUserLoading = ref(false);
    const ouaaUserOptions = ref<SafetyCreditOuaaUserVO[]>([]);
    const ouaaUserSearchText = ref("");
    let ouaaUserSearchTimer: ReturnType<typeof setTimeout> | undefined;
    let ouaaUserSearchSeq = 0;

    const query = reactive<MerchantQueryState>({
      pageNumber: 1,
      pageSize: 10,
      merchantCode: "",
      merchantName: "",
      parkName: "",
      industryType: "",
      creditStatus: "",
    });
    const total = ref(0);
    const form = reactive<MerchantFormState>(createEmptyForm());
    const formRules = {
      merchantCode: [{ required: true, message: "请输入商户编码", trigger: "blur" }],
      merchantName: [{ required: true, message: "请输入商户名称", trigger: "blur" }],
    };

    const [MerchantModal, merchantModalApi] = useCubeModal({
      title: "新增商户",
      width: "760px",
      onConfirm: () => void save(),
      onClosed: () => {
        formRenderRef.value?.clearValidate();
      },
    });

    async function load(): Promise<void> {
      loading.value = true;
      try {
        const result = await cubeSafetyCreditService.pageMerchants(buildQuery());
        rows.value = result.records ?? [];
        total.value = result.total ?? 0;
      } finally {
        loading.value = false;
      }
    }

    async function loadOuaaUsers(keyword = ouaaUserSearchText.value): Promise<void> {
      const searchSeq = ++ouaaUserSearchSeq;
      ouaaUserLoading.value = true;
      try {
        const result = await cubeSafetyCreditService.pageOuaaMerchantUsers({
          pageNumber: 1,
          pageSize: 20,
          keyword: cleanText(keyword),
          enabled: true,
        });
        if (searchSeq !== ouaaUserSearchSeq) {
          return;
        }
        ouaaUserOptions.value = result.records ?? [];
      } finally {
        if (searchSeq === ouaaUserSearchSeq) {
          ouaaUserLoading.value = false;
        }
      }
    }

    function resetQuery(): void {
      query.pageNumber = 1;
      query.merchantCode = "";
      query.merchantName = "";
      query.parkName = "";
      query.industryType = "";
      query.creditStatus = "";
      void load();
    }

    function changePage(pageNumber: number, pageSize: number): void {
      query.pageNumber = pageNumber;
      query.pageSize = pageSize;
      void load();
    }

    function openCreate(): void {
      editingId.value = undefined;
      Object.assign(form, createEmptyForm());
      ouaaUserSearchText.value = "";
      formRenderRef.value?.clearValidate();
      merchantModalApi.setState({ title: "新增商户" });
      merchantModalApi.open();
      void loadOuaaUsers("");
    }

    function openEdit(record: SafetyCreditMerchantVO): void {
      editingId.value = record.id;
      Object.assign(form, toForm(record));
      ouaaUserSearchText.value = "";
      ensureOuaaUserOption(record);
      formRenderRef.value?.clearValidate();
      merchantModalApi.setState({ title: "编辑商户" });
      merchantModalApi.open();
    }

    async function save(): Promise<void> {
      await formRenderRef.value?.validate();
      const isCreate = editingId.value === undefined;
      const payload = toPayload(form);
      if (!payload.merchantCode) {
        message.warning("请输入商户编码");
        return;
      }
      if (!payload.merchantName) {
        message.warning("请输入商户名称");
        return;
      }
      if (isCreate && !validateOuaaUser()) {
        return;
      }
      merchantModalApi.setState({ confirmLoading: true });
      try {
        if (editingId.value !== undefined) {
          await cubeSafetyCreditService.updateMerchant(editingId.value, payload);
          message.success("商户已更新");
        } else {
          await cubeSafetyCreditService.createMerchant(payload);
          message.success("商户已新增");
        }
        merchantModalApi.close();
        await load();
      } finally {
        merchantModalApi.setState({ confirmLoading: false });
      }
    }

    function validateOuaaUser(): boolean {
      if (form.ouaaUserId === "") {
        message.warning("请选择关联商户账户");
        return false;
      }
      return true;
    }

    function searchOuaaUsers(keyword: string): void {
      ouaaUserSearchText.value = keyword;
      if (ouaaUserSearchTimer !== undefined) {
        clearTimeout(ouaaUserSearchTimer);
      }
      ouaaUserSearchTimer = setTimeout(() => {
        void loadOuaaUsers(keyword);
      }, 300);
    }

    function selectOuaaUser(value?: SafetyCreditId): void {
      form.ouaaUserId = value ?? "";
      ouaaUserSearchText.value = "";
    }

    function ouaaUserOptionLabel(item: SafetyCreditOuaaUserVO): string {
      return `${displayText(item.name)} / ${displayText(item.username)} / ${displayText(item.mobile)}`;
    }

    function linkedAccountText(record: SafetyCreditMerchantVO): string {
      if (record.ouaaUserId === undefined || record.ouaaUserId === null || record.ouaaUserId === "") {
        return "--";
      }
      return `${displayText(record.ouaaName)} / ${displayText(record.ouaaUsername)} / ${displayText(record.ouaaMobile)}`;
    }

    function ensureOuaaUserOption(record: SafetyCreditMerchantVO): void {
      if (record.ouaaUserId === undefined || record.ouaaUserId === null || record.ouaaUserId === "") {
        return;
      }
      const exists = ouaaUserOptions.value.some((item) => String(item.id) === String(record.ouaaUserId));
      if (exists) {
        return;
      }
      ouaaUserOptions.value = [
        {
          id: record.ouaaUserId,
          username: record.ouaaUsername,
          name: record.ouaaName,
          mobile: record.ouaaMobile,
          enabled: record.ouaaEnabled,
        },
        ...ouaaUserOptions.value,
      ];
    }

    async function remove(record: SafetyCreditMerchantVO): Promise<void> {
      await cubeSafetyCreditService.deleteMerchant(record.id);
      message.success("商户已删除");
      await load();
    }

    async function downloadTemplate(): Promise<void> {
      const blob = await cubeSafetyCreditService.downloadMerchantImportTemplate();
      downloadBlob(blob, "安全信用商户导入模板.xlsx");
    }

    async function importFile(event: Event): Promise<void> {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (file === undefined) {
        return;
      }
      importing.value = true;
      try {
        importResult.value = await cubeSafetyCreditService.importMerchants(file);
        importResultVisible.value = true;
        await load();
      } finally {
        importing.value = false;
        input.value = "";
      }
    }

    function buildQuery(): SafetyCreditMerchantPageQuery {
      const payload: SafetyCreditMerchantPageQuery = {
        pageNumber: query.pageNumber,
        pageSize: query.pageSize,
      };
      const merchantCode = cleanText(query.merchantCode);
      const merchantName = cleanText(query.merchantName);
      const parkName = cleanText(query.parkName);
      if (merchantCode !== undefined) {
        payload.merchantCode = merchantCode;
      }
      if (merchantName !== undefined) {
        payload.merchantName = merchantName;
      }
      if (parkName !== undefined) {
        payload.parkName = parkName;
      }
      if (query.industryType !== "") {
        payload.industryType = query.industryType;
      }
      if (query.creditStatus !== "") {
        payload.creditStatus = query.creditStatus;
      }
      return payload;
    }

    function renderFormItem(item: MerchantFormItem): JSX.Element {
      let control: JSX.Element;
      if (item.field === "industryType") {
        control = (
          <Select
            value={form.industryType || undefined}
            allowClear
            showSearch
            placeholder="请选择行业"
            options={industryTypeOptions}
            onChange={(value: OptionalIndustryType | undefined) => (form.industryType = value ?? "")}
          />
        );
      } else {
        const field = item.field as TextMerchantFormField;
        control = item.multiline ? (
          <Textarea
            value={form[field]}
            maxlength={500}
            placeholder={`请输入${item.label}`}
            onUpdate:value={(value: string) => (form[field] = value)}
          />
        ) : (
          <Input
            value={form[field]}
            placeholder={`请输入${item.label}`}
            showCount={false}
            onUpdate:value={(value: string) => (form[field] = value)}
          />
        );
      }
      return (
        <FormItem
          class={["merchant-form-item", item.multiline ? "wide" : ""]}
          label={item.label}
          name={item.field}
          required={item.required === true}
        >
          {control}
        </FormItem>
      );
    }

    function renderOuaaUserSelect(): JSX.Element {
      return (
        <section class="merchant-account-config">
          <div class="account-config-header">
            <h3>关联商户账户</h3>
            <span>账户资料、权限和密码请在 OUAA 维护。</span>
          </div>
          <FormItem class="merchant-form-item wide" label="账户" required={editingId.value === undefined}>
            <Select
              value={form.ouaaUserId || undefined}
              allowClear
              showSearch
              loading={ouaaUserLoading.value}
              placeholder="请输入姓名、账号或手机号搜索"
              searchValue={ouaaUserSearchText.value}
              filterOption={false}
              options={ouaaUserOptions.value.map((item) => ({ label: ouaaUserOptionLabel(item), value: item.id }))}
              onChange={(value: SafetyCreditId | undefined) => selectOuaaUser(value)}
              onSearch={searchOuaaUsers}
              onClear={() => {
                selectOuaaUser(undefined);
                void loadOuaaUsers("");
              }}
            />
          </FormItem>
        </section>
      );
    }

    function renderMerchantFormItems(): JSX.Element[] {
      const items: JSX.Element[] = [];
      items.push(renderOuaaUserSelect());
      for (const item of formItems) {
        items.push(renderFormItem(item));
      }
      return items;
    }

    const columns = [
      {
        title: "编码",
        dataIndex: "merchantCode",
        align: "center",
        ellipsis: true,
        width: 140,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "名称",
        dataIndex: "merchantName",
        align: "center",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={displayText(text)}>{displayText(text)}</PopOver>,
      },
      {
        title: "园区",
        dataIndex: "parkName",
        align: "center",
        ellipsis: true,
        width: 140,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "行业",
        dataIndex: "industryType",
        align: "center",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text?: string }): string => industryTypeLabel(text),
      },
      {
        title: "区域",
        dataIndex: "areaName",
        align: "center",
        ellipsis: true,
        width: 140,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "铺位",
        dataIndex: "stallNo",
        align: "center",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "负责人",
        dataIndex: "principalName",
        align: "center",
        ellipsis: true,
        width: 120,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "手机号",
        dataIndex: "principalPhone",
        align: "center",
        ellipsis: true,
        width: 140,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "信用分",
        dataIndex: "currentScore",
        align: "center",
        width: 100,
        customRender: ({ text }: { text?: number }): string => displayText(text),
      },
      {
        title: "等级",
        dataIndex: "creditGrade",
        align: "center",
        width: 90,
        customRender: ({ text }: { text?: string }): string => displayText(text),
      },
      {
        title: "状态",
        dataIndex: "creditStatus",
        align: "center",
        width: 100,
        customRender: ({ record }: { record: SafetyCreditMerchantVO }): JSX.Element => getStatusTag(record),
      },
      {
        title: "关联账户",
        align: "center",
        ellipsis: true,
        width: 220,
        customRender: ({ record }: { record: SafetyCreditMerchantVO }): JSX.Element => (
          <PopOver content={linkedAccountText(record)}>{linkedAccountText(record)}</PopOver>
        ),
      },
      {
        title: "操作",
        align: "center",
        width: 140,
        fixed: "right",
        customRender: ({ record }: { record: SafetyCreditMerchantVO }): JSX.Element => (
          <Space>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <PopConfirm title="确认删除该商户？" onConfirm={() => void remove(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    onMounted(() => {
      void load();
      void loadOuaaUsers("");
    });

    onBeforeUnmount(() => {
      if (ouaaUserSearchTimer !== undefined) {
        clearTimeout(ouaaUserSearchTimer);
      }
    });

    const searchFormSchema = [
      {
        component: "Input",
        label: "编码",
        fieldName: "merchantCode",
        componentProps: {
          placeholder: "请输入编码",
        },
      },
      {
        component: "Input",
        label: "名称",
        fieldName: "merchantName",
        componentProps: {
          placeholder: "请输入名称",
        },
      },
      {
        component: "Select",
        label: "状态",
        fieldName: "creditStatus",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...creditStatusOptions],
        },
      },
      {
        component: "Select",
        label: "行业",
        fieldName: "industryType",
        defaultValue: "",
        componentProps: {
          options: [{ label: "全部", value: "" }, ...industryTypeOptions],
        },
      },
      {
        component: "Input",
        label: "园区",
        fieldName: "parkName",
        componentProps: {
          placeholder: "请输入园区",
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
        query.merchantCode = String(data.merchantCode ?? "").trim();
        query.merchantName = String(data.merchantName ?? "").trim();
        query.parkName = String(data.parkName ?? "").trim();
        query.industryType = (data.industryType ?? "") as OptionalIndustryType;
        query.creditStatus = (data.creditStatus ?? "") as OptionalCreditStatus;
        void load();
      },
      handleReset: resetQuery,
    });

    const merchantModalSlots = {
      default: (): JSX.Element => (
        <Form
          ref={formRenderRef}
          class="merchant-form"
          model={form}
          rules={formRules}
          label-col={{ style: { width: "76px" } }}
          wrapper-col={{ style: { flex: 1 } }}
        >
          {renderMerchantFormItems()}
        </Form>
      ),
    };

    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <Space>
            <Button onClick={() => void downloadTemplate()}>下载模板</Button>
            <Button loading={importing.value} onClick={() => fileInputRef.value?.click()}>
              Excel导入
            </Button>
            <Button type="primary" onClick={openCreate}>
              新增商户
            </Button>
          </Space>
          <input
            ref={fileInputRef}
            class="hidden-file-input"
            type="file"
            accept=".xls,.xlsx"
            onChange={(event: Event) => void importFile(event)}
          />
        </>
      ),
      "layout-content": (): JSX.Element => (
        <div class="safety-credit-merchant">
          <CubeForm />

          <section class="table-wrap">
            <Table rowKey="id" loading={loading.value} dataSource={rows.value} columns={columns} pagination={false} size="small" />
          </section>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Page current={query.pageNumber} pageSize={query.pageSize} total={total.value} onPageChange={changePage} />
        </>
      ),
      default: (): JSX.Element => (
        <>
          <MerchantModal v-slots={merchantModalSlots} />

          <Modal
            v-model:visible={importResultVisible.value}
            title="导入结果"
            width={640}
            footer={null}
            onCancel={() => {
              importResultVisible.value = false;
            }}
          >
            <div class="import-result">
              <div class="result-summary">
                <span>成功：{importResult.value?.successCount ?? 0}</span>
                <span>失败：{importResult.value?.failureCount ?? 0}</span>
              </div>
              {(importResult.value?.failures ?? []).length > 0 ? (
                <ul>
                  {(importResult.value?.failures ?? []).map((failure) => (
                    <li>
                      第{failure.rowNumber ?? "--"}行 {displayText(failure.merchantCode)}：{displayText(failure.reason)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>未发现失败记录。</p>
              )}
            </div>
          </Modal>
        </>
      ),
    };

    return (): JSX.Element => <CubeLayout title="商户数据" v-slots={layoutSlots} showTableXScroll />;
  },
});
