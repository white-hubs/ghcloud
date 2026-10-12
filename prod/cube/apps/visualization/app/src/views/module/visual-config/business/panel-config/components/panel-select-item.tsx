import { HolderOutlined } from "@ant-design/icons-vue";
import { computed, defineComponent, ref, watch, type PropType } from "vue";

import type { AreaScenePanelConfig, AreaScenePanelModifyParam } from "@ghcloud/cube-service-interface/mdata";
import { Button, Cascader, Form, FormItem, Input, Select, SelectOption, Tag } from "@ghcloud/cube-ui";
import { panelDefinition } from "@ghcloud/cube-visual-sdk/src/data-panel/panel-definition";

import { PANEL_CARD_GAP } from "../panel-card-shift";
import { buildPanelOptions, type PanelOption } from "../panel-options";
import { usePanelCardDrag } from "../use-panel-card-drag";

import styles from "./panel-select.module.less";

type PanelPosition = "LEFT_PANEL" | "RIGHT_PANEL";

type CustomCard = {
  uuid: string;
  cardComponents: string | string[] | undefined;
  cardProps: { title: string };
};

type CascaderOption = {
  label: string;
  value: string;
  children: { label: string; value: string }[];
};

const CUSTOM_PANEL_KEYS = new Set(["UniversalPanel", "EnergyPanel"]);
const PANEL_OPTIONS = buildPanelOptions(panelDefinition);
const SPLIT_KEYS = new Set(Object.keys(panelDefinition));

const createUuid = (): string => globalThis.crypto?.randomUUID?.() ?? `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const buildCardCascaderData = (): CascaderOption[] =>
  Object.entries(panelDefinition).map(([key, value]) => ({
    label: value.name,
    value: key,
    children: (value.cards ?? [])
      .filter((card): card is NonNullable<typeof card> => Boolean(card?.code && card?.title))
      .map((card) => ({
        label: card.title,
        value: card.code,
      })),
  }));

const CARD_CASCADER_DATA = buildCardCascaderData();

const isEditablePanel = (panelKey: string | null | undefined): boolean => {
  if (!panelKey) {
    return false;
  }
  return SPLIT_KEYS.has(panelKey) || CUSTOM_PANEL_KEYS.has(panelKey);
};

const emptyCard = (): CustomCard => ({
  uuid: createUuid(),
  cardComponents: undefined,
  cardProps: { title: "" },
});

const isSameCardComponent = (current: CustomCard["cardComponents"], next: string[] | undefined): boolean => {
  if (!next) {
    return !current;
  }
  if (Array.isArray(current)) {
    return current.length === next.length && current.every((value, index) => value === next[index]);
  }
  return Boolean(current) && current === next[next.length - 1];
};

/**
 * 单侧面板：选择面板模板 + 卡片组件/标题编辑（对齐原 visual-config）。
 */
export const PanelSelectItem = defineComponent({
  name: "PanelSelectItem",
  props: {
    panelPosition: {
      type: String as PropType<PanelPosition>,
      required: true,
    },
    config: {
      type: Object as PropType<AreaScenePanelConfig | AreaScenePanelModifyParam | null>,
      default: null,
    },
  },
  emits: {
    "update:config": (_value: AreaScenePanelModifyParam | null) => true,
  },
  setup(props, { emit, expose }) {
    const selectPanel = ref<string | undefined>(undefined);
    const customPanel = ref<CustomCard[]>([]);
    const selectedOption = computed(() => PANEL_OPTIONS.find((item) => item.value === selectPanel.value) ?? null);
    const showCardEditor = computed(() => isEditablePanel(selectPanel.value));

    const setBuiltInCards = (panelKey: string): void => {
      const cards = (panelDefinition[panelKey]?.cards ?? []).filter((card): card is NonNullable<typeof card> =>
        Boolean(card?.code && card?.title),
      );
      customPanel.value = cards.map((card) => ({
        uuid: createUuid(),
        cardComponents: [panelKey, card.code],
        cardProps: { title: card.title },
      }));
    };

    const hydrateFromConfig = (panelKey: string, config: AreaScenePanelConfig | AreaScenePanelModifyParam | null): void => {
      customPanel.value = [];
      if (!isEditablePanel(panelKey)) {
        return;
      }
      const panelConfig =
        (config as AreaScenePanelConfig | null)?.universalPanelVo ?? (config as AreaScenePanelModifyParam | null)?.universalPanelParam;
      if (config && config.panelConfig === panelKey && panelConfig) {
        if (panelConfig.items) {
          try {
            const parsed = JSON.parse(panelConfig.items) as CustomCard[];
            if (Array.isArray(parsed) && parsed.length) {
              customPanel.value = parsed.map((item) => ({
                uuid: item.uuid || createUuid(),
                cardComponents: item.cardComponents,
                cardProps: { title: String(item.cardProps?.title ?? "") },
              }));
              return;
            }
          } catch {
            // fall through to legacy fields / built-in
          }
        }
        if (panelConfig.tableOne) {
          customPanel.value.push({
            uuid: createUuid(),
            cardComponents: panelConfig.tableOne,
            cardProps: { title: panelConfig.tableOneName ?? "" },
          });
        }
        if (panelConfig.tableTwo) {
          customPanel.value.push({
            uuid: createUuid(),
            cardComponents: panelConfig.tableTwo,
            cardProps: { title: panelConfig.tableTwoName ?? "" },
          });
        }
        if (panelConfig.tableThree) {
          customPanel.value.push({
            uuid: createUuid(),
            cardComponents: panelConfig.tableThree,
            cardProps: { title: panelConfig.tableThreeName ?? "" },
          });
        }
        if (customPanel.value.length) {
          return;
        }
      }
      if (SPLIT_KEYS.has(panelKey)) {
        setBuiltInCards(panelKey);
      } else {
        customPanel.value = [emptyCard()];
      }
    };

    const handlePanelSelect = (value: string | undefined, fromConfig = false): void => {
      selectPanel.value = value;
      if (!value) {
        customPanel.value = [];
        return;
      }
      if (fromConfig) {
        hydrateFromConfig(value, props.config);
        return;
      }
      if (!isEditablePanel(value)) {
        customPanel.value = [];
        return;
      }
      if (SPLIT_KEYS.has(value)) {
        setBuiltInCards(value);
      } else {
        customPanel.value = [emptyCard()];
      }
    };

    watch(
      () => [props.config?.panelConfig, props.config] as const,
      ([panelKey]) => {
        if (panelKey) {
          handlePanelSelect(panelKey, true);
        } else {
          selectPanel.value = undefined;
          customPanel.value = [];
        }
      },
      { immediate: true },
    );

    const pushNewCustomPanel = (): void => {
      customPanel.value.push(emptyCard());
    };

    const removeCustomPanel = (index: number): void => {
      customPanel.value.splice(index, 1);
    };

    const validateCards = (): string | null => {
      if (!showCardEditor.value) {
        return null;
      }
      for (const [index, card] of customPanel.value.entries()) {
        const components = card.cardComponents;
        const hasComponent = Array.isArray(components) ? components.length > 0 : Boolean(components);
        if (!hasComponent) {
          return `请选择${props.panelPosition === "LEFT_PANEL" ? "左" : "右"}面板卡片组件${index + 1}`;
        }
        if (!String(card.cardProps.title ?? "").trim()) {
          return `请填写${props.panelPosition === "LEFT_PANEL" ? "左" : "右"}面板卡片标题${index + 1}`;
        }
      }
      return null;
    };

    const validate = async (): Promise<void> => {
      if (!selectPanel.value) {
        emit("update:config", null);
        return;
      }
      const error = validateCards();
      if (error) {
        throw new Error(error);
      }
      emit("update:config", {
        panelConfig: selectPanel.value,
        panelPosition: props.panelPosition,
        universalPanelParam: {
          tableOne: "",
          tableOneName: "",
          tableTwo: "",
          tableTwoName: "",
          tableThree: "",
          tableThreeName: "",
          items: customPanel.value.length ? JSON.stringify(customPanel.value) : null,
        },
      });
    };

    expose({ validate });

    const dragApi = usePanelCardDrag();
    const listEl = ref<HTMLElement>();
    dragApi.register(props.panelPosition, customPanel, showCardEditor, listEl);

    const filterOption = (input: string, option: PanelOption): boolean => option.label.toLowerCase().includes(input.toLowerCase());

    const cardRefFns = new Map<string, (el: Element | null) => void>();
    const bindCardEl = (uuid: string) => {
      const cached = cardRefFns.get(uuid);
      if (cached) {
        return cached;
      }
      const fn = (el: Element | null) => {
        dragApi.bindCardEl(props.panelPosition, uuid, el instanceof HTMLElement ? el : null);
      };
      cardRefFns.set(uuid, fn);
      return fn;
    };

    const isOrigin = (uuid: string): boolean => dragApi.session.value?.uuid === uuid;

    const cardItemClass = (uuid: string): Record<string, boolean> => {
      const origin = isOrigin(uuid);
      return {
        [styles.cardItem]: true,
        [styles.cardSorting]: Boolean(dragApi.session.value),
        [styles.cardOrigin]: origin,
        [styles.cardOriginAway]: origin && dragApi.isOriginAway(props.panelPosition),
      };
    };

    const cardItemStyle = (uuid: string, index: number): Record<string, string> | undefined => {
      const current = dragApi.session.value;
      if (!current) {
        return undefined;
      }
      if (isOrigin(uuid)) {
        if (!dragApi.isOriginAway(props.panelPosition)) {
          return undefined;
        }
        return {
          height: "0px",
          marginBottom: "0px",
          paddingTop: "0px",
          paddingBottom: "0px",
        };
      }
      const shift = dragApi.cardShift(props.panelPosition, uuid, index);
      return { transform: shift ? `translate3d(0, ${shift}px, 0)` : "none" };
    };

    const incomingSpacerStyle = (): Record<string, string> => {
      const current = dragApi.session.value;
      const target = dragApi.over.value;
      if (!current || !target || target.position !== props.panelPosition || !target.valid || current.from === props.panelPosition) {
        return { height: "0px" };
      }
      return { height: `${current.height + PANEL_CARD_GAP}px` };
    };

    return () => {
      const line = dragApi.insertLine(props.panelPosition);
      const sorting = Boolean(dragApi.session.value);
      const incomingStyle = incomingSpacerStyle();
      const incoming = incomingStyle.height !== "0px";
      const listInvalid = Boolean(dragApi.over.value?.position === props.panelPosition && dragApi.over.value.valid === false);

      return (
        <div class={styles.column}>
          <h3 class={styles.title}>{props.panelPosition === "LEFT_PANEL" ? "左面板" : "右面板"}</h3>
          <Select
            value={selectPanel.value}
            showSearch
            allowClear
            placeholder="请选择面板"
            optionFilterProp="label"
            optionLabelProp="label"
            filterOption={filterOption}
            class={styles.panelSelect}
            onChange={(val: string | number | string[] | undefined) => {
              const next = val == null || val === "" ? undefined : String(val);
              handlePanelSelect(next, false);
            }}
          >
            {PANEL_OPTIONS.map((item) => (
              <SelectOption key={item.value} value={item.value} label={item.label}>
                <span class={styles.optionRow}>
                  <span>{item.label}</span>
                  {item.split ? <Tag color="green">已拆分</Tag> : null}
                </span>
              </SelectOption>
            ))}
          </Select>

          {selectedOption.value && (
            <div
              ref={listEl}
              class={[styles.cardList, sorting ? styles.cardListSorting : undefined, listInvalid ? styles.dropInvalid : undefined]}
            >
              {line ? (
                <div
                  class={[styles.insertLine, line.valid ? undefined : styles.insertLineInvalid]}
                  style={{ top: `${line.top}px`, opacity: 1 }}
                />
              ) : null}
              {showCardEditor.value ? (
                customPanel.value.length ? (
                  <>
                    {customPanel.value.map((card, index) => (
                      <div
                        key={card.uuid}
                        ref={bindCardEl(card.uuid)}
                        class={cardItemClass(card.uuid)}
                        style={cardItemStyle(card.uuid, index)}
                      >
                        <span
                          class={styles.dragHandle}
                          title="拖拽调整顺序，可拖到另一侧面板"
                          onPointerdown={(event: PointerEvent) => {
                            const cardEl = event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
                            if (!(cardEl instanceof HTMLElement)) {
                              return;
                            }
                            dragApi.startPointerDrag({
                              from: props.panelPosition,
                              uuid: card.uuid,
                              title: card.cardProps.title || `卡片${index + 1}`,
                              event,
                              cardEl,
                            });
                          }}
                        >
                          <HolderOutlined />
                        </span>
                        <Form class={styles.cardForm} layout="horizontal" labelCol={{ style: { width: "100px" } }}>
                          <FormItem label={`卡片组件${index + 1}`} required>
                            <div class={styles.cardActions}>
                              <Cascader
                                value={card.cardComponents as string[] | undefined}
                                options={CARD_CASCADER_DATA}
                                placeholder="请选择卡片组件"
                                class={styles.cardCascader}
                                showSearch
                                onUpdate:value={(val: string[]) => {
                                  const componentChanged = !isSameCardComponent(card.cardComponents, val);
                                  card.cardComponents = val;
                                  if (componentChanged && val?.length > 1) {
                                    const title = panelDefinition[val[0]]?.cards?.find((item) => item?.code === val[1])?.title ?? "";
                                    card.cardProps.title = title;
                                  }
                                }}
                              />
                              {index === 0 ? (
                                <>
                                  <Button type="link" onClick={pushNewCustomPanel}>
                                    添加
                                  </Button>
                                  <Button type="link" danger onClick={() => removeCustomPanel(index)}>
                                    删除
                                  </Button>
                                </>
                              ) : (
                                <Button type="link" danger onClick={() => removeCustomPanel(index)}>
                                  删除
                                </Button>
                              )}
                            </div>
                          </FormItem>
                          <FormItem label={`卡片标题${index + 1}`} required>
                            <Input
                              value={card.cardProps.title}
                              maxlength={20}
                              showCount
                              placeholder="请输入卡片标题"
                              onUpdate:value={(val: string) => {
                                card.cardProps.title = val ?? "";
                              }}
                            />
                          </FormItem>
                        </Form>
                      </div>
                    ))}
                    <div class={styles.insertSpacer} style={incomingStyle} />
                  </>
                ) : (
                  <div class={[styles.emptyDrop, incoming ? styles.emptyDropActive : undefined]}>
                    <span>拖拽卡片到此处</span>
                    <Button type="link" onClick={pushNewCustomPanel}>
                      添加
                    </Button>
                  </div>
                )
              ) : (
                <p class={styles.unsplitTip}>
                  该面板暂未拆分卡片，保存后将按整面板生效
                  {selectedOption.value.split ? null : "（展会/演示面板）"}
                </p>
              )}
            </div>
          )}
        </div>
      );
    };
  },
});

export default PanelSelectItem;
