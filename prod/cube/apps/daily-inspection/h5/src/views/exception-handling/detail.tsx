import dayjs from "dayjs";
import { Button, Cell, CellGroup, Divider, Image, showImagePreview, Tag } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { RecordToBusinessVOS } from "@ghcloud/cube-daily-inspection-service";

import { Bar } from "../../components/bar/bar";
import { useMetaTitle } from "../hooks/use-meta-title-hook";
import { cubeDailyInspectionService } from "@/api/server";

import styles from "./detail.module.less";

interface ExceptionDetail {
  targetName: string;
  id: string;
  taskName: string; // 异常通检对象名称
  address: string; // 具体地址
  errNames: string; // 异常明细
  repairStatus: "WAIT_REPAIR" | "CANCEL_REPAIR" | "REPAIRED"; // 处理状态：待修复、取消修复、已修复
  codeNum?: string; // 编号
  areaName?: string; // 区域名称
  assignee?: string; // 所属任务
  itemVOList?: {
    itemName: string;
    fileVOS: {
      businessKey: string;
      id: string;
      name: string;
      path: string;
      refCount: number;
      size: number;
      suffix: string;
      type: string;
    }[];
  }[]; // 异常明细
  inspectRecordRepairVOList?: RepairRecord[]; // 处理记录
  recordToBusinessVOS?: RelatedOrder[]; // 关联工单
}

interface RepairRecord {
  id: string;
  updateTime: string; // 处理时间
  userName: string; // 处理人
  repairStatus: string; // 处理结果
  content: string; // 处理说明
  fileList?: {
    businessKey: string;
    id: string;
    name: string;
    path: string;
    refCount: number;
    size: number;
    suffix: string;
    type: string;
  }[]; // 处理图片
}

interface RelatedOrder {
  id: string;
  businessId: string;
  businessExist: boolean;
  businessCategory: string;
  businessName: string;
  businessStatus: string;
}

/** 异常处理详情 */
export const ExceptionHandlingDetail = defineComponent({
  setup: () => {
    useMetaTitle("异常处理");
    const route = useRoute();
    const router = useRouter();
    const id = route.query.id as string;
    const detail = ref<ExceptionDetail>();
    const loading = ref(false);

    /**
     * 获取异常详情
     */
    const getExceptionDetail = async (): Promise<void> => {
      try {
        loading.value = true;
        // 实际应调用API获取详情
        const res = await cubeDailyInspectionService.getRepairDetail({ recordId: id });
        detail.value = res;
      } catch {
      } finally {
        loading.value = false;
      }
    };

    /**
     * 处理异常
     */
    const handleException = (): void => {
      router.push({ path: "/abnormal-inspection/handle", query: { id } });
    };

    /**
     * 获取状态标签样式
     */
    const getStatusTag = (status: string): { text: string; type: string } => {
      const statusMap = {
        WAIT_REPAIR: { text: "待修复", type: "warning" },
        CANCEL_REPAIR: { text: "取消修复", type: "gray" },
        REPAIRED: { text: "已修复", type: "success" },
        PROCESSING: { text: "处理中", type: "primary" },
        COMPLETED: { text: "已巡检", type: "success" },
      };
      return statusMap[status as keyof typeof statusMap] || { text: "未知状态", type: "default" };
    };

    onMounted(() => {
      getExceptionDetail();
    });
    const previewImg = (path: string): void => {
      showImagePreview([path]);
    };
    const goOrderPage = (record: RecordToBusinessVOS): void => {
      if (record.businessCategory === "HAZARD_GOVERNANCE") {
        window.location.href = `/apps/hazard-governance/h5/#/hazards?hazardId=${record.businessId}`;
        return;
      }
      window.location.href = `/streamengineH5/initiating-work-order?processType=HANDLING&businessType=${record.businessCategory}&processId=${record.businessId}`;
    };
    return (): VNode => (
      <div class={styles.wrapper}>
        <Bar />
        {detail.value && (
          <div class={styles.content}>
            {/* 异常信息 */}
            <CellGroup inset class={styles.card}>
              <div class={styles.cardTitle}>
                <div class={styles.title}>{detail.value.targetName}</div>
                <Tag size="medium" class={[styles.tag, styles[getStatusTag(detail.value.repairStatus).type]]}>
                  {getStatusTag(detail.value.repairStatus).text}
                </Tag>
              </div>
              <Divider style={{ margin: "10px 0" }} />
              <div class={styles.cardContent}>
                <div class={styles.item}>
                  <span class={styles.label}>具体地址：</span>
                  <span>{detail.value.areaName}</span>
                </div>
                <div class={styles.item}>
                  <span class={styles.label}>所属任务：</span>
                  <span>{detail.value.taskName}</span>
                </div>
                <div class={styles.item}>
                  <span class={styles.label}>异常明细：</span>
                  {detail.value.itemVOList && detail.value.itemVOList.length > 0 && (
                    <div class={styles.images}>
                      {detail.value.itemVOList.map((img, index) => (
                        <div class={styles.imageWrapper} key={index}>
                          <div style={{ marginBottom: "10px" }}> {img.itemName}</div>
                          {img.fileVOS && img.fileVOS.length > 0 && (
                            <div class={styles.imageWrapperMain}>
                              {img.fileVOS.map((item, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    previewImg(item.path);
                                  }}
                                  style={{ width: "50px", height: "50px", display: "flex" }}
                                >
                                  <Image src={item.path} alt="" width="50" height="50" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CellGroup>

            {/* 异常处理 */}
            <CellGroup inset class={styles.card}>
              <div class={styles.cardTitle}>异常处理</div>
              {detail.value.inspectRecordRepairVOList && detail.value.inspectRecordRepairVOList.length > 0 ? (
                <div class={styles.timeline}>
                  {detail.value.inspectRecordRepairVOList.map((record, index) => (
                    <div class={styles.timelineItem} key={index}>
                      <div class={styles.timeInfo}>
                        <div class={styles.time}>{dayjs(record.updateTime).format("YYYY-MM-DD HH:mm:ss")}</div>
                        <div class={styles.dot}></div>
                      </div>
                      <div class={styles.timeContent}>
                        <div class={styles.operator}>{record.userName}</div>
                        <div class={styles.result}>处理结果：{getStatusTag(record.repairStatus).text}</div>
                        <div class={styles.description}>说明：{record.content}</div>
                        <div class={styles.imageWrapperMain}>
                          {record.fileList?.map((item, index) => (
                            <div
                              key={index}
                              onClick={() => {
                                previewImg(item.path);
                              }}
                              style={{ width: "50px", height: "50px", display: "flex" }}
                            >
                              <Image src={item.path} alt="" width="50" height="50" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div class={styles.noData}>暂无处理记录</div>
              )}
            </CellGroup>

            {/* 关联工单 */}
            {detail.value.recordToBusinessVOS && detail.value.recordToBusinessVOS.length > 0 && (
              <CellGroup inset class={styles.card}>
                <div class={styles.cardTitle}>关联工单</div>
                {detail.value.recordToBusinessVOS.map((order, index) => (
                  <Cell key={index} class={styles.orderItem}>
                    <div class={styles.orderInfo}>
                      <div onClick={() => goOrderPage(order)} class={styles.orderLink}>
                        {order.businessName}
                      </div>
                      <Tag size="medium" class={[styles.tag, styles[getStatusTag(order.businessStatus).type]]}>
                        {order.businessStatus}
                      </Tag>
                    </div>
                  </Cell>
                ))}
              </CellGroup>
            )}

            {/* 底部按钮 */}
            {detail.value.repairStatus === "WAIT_REPAIR" && (
              <div class={styles.footer}>
                <Button type="primary" block onClick={handleException}>
                  去处理
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
});
