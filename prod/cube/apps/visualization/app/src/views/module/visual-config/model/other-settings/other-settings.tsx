import { EnvironmentOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, inject, onMounted, reactive, ref, Teleport, watch } from "vue";

import {
  Button,
  Empty,
  Form,
  FormItem,
  Input,
  InputNumber,
  Modal,
  PopConfirm,
  Radio,
  RadioGroup,
  Space,
  Spin,
  Switch,
  Table,
  message,
} from "@ghcloud/cube-ui";
import { useMapModal } from "@ghcloud/generic-component";

import { CONFIG_SHELL_TITLE_EXTRA_ID, CONFIG_SHELL_TITLE_META_ID } from "../../config-shell";
import { MODEL_CONFIGURATION_KEY, type ModelConfigurationApi } from "../composables/use-model-configuration";
import type { ModelConfig } from "../types";
import { createConfigId, isGisEntry, isScadaEntry, isThreeEntry, isUe5Entry } from "../utils/entry";

import styles from "./other-settings.module.less";

type ThreeBg = ModelConfig["three"]["scene"]["background"]["images"][number];
type ScadaBg = ModelConfig["scada"]["background"][number];

const SCADA_AREA_OPTIONS = ["一级区域(白天图片)", "一级区域(夜晚图片)", "二级区域(白天图片)", "二级区域(夜晚图片)"];

const DEFAULT_MODEL_LOCATION = {
  lng: 116.290158,
  lat: 39.894696,
};

const STYLE_PREVIEW_ASSETS = {
  classicsNav: "/resource/v1/visual-config/classics-nav.png",
  policeNav: "/resource/v1/visual-config/police-nav.png",
} as const;

/**
 * 其他设置：UE5 表单 / Three&二维 背景图列表。
 */
export const OtherSettings = defineComponent({
  name: "OtherSettings",
  setup() {
    const modelApi = inject(MODEL_CONFIGURATION_KEY) as ModelConfigurationApi | undefined;
    const titleMountReady = ref(false);
    const { showMapModal } = useMapModal();
    const ueForm = reactive({
      iconScale: 1 as number | string,
      isFilterArea: "display",
      deviceStyle: "pop",
      navType: "classicsNav",
      cardType: "classicsCard",
      autoWeather: false,
      lng: DEFAULT_MODEL_LOCATION.lng,
      lat: DEFAULT_MODEL_LOCATION.lat,
    });
    const bgModal = reactive({
      open: false,
      mode: "create" as "create" | "edit",
      index: -1,
      submitting: false,
      url: "",
      area: "",
      id: "",
    });

    const entry = computed(() => modelApi?.modelConfig.value.entry ?? "views");
    const unsupported = computed(() => isGisEntry(entry.value));

    const syncUeForm = (): void => {
      if (!modelApi || !isUe5Entry(entry.value)) {
        return;
      }
      const ue5 = modelApi.modelConfig.value.ue5;
      ueForm.iconScale = ue5.iconScale ?? 1;
      ueForm.isFilterArea = ue5.isFilterArea ?? "display";
      ueForm.deviceStyle = ue5.deviceStyle ?? "pop";
      ueForm.navType = ue5.navType ?? "classicsNav";
      ueForm.cardType = ue5.cardType ?? "classicsCard";
      ueForm.autoWeather = !!ue5.autoWeather;
      ueForm.lng = ue5.modelLocation?.lng ?? DEFAULT_MODEL_LOCATION.lng;
      ueForm.lat = ue5.modelLocation?.lat ?? DEFAULT_MODEL_LOCATION.lat;
    };

    watch(
      () => [modelApi?.loaded.value, modelApi?.modelConfig.value.entry, modelApi?.modelConfig.value.ue5],
      () => {
        syncUeForm();
      },
      { immediate: true, deep: true },
    );

    onMounted(() => {
      titleMountReady.value = !!(
        document.querySelector(`#${CONFIG_SHELL_TITLE_META_ID}`) && document.querySelector(`#${CONFIG_SHELL_TITLE_EXTRA_ID}`)
      );
    });

    const bgList = computed(() => {
      if (!modelApi) {
        return [] as Array<ThreeBg | ScadaBg>;
      }
      if (isThreeEntry(entry.value)) {
        return modelApi.modelConfig.value.three.scene.background.images;
      }
      if (isScadaEntry(entry.value)) {
        return modelApi.modelConfig.value.scada.background;
      }
      return [];
    });

    const saveUe = async (): Promise<void> => {
      if (!modelApi) {
        return;
      }
      modelApi.modelConfig.value.ue5.iconScale = ueForm.iconScale;
      modelApi.modelConfig.value.ue5.isFilterArea = ueForm.isFilterArea;
      modelApi.modelConfig.value.ue5.deviceStyle = ueForm.deviceStyle;
      modelApi.modelConfig.value.ue5.navType = ueForm.navType;
      modelApi.modelConfig.value.ue5.cardType = ueForm.cardType;
      modelApi.modelConfig.value.ue5.autoWeather = ueForm.autoWeather;
      modelApi.modelConfig.value.ue5.modelLocation = {
        lng: Number(ueForm.lng) || 0,
        lat: Number(ueForm.lat) || 0,
      };
      modelApi.markDirty();
      await modelApi.save();
    };

    const openLocationPicker = (): void => {
      showMapModal({
        title: "选择模型所在位置",
        width: "960px",
        center: {
          lng: Number(ueForm.lng) || DEFAULT_MODEL_LOCATION.lng,
          lat: Number(ueForm.lat) || DEFAULT_MODEL_LOCATION.lat,
        },
        modalConfirm: ({ lng, lat }) => {
          ueForm.lng = lng;
          ueForm.lat = lat;
        },
      });
    };

    const openCreateBg = (): void => {
      bgModal.mode = "create";
      bgModal.index = -1;
      bgModal.url = "";
      bgModal.area = isScadaEntry(entry.value) ? SCADA_AREA_OPTIONS[0] : "";
      bgModal.id = createConfigId();
      bgModal.open = true;
    };

    const openEditBg = (record: ThreeBg | ScadaBg, index: number): void => {
      bgModal.mode = "edit";
      bgModal.index = index;
      bgModal.url = record.url;
      bgModal.id = record.id;
      if (isThreeEntry(entry.value) && "area" in record && Array.isArray(record.area)) {
        bgModal.area = record.area.map((item) => item.name).join("，");
      } else if (isScadaEntry(entry.value) && "area" in record && Array.isArray(record.area)) {
        bgModal.area = record.area[0] || SCADA_AREA_OPTIONS[0];
      } else {
        bgModal.area = "";
      }
      bgModal.open = true;
    };

    const saveBg = async (): Promise<void> => {
      if (!modelApi) {
        return;
      }
      const url = bgModal.url.trim();
      if (!url) {
        message.warning("请输入图片地址");
        return;
      }
      bgModal.submitting = true;
      try {
        if (isThreeEntry(entry.value)) {
          const list = [...modelApi.modelConfig.value.three.scene.background.images];
          const areaNames = bgModal.area
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean);
          const row: ThreeBg = {
            id: bgModal.id || createConfigId(),
            url,
            area: areaNames.map((name) => ({ id: name, name, aliasName: name })),
          };
          if (bgModal.mode === "edit" && bgModal.index >= 0) {
            list[bgModal.index] = row;
          } else {
            list.push(row);
          }
          modelApi.modelConfig.value.three.scene.background.images = list;
        } else if (isScadaEntry(entry.value)) {
          const list = [...modelApi.modelConfig.value.scada.background];
          const row: ScadaBg = {
            id: bgModal.id || createConfigId(),
            url,
            area: [bgModal.area || SCADA_AREA_OPTIONS[0]],
          };
          if (bgModal.mode === "edit" && bgModal.index >= 0) {
            list[bgModal.index] = row;
          } else {
            list.push(row);
          }
          modelApi.modelConfig.value.scada.background = list;
        }
        modelApi.markDirty();
        const ok = await modelApi.save();
        if (ok) {
          bgModal.open = false;
        }
      } finally {
        bgModal.submitting = false;
      }
    };

    const deleteBg = async (index: number): Promise<void> => {
      if (!modelApi) {
        return;
      }
      if (isThreeEntry(entry.value)) {
        const list = [...modelApi.modelConfig.value.three.scene.background.images];
        list.splice(index, 1);
        modelApi.modelConfig.value.three.scene.background.images = list;
      } else if (isScadaEntry(entry.value)) {
        const list = [...modelApi.modelConfig.value.scada.background];
        list.splice(index, 1);
        modelApi.modelConfig.value.scada.background = list;
      }
      modelApi.markDirty();
      await modelApi.save();
    };

    const bgColumns = [
      { title: "图片地址", dataIndex: "url", key: "url", ellipsis: true },
      {
        title: "关联区域",
        key: "area",
        ellipsis: true,
        customRender: ({ record }: { record: ThreeBg | ScadaBg }) => {
          if (Array.isArray(record.area)) {
            if (record.area.length && typeof record.area[0] === "object") {
              return (record.area as ThreeBg["area"]).map((item) => item.name).join("，") || "--";
            }
            return (record.area as string[]).join("，") || "--";
          }
          return "--";
        },
      },
      {
        title: "操作",
        key: "action",
        width: 140,
        customRender: ({ record, index }: { record: ThreeBg | ScadaBg; index: number }) => (
          <Space size={0}>
            <Button type="link" size="small" onClick={() => openEditBg(record, index)}>
              编辑
            </Button>
            <PopConfirm title="确定删除吗？" onConfirm={() => void deleteBg(index)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </Space>
        ),
      },
    ];

    return () => {
      if (!modelApi) {
        return <div>模型配置上下文缺失</div>;
      }

      return (
        <div class={styles.root}>
          {titleMountReady.value && (
            <>
              <Teleport to={`#${CONFIG_SHELL_TITLE_META_ID}`}>
                <div class={styles.entryBadge} title={`当前渲染类型：${modelApi.entryLabel.value}`}>
                  <span class={styles.entryDivider} aria-hidden="true" />
                  <span class={styles.entryLabel}>当前渲染类型</span>
                  <span class={styles.entryValue}>{modelApi.entryLabel.value}</span>
                </div>
              </Teleport>
              {!unsupported.value && (
                <Teleport to={`#${CONFIG_SHELL_TITLE_EXTRA_ID}`}>
                  {isUe5Entry(entry.value) ? (
                    <Button type="primary" loading={modelApi.saving.value} onClick={() => void saveUe()}>
                      保存设置
                    </Button>
                  ) : (
                    <Button type="primary" onClick={openCreateBg}>
                      新增背景图
                    </Button>
                  )}
                </Teleport>
              )}
            </>
          )}
          <Spin spinning={modelApi.loading.value || modelApi.saving.value}>
            {unsupported.value && (
              <div class={styles.emptyState}>
                <Empty description="WebGIS 其他设置暂未开放" />
              </div>
            )}

            {isUe5Entry(entry.value) && (
              <Form layout="horizontal" labelCol={{ style: { width: "140px" } }} class={styles.form}>
                <FormItem label="图标大小">
                  <div class={styles.fieldContent}>
                    <div class={styles.fieldInline}>
                      <div class={styles.scaleInput}>
                        <InputNumber
                          value={ueForm.iconScale}
                          min={0.1}
                          max={10}
                          precision={1}
                          step={0.1}
                          stringMode
                          placeholder="请输入图标比例"
                          onUpdate:value={(val: number | string) => {
                            ueForm.iconScale = val;
                          }}
                        />
                      </div>
                      <span class={styles.fieldHelp}>建议 0.1–10</span>
                    </div>
                  </div>
                </FormItem>

                <FormItem label="区域设备过滤">
                  <div class={styles.fieldContent}>
                    <div class={styles.fieldInline}>
                      <RadioGroup
                        value={ueForm.isFilterArea}
                        onUpdate:value={(val: string | number) => {
                          ueForm.isFilterArea = String(val);
                        }}
                      >
                        <Radio value="hide">开启</Radio>
                        <Radio value="display">关闭</Radio>
                      </RadioGroup>
                      <span class={styles.fieldHelp}>开启后，仅显示当前区域及其下级区域关联的设备</span>
                    </div>
                  </div>
                </FormItem>

                <FormItem label="设备详情风格">
                  <div class={styles.fieldContent}>
                    <RadioGroup
                      value={ueForm.deviceStyle}
                      onUpdate:value={(val: string | number) => {
                        ueForm.deviceStyle = String(val);
                      }}
                    >
                      <Radio value="pop">弹窗</Radio>
                      <Radio value="panel">面板</Radio>
                    </RadioGroup>
                  </div>
                </FormItem>

                <FormItem label="菜单风格">
                  <div class={styles.fieldContent}>
                    <div class={styles.fieldInline}>
                      <RadioGroup
                        value={ueForm.navType}
                        onUpdate:value={(val: string | number) => {
                          ueForm.navType = String(val);
                        }}
                      >
                        <Radio value="classicsNav">经典导航</Radio>
                        <Radio value="policeNav">警务导航</Radio>
                      </RadioGroup>
                      <span class={styles.fieldHelp}>图片仅作风格参考，实际效果以可视化端为准</span>
                    </div>
                    <div class={styles.exampleHeading}></div>
                    <div class={styles.exampleList}>
                      <div class={[styles.exampleCard, ueForm.navType === "classicsNav" ? styles.exampleCardActive : ""]}>
                        <div class={styles.exampleTitle}>
                          <span>经典导航</span>
                          {ueForm.navType === "classicsNav" && <span class={styles.selectedTag}>当前选择</span>}
                        </div>
                        <img class={styles.navPreview} src={STYLE_PREVIEW_ASSETS.classicsNav} alt="经典导航效果示例" />
                      </div>
                      <div class={[styles.exampleCard, ueForm.navType === "policeNav" ? styles.exampleCardActive : ""]}>
                        <div class={styles.exampleTitle}>
                          <span>警务导航</span>
                          {ueForm.navType === "policeNav" && <span class={styles.selectedTag}>当前选择</span>}
                        </div>
                        <img class={styles.navPreview} src={STYLE_PREVIEW_ASSETS.policeNav} alt="警务导航效果示例" />
                      </div>
                    </div>
                  </div>
                </FormItem>

                <FormItem label="自动切换天气">
                  <div class={styles.fieldContent}>
                    <Switch
                      checked={ueForm.autoWeather}
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      onUpdate:checked={(val: boolean) => {
                        ueForm.autoWeather = val;
                      }}
                    />
                  </div>
                </FormItem>

                <FormItem label="模型所在位置">
                  <div class={styles.fieldContent}>
                    <div class={styles.locationInputs}>
                      <div class={styles.coordinateField}>
                        <span>经度</span>
                        <InputNumber
                          value={ueForm.lng}
                          precision={15}
                          placeholder="请输入经度"
                          onUpdate:value={(val: number | string) => {
                            ueForm.lng = Number(val) || 0;
                          }}
                        />
                      </div>
                      <div class={styles.coordinateField}>
                        <span>纬度</span>
                        <InputNumber
                          value={ueForm.lat}
                          precision={15}
                          placeholder="请输入纬度"
                          onUpdate:value={(val: number | string) => {
                            ueForm.lat = Number(val) || 0;
                          }}
                        />
                      </div>
                      <Button type="primary" class={styles.mapButton} title="地图选点" onClick={openLocationPicker}>
                        <EnvironmentOutlined />
                      </Button>
                    </div>
                  </div>
                </FormItem>
              </Form>
            )}

            {(isThreeEntry(entry.value) || isScadaEntry(entry.value)) && (
              <div class={styles.backgroundList}>
                <Table
                  columns={bgColumns}
                  dataSource={bgList.value}
                  size="middle"
                  pagination={false}
                  rowKey={(row: ThreeBg | ScadaBg) => row.id || row.url}
                />
              </div>
            )}
          </Spin>

          <Modal
            visible={bgModal.open}
            title={bgModal.mode === "create" ? "新增背景图" : "编辑背景图"}
            confirmLoading={bgModal.submitting}
            destroyOnClose
            okText="保存"
            onOk={() => void saveBg()}
            onCancel={() => {
              bgModal.open = false;
            }}
          >
            <Form layout="horizontal" labelCol={{ style: { width: "88px" } }}>
              <FormItem label="图片地址" required>
                <Input
                  value={bgModal.url}
                  placeholder="请输入图片 URL"
                  onUpdate:value={(val: string) => {
                    bgModal.url = val ?? "";
                  }}
                />
              </FormItem>
              <FormItem label="关联区域">
                {isScadaEntry(entry.value) ? (
                  <RadioGroup
                    value={bgModal.area}
                    onUpdate:value={(val: string | number) => {
                      bgModal.area = String(val);
                    }}
                  >
                    {SCADA_AREA_OPTIONS.map((item) => (
                      <Radio key={item} value={item}>
                        {item}
                      </Radio>
                    ))}
                  </RadioGroup>
                ) : (
                  <Input
                    value={bgModal.area}
                    placeholder="多个区域用逗号分隔"
                    onUpdate:value={(val: string) => {
                      bgModal.area = val ?? "";
                    }}
                  />
                )}
              </FormItem>
            </Form>
          </Modal>
        </div>
      );
    };
  },
});

export default OtherSettings;
