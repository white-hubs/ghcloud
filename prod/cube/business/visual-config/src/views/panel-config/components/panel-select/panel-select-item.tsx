import { computed, defineComponent, onMounted, ref, watch } from "vue";

import { Button, Cascader, Form, Input, Select, SelectOption, Space, Tag } from "@ghcloud/cube-ui";
import FormItem from "@ghcloud/cube-ui/src/components/form-item/form-item";
import { panelDefinition } from "@ghcloud/cube-visual-sdk";

import { panelList, type PanelType } from "../../panel-config-i";
import type { ReturnAreaScenePanelConfig } from "@/api/models/mdata";
import { getAssetsFile, createUuid } from "@/utils/common";

import styles from "./panel-select.module.less";
interface Props {
  panelPosition: "LEFT_PANEL" | "RIGHT_PANEL";
  config: ReturnAreaScenePanelConfig | null;
}

export const PanelSelectItem = defineComponent({
  props: ["panelPosition", "config"],
  emits: ["update:config"],
  setup(props: Props, { expose, emit }) {
    const selectPanel = ref<string | null | undefined>(undefined);
    const selectPanelOptions = ref<PanelType | null>(null);
    const customPanel = ref<
      {
        uuid: string;
        cardComponents: string | string[] | undefined;
        cardProps: Record<string, unknown>;
      }[]
    >([]);
    const customPanelKey = ["UniversalPanel", "EnergyPanel"];
    const formRef = ref<{ validate: () => Promise<boolean> }>();
    const formRules = {
      cardComponents: [{ required: true, message: "请选择卡片组件" }],
      cardProps: [
        {
          required: true,
          validator: async (_rule: unknown, value: Record<string, unknown>): Promise<void> => {
            for (const key in value) {
              if (!value[key]) {
                return Promise.reject(new Error("请检查配置"));
              }
            }
            return Promise.resolve();
          },
        },
      ],
    };
    const cardCascaderData = ref<
      {
        label: string;
        value: string;
        children: {
          label: string;
          value: string;
        }[];
      }[]
    >([]);
    generateCardCascaderData();

    watch(
      () => props.config?.panelConfig,
      () => {
        if (props.config) {
          handlePanelSelect(props.config.panelConfig);
        } else {
          selectPanel.value = null;
          selectPanelOptions.value = null;
        }
      },
    );

    /** 判断是否要显示面板图片 */
    const showPanelImage = computed(() => {
      // 已经拆完的面板
      if (Object.keys(panelDefinition).includes(selectPanel.value ?? "")) {
        return false;
      }
      // 能碳、设备通用面板
      if (customPanelKey.includes(selectPanel.value ?? "")) {
        return false;
      }
      return true;
    });

    function pushNewCustomPanel(): void {
      // if (customPanel.value.length >= 4) {
      //   message.warning('最多添加4个自定义面板')
      //   return
      // }

      customPanel.value.push({
        uuid: createUuid(),
        cardComponents: undefined,
        cardProps: {
          title: "",
        },
      });
    }

    function setBuiltInCards(panelKey: string): void {
      panelDefinition[panelKey].cards.forEach((card) => {
        // if (i < 4) { // 最多4个卡片
        customPanel.value.push({
          uuid: createUuid(),
          cardComponents: [panelKey, card.code],
          cardProps: {
            title: card.title,
          },
        });
        // }
      });
    }
    function handlePanelSelect(checkedValue: string): void {
      selectPanelOptions.value = panelList.value.find((e) => e.value === checkedValue) ?? null;
      selectPanel.value = checkedValue ?? undefined;
      customPanel.value.length = 0;

      // 自定义面板 & 设备通用面板配置填充
      if (!showPanelImage.value) {
        if (checkedValue === props.config?.panelConfig) {
          // 兼容老配置
          if (props.config.universalPanelVo?.tableOne) {
            customPanel.value.push({
              uuid: createUuid(),
              cardComponents: props.config.universalPanelVo.tableOne,
              cardProps: {
                title: props.config.universalPanelVo.tableOneName,
              },
            });
          }
          if (props.config.universalPanelVo?.tableTwo) {
            customPanel.value.push({
              uuid: createUuid(),
              cardComponents: props.config.universalPanelVo.tableTwo,
              cardProps: {
                title: props.config.universalPanelVo.tableTwoName,
              },
            });
          }
          if (props.config.universalPanelVo?.tableThree) {
            customPanel.value.push({
              uuid: createUuid(),
              cardComponents: props.config.universalPanelVo.tableThree,
              cardProps: {
                title: props.config.universalPanelVo.tableThreeName,
              },
            });
          }
          if (props.config.universalPanelVo?.items) {
            customPanel.value = JSON.parse(props.config.universalPanelVo.items);
          } else {
            if (Object.keys(panelDefinition).includes(selectPanel.value)) {
              setBuiltInCards(selectPanel.value);
            }
          }
        } else {
          if (Object.keys(panelDefinition).includes(selectPanel.value)) {
            setBuiltInCards(selectPanel.value);
          } else {
            pushNewCustomPanel();
          }
        }
      }
    }

    async function validate(): Promise<void> {
      if (!selectPanel.value) {
        emit("update:config", null);
        return;
      }
      await formRef.value?.validate();
      emit("update:config", {
        panelConfig: selectPanel.value,
        panelPosition: props.panelPosition,
        universalPanelParam: {
          tableOne: "",
          tableOneName: "",
          tableThree: "",
          tableThreeName: "",
          tableTwo: "",
          tableTwoName: "",
          items: customPanel.value.length ? JSON.stringify(customPanel.value) : null,
        },
      });
    }
    expose({
      validate,
    });

    onMounted(() => {
      const splitKeys = Object.keys(panelDefinition);
      const allPanels = panelList.value;

      const splitPanels = allPanels.filter((p) => splitKeys.includes(p.value));
      const unsplitPanels = allPanels.filter((p) => !splitKeys.includes(p.value));
      const demoPanels = unsplitPanels.filter((p) => p.label.includes("展会"));
    });

    return (): JSX.Element => (
      <div class="panel-select-item">
        <h3>{props.panelPosition === "LEFT_PANEL" ? "左面板" : "右面板"}</h3>
        <Select
          v-model:value={selectPanel.value}
          show-search
          filterOption={(input: string, option: PanelType): boolean => {
            return option.label.toLowerCase().includes(input.toLowerCase());
          }}
          placeholder="请选择面板"
          onChange={handlePanelSelect}
          allowClear
        >
          {panelList.value.map((item: PanelType, index) => {
            return (
              <SelectOption value={item.value} label={item.label} key={item.value}>
                {item.label}&nbsp;&nbsp;
                {Object.keys(panelDefinition).includes(item.value) && <Tag color="green">已拆分</Tag>}
              </SelectOption>
            );
          })}
        </Select>
        <div style="overflow-y:auto;max-height:calc(100vh - 240px)">
          {selectPanelOptions.value &&
            (showPanelImage.value ? (
              <img
                src={getAssetsFile(selectPanelOptions.value.image as string)}
                width="250"
                style={{ background: "rgba(0,0,0,0.7)", marginTop: "10px" }}
              />
            ) : (
              customPanel.value.map((e, i) => {
                return (
                  <Form
                    class={styles["form-box"]}
                    model={e}
                    ref={formRef}
                    rules={formRules}
                    label-col={{ style: { width: "100px" } }}
                    key={e.uuid}
                  >
                    <FormItem label={"卡片组件" + (i + 1)} name="cardComponents">
                      <Space>
                        <Cascader
                          options={cardCascaderData.value}
                          v-model:value={e.cardComponents}
                          placeholder="请选择卡片组件"
                          style="min-width: 200px"
                          showSearch={{
                            filter: (inputValue: string, path: any[]) => {
                              const keyword = inputValue.toLowerCase();
                              return path.some((option?: { label?: unknown }) => {
                                return typeof option?.label === "string" && option.label.toLowerCase().includes(keyword);
                              });
                            },
                          }}
                          onChange={(value: string[]) => {
                            if (!e.cardProps.title && value.length > 1) {
                              e.cardProps.title = panelDefinition[value[0]].cards.find((e) => e.code === value[1])?.title ?? "";
                            }
                          }}
                        />
                        <Button
                          type="link"
                          danger={i !== 0}
                          onClick={() => {
                            if (i === 0) {
                              pushNewCustomPanel();
                            } else {
                              customPanel.value.splice(i, 1);
                            }
                          }}
                        >
                          {i !== 0 ? "删除" : "添加"}
                        </Button>
                        <Button
                          v-show={i === 0}
                          type="link"
                          danger
                          onClick={() => {
                            customPanel.value.splice(i, 1);
                          }}
                        >
                          删除
                        </Button>
                      </Space>
                    </FormItem>
                    <FormItem label={"卡片标题" + (i + 1)} name="cardProps">
                      <Input v-model:value={e.cardProps.title} placeholder="请输入卡片标题" />
                    </FormItem>
                  </Form>
                );
              })
            ))}
        </div>
      </div>
    );

    function generateCardCascaderData(): void {
      for (const key in panelDefinition) {
        cardCascaderData.value.push({
          label: panelDefinition[key].name,
          value: key,
          children: panelDefinition[key].cards.map((card) => {
            return {
              label: card?.title,
              value: card?.code,
            };
          }),
        });
      }
    }
  },
});
