import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout, FileUpload } from "@ghcloud/cube-app-design";
import { GrainAlertStatus, type GrainAlertDetail, type GrainMetricValue } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { getIntelligentGrainAlert, submitIntelligentGrainDisposal } from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Card, Empty, Space, Spin, Textarea, message } from "@ghcloud/cube-ui";

import { ALERT_STATUS_LABEL, formatMetric, formatRealReason, formatTime, renderAlertStatus } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

const FILE_SCENE_CODE = "INTELLIGENT_GRAIN::ALARM";

type UploadedFile = {
  id?: string | number;
  fileId?: string | number;
  name?: string;
  fileName?: string;
};

const readFileIds = (files: UploadedFile[]): string[] => files.map((file) => String(file.id ?? file.fileId ?? "")).filter(Boolean);

export const IntelligentGrainAlertDisposal = defineComponent({
  name: "IntelligentGrainAlertDisposal",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const submitting = ref(false);
    const detail = ref<GrainAlertDetail>();
    const disposalContent = ref("");
    const photoFiles = ref<UploadedFile[]>([]);
    const attachmentFiles = ref<UploadedFile[]>([]);
    const alertId = computed(() => String(route.params.id ?? ""));
    const canSubmit = computed(
      () => detail.value?.status === GrainAlertStatus.PROCESSING || detail.value?.status === GrainAlertStatus.REVIEWING,
    );

    const load = async (): Promise<void> => {
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getIntelligentGrainAlert(alertId.value));
        disposalContent.value = canSubmit.value ? (detail.value.disposal?.content ?? "") : "";
      } catch (error) {
        message.error((error as Error).message || "加载处置详情失败");
      } finally {
        loading.value = false;
      }
    };

    const submit = async (): Promise<void> => {
      if (!disposalContent.value.trim()) {
        message.warning("请填写处置内容");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          submitIntelligentGrainDisposal(alertId.value, {
            disposalContent: disposalContent.value.trim(),
            adoptAi: false,
            photoFileIds: readFileIds(photoFiles.value),
            attachmentFileIds: readFileIds(attachmentFiles.value),
          }),
        );
        message.success("已提交处置结果");
        await router.push({ name: "intelligent-grain-alert-acceptance", params: { id: alertId.value } });
      } catch (error) {
        message.error((error as Error).message || "提交处置结果失败");
      } finally {
        submitting.value = false;
      }
    };

    onMounted(() => {
      void load();
    });

    const renderSnapshot = (snapshot?: Record<string, GrainMetricValue>): JSX.Element => (
      <div class="ig-alert-metric-row">
        {Object.entries(snapshot ?? {}).map(([key, metric]) => (
          <div key={key}>
            <span>{metric.metricName || key}</span>
            <strong class={metric.status === "ALARM" ? "is-danger" : ""}>{formatMetric(metric)}</strong>
            <em>{metric.status === "ALARM" ? "触发告警" : "正常"}</em>
          </div>
        ))}
      </div>
    );

    const slots = {
      "layout-header": (): JSX.Element => <span class="ig-header-tip">填写处置记录、上传现场材料并提交复查。</span>,
      "layout-content": (): JSX.Element => (
        <Spin spinning={loading.value}>
          <div class="ig-page ig-section-stack ig-alert-detail-page">
            {detail.value ? (
              <>
                <section class="ig-alert-prototype-head">
                  <div class="ig-alert-hero__left">
                    <div class="ig-alert-hero__title">
                      <span class={["ig-alert-level", detail.value.alertInfo.level <= 2 ? "is-danger" : "is-warning"]}>
                        {detail.value.alertInfo.level}级告警
                      </span>
                      <strong>{detail.value.alertInfo.alertTypeName}</strong>
                    </div>
                    <div class="ig-alert-hero__meta">
                      <span>告警时间：{formatTime(detail.value.alertInfo.triggeredAt)}</span>
                      <span>
                        仓房：{detail.value.alertInfo.warehouseName}（{detail.value.alertInfo.grainType || "--"}）
                      </span>
                    </div>
                  </div>
                  <div class="ig-alert-hero__right">
                    <div>
                      <span>告警类型：</span>
                      <strong>{detail.value.alertInfo.alertTypeName}</strong>
                    </div>
                    <div>
                      <span>触发值/阈值：</span>
                      <strong>
                        {detail.value.alertInfo.currentValueText} / {detail.value.alertInfo.thresholdText || "--"}
                      </strong>
                    </div>
                  </div>
                  <div class="ig-alert-hero__status">{renderAlertStatus(detail.value.status)}</div>
                </section>

                <Card title="触发时刻数据快照">{renderSnapshot(detail.value.snapshot)}</Card>

                <section class="ig-disposal-judge-strip">
                  <div>
                    <strong>已判定</strong>
                    <span>实报</span>
                    <em>
                      实报原因：
                      {detail.value.disposal?.realReason || detail.value.judgement?.reason
                        ? formatRealReason(detail.value.disposal?.realReason || detail.value.judgement?.reason)
                        : detail.value.alertInfo.alertTypeName}
                    </em>
                  </div>
                  <span>
                    判定人：{detail.value.logs?.find((item) => item.action === "JUDGE_REAL")?.operatorName || "系统"} ·{" "}
                    {formatTime(
                      detail.value.judgement?.judgedAt ?? detail.value.logs?.find((item) => item.action === "JUDGE_REAL")?.operatedAt,
                    )}
                  </span>
                </section>

                <Card title="AI处置建议（仅供参考）" class="ig-ai-advice-card">
                  <div>
                    <strong>{detail.value.aiSuggestion?.summary ?? "暂无建议"}</strong>
                    {(detail.value.aiSuggestion?.suggestions ?? []).map((suggestion, index) => (
                      <span key={`${suggestion}-${index}`}>{suggestion}</span>
                    ))}
                  </div>
                </Card>

                <Card title="处置记录" class={canSubmit.value ? "ig-dashed-card" : ""}>
                  <div class="ig-disposal-form">
                    <label class="ig-field-block ig-disposal-content-field">
                      <span>处置内容：</span>
                      <Textarea v-model:value={disposalContent.value} rows={5} disabled={!canSubmit.value} />
                    </label>
                    <div class="ig-alert-upload-row">
                      <span>现场照片：</span>
                      <FileUpload
                        value={photoFiles.value}
                        onUpdate:value={(value: UploadedFile[]) => {
                          photoFiles.value = value ?? [];
                        }}
                        multiple
                        showText
                        maxCount={6}
                        type="picture-card"
                        size={92}
                        sceneCode={FILE_SCENE_CODE}
                        customText="支持png、jpg、jpeg、webp"
                        typeList={[".png", ".jpg", ".jpeg", ".webp"]}
                        accept="image/*"
                      />
                    </div>
                    <div class="ig-alert-upload-row">
                      <span>方案附件：</span>
                      <FileUpload
                        value={attachmentFiles.value}
                        onUpdate:value={(value: UploadedFile[]) => {
                          attachmentFiles.value = value ?? [];
                        }}
                        multiple
                        showText
                        maxCount={6}
                        type="text"
                        sceneCode={FILE_SCENE_CODE}
                        customText="支持pdf、doc、docx、xls、xlsx"
                        typeList={[".pdf", ".doc", ".docx", ".xls", ".xlsx"]}
                      />
                    </div>
                    {!canSubmit.value ? (
                      <div class="ig-form-actions">
                        <span class="ig-muted-text">
                          当前状态为 {ALERT_STATUS_LABEL[detail.value.status] ?? detail.value.status}，不可提交处置。
                        </span>
                      </div>
                    ) : null}
                  </div>
                </Card>

                <Card title="操作日志">
                  <div class="ig-alert-log">
                    {(detail.value.logs ?? []).map((item) => (
                      <div key={`${item.action}-${item.operatedAt}`}>
                        <span>{formatTime(item.operatedAt)}</span>
                        <strong>
                          {item.operatorName || "系统"}：{item.remark || item.action}
                        </strong>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Empty description="暂无处置详情" />
            )}
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => router.push({ name: "intelligent-grain-alerts" })}>返回告警列表</Button>
          <Button onClick={() => router.push({ name: "intelligent-grain-alert-detail", params: { id: alertId.value } })}>告警详情</Button>
          <Button onClick={load}>刷新</Button>
          {canSubmit.value ? (
            <Button type="primary" loading={submitting.value} onClick={submit}>
              提交处置结果
            </Button>
          ) : null}
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="处置详情" v-slots={slots} />;
  },
});
