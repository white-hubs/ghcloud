import { AreaListSelect } from "./components/area-list-select";
import { BaseSelectPopup } from "./components/base-select-popup/base-select-popup";
import { DeviceListSelect } from "./components/device-list-select";
import { PropertyListSelect } from "./components/property-list-select";
import { RiskSourceListSelect } from "./components/risk-source-list-select";
import { SitePointListSelect } from "./components/site-point-list-select";
import { SmallEngineeringListSelect } from "./components/small-engineering-list-select";
import { StallListSelect } from "./components/stall-list-select";
import styles from "./object-popup-select.module.less";
import type { AssetType } from "@ghcloud/cube-asset-management-service";
import type { DeviceInstancePage } from "@ghcloud/cube-iot-center-service";
import type { RootObject } from "@ghcloud/cube-maintain-service";
import type { AreaTree, StallPage } from "@ghcloud/cube-mdata-service";
import type { RiskSourceLedgerVO } from "@ghcloud/cube-risk-management-service";
import type { ProjectScheduleListRecord } from "@ghcloud/cube-small-engineering-service";
import { Tabs, Tab } from "vant";
import { defineComponent, ref, watch, reactive } from "vue";

export type ListItemType =
  | DeviceInstancePage
  | StallPage
  | AssetType
  | RootObject
  | RiskSourceLedgerVO
  | ProjectScheduleListRecord
  | AreaTree;

interface Props {
  value: { id?: string | number; name?: string; projectName?: string; type: string }[];
  title?: string;
  multiple?: boolean;
}

export const ObjectPopupSelect = defineComponent({
  props: ["value", "title", "multiple"],
  emits: ["update:value", "select", "ok"],
  setup(props: Props, { emit, expose }) {
    // 弹窗显示控制
    const showPicker = ref(false);
    const openPopup = (): void => {
      showPicker.value = true;
    };

    const activeTab = ref("STALL");
    const tabs = [
      { title: "区域", status: "AREA" },
      { title: "档位", status: "STALL" },
      { title: "资产", status: "PROPERTY" },
      { title: "设备", status: "DEVICE" },
      { title: "现场点", status: "SITE_POINT" },
      { title: "风险源", status: "RISK_SOURCE" },
      { title: "小散工程", status: "SMALL_ENGINEERING" },
    ];
    const areaListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const stallListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const propertyListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const deviceListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const sitePointListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const riskSourceListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();
    const smallEngineeringListSelectRef = ref<{ handleSearch: (keyword: string) => void }>();

    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: "",
    });

    const selectedValue = ref<(string | number)[]>([]);
    const selectedItems = ref<Partial<ListItemType>[]>([]);

    watch(
      () => props.value,
      () => {
        if (props.value && Array.isArray(props.value)) {
          selectedValue.value = props.value?.map((e) => e.id ?? "");
          selectedItems.value = props.value?.map((e) => ({
            id: e.id,
            name: e.name,
            projectName: e.projectName,
          })) as Partial<ListItemType>[];
        }
      },
    );

    const onClickTab = (): void => {
      search.pageNumber = 0;
      search.keyword = "";
    };
    const setActiveTab = (tab: string): void => {
      search.pageNumber = 0;
      search.keyword = "";
      activeTab.value = tab;
    };

    // 搜索
    const handleSearch = (value: string): void => {
      search.keyword = value;
      search.pageNumber = 0;
      switch (activeTab.value) {
        case "AREA":
          areaListSelectRef.value?.handleSearch(value);
          break;
        case "STALL":
          stallListSelectRef.value?.handleSearch(value);
          break;
        case "PROPERTY":
          propertyListSelectRef.value?.handleSearch(value);
          break;
        case "DEVICE":
          deviceListSelectRef.value?.handleSearch(value);
          break;
        case "SITE_POINT":
          sitePointListSelectRef.value?.handleSearch(value);
          break;
        case "RISK_SOURCE":
          riskSourceListSelectRef.value?.handleSearch(value);
          break;
        case "SMALL_ENGINEERING":
          smallEngineeringListSelectRef.value?.handleSearch(value);
          break;
        default:
          break;
      }
    };

    const handleSelect = (result: { ids: string[]; items: ListItemType[] }): void => {
      selectedValue.value = result.ids;
      selectedItems.value = result.items;
      if (props.multiple) {
        emit("update:value", selectedValue.value);
      } else {
        emit("update:value", selectedValue.value[0] || "");
      }
      emit("select", result);
    };

    const handleOk = (result: { ids: string[] }): void => {
      emit("ok", { ids: result.ids, items: selectedItems.value });
      showPicker.value = false;
    };

    const cancel = (): void => {
      selectedValue.value = [];
      selectedItems.value = [];
      if (props.multiple) {
        emit("update:value", []);
      } else {
        emit("update:value", "");
      }
      showPicker.value = false;
    };
    expose({
      openPopup,
      activeTab,
      setActiveTab,
    });

    return (): JSX.Element => (
      <BaseSelectPopup
        v-model:show={showPicker.value}
        title={props.title || "对象选择"}
        multiple={props.multiple}
        onOk={handleOk}
        onCancel={cancel}
        onSearch={handleSearch}
        v-model:value={selectedValue.value}
      >
        {{
          default: () => (
            <div>
              <Tabs v-model:active={activeTab.value} class={styles.tabs} sticky onClickTab={onClickTab}>
                {tabs.map((item) => (
                  <Tab title={item.title} name={item.status} key={item.status}>
                    <div class={styles["tab-content"]}>
                      {activeTab.value === "AREA" && (
                        <AreaListSelect
                          ref={areaListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          multiple={props.multiple}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "STALL" && (
                        <StallListSelect
                          ref={stallListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          multiple={props.multiple}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "PROPERTY" && (
                        <PropertyListSelect
                          ref={propertyListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          multiple={props.multiple}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "DEVICE" && (
                        <DeviceListSelect
                          ref={deviceListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          multiple={props.multiple}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "SITE_POINT" && (
                        <SitePointListSelect
                          ref={sitePointListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "RISK_SOURCE" && (
                        <RiskSourceListSelect
                          ref={riskSourceListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          onSelect={handleSelect}
                        />
                      )}
                      {activeTab.value === "SMALL_ENGINEERING" && (
                        <SmallEngineeringListSelect
                          ref={smallEngineeringListSelectRef}
                          v-model:value={selectedValue.value}
                          v-model:selectedItems={selectedItems.value}
                          onSelect={handleSelect}
                        />
                      )}
                    </div>
                  </Tab>
                ))}
              </Tabs>
            </div>
          ),
          onSearch: () => {
            search.pageNumber = 0;
          },
        }}
      </BaseSelectPopup>
    );
  },
});
