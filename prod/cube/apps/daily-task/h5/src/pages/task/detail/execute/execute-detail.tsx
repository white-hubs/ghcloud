import { kkFilePreview } from "../../../../../../../../basic/cube-utils/src/file-preview";
import { imgType, typeList } from "../utils";
import styles from "./execute.module.less";
import { cubeDailyTaskService } from "@/api/server";
import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type { StandardResultModel, workOrderList } from "@ghcloud/cube-daily-task-service";
import type { FileState } from "@ghcloud/cube-file-service";
import dayjs from "dayjs";
import { showImagePreview, showNotify, Image, CellGroup, Cell, Tag } from "vant";
import { defineComponent, onMounted, reactive, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

export const TaskExecuteDetail = defineComponent({
  name: "TaskExecuteDetail",
  setup: () => {
    const router = useRouter();
    const route = useRoute();
    const targetId = route.query.targetId as string;
    const taskId = route.query.taskId as string;
    const handleTime = route.query.handleTime as string;
    const handlerName = route.query.handlerName as string;
    const detail = ref<StandardResultModel>();
    const getDetail = async () => {
      const params = {
        targetId,
        taskId,
      };
      const data = await cubeDailyTaskService.getDailyTaskRecordTargetDetail(params);
      detail.value = data;
    };
    const previewImg = (files: FileState): void => {
      // ShowImagePreview([path])
      const item = files;
      const ext = (item.type ?? "").toLowerCase();

      if (["zip", "rar"].includes(ext)) {
        showNotify({ type: "warning", message: "暂不支持该文件类型的预览, 请到电脑端查看" });
        return;
      }

      // Const isVideoFile = ['mp4', 'avi', 'wmv', 'mov', 'mkv', 'flv', 'webm'].includes(ext)
      // If (isVideoFile && isIOS()) {
      //   OpenVideoPreview(files)
      //   Return
      // }

      if (typeList.includes(ext)) {
        kkFilePreview(item);
      } else {
        const img = imgType.includes((files.type ?? "").toLowerCase());
        const index = 0;
        if (img && files.path) {
          showImagePreview([files.path], index);
        }
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
    onMounted(() => {
      getDetail();
    });
    return (): VNode => (
      <div class={styles.detail_main}>
        <CubeNavBar showBack title="处理详情" />
        <div class={styles.wrapper}>
          {detail.value?.standardList?.map((item, index) => (
            <>
              <div class={styles.title}>{item.standardName}</div>
              <div>
                {item.itemList.map((list, index) => (
                  <div class={styles.result_content}>
                    <div class={styles.name}>
                      {index + 1}、{list.itemName}
                    </div>
                    <div>处理结果：{list.resultName}</div>
                    {list.remark && <div>处理备注：{list.remark}</div>}
                    {list.fileList.length ? (
                      <div>
                        <div>附件：</div>
                        {(list.fileList ?? []).map((item) => (
                          <div
                            key={item.id}
                            class={styles.file_item}
                            onClick={() => {
                              previewImg(item);
                            }}
                          >
                            {/* <div class={styles.file_icon}><Icon name='description' /></div> */}
                            <Image
                              class={styles.file_icon}
                              style={{ width: "50px", height: "50px" }}
                              src={item.path}
                              alt=""
                              width="50"
                              height="50"
                            />
                            <div class={styles.file_meta}>
                              <div class={styles.file_name}>{item.name}</div>
                              <div class={styles.file_info}>
                                <span>{(Number(item.size) / 1024).toFixed(2)}KB</span>
                                <span class={styles.dot}>·</span>
                                {/* <span>dfdsf</span><span class={styles.dot}>·</span> */}
                                <span>{dayjs(new Date(item.createTime ?? "")).format("YYYY-MM-DD HH:mm:ss")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </div>
            </>
          ))}
          <br />
          <div>处理人员：{handlerName}</div>
          <div>处理时间：{dayjs(handleTime).format("YYYY-MM-DD HH:mm:ss")}</div>
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
                        {getStatusTag(order.processInstanceStatus).text}
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
      </div>
    );
  },
});
