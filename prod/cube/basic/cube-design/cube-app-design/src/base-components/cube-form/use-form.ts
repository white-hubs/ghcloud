import dayjs from "dayjs";
import { nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { getQueryCacheValue, removeQueryCache, writeQueryCache, type QueryCacheValue } from "../../utils/url-query-cache";
import { FormApi } from "./form-api";
import { createFormComponent } from "./form-ui";
import type { FormApiOptions, FormValueChangeMeta, SchemaProp } from "./form.type";

const getCacheFields = (options: FormApiOptions): string[] => {
  return options.cacheFields ?? options.schema.map((item) => item.fieldName).filter(Boolean);
};

// 从 schema 上拿组件名，用来区分日期范围和普通数组字段。
const getSchemaComponentName = (schema: SchemaProp): string => {
  if (typeof schema.component === "string") {
    return schema.component;
  }
  const component = schema.component as { name?: string; displayName?: string; __name?: string };
  return component.name ?? component.displayName ?? component.__name ?? "";
};

// 只处理未开启 showTime 的日期范围，避免影响用户真实选择时分秒的场景。
const isDateRangeSchema = (schema?: SchemaProp): schema is SchemaProp => {
  if (!schema) {
    return false;
  }
  const componentName = getSchemaComponentName(schema);
  if (!["RangePicker", "DateRangePicker"].includes(componentName)) {
    return false;
  }
  const componentProps = schema.componentProps as Record<string, unknown> | undefined;
  const showTime = componentProps?.showTime ?? componentProps?.["show-time"];
  if (showTime) {
    return false;
  }
  const picker = componentProps?.picker;
  return picker === undefined || picker === "date";
};

// 业务 handleSubmit 拿到数据前，把日期范围统一成自然日边界。
const normalizeDateRangeBoundaries = (value: unknown): [string, string] | undefined => {
  if (!Array.isArray(value) || value.length < 2) {
    return undefined;
  }
  const [start, end] = value;
  if (start === undefined || start === null || start === "" || end === undefined || end === null || end === "") {
    return undefined;
  }
  const startDate = dayjs(start as string);
  const endDate = dayjs(end as string);
  if (!startDate.isValid() || !endDate.isValid()) {
    return undefined;
  }
  return [startDate.format("YYYY-MM-DD") + " 00:00:00", endDate.format("YYYY-MM-DD") + " 23:59:59"];
};

// 只归一化传给业务 handleSubmit 的 data，不改表单内部值和 URL/cache 回填逻辑。
const normalizeSubmitValues = (values: Record<string, unknown>, schemas: SchemaProp[]): Record<string, unknown> => {
  let normalizedValues: Record<string, unknown> | undefined;
  schemas.forEach((schema) => {
    if (!isDateRangeSchema(schema) || !Object.prototype.hasOwnProperty.call(values, schema.fieldName)) {
      return;
    }
    const boundaries = normalizeDateRangeBoundaries(values[schema.fieldName]);
    if (!boundaries) {
      return;
    }
    normalizedValues = normalizedValues ?? { ...values };
    normalizedValues[schema.fieldName] = boundaries;
  });
  return normalizedValues ?? values;
};

const resolveOptionValue = (schema: SchemaProp, raw: string): unknown => {
  const options = (schema.componentProps as { options?: Array<{ value: unknown }> } | undefined)?.options;
  const matched = options?.find((item) => String(item.value) === raw);
  if (matched) {
    return matched.value;
  }
  if (typeof schema.defaultValue === "number") {
    const value = Number(raw);
    return Number.isFinite(value) ? value : raw;
  }
  if (typeof schema.defaultValue === "boolean") {
    return raw === "true";
  }
  if (raw.includes(",")) {
    return raw.split(",");
  }
  return raw;
};

const hydrateFormValues = (
  formApi: FormApi,
  options: FormApiOptions,
  fields: string[],
  route: ReturnType<typeof useRoute>,
): { hydrated: boolean; values: Record<string, unknown> } => {
  const values = fields.reduce<Record<string, unknown>>((result, field) => {
    const raw = getQueryCacheValue(field, route);
    const schema = formApi.state.schema.find((item) => item.fieldName === field) ?? options.schema.find((item) => item.fieldName === field);
    if (raw !== undefined && schema) {
      result[field] = resolveOptionValue(schema, raw);
    }
    return result;
  }, {});
  formApi.setFormValues(values);
  return {
    hydrated: Object.keys(values).length > 0,
    values,
  };
};

const pickFormValues = (values: Record<string, unknown>, fields: string[]): Record<string, unknown> => {
  return fields.reduce<Record<string, unknown>>((result, field) => {
    result[field] = values[field];
    return result;
  }, {});
};

const pickChangedValues = (values: Record<string, unknown>, fields: string[]): Record<string, QueryCacheValue> => {
  return fields.reduce<Record<string, QueryCacheValue>>((result, field) => {
    if (Object.prototype.hasOwnProperty.call(values, field)) {
      result[field] = values[field] as QueryCacheValue;
    }
    return result;
  }, {});
};

export const useCubeForm = (options: FormApiOptions): [typeof CubeForm, FormApi] => {
  const cache = options.cache ?? true;
  const cacheOnChange = options.cacheOnChange ?? true;
  const cacheFields = getCacheFields(options);
  const hasStaticCacheFields = Array.isArray(options.cacheFields) && options.cacheFields.length > 0;
  const autoQueryPageNumberField = options.autoQueryPageNumberField ?? "pageNumber";
  const autoQueryPageSizeField = options.autoQueryPageSizeField ?? "pageSize";
  const autoQueryDefaultPageNumber = options.autoQueryDefaultPageNumber ?? 1;
  const queryState = options.queryState;
  const queryStateFields = options.queryStateFields ?? getCacheFields(options);
  const mapFormValuesToQueryState =
    options.mapFormValuesToQueryState ?? ((values: Record<string, unknown>) => pickFormValues(values, queryStateFields));
  const mapQueryStateToFormValues =
    options.mapQueryStateToFormValues ?? ((state: Record<string, unknown>) => pickFormValues(state, queryStateFields));
  const syncStateRef = options.syncStateRef;
  const syncStateFields = options.syncStateFields ?? cacheFields;
  const syncMap = options.syncMap ?? ((values: Record<string, unknown>) => pickFormValues(values, syncStateFields));
  const autoQueryDefaultPageSize = options.autoQueryDefaultPageSize ?? 10;
  const route = useRoute();
  const router = useRouter();
  let hydratedQueryQueued = false;
  let hydratedQueryHandled = false;
  let isResetting = false;
  const requestHydratedQuery = (): void => {
    if (!options.onHydratedQuery || hydratedQueryQueued || hydratedQueryHandled) {
      return;
    }
    hydratedQueryQueued = true;
    void nextTick(() => {
      hydratedQueryQueued = false;
      if (hydratedQueryHandled) {
        return;
      }
      hydratedQueryHandled = true;
      options.onHydratedQuery?.();
    });
  };
  const resolveRuntimeCacheFields = (): string[] => {
    if (hasStaticCacheFields) {
      return cacheFields;
    }
    const fields = formApi.state.schema.map((item) => item.fieldName).filter(Boolean);
    return fields.length > 0 ? fields : cacheFields;
  };
  const resolveRuntimeSchemas = (): SchemaProp[] => {
    return formApi.state.schema.length > 0 ? formApi.state.schema : options.schema;
  };
  const syncToState = (source: Record<string, unknown> = formApi.formValues): void => {
    if (!syncStateRef) {
      return;
    }
    Object.assign(syncStateRef, syncMap(source));
  };
  const patchState = (source: Record<string, unknown>): void => {
    if (!syncStateRef) {
      return;
    }
    Object.assign(syncStateRef, source);
  };
  const shouldTriggerAutoQuery = (meta?: FormValueChangeMeta): boolean => {
    if (!meta) {
      return false;
    }
    if (meta.hasCustomOnChange) {
      return false;
    }
    const isInputComponent = meta.component === "Input";
    if (isInputComponent) {
      return meta.trigger === "enter";
    }
    return meta.trigger === "change";
  };
  const shouldResetPageOnControlAction = (meta?: FormValueChangeMeta): boolean => {
    if (!meta) {
      return false;
    }
    const isInputComponent = meta.component === "Input";
    if (isInputComponent) {
      return meta.trigger === "enter";
    }
    return meta.trigger === "change";
  };
  const resetAutoQueryPage = (): void => {
    formApi.formValues[autoQueryPageNumberField] = autoQueryDefaultPageNumber;
    formApi.formValues[autoQueryPageSizeField] = autoQueryDefaultPageSize;
    if (syncStateRef) {
      syncStateRef[autoQueryPageNumberField] = autoQueryDefaultPageNumber;
      syncStateRef[autoQueryPageSizeField] = autoQueryDefaultPageSize;
    }
    if (queryState) {
      queryState.resetPage();
    }
  };
  let formApi: FormApi;
  const formOptions: FormApiOptions = {
    ...options,
    handleSubmit: (values) => {
      const submitValues = normalizeSubmitValues(values, resolveRuntimeSchemas());
      syncToState();
      if (queryState) {
        queryState.update(mapFormValuesToQueryState(values));
        queryState.resetPage();
        queryState.writeCache();
      }
      options.handleSubmit(submitValues);
      if (cache && !queryState) {
        const runtimeCacheFields = resolveRuntimeCacheFields();
        writeQueryCache(
          {
            ...pickFormValues(submitValues, runtimeCacheFields),
            pageNumber: 1,
          },
          router,
          route,
        );
      }
    },
    handleReset: () => {
      isResetting = true;
      syncToState();
      if (queryState) {
        queryState.update(mapFormValuesToQueryState(formApi.formValues));
        queryState.resetPage();
        queryState.clearCache();
      }
      options.handleReset?.();
      if (cache && !queryState) {
        const runtimeCacheFields = resolveRuntimeCacheFields();
        removeQueryCache(runtimeCacheFields, { pageNumber: 1 }, router, route);
      }
      void nextTick(() => {
        isResetting = false;
      });
    },
    handleValuesChange: (values, changedValues, meta) => {
      if (isResetting) {
        return;
      }
      const source = changedValues && Object.keys(changedValues).length > 0 ? changedValues : values;
      if (!meta?.hasCustomOnChange) {
        patchState(source);
      }
      const shouldAutoQuery = shouldTriggerAutoQuery(meta);
      const shouldResetPage = shouldResetPageOnControlAction(meta);
      if (shouldResetPage) {
        resetAutoQueryPage();
      }
      options.handleValuesChange?.(values, changedValues, meta);
      if (shouldResetPage && queryState) {
        queryState.update(mapFormValuesToQueryState(formApi.formValues));
        queryState.resetPage();
        queryState.writeCache();
      }
      if (cache && cacheOnChange && !queryState) {
        const runtimeCacheFields = resolveRuntimeCacheFields();
        const cachePayload = pickChangedValues(normalizeSubmitValues(source, resolveRuntimeSchemas()), runtimeCacheFields);
        if (shouldResetPage) {
          cachePayload[autoQueryPageNumberField] = autoQueryDefaultPageNumber;
          cachePayload[autoQueryPageSizeField] = autoQueryDefaultPageSize;
        }
        writeQueryCache(cachePayload, router, route);
      }
      if (shouldAutoQuery) {
        options.handleSubmit(normalizeSubmitValues(formApi.formValues, resolveRuntimeSchemas()));
      }
    },
  };
  formApi = new FormApi(formOptions); // 数据管理实例化对象
  let hydrated = false;
  let hydratedValues: Record<string, unknown> = {};
  let hasHydratedByCache = false;
  if (queryState) {
    formApi.setFormValues(mapQueryStateToFormValues(queryState.getSnapshot()));
    hydrated = true;
  } else if (cache) {
    const hydrateResult = hydrateFormValues(formApi, options, cacheFields, route);
    hydrated = hydrateResult.hydrated;
    hydratedValues = hydrateResult.values;
    hasHydratedByCache = hydrateResult.hydrated;
  }
  if (hydrated) {
    syncToState(hydratedValues);
    requestHydratedQuery();
  }
  if (cache && !queryState && !hasStaticCacheFields) {
    watch(
      () => formApi.state.schema.map((item) => item.fieldName).join(","),
      () => {
        if (hasHydratedByCache) {
          return;
        }
        const runtimeCacheFields = resolveRuntimeCacheFields();
        if (runtimeCacheFields.length === 0) {
          return;
        }
        const hydrateResult = hydrateFormValues(formApi, options, runtimeCacheFields, route);
        if (!hydrateResult.hydrated) {
          return;
        }
        hasHydratedByCache = true;
        syncToState(hydrateResult.values);
        requestHydratedQuery();
      },
      { immediate: true },
    );
  }
  const CubeForm = createFormComponent(formApi); // 组件实例
  return [CubeForm, formApi];
};
