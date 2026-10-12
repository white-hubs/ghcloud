import { computed, defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import { GrainAlertStatus, type GrainAlertDetail, type GrainMetricValue } from "@ghcloud/cube-service-interface/intelligent-grain";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import {
  acceptIntelligentGrainAlert,
  getIntelligentGrainAlert,
  rejectIntelligentGrainAlert,
} from "@ghcloud/cube-services-client/intelligent-grain.client";
import { Button, Card, Empty, Modal, Select, Space, Spin, Textarea, message } from "@ghcloud/cube-ui";

import { ALERT_STATUS_LABEL, formatMetric, formatRealReason, formatTime, renderAlertStatus } from "@/views/shared/view-utils";

import "@/views/shared/intelligent-grain.less";

export const IntelligentGrainAlertAcceptance = defineComponent({
  name: "IntelligentGrainAlertAcceptance",
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const submitting = ref(false);
    const rejectModalVisible = ref(false);
    const detail = ref<GrainAlertDetail>();
    const rootCauseTag = ref("OTHER");
    const conclusion = ref("");
    const rejectReason = ref("");
    const alertId = computed(() => String(route.params.id ?? ""));
    const canAccept = computed(() => detail.value?.status === GrainAlertStatus.CHECKING);
    const disposalHistory = computed(() => detail.value?.disposalHistory ?? []);
    const latestDisposal = computed(() => disposalHistory.value[disposalHistory.value.length - 1] ?? detail.value?.disposal);
    const reviewBeforeMetrics = computed(() => latestDisposal.value?.reviewBefore ?? detail.value?.snapshot ?? {});
    const reviewAfterMetrics = computed(() => latestDisposal.value?.reviewAfter ?? {});
    const rootCauseOptions = computed(() =>
      (detail.value?.acceptance?.rootCauseTagOptions ?? [{ code: "OTHER", label: "其他" }]).map((item) => ({
        label: item.label,
        value: item.code,
      })),
    );

    const load = async (): Promise<void> => {
      loading.value = true;
      try {
        detail.value = await useAuthRequest(() => getIntelligentGrainAlert(alertId.value));
        rootCauseTag.value = detail.value.acceptance?.rootCauseTag ?? rootCauseOptions.value[0]?.value ?? "OTHER";
        conclusion.value = detail.value.acceptance?.conclusion ?? "";
        rejectReason.value = detail.value.acceptance?.rejectReason ?? "";
      } catch (error) {
        message.error((error as Error).message || "加载验收详情失败");
      } finally {
        loading.value = false;
      }
    };

    const pass = async (): Promise<void> => {
      if (!conclusion.value.trim()) {
        message.warning("请填写验收结论");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          acceptIntelligentGrainAlert(alertId.value, { conclusion: conclusion.value, rootCauseTag: rootCauseTag.value }),
        );
        message.success("已验收通过");
        await load();
      } catch (error) {
        message.error((error as Error).message || "验收通过失败");
      } finally {
        submitting.value = false;
      }
    };

    const reject = async (): Promise<void> => {
      if (!rejectReason.value.trim()) {
        message.warning("请填写验收不通过原因");
        return;
      }
      submitting.value = true;
      try {
        await useAuthRequest(() =>
          rejectIntelligentGrainAlert(alertId.value, { rejectReason: rejectReason.value, rootCauseTag: rootCauseTag.value }),
        );
        message.success("已驳回");
        rejectModalVisible.value = false;
        await load();
      } catch (error) {
        message.error((error as Error).message || "驳回失败");
      } finally {
        submitting.value = false;
      }
    };

    const openRejectModal = (): void => {
      rejectReason.value = "";
      rejectModalVisible.value = true;
    };

    const closeRejectModal = (): void => {
      rejectModalVisible.value = false;
    };

    onMounted(() => {
      void load();
    });

    const renderMetricCards = (metrics?: Record<string, GrainMetricValue>): JSX.Element => (
      <div class="ig-alert-metric-row">
        {Object.entries(metrics ?? {}).map(([key, metric]) => (
          <div key={key}>
            <span>{metric.metricName || key}</span>
            <strong class={metric.status === "ALARM" ? "is-danger" : "is-success"}>{formatMetric(metric)}</strong>
            <em>{formatTime(metric.collectTime)}</em>
          </div>
        ))}
      </div>
    );

    const renderRejectModal = (): JSX.Element => (
      <Modal
        title="验收不通过"
        visible={rejectModalVisible.value}
        width="520px"
        okText="确认退回"
        cancelText="取消"
        confirmLoading={submitting.value}
        destroyOnClose
        onCancel={closeRejectModal}
        onOk={() => {
          void reject();
        }}
        onUpdate:visible={(visible: boolean) => {
          rejectModalVisible.value = visible;
        }}
      >
        <div class="ig-reject-modal">
          <label class="ig-field-block">
            <span>
              不通过原因：<i>*</i>
            </span>
            <Textarea v-model:value={rejectReason.value} rows={4} placeholder="填写不通过原因（必填），将退回处置中重新处置" />
          </label>
          <p>提交后将退回处置中，需重新处置、复查、验收。</p>
        </div>
      </Modal>
    );

    const slots = {
      "layout-header": (): JSX.Element => <span class="ig-header-tip">复核处置过程、复查指标并提交验收结论。</span>,
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
                    <div>
                      <span>提交时间：</span>
                      <strong>{formatTime(latestDisposal.value?.submittedAt)}</strong>
                    </div>
                  </div>
                  <div class="ig-alert-hero__status">{renderAlertStatus(detail.value.status)}</div>
                </section>

                <Card title="处置过程">
                  <div class="ig-disposal-history">
                    {disposalHistory.value.length > 0 ? (
                      disposalHistory.value.map((item, index) => (
                        <div key={item.id ?? `${index}-${item.submittedAt}`}>
                          <span>
                            第 {index + 1} 次处置 · {formatTime(item.submittedAt)}
                          </span>
                          <strong>{item.content || "--"}</strong>
                          <em>实报原因：{formatRealReason(item.realReason || detail.value?.judgement?.reason)}</em>
                        </div>
                      ))
                    ) : (
                      <span class="ig-muted-text">暂无处置记录</span>
                    )}
                  </div>
                </Card>

                <Card title="粮情复查">
                  <div class="ig-review-compare">
                    <section>
                      <strong>处置前</strong>
                      {renderMetricCards(reviewBeforeMetrics.value)}
                    </section>
                    <section>
                      <strong>复查时</strong>
                      {Object.keys(reviewAfterMetrics.value).length > 0 ? (
                        renderMetricCards(reviewAfterMetrics.value)
                      ) : (
                        <span class="ig-muted-text">暂无复查数据</span>
                      )}
                    </section>
                    <section>
                      <strong>目标</strong>
                      <div class="ig-alert-metric-row">
                        <div>
                          <span>阈值</span>
                          <strong>{detail.value.alertInfo.thresholdText || "--"}</strong>
                          <em>规则配置</em>
                        </div>
                      </div>
                    </section>
                  </div>
                </Card>

                <Card title="验收判定" class={canAccept.value ? "ig-dashed-card" : ""}>
                  <Space direction="vertical" size="middle" class="ig-acceptance-form">
                    <label class="ig-field-block">
                      <span>
                        验收结论：<i>*</i>
                      </span>
                      <Textarea v-model:value={conclusion.value} rows={3} placeholder="填写验收结论（必填）" disabled={!canAccept.value} />
                    </label>
                    <label class="ig-inline-field ig-required-inline">
                      <span>
                        根因标签：<i>*</i>
                      </span>
                      <Select
                        value={rootCauseTag.value}
                        options={rootCauseOptions.value}
                        style={{ width: "240px" }}
                        disabled={!canAccept.value}
                        onChange={(value: string) => (rootCauseTag.value = value)}
                      />
                    </label>
                    {!canAccept.value ? (
                      <span class="ig-muted-text">
                        当前状态为 {ALERT_STATUS_LABEL[detail.value.status] ?? detail.value.status}，不可提交验收。
                      </span>
                    ) : null}
                  </Space>
                </Card>
              </>
            ) : (
              <Empty description="暂无验收详情" />
            )}
          </div>
          {renderRejectModal()}
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <Space>
          <Button onClick={() => router.push({ name: "intelligent-grain-alerts" })}>返回告警列表</Button>
          <Button onClick={() => router.push({ name: "intelligent-grain-alert-disposal", params: { id: alertId.value } })}>处置详情</Button>
          <Button onClick={load}>刷新</Button>
          {canAccept.value ? (
            <>
              <Button type="primary" loading={submitting.value} onClick={pass}>
                验收通过
              </Button>
              <Button danger loading={submitting.value} onClick={openRejectModal}>
                验收不通过
              </Button>
            </>
          ) : null}
        </Space>
      ),
    };

    return (): JSX.Element => <CubeLayout title="验收详情" v-slots={slots} />;
  },
});
