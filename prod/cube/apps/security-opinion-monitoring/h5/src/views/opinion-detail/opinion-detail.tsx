import { Empty, Tag, showToast } from "vant";
import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import type { OpinionVO } from "@ghcloud/cube-service-interface/security-opinion";

import { Bar } from "@/components/bar/bar";
import { PUSH_STATUS_LABEL, SENTIMENT_LABEL, WARNING_LEVEL_LABEL, WARNING_LEVEL_TAG } from "@/constants";
import { securityOpinionApi } from "@/services/security-opinion-api";
import { formatDateTime } from "@/utils/format-datetime";

import styles from "./opinion-detail.module.less";

function keywordList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,，、\s]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function detailValue(item: OpinionVO, keys: string[]): unknown {
  const raw = item as OpinionVO & Record<string, unknown>;
  return keys.map((key) => raw[key]).find((value) => value !== undefined && value !== null && value !== "");
}

function textValue(item: OpinionVO, keys: string[]): string {
  const value = detailValue(item, keys);
  return value === undefined ? "" : String(value);
}

export const OpinionDetailPage = defineComponent({
  name: "OpinionDetailPage",
  setup() {
    const route = useRoute();
    const detail = ref<OpinionVO | null>(null);
    const loading = ref(false);
    const missingId = ref(false);

    const loadDetail = async (): Promise<void> => {
      const id = String(route.params.id || "");
      if (!id) {
        missingId.value = true;
        return;
      }
      loading.value = true;
      try {
        detail.value = await securityOpinionApi.getOpinion(id);
      } catch {
        detail.value = null;
        showToast("舆情详情加载失败");
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      document.title = "舆情详情";
      void loadDetail();
    });

    const renderDetail = (item: OpinionVO): JSX.Element => {
      const keywords = keywordList((item as OpinionVO & { keywords?: unknown }).keywords);
      const author = textValue(item, ["author", "publisher", "publishUser", "creatorName"]);
      const relatedEventId = textValue(item, ["relatedEventId", "eventId", "eventCode"]);
      const url = textValue(item, ["url", "originalUrl", "sourceUrl", "link"]);
      const summary = textValue(item, ["summary", "abstract", "description"]);
      const content = textValue(item, ["content", "detail", "body"]);

      return (
        <div class={styles.content}>
          <section class={styles.card}>
            <div class={styles.title}>{item.title || "-"}</div>
            <div class={styles.metaGrid}>
              <span>来源：{item.source || "-"}</span>
              <span>作者：{author || "-"}</span>
              <span>情感：{SENTIMENT_LABEL[item.sentiment] || item.sentiment || "-"}</span>
              <span>热度：{item.heatIndex ?? "-"}</span>
              <span>预警等级：{item.warningLevelText || WARNING_LEVEL_LABEL[String(item.warningLevel ?? "").toUpperCase()] || "-"}</span>
              <span>推送状态：{item.pushStatusText || PUSH_STATUS_LABEL[String(item.pushStatus ?? "")] || "-"}</span>
              <span>采集时间：{formatDateTime(item.collectedAt)}</span>
              <span>预警时间：{formatDateTime(item.alertTime)}</span>
              <span>最后推送：{formatDateTime(item.lastPushTime)}</span>
              <span>关联事件：{relatedEventId || "-"}</span>
            </div>
            {item.warningLevel ? (
              <Tag class={styles.levelTag} type={WARNING_LEVEL_TAG[String(item.warningLevel).toUpperCase()] ?? "primary"} plain>
                {item.warningLevelText || WARNING_LEVEL_LABEL[String(item.warningLevel).toUpperCase()] || item.warningLevel}
              </Tag>
            ) : null}
          </section>
          <section class={styles.card}>
            <div class={styles.sectionTitle}>关键词</div>
            <div class={styles.keywordLine}>
              {keywords.length ? keywords.map((keyword) => <Tag key={keyword}>{keyword}</Tag>) : <span>-</span>}
            </div>
          </section>
          <section class={styles.card}>
            <div class={styles.sectionTitle}>摘要</div>
            <pre class={styles.article}>{summary || "-"}</pre>
          </section>
          <section class={styles.card}>
            <div class={styles.sectionTitle}>正文内容</div>
            <pre class={styles.article}>{content || summary || "-"}</pre>
          </section>
          {url ? (
            <section class={styles.card}>
              <div class={styles.sectionTitle}>原文链接</div>
              <div class={styles.linkText}>{url}</div>
            </section>
          ) : null}
        </div>
      );
    };

    return (): JSX.Element => (
      <div class={styles.page}>
        <Bar name="舆情详情" isShowRight={false} />
        {loading.value ? (
          <div class={styles.empty}>加载中...</div>
        ) : detail.value ? (
          renderDetail(detail.value)
        ) : missingId.value ? (
          <Empty description="缺少舆情ID，无法查看详情" />
        ) : (
          <Empty description="暂无舆情详情" />
        )}
      </div>
    );
  },
});
