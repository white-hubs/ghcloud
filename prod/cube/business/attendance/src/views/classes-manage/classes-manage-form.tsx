import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute } from "vue-router";

import { Button, message } from "@ghcloud/cube-ui";
import type { FormExpose, RuleObject } from "@ghcloud/cube-ui/src/components/form/form";
import { DynamicFormRender } from "@ghcloud/dynamic-form-render";
import type { DynamicFormRenderOptionProps } from "@ghcloud/dynamic-form-render/src/dynamic-form-render-props";
import { DeptTreeSelect } from "@ghcloud/generic-component";

import { classesInsert, classesUpdate, type Classes, classesDetail } from "@/api/classes-manage";
import { ClassesTypeSelect } from "@/components/business/classes-type-select/classes-type-select";
import { ClockInTime } from "@/components/business/clock-in-time/clock-in-time";
import { RestTimeRange } from "@/components/business/rest-time-range/rest-time-range";
import { Layout } from "@/components/layout/layout";
import { logger } from "@/logger";

import "./classes-manage-form.less";

interface WorkTime {
  workTime: string;
  afterTime: string;
  beforeTime: string;
}
export const ClassesManageForm = defineComponent({
  setup: () => {
    const { action, id } = useRoute().query;
    const goBack = (): void => {
      history.back();
    };

    /** 标题 */
    const title = computed(() => {
      let res = "班次";
      if (action === "add") {
        res += " / 新增";
      } else if (action === "edit") {
        res += " / 编辑";
      } else {
        res += " / 详情";
      }
      return res;
    });

    /** 表单实例 */
    const dynamicFormRenderRef = ref<{ formRef: FormExpose }>();
    const options = computed(() => {
      const showNextDay = (): boolean => {
        if (!formData.value.endWorkTimeTemp.workTime || !formData.value.startWorkTimeTemp.workTime) {
          return false;
        }
        formData.value.endTimeIsMorrow = dayjs("2023-09-1 " + formData.value.endWorkTimeTemp.workTime).isBefore(
          dayjs("2023-09-1 " + formData.value.startWorkTimeTemp.workTime),
        );
        return formData.value.endTimeIsMorrow;
      };
      const itemWidth = 40;
      const res: DynamicFormRenderOptionProps[] = [
        { title: "班次名称", key: "name", width: itemWidth, componentName: "TextInput", required: true },
        {
          title: "班次简称",
          key: "nickName",
          width: itemWidth,
          componentName: "TextInput",
          required: true,
          componentProps: { maxlength: 4 },
        },
        {
          title: "建议应用范围",
          key: "deptIds",
          width: itemWidth,
          customComponent: DeptTreeSelect,
          componentProps: { cheakable: true, getPopupContainer: () => document.querySelector(".attendance-layout-content") },
        },
        {
          title: "班次类型",
          key: "classesType",
          width: itemWidth,
          customComponent: ClassesTypeSelect,
          required: true,
          componentProps: { getPopupContainer: () => document.querySelector(".attendance-layout-content") },
        },
        {
          title: "上班时间",
          key: "startWorkTimeTemp",
          width: itemWidth,
          required: true,
          customComponent: ClockInTime,
          customClass: "block",
          componentProps: { firstText: "上班打卡范围", editable: true },
        },
        {
          title: "下班时间",
          key: "endWorkTimeTemp",
          width: itemWidth,
          required: true,
          customComponent: ClockInTime,
          customClass: "block",
          componentProps: { firstText: "下班打卡范围", showNextDay: showNextDay() },
        },
        { title: "休息时间", key: "restRange", width: itemWidth, customComponent: RestTimeRange, customClass: "block" },
      ];

      if (action === "detail") {
        res.forEach((e) => {
          e.readonly = true;
        });
      }
      return res;
    });

    const formData = ref<Classes & { restRange: [string, string]; startWorkTimeTemp: WorkTime; endWorkTimeTemp: WorkTime }>({
      name: "",
      nickName: "",
      classesType: undefined,
      deptIds: [],
      startWorkTime: "",
      startClockAfterTime: "",
      startClockBeforeTime: "",
      endWorkTime: "",
      endClockAfterTime: "",
      endClockBeforeTime: "",
      restStartTime: "",
      restEndTime: "",
      restRange: ["", ""],
      endTimeIsMorrow: false,
      startWorkTimeTemp: {
        workTime: "",
        afterTime: "",
        beforeTime: "",
      },
      endWorkTimeTemp: {
        workTime: "",
        afterTime: "",
        beforeTime: "",
      },
    });

    const checkName = async (): Promise<void> => {
      if (!formData.value.name.trim()) {
        return Promise.reject(new Error("请填写班次名称"));
      }
      if (!/^[\u4e00-\u9fa5\w\d]+$/.test(formData.value.name)) {
        return Promise.reject(new Error("仅支持包含中英文字符及数字"));
      }
      return Promise.resolve();
    };
    const checkNickname = async (): Promise<void> => {
      if (!formData.value.nickName.trim()) {
        return Promise.reject(new Error("请填写班次简称"));
      }
      if (!/^[\u4e00-\u9fa5\w\d]+$/.test(formData.value.nickName)) {
        return Promise.reject(new Error("仅支持包含中英文字符及数字"));
      }
      return Promise.resolve();
    };
    const checkWorkTime = async (rule: unknown, value: WorkTime): Promise<void> => {
      if (!value.afterTime || !value.beforeTime || !value.beforeTime) {
        return Promise.reject(new Error("请检查未填写项目"));
      }
      return Promise.resolve();
    };
    const customValidatesRules = {
      name: { required: true, trigger: "change", validator: checkName } satisfies RuleObject,
      nickName: { required: true, trigger: "change", validator: checkNickname } satisfies RuleObject,
      startWorkTimeTemp: { required: true, trigger: "change", validator: checkWorkTime } satisfies RuleObject,
      endWorkTimeTemp: { required: true, trigger: "change", validator: checkWorkTime } satisfies RuleObject,
    };

    // 保存
    const saveLoading = ref(false);
    const save = async (): Promise<void> => {
      dynamicFormRenderRef.value?.formRef.clearValidate();
      await dynamicFormRenderRef.value?.formRef.validate();
      try {
        saveLoading.value = true;
        const params: Classes = {
          name: formData.value.name,
          nickName: formData.value.nickName,
          classesType: formData.value.classesType,
          deptIds: formData.value.deptIds ? (formData.value.deptIds as string[]).join(",") : "",
          restStartTime: formData.value.restRange ? formData.value.restRange[0] : "",
          restEndTime: formData.value.restRange ? formData.value.restRange[1] : "",
          endTimeIsMorrow: formData.value.endTimeIsMorrow,
          startWorkTime: formData.value.startWorkTimeTemp.workTime,
          startClockAfterTime: formData.value.startWorkTimeTemp.afterTime,
          startClockBeforeTime: formData.value.startWorkTimeTemp.beforeTime,
          endWorkTime: formData.value.endWorkTimeTemp.workTime,
          endClockAfterTime: formData.value.endWorkTimeTemp.afterTime,
          endClockBeforeTime: formData.value.endWorkTimeTemp.beforeTime,
        };
        if (action === "add") {
          await classesInsert(params);
        } else {
          await classesUpdate({ ...params, id: id as string });
        }

        message.success("操作成功");
        history.back();
      } catch (error) {
        logger.error(error);
      } finally {
        setTimeout(() => {
          saveLoading.value = false;
        }, 1000);
      }
    };

    const init = ref(false);
    onMounted(async () => {
      if (action !== "add") {
        if (id) {
          const res = await classesDetail({ id: id as string });
          if (res.data) {
            formData.value.name = res.data.name;
            formData.value.nickName = res.data.nickName;
            formData.value.classesType = res.data.classesType;
            formData.value.deptIds = res.data.deptIds === "0" ? [] : (res.data.deptIds as string).split(",");
            formData.value.startWorkTimeTemp = {
              workTime: res.data.startWorkTime,
              beforeTime: res.data.startClockBeforeTime,
              afterTime: res.data.startClockAfterTime,
            };
            formData.value.endWorkTimeTemp = {
              workTime: res.data.endWorkTime,
              beforeTime: res.data.endClockBeforeTime,
              afterTime: res.data.endClockAfterTime,
            };
            formData.value.restRange = [res.data.restStartTime ?? "", res.data.restEndTime ?? ""];
          }
        }
      }
      setTimeout(() => {
        init.value = true;
      }, 0);
    });

    const layoutSlots = {
      "layout-content": (): VNode | undefined => {
        if (!init.value) {
          return;
        }
        return (
          <>
            <div class="classes-manage-form">
              <DynamicFormRender
                formOptions={options.value}
                customValidatesRules={customValidatesRules}
                labelWidth="150px"
                v-model:formData={formData.value}
                ref={dynamicFormRenderRef}
                style={{ margin: "20px" }}
              />
            </div>
          </>
        );
      },
      "footer-page": (): VNode => {
        return (
          <>
            <Button onClick={goBack}>返回</Button>
            {action !== "detail" && (
              <Button type="primary" style={{ marginLeft: "10px" }} loading={saveLoading.value} onClick={save}>
                保存
              </Button>
            )}
          </>
        );
      },
    };
    return (): VNode => <Layout title={title.value} v-slots={layoutSlots} />;
  },
});
