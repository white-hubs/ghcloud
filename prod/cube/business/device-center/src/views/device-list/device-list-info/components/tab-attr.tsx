import { AttrInfoModel } from "./attr-info-modal";
import { CommandHistoryModal } from "./command-history-modal";
import { PropRelationListModal } from "./prop-relation-list-modal/prop-relation-list-modal";
import { PropIssueModal } from "./prop-issue-modal";
import "@/styles/common.less";
import { PropRelationModal } from "./prop-relation-modal/prop-relation-modal";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { resolvePropValue } from "@/hook/resolve-device-value";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import type { DeviceInfo } from "@/types/device-type";
import { Button, PopOver, message, Tag } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import dayjs from "dayjs";
import { defineComponent, onMounted, onUnmounted, ref, type PropType, nextTick } from "vue";
import { useRoute } from "vue-router";

interface DataSourceType {
  id: string;
  propCode: string;
  name: string;
  dataType: string;
  dataTypeName: string;
  dataWrite?: number;
  newValue: string;
  newValueText?: string;
  dataConfig: string;
  unitName?: string;
  precision?: number;
  remark?: string;
  updateTimeFormat: number;
}
interface PropValueType {
  key: string;
  value: string;
}
interface DeviceDataShare {
  id: string;
  sourceDeviceId: string;
  sourceDeviceName: string;
  sourceProductId: string;
  sourceProductName: string;
  sourceDataType: number;
  sourceDataId: string;
  sourceDataCode: string;
  targetDeviceId: string;
  targetDeviceName?: string;
  targetProductId: string;
  targetProductName: string;
  targetDataId: string;
  targetDataCode?: string;
  shareMode: number;
}
export const TabAttr = defineComponent({
  props: {
    id: {
      type: String,
      default: "",
    },
    prodId: {
      type: String,
      default: "",
    },
    device: {
      type: Object as PropType<DeviceInfo>,
      default: {},
    },
  },
  setup(props) {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { scrollY } = useTableInfoScroll();
    const commandHistoryModalRef = ref<{ openModal: (options?: { targetIdentifier?: string }) => void }>();
    const propIssueModalRef = ref<{ openModal: (record: DataSourceType) => void }>();
    const columns = [
      {
        title: "属性标识",
        dataIndex: "propCode",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "属性名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "数据类型",
        dataIndex: "dataTypeName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "读写类型",
        dataIndex: "dataWrite",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: number }): string => (text === 1 ? "读写" : "只读"),
      },
      {
        title: "更新时间",
        dataIndex: "updateTimeFormat",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "最新值",
        dataIndex: "newValue",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: { newValue: string; newValueText: string; name: string; unitName: string } }): JSX.Element => {
          const value = record.newValueText || record.newValue;
          const valueText = value !== null && value !== undefined ? `${value} ${record.unitName?.replace(/^[-]{1,2}$/, "")}` : undefined;
          return <PopOver content={valueText ?? "--"}>{valueText ?? "--"}</PopOver>;
        },
      },
      {
        title: "属性描述",
        dataIndex: "remark",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "关联属性",
        dataIndex: "relationCount",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element => {
          // 判断数据集合是否有该属性关联的数据 sourceDataId === id
          const relations = relationDataMap.value.get(record.id) || [];
          const count = relations.length;
          if (count > 0) {
            return (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  openRelationList(record);
                }}
              >
                <Tag color="blue">已关联：{count}</Tag>
              </Button>
            );
          }
          return <span>--</span>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 300,
        fixed: "right",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                goDetail(record);
              }}
            >
              历史数据
            </Button>
            {record.dataWrite === 1 ? (
              <>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    currentPropRecord.value = record;
                    commandHistoryModalRef.value?.openModal({
                      targetIdentifier: record.propCode,
                    });
                  }}
                >
                  操作记录
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    propIssueModalRef.value?.openModal(record);
                  }}
                >
                  指令下发
                </Button>
              </>
            ) : null}
            <Button
              type="link"
              size="small"
              onClick={() => {
                openPropRelation(record);
              }}
            >
              属性关联
            </Button>
          </>
        ),
      },
    ];
    const loading = ref(false);
    const dataSource = ref<DataSourceType[]>([]);
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeDeviceCenterService.getProductPropList({ prodId: props.prodId });
        if (res) {
          dataSource.value = res as unknown as DataSourceType[];
          getAttrNewValue();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const newValList = ref<PropValueType[]>([]);
    const getAttrNewValue = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterInternalService.getDevicePropRelVal({ deviceId: props.id });
        newValList.value = res?.propValList as unknown as PropValueType[];
        resolvePropValue(dataSource.value, newValList.value);
        // 获取关联数据
        await getRelationData();
      } catch {}
    };

    /**
     * 获取关联数据并更新到数据源
     */
    const getRelationData = async (): Promise<void> => {
      try {
        // 首先获取数据
        const res = await cubeDeviceCenterInternalService.getDeviceDataShare(props.id);
        if (res && Array.isArray(res)) {
          // 再拆分出关联的属性数据 sourceDataType === 1
          const propertyRelations = res.filter((item) => item.sourceDataType === 1);

          // 按 sourceDataId 分组
          const map = new Map<string, DeviceDataShare[]>();
          propertyRelations.forEach((item) => {
            const key = item.sourceDataId;
            if (!map.has(key)) {
              map.set(key, []);
            }
            map.get(key)!.push(item);
          });
          relationDataMap.value = map;
        }
      } catch {
        // 静默失败，不影响主流程
      }
    };

    /**
     * 打开关联列表弹窗
     */
    const openRelationList = async (record: DataSourceType): Promise<void> => {
      currentPropRecord.value = record;
      // 获取该属性的关联数据
      const relations = relationDataMap.value.get(record.id) || [];
      await nextTick();
      propRelationListRef.value?.openModal(relations);
    };

    /**
     * 关联列表操作完成后的回调
     */
    const handleRelationListOk = async (): Promise<void> => {
      // 刷新关联数据
      await getRelationData();
      // 如果弹窗还打开着，更新弹窗中的数据
      if (currentPropRecord.value) {
        const relations = relationDataMap.value.get(currentPropRecord.value.id) || [];
        propRelationListRef.value?.setRelationList(relations);
      }
    };
    const infoRef = ref<{ openModal: (rowItem: { name: string; deviceName: string; deviceNumber: string }) => void }>();
    const propRelationRef = ref<{ openModal: () => void }>();
    const propRelationListRef = ref<{
      openModal: (relations: DeviceDataShare[]) => void;
      setRelationList: (relations: DeviceDataShare[]) => void;
    }>();
    const currentPropRecord = ref<DataSourceType | null>(null);
    const relationDataMap = ref<Map<string, DeviceDataShare[]>>(new Map());

    const goDetail = (record: { name: string; propCode: string }): void => {
      infoRef.value?.openModal({
        ...record,
        deviceName: props.device.name,
        deviceNumber: props.device.deviceNumber,
      });
    };

    const openPropRelation = async (record: DataSourceType): Promise<void> => {
      currentPropRecord.value = record;
      // 等待组件渲染完成后再调用 openModal
      await nextTick();
      propRelationRef.value?.openModal();
    };

    const handlePropRelationOk = async (data: {
      devices: { id: string; name: string }[];
      props: { id: string; propCode: string; name: string }[];
      sourcePropCode: string;
      sourcePropName: string;
      sourcePropId: string;
    }): Promise<void> => {
      if (!data.devices?.length || !data.props?.length) {
        message.warning("请选择需要关联的设备和属性");
        return;
      }

      try {
        loading.value = true;
        // 为每个设备、每个属性创建关联
        const payload: {
          sourceDeviceId: string;
          sourceDataType: string;
          sourceDataId: string;
          targetDeviceId: string;
          targetDataId: string;
          shareMode: string;
        }[] = [];
        for (const device of data.devices) {
          for (const prop of data.props) {
            payload.push({
              sourceDeviceId: props.id,
              sourceDataType: "1",
              sourceDataId: data.sourcePropId,
              targetDeviceId: device.id,
              targetDataId: prop.id,
              shareMode: "1",
            });
          }
        }
        await cubeDeviceCenterInternalService.batchAddDeviceDataShare(payload);
        message.success(`已为属性"${data.sourcePropName}"关联 ${data.devices.length} 个设备`);
        await getAttrNewValue();
      } catch (error) {
        message.error("属性关联失败，请重试");
      } finally {
        loading.value = false;
      }
    };
    let timer: string | number | NodeJS.Timeout | null | undefined = null;
    onMounted(() => {
      getTableData();
      timer = setInterval(() => {
        getAttrNewValue();
      }, 5000);
    });
    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    return (): JSX.Element => (
      <>
        <AliasTable
          rowKey="id"
          columns={columns}
          loading={loading.value}
          dataSource={dataSource.value}
          tableCode={`${tableCode}Attr`}
          pagination={{
            total: dataSource.value,
            showTotal(total: string | number) {
              return `共 ${total} 条数据`;
            },
            showSizeChanger: true,
          }}
          scrollY={scrollY.value - 20}
          applicationCode={__ENV__.applicationCode}
        />
        <AttrInfoModel ref={infoRef} id={props.id} />
        <CommandHistoryModal ref={commandHistoryModalRef} title="操作记录" downCmd="DEV_PROP_SET" />
        <PropIssueModal ref={propIssueModalRef} deviceId={props.id} />
        {currentPropRecord.value &&
          (() => {
            const currentRecord = currentPropRecord.value!;
            return (
              <>
                <PropRelationModal
                  ref={propRelationRef}
                  propId={currentRecord.id}
                  propCode={currentRecord.propCode}
                  propName={currentRecord.name}
                  propDataType={currentRecord.dataType}
                  currentDeviceId={props.id}
                  onOk={handlePropRelationOk}
                />
                <PropRelationListModal
                  ref={propRelationListRef}
                  deviceId={props.id}
                  propId={currentRecord.id}
                  onOk={handleRelationListOk}
                />
              </>
            );
          })()}
      </>
    );
  },
});
