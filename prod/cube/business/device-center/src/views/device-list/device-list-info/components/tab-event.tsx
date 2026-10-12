import { EventInfoModel } from "./event-info-modal";
import { EventRelationListModal } from "./event-relation-list-modal/event-relation-list-modal";
import "@/styles/common.less";
import { EventRelationModal } from "./event-relation-modal/event-relation-modal";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import { useTableInfoScroll } from "@/hook/use-table-info-scroll";
import type { DeviceInfo } from "@/types/device-type";
import { Button, PopOver, message, Tag } from "@ghcloud/cube-ui";
import { AliasTable } from "@ghcloud/generic-component";
import { defineComponent, h, onMounted, ref, type PropType, nextTick } from "vue";
import { useRoute } from "vue-router";

interface DataSourceType {
  id: string;
  eventCode: string;
  name: string;
  categoryName: string;
  eventConfig: {
    triggerType: string;
    rules: { op: string };
  };
  statusName: string;
  remark: string;
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

export const TabEvent = defineComponent({
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
    // 条件
    const conditionSource = ref<{ value: string; label: string }[]>([]);
    const getConditionData = async (): Promise<void> => {
      try {
        const res = await cubeDeviceCenterService.getCompareType();
        if (res) {
          const result = res;
          if (Array.isArray(result)) {
            conditionSource.value =
              result?.map((item: { itemValue: string; itemLabel: string }) => ({ value: item.itemValue, label: item.itemLabel })) ?? [];
          }
        }
      } catch {}
    };

    const columns = [
      {
        title: "事件标识",
        dataIndex: "eventCode",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件分类",
        dataIndex: "categoryName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "触发类型",
        dataIndex: "eventConfig",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: { triggerType: string } }): JSX.Element => {
          const triggerMap = new Map([
            ["SIMPLE", "设备属性事件"],
            ["SETTING", "设备阈值事件"],
            ["NATURE", "设备原生事件"],
          ]);
          const txt = triggerMap.get(text.triggerType) || "--";
          return h(PopOver, { content: txt }, txt);
        },
      },
      {
        title: "条件",
        dataIndex: "eventConfig",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: { rules: { op: string } } }): JSX.Element => {
          const txt = conditionSource.value.filter((c) => c.value === text.rules.op)[0]?.label || "--";
          return h(PopOver, { content: txt }, txt);
        },
      },
      {
        title: "是否启用",
        dataIndex: "statusName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "事件描述",
        dataIndex: "remark",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "关联事件",
        dataIndex: "relationCount",
        ellipsis: true,
        width: 120,
        align: "center",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element => {
          // 判断数据集合是否有该事件关联的数据 sourceDataId === id
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
        width: 200,
        fixed: "right",
        customRender: ({ record }: { record: DataSourceType }): JSX.Element => {
          const { triggerType } = record.eventConfig;
          const isSetting = triggerType === "NATURE";
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  goDetail(record);
                }}
              >
                历史记录
              </Button>
              {isSetting && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    openEventRelation(record);
                  }}
                >
                  事件关联
                </Button>
              )}
            </>
          );
        },
      },
    ];
    const loading = ref(false);
    const dataSource = ref<DataSourceType[]>([]);
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeDeviceCenterService.getProductEventList({ prodId: props.prodId });
        if (res) {
          dataSource.value = res as unknown as DataSourceType[];
          // 获取关联数据
          await getRelationData();
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };

    /**
     * 获取关联数据并更新到数据源
     */
    const getRelationData = async (): Promise<void> => {
      try {
        // 首先获取数据
        const res = await cubeDeviceCenterInternalService.getDeviceDataShare(props.id);
        if (res && Array.isArray(res)) {
          // 再拆分出关联的事件数据 sourceDataType === 2
          const eventRelations = res.filter((item) => item.sourceDataType === 2);

          // 按 sourceDataId 分组
          const map = new Map<string, DeviceDataShare[]>();
          eventRelations.forEach((item) => {
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
    const openRelationList = async (record: { id: string; name: string; eventCode: string }): Promise<void> => {
      currentEventRecord.value = record;
      // 获取该事件的关联数据
      const relations = relationDataMap.value.get(record.id) || [];
      await nextTick();
      eventRelationListRef.value?.openModal(relations);
    };

    /**
     * 关联列表操作完成后的回调
     */
    const handleRelationListOk = async (): Promise<void> => {
      // 刷新关联数据
      await getRelationData();
      // 如果弹窗还打开着，更新弹窗中的数据
      if (currentEventRecord.value) {
        const relations = relationDataMap.value.get(currentEventRecord.value.id) || [];
        eventRelationListRef.value?.setRelationList(relations);
      }
    };

    const infoRef = ref<{ openModal: (rowItem: { name: string; eventCode: string; deviceName: string; deviceNumber: string }) => void }>();
    const eventRelationRef = ref<{ openModal: () => void }>();
    const eventRelationListRef = ref<{
      openModal: (relations: DeviceDataShare[]) => void;
      setRelationList: (relations: DeviceDataShare[]) => void;
    }>();
    const currentEventRecord = ref<{ id: string; name: string; eventCode: string } | null>(null);
    const relationDataMap = ref<Map<string, DeviceDataShare[]>>(new Map());

    const goDetail = (record: { name: string; eventCode: string }): void => {
      infoRef.value?.openModal({
        ...record,
        deviceName: props.device.name,
        deviceNumber: props.device.deviceNumber,
      });
    };

    const openEventRelation = async (record: { id: string; name: string; eventCode: string }): Promise<void> => {
      currentEventRecord.value = record;
      // 等待组件渲染完成后再调用 openModal
      await nextTick();
      eventRelationRef.value?.openModal();
    };

    const handleEventRelationOk = async (data: {
      devices: { id: string; name: string }[];
      events: { id: string; eventCode: string; name: string }[];
      sourceEventCode: string;
      sourceEventName: string;
      sourceEventId: string;
    }): Promise<void> => {
      if (!data.devices?.length || !data.events?.length) {
        message.warning("请选择需要关联的设备和事件");
        return;
      }

      try {
        loading.value = true;
        // 为每个设备、每个事件创建关联
        const payload: {
          sourceDeviceId: string;
          sourceDataType: string;
          sourceDataId: string;
          targetDeviceId: string;
          targetDataId: string;
          shareMode: string;
        }[] = [];
        for (const device of data.devices) {
          for (const event of data.events) {
            payload.push({
              sourceDeviceId: props.id,
              sourceDataType: "2",
              sourceDataId: data.sourceEventId,
              targetDeviceId: device.id,
              targetDataId: event.id,
              shareMode: "1",
            });
          }
        }
        await cubeDeviceCenterInternalService.batchAddDeviceDataShare(payload);
        message.success(`已为事件"${data.sourceEventName}"关联 ${data.devices.length} 个设备`);
        // 刷新事件列表和关联数据
        await getTableData();
      } catch (_ignore) {
        message.error("事件关联失败，请重试");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      getConditionData();
      getTableData();
    });
    return (): JSX.Element => (
      <>
        <AliasTable
          rowKey="id"
          columns={columns}
          loading={loading.value}
          dataSource={dataSource.value}
          tableCode={`${tableCode}Event`}
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
        <EventInfoModel ref={infoRef} id={props.id} />
        {currentEventRecord.value && (
          <>
            <EventRelationModal
              ref={eventRelationRef}
              eventId={currentEventRecord.value.id}
              eventCode={currentEventRecord.value.eventCode}
              eventName={currentEventRecord.value.name}
              currentDeviceId={props.id}
              onOk={handleEventRelationOk}
            />
            <EventRelationListModal
              ref={eventRelationListRef}
              deviceId={props.id}
              eventId={currentEventRecord.value.id}
              onOk={handleRelationListOk}
            />
          </>
        )}
      </>
    );
  },
});
