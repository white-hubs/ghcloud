import { Input as AntInput } from "ant-design-vue";
import { computed, defineComponent, inject, reactive, ref, watch, type PropType } from "vue";

import {
  AntModal,
  Button,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  Page,
  PopConfirm,
  Radio,
  RadioGroup,
  Select,
  Space,
  Table,
  message,
} from "@ghcloud/cube-ui";

import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import type { ModelConfig } from "../types";
import { createConfigId } from "../utils/entry";

import styles from "./guide-settings.module.less";

const { TextArea } = AntInput;
const DEFAULT_POINT_PAGE_SIZE = 5;

type GuideItem = ModelConfig["ue5"]["guideData"]["guideList"][number];
type PointItem = NonNullable<GuideItem["pointList"]>[number];
type EffectItem = NonNullable<GuideItem["setScreen"]>["effectList"][number];

const INDICATOR_OPTIONS = [
  { label: "今日访客人数", value: "NumberVisitors" },
  { label: "会议室使用率", value: "ConferenceRoomUtilizationRate" },
  { label: "能耗电用量", value: "EnergyConsumption" },
  { label: "PM2.5", value: "PM2.5" },
];

const EFFECT_OPTIONS = [
  { label: "效果展示", value: "效果展示" },
  { label: "模型环游", value: "模型环游" },
];

const cloneGuide = (guide: GuideItem): GuideItem => JSON.parse(JSON.stringify(guide)) as GuideItem;

const ensureSetScreen = (guide: GuideItem): void => {
  if (!guide.setScreen) {
    guide.setScreen = {
      initPerspective: "",
      durationStay: 1,
      effectList: [{ name: "效果展示", value: "" }],
    };
  }
  if (!Array.isArray(guide.setScreen.effectList) || guide.setScreen.effectList.length === 0) {
    guide.setScreen.effectList = [{ name: "效果展示", value: "" }];
  }
  if (!Array.isArray(guide.pointList)) {
    guide.pointList = [];
  }
};

/** 导览设置画面：按“初始画面 → 轮播点位”的播放顺序分步配置并统一保存。 */
export const GuideSetScreen = defineComponent({
  name: "GuideSetScreen",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    guideId: {
      type: String as PropType<string>,
      default: "",
    },
  },
  emits: {
    "update:visible": (_visible: boolean) => true,
  },
  setup(props, { emit }) {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const currentStep = ref(0);
    const saving = ref(false);
    const draft = ref<GuideItem | null>(null);
    const pointPagination = reactive({
      pageNumber: 1,
      pageSize: DEFAULT_POINT_PAGE_SIZE,
    });
    const pointModal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      id: "",
      title: "",
      point: "",
      angleView: "",
      type: "characters",
      time: 1,
      describe: "",
      indicatorType: "",
    });

    const screen = computed(() => draft.value?.setScreen ?? null);
    const effects = computed<EffectItem[]>(() => screen.value?.effectList ?? []);
    const points = computed<PointItem[]>(() => draft.value?.pointList ?? []);
    const pagedPoints = computed(() => {
      const start = (pointPagination.pageNumber - 1) * pointPagination.pageSize;
      return points.value.slice(start, start + pointPagination.pageSize);
    });

    const loadDraft = (): void => {
      currentStep.value = 0;
      pointPagination.pageNumber = 1;
      pointModal.open = false;
      if (!modelApi || !props.guideId) {
        draft.value = null;
        return;
      }
      const source = modelApi.modelConfig.value.ue5.guideData.guideList.find((item) => item.id === props.guideId);
      if (!source) {
        draft.value = null;
        return;
      }
      const next = cloneGuide(source);
      ensureSetScreen(next);
      draft.value = next;
    };

    watch(
      () => [props.visible, props.guideId] as const,
      ([visible]) => {
        if (visible) {
          loadDraft();
        }
      },
      { immediate: true },
    );

    const close = (): void => {
      emit("update:visible", false);
      draft.value = null;
      currentStep.value = 0;
      pointModal.open = false;
    };

    const addEffect = (): void => {
      screen.value?.effectList.push({ name: "效果展示", value: "" });
    };

    const removeEffect = (index: number): void => {
      if (!screen.value || screen.value.effectList.length <= 1) {
        return;
      }
      screen.value.effectList.splice(index, 1);
    };

    const resetPointForm = (): void => {
      pointModal.id = createConfigId();
      pointModal.title = "";
      pointModal.point = "";
      pointModal.angleView = "";
      pointModal.type = "characters";
      pointModal.time = 1;
      pointModal.describe = "";
      pointModal.indicatorType = "";
    };

    const openCreatePoint = (): void => {
      resetPointForm();
      pointModal.mode = "create";
      pointModal.open = true;
    };

    const openEditPoint = (record: PointItem): void => {
      pointModal.mode = "edit";
      pointModal.id = record.id;
      pointModal.title = record.title;
      pointModal.point = record.point;
      pointModal.angleView = record.angleView;
      pointModal.type = record.type || "characters";
      pointModal.time = Number(record.time) || 1;
      pointModal.describe = record.describe;
      pointModal.indicatorType = record.indicatorType;
      pointModal.open = true;
    };

    const savePoint = (): void => {
      if (!draft.value) {
        return;
      }
      const pointName = pointModal.point.trim();
      if (!pointName) {
        message.warning("请输入点位名称");
        return;
      }
      if (Number(pointModal.time) <= 0) {
        message.warning("停留时长必须大于 0 秒");
        return;
      }
      const payload: PointItem = {
        id: pointModal.id,
        title: pointModal.title.trim(),
        point: pointName,
        angleView: pointModal.angleView.trim(),
        type: pointModal.type,
        time: Number(pointModal.time),
        describe: pointModal.describe.trim(),
        indicatorType: pointModal.indicatorType,
      };
      const nextPoints = [...points.value];
      if (pointModal.mode === "create") {
        nextPoints.push(payload);
        pointPagination.pageNumber = Math.max(1, Math.ceil(nextPoints.length / pointPagination.pageSize));
      } else {
        const index = nextPoints.findIndex((item) => item.id === pointModal.id);
        if (index < 0) {
          message.error("点位不存在");
          return;
        }
        nextPoints[index] = payload;
      }
      draft.value.pointList = nextPoints;
      pointModal.open = false;
    };

    const deletePoint = (id: string): void => {
      if (!draft.value) {
        return;
      }
      draft.value.pointList = points.value.filter((item) => item.id !== id);
    };

    const saveGuide = async (): Promise<void> => {
      if (!modelApi || !draft.value) {
        return;
      }
      const index = modelApi.modelConfig.value.ue5.guideData.guideList.findIndex((item) => item.id === draft.value?.id);
      if (index < 0) {
        message.error("导览不存在");
        return;
      }
      saving.value = true;
      try {
        const nextList = [...modelApi.modelConfig.value.ue5.guideData.guideList];
        const previous = nextList[index];
        nextList[index] = cloneGuide(draft.value);
        modelApi.modelConfig.value.ue5.guideData.guideList = nextList;
        modelApi.markDirty();
        const ok = await modelApi.save();
        if (ok) {
          close();
        } else {
          const rollbackList = [...modelApi.modelConfig.value.ue5.guideData.guideList];
          rollbackList[index] = previous;
          modelApi.modelConfig.value.ue5.guideData.guideList = rollbackList;
        }
      } finally {
        saving.value = false;
      }
    };

    const handlePrimary = (): void => {
      if (currentStep.value === 0) {
        if (!screen.value || Number(screen.value.durationStay) <= 0) {
          message.warning("初始画面停留时长必须大于 0 秒");
          return;
        }
        currentStep.value = 1;
        return;
      }
      void saveGuide();
    };

    const goToStep = (target: number): void => {
      if (target === currentStep.value) {
        return;
      }
      if (target === 0) {
        currentStep.value = 0;
        return;
      }
      if (!screen.value || Number(screen.value.durationStay) <= 0) {
        message.warning("初始画面停留时长必须大于 0 秒");
        return;
      }
      currentStep.value = 1;
    };

    const columns = [
      { title: "点位", dataIndex: "point", key: "point", width: 140, ellipsis: true },
      { title: "点位视角", dataIndex: "angleView", key: "angleView", ellipsis: true },
      { title: "点位介绍", dataIndex: "describe", key: "describe", width: 180, ellipsis: true },
      {
        title: "停留时长",
        dataIndex: "time",
        key: "time",
        width: 110,
        customRender: ({ record }: { record: PointItem }) => `${record.time || 0} 秒`,
      },
      {
        title: "操作",
        key: "action",
        width: 120,
        customRender: ({ record }: { record: PointItem }) => (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => openEditPoint(record)}>
              编辑
            </Button>
            <PopConfirm title="确定删除该点位吗？" onConfirm={() => deletePoint(record.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    watch([() => points.value.length, () => pointPagination.pageSize], ([total]) => {
      const maxPage = Math.max(1, Math.ceil(total / pointPagination.pageSize));
      if (pointPagination.pageNumber > maxPage) {
        pointPagination.pageNumber = maxPage;
      }
    });

    const renderInitialScreen = () => {
      if (!screen.value) {
        return <Empty description="暂无初始画面配置" />;
      }
      return (
        <div class={styles.wizardContent}>
          <div class={styles.contentHeader}>
            <div>
              <div class={styles.contentTitle}>初始画面</div>
              <div class={styles.contentDescription}>设置导览开始播放时的默认视角、停留时间和展示效果</div>
            </div>
          </div>
          <div class={styles.screenCard}>
            <Form layout="horizontal" labelCol={{ style: { width: "96px" } }} class={styles.screenForm}>
              <FormItem label="初始视角">
                <TextArea
                  value={screen.value.initPerspective}
                  maxlength={500}
                  rows={3}
                  placeholder="请粘贴或输入初始视角参数"
                  onUpdate:value={(value: string) => {
                    if (screen.value) screen.value.initPerspective = value ?? "";
                  }}
                />
              </FormItem>
              <FormItem label="停留时长" required>
                <div class={styles.durationInput}>
                  <InputNumber
                    value={screen.value.durationStay}
                    min={0.1}
                    step={0.5}
                    style={{ width: "140px" }}
                    onUpdate:value={(value: number | string | null) => {
                      if (screen.value) screen.value.durationStay = Number(value ?? 1);
                    }}
                  />
                  <span class={styles.durationUnit}>秒</span>
                </div>
              </FormItem>
            </Form>
          </div>
          <div class={styles.screenCard}>
            <div class={styles.cardHeader}>
              <div>
                <div class={styles.cardTitle}>初始效果</div>
                <div class={styles.cardDescription}>可配置进入导览时要展示的模型标签或模型环游效果</div>
              </div>
              <Button type="link" onClick={addEffect}>
                添加效果
              </Button>
            </div>
            <div class={styles.effects}>
              {effects.value.map((effect, index) => (
                <div key={`${index}-${effect.name}`} class={styles.effectRow}>
                  <span class={styles.effectIndex}>{index + 1}</span>
                  <Select
                    value={effect.name}
                    options={EFFECT_OPTIONS}
                    style={{ width: "150px" }}
                    onUpdate:value={(value: string | number | string[]) => {
                      effect.name = String(value ?? "效果展示");
                    }}
                  />
                  {effect.name !== "模型环游" ? (
                    <Input
                      value={effect.value}
                      maxlength={100}
                      placeholder="请输入模型标签，多个用英文逗号分隔"
                      class={styles.effectValueInput}
                      onUpdate:value={(value: string) => {
                        effect.value = value ?? "";
                      }}
                    />
                  ) : (
                    <span class={styles.effectRoamHint}>播放模型预设环游动画，无需填写模型标签</span>
                  )}
                  <Button type="link" danger disabled={effects.value.length === 1} onClick={() => removeEffect(index)}>
                    删除
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };

    const renderPoints = () => (
      <div class={[styles.wizardContent, styles.pointsContent]}>
        <div class={styles.contentHeader}>
          <div>
            <div class={styles.contentTitle}>轮播点位</div>
            <div class={styles.contentDescription}>初始画面结束后，系统将按列表顺序切换视角并停留指定时间</div>
          </div>
          <Button type="primary" onClick={openCreatePoint}>
            新增点位
          </Button>
        </div>
        <div class={styles.pointTableWrap}>
          <Table columns={columns} dataSource={pagedPoints.value} pagination={false} rowKey="id" size="middle" scrollY={300} />
        </div>
        <div class={styles.tablePagination}>
          <Page
            current={pointPagination.pageNumber}
            pageSize={pointPagination.pageSize}
            total={points.value.length}
            syncQuery={false}
            onPageChange={(pageNumber: number, pageSize: number) => {
              pointPagination.pageNumber = pageNumber;
              pointPagination.pageSize = pageSize;
            }}
            onShowSizeChange={(pageNumber: number, pageSize: number) => {
              pointPagination.pageNumber = pageNumber;
              pointPagination.pageSize = pageSize;
            }}
          />
        </div>
      </div>
    );

    const renderWizardFooter = () => (
      <div class={styles.wizardFooter}>
        <Button onClick={currentStep.value === 0 ? close : () => goToStep(0)}>{currentStep.value === 0 ? "取消" : "上一步"}</Button>
        <Button type="primary" loading={saving.value} onClick={handlePrimary}>
          {currentStep.value === 0 ? "下一步" : "保存设置"}
        </Button>
      </div>
    );

    return () => (
      <>
        <AntModal
          open={props.visible}
          centered
          title={
            <div class={styles.modalTitle}>
              <span class={styles.modalTitleText}>设置画面</span>
              {draft.value?.name ? (
                <>
                  <span class={styles.modalTitleDivider} aria-hidden="true" />
                  <span class={styles.modalGuideName}>{draft.value.name}</span>
                </>
              ) : undefined}
            </div>
          }
          width="min(1120px, calc(100vw - 48px))"
          destroyOnClose
          closable
          footer={renderWizardFooter()}
          onCancel={close}
        >
          <div class={styles.guideWizard}>
            <aside class={styles.wizardAside}>
              <div class={styles.asideHeader}>
                <div class={styles.asideTitle}>配置流程</div>
                <div class={styles.asideDescription}>按照导览播放顺序完成设置</div>
              </div>
              <div class={styles.wizardNav}>
                {[
                  { title: "初始画面", description: "视角、停留与效果" },
                  { title: "轮播点位", description: "点位内容与顺序" },
                ].map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    class={[
                      styles.wizardStep,
                      currentStep.value === index ? styles.wizardStepActive : "",
                      currentStep.value > index ? styles.wizardStepComplete : "",
                    ]}
                    aria-current={currentStep.value === index ? "step" : undefined}
                    onClick={() => goToStep(index)}
                  >
                    <span class={styles.stepMarker}>{currentStep.value > index ? "✓" : index + 1}</span>
                    <span class={styles.stepText}>
                      <span class={styles.stepTitle}>{item.title}</span>
                      <span class={styles.stepDescription}>{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
              <div class={styles.asideTip}>完成第二步后统一保存，取消不会写入本次修改</div>
            </aside>
            <main class={styles.wizardMain}>
              {!draft.value ? <Empty description="未找到对应导览" /> : currentStep.value === 0 ? renderInitialScreen() : renderPoints()}
            </main>
          </div>
        </AntModal>

        <Modal
          visible={pointModal.open}
          title={pointModal.mode === "create" ? "新增轮播点位" : "编辑轮播点位"}
          destroyOnClose
          okText="保存"
          width="680px"
          onOk={savePoint}
          onCancel={() => {
            pointModal.open = false;
          }}
        >
          <Form layout="horizontal" labelCol={{ style: { width: "96px" } }} class={styles.pointForm}>
            <FormItem label="点位名称" required>
              <Input
                value={pointModal.point}
                maxlength={50}
                placeholder="请输入点位名称"
                onUpdate:value={(value: string) => {
                  pointModal.point = value ?? "";
                }}
              />
            </FormItem>
            <FormItem label="点位视角">
              <TextArea
                value={pointModal.angleView}
                maxlength={500}
                rows={3}
                placeholder="请粘贴或输入点位视角参数"
                onUpdate:value={(value: string) => {
                  pointModal.angleView = value ?? "";
                }}
              />
            </FormItem>
            <FormItem label="停留时长" required>
              <div class={styles.durationInput}>
                <InputNumber
                  value={pointModal.time}
                  min={0.1}
                  step={0.5}
                  style={{ width: "140px" }}
                  onUpdate:value={(value: number | string | null) => {
                    pointModal.time = Number(value ?? 1);
                  }}
                />
                <span class={styles.durationUnit}>秒</span>
              </div>
            </FormItem>
            <FormItem label="说明类型">
              <RadioGroup
                value={pointModal.type}
                onUpdate:value={(value: string | number) => {
                  pointModal.type = String(value);
                }}
              >
                <Radio value="characters">文字介绍</Radio>
                <Radio value="chart">统计图表</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="内容标题">
              <Input
                value={pointModal.title}
                maxlength={20}
                placeholder="请输入轮播内容标题"
                onUpdate:value={(value: string) => {
                  pointModal.title = value ?? "";
                }}
              />
            </FormItem>
            {pointModal.type === "characters" ? (
              <FormItem label="点位介绍">
                <TextArea
                  value={pointModal.describe}
                  maxlength={100}
                  rows={3}
                  placeholder="请输入点位详细说明"
                  onUpdate:value={(value: string) => {
                    pointModal.describe = value ?? "";
                  }}
                />
              </FormItem>
            ) : (
              <FormItem label="展示指标">
                <Select
                  value={pointModal.indicatorType || undefined}
                  options={INDICATOR_OPTIONS}
                  allowClear
                  placeholder="请选择统计指标"
                  style={{ width: "100%" }}
                  onUpdate:value={(value: string | number | string[]) => {
                    pointModal.indicatorType = value == null || value === "" ? "" : String(value);
                  }}
                />
              </FormItem>
            )}
          </Form>
        </Modal>
      </>
    );
  },
});

export default GuideSetScreen;
