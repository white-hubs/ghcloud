import { computed, defineComponent, nextTick, onMounted, reactive, ref, watch, type PropType } from "vue";
import { useRoute } from "vue-router";

import {
  useCubeTable,
  useCubeModal,
  InspectItemTable,
  InspectStandardTable,
  ObjectSelectModal,
  ObjectType,
} from "@ghcloud/cube-app-design";
import {
  InspectBusinessType,
  targetCategoryOptions,
  type StandardItemType,
  type StandardVOS,
} from "@ghcloud/cube-daily-inspection-service";
import {
  Button,
  Input,
  Space,
  PopConfirm,
  Tabs,
  TabPane,
  message,
  AntModal,
  Select,
  FormItem,
  Form,
  PopOver,
  Page,
} from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "@/api/server";
import type { DataSourceType, StandardItemsVo, StandardVo } from "@/types/inspect";

import styles from "./inspect-content-table.module.less";

/** 对象选择弹窗中不展示「巡更点」Tab */
const OBJECT_SELECT_TABS_WITHOUT_PATROL = (Object.values(ObjectType) as ObjectType[]).filter((t) => t !== ObjectType.PATROL_POINT);

let rowId: string[] = [];

type ObjectSelectValue = Record<string, unknown> & {
  id: string;
  name: string;
  type: string;
};

const COORDINATE_FIELDS = ["latAndLon", "lntAndLat", "lngAndlat", "lngAndLat", "coordinate", "locationCoordinate"] as const;

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

export const InspectContentTable = defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<DataSourceType[]>,
      default: () => [],
    },
    apiFunction: {
      type: Function as PropType<(param: Record<string, unknown>) => Promise<void>> | null,
      default: null,
    },
    handlePage: {
      type: Object as PropType<Record<string, unknown>> | null,
      default: null,
    },
  },
  setup: (props, { expose }) => {
    const state = reactive<{
      keyword: string;
      targetCategory: string | null;
      deptId: string | undefined;
    }>({
      targetCategory: null,
      keyword: "",
      deptId: undefined,
    });
    const route = useRoute();
    let initDataSource: DataSourceType[] = [];
    watch(
      () => props.dataSource,
      () => {
        if (props.dataSource.length) {
          nextTick(() => {
            initDataSource = props.dataSource;
            tableApi.setDataSource(initDataSource);
          });
        } else {
          tableApi.setDataSource([]);
        }
      },
    );
    const standardTableRef = ref<{
      getStandardSelectedRows: () => StandardVOS[];
      setStandardSelectedRows: (rows: StandardVOS[]) => void;
    }>();
    const inspectItemTableRef = ref<{
      getInspectItemSelectedRows: () => StandardItemType[];
      setInspectItemSelectedRows: (rows: StandardItemType[]) => void;
    }>();
    const columns = [
      {
        title: "巡检对象",
        dataIndex: "targetName",
        key: "targetName",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "对象类型",
        dataIndex: "targetCategory",
        key: "targetCategory",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = targetCategoryOptions?.slice(1)?.find((item) => item.value === text)?.label;
          return <PopOver content={textVal || "--"}>{textVal || "--"}</PopOver>;
        },
      },
      {
        title: "巡检内容",
        dataIndex: "content",
        key: "content",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element | string => {
          if (!record.standardDTOList.length) {
            return "--";
          }
          const text = record.standardDTOList.map((item) => item.name).join(",");
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                onClick={() => {
                  rowId = [record.targetId];
                  inspectContentModalApi.open();
                  nextTick(() => {
                    standardTableRef.value?.setStandardSelectedRows(record.standardDTOList as unknown as StandardVOS[]);
                    const standard = record.standardDTOList.find((item) => item.standardItems.length);
                    if (standard) {
                      inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
                    }
                  });
                }}
              >
                添加巡检内容
              </Button>
              <PopConfirm
                title="是否确定删除?"
                onConfirm={() => {
                  initDataSource = initDataSource.filter((item) => item.targetId !== record.targetId);
                  tableApi.setDataSource(initDataSource);
                }}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];

    const getApiParams = (): unknown[] => {
      const params: unknown[] = [];
      initDataSource.forEach((targetItem) => {
        const baseTargetObj = {
          targetCategory: targetItem.targetCategory, // 设备类型
          targetId: targetItem.targetId, // 设备id
          targetType: targetItem.targetTypeName, // 设备类型
          targetName: targetItem.targetName, // 设备名称
          targetParentId: "", // 设备父级ID
          targetAddress:
            targetItem?.locationDes ||
            targetItem?.location ||
            targetItem?.address ||
            String((targetItem as unknown as Record<string, unknown>).constructionSite || "") ||
            String((targetItem as unknown as Record<string, unknown>).detailAddress || ""), // 设备地址
          latAndLon: getTargetCoordinate(targetItem), // 设备经纬度
          targetCode: targetItem.code || targetItem.codeNum || targetItem.serialNumber || targetItem.projectNum, // 设备targetCode
          location: "", // 设备地址
          targetAreaId: targetItem?.areaId || targetItem?.area?.id || "", // 设备区域ID
          targetAreaName:
            targetItem?.areaName ||
            targetItem?.areaNames ||
            (Array.isArray(targetItem?.area) ? targetItem?.area?.map((e) => e?.name).join("-") : targetItem?.area?.name) ||
            "", // 设备区域名称
        };
        // 收集所有 (标准, 巡检项) 组合
        let hasStandardItem = false;
        targetItem.standardDTOList.forEach((standardItem) => {
          if (standardItem.standardItems.length) {
            standardItem.standardItems.forEach((items) => {
              hasStandardItem = true;
              params.push({
                ...baseTargetObj,
                standardId: standardItem.id, // 标准ID
                itemId: items.id, // 巡检项ID
                resultCode: items.resultId, // 巡检项结果ID
                isRawItem: items.isRawItem ?? 0, // 巡检项是否为原始值
              });
            });
          }
        });
        // 兜底：当对象未配置巡检标准/巡检项时，依旧推送一条记录，
        // 否则父组件保存时会丢失这些新加入的对象（仅原有数据被提交）。
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
    const page = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
    });
    watch(
      () => props.handlePage,
      () => {
        page.total = (props.handlePage?.total as number) ?? 0;
      },
      { immediate: true, deep: true },
    );

    const [CubeTable, tableApi] = useCubeTable({
      columns: route.query.type === "info" ? columns.slice(0, columns.length - 1) : columns,
      dataSource: initDataSource,
      rowSelection: "checkbox",
      rowKey: "targetId",
      pagination: props.handlePage
        ? false
        : {
            current: 1, // 当前页码
            pageSize: 10, // 每页显示条数
            total: initDataSource?.length || 0, // 总条数
            size: "default", // 分页组件大小
            showSizeChanger: true, // 是否允许改变每页显示条数
            showTotal: (total: number) => `总共 ${total} 条数据`,
            onChange: (current: number, pageSize: number) => {
              tableApi.setState({
                pagination: {
                  ...(tableApi.state.pagination as unknown as Record<string, unknown>),
                  pageSize,
                  current,
                },
              });
            },
          },
    });
    const handleChange = (pageNumber: number, pageSize: number): void => {
      page.pageNumber = pageNumber;
      page.pageSize = pageSize;
      if (props.apiFunction) {
        props.apiFunction({
          ...state,
          ...page,
        });
      }
    };

    const [InspectContentModal, inspectContentModalApi] = useCubeModal({
      title: "添加巡检内容",
      width: "800px",
      destroyOnClose: false,
      onConfirm() {
        const standardRows: StandardVo[] = [];
        const selectedStandardRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVo[]).filter(
          (row): row is StandardVo => Boolean(row && row.id),
        );
        selectedStandardRows.forEach((row) => {
          if (!standardRows.some((item) => item.id === row.id)) {
            standardRows.push(row);
          }
        });
        // 标准自带的isRawItem为1，选择巡检项时为0
        standardRows.forEach((standard) => {
          standard.standardItems = standard.standardItems.map((item) => {
            return {
              ...item,
              isRawItem: 1,
            };
          });
        });
        if (!standardRows.length) {
          message.warning("请选择巡检标准");
          return;
        }
        const selectedStandardItems = ((inspectItemTableRef.value?.getInspectItemSelectedRows() as unknown as StandardItemsVo[]) || []).map(
          (item) => {
            return {
              ...item,
              isRawItem: 0,
            };
          },
        );
        // 选择巡检项时为false
        standardRows[0].standardItems = [...standardRows[0].standardItems, ...selectedStandardItems];
        initDataSource = initDataSource.map((item) => {
          if (rowId.includes(item.targetId)) {
            return {
              ...item,
              standardDTOList: standardRows,
            };
          }
          return item;
        });
        tableApi.setDataSource(initDataSource);
        inspectContentModalApi.close();
      },
    });
    const handleTabChange = (key: string): void => {
      if (rowId.length > 1) return;
      const row = initDataSource.find((item) => rowId.includes(item.targetId));
      if (row) {
        if (key === "1") {
          const selectRows = ((standardTableRef.value?.getStandardSelectedRows() || []) as unknown as StandardVOS[]).filter(
            (item): item is StandardVOS => Boolean(item && item.id),
          );
          const initRows = row.standardDTOList as unknown as StandardVOS[];
          const rows = [...selectRows, ...initRows];
          standardTableRef.value?.setStandardSelectedRows(rows);
        } else {
          const standard = row.standardDTOList.find((item) => item.standardItems.length);
          if (!standard) return;
          nextTick(() => {
            inspectItemTableRef.value?.setInspectItemSelectedRows(standard.standardItems as unknown as StandardItemType[]);
          });
        }
      }
    };
    const handleBatchRemove = (): void => {
      AntModal.confirm({
        title: "提示",
        content: "确定要移除选中的巡检对象吗？",
        onOk: () => {
          const selectedRowKeys = tableApi.getSelectedRowKeys();
          initDataSource = initDataSource.filter((item) => !selectedRowKeys.includes(item.targetId));
          tableApi.setDataSource(initDataSource);
          tableApi.setSelectedRowKeys([]);
        },
      });
    };
    const handleBatchChange = (): void => {
      const selectedRowKeys = tableApi.getSelectedRowKeys();
      rowId = selectedRowKeys as string[];
      inspectContentModalApi.open();
    };
    const batchDisabled = computed(() => {
      return !tableApi.getSelectedRowKeys().length;
    });
    const objectSelected = ref<{ id: string; name: string }[]>([]);
    const objectModalRef = ref<{ openModal: () => void }>();
    const onSelectEnter = async (value: ObjectSelectValue[]): Promise<void> => {
      const selectedRows = value;
      const handleRowsPromise = selectedRows.map(async (item) => {
        let patrolObjStandard: unknown[] = [];
        try {
          const standards = await cubeDailyInspectionService.getInspectStandard({
            targetCategory: item.type,
            targetType: item.id ?? "",
          });
          patrolObjStandard = standards.map((item) => {
            return {
              code: item.code,
              describe: item.remark,
              enable: item.enable,
              id: item.id,
              name: item.name,
              standardItems: item.standardItems.map((item) => {
                return {
                  isRawItem: 1,
                  content: "",
                  ...item,
                };
              }),
            };
          });
        } catch {
          patrolObjStandard = [];
        }
        return {
          ...item,
          id: item.id,
          name: item.name,
          type: item.type,
          targetId: item.id,
          targetName: item.name,
          standardDTOList: patrolObjStandard,
          targetCategory: item.type,
        };
      });
      const handleRows = await Promise.all(handleRowsPromise);
      const dataList = tableApi.state.dataSource as unknown as DataSourceType[];
      initDataSource = handleRows?.map((item) => {
        const obj = dataList.find((e) => e.targetId === item.targetId);
        return {
          ...obj,
          ...item,
          standardDTOList: obj?.standardDTOList?.length ? obj.standardDTOList : item.standardDTOList,
        };
      }) as unknown as DataSourceType[];
      tableApi.setDataSource(initDataSource);
    };
    onMounted(() => {
      if (props.apiFunction) {
        props.apiFunction({
          ...state,
          ...page,
        });
      }
    });
    expose({
      getApiParams,
    });
    return (): JSX.Element => (
      <div>
        <div class={styles.searchContent}>
          <Form layout="inline">
            <FormItem label="对象类型" class={styles["search-item"]}>
              <Select
                v-model:value={state.targetCategory}
                placeholder="对象类型"
                options={targetCategoryOptions}
                style={{ width: "150px" }}
              />
            </FormItem>
            <FormItem label="" class={styles["search-item"]}>
              <Input v-model:value={state.keyword} placeholder="请输入巡检对象名称" />
            </FormItem>
            <FormItem label="" class={styles["search-item"]}>
              <Button
                type="primary"
                onClick={() => {
                  if (props.apiFunction) {
                    props.apiFunction(state);
                    return;
                  }
                  let dataSource: DataSourceType[] = [...initDataSource];
                  if (state.targetCategory) dataSource = initDataSource.filter((item) => item.targetCategory === state.targetCategory);
                  if (state.keyword) dataSource = initDataSource.filter((item) => item.targetName.includes(state.keyword));
                  tableApi.setDataSource(dataSource);
                }}
              >
                查询
              </Button>
              <Button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  state.keyword = "";
                  state.targetCategory = "";
                  page.pageNumber = 1;
                  if (props.apiFunction) {
                    props.apiFunction({
                      ...state,
                      ...page,
                    });
                    return;
                  }
                  tableApi.setDataSource(initDataSource);
                }}
              >
                重置
              </Button>
            </FormItem>
          </Form>
          {route.query.type !== "info" && (
            <Space>
              <Button type="primary" onClick={handleBatchChange} disabled={batchDisabled.value}>
                批量修改
              </Button>

              <Button type="primary" onClick={handleBatchRemove} disabled={batchDisabled.value}>
                批量移除
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  const selectedRows = tableApi.state.dataSource as unknown as DataSourceType[];
                  objectModalRef.value?.openModal();
                  objectSelected.value = selectedRows?.map((item) => {
                    return {
                      id: item.targetId,
                      name: item.targetName,
                      type: item.targetCategory,
                    };
                  });
                }}
              >
                添加对象
              </Button>
            </Space>
          )}
        </div>
        <CubeTable />
        {props.handlePage && (
          <div class={styles.pagination}>
            <Page current={page.pageNumber} pageSize={page.pageSize} total={page.total} onPageChange={handleChange} />
          </div>
        )}
        <InspectContentModal>
          {inspectContentModalApi.state.isOpen && (
            <Tabs defaultActiveKey="1" onTabChange={handleTabChange} forceRender>
              <TabPane tab="巡检标准" key="1">
                <InspectStandardTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={standardTableRef} />
              </TabPane>
              <TabPane tab="巡检项" key="2">
                <InspectItemTable businessType={InspectBusinessType.DAILY_INSPECTION} ref={inspectItemTableRef} />
              </TabPane>
            </Tabs>
          )}
        </InspectContentModal>
        <ObjectSelectModal
          ref={objectModalRef}
          title="选择巡检对象"
          oldDailyInspection={true}
          showTabs={OBJECT_SELECT_TABS_WITHOUT_PATROL}
          v-model:value={objectSelected.value}
          multiple
          onEnter={async (value: ObjectSelectValue[]) => {
            await onSelectEnter(value);
          }}
        />
      </div>
    );
  },
});
