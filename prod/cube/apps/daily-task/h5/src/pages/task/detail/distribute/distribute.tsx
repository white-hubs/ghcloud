import styles from "./distribute.module.less";
import { cubeDailyTaskService } from "@/api/server";
import { storeInspect } from "@/store/inspect";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import { cubeAppService } from "@ghcloud/cube-app-js-sdk";
import { getEnvironment } from "@ghcloud/cube-app-js-sdk/src/js/cube-h5-config";
import { Form, Field, CellGroup, Button, showNotify, Icon, ActionSheet, type ActionSheetAction } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

interface UnitAction extends ActionSheetAction {
  value: "PERCENT" | "COUNT";
}

import { debounce } from "lodash";

export const Distribute = defineComponent({
  name: "Distribute",
  setup: () => {
    const store = storeInspect();
    const router = useRouter();
    const route = useRoute();
    const allNumber = route.query.allNumber;
    const percentLimit = parseFloat(route.query.percent as string) || 1;
    const id = route.query.id as string;
    const loading = ref(false);
    const activeIndex = store.formActive;
    // Unit Selection State
    const showUnitSheet = ref(false);
    const currentEditIndex = ref(0);
    const unitActions: UnitAction[] = [
      { name: "%", value: "PERCENT" },
      // { name: '个', value: 'COUNT' }
    ];

    const form = reactive<
      {
        userId: string;
        userName: string;
        progressNumber: string;
        unit: string;
      }[]
    >([
      {
        userId: "",
        userName: "",
        progressNumber: "",
        unit: "PERCENT",
      },
    ]);

    onMounted(() => {
      if (store.distributeUser && Array.isArray(store.distributeUser) && store.distributeUser.length > 0) {
        const uniqueMap = new Map();
        const uniqueList: typeof form = [];
        let hasDuplicate = false;

        store.distributeUser.forEach((item) => {
          if (item.userId && uniqueMap.has(item.userId)) {
            hasDuplicate = true;
          } else {
            if (item.userId) {
              uniqueMap.set(item.userId, true);
            }
            uniqueList.push(item);
          }
        });

        if (hasDuplicate) {
          store.updateDistributeUser(uniqueList);
          showNotify({
            type: "warning",
            message: "处理人不能重复，已自动去重",
          });
        }
        
        form.splice(0, form.length, ...uniqueList);
      }
    });
    const openUserPicker = (index: number): void => {
      // if (form[index].userId){
      store.updateDistributeUser(form);
      store.updateFormActive(index);
      // }
      router.push({
        path: "/task-handOver",
        query: {
          isProDistribute: "true",
        },
      });
    };

    const openUnitPicker = (index: number): void => {
      currentEditIndex.value = index;
      showUnitSheet.value = true;
    };

    const debounces = new Map<number, any>();
    const getDebounce = (index: number) => {
      if (!debounces.has(index)) {
        debounces.set(
          index,
          debounce((item: any, total: number) => {
            if (item.unit !== "PERCENT") return;
            const num = parseFloat(item.progressNumber);
            if (isNaN(num)) return;
            const count = Math.ceil((total * num) / 100);
            // 向上取整后反向计算百分比
            const corrected = (count / total) * 100;
            // 如果计算结果与当前输入有差异，则更新（保留一定精度容差）
            if (Math.abs(corrected - num) > 0.0001) {
              item.progressNumber = String(corrected);
            }
          }, 500)
        );
      }
      return debounces.get(index);
    };

    const validateAndSet = (
      item: {
        userId: string;
        userName: string;
        progressNumber: string;
        unit: string;
      },
      value: string,
    ): void => {
      let num = parseFloat(value);
      if (isNaN(num)) {
        item.progressNumber = value;
        return;
      }

      const total = parseFloat(allNumber as string) || 0;
      // 计算基于百分比限制的最大可分发数量
      const maxTotalAllowed = Math.floor(total * percentLimit);

      // Calculate occupied count by other items
      const otherItems = form.filter((i) => i !== item);
      const occupiedCount = otherItems.reduce((sum, i) => sum + calculateCount(i), 0);
      const maxAllowedCount = Math.max(0, maxTotalAllowed - occupiedCount);

      if (item.unit === "PERCENT") {
        if (num > 100) num = 100;
        if (num < 0) num = 0;

        const currentCount = Math.ceil((total * num) / 100);
        if (currentCount > maxAllowedCount) {
          // Calculate max allowed percentage based on maxAllowedCount
          // We use maxAllowedCount directly to determine the percentage
          if (total > 0) {
            num = (maxAllowedCount / total) * 100;
          } else {
            num = 0;
          }
          showNotify({
            type: "warning",
            message: "分配对象总数已达上限，请重新选择",
          });
        }
      } else {
        if (num > total) num = total;
        if (num < 0) num = 0;
        if (num > maxAllowedCount) {
          num = maxAllowedCount;
          showNotify({
            type: "warning",
            message: "分配对象总数已达上限，请重新选择",
          });
        }
      }
      item.progressNumber = String(num);
      
      if (item.unit === "PERCENT") {
        const index = form.indexOf(item);
        if (index !== -1) {
          getDebounce(index)(item, total);
        }
      }
    };

    const onSelectUnit = (action: ActionSheetAction): void => {
      const unitAction = action as UnitAction;
      const item = form[currentEditIndex.value];
      item.unit = unitAction.value;
      showUnitSheet.value = false;
      validateAndSet(item, item.progressNumber);
    };

    const onInputNumber = (
      item: {
        userId: string;
        userName: string;
        progressNumber: string;
        unit: string;
      },
      e: Event,
    ): void => {
      const target = e.target as HTMLInputElement;
      validateAndSet(item, target.value);
      // Force update input value if it was clamped
      if (target.value !== item.progressNumber) {
        target.value = item.progressNumber;
      }
    };

    const addList = (): void => {
      form.push({
        userId: "",
        userName: "",
        progressNumber: "",
        unit: "PERCENT",
      });
    };

    const calculateCount = (item: { userId: string; userName: string; progressNumber: string; unit: string }): number => {
      const num = parseFloat(item.progressNumber);
      if (isNaN(num)) return 0;
      const total = parseFloat(allNumber as string) || 0;
      if (item.unit === "PERCENT") {
        return Math.ceil((total * num) / 100);
      }
      return num;
    };

    const onCancel = (): void => {
      if (getEnvironment() === "cubeApp") {
        cubeAppService.backPage();
      } else {
        history.back();
      }
    };

    const onSubmit = async (): Promise<void> => {
      // Required validation
      for (const item of form) {
        if (!item.userId) {
          showNotify({ type: "warning", message: "请选择处理人" });
          return;
        }
        if (!item.progressNumber) {
          showNotify({ type: "warning", message: "请输入完成数量" });
          return;
        }
        if (parseFloat(item.progressNumber) === 0) {
          showNotify({ type: "warning", message: "完成数量不能为0" });
          return;
        }
      }

      // Check for duplicate users
       const userIds = form.map((item) => item.userId).filter((id) => id);
        if (new Set(userIds).size !== userIds.length) {
          showNotify({
            type: "warning",
            message: "处理人不能重复",
          });
          return;
        }

      loading.value = true;
      try {
        await cubeDailyTaskService.distributeDailyTaskByPercent({
          taskId: id,
          dailyType: "DAILY_TASK",
          assignUserParams: form.map((item) => ({
            userId: item.userId,
            taskPercent: (Number(item.progressNumber) / 100),
          })),
        });
        showNotify({
          type: "success",
          message: "对象分发成功",
          duration: 1000,
          onClose: () => {
            onCancel();
          },
        });
        store.resetCache();
        if (getEnvironment() === "cubeApp") {
          cubeAppService.backPage();
        } else {
          history.back();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    return (): VNode => (
      <div class={styles.distribute_add_user}>
        <CubeNavBar showBack title="指派任务" />
        <div class={styles.task_add_user_content}>
          {form.map((item, key) => (
            <div class={styles.task_add_user_content_item} key={key}>
              <div class={styles.task_add_user_content_item_left}>
                <Form>
                  <CellGroup inset>
                    <Field
                      label="处理人"
                      readonly
                      clickable
                      required
                      placeholder="请选择处理人"
                      modelValue={item.userName}
                      is-link
                      onClick={() => {
                        openUserPicker(key);
                      }}
                    />
                    <Field label="完成数量" required>
                      {{
                        input: () => (
                          <div>
                            <div class={styles.completion_row}>
                              <div style={{ width: "50px" }}>完成</div>
                              <input
                                class={styles.input_number}
                                value={item.progressNumber}
                                onInput={(e) => onInputNumber(item, e)}
                                style={{ width: "100px" }}
                                type="number"
                              />
                              <div class={styles.unit_selector} onClick={() => openUnitPicker(key)}>
                                {/* {item.unit === 'PERCENT' ? '%' : '个'} */}
                                %
                                <Icon name="arrow-down" />
                              </div>
                            </div>
                            <div style={{ marginTop: "10px" }}>, 共{calculateCount(item)}个对象即可</div>
                          </div>
                        ),
                      }}
                    </Field>
                  </CellGroup>
                </Form>
              </div>
              <div class={styles.task_add_user_content_item_right}>
                {key === 0 ? (
                  <Icon
                    name="add"
                    class={styles.icon}
                    onClick={() => {
                      addList();
                    }}
                  />
                ) : (
                  <Icon
                    name="delete"
                    class={styles.icon}
                    onClick={() => {
                      form.splice(key, 1);
                      store.deleteIssuingData(key);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div class={styles.footer_button_group}>
          <Button block onClick={onCancel}>
            取消
          </Button>
          <Button block type="primary" loading={loading.value} onClick={onSubmit}>
            确定
          </Button>
        </div>
        <ActionSheet
          show={showUnitSheet.value}
          onUpdate:show={(v: boolean) => (showUnitSheet.value = v)}
          actions={unitActions}
          onSelect={onSelectUnit}
          cancelText="取消"
          closeOnClickAction
        />
      </div>
    );
  },
});
