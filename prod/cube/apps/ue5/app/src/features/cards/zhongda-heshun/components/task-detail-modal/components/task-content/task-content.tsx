import { EyeOutlined } from "@ant-design/icons-vue";
import { Button, ImagePreviewGroup, Image, Popover, Spin, Table, Tabs } from "ant-design-vue";
import type { ColumnsType } from "ant-design-vue/es/table";
import dayjs from "dayjs";
import { computed, defineComponent, onMounted, ref } from "vue";

import { kkFilePreview } from "@ghcloud/cube-utils";
import type { PlaceRecordVO, TaskCompletionRecordVO, TaskInfoVO } from "@ghcloud/cube-zhongda-heshun-service/src/data-viz-dto";

import { cubeZDDataVizService } from "@/infrastructure/api/service";
import NoData from "@/shared-ui/panel/noData";

import styles from "./task-content.module.less";

const { TabPane } = Tabs;

interface Props {
  taskData: Record<string, unknown>;
}

export const TaskContent = defineComponent({
  props: ["taskData"],
  setup: (props: Props) => {
    const taskData = ref<TaskInfoVO>(props.taskData);
    const loading = ref(false);
    const activeKey = ref("1");
    const fileList = ["doc", "docx", "excel", "xlsx", "xls", "pdf", "ppt", "txt"];

    const getData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeZDDataVizService.getTaskInfo(props.taskData.id as string);
        if (res) {
          taskData.value = res;
        }
      } catch {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 500);
      }
    };
    const timeRange = computed(() => {
      if (taskData.value?.taskTimeLimitConfigStr) {
        const obj =
          typeof taskData.value?.taskTimeLimitConfigStr === "string"
            ? JSON.parse(taskData.value?.taskTimeLimitConfigStr || "{}")
            : taskData.value?.taskTimeLimitConfigStr;
        return `${obj?.day || 0}天${obj?.hour || 0}小时${obj?.minute || 0}分`;
      }
      return "--";
    });
    const dataSource = ref<(TaskCompletionRecordVO & PlaceRecordVO)[]>([]);
    const loading2 = ref(false);
    const getTaskCompletion = async (): Promise<void> => {
      try {
        loading2.value = true;
        const res = await cubeZDDataVizService.getTaskCompletionRecords(props.taskData.id as string);
        if (res) {
          dataSource.value = res?.map((item) => {
            let obj = { ...item };
            item?.placeRecords?.map((e) => {
              obj = { ...obj, ...e };
            });
            return obj;
          });
        }
      } catch {
      } finally {
        setTimeout(() => {
          loading2.value = false;
        }, 500);
      }
    };

    onMounted(() => {
      getData();
      getTaskCompletion();
    });
    const getNotificationTypeText = (notificationType: string, task: TaskInfoVO): string => {
      const typeMap = {
        GROUP: "小组",
        DEPT: "部门",
        POST: "岗位",
        GROUP_ROLE: "小组+角色",
        ROLE: "角色",
      };
      let name = "";
      if (notificationType === "GROUP") {
        name = task.notificationGroupName ?? "";
      } else if (notificationType === "DEPT") {
        name = task.notificationDeptName ?? "";
      } else if (notificationType === "POST") {
        name = task.notificationPostName ?? "";
      } else if (notificationType === "ROLE") {
        name = task.notificationRoleName ?? "";
      } else if (notificationType === "GROUP_ROLE") {
        let roles = [];
        if (task.notificationGroupName) {
          roles.push(task.notificationGroupName);
        }
        if (task.notificationRoleName) {
          roles.push(task.notificationRoleName);
        }
        name = roles.join(" - ");
      }
      return typeMap[notificationType as keyof typeof typeMap] + " : " + name || "--";
    };
    // 任务基本信息Tab内容
    const renderBasicInfo = (): JSX.Element => (
      <Spin spinning={loading.value}>
        <div class={styles["task-info"]}>
          <div class={styles["info-item"]}>
            <span class={styles.label}>任务名称：</span>
            <span class={styles.value}>{taskData.value?.taskName || "--"}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>所属项目：</span>
            <span class={styles.value}>{taskData.value?.projectName || "--"}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>任务类型：</span>
            <span class={styles.value}>{taskData.value?.taskTypeName || "--"}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>任务时限：</span>
            <span class={styles.value}>{timeRange.value}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>发布人：</span>
            <span class={styles.value}>{taskData.value?.projectLeaderName || "--"}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>发布时间：</span>
            <span class={styles.value}>
              {taskData.value?.createTime ? dayjs(taskData.value?.createTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
            </span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>截止时间：</span>
            <span class={styles.value}>
              {taskData.value?.deadline ? dayjs(taskData.value?.deadline).format("YYYY-MM-DD HH:mm:ss") : "--"}
            </span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>任务消杀区域：</span>
            <span class={styles.value}>{taskData.value?.taskAreaName || "--"}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>消杀频次：</span>
            <span class={styles.value}>{`${taskData.value?.disinfectionFrequency || 0}次`}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>消杀人员：</span>
            <span class={styles.value}>{getNotificationTypeText(taskData.value?.notificationType ?? "", taskData.value)}</span>
          </div>
          <div class={styles["info-item"]}>
            <span class={styles.label}>附件：</span>
            <span class={styles.value}>
              {taskData.value?.files ? (
                <ImagePreviewGroup>
                  {(taskData.value?.files || [])?.map((item, index) => {
                    const url = item.path?.startsWith("http") ? item.path : `${location.origin}${item.path}`;
                    const isFile = fileList.includes(item.type || "");
                    return (
                      <>
                        {isFile ? (
                          <>
                            <Button type="link" size="small" onClick={() => kkFilePreview(item)}>
                              {item.name || "--"}
                            </Button>
                          </>
                        ) : (
                          <Image
                            key={index}
                            src={url}
                            width={60}
                            height={60}
                            previewMask={() => (
                              <>
                                <EyeOutlined />
                                预览
                              </>
                            )}
                          />
                        )}
                      </>
                    );
                  })}
                </ImagePreviewGroup>
              ) : (
                "--"
              )}
            </span>
          </div>
        </div>
      </Spin>
    );
    const columns: ColumnsType = [
      {
        title: "任务时间",
        dataIndex: "createTime",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <Popover content={textVal || "--"}>{textVal || "--"}</Popover>;
        },
      },
      {
        title: "执行人",
        dataIndex: "executorName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "任务进度",
        dataIndex: "process",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          const textVal = text ? `${text ?? 0}%` : "";
          return <Popover content={textVal || "--"}>{textVal || "--"}</Popover>;
        },
      },
      {
        title: "完成说明",
        dataIndex: "taskDesc",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "完成情况",
        dataIndex: "files",
        align: "center",
        width: "300px",
        customRender: ({ record }: { record: TaskCompletionRecordVO & PlaceRecordVO }): JSX.Element => (
          <span class={styles.value}>
            {record?.files ? (
              <ImagePreviewGroup>
                {(record?.files || [])?.map((item, index) => {
                  const url = item.path?.startsWith("http") ? item.path : `${location.origin}${item.path}`;
                  const isFile = fileList.includes(item.type || "");
                  return (
                    <>
                      {isFile ? (
                        <>
                          <Button type="link" size="small" onClick={() => kkFilePreview(item)}>
                            {item.name || "--"}
                          </Button>
                        </>
                      ) : (
                        <Image
                          key={index}
                          src={url}
                          width={40}
                          height={40}
                          previewMask={() => (
                            <>
                              <EyeOutlined />
                              预览
                            </>
                          )}
                        />
                      )}
                    </>
                  );
                })}
              </ImagePreviewGroup>
            ) : (
              "--"
            )}
          </span>
        ),
      },
    ];
    const detailColumns: ColumnsType = [
      {
        title: "重点场所名称",
        dataIndex: "placeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "场所分类",
        dataIndex: "placeTypeName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "详细位置",
        dataIndex: "placeDetail",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "执行人",
        dataIndex: "executorName",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "任务完成时间",
        dataIndex: "completionTime",
        ellipsis: true,
        align: "center",
        customRender: ({ record }: { record: TaskCompletionRecordVO & PlaceRecordVO }): JSX.Element => {
          const time = record?.completionTime || record.createTime;
          const textVal = time ? dayjs(time).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <Popover content={textVal || "--"}>{textVal || "--"}</Popover>;
        },
      },
      {
        title: "完成说明",
        dataIndex: "taskDesc",
        ellipsis: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => <Popover content={text || "--"}>{text || "--"}</Popover>,
      },
      {
        title: "完成情况",
        dataIndex: "files",
        align: "center",
        width: "300px",
        customRender: ({ record }: { record: TaskCompletionRecordVO & PlaceRecordVO }): JSX.Element => (
          <span class={styles.value}>
            {record?.files ? (
              <ImagePreviewGroup>
                {(record?.files || [])?.map((item, index) => {
                  const url = item.path?.startsWith("http") ? item.path : `${location.origin}${item.path}`;
                  const isFile = fileList.includes(item.type || "");
                  return (
                    <>
                      {isFile ? (
                        <>
                          <Button type="link" size="small" onClick={() => kkFilePreview(item)}>
                            {item.name || "--"}
                          </Button>
                        </>
                      ) : (
                        <Image
                          key={index}
                          src={url}
                          width={40}
                          height={40}
                          previewMask={() => (
                            <>
                              <EyeOutlined />
                              预览
                            </>
                          )}
                        />
                      )}
                    </>
                  );
                })}
              </ImagePreviewGroup>
            ) : (
              "--"
            )}
          </span>
        ),
      },
    ];
    // 任务结果Tab内容
    const renderTaskResult = (): JSX.Element => (
      <Spin spinning={loading2.value}>
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
            class={styles["task-table"]}
          />
        </div>
      </Spin>
    );
    // 任务完成情况
    const renderTaskDetail = (): JSX.Element => (
      <Spin spinning={loading2.value}>
        <div class={styles["table-container"]}>
          <Table
            columns={detailColumns}
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
            class={styles["task-table"]}
          />
        </div>
      </Spin>
    );

    return (): JSX.Element => (
      <>
        <div class={styles["task-content-container"]}>
          <Tabs v-model:activeKey={activeKey.value} class={styles["task-detail-tabs"]}>
            <TabPane key="1" tab="任务信息">
              {renderBasicInfo()}
            </TabPane>
            <TabPane key="2" tab="任务完成情况">
              {renderTaskResult()}
            </TabPane>
            <TabPane key="3" tab="消杀明细情况">
              {renderTaskDetail()}
            </TabPane>
          </Tabs>
        </div>
      </>
    );
  },
});
