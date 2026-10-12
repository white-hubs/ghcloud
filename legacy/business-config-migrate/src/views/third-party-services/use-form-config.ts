import { THIRD_PART_CONFIG } from "./third-part-config";
import { cubeDictionaryService } from "@/api/service";
import type { CascadeDictionaryItem, DictionaryTree } from "@ghcloud/cube-dictionary-service/src/type";
import { message } from "ant-design-vue";
import _ from "lodash";
import { ref, type Ref } from "vue";
interface ClickItem {
  name: string;
  code: string;
  variable: {
    key: string;
    label: string;
    component?: string;
    componentProps?: Record<string, any>;
    require: boolean;
  }[];
}
interface DataSource {
  name: string;
  code: string;
  variable: {
    key: string;
    label: string;
    component?: string;
    componentProps?: Record<string, any>;
    require: boolean;
  }[];
}
interface UseFormConfig {
  formState: Ref<any>;
  clickItem: Ref<ClickItem | undefined>;
  configuration: (item: DictionaryTree) => Promise<CascadeDictionaryItem>;
  handleChange: (data: { key: string; value: unknown; formSourceMap: DataSource[] }) => Promise<unknown>;
}

const formState = ref<any>();
const clickItem = ref<ClickItem | undefined>();
const formStateCache = ref<any>();
const clickItemCache = ref<ClickItem | undefined>();
export const useFormConfig = (): UseFormConfig => {
  const configuration = async (item: DictionaryTree): Promise<CascadeDictionaryItem> => {
    try {
      message.loading("获取配置中...");
      clickItem.value = _.cloneDeep(THIRD_PART_CONFIG).find((e) => e.code === item.code);
      const data = await cubeDictionaryService.getDataDictionaryById({ id: item.id as string });
      //初始化配置项(是否有新增key,有就加上)
      const variable = data.variable ? JSON.parse(data.variable) : {};
      const currentVariable = _.cloneDeep(THIRD_PART_CONFIG).find((x) => x.code === item.code)?.variable ?? [];
      currentVariable.forEach((item) => {
        !Object.keys(variable).includes(item.key) && (variable[item.key] = item.defaultValue ?? undefined);
      });
      // Todo:三方服务处理回显
      formState.value = variable;
      if (item.code === "THIRD_SERVICE::correspond_service") {
        formState.value = { providerCode: variable.providerCode, ...variable.config };
      }
      formStateCache.value = formState.value && { ...formState.value };
      clickItemCache.value = clickItem.value && { ...clickItem.value };
      // 回显
      clickItem.value?.variable.forEach((variableItem) => {
        if (variableItem.componentProps && variableItem.componentProps.defaultFormSourceMap) {
          const itemVariable =
            variableItem.componentProps.defaultFormSourceMap.find((e) => e.code === formState.value[variableItem.key])?.variable ?? [];
          if (clickItem.value) {
            clickItem.value.variable = [...clickItem.value.variable, ...itemVariable];
          }
        }
      });
      message.destroy();
      return Promise.resolve(data);
    } catch (error) {
      return Promise.reject(error);
    }
  };
  const handleChange = async (data: { key: string; value: unknown; formSourceMap: DataSource[] }): Promise<unknown> => {
    try {
      const config = data.formSourceMap.find((e) => e.code === data.value)?.variable ?? [];
      formState.value = formStateCache.value && { ...formStateCache.value };
      clickItem.value = clickItemCache.value && { ...clickItemCache.value };
      formState.value[data.key] = data.value;
      if (data.value) {
        if (formState.value) {
          config.forEach((item) => {
            formState.value[item.key] = undefined;
          });
        }
        if (clickItem.value) {
          clickItem.value.variable = [...clickItem.value.variable, ...config];
        }
      }
      return Promise.resolve(formState.value);
    } catch (error) {
      return Promise.reject(error);
    }
  };
  return {
    formState,
    clickItem,
    configuration,
    handleChange,
  };
};
