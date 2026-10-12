import styles from "./illegal-parking-config.module.less";
import { cubeParkingLotService } from "@/api/service";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { IllegalLevel, type IllegalParkingConfigVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, InputNumber, Select, message, Spin, RadioGroup } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent, onMounted, reactive, ref, computed } from "vue";

export const IllegalParkingConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const loading = ref(false);
    const saveLoading = ref(false);

    const state = reactive({
      cycleType: "MONTH",
      customDays: undefined as string | number | undefined,
      rules: [] as {
        key: string;
        id?: number | undefined;
        level?: IllegalLevel | undefined;
        score?: number | undefined;
      }[],
      deletedIds: [] as number[],
    });

    const LevelOptions = [
      { label: "一般", value: IllegalLevel.General },
      { label: "严重", value: IllegalLevel.Serious },
      { label: "轻微", value: IllegalLevel.Light },
      { label: "致命", value: IllegalLevel.Fatal },
    ];

    const loadData = async () => {
      loading.value = true;
      try {
        const res = await cubeParkingLotService.getIllegalParkingConfig();
        let configs: IllegalParkingConfigVO[] = [];
        if (Array.isArray(res)) {
          configs = res;
        } else if (res && typeof res === "object") {
          configs = [res];
        }
        state.cycleType =
          configs?.[0]?.timeCycle && ["MONTH", "QUARTER", "HALF_YEAR"].includes(configs?.[0]?.timeCycle)
            ? configs[0].timeCycle
            : "INTERVAL";
        state.customDays = state?.cycleType === "INTERVAL" ? configs[0]?.timeCycle : undefined;

        state.rules = configs.map((cfg, index) => {
          const rule = {
            key: `old-${cfg.id}-${index}`,
            level: cfg.illegalLevel,
            score: cfg.score,
            id: cfg.id,
          };
          return rule;
        });

        if (state.rules.length === 0) {
          addRule();
        }
      } catch (error) {
        message.error("获取配置失败");
      } finally {
        loading.value = false;
      }
    };

    const addRule = () => {
      state.rules.push({
        key: `new-${Date.now()}`,
      });
    };

    const removeRule = (index: number) => {
      const rule = state.rules[index];
      if (rule.id) {
        state.deletedIds.push(rule.id);
      }
      state.rules.splice(index, 1);
    };

    const validate = () => {
      if (state.cycleType === "INTERVAL" && !state.customDays) {
        message.error("请输入间隔天数");
        return false;
      }

      const levels = new Set();
      for (const rule of state.rules) {
        if (!rule.level) {
          message.error("请选择违停严重程度");
          return false;
        }
        if (rule.score === undefined || rule.score === null) {
          message.error("请输入扣除分数");
          return false;
        }
        if (levels.has(rule.level)) {
          message.error("违停严重程度不能重复");
          return false;
        }
        levels.add(rule.level);
      }
      return true;
    };

    const isAddDisabled = computed(() => {
      const selectedLevels = new Set(state.rules.map((r) => r.level).filter((l) => l !== undefined));
      return LevelOptions.every((opt) => selectedLevels.has(opt.value));
    });

    const onSave = async () => {
      if (!validate()) {
        return;
      }

      saveLoading.value = true;
      try {
        const param = state.rules?.map((item) => ({
          id: item.id,
          timeCycle: state.cycleType === "INTERVAL" ? state.customDays : state.cycleType,
          illegalLevel: item.level,
          score: item.score,
        }));
        await cubeParkingLotService.saveIllegalParkingConfig(param);
        message.success("保存成功");
        state.deletedIds = [];
        loadData();
      } catch (error) {
        message.error("保存失败");
      } finally {
        saveLoading.value = false;
      }
    };

    onMounted(() => {
      loadData();
    });

    return () => (
      <CubeLayout title={pageTitle}>
        {{
          "layout-content": () => (
            <div class={styles.container}>
              <Spin spinning={loading.value}>
                {/* 统计周期 */}
                <div class={styles["form-item"]}>
                  <div class={styles.label}>
                    <span>统计周期：</span>
                  </div>
                  <div class={styles.content}>
                    <div class={styles["cycle-group"]}>
                      <RadioGroup
                        v-model:value={state.cycleType}
                        options={[
                          { label: "按月", value: "MONTH" },
                          { label: "按季度", value: "QUARTER" },
                          { label: "按半年", value: "HALF_YEAR" },
                          { label: "间隔", value: "INTERVAL" },
                        ]}
                      />
                      {state.cycleType === "INTERVAL" && (
                        <div>
                          <InputNumber class={styles["custom-input"]} v-model:value={state.customDays} min={1} placeholder="间隔天数" />
                          <span>天循环统计</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 扣分规则 */}
                <div class={styles["form-item"]}>
                  <div class={styles.label}>
                    <span>扣分规则：</span>
                  </div>
                  <div class={styles.content}>
                    <div class={styles["rule-list"]}>
                      {state.rules.map((rule, index) => (
                        <div key={rule.key} class={styles["rule-item"]}>
                          <Select
                            class={styles["select-value"]}
                            v-model:value={rule.level}
                            options={LevelOptions}
                            placeholder="违停严重程度"
                          />
                          <span style="white-space: nowrap;">扣除</span>
                          <InputNumber
                            class={styles["input-score"]}
                            v-model:value={rule.score}
                            min={0}
                            max={99999}
                            placeholder="分数"
                            style={{ width: "100px !important" }}
                          />
                          <span>分</span>

                          <div class={styles["action-btn"]}>
                            {index === 0 ? (
                              <>
                                <Button type="link" disabled={isAddDisabled.value} onClick={addRule}>
                                  添加
                                </Button>
                              </>
                            ) : (
                              <Button type="link" danger onClick={() => removeRule(index)}>
                                删除
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Spin>
            </div>
          ),
          'footer-page': () => (
            <Button type="primary" loading={saveLoading.value} onClick={onSave}>
              保存
            </Button>
          ),
        }}
      </CubeLayout>
    );
  },
});
