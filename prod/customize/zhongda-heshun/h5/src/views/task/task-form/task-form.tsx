import styles from "./task-form.module.less";
import { cubeZhongdaHeshunService } from "@/api/server";
import { useMetaTitle } from "@/hooks/use-meta-title-hook";
import { storeKill } from "@/store/kill";
import { useTaskStore } from "@/store/task";
import type { Command, ScheduleMode } from "@ghcloud/cube-zhongda-heshun-service";
import { showNotify, showToast, Popup, Picker, Button, Icon, Field, PullRefresh } from "vant";
import { defineComponent, reactive, ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

type RepeatType = "DAILY" | "WEEKLY";
type TaskType = "DRIVE_MOSQUITO" | "MIST_SPRAY";

const COMMAND = {
  DEVICE_OFF: "DEVICE_OFF" as Command,
  DRIVE_MOSQUITO: "DRIVE_MOSQUITO" as Command,
  MIST_SPRAY: "MIST_SPRAY" as Command,
  SCHEDULED_TASK: "SCHEDULED_TASK" as Command,
};
const SCHEDULEMODE = {
  DAILY: "DAILY" as ScheduleMode,
  WEEKLY: "WEEKLY" as ScheduleMode,
};
interface TaskPeriod {
  id: string;
  type: TaskType;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export const TaskForm = defineComponent({
  name: "TaskForm",
  setup() {
    useMetaTitle();
    const router = useRouter();
    const route = useRoute();
    const taskStore = useTaskStore();
    const id = route.query.id as string;
    const store = storeKill();

    const taskName = ref("");
    const repeatType = ref<RepeatType>("DAILY");
    const activeWeekDay = ref<number>(1);

    const periodsMap = reactive<Record<number, TaskPeriod[]>>({
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    });

    const existingDeviceIds = ref<string[]>([]);
    const hasOfflineDevice = ref<boolean | undefined>(false);

    const loadTaskDetail = async () => {
      if (!id) {
        return;
      }

      try {
        // 清空现有时段，避免重复叠加
        for (let i = 0; i <= 7; i++) {
          periodsMap[i].splice(0, periodsMap[i].length);
        }

        const detail = await cubeZhongdaHeshunService.getDeviceScheduledTaskDetail(id);

        taskName.value = detail.name || "";
        repeatType.value = detail.scheduleMode === SCHEDULEMODE.DAILY ? "DAILY" : "WEEKLY";

        if (detail.deviceIds) {
          existingDeviceIds.value = detail.deviceIds.map(String);
        }

        hasOfflineDevice.value = detail.deviceList?.some((device) => !device.deviceState);

        if (detail.planList) {
          detail.planList.forEach((plan) => {
            const period: TaskPeriod = {
              id: Date.now().toString() + Math.random().toString().slice(2),
              type: plan.command === COMMAND.DRIVE_MOSQUITO ? "DRIVE_MOSQUITO" : "MIST_SPRAY",
              startTime: plan.startTime || "00:00",
              endTime: plan.endTime || "00:00",
            };

            if (detail.scheduleMode === SCHEDULEMODE.DAILY) {
              periodsMap[0].push(period);
            } else if (plan.dayOfWeek) {
              periodsMap[plan.dayOfWeek].push(period);
            }
          });
        }
      } catch (error) {
        showNotify({ type: "danger", message: "加载任务详情失败" });
      }
    };

    onMounted(() => {
      if (id) {
        loadTaskDetail();
      }
    });

    const refreshing = ref(false);
    const resetForm = () => {
      taskName.value = "";
      repeatType.value = "DAILY";
      activeWeekDay.value = 1;
      for (let i = 0; i <= 7; i++) {
        periodsMap[i].splice(0, periodsMap[i].length);
      }
    };
    const onRefresh = async (): Promise<void> => {
      try {
        if (id) {
          await loadTaskDetail();
        } else {
          resetForm();
        }
      } finally {
        refreshing.value = false;
      }
    };

    const currentPeriods = computed(() => {
      if (repeatType.value === "DAILY") {
        return periodsMap[0];
      }
      return periodsMap[activeWeekDay.value];
    });

    const showTimePicker = ref(false);
    const activePeriodId = ref<string | null>(null);
    const activeTimeType = ref<"start" | "end" | null>(null);
    const timePickerValue = ref<string[]>(["00", "00"]);
    const pickerTitle = ref("选择时间");

    const weekOptions = [
      { label: "周一", value: 1 },
      { label: "周二", value: 2 },
      { label: "周三", value: 3 },
      { label: "周四", value: 4 },
      { label: "周五", value: 5 },
      { label: "周六", value: 6 },
      { label: "周日", value: 7 },
    ];

    const createEmptyPeriod = (): TaskPeriod => ({
      id: Date.now().toString() + Math.random().toString().slice(2),
      type: "DRIVE_MOSQUITO",
      startTime: "00:00",
      endTime: "00:00",
    });

    const handleAddPeriod = () => {
      const targetList = repeatType.value === "DAILY" ? periodsMap[0] : periodsMap[activeWeekDay.value];
      targetList.push(createEmptyPeriod());
    };

    const handleRemovePeriod = (index: number) => {
      const targetList = repeatType.value === "DAILY" ? periodsMap[0] : periodsMap[activeWeekDay.value];
      targetList.splice(index, 1);
    };

    const openTimePicker = (periodId: string, type: "start" | "end", currentTime: string) => {
      activePeriodId.value = periodId;
      activeTimeType.value = type;
      pickerTitle.value = type === "start" ? "开始时间" : "结束时间";
      const [hour, minute] = currentTime.split(":");
      timePickerValue.value = [hour, minute];
      showTimePicker.value = true;
    };

    const handleTimeConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
      if (activePeriodId.value && activeTimeType.value) {
        const targetList = repeatType.value === "DAILY" ? periodsMap[0] : periodsMap[activeWeekDay.value];
        const period = targetList.find((p) => p.id === activePeriodId.value);

        if (period) {
          const newTime = `${selectedValues[0]}:${selectedValues[1]}`;
          const newTimeMinutes = timeToMinutes(newTime);

          if (activeTimeType.value === "start") {
            const endTimeMinutes = timeToMinutes(period.endTime);
            if (newTimeMinutes >= endTimeMinutes && period.endTime !== "00:00") {
              showNotify({ type: "warning", message: "开始时间必须小于结束时间" });
              return;
            }
            period.startTime = newTime;
          } else {
            const startTimeMinutes = timeToMinutes(period.startTime);
            if (newTimeMinutes <= startTimeMinutes) {
              showNotify({ type: "warning", message: "结束时间必须大于开始时间" });
              return;
            }
            period.endTime = newTime;
          }
        }
      }
      showTimePicker.value = false;
    };

    const timeToMinutes = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const validatePeriods = (periods: TaskPeriod[], dayLabel: string) => {
      if (periods.length === 0) {
        return true;
      }

      for (let i = 0; i < periods.length; i++) {
        const p1 = periods[i];
        const start1 = timeToMinutes(p1.startTime);
        const end1 = timeToMinutes(p1.endTime);

        if (start1 >= end1) {
          showNotify({ type: "warning", message: `${dayLabel} 时段 ${i + 1} 开始时间必须小于结束时间` });
          return false;
        }

        for (let j = i + 1; j < periods.length; j++) {
          const p2 = periods[j];
          const start2 = timeToMinutes(p2.startTime);
          const end2 = timeToMinutes(p2.endTime);

          if (Math.max(start1, start2) <= Math.min(end1, end2)) {
            showNotify({ type: "warning", message: `${dayLabel} 时段 ${i + 1} 与 时段 ${j + 1} 时间重叠，请调整` });
            return false;
          }
        }
      }
      return true;
    };

    const saveLoading = ref(false);
    const handleSave = async () => {
      if (!taskName.value) {
        showNotify({ type: "warning", message: "请输入任务名称" });
        return;
      }

      const { selectedDevices } = taskStore;
      let finalDeviceIds: (string | number)[] = [];

      if (!id) {
        if (selectedDevices.length === 0) {
          showNotify({ type: "warning", message: "请先选择设备" });
          return;
        }
        finalDeviceIds = selectedDevices.map((d) => d.id);
      } else {
        if (selectedDevices.length > 0) {
          finalDeviceIds = selectedDevices.map((d) => d.id);
        } else {
          if (existingDeviceIds.value.length === 0) {
          }
          finalDeviceIds = existingDeviceIds.value;
        }
      }
      // Validate periods
      if (repeatType.value === "DAILY") {
        if (periodsMap[0].length === 0) {
          showNotify({ type: "warning", message: "请至少添加一个任务时段" });
          return;
        }
        if (!validatePeriods(periodsMap[0], "每天")) {
          return;
        }
      } else {
        let hasAnyPeriod = false;
        for (let i = 1; i <= 7; i++) {
          if (periodsMap[i].length > 0) {
            hasAnyPeriod = true;
            if (!validatePeriods(periodsMap[i], weekOptions.find((w) => w.value === i)?.label || "")) {
              return;
            }
          }
        }
        if (!hasAnyPeriod) {
          showNotify({ type: "warning", message: "请至少为某一天添加一个任务时段" });
          return;
        }
      }

      const planList: any[] = [];
      if (repeatType.value === "DAILY") {
        periodsMap[0].forEach((p) => {
          planList.push({
            command: p.type === "DRIVE_MOSQUITO" ? COMMAND.DRIVE_MOSQUITO : COMMAND.MIST_SPRAY,
            startTime: p.startTime,
            endTime: p.endTime,
          });
        });
      } else {
        for (let i = 1; i <= 7; i++) {
          periodsMap[i].forEach((p) => {
            planList.push({
              command: p.type === "DRIVE_MOSQUITO" ? COMMAND.DRIVE_MOSQUITO : COMMAND.MIST_SPRAY,
              startTime: p.startTime,
              endTime: p.endTime,
              dayOfWeek: i,
            });
          });
        }
      }

      const payload = {
        id: id || undefined,
        name: taskName.value,
        deviceIds: finalDeviceIds,
        scheduleMode: repeatType.value === "DAILY" ? SCHEDULEMODE.DAILY : SCHEDULEMODE.WEEKLY,
        planList: planList,
        groupId: store.groupActive,
      };

      try {
        saveLoading.value = true;
        if (id) {
          await cubeZhongdaHeshunService.updateDeviceScheduledTask(payload as any);
        } else {
          await cubeZhongdaHeshunService.createDeviceScheduledTask(payload);
        }
        showToast("保存成功");
        setTimeout(() => {
          taskStore.clearTaskState();
          router.push({
            path: "/task",
            query: {
              refresh: "true",
              timestamp: Date.now().toString(),
            },
          });
        }, 1000);
      } catch (error) {
        showToast("保存失败");
      } finally {
        saveLoading.value = false;
      }
    };

    const hours = Array.from({ length: 24 }, (_, i) => ({ text: i.toString().padStart(2, "0"), value: i.toString().padStart(2, "0") }));
    const minutes = Array.from({ length: 60 }, (_, i) => ({ text: i.toString().padStart(2, "0"), value: i.toString().padStart(2, "0") }));
    const columns = [hours, minutes];

    return () => (
      <div class={styles.container}>
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles["task-form-pull-refresh"]}>
          <div class={styles["form-group"]}>
            <Field v-model={taskName.value} placeholder="请输入任务名称" label="任务名称" input-align="right" />
          </div>

          <div class={styles["header-toggle"]}>
            <div
              class={`${styles["toggle-item"]} ${repeatType.value === "DAILY" ? styles.active : ""}`}
              onClick={() => (repeatType.value = "DAILY")}
            >
              每天
            </div>
            <div
              class={`${styles["toggle-item"]} ${repeatType.value === "WEEKLY" ? styles.active : ""}`}
              onClick={() => (repeatType.value = "WEEKLY")}
            >
              每周
            </div>
          </div>

          {repeatType.value === "WEEKLY" && (
            <div class={styles["week-days"]}>
              {weekOptions.map((option) => (
                <div
                  key={option.value}
                  class={`${styles["day-item"]} ${activeWeekDay.value === option.value ? styles.active : ""} ${periodsMap[option.value].length > 0 ? styles.hasData : ""}`}
                  onClick={() => (activeWeekDay.value = option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}

          <div class={styles["section-title"]}>
            {repeatType.value === "DAILY" ? "每天任务时段" : `${weekOptions.find((w) => w.value === activeWeekDay.value)?.label}任务时段`}
          </div>

          <div class={styles["add-btn"]} onClick={handleAddPeriod}>
            <Icon name="add-o" size="18" />
            <span>添加任务时段</span>
          </div>

          <div class={styles["task-period-list"]}>
            {currentPeriods.value.map((period, index) => (
              <div key={period.id} class={styles["period-card"]}>
                <div class={styles["card-header"]}>
                  <span class={styles.title}>任务时段 {index + 1}</span>
                  <span class={styles["remove-btn"]} onClick={() => handleRemovePeriod(index)}>
                    移除
                  </span>
                </div>

                <div class={styles["type-toggle"]}>
                  <div
                    class={`${styles["type-item"]} ${period.type === "DRIVE_MOSQUITO" ? styles.active : ""}`}
                    onClick={() => (period.type = "DRIVE_MOSQUITO")}
                  >
                    驱蚊
                  </div>
                  <div
                    class={`${styles["type-item"]} ${period.type === "MIST_SPRAY" ? styles.active : ""}`}
                    onClick={() => (period.type = "MIST_SPRAY")}
                  >
                    雾灌
                  </div>
                </div>

                <div class={styles["time-range"]}>
                  <div class={styles["time-value"]} onClick={() => openTimePicker(period.id, "start", period.startTime)}>
                    {period.startTime}
                  </div>
                  <div class={styles.separator}>-</div>
                  <div class={styles["time-value"]} onClick={() => openTimePicker(period.id, "end", period.endTime)}>
                    {period.endTime}
                  </div>
                  <Icon name="clock-o" class={styles["clock-icon"]} />
                </div>
              </div>
            ))}
            {currentPeriods.value.length === 0 && <div class={styles["empty-tip"]}>暂无时段，请点击上方添加</div>}
          </div>
        </PullRefresh>

        <div class={styles["footer-btn"]}>
          <Button type="primary" block onClick={handleSave} loading={saveLoading.value} disabled={hasOfflineDevice.value}>
            保存
          </Button>
        </div>

        <Popup v-model:show={showTimePicker.value} position="bottom" round>
          <Picker
            title={pickerTitle.value}
            columns={columns}
            modelValue={timePickerValue.value}
            onConfirm={handleTimeConfirm}
            onCancel={() => (showTimePicker.value = false)}
          />
        </Popup>
      </div>
    );
  },
});
