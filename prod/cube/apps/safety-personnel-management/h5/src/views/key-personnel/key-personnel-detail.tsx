import { Button, Cell, CellGroup, Empty, Image, List, Tag, showConfirmDialog, showToast } from "vant";
import { defineComponent, onMounted, ref, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { KeyPersonDetailVO, KeyPersonReportVO } from "@ghcloud/cube-service-interface/safety-personnel";
import { deleteKeyPerson, getKeyPersonDetail, pageKeyPersonReports } from "@ghcloud/cube-services-client/safety-personnel.client";

import { Bar } from "@/components/bar/bar";
import { KEY_PERSON_RISK_LEVEL_LABEL } from "@/constants";
import { useAuthRequest } from "@/hooks/use-auth-request";
import { getPageRecords, getPageTotal, maskPhone, pickFirstText } from "@/utils";
import { toOssPreviewPath } from "@/utils/file-url";
import { formatDateTime } from "@/utils/format-datetime";

import styles from "./key-personnel.module.less";

function riskTagType(level?: string): "danger" | "warning" | "primary" {
  if (level === "HIGH") return "danger";
  if (level === "MEDIUM") return "warning";
  return "primary";
}

const REPORT_PAGE_SIZE = 10;

export const KeyPersonnelDetailPage = defineComponent({
  name: "KeyPersonnelDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
    const id = rawId == null || rawId === "" ? Number.NaN : Number(rawId);
    const detail = ref<KeyPersonDetailVO | null>(null);
    const reports = ref<KeyPersonReportVO[]>([]);
    const loadingReports = ref(false);
    const finishedReports = ref(false);
    const reportPageNumber = ref(1);
    const reportTotal = ref(0);
    const validId = Number.isFinite(id) && id > 0;

    const loadDetail = async (): Promise<void> => {
      if (!validId) return;
      detail.value = await useAuthRequest(() => getKeyPersonDetail(id));
    };

    const loadReports = async (reset = false): Promise<void> => {
      if (!validId || loadingReports.value) return;
      if (reset) {
        reportPageNumber.value = 1;
        reportTotal.value = 0;
        reports.value = [];
        finishedReports.value = false;
      }
      loadingReports.value = true;
      try {
        const result = await useAuthRequest(() =>
          pageKeyPersonReports({
            personId: id,
            pageNumber: reportPageNumber.value,
            pageSize: REPORT_PAGE_SIZE,
          }),
        );
        const records = getPageRecords<KeyPersonReportVO>(result);
        reportTotal.value = getPageTotal(result);
        reports.value = reset ? records : [...reports.value, ...records];
        reportPageNumber.value += 1;
        finishedReports.value = (reportTotal.value > 0 && reports.value.length >= reportTotal.value) || records.length < REPORT_PAGE_SIZE;
      } finally {
        loadingReports.value = false;
      }
    };

    const deleteRecord = async (): Promise<void> => {
      if (!validId) return;
      await showConfirmDialog({
        title: "删除重点人员",
        message: `确认删除 ${detail.value?.name ?? "该人员"}？`,
      });
      await useAuthRequest(() => deleteKeyPerson(id));
      showToast("已删除");
      router.back();
    };

    onMounted(() => {
      if (!validId) {
        showToast("重点人员参数无效");
        router.back();
        return;
      }
      void loadDetail();
      void loadReports(true);
    });

    const renderAttachments = (): VNode => (
      <div class={styles.attachments}>
        {(detail.value?.personAttachmentFiles ?? []).length ? (
          detail.value!.personAttachmentFiles!.map((file) => (
            <a class={styles.fileLink} href={toOssPreviewPath(file)} target="_blank" rel="noreferrer" key={file.id}>
              {file.name || file.id}
            </a>
          ))
        ) : (
          <span class={styles.emptyText}>暂无附件</span>
        )}
      </div>
    );

    return (): VNode => (
      <div class={styles.detailPage}>
        <Bar name="重点人员详情" />
        <div class={styles.detailHero}>
          <div class={styles.photoBox}>
            {detail.value?.photoFile ? (
              <Image width="72" height="72" fit="cover" radius="8" src={toOssPreviewPath(detail.value.photoFile)} />
            ) : (
              <span>无照片</span>
            )}
          </div>
          <div class={styles.heroMain}>
            <div class={styles.code}>{detail.value?.personCode || "-"}</div>
            <div class={styles.name}>{detail.value?.name || "-"}</div>
            <div class={styles.phone}>{maskPhone(detail.value?.phone)}</div>
          </div>
          {detail.value?.riskLevel ? (
            <Tag type={riskTagType(detail.value.riskLevel)}>
              {detail.value.riskLevelName || KEY_PERSON_RISK_LEVEL_LABEL[detail.value.riskLevel]}
            </Tag>
          ) : null}
        </div>
        <CellGroup inset>
          <Cell title="身份证" value={pickFirstText(detail.value?.idCard)} />
          <Cell title="所在区域" value={pickFirstText(detail.value?.areaName)} />
          <Cell title="监管人员" value={pickFirstText(detail.value?.supervisorName)} />
          <Cell title="监管原因" label={pickFirstText(detail.value?.supervisionReason)} />
        </CellGroup>
        <div class={styles.section}>
          <div class={styles.sectionTitle}>相关附件</div>
          {renderAttachments()}
        </div>
        <div class={styles.section}>
          <div class={styles.sectionTitle}>监管记录</div>
          <List
            v-model:loading={loadingReports.value}
            finished={finishedReports.value}
            finishedText={reports.value.length ? "没有更多了" : ""}
            onLoad={() => void loadReports()}
          >
            {reports.value.length ? (
              reports.value.map((report) => (
                <div class={styles.reportCard} key={report.id}>
                  <div class={styles.reportContent}>{report.content}</div>
                  <div class={styles.reportMeta}>
                    {pickFirstText(report.reporterName)} · {formatDateTime(report.reportTime)}
                  </div>
                  {(report.reportAttachmentFiles ?? []).map((file) => (
                    <a class={styles.fileLink} href={toOssPreviewPath(file)} target="_blank" rel="noreferrer" key={file.id}>
                      {file.name || file.id}
                    </a>
                  ))}
                </div>
              ))
            ) : (
              <Empty description="暂无监管记录" />
            )}
          </List>
        </div>
        <div class={styles.bottomActions}>
          <Button
            block
            type="primary"
            disabled={!validId}
            onClick={() => void router.push({ path: "/key-personnel/report", query: { id, name: detail.value?.name } })}
          >
            上报
          </Button>
          <Button block type="primary" disabled={!validId} onClick={() => void router.push({ path: "/key-personnel/form", query: { id } })}>
            编辑
          </Button>
          <Button block type="danger" disabled={!validId} onClick={() => void deleteRecord()}>
            删除
          </Button>
        </div>
      </div>
    );
  },
});
