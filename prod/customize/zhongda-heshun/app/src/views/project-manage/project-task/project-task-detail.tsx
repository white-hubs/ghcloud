import { cubeZhongdaHeshunService } from "@/api/service";
import { FileUpload } from "@ghcloud/cube-app-design";
import { CubeLayout } from "@ghcloud/cube-app-design/src/base-components/cube-layout/cube-layout";
import { PopOver } from "@ghcloud/cube-ui";
import { kkFilePreview } from "@ghcloud/cube-utils";
import type { OSSFile } from "@ghcloud/generic-component";
import { Tabs, TabPane, Descriptions, DescriptionsItem, Table, Button, Modal } from "ant-design-vue";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
interface TaskDataType {
  createTime: string;
  createName: string;
  process: number;
  taskDesc: string;
  executorName: string;
  files: OSSFile[];
  placeRecords: PlaceRecords[];
}
interface PlaceRecords {
  placeDetail: string;
  placeId: number;
  placeName: string;
  placeTypeName: string;
  files: OSSFile[];
  appendix: number;
  createTime: string;
  executorName: string;
  taskDesc: string;
}
interface DialogModel {
  showDescript: boolean;
  name: string;
  files: OSSFile[];
}
export const ProjectTaskDetail = defineComponent({
  name: "ProjectTaskDetail",
  setup() {
    const router = useRouter();
    const activeKey = ref("basicInfo");
    const isModalVisible = ref(false);
    const route = useRoute();
    const id = route.query.id as string;
    // 基本信息数据
    const basicInfoData = ref();
    const taskData = ref<TaskDataType[]>();
    const placeData = ref<PlaceRecords[]>();
    const recordData = ref<DialogModel>();
    // 消杀明细情况表格列定义
    const detailColumns = [
      {
        title: "重点场所名称",
        dataIndex: "placeName",
        key: "placeName",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "场所分类",
        dataIndex: "placeTypeName",
        key: "placeTypeName",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "详细位置",
        dataIndex: "placeDetail",
        key: "placeDetail",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "执行人",
        dataIndex: "executorName",
        key: "executorName",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "任务完成时间",
        dataIndex: "createTime",
        key: "createTime",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "消杀结果",
        key: "result",
        customRender: ({ record }: { record: PlaceRecords }): JSX.Element => <a onClick={() => showModal(record, false)}>详情</a>,
      },
    ];

    // 任务完成情况表格列定义
    const completionColumns = [
      {
        title: "任务时间",
        dataIndex: "createTime",
        key: "createTime",
        customRender: ({ text }: { text: number }): JSX.Element => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time || "--"}>{time || "--"}</PopOver>;
        },
      },
      {
        title: "执行人",
        dataIndex: "executorName",
        key: "executorName",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "任务进度",
        dataIndex: "process",
        key: "process",
        customRender: ({ text }: { text: number }): JSX.Element => <PopOver content={`${text}%`}>{`${text}%`}</PopOver>,
      },
      {
        title: "操作",
        key: "action",
        customRender: ({ record }: { record: PlaceRecords }): JSX.Element => <a onClick={() => showModal(record, true)}>详情</a>,
      },
    ];

    const goBack = (): void => {
      router.back();
    };

    const showModal = (record: PlaceRecords | TaskDataType, show: boolean): void => {
      recordData.value = {
        name: record.taskDesc,
        files: record.files,
        showDescript: show,
      };
      isModalVisible.value = true;
    };

    const handleOk = (): void => {
      isModalVisible.value = false;
    };

    const handleCancel = (): void => {
      isModalVisible.value = false;
    };

    onMounted(async () => {
      if (id) {
        const data = await cubeZhongdaHeshunService.getTaskDetail(id);
        basicInfoData.value = data;
        const task = await cubeZhongdaHeshunService.getTaskDetailCompletion(id);
        taskData.value = task as TaskDataType[];
        const place = [] as PlaceRecords[];
        taskData.value.map((item) => {
          item.placeRecords.map((placeItem) => {
            const newItem = {
              ...placeItem,
              createTime: item.createTime,
              executorName: item.executorName,
              taskDesc: item.taskDesc,
            };
            place.push(newItem);
          });
        });
        placeData.value = place;
      }
    });
    const getTaskTimeLimitText = (): string => {
      if (basicInfoData.value?.taskTimeLimitConfig) {
        const { day, hour, minute } = basicInfoData.value.taskTimeLimitConfig;
        const parts = [];
        if (day > 0) {
          parts.push(`${day}天`);
        }
        if (hour > 0) {
          parts.push(`${hour}时`);
        }
        if (minute > 0) {
          parts.push(`${minute}分`);
        }
        return parts.length > 0 ? parts.join("") : "0分";
      }
      return "--";
    };
    // Const perview = (): void =>{
    //   KkFilePreview()
    // }
    const typeOptions = (label: string, value: Record<string, string>): string => {
      switch (label) {
        case "GROUP":
          return `小组-${value.notificationGroupName}`;
        case "DEPT":
          return `部门-${value.notificationDeptName}`;
        case "POST":
          return `岗位-${value.notificationPostName}`;
        case "ROLE":
          return `角色-${value.notificationRoleName}`;
        default:
          return "--";
      }
    };
    const slots = {
      "layout-content": (): JSX.Element => (
        <div class="p-4 bg-white h-full">
          <Tabs v-model:activeKey={activeKey.value}>
            <TabPane key="basicInfo" tab="基本信息">
              <Descriptions bordered column={2} class="mb-4" style={{ width: "70%" }}>
                <DescriptionsItem label="任务名称">{basicInfoData.value?.taskName ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="所属项目">{basicInfoData.value?.projectName ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="任务类型">{basicInfoData.value?.taskTypeName ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="任务时限">{getTaskTimeLimitText()}</DescriptionsItem>
                <DescriptionsItem label="发布人">{basicInfoData.value?.createName ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="发布时间">
                  {dayjs(basicInfoData.value?.createTime).format("YYYY-MM-DD HH:mm:ss") ?? "--"}
                </DescriptionsItem>
                <DescriptionsItem label="截止时间">
                  {" "}
                  {basicInfoData.value?.deadline ? dayjs(basicInfoData.value?.deadline).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </DescriptionsItem>
                <DescriptionsItem label="任务消杀区域">{basicInfoData.value?.taskAreaName ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="消杀频次">{basicInfoData.value?.disinfectionFrequency ?? "--"}</DescriptionsItem>
                <DescriptionsItem label="消杀人员">
                  {typeOptions(basicInfoData.value?.notificationType, basicInfoData.value) ?? "--"}
                </DescriptionsItem>
                <DescriptionsItem label="附件">
                  {/* {basicInfoData.value?.files.length ? <img src={basicInfoData.value?.files[0].path} alt="" style={{ width: '100px', height: '100px' }} /> : '--'} */}
                  {basicInfoData.value?.files.length ? (
                    <div>
                      <a
                        href={basicInfoData.value?.files[0].path}
                        onClick={() => kkFilePreview(basicInfoData.value?.files[0])}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {basicInfoData.value?.files[0].name}
                      </a>
                    </div>
                  ) : (
                    "--"
                  )}
                </DescriptionsItem>
              </Descriptions>
              <br />
              <h3 class="text-lg font-bold mb-2">任务完成情况</h3>
              <div style={{ width: "70%" }}>
                <Table columns={completionColumns} dataSource={taskData.value} pagination={false} />
              </div>
            </TabPane>
            <TabPane key="disinfectionDetails" tab="消杀明细情况">
              <Table columns={detailColumns} dataSource={placeData.value} pagination={false} />
            </TabPane>
          </Tabs>
          <Modal title="任务结果" visible={isModalVisible.value} onOk={handleOk} onCancel={handleCancel} footer={null}>
            <Descriptions bordered column={1}>
              {recordData.value?.showDescript && (
                <DescriptionsItem label="完成说明">{recordData.value.name ? recordData.value.name : "--"}</DescriptionsItem>
              )}
              <DescriptionsItem label="完成情况">
                <div class="flex">
                  {recordData.value?.files ? (
                    <FileUpload readonly={true} v-model:value={recordData.value.files} type={"picture-card"} />
                  ) : (
                    <span>--</span>
                  )}
                </div>
              </DescriptionsItem>
            </Descriptions>
          </Modal>
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div class="flex-shrink-0 p-4 text-right border-t">
          <Button onClick={goBack}>返回</Button>
        </div>
      ),
    };
    return (): JSX.Element => <CubeLayout title={"任务详情"} v-slots={slots} showTableXScroll />;
  },
});
