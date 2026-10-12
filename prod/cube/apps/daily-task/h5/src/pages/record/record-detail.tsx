import dayjs from "dayjs";
import { showImagePreview, Image, CellGroup, Cell, Tag, Button } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type {
  DailyTaskRecordDetailsModel,
  DailyRecordExceptionModel,
  StandardResultItemModel,
  workOrderList,
} from "@ghcloud/cube-daily-task-service";
import { RecordStatusColor, RecordStatusMap } from "@ghcloud/cube-daily-task-service";
import type { FileState } from "@ghcloud/cube-file-service";

import { cubeDailyTaskService } from "@/api/server";

import styles from "./detail.module.less";

export const RecordDetail = defineComponent({
  name: "RecordDetail",
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const id = route.query.id as string;
    const taskId = route.query.taskId as string;
    const standardResultList = ref<StandardResultItemModel[]>();
    const detail = ref<DailyTaskRecordDetailsModel>();
    const getDetail = async () => {
      const params = {
        id,
        taskId,
      };
      const data = await cubeDailyTaskService.getDailyTaskRecordDetail(params);
      detail.value = data;
      if (data.targetList && data.targetList.length) {
        standardResultList.value = data.targetList[0].standardResultList;
      } else if (data.recordItemList && data.recordItemList.length) {
        standardResultList.value = [
          {
            itemList: data.recordItemList,
            masterId: "",
            standardId: "",
            standardName: "",
          },
        ];
      }
    };
    const previewImg = (files: FileState): void => {
      if (files.path) {
        showImagePreview([files.path], 0);
      }
    };
    const goOrderPage = (record: workOrderList): void => {
      window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=${record.workOrderType}&processId=${record.processInstanceId}`;
    };
    const getStatusTag = (status: string): { text: string; type: string } => {
      const statusMap = {
        UNDO: { text: "撤销", type: "gray" },
        REJECT: { text: "已拒绝", type: "gray" },
        ACTIVE: { text: "处理中", type: "primary" },
        PASS: { text: "已完成", type: "success" },
      };
      return statusMap[status as keyof typeof statusMap] || { text: "未知状态", type: "default" };
    };
    const goRepair = (exception: DailyRecordExceptionModel): void => {
      router.push({ path: "/record-repair", query: { exceptionId: exception.id } });
    };
    const goTransfer = (exception: DailyRecordExceptionModel): void => {
      router.push({ path: "/task-handOver", query: { id: exception.id, action: "record-repair" } });
    };
    const getRepairResultName = (executionResult: string): string => {
      return executionResult === "NORMAL" ? "正常" : "异常";
    };
    const getRecordStatus = (): string => {
      return detail.value?.recordStatus || (detail.value?.executionResult === "NORMAL" ? "NORMAL" : "ABNORMAL_WAIT_REPAIR");
    };
    const getRecordStatusText = (): string => {
      return RecordStatusMap.get(getRecordStatus()) || "--";
    };
    const getRecordStatusStyle = (): Record<string, string> => {
      const color = RecordStatusColor.get(getRecordStatus()) || "#969799";
      return {
        color,
        borderColor: color,
        background: `${color}14`,
      };
    };
    const getRecordTitle = (): string => {
      return detail.value?.taskName || "--";
    };
    const getTargetNames = (): string => {
      return (
        detail.value?.targetList
          ?.map((target) => target.targetName)
          .filter(Boolean)
          .join("、") || ""
      );
    };
    const isErrorItem = (item: StandardResultItemModel): boolean => {
      return item.errorFlag === true;
    };
    const getItemResultName = (item: StandardResultItemModel): string => {
      return isErrorItem(item) ? "异常" : item.resultName;
    };
    const getRepairList = () => {
      return (detail.value?.exceptionList ?? []).flatMap((exception) => exception.repairList ?? []);
    };
    const getRepairableException = (): DailyRecordExceptionModel | undefined => {
      return detail.value?.exceptionList?.find((exception) => exception.allowRepair);
    };
    onMounted(() => {
      getDetail();
    });
    return (): VNode => (
      <div class={styles.detail_main}>
        <CubeNavBar
          showBack
          title="处理详情"
          rightSlot={() => (
            <>
              {getRepairableException() && (
                <div class={styles.navAction} onClick={() => goTransfer(getRepairableException() as DailyRecordExceptionModel)}>
                  移交
                </div>
              )}
            </>
          )}
        />
        <div class={styles.wrapper}>
          <div class={styles.summaryCard}>
            <div class={styles.summaryHeader}>
              <span class={styles.summaryTitle}>{getRecordTitle()}</span>
              <span class={styles.resultTag} style={getRecordStatusStyle()}>
                {getRecordStatusText()}
              </span>
            </div>
            <div class={styles.summaryInfo}>
              {getTargetNames() && (
                <div>
                  <span class={styles.infoLabel}>执行对象：</span>
                  <span class={styles.infoValue}>{getTargetNames()}</span>
                </div>
              )}
              <div>
                <span class={styles.infoLabel}>处理人员：</span>
                <span class={styles.infoValue}>{detail.value?.executorName || "--"}</span>
              </div>
              <div>
                <span class={styles.infoLabel}>处理时间：</span>
                <span class={styles.infoValue}>
                  {detail.value?.executionTime ? dayjs(detail.value.executionTime).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </span>
              </div>
            </div>
          </div>

          {!!standardResultList.value?.length && (
            <div class={styles.detailCard}>
              <div class={styles.sectionTitle}>巡检内容</div>
              {standardResultList.value?.map((item) => (
                <div class={styles.standardBlock} key={item.standardId || item.standardName}>
                  {item.standardName && <div class={styles.standardTitle}>{item.standardName}</div>}
                  {item.itemList.map((list) => (
                    <div class={styles.result_content} key={list.itemId || list.itemName}>
                      <div class={styles.itemHeader}>
                        <span class={styles.itemTitle}>{list.itemName}</span>
                        {isErrorItem(list) && <span class={styles.errorTag}>异常</span>}
                      </div>
                      <div>
                        处理结果：
                        <span class={isErrorItem(list) ? styles.errorText : undefined}>{getItemResultName(list)}</span>
                      </div>
                      {list.remark && <div>处理备注：{list.remark}</div>}
                      {!!list.fileList?.length && (
                        <div class={styles.imageList}>
                          {(list.fileList ?? []).map((item) => (
                            <Image key={item.id} width="52" height="52" fit="cover" src={item.path} onClick={() => previewImg(item)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          <div class={styles.repairCard}>
            <div class={styles.repairTitle}>异常处理</div>
            {getRepairList().length ? (
              <div class={styles.repairList}>
                {getRepairList().map((repair) => (
                  <div class={styles.repairItem} key={repair.id}>
                    <div>
                      <span class={styles.repairLabel}>处理时间：</span>
                      <span>{dayjs(repair.createTime).format("YYYY-MM-DD HH:mm:ss")}</span>
                    </div>
                    <div>
                      <span class={styles.repairLabel}>处理人：</span>
                      <span>{repair.handlerName || "--"}</span>
                    </div>
                    <div>
                      <span class={styles.repairLabel}>处理结果：</span>
                      <span>{getRepairResultName(repair.executionResult)}</span>
                    </div>
                    {repair.remark && (
                      <div>
                        <span class={styles.repairLabel}>备注：</span>
                        <span>{repair.remark}</span>
                      </div>
                    )}
                    {!!repair.fileList?.length && (
                      <div class={styles.repairFiles}>
                        {repair.fileList.map((file) => (
                          <Image key={file.id} width="52" height="52" fit="cover" src={file.path} onClick={() => previewImg(file)} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div class={styles.emptyRepair}>暂无处理记录</div>
            )}
          </div>
          {detail.value?.workOrderList.length ? (
            <div class={styles.cell_group}>
              <CellGroup inset class={styles.card}>
                <div class={styles.cardTitle}>关联工单</div>
                {detail.value?.workOrderList.map((order, index) => (
                  <Cell key={index} class={styles.orderItem}>
                    <div class={styles.orderInfo}>
                      <div onClick={() => goOrderPage(order)} class={styles.orderLink}>
                        {order.processInstanceName}
                      </div>
                      <Tag size="medium" class={[styles.tag, styles[getStatusTag(order.processInstanceStatus).type]]}>
                        {order.processInstanceStatus}
                      </Tag>
                    </div>
                  </Cell>
                ))}
              </CellGroup>
            </div>
          ) : (
            ""
          )}
        </div>
        {getRepairableException() && (
          <div class={styles.fixedFooter}>
            <Button block type="primary" onClick={() => goRepair(getRepairableException() as DailyRecordExceptionModel)}>
              处理
            </Button>
          </div>
        )}
      </div>
    );
  },
});
