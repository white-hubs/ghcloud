import { Input as AntInput } from "ant-design-vue";
import { computed, defineComponent, inject, onMounted, reactive, ref, Teleport, watch } from "vue";

import { Button, Empty, Form, FormItem, Input, InputNumber, Modal, Page, PopConfirm, Space, Spin, Table, message } from "@ghcloud/cube-ui";

import { CONFIG_SHELL_TITLE_META_ID } from "../../config-shell";
import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import type { ModelConfig } from "../types";
import { createConfigId, isUe5Entry } from "../utils/entry";
import { GuideSetScreen } from "./set-screen";

import styles from "./guide-settings.module.less";

const { TextArea } = AntInput;
const DEFAULT_GUIDE_PAGE_SIZE = 10;

type GuideItem = ModelConfig["ue5"]["guideData"]["guideList"][number];

const ensureGuideData = (modelApi: ModelConfigurationApi): ModelConfig["ue5"]["guideData"] => {
  const ue5 = modelApi.modelConfig.value.ue5;
  if (!ue5.guideData) {
    ue5.guideData = {
      isOld: "old",
      modelLine: "",
      guideList: [],
    };
  }
  if (!Array.isArray(ue5.guideData.guideList)) {
    ue5.guideData.guideList = [];
  }
  return ue5.guideData;
};

/** 导览列表：维护 UE5 导览，并通过分步弹窗配置初始画面与轮播点位。 */
export const GuideSettings = defineComponent({
  name: "GuideSettings",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const titleMountReady = ref(false);

    const entry = computed(() => modelApi?.modelConfig.value.entry ?? "views");
    const unsupported = computed(() => !isUe5Entry(entry.value));

    const guideData = computed(() => {
      if (!modelApi) {
        return null;
      }
      return ensureGuideData(modelApi);
    });

    const guideList = computed(() => guideData.value?.guideList ?? []);
    const pagination = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_GUIDE_PAGE_SIZE,
    });
    const pagedGuideList = computed(() => {
      const start = (pagination.pageNumber - 1) * pagination.pageSize;
      return guideList.value.slice(start, start + pagination.pageSize);
    });

    const modal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      submitting: false,
      sort: 1,
      name: "",
      describe: "",
      id: "",
    });
    const screenModal = reactive({
      open: false,
      guideId: "",
    });

    const openCreate = (): void => {
      modal.mode = "create";
      modal.sort = (guideList.value.at(-1)?.sort ?? 0) + 1;
      modal.name = "";
      modal.describe = "";
      modal.id = createConfigId();
      modal.open = true;
    };

    const openEdit = (record: GuideItem): void => {
      modal.mode = "edit";
      modal.sort = record.sort;
      modal.name = record.name;
      modal.describe = record.describe;
      modal.id = record.id;
      modal.open = true;
    };

    const persistGuideData = async (next: ModelConfig["ue5"]["guideData"]): Promise<boolean> => {
      if (!modelApi) {
        return false;
      }
      modelApi.modelConfig.value.ue5.guideData = next;
      modelApi.markDirty();
      return modelApi.save();
    };

    const saveGuide = async (): Promise<void> => {
      if (!modelApi || !guideData.value) {
        return;
      }
      const name = modal.name.trim();
      if (!name) {
        message.warning("请输入导览名称");
        return;
      }
      modal.submitting = true;
      try {
        const nextList = [...guideData.value.guideList];
        if (modal.mode === "create") {
          nextList.push({
            id: modal.id,
            sort: modal.sort,
            name,
            describe: modal.describe.trim(),
            setScreen: {
              initPerspective: "",
              durationStay: 1,
              effectList: [{ name: "效果展示", value: "" }],
            },
            pointList: [],
          });
        } else {
          const index = nextList.findIndex((item) => item.id === modal.id);
          if (index < 0) {
            message.error("导览不存在");
            return;
          }
          nextList[index] = {
            ...nextList[index],
            sort: modal.sort,
            name,
            describe: modal.describe.trim(),
          };
        }
        nextList.sort((a, b) => a.sort - b.sort);
        const ok = await persistGuideData({
          ...guideData.value,
          guideList: nextList,
        });
        if (ok) {
          if (modal.mode === "create") {
            pagination.pageNumber = Math.max(1, Math.ceil(nextList.length / pagination.pageSize));
          }
          modal.open = false;
        }
      } finally {
        modal.submitting = false;
      }
    };

    const deleteGuide = async (id: string): Promise<void> => {
      if (!guideData.value) {
        return;
      }
      const nextList = guideData.value.guideList.filter((item) => item.id !== id);
      await persistGuideData({
        ...guideData.value,
        guideList: nextList,
      });
    };

    const saveRenderMode = async (): Promise<void> => {
      if (!guideData.value) {
        return;
      }
      if (guideData.value.isOld === "new" && !guideData.value.modelLine.trim()) {
        message.warning("请输入实例线路地址");
        return;
      }
      await persistGuideData({ ...guideData.value });
    };

    const changeRenderMode = (mode: "old" | "new"): void => {
      if (!guideData.value || guideData.value.isOld === mode) {
        return;
      }
      guideData.value.isOld = mode;
      if (mode === "old") {
        guideData.value.modelLine = "";
      }
      modelApi?.markDirty();
    };

    const openSetScreen = (id: string): void => {
      screenModal.guideId = id;
      screenModal.open = true;
    };

    const columns = [
      { title: "排序", dataIndex: "sort", key: "sort", width: 80 },
      { title: "导览名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "说明", dataIndex: "describe", key: "describe", ellipsis: true },
      {
        title: "操作",
        key: "action",
        width: 220,
        customRender: ({ record }: { record: GuideItem }) => (
          <Space>
            <Button type="link" size="small" onClick={() => openSetScreen(record.id)}>
              设置画面
            </Button>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <PopConfirm title="确定删除该导览吗？" onConfirm={() => void deleteGuide(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    onMounted(() => {
      titleMountReady.value = Boolean(document.querySelector(`#${CONFIG_SHELL_TITLE_META_ID}`));
    });

    watch([() => guideList.value.length, () => pagination.pageSize], ([total]) => {
      const maxPage = Math.max(1, Math.ceil(total / pagination.pageSize));
      if (pagination.pageNumber > maxPage) {
        pagination.pageNumber = maxPage;
      }
    });

    const renderTitlePortals = (): JSX.Element | undefined => {
      if (!titleMountReady.value || !modelApi) {
        return undefined;
      }
      return (
        <>
          <Teleport to={`#${CONFIG_SHELL_TITLE_META_ID}`}>
            <div class={styles.entryBadge} title={`当前渲染类型：${modelApi.entryLabel.value}`}>
              <span class={styles.entryDivider} aria-hidden="true" />
              <span class={styles.entryLabel}>当前渲染类型</span>
              <span class={styles.entryValue}>{modelApi.entryLabel.value}</span>
            </div>
          </Teleport>
        </>
      );
    };

    return () => {
      if (!modelApi) {
        return <Empty description="模型配置上下文缺失" />;
      }
      if (unsupported.value) {
        return (
          <div class={styles.root}>
            {renderTitlePortals()}
            <div class={styles.emptyState}>
              <Empty description="导览列表仅支持 UE5 模型类型" />
            </div>
          </div>
        );
      }
      const data = guideData.value;
      if (!data) {
        return <Empty description="暂无导览数据" />;
      }

      return (
        <div class={styles.root}>
          {renderTitlePortals()}
          <Spin spinning={modelApi.loading.value || modelApi.saving.value}>
            <section class={styles.renderSettings}>
              <div class={styles.settingsHeader}>
                <div>
                  <div class={styles.settingsTitle}>渲染实例设置</div>
                  <div class={styles.settingsDescription}>配置导览播放时使用当前模型实例，或连接独立的渲染实例</div>
                </div>
                <Button type="primary" onClick={() => void saveRenderMode()}>
                  保存设置
                </Button>
              </div>
              <div class={styles.settingsBody}>
                <div class={styles.settingBlock}>
                  <div class={styles.settingLabel}>实例方式</div>
                  <div class={styles.renderModeGroup} role="radiogroup" aria-label="实例方式">
                    {[
                      { value: "old" as const, title: "复用实例" },
                      { value: "new" as const, title: "新实例" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={data.isOld === option.value}
                        class={[styles.renderModeOption, data.isOld === option.value ? styles.renderModeOptionActive : ""]}
                        onClick={() => changeRenderMode(option.value)}
                      >
                        {option.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div class={[styles.settingBlock, styles.instanceLineBlock]}>
                  <div class={styles.settingLabel}>实例线路地址</div>
                  {data.isOld === "new" ? (
                    <>
                      <Input
                        value={data.modelLine}
                        maxlength={50}
                        placeholder="请填写完整且可访问的实例地址"
                        class={styles.modelLineInput}
                        onUpdate:value={(val: string) => {
                          data.modelLine = val ?? "";
                          modelApi.markDirty();
                        }}
                      />
                      <div class={styles.settingHint}></div>
                    </>
                  ) : (
                    <div class={styles.instanceSummary}>
                      <span class={styles.summaryDot} aria-hidden="true" />
                      复用当前模型实例，无需配置线路地址
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section class={styles.listSection}>
              <div class={styles.listHeader}>
                <div class={styles.listHeading}>
                  <span class={styles.listTitle}>导览数据</span>
                  <span class={styles.listCount}>共 {guideList.value.length} 条</span>
                </div>
                <Button type="primary" onClick={openCreate}>
                  新增导览
                </Button>
              </div>
              <div class={styles.tableWrap}>
                <Table columns={columns} dataSource={pagedGuideList.value} pagination={false} rowKey="id" size="middle" />
              </div>
              <div class={styles.tablePagination}>
                <Page
                  current={pagination.pageNumber}
                  pageSize={pagination.pageSize}
                  total={guideList.value.length}
                  syncQuery={false}
                  onPageChange={(pageNumber: number, pageSize: number) => {
                    pagination.pageNumber = pageNumber;
                    pagination.pageSize = pageSize;
                  }}
                  onShowSizeChange={(pageNumber: number, pageSize: number) => {
                    pagination.pageNumber = pageNumber;
                    pagination.pageSize = pageSize;
                  }}
                />
              </div>
            </section>
          </Spin>

          <Modal
            visible={modal.open}
            title={modal.mode === "create" ? "新增导览" : "编辑导览"}
            confirmLoading={modal.submitting}
            destroyOnClose
            okText="保存"
            width={640}
            onOk={() => void saveGuide()}
            onCancel={() => {
              modal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "96px" } }}>
              <FormItem label="序号" required>
                <InputNumber
                  value={modal.sort}
                  min={0}
                  style={{ width: "120px" }}
                  onUpdate:value={(val: number | string | null) => {
                    modal.sort = Number(val ?? 0);
                  }}
                />
              </FormItem>
              <FormItem label="导览名称" required>
                <Input
                  value={modal.name}
                  maxlength={20}
                  placeholder="请输入导览名称"
                  onUpdate:value={(val: string) => {
                    modal.name = val ?? "";
                  }}
                />
              </FormItem>
              <FormItem label="说明描述">
                <TextArea
                  value={modal.describe}
                  maxlength={100}
                  rows={3}
                  placeholder="请输入说明"
                  onUpdate:value={(val: string) => {
                    modal.describe = val ?? "";
                  }}
                />
              </FormItem>
            </Form>
          </Modal>

          <GuideSetScreen
            visible={screenModal.open}
            guideId={screenModal.guideId}
            onUpdate:visible={(visible: boolean) => {
              screenModal.open = visible;
              if (!visible) {
                screenModal.guideId = "";
              }
            }}
          />
        </div>
      );
    };
  },
});

export default GuideSettings;
