import { TabPane, Tabs } from "ant-design-vue";
import { defineComponent, ref, reactive, watch } from "vue";

import { useCubeModal } from "../../base-components/cube-modal/use-modal";
import { AreaTreeSelectTable } from "../area-tree-select-tabe/area-tree-select-tabe";
import { DeviceSelectTable } from "../device-components/device-select-table/device-select-table";
import { InspectPointSelectTable } from "../inspect-components/inspect-point-select-table/inspect-point-select-table";
import { PatrolPointSelectTable } from "../patrol-components/patrol-point-select-table/patrol-point-select-table";
import { PropertySelectTable } from "../property-components/property-select-table/property-select-table";
import { RiskSelectTable } from "../risk-components/risk-select-table/risk-select-table";
import { SmallEngineeringSelectTable } from "../small-engineering-components/small-engineering-select-table/small-engineering-select-table";
import { StallSelectTable } from "../stall-components/stall-select-table/stall-select-table";

import "./object-select-modal.less";

export enum ObjectType {
  AREA = "AREA",
  DEVICE = "DEVICE",
  PROPERTY = "PROPERTY",
  STALL = "STALL",
  SITE_POINT = "SITE_POINT",
  PATROL_POINT = "PATROL_POINT",
  RISK_SOURCE = "RISK_SOURCE",
  SMALL_ENGINEERING = "SMALL_ENGINEERING",
}

interface SelectOption {
  id: string;
  name: string;
  type: ObjectType;
}

interface Props {
  title: string;
  multiple?: boolean;
  value?: SelectOption[];
  defaultTab?: ObjectType;
  showTabs?: ObjectType[];
}

const OBJECT_TYPE_LIST = Object.values(ObjectType);

/** 按 type 将 value 拆成 Record<ObjectType, SelectOption[]>，用于初始化和 watch 同步 */
function getSelectValuesByType(value: SelectOption[] | undefined): Record<ObjectType, SelectOption[]> {
  const result = {} as Record<ObjectType, SelectOption[]>;
  for (const type of OBJECT_TYPE_LIST) {
    result[type] = value?.filter((v) => v.type === type) ?? [];
  }
  return result;
}

/** Tab 配置：类型 -> 标签 + 表格组件，便于扩展与统一渲染 */
const TAB_CONFIG: {
  type: ObjectType;
  label: string;
  component: typeof DeviceSelectTable | typeof AreaTreeSelectTable;
}[] = [
  { type: ObjectType.AREA, label: "区域", component: AreaTreeSelectTable },
  { type: ObjectType.DEVICE, label: "设备", component: DeviceSelectTable },
  { type: ObjectType.PROPERTY, label: "资产", component: PropertySelectTable },
  { type: ObjectType.STALL, label: "档位", component: StallSelectTable },
  { type: ObjectType.SITE_POINT, label: "现场点", component: InspectPointSelectTable },
  { type: ObjectType.PATROL_POINT, label: "巡更点", component: PatrolPointSelectTable },
  { type: ObjectType.RISK_SOURCE, label: "风险源", component: RiskSelectTable },
  { type: ObjectType.SMALL_ENGINEERING, label: "小散工程", component: SmallEngineeringSelectTable },
];

/** 弹窗内表格 body 固定滚动高度，保证一页约 10 条可见（与区域 Tab 的 scrollY=500 效果一致） */
const MODAL_TABLE_SCROLL_Y = 400;

/** 对象选择弹窗 */
export const ObjectSelectModal = defineComponent({
  props: {
    title: { type: String, required: true },
    multiple: { type: Boolean, default: false },
    value: { type: Array as () => SelectOption[], default: () => [] },
    defaultTab: { type: String as () => ObjectType, default: undefined },
    showTabs: { type: Array as () => ObjectType[], default: undefined },
  },
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const showTabsList = (props.showTabs?.length ? props.showTabs : OBJECT_TYPE_LIST) as ObjectType[];
    const defaultTabValue = props.defaultTab && showTabsList.includes(props.defaultTab) ? props.defaultTab : showTabsList[0];
    const activeKey = ref<ObjectType>(defaultTabValue);
    const selectValues = reactive<Record<ObjectType, SelectOption[]>>(getSelectValuesByType(props.value));

    watch(
      () => props.value,
      (newVal) => {
        const next = getSelectValuesByType(newVal);
        OBJECT_TYPE_LIST.forEach((type) => {
          selectValues[type] = next[type];
        });
        activeKey.value = (newVal?.length ? newVal[0].type : showTabsList[0]) as ObjectType;
      },
      { deep: true },
    );

    const [CubeModal, modalApi] = useCubeModal({
      title: props.title,
      width: "1000px",
      wrapperClass: "object-select-modal-warpper",
      onConfirm: async () => {
        emit("enter", Object.values(selectValues).flat());
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
    });

    expose({ openModal: () => modalApi.open() });

    const handleValueUpdate = (type: ObjectType, newValues: SelectOption[]): void => {
      const withType = newValues.map((v) => ({ ...v, type }));
      if (props.multiple) {
        selectValues[type] = withType;
      } else {
        OBJECT_TYPE_LIST.forEach((t) => {
          selectValues[t] = [];
        });
        selectValues[type] = withType.length ? [withType[0]] : [];
      }
    };

    const defaultSlot = (): JSX.Element => (
      <Tabs
        activeKey={activeKey.value}
        onUpdate:activeKey={(key: ObjectType) => {
          activeKey.value = key;
        }}
      >
        {TAB_CONFIG.filter((c) => showTabsList.includes(c.type)).map(({ type, label, component: Table }) => (
          <TabPane key={type} tab={label} forceRender={showTabsList.includes(type)} disabled={!showTabsList.includes(type)}>
            <Table
              value={selectValues[type]}
              multiple={props.multiple}
              scrollY={MODAL_TABLE_SCROLL_Y}
              onUpdate:value={(v: SelectOption[]) => handleValueUpdate(type, v)}
            />
          </TabPane>
        ))}
      </Tabs>
    );

    return (): JSX.Element => <CubeModal v-slots={{ default: defaultSlot }} />;
  },
});
