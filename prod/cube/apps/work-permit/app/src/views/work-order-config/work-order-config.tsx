import { defineComponent, onMounted, reactive, ref } from "vue";

import type { FormFlowDetailVO, FormFlowGroupVO } from "@ghcloud/cube-service-interface/process-engine";
import {
  deleteFormFlow,
  deleteFormFlowGroup,
  getFormFlowGroupCount,
  getFormFlowPageList,
  updateFormFlowEnable,
  updateFormFlowGroup,
} from "@ghcloud/cube-services-client/process-engine.client";
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
  Switch,
  Table,
  message,
  type FormInstance,
} from "@ghcloud/cube-ui";

import { getCurrentApplicationCode } from "@/utils/current-application";
import { filterEmptyValues } from "@/utils/filter-empty-values";

import styles from "./work-order-config.module.less";

interface GroupFormState {
  id?: string;
  name: string;
}

export const WorkOrderConfig = defineComponent({
  name: "WorkOrderConfig",
  setup: () => {
    const loading = ref(false);
    const groupLoading = ref(false);
    const groupModalVisible = ref(false);
    const groupModalTitle = ref("新增作业分组");
    const groupFormRef = ref<FormInstance>();
    const currentGroupId = ref<string | number | undefined>();
    const groups = ref<FormFlowGroupVO[]>([]);
    const dataSource = ref<FormFlowDetailVO[]>([]);

    const searchForm = reactive<{
      keyword: string;
      enable?: boolean;
    }>({
      keyword: "",
      enable: undefined,
    });

    const groupForm = reactive<GroupFormState>({
      id: undefined,
      name: "",
    });

    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });

    const groupRules = {
      name: [{ required: true, message: "请输入作业分组名称" }],
    };

    const totalGroupCount = (): number => groups.value.reduce((sum, item) => sum + (item.formGroupCount ?? 0), 0);

    const loadGroups = async (): Promise<void> => {
      groupLoading.value = true;
      try {
        const response = await getFormFlowGroupCount({
          application: getCurrentApplicationCode(),
        });
        groups.value = Array.isArray(response) ? response : [];
      } catch {
        groups.value = [];
      } finally {
        groupLoading.value = false;
      }
    };

    const loadTable = async (): Promise<void> => {
      loading.value = true;
      try {
        const response = await getFormFlowPageList(
          filterEmptyValues({
            pageNumber: page.pageNumber,
            pageSize: page.pageSize,
            fromGroupId: currentGroupId.value,
            keyword: searchForm.keyword,
            enable: searchForm.enable,
            application: getCurrentApplicationCode(),
          }),
        );
        dataSource.value = response.records ?? [];
        page.total = response.total ?? 0;
      } catch {
        dataSource.value = [];
        page.total = 0;
      } finally {
        loading.value = false;
      }
    };

    const refresh = async (): Promise<void> => {
      await Promise.all([loadGroups(), loadTable()]);
    };

    const selectGroup = (id?: string | number): void => {
      currentGroupId.value = id;
      page.pageNumber = 1;
      void loadTable();
    };

    const openGroupModal = (record?: FormFlowGroupVO): void => {
      groupForm.id = record?.formGroupId;
      groupForm.name = record?.formGroupName ?? "";
      groupModalTitle.value = record ? "编辑作业分组" : "新增作业分组";
      groupModalVisible.value = true;
    };

    const closeGroupModal = (): void => {
      groupModalVisible.value = false;
      groupFormRef.value?.resetFields();
    };

    const submitGroup = async (): Promise<void> => {
      try {
        await groupFormRef.value?.validate();
        await updateFormFlowGroup({
          id: groupForm.id,
          name: groupForm.name,
          application: getCurrentApplicationCode(),
        });
        message.success("操作成功");
        closeGroupModal();
        await refresh();
      } catch {
        message.error("操作失败");
      }
    };

    const removeGroup = async (id: string): Promise<void> => {
      try {
        await deleteFormFlowGroup(id);
        if (currentGroupId.value === id) {
          currentGroupId.value = undefined;
        }
        message.success("操作成功");
        await refresh();
      } catch {
        message.error("操作失败");
      }
    };

    const query = (): void => {
      page.pageNumber = 1;
      void loadTable();
    };

    const reset = (): void => {
      searchForm.keyword = "";
      searchForm.enable = undefined;
      query();
    };

    const pageChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      void loadTable();
    };

    const isEnabled = (value: FormFlowDetailVO["enable"]): boolean => value === true || value === "true" || value === 1;

    const padDatePart = (value: number): string => String(value).padStart(2, "0");

    const formatDateTime = (value?: string | number): string => {
      if (!value) {
        return "--";
      }
      const timestamp = typeof value === "number" ? value : Number(value);
      const date = Number.isNaN(timestamp) ? new Date(value) : new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
      if (Number.isNaN(date.getTime())) {
        return "--";
      }
      return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())} ${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}:${padDatePart(date.getSeconds())}`;
    };

    const buildDesignUrl = (record?: FormFlowDetailVO, isCopy = false): string => {
      const returnUrl = encodeURIComponent(globalThis.location.href);
      const params = ["type=CUSTOM_FORM"];
      if (record?.id) {
        if (isCopy) {
          params.push("isCopy=true");
        }
        params.push(`id=${record.id}`);
      }
      params.push(`returnUrl=${returnUrl}`);
      return `/portal/flow-engine/admin/workOrderDesign?${params.join("&")}`;
    };

    const handleAdd = (): void => {
      globalThis.location.href = buildDesignUrl();
    };

    const handleEdit = (record: FormFlowDetailVO): void => {
      globalThis.location.href = buildDesignUrl(record);
    };

    const handleCopy = (record: FormFlowDetailVO): void => {
      globalThis.location.href = buildDesignUrl(record, true);
    };

    const handleSwitch = async (enable: boolean, record: FormFlowDetailVO): Promise<void> => {
      const previousEnable = record.enable;
      record.enable = enable;
      try {
        await updateFormFlowEnable({ id: record.id, enable });
        message.success("操作成功");
      } catch {
        record.enable = previousEnable;
        message.error("操作失败");
      }
    };

    const removeRow = async (record: FormFlowDetailVO): Promise<void> => {
      try {
        await deleteFormFlow(record.id);
        message.success("操作成功");
        await refresh();
      } catch {
        message.error("操作失败");
      }
    };

    const columns = [
      {
        title: "序号",
        dataIndex: "index",
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): number => (page.pageNumber - 1) * page.pageSize + index + 1,
      },
      {
        title: "作业名称",
        dataIndex: "name",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "作业分组",
        dataIndex: "formGroupName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "作业说明",
        dataIndex: "remark",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "最后更新",
        dataIndex: "updateTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text?: string | number }): JSX.Element => {
          const time = formatDateTime(text);
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        title: "开关",
        dataIndex: "enable",
        align: "center",
        width: 130,
        customRender: ({ record }: { record: FormFlowDetailVO }): JSX.Element => (
          <Switch
            checked={isEnabled(record.enable)}
            checkedValue
            unCheckedValue={false}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            onChange={(value: boolean) => {
              void handleSwitch(value, record);
            }}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center",
        width: 220,
        customRender: ({ record }: { record: FormFlowDetailVO }): JSX.Element => (
          <>
            <Button type="link" size="small" onClick={() => handleEdit(record)}>
              编辑
            </Button>
            <Button type="link" size="small" onClick={() => handleCopy(record)}>
              复制
            </Button>
            <PopConfirm title="确认删除该作业？" onConfirm={() => removeRow(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];

    onMounted(() => {
      void refresh();
    });

    return (): JSX.Element => (
      <div class={styles.page}>
        <div class={styles.header}>
          <div class={styles.title}>作业配置</div>
          <Button type="primary" onClick={handleAdd}>
            新增作业
          </Button>
        </div>
        <div class={styles.body}>
          <div class={styles.groupPanel}>
            <div class={styles.groupHeader}>
              <span>作业分组</span>
              <Button type="primary" size="small" onClick={() => openGroupModal()}>
                新建
              </Button>
            </div>
            <div class={styles.groupList}>
              <div
                class={[styles.groupItem, currentGroupId.value === undefined ? styles.groupItemActive : ""]}
                onClick={() => selectGroup()}
              >
                <div class={styles.groupName}>
                  <span class={styles.groupText}>全部</span>
                  <span class={styles.groupCount}>({totalGroupCount()})</span>
                </div>
              </div>
              {groups.value.map((group) => (
                <div
                  key={group.formGroupId}
                  class={[styles.groupItem, currentGroupId.value === group.formGroupId ? styles.groupItemActive : ""]}
                  onClick={() => selectGroup(group.formGroupId)}
                >
                  <div class={styles.groupName}>
                    <span class={styles.groupText}>{group.formGroupName}</span>
                    <span class={styles.groupCount}>({group.formGroupCount ?? 0})</span>
                  </div>
                  <div class={styles.groupActions}>
                    <Button
                      type="link"
                      size="small"
                      onClick={(event: MouseEvent) => {
                        event.stopPropagation();
                        openGroupModal(group);
                      }}
                    >
                      编辑
                    </Button>
                    <PopConfirm title="确认删除该作业分组？" onConfirm={() => removeGroup(group.formGroupId)}>
                      <Button type="link" size="small" danger onClick={(event: MouseEvent) => event.stopPropagation()}>
                        删除
                      </Button>
                    </PopConfirm>
                  </div>
                </div>
              ))}
              {!groupLoading.value && groups.value.length === 0 && <div class={styles.groupItem}>暂无作业分组</div>}
            </div>
          </div>
          <div class={styles.tablePanel}>
            <Form class={styles.searchForm} layout="inline">
              <FormItem label="启用">
                <Select
                  style={{ width: "220px" }}
                  v-model:value={searchForm.enable}
                  allowClear
                  placeholder="是否启用"
                  options={[
                    { value: true, label: "已启用" },
                    { value: false, label: "已禁用" },
                  ]}
                />
              </FormItem>
              <FormItem>
                <Button type="primary" onClick={query}>
                  查询
                </Button>
                <Button style={{ marginLeft: "8px" }} onClick={reset}>
                  重置
                </Button>
              </FormItem>
              <FormItem>
                <Input
                  style={{ width: "220px" }}
                  v-model:value={searchForm.keyword}
                  placeholder="请输入作业名称"
                  allowClear
                  onPressEnter={query}
                />
              </FormItem>
            </Form>
            <div class={styles.tableWrap}>
              <Table
                rowKey="id"
                columns={columns}
                loading={loading.value}
                dataSource={dataSource.value}
                pagination={false}
                size="small"
                scrollY={520}
              />
            </div>
            <div class={styles.footer}>
              <Page
                v-model:current={page.pageNumber}
                v-model:pageSize={page.pageSize}
                v-model:total={page.total}
                onPageChange={pageChange}
              />
            </div>
          </div>
        </div>
        <Modal
          visible={groupModalVisible.value}
          title={groupModalTitle.value}
          width="420px"
          onOk={submitGroup}
          onCancel={closeGroupModal}
          destroyOnClose
        >
          <Form model={groupForm} ref={groupFormRef} rules={groupRules} label-col={{ style: { width: "110px" } }}>
            <FormItem label="作业分组" name="name">
              <Input v-model:value={groupForm.name} placeholder="请输入作业分组名称" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  },
});
