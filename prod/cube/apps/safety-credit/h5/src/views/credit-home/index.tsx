import { Empty } from "vant";
import { computed, defineComponent, onMounted, ref } from "vue";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type {
  SafetyCreditArchiveDetailVO,
  SafetyCreditBehaviorVO,
  SafetyCreditBenefitRecordVO,
  SafetyCreditCheckQualityVO,
  SafetyCreditDeductTopVO,
  SafetyCreditMerchantScoreSummaryVO,
  SafetyCreditScoreTrendPointVO,
} from "@ghcloud/cube-safety-credit-service";

import { cubeSafetyCreditService } from "@/api/server";
import {
  CREDIT_HOME_BEHAVIOR_TABS,
  behaviorKindLabel,
  behaviorSource,
  behaviorSubtype,
  benefitRecordStatusLabel,
  checkExecutionStatusLabel,
  checkExecutionStatusTone,
  creditGradeClass,
  creditGradeLabel,
  industryTypeLabel,
  isBonusBehavior,
  isPenaltyBehavior,
  qualityStatusLabel,
  qualityStatusTone,
  type CreditHomeBehaviorTab,
} from "@/constants/safety-credit-enums";
import { getCurrentUserId } from "@/utils/current-user";
import { bonusScoreText, deductScoreText, displayText, formatDate, formatShortDateTime, scoreClass, signedScore } from "@/utils/format";

import "./credit-home.less";

function trendChange(points?: SafetyCreditScoreTrendPointVO[]): number | undefined {
  if (points === undefined || points.length < 2) {
    return undefined;
  }
  const latest = points[points.length - 1]?.score;
  const previous = points[points.length - 2]?.score;
  if (latest === undefined || previous === undefined) {
    return undefined;
  }
  return latest - previous;
}

function trendChangeText(value?: number): string {
  if (value === undefined) {
    return "--";
  }
  if (value > 0) {
    return `↑${value}`;
  }
  if (value < 0) {
    return `↓${Math.abs(value)}`;
  }
  return "持平";
}

function buildTrendPoints(points: SafetyCreditScoreTrendPointVO[]): string {
  const scores = points.map((item) => item.score ?? 0);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const range = maxScore - minScore || 1;
  return points
    .map((item, index) => {
      const x = points.length === 1 ? 150 : (index / (points.length - 1)) * 290 + 5;
      const y = 70 - (((item.score ?? minScore) - minScore) / range) * 50;
      return `${x},${y}`;
    })
    .join(" ");
}

function deductTopText(items?: SafetyCreditDeductTopVO[]): string {
  if (items === undefined || items.length === 0) {
    return "--";
  }
  return items.map((item) => `${displayText(item.name)}(${displayText(item.score)})`).join(" · ");
}

export const CreditHome = defineComponent({
  name: "CreditHome",
  setup: () => {
    const loading = ref(false);
    const merchantId = ref<string>();
    const credit = ref<SafetyCreditArchiveDetailVO | null>(null);
    const scoreSummary = ref<SafetyCreditMerchantScoreSummaryVO>({});
    const behaviors = ref<SafetyCreditBehaviorVO[]>([]);
    const checkRecords = ref<SafetyCreditCheckQualityVO[]>([]);
    const benefitRecords = ref<SafetyCreditBenefitRecordVO[]>([]);
    const activeBehaviorTab = ref<CreditHomeBehaviorTab>("all");

    const filteredBehaviors = computed(() => {
      if (activeBehaviorTab.value === "penalty") {
        return behaviors.value.filter(isPenaltyBehavior);
      }
      if (activeBehaviorTab.value === "bonus") {
        return behaviors.value.filter(isBonusBehavior);
      }
      return behaviors.value;
    });

    function resetPageData(): void {
      credit.value = null;
      scoreSummary.value = {};
      behaviors.value = [];
      checkRecords.value = [];
      benefitRecords.value = [];
      activeBehaviorTab.value = "all";
    }

    async function load(): Promise<void> {
      resetPageData();
      loading.value = true;
      try {
        const currentUserId = await getCurrentUserId();
        merchantId.value = currentUserId;
        if (currentUserId === undefined) {
          return;
        }
        const [archiveResult, scoreResult, behaviorResult, checkResult, benefitResult] = await Promise.allSettled([
          cubeSafetyCreditService.getArchive(currentUserId),
          cubeSafetyCreditService.getMerchantScoreSummary(currentUserId),
          cubeSafetyCreditService.pageBehaviors({ merchantId: currentUserId, pageNumber: 1, pageSize: 20 }),
          cubeSafetyCreditService.pageCheckQuality({ merchantId: currentUserId, pageNumber: 1, pageSize: 3 }),
          cubeSafetyCreditService.pageBenefitRecords({ merchantId: currentUserId, pageNumber: 1, pageSize: 5 }),
        ] as const);
        if (archiveResult.status === "fulfilled") {
          credit.value = archiveResult.value;
          behaviors.value = archiveResult.value.recentBehaviors ?? [];
        }
        if (scoreResult.status === "fulfilled") {
          scoreSummary.value = scoreResult.value;
        }
        if (behaviorResult.status === "fulfilled") {
          behaviors.value = behaviorResult.value.records ?? behaviors.value;
        }
        if (checkResult.status === "fulfilled") {
          checkRecords.value = checkResult.value.records ?? [];
        }
        if (benefitResult.status === "fulfilled") {
          benefitRecords.value = benefitResult.value.records ?? [];
        }
      } finally {
        loading.value = false;
      }
    }

    function renderTrend(): JSX.Element {
      const points = scoreSummary.value.scoreTrend ?? [];
      if (points.length === 0) {
        return <div class="trend-empty">暂无趋势数据</div>;
      }
      return (
        <>
          <svg class="trend-chart" width="100%" height="80" viewBox="0 0 300 80" role="img">
            <polyline fill="none" stroke="#3b82f6" stroke-width="2" points={buildTrendPoints(points)} />
            <line x1="0" y1="65" x2="300" y2="65" stroke="#f0f0f0" stroke-width="1" />
          </svg>
          <div class="trend-labels">
            {points.map((item, index) => (
              <span key={`${item.month ?? "month"}-${index}`}>{displayText(item.month)}</span>
            ))}
          </div>
        </>
      );
    }

    function renderBehaviorRows(): JSX.Element {
      if (filteredBehaviors.value.length === 0) {
        return <Empty description="暂无行为记录" />;
      }
      return (
        <div class="behavior-list">
          {filteredBehaviors.value.map((record) => (
            <article class="behavior-row" key={String(record.id)}>
              <div class="behavior-main">
                <div class="behavior-title-line">
                  <span class={["behavior-badge", isPenaltyBehavior(record) ? "violation" : "bonus"]}>{behaviorKindLabel(record)}</span>
                  <span class="behavior-title">{behaviorSubtype(record)}</span>
                </div>
                <div class="behavior-meta">
                  {behaviorSource(record)} · {formatShortDateTime(record.occurredTime)}
                </div>
              </div>
              <strong class={["behavior-score", scoreClass(record.scoreChange)]}>{signedScore(record.scoreChange)}</strong>
            </article>
          ))}
        </div>
      );
    }

    function renderCheckRows(): JSX.Element {
      if (checkRecords.value.length === 0) {
        return <Empty description="暂无自查记录" />;
      }
      return (
        <div class="compact-list">
          {checkRecords.value.map((record) => (
            <article class="compact-row" key={String(record.executionId)}>
              <strong>{displayText(record.checkName)}</strong>
              <span>提交时间：{formatShortDateTime(record.submitTime)}</span>
              <div class="pill-group">
                <span class={["tiny-pill", checkExecutionStatusTone(record.executionStatus)]}>
                  {checkExecutionStatusLabel(record.executionStatus)}
                </span>
                <span class={["tiny-pill", qualityStatusTone(record.qualityStatus)]}>{qualityStatusLabel(record.qualityStatus)}</span>
              </div>
            </article>
          ))}
        </div>
      );
    }

    function renderBenefitRows(): JSX.Element {
      if (benefitRecords.value.length === 0) {
        return <Empty description="暂无权益历史" />;
      }
      return (
        <div class="compact-list">
          {benefitRecords.value.map((record) => (
            <article class="compact-row benefit-row" key={String(record.id)}>
              <strong>{displayText(record.ruleName ?? record.benefitContent)}</strong>
              <span>生效日期：{formatDate(record.effectiveTime)}</span>
              <span>失效日期：{formatDate(record.expireTime)}</span>
              <em>{benefitRecordStatusLabel(record.status)}</em>
            </article>
          ))}
        </div>
      );
    }

    onMounted(() => {
      void load();
    });

    return (): JSX.Element => {
      const change = trendChange(scoreSummary.value.scoreTrend);
      return (
        <main class="credit-home">
          <CubeNavBar showBack title="信用档案" />

          {merchantId.value === undefined && !loading.value ? (
            <section class="credit-empty-card">
              <Empty description="未获取到当前用户，暂未发起信用档案请求" />
            </section>
          ) : null}

          {loading.value && credit.value === null ? <section class="credit-empty-card">正在加载信用档案...</section> : null}

          {credit.value !== null ? (
            <>
              <section class="profile-card">
                <div class="profile-head">
                  <div class="score-ring">
                    <strong>{displayText(credit.value.currentScore)}</strong>
                    <span>/100</span>
                  </div>
                  <div class="profile-info">
                    <h2>{displayText(credit.value.merchantName)}</h2>
                    <div class="profile-tags">
                      <span class={["grade-pill", creditGradeClass(credit.value.creditGrade)]}>
                        {creditGradeLabel(credit.value.creditGrade)}
                      </span>
                      <span class="industry-pill">{industryTypeLabel(credit.value.industryType)}</span>
                    </div>
                    <p>
                      较上月 <b class={scoreClass(change)}>{trendChangeText(change)}</b> · 加入 {formatDate(credit.value.joinTime)}
                    </p>
                  </div>
                </div>
                <div class="trend-panel">
                  <div class="section-caption">信用分变化趋势（近6个月）</div>
                  {renderTrend()}
                </div>
              </section>

              <section class="summary-card">
                <div class="section-caption">奖惩汇总</div>
                <div class="summary-grid">
                  <div class="summary-item deduct">
                    <span>总扣分</span>
                    <strong>{deductScoreText(scoreSummary.value.deductScore)}</strong>
                  </div>
                  <div class="summary-item bonus">
                    <span>总加分</span>
                    <strong>{bonusScoreText(scoreSummary.value.bonusScore)}</strong>
                  </div>
                  <div class="summary-item net">
                    <span>净变动</span>
                    <strong class={scoreClass(scoreSummary.value.netChange)}>{signedScore(scoreSummary.value.netChange)}</strong>
                  </div>
                </div>
                <p>扣分Top3：{deductTopText(scoreSummary.value.deductTop3)}</p>
              </section>

              <section class="behavior-card">
                <div class="behavior-tabs">
                  {CREDIT_HOME_BEHAVIOR_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      class={["behavior-tab", activeBehaviorTab.value === tab.value ? "active" : ""]}
                      onClick={() => (activeBehaviorTab.value = tab.value)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div class="behavior-body">{renderBehaviorRows()}</div>
              </section>

              <section class="detail-card">
                <h2>自查记录</h2>
                {renderCheckRows()}
              </section>

              <section class="detail-card">
                <h2>权益历史</h2>
                {renderBenefitRows()}
              </section>
            </>
          ) : null}
        </main>
      );
    };
  },
});
