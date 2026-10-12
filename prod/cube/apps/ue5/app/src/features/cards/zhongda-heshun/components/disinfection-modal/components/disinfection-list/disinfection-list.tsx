import { Table, Button, Input, Spin, Popover, RangePicker } from "ant-design-vue";
import localeCN from "ant-design-vue/es/date-picker/locale/zh_CN";
import type { ColumnsType } from "ant-design-vue/es/table";
import dayjs from "dayjs";
import { defineComponent, ref, onMounted } from "vue";

import { disinfectionDetailModal } from "../../../disinfection-detail-modal/disinfection-detail-modal.ts";
import { closeDisinfectionModal } from "../../disinfection-modal";
import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./disinfection-list.module.less";

interface Props {
  info: Record<string, unknown>;
}

export const DisinfectionList = defineComponent({
  props: ["info"],
  setup: (props: Props) => {
    // 表格列定义
    const columns: ColumnsType = [
      {
        title: "重点场所名称",
        dataIndex: "placeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "场所分类",
        dataIndex: "placeTypeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "详细位置",
        dataIndex: "placeAddress",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      {
        title: "执行人员",
        dataIndex: "executorName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <Popover content={text || "--"}>{text || "--"}</Popover>;
        },
      },
      // {
      //   title: '执行人员',
      //   dataIndex: 'executorName',
      //   ellipsis: true,
      //   align: 'center',
      //   customRender: ({ record }: { record: any; }): JSX.Element => {
      //     let label = ''
      //     switch (record?.notificationType) {
      //       case 'GROUP':
      //         label = `小组-${record?.notificationGroupName ?? ''}`
      //         break;
      //       case 'DEPT':
      //         label = `部门-${record?.notificationDeptName ?? ''}`
      //         break;
      //       case 'POST':
      //         label = `岗位-${record?.notificationPostName ?? ''}`
      //         break;
      //       case 'ROLE':
      //         label = `角色-${record?.notificationRoleName ?? ''}`
      //         break;
      //       default:
      //         label = '--'
      //     }
      //     return <Popover content={label || '--'}>{label || '--'}</Popover>
      //   }
      // },
      {
        title: "任务完成时间",
        dataIndex: "createTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <Popover content={textVal || "--"}>{textVal || "--"}</Popover>;
        },
      },
      {
        title: "消杀结果",
        dataIndex: "action",
        customRender: ({ record }: { record: unknown }): JSX.Element => {
          return (
            <Button type="link" size="small" onClick={async () => handleViewDetail(record)}>
              详情
            </Button>
          );
        },
      },
    ];
    const dataSource = ref<any[]>([]);
    const loading = ref<boolean>(false);
    const searchForm = ref({
      keyword: "",
      time: [],
    });

    const handleViewDetail = async (record: any): Promise<void> => {
      closeDisinfectionModal();
      await disinfectionDetailModal.open({
        title: record.disinfectionName || "消杀详情",
        disinfectionData: {
          ...record,
        },
      });
    };
    // 搜索
    const handleSearch = (): void => {
      fetchData();
    };

    // 重置
    const handleReset = (): void => {
      searchForm.value = {
        keyword: "",
        time: [],
      };
      fetchData();
    };

    // 获取数据
    const fetchData = async (): Promise<void> => {
      try {
        loading.value = true;
        const firstPageRes = await cubeZDDataVizService.getKeyPlaceExecuteRecord({
          pageNumber: 1,
          pageSize: 10,
          keyPlaceId: (props.info?.id as string) ?? "",
          userName: searchForm.value.keyword,
          period:
            searchForm.value.time?.length > 0
              ? dayjs(searchForm.value.time[0]).format("YYYY-MM-DD 00:00:00") +
                "," +
                dayjs(searchForm.value.time[1]).format("YYYY-MM-DD 23:59:59")
              : "",
        });
        if (firstPageRes) {
          if ("total" in firstPageRes && "records" in firstPageRes) {
            const { total, records } = firstPageRes as { total: number; records: any[] };
            if (total <= 10) {
              dataSource.value = records;
            } else {
              const pageSize = 100;
              const pageCount = Math.ceil(total / pageSize);
              const requests = [];
              for (let i = 1; i <= pageCount; i++) {
                requests.push(
                  cubeZDDataVizService.getKeyPlaceExecuteRecord({
                    pageNumber: i,
                    pageSize,
                    keyPlaceId: "",
                    userName: searchForm.value.keyword,
                    period: searchForm.value.time
                      ? dayjs(searchForm.value.time[0]).format("YYYY-MM-DD 00:00:00") +
                        "," +
                        dayjs(searchForm.value.time[1]).format("YYYY-MM-DD 23:59:59")
                      : "",
                  }),
                );
              }
              const responses = await Promise.all(requests);
              let allRecords: any[] = [];
              responses.forEach((res) => {
                if (res && "records" in res) {
                  allRecords = [...allRecords, ...res.records];
                } else if (Array.isArray(res)) {
                  allRecords = [...allRecords, ...res];
                }
              });

              dataSource.value = allRecords;
            }
          } else {
            dataSource.value = firstPageRes ?? [];
          }
        } else {
          dataSource.value = [];
        }
      } catch (error) {
        dataSource.value = [];
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return (): JSX.Element => (
      <div class={styles["disinfection-container"]}>
        <div class={styles["disinfection-content"]}>
          <div class={styles["search-form"]}>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>任务完成时间</span>
              <RangePicker
                v-model:value={searchForm.value.time}
                locale={localeCN}
                allowClear={false}
                placeholder={["开始时间", "结束时间"]}
                valueFormat="YYYY-MM-DD"
                format="YYYY-MM-DD"
              />
            </div>
            <div class={styles["form-item"]}>
              <span class={styles["label"]}>人员姓名</span>
              <Input v-model:value={searchForm.value.keyword} placeholder="人员姓名" class={styles["input"]} />
            </div>
            <div class={styles["form-buttons"]}>
              <Button type="primary" onClick={handleSearch}>
                查询
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </div>
          </div>

          <Spin spinning={loading.value}>
            <div class={styles["table-container"]}>
              <Table
                columns={columns}
                dataSource={dataSource.value}
                rowKey="id"
                scroll={{ y: 350 }}
                pagination={{
                  showSizeChanger: true,
                  total: dataSource.value.length,
                  showTotal: (total) => `共 ${total} 条`,
                  defaultCurrent: 1,
                  defaultPageSize: 10,
                  locale: {
                    jump_to: "跳转到",
                    page: "页",
                    items_per_page: "条/页",
                  },
                }}
                locale={{ emptyText: <NoData /> }}
                class={styles["disinfection-table"]}
              />
            </div>
          </Spin>
        </div>
      </div>
    );
  },
});
