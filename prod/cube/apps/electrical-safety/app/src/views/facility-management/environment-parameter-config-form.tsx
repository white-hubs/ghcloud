import { defineComponent } from "vue";
import type { PropType } from "vue";

import type {
  DictionaryItem,
  EnvironmentAvailableProperty,
  EnvironmentParameterMappingSaveItem,
} from "@ghcloud/cube-service-interface/electrical-safety";
import { Button, Select } from "@ghcloud/cube-ui";

export const EnvironmentParameterConfigForm = defineComponent({
  name: "EnvironmentParameterConfigForm",
  props: {
    availableProperties: { type: Array as PropType<EnvironmentAvailableProperty[]>, required: true },
    parameterTypes: { type: Array as PropType<DictionaryItem[]>, required: true },
    items: { type: Array as PropType<EnvironmentParameterMappingSaveItem[]>, required: true },
  },
  emits: {
    add: (): boolean => true,
    remove: (_index: number): boolean => true,
    updateItem: (_index: number, _item: Partial<EnvironmentParameterMappingSaveItem>): boolean => true,
  },
  setup: (props, { emit }) => {
    const propertyOptions = (): Array<{ label: string; value: string }> =>
      props.availableProperties.map((item) => ({
        label: item.unit ? `${item.propertyName} (${item.unit})` : item.propertyName,
        value: item.propertyCode,
      }));
    const parameterTypeOptions = (): Array<{ label: string; value: string }> =>
      props.parameterTypes.map((item) => ({ label: item.name, value: item.code }));

    return (): JSX.Element => (
      <div class="environment-parameter-config-form">
        <div class="environment-parameter-config-toolbar">
          <span>将设备物模型属性映射为环境监测参数类型。</span>
          <Button
            type="primary"
            size="small"
            disabled={!props.availableProperties.length || !props.parameterTypes.length}
            onClick={() => emit("add")}
          >
            添加参数
          </Button>
        </div>
        <div class="environment-parameter-mapping-table-wrapper">
          <table class="environment-parameter-mapping-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>物模型属性</th>
                <th>环境参数类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {props.items.length ? (
                props.items.map((item, index) => (
                  <tr key={`${item.propertyCode}-${item.parameterTypeCode}-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      <Select
                        value={item.propertyCode}
                        options={propertyOptions()}
                        placeholder="请选择物模型属性"
                        onUpdate:value={(value: string | undefined) => emit("updateItem", index, { propertyCode: value ?? "" })}
                      />
                    </td>
                    <td>
                      <Select
                        value={item.parameterTypeCode}
                        options={parameterTypeOptions()}
                        placeholder="请选择环境参数类型"
                        onUpdate:value={(value: string | undefined) => emit("updateItem", index, { parameterTypeCode: value ?? "" })}
                      />
                    </td>
                    <td>
                      <Button type="link" size="small" danger onClick={() => emit("remove", index)}>
                        删除
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan={4}>暂无参数映射，可点击“添加参数”进行配置</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
});
