import { computed, defineComponent, nextTick, reactive, ref, watch, type Component, type PropType } from "vue";
import { useRoute, useRouter } from "vue-router";

import { InspectItemTable, InspectStandardTable, ObjectType, useCubeModal } from "@ghcloud/cube-app-design";
import { AreaTreeSelectTable } from "@ghcloud/cube-app-design/src/business-components/area-tree-select-tabe/area-tree-select-tabe";
import { DeviceSelectTable } from "@ghcloud/cube-app-design/src/business-components/device-components/device-select-table/device-select-table";
import { InspectPointSelectTable } from "@ghcloud/cube-app-design/src/business-components/inspect-components/inspect-point-select-table/inspect-point-select-table";
import { PropertySelectTable } from "@ghcloud/cube-app-design/src/business-components/property-components/property-select-table/property-select-table";
import { RiskSelectTable } from "@ghcloud/cube-app-design/src/business-components/risk-components/risk-select-table/risk-select-table";
import { SmallEngineeringSelectTable } from "@ghcloud/cube-app-design/src/business-components/small-engineering-components/small-engineering-select-table/small-engineering-select-table";
import { StallSelectTable } from "@ghcloud/cube-app-design/src/business-components/stall-components/stall-select-table/stall-select-table";
import { InspectBusinessType, type StandardItemType, type StandardVOS } from "@ghcloud/cube-daily-inspection-service";
import { AntModal, Button, Input, PopConfirm, PopOver, Space, Table, TabPane, Tabs, message } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "@/api/server";
import type { DataSourceType, StandardItemsVo, StandardVo } from "@/types/inspect";
import {
  getSmartTargetCategoryLabel,
  smartInspectCommonTargetTypeOptions,
  type SmartInspectCommonTargetCategory,
  type SmartInspectTargetTypeOption,
} from "@/views/smart-inspect-common/types";

import styles from "./smart-inspect-content-table.module.less";

const TARGET_CATEGORY_TO_OBJECT_TYPE: Record<SmartInspectCommonTargetCategory, ObjectType> = {
  AREA: ObjectType.AREA,
  DEVICE: ObjectType.DEVICE,
  PROPERTY: ObjectType.PROPERTY,
  STALL: ObjectType.STALL,
  SITE_POINT: ObjectType.SITE_POINT,
  RISK_SOURCE: ObjectType.RISK_SOURCE,
  SMALL_ENGINEERING: ObjectType.SMALL_ENGINEERING,
};
const COORDINATE_FIELDS = ["latAndLon", "lntAndLat", "lngAndlat", "lngAndLat", "coordinate", "locationCoordinate"] as const;
const SELECT_MODAL_TABLE_SCROLL_Y = 400;
const SELECT_TABLE_COMPONENTS: Record<ObjectType, Component> = {
  [ObjectType.AREA]: AreaTreeSelectTable,
  [ObjectType.DEVICE]: DeviceSelectTable,
  [ObjectType.PROPERTY]: PropertySelectTable,
  [ObjectType.STALL]: StallSelectTable,
  [ObjectType.SITE_POINT]: InspectPointSelectTable,
  [ObjectType.PATROL_POINT]: InspectPointSelectTable,
  [ObjectType.RISK_SOURCE]: RiskSelectTable,
  [ObjectType.SMALL_ENGINEERING]: SmallEngineeringSelectTable,
};

type ObjectSelectValue = Record<string, unknown> & {
  id: string;
  name: string;
  type: string;
};

type CommonTargetTypeOption = Omit<SmartInspectTargetTypeOption, "value"> & {
  value: SmartInspectCommonTargetCategory;
};

type GroupPageState = {
  current: number;
  pageSize: number;
};

const getCoordinateFromRecord = (targetItem: Record<string, unknown>): string => {
  for (const field of COORDINATE_FIELDS) {
    if (targetItem[field]) return String(targetItem[field]);
  }
  const longitude = targetItem.longitude ?? targetItem.lng;
  const latitude = targetItem.latitude ?? targetItem.lat;
  if (longitude !== undefined && longitude !== null && latitude !== undefined && latitude !== null) {
    return `${String(longitude)},${String(latitude)}`;
  }
  return "";
};

const getRecordCoordinate = (targetItem: Record<string, unknown>): string => {
  const coordinate = getCoordinateFromRecord(targetItem);
  if (coordinate) return coordinate;

  const stallExpand = targetItem.stallExpand;
  if (stallExpand && typeof stallExpand === "object") {
    return getCoordinateFromRecord(stallExpand as Record<string, unknown>);
  }
  return "";
};

const getTargetCoordinate = (targetItem: DataSourceType): string => getRecordCoordinate(targetItem as unknown as Record<string, unknown>);

const cloneStandards = (standards: StandardVo[] = []): StandardVo[] => {
  return standards.map((item) => ({
    ...item,
    standardItems: item.standardItems.map((standardItem) => ({ ...standardItem })),
  }));
};

const normalizeStandardRows = (rows: StandardVo[]): StandardVo[] => {
  const standardRows: StandardVo[] = [];
  rows.forEach((row) => {
    if (row?.id && !standardRows.some((item) => item.id === row.id)) {
      standardRows.push({
        ...row,
        standardItems: row.standardItems.map((item) => ({
          ...item,
          isRawItem: 1,
        })),
      });
    }
  });
  return standardRows;
};

export const SmartInspectContentTable = defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<DataSourceType[]>,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    targetCategories: {
      type: Array as PropType<SmartInspectCommonTargetCategory[]>,
      default: () => [],
    },
  },
  setup: (props, { expose }) => {
    const route = useRoute();
    const router = useRouter();
    const state = reactive<{
      groupKeywords: Partial<Record<SmartInspectCommonTargetCategory, string>>;
      groupPages: Partial<Record<SmartInspectCommonTargetCategory, GroupPageState>>;
    }>({
      groupKeywords: {},
      groupPages: {},
    });
    const initDataSource = ref<DataSourceType[]>([]);
    const selectedTargetIdsMap = reactive<Partial<Record<SmartInspectCommonTargetCategory, string[]>>>({});
    const rowTargetIds = ref<string[]>([]);
    const objectSelected = ref<{ id: string; name: string; type?: string }[]>([]);
    const activeObjectCategory = ref<SmartInspectCommonTargetCategory>();
    const activeObjectType = ref<ObjectType>();
    const objectModalKey = ref(0);
    const standardTableRef = ref<{
      getStandardSelectedRows: () => StandardVOS[];
      setStandardSelectedRows: (rows: StandardVOS[]) => void;
    }>();
    const inspectItemTableRef = ref<{
      getInspectItemSelectedRows: () => StandardItemType[];
      setInspectItemSelectedRows: (rows: StandardItemType[]) => void;
    }>();

    const availableTargetCategoryOptions = computed((): CommonTargetTypeOption[] => {
      return (
        props.targetCategories.length
          ? smartInspectCommonTargetTypeOptions.filter((item) => props.targetCategories.includes(item.value))
          : smartInspectCommonTargetTypeOptions
      ) as CommonTargetTypeOption[];
    });

    const columns = computed(() => {
      const baseColumns = [
        {
          title: "巡检对象",
          dataIndex: "targetName",
          key: "targetName",
          customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
        },
        {
          title: "巡检内容",
          dataIndex: "content",
          key: "content",
          ellipsis: true,
          customRender: ({ record }: { record: DataSourceType }): JSX.Element | string => {
            if (!record.standardDTOList?.length) return "--";
            const text = record.standardDTOList
              .map((item) => item.name)
              .filter(Boolean)
              .join(",");
            return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
          },
        },
      ];

      if (props.readonly) return baseColumns;

      return [
        ...baseColumns,
        {
          title: "操作",
          dataIndex: "action",
          key: "action",
          width: 180,
          fixed: "right",
          customRender: ({ record }: { record: DataSourceType }): JSX.Element => (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  rowTargetIds.value = [record.targetId];
                  inspectContentModalApi.open();
                  nextTick(() => {
                    standardTableRef.value?.setStandardSelectedRows(cloneStandards(record.standardDTOList) as unknown as StandardVOS[]);
                    const standard = record.standardDTOList.find((item) => item.standardItems.length);
                    if (standard) {
                      inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
                    }
                  });
                }}
              >
                配置巡检内容
              </Button>
              <PopConfirm title="确认删除该对象？" onConfirm={() => removeTargets([record.targetId])}>
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          ),
        },
      ];
    });

    const setTableData = (rows: DataSourceType[]): void => {
      initDataSource.value = rows;
      const validTargetIds = new Set(rows.map((item) => item.targetId));
      Object.keys(selectedTargetIdsMap).forEach((category) => {
        selectedTargetIdsMap[category as SmartInspectCommonTargetCategory] = (
          selectedTargetIdsMap[category as SmartInspectCommonTargetCategory] || []
        ).filter((targetId) => validTargetIds.has(targetId));
      });
    };

    const getCategoryRows = (category: SmartInspectCommonTargetCategory): DataSourceType[] => {
      const keyword = state.groupKeywords[category]?.trim();
      const rows = initDataSource.value.filter((item) => item.targetCategory === category);
      if (!keyword) return rows;
      return rows.filter((item) => item.targetName?.includes(keyword));
    };

    const getGroupPage = (category: SmartInspectCommonTargetCategory, total: number): GroupPageState => {
      const pageState = state.groupPages[category] || { current: 1, pageSize: 10 };
      const maxPage = Math.max(1, Math.ceil(total / pageState.pageSize));
      return {
        current: Math.min(pageState.current, maxPage),
        pageSize: pageState.pageSize,
      };
    };

    const setGroupPage = (category: SmartInspectCommonTargetCategory, current?: number, pageSize?: number): void => {
      const pageState = state.groupPages[category] || { current: 1, pageSize: 10 };
      state.groupPages[category] = {
        current: current || pageState.current,
        pageSize: pageSize || pageState.pageSize,
      };
    };

    const resetObjectSelectRoutePagination = async (): Promise<void> => {
      if (!("pageNumber" in route.query) && !("pageSize" in route.query)) return;
      const { pageNumber: _pageNumber, pageSize: _pageSize, ...query } = route.query;
      await router.replace({ query });
    };

    const removeTargets = (targetIds: string[]): void => {
      setTableData(initDataSource.value.filter((item) => !targetIds.includes(item.targetId)));
      Object.keys(selectedTargetIdsMap).forEach((category) => {
        selectedTargetIdsMap[category as SmartInspectCommonTargetCategory] = (
          selectedTargetIdsMap[category as SmartInspectCommonTargetCategory] || []
        ).filter((targetId) => !targetIds.includes(targetId));
      });
    };

    const getApiParams = (): unknown[] => {
      const params: unknown[] = [];
      initDataSource.value.forEach((targetItem) => {
        const baseTargetObj = {
          targetCategory: targetItem.targetCategory,
          targetId: targetItem.targetId,
          targetType: targetItem.targetTypeName,
          targetName: targetItem.targetName,
          targetParentId: "",
          targetAddress:
            targetItem?.locationDes ||
            targetItem?.location ||
            targetItem?.address ||
            String((targetItem as unknown as Record<string, unknown>).constructionSite || "") ||
            String((targetItem as unknown as Record<string, unknown>).detailAddress || ""),
          latAndLon: getTargetCoordinate(targetItem),
          targetCode: targetItem.code || targetItem.codeNum || targetItem.serialNumber || targetItem.projectNum,
          location: "",
          targetAreaId: targetItem?.areaId || targetItem?.area?.id || "",
          targetAreaName:
            targetItem?.areaName ||
            targetItem?.areaNames ||
            (Array.isArray(targetItem?.area) ? targetItem.area.map((item) => item?.name).join("-") : targetItem?.area?.name) ||
            "",
        };
        let hasStandardItem = false;
        targetItem.standardDTOList.forEach((standardItem) => {
          if (standardItem.standardItems.length) {
            standardItem.standardItems.forEach((items) => {
              hasStandardItem = true;
              params.push({
                ...baseTargetObj,
                standardId: standardItem.id,
                itemId: items.id,
                resultCode: items.resultId,
                isRawItem: items.isRawItem ?? 0,
              });
            });
          }
        });
        if (!hasStandardItem) {
          params.push({
            ...baseTargetObj,
            standardId: "",
            itemId: "",
            resultCode: "",
            isRawItem: 0,
          });
        }
      });
      return params;
    };

    const validate = (): boolean => {
      if (!initDataSource.value.length) {
        message.error("请先选择巡检对象");
        return false;
      }

      const noStandardTargets = initDataSource.value.filter(
        (targetItem) => !targetItem.standardDTOList?.some((standard) => Boolean(standard.id)),
      );
      if (noStandardTargets.length) {
        message.error(
          noStandardTargets.length === 1 ? `请为${noStandardTargets[0].targetName || "巡检对象"}选择巡检标准` : "请选择巡检标准",
        );
        return false;
      }

      const noInspectItemTargets = initDataSource.value.filter(
        (targetItem) =>
          !targetItem.standardDTOList?.some((standard) => standard.standardItems?.some((standardItem) => Boolean(standardItem.id))),
      );
      if (noInspectItemTargets.length) {
        message.error(
          noInspectItemTargets.length === 1 ? `请为${noInspectItemTargets[0].targetName || "巡检对象"}选择巡检项` : "请选择巡检项",
        );
        return false;
      }

      return true;
    };

    const [InspectContentModal, inspectContentModalApi] = useCubeModal({
      title: "配置巡检内容",
      width: "800px",
      destroyOnClose: false,
      onConfirm() {
        const selectedStandardRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVo[]).filter(
          (row): row is StandardVo => Boolean(row && row.id),
        );
        const standardRows = normalizeStandardRows(selectedStandardRows);
        if (!standardRows.length) {
          message.warning("请选择巡检标准");
          return;
        }
        const selectedStandardItems = ((inspectItemTableRef.value?.getInspectItemSelectedRows() || []) as unknown as StandardItemsVo[]).map(
          (item) => ({
            ...item,
            isRawItem: 0,
          }),
        );
        standardRows[0].standardItems = [...standardRows[0].standardItems, ...selectedStandardItems];
        setTableData(
          initDataSource.value.map((item) => {
            if (rowTargetIds.value.includes(item.targetId)) {
              return {
                ...item,
                standardDTOList: standardRows,
              };
            }
            return item;
          }),
        );
        inspectContentModalApi.close();
      },
    });

    const [SingleObjectSelectModal, singleObjectSelectModalApi] = useCubeModal({
      title: "选择巡检对象",
      width: "1000px",
      wrapperClass: "smart-inspect-single-object-select-modal",
      destroyOnClose: true,
      onConfirm() {
        void (async () => {
          await onSelectEnter(objectSelected.value as ObjectSelectValue[]);
          singleObjectSelectModalApi.close();
        })();
      },
      onClosed() {
        activeObjectType.value = undefined;
        activeObjectCategory.value = undefined;
        objectSelected.value = [];
        void resetObjectSelectRoutePagination();
      },
    });

    const handleTabChange = (key: string): void => {
      if (rowTargetIds.value.length > 1) return;
      const row = initDataSource.value.find((item) => rowTargetIds.value.includes(item.targetId));
      if (!row) return;
      if (key === "1") {
        const selectRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVOS[]).filter(
          (item) => item?.id,
        );
        const rows = [...selectRows, ...(row.standardDTOList as unknown as StandardVOS[])];
        standardTableRef.value?.setStandardSelectedRows(rows);
        return;
      }
      const standard = row.standardDTOList.find((item) => item.standardItems.length);
      if (!standard) return;
      nextTick(() => {
        inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
      });
    };

    const handleBatchRemove = (): void => {
      const targetIds = activeObjectCategory.value ? selectedTargetIdsMap[activeObjectCategory.value] || [] : [];
      if (!targetIds.length) return;
      AntModal.confirm({
        title: "提示",
        content: "确定删除选中的巡检对象吗？",
        onOk: () => {
          removeTargets(targetIds);
        },
      });
    };

    const handleBatchChange = (category: SmartInspectCommonTargetCategory): void => {
      rowTargetIds.value = selectedTargetIdsMap[category] || [];
      inspectContentModalApi.open();
    };

    const openObjectModal = async (category: SmartInspectCommonTargetCategory): Promise<void> => {
      const objectType = TARGET_CATEGORY_TO_OBJECT_TYPE[category];
      if (!objectType) {
        message.warning("当前对象类型暂不支持选择");
        return;
      }
      await resetObjectSelectRoutePagination();
      activeObjectCategory.value = category;
      activeObjectType.value = objectType;
      objectModalKey.value += 1;
      objectSelected.value = initDataSource.value
        .filter((item) => item.targetCategory === category)
        .map((item) => ({
          id: item.targetId,
          name: item.targetName,
          type: objectType,
        }));
      singleObjectSelectModalApi.setState({
        title: `选择${getSmartTargetCategoryLabel(category)}`,
      });
      await nextTick();
      singleObjectSelectModalApi.open();
    };

    const onSelectEnter = async (value: ObjectSelectValue[]): Promise<void> => {
      const category = activeObjectCategory.value;
      const objectType = activeObjectType.value;
      if (!category || !objectType) return;
      const selectedRows = value;
      const handleRowsPromise = selectedRows.map(async (item) => {
        if (item.type !== objectType) return undefined;
        let standards: StandardVo[] = [];
        try {
          const standardResult = await cubeDailyInspectionService.getInspectStandard({
            targetCategory: item.type,
            targetType: item.id ?? "",
          });
          standards = standardResult.map((standard) => ({
            code: standard.code,
            describe: standard.remark,
            enable: standard.enable,
            id: standard.id,
            name: standard.name,
            standardItems: standard.standardItems.map((standardItem) => ({
              isRawItem: 1,
              content: "",
              ...standardItem,
            })),
          }));
        } catch {
          standards = [];
        }
        return {
          ...item,
          id: item.id,
          name: item.name,
          type: item.type,
          targetId: item.id,
          targetName: item.name,
          standardDTOList: standards,
          targetCategory: category,
        };
      });
      const handleRows = (await Promise.all(handleRowsPromise)).filter(Boolean) as unknown as DataSourceType[];
      const dataList = initDataSource.value.filter((item) => item.targetCategory === category);
      const nextRows = handleRows.map((item) => {
        const existing = dataList.find((target) => target.targetId === item.targetId);
        return {
          ...existing,
          ...item,
          standardDTOList: existing?.standardDTOList?.length ? existing.standardDTOList : item.standardDTOList,
        };
      });
      setTableData([...initDataSource.value.filter((item) => item.targetCategory !== category), ...nextRows]);
      setGroupPage(category, 1);
    };

    watch(
      () => props.dataSource,
      () => {
        setTableData(
          props.dataSource.map((item) => ({
            ...item,
            standardDTOList: cloneStandards(item.standardDTOList || []),
          })),
        );
      },
      { immediate: true, deep: true },
    );

    watch(
      () => props.targetCategories.join(","),
      () => {
        const allowedCategories = new Set(props.targetCategories);
        if (!allowedCategories.size) return;
        setTableData(initDataSource.value.filter((item) => allowedCategories.has(item.targetCategory as SmartInspectCommonTargetCategory)));
      },
    );

    expose({
      validate,
      getApiParams,
      getDataSource: () => initDataSource.value,
    });

    const renderObjectGroup = (option: CommonTargetTypeOption): JSX.Element => {
      const category = option.value;
      const rows = getCategoryRows(category);
      const page = getGroupPage(category, rows.length);
      const selectedRowKeys = selectedTargetIdsMap[category] || [];
      const selectedDisabled = selectedRowKeys.length === 0;
      const totalCount = initDataSource.value.filter((item) => item.targetCategory === category).length;

      return (
        <div class={styles["object-group"]} key={category}>
          <div class={styles["object-group-header"]}>
            <div class={styles["object-group-title"]}>
              <span class={styles["object-group-icon"]}>{option.icon}</span>
              <span>{option.label}</span>
              <span class={styles["object-group-count"]}>已选 {totalCount} 个</span>
            </div>
            {!props.readonly && (
              <Space class={styles["object-group-actions"]}>
                <Input
                  value={state.groupKeywords[category]}
                  onUpdate:value={(value: string) => {
                    state.groupKeywords[category] = value;
                    setGroupPage(category, 1);
                  }}
                  allowClear
                  placeholder={`搜索${option.label}名称`}
                  style={{ width: "180px" }}
                />
                <Button type="primary" disabled={selectedDisabled} onClick={() => handleBatchChange(category)}>
                  批量配置
                </Button>
                <Button
                  type="primary"
                  disabled={selectedDisabled}
                  onClick={() => {
                    activeObjectCategory.value = category;
                    handleBatchRemove();
                  }}
                >
                  批量删除
                </Button>
                <Button type="primary" onClick={() => void openObjectModal(category)}>
                  选择{option.label}
                </Button>
              </Space>
            )}
          </div>
          <Table
            columns={columns.value}
            dataSource={rows}
            rowKey="targetId"
            pagination={{
              current: page.current,
              pageSize: page.pageSize,
              total: rows.length,
              size: "default",
              showSizeChanger: true,
              hideOnSinglePage: false,
              showTotal: (total: number) => `共 ${total} 条数据`,
            }}
            size="middle"
            scrollX={900}
            onChange={(pagination: { current?: number; pageSize?: number }) => {
              setGroupPage(category, pagination.current, pagination.pageSize);
            }}
            rowSelection={
              props.readonly
                ? undefined
                : {
                    selectedRowKeys,
                    onChange: (keys: string[]) => {
                      selectedTargetIdsMap[category] = keys;
                    },
                  }
            }
          />
        </div>
      );
    };

    const renderSingleObjectSelectContent = (): JSX.Element | null => {
      if (!singleObjectSelectModalApi.state.isOpen || !activeObjectType.value) return null;
      const SelectTable = SELECT_TABLE_COMPONENTS[activeObjectType.value];
      if (!SelectTable) return null;

      return (
        <SelectTable
          key={`${activeObjectType.value}-${objectModalKey.value}`}
          value={objectSelected.value}
          multiple
          scrollY={SELECT_MODAL_TABLE_SCROLL_Y}
          onUpdate:value={(value: ObjectSelectValue[]) => {
            objectSelected.value = value.map((item) => ({
              ...item,
              type: activeObjectType.value,
            }));
          }}
        />
      );
    };

    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={styles["object-group-list"]}>{availableTargetCategoryOptions.value.map((option) => renderObjectGroup(option))}</div>
        <InspectContentModal>
          {inspectContentModalApi.state.isOpen && (
            <div class={styles["modal-body"]}>
              <Tabs defaultActiveKey="1" onTabChange={handleTabChange} forceRender>
                <TabPane tab="巡检标准" key="1">
                  <InspectStandardTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={standardTableRef} />
                </TabPane>
                <TabPane tab="巡检项" key="2">
                  <InspectItemTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={inspectItemTableRef} />
                </TabPane>
              </Tabs>
            </div>
          )}
        </InspectContentModal>
        {!props.readonly && <SingleObjectSelectModal>{renderSingleObjectSelectContent()}</SingleObjectSelectModal>}
      </div>
    );
  },
});
