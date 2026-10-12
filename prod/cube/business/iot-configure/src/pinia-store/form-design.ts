import type { DataType, FormItem } from "@/views/form-design/core/widget";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface LegacyFormItem {
  defaultLable: string;
  defaultProps: string;
  defaultValue: unknown;
  defaultOptions: { idx: number; label: string; condition: Record<string, unknown> }[];
  required: boolean;
  componentName: string;
  key: string;
  code: string;
  dataType: DataType;
}

export const useFormDesignStore = defineStore("storeFormDesign", {
  state: () => {
    const formDesign = ref<{
      formList: (FormItem & { key: string })[];
      onDrag: boolean;
      formItemSelect: FormItem | undefined;
    }>({
      formList: [],
      onDrag: false,
      formItemSelect: undefined,
    });

    const formRules = computed(() => {
      const res: Record<string, { required: boolean; message: string }[]> = {};
      formDesign.value.formList.forEach((item) => {
        if (item.props.required) {
          res[item.key] = [{ required: true, message: "必填" }];
        }
      });
      return res;
    });

    // 清空表单列表
    function clearFormList(): void {
      formDesign.value.formList = [];
      formDesign.value.formItemSelect = undefined;
    }
    // 转JSON
    function toJson(): string {
      const res: LegacyFormItem[] = [];
      formDesign.value.formList.forEach((item) => {
        res.push({
          defaultLable: item.label,
          defaultProps: item.props.placeholder as string,
          defaultValue: item.props.value as unknown,
          defaultOptions: ((item.props.options || []) as { label: string; value: string; condition: Record<string, unknown> }[]).map(
            (item, index) => ({ idx: index + 1, label: item.label, condition: item.condition }),
          ),
          required: item.props.required as boolean,
          componentName: item.name,
          key: item.key ?? "",
          code: item.props.code as string,
          dataType: item.props.dataType as DataType,
          // @ts-expect-error
          condition: item.condition,
        });
      });
      return JSON.stringify(res);
    }

    function fromJson(json: string): void {
      const res: LegacyFormItem[] = JSON.parse(json);
      const formList: (FormItem & { key: string })[] = [];
      res.forEach((item) => {
        formList.push({
          name: item.componentName,
          label: item.defaultLable,
          key: item.key,
          props: {
            value: (item.defaultValue || undefined) as undefined,
            placeholder: item.defaultProps,
            options: (item.defaultOptions ?? []).map((item) => ({ label: item.label, value: item.idx, condition: item.condition })),
            required: item.required ?? false,
            code: item.code,
            dataType: item.dataType,
          },
          // @ts-expect-error
          condition: item.condition ?? { type: "ALWAYS" },
        });
      });
      formDesign.value.formList = formList;
    }

    return {
      formDesign,
      formRules,
      clearFormList,
      toJson,
      fromJson,
    };
  },
  persist: true,
});
