import { Empty, List, PullRefresh } from "vant";
import { computed, defineComponent, ref, watch } from "vue";
import { useRoute } from "vue-router";

import { CubeNavBar } from "@ghcloud/cube-app-generic-component";
import type {
  SafetyCreditBehaviorPageQuery,
  SafetyCreditBehaviorVO,
  SafetyCreditMerchantScoreSummaryVO,
} from "@ghcloud/cube-safety-credit-service";

import { cubeSafetyCreditService } from "@/api/server";
import {
  BEHAVIOR_FILTER_CHIPS,
  PERIOD_FILTER_CHIPS,
  behaviorCardClass,
  behaviorFilterToQueryType,
  behaviorMatchesFilter,
  behaviorSubtype,
  behaviorTypeLabel,
  periodFilterLabel,
  sourceInputText,
  type BehaviorFilter,
  type FilterChip,
  type PeriodFilter,
} from "@/constants/safety-credit-enums";
import { getCurrentUserId } from "@/utils/current-user";
import { bonusScoreText, deductScoreText, displayText, formatDateTime, formatQueryDateTime, scoreClass, signedScore } from "@/utils/format";
import { readQueryText } from "@/utils/route-query";

import "./merchant-behavior-list.less";

interface ScoreSummary {
  deductScore: number;
  bonusScore: number;
  netChange: number;
}

const pageSize = 10;

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function buildQueryPeriod(filter: PeriodFilter): string | undefined {
  if (filter === "all") {
    return undefined;
  }
  const now = new Date();
  const startMonthOffset = filter === "threeMonths" ? -2 : 0;
  const start = new Date(now.getFullYear(), now.getMonth() + startMonthOffset, 1, 0, 0, 0);
  const end = endOfMonth(now);
  return `${formatQueryDateTime(start)},${formatQueryDateTime(end)}`;
}

function scoreSummaryFromRecords(records: SafetyCreditBehaviorVO[]): ScoreSummary {
  return records.reduce<ScoreSummary>(
    (summary, record) => {
      const score = record.scoreChange ?? 0;
      if (score < 0) {
        summary.deductScore += Math.abs(score);
      }
      if (score > 0) {
        summary.bonusScore += score;
      }
      summary.netChange += score;
      return summary;
    },
    { deductScore: 0, bonusScore: 0, netChange: 0 },
  );
}

function scoreSummaryFromService(summary: SafetyCreditMerchantScoreSummaryVO): ScoreSummary {
  return {
    deductScore: Math.abs(summary.deductScore ?? 0),
    bonusScore: summary.bonusScore ?? 0,
    netChange: summary.netChange ?? 0,
  };
}

function shouldUseServiceSummary(
  periodFilter: PeriodFilter,
  behaviorFilter: BehaviorFilter,
  summary: SafetyCreditMerchantScoreSummaryVO,
): boolean {
  return (
    periodFilter === "month" &&
    behaviorFilter === "all" &&
    (summary.deductScore !== undefined || summary.bonusScore !== undefined || summary.netChange !== undefined)
  );
}

export const MerchantBehaviorList = defineComponent({
  name: "MerchantBehaviorList",
  setup: () => {
    const route = useRoute();
    const rows = ref<SafetyCreditBehaviorVO[]>([]);
    const loading = ref(false);
    const refreshing = ref(false);
    const finished = ref(false);
    const pageNumber = ref(1);
    const total = ref(0);
    const activePeriod = ref<PeriodFilter>("month");
    const activeBehavior = ref<BehaviorFilter>("all");
    const scoreSummary = ref<SafetyCreditMerchantScoreSummaryVO>({});
    const merchantId = ref<string>();
    const merchantName = ref("");

    const visibleRows = computed(() => rows.value.filter((record) => behaviorMatchesFilter(record, activeBehavior.value)));
    const derivedSummary = computed(() => scoreSummaryFromRecords(visibleRows.value));
    const summary = computed(() =>
      shouldUseServiceSummary(activePeriod.value, activeBehavior.value, scoreSummary.value)
        ? scoreSummaryFromService(scoreSummary.value)
        : derivedSummary.value,
    );
    const statLabel = computed(() => periodFilterLabel(activePeriod.value));
    const merchantNameText = computed(() => merchantName.value || readQueryText(route.query.merchantName, "merchantName") || "当前商户");

    function buildQuery(): SafetyCreditBehaviorPageQuery {
      const payload: SafetyCreditBehaviorPageQuery = {
        merchantId: merchantId.value,
        pageNumber: pageNumber.value,
        pageSize,
      };
      const period = buildQueryPeriod(activePeriod.value);
      const behaviorType = behaviorFilterToQueryType(activeBehavior.value);
      if (period !== undefined) {
        payload.period = period;
      }
      if (behaviorType !== undefined) {
        payload.behaviorType = behaviorType;
      }
      return payload;
    }

    async function loadScoreSummary(): Promise<void> {
      if (merchantId.value === undefined) {
        scoreSummary.value = {};
        return;
      }
      try {
        scoreSummary.value = await cubeSafetyCreditService.getMerchantScoreSummary(merchantId.value);
      } catch {
        scoreSummary.value = {};
      }
    }

    async function loadPage(reset = false): Promise<void> {
      if (loading.value || (finished.value && !reset)) {
        return;
      }
      loading.value = true;
      if (reset) {
        pageNumber.value = 1;
        rows.value = [];
        finished.value = false;
      }
      try {
        merchantId.value = await getCurrentUserId();
        if (merchantId.value === undefined) {
          total.value = 0;
          finished.value = true;
          scoreSummary.value = {};
          return;
        }
        if (reset) {
          await loadScoreSummary();
        }
        const result = await cubeSafetyCreditService.pageBehaviors(buildQuery());
        const records = result.records ?? [];
        rows.value = reset ? records : [...rows.value, ...records];
        const firstMerchantName = records.find((record) => displayText(record.merchantName) !== "--")?.merchantName;
        if (firstMerchantName !== undefined) {
          merchantName.value = firstMerchantName;
        }
        total.value = result.total ?? rows.value.length;
        if (records.length < pageSize || rows.value.length >= total.value) {
          finished.value = true;
        } else {
          pageNumber.value += 1;
        }
      } finally {
        loading.value = false;
        refreshing.value = false;
      }
    }

    function onLoad(): void {
      void loadPage();
    }

    function onRefresh(): void {
      void loadPage(true);
    }

    function changePeriod(value: PeriodFilter): void {
      if (activePeriod.value === value) {
        return;
      }
      activePeriod.value = value;
      void loadPage(true);
    }

    function changeBehavior(value: BehaviorFilter): void {
      if (activeBehavior.value === value) {
        return;
      }
      activeBehavior.value = value;
      void loadPage(true);
    }

    function renderFilterChip<T extends string>(chip: FilterChip<T>, activeValue: T, onClick: (value: T) => void): JSX.Element {
      return (
        <button
          type="button"
          class={["behavior-filter-chip", chip.value === activeValue ? "active" : ""]}
          onClick={() => onClick(chip.value)}
        >
          {chip.label}
        </button>
      );
    }

    function renderRecord(record: SafetyCreditBehaviorVO): JSX.Element {
      const cardClass = behaviorCardClass(record);
      return (
        <article class={["behavior-record-card", cardClass]} key={String(record.id)}>
          <div class="behavior-record-main">
            <div class="behavior-record-title">
              <span class={["behavior-type-badge", cardClass]}>{behaviorTypeLabel(record.behaviorType)}</span>
              <span>{behaviorSubtype(record)}</span>
            </div>
            <strong class={["behavior-record-score", scoreClass(record.scoreChange)]}>{signedScore(record.scoreChange)}</strong>
          </div>
          <p>{displayText(record.description)}</p>
          <footer>
            <span>来源：{sourceInputText(record)}</span>
            <span>{formatDateTime(record.occurredTime)}</span>
          </footer>
        </article>
      );
    }

    watch(
      () => route.query.merchantName,
      () => {
        merchantName.value = readQueryText(route.query.merchantName, "merchantName") ?? "";
        void loadPage(true);
      },
      { immediate: true },
    );

    return (): JSX.Element => (
      <main class="merchant-behavior-page">
        <CubeNavBar
          showBack
          title="我的行为记录"
          rightSlot={() => <span class="behavior-navbar-merchant">{merchantNameText.value}</span>}
        />

        <section class="behavior-stats" aria-label="行为记录统计">
          <div>
            <span>{statLabel.value}扣分</span>
            <strong class="negative">{deductScoreText(summary.value.deductScore)}</strong>
          </div>
          <div>
            <span>{statLabel.value}加分</span>
            <strong class="positive">{bonusScoreText(summary.value.bonusScore)}</strong>
          </div>
          <div>
            <span>净变动</span>
            <strong class={summary.value.netChange > 0 ? "positive" : summary.value.netChange < 0 ? "negative" : ""}>
              {signedScore(summary.value.netChange)}
            </strong>
          </div>
        </section>

        <section class="behavior-filters" aria-label="行为记录筛选">
          <div>{PERIOD_FILTER_CHIPS.map((chip) => renderFilterChip(chip, activePeriod.value, changePeriod))}</div>
          <div>{BEHAVIOR_FILTER_CHIPS.map((chip) => renderFilterChip(chip, activeBehavior.value, changeBehavior))}</div>
        </section>

        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class="behavior-refresh">
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={visibleRows.value.length === 0 ? "" : "暂无更多数据"}
            onLoad={onLoad}
          >
            <section class="behavior-record-list">
              {visibleRows.value.map(renderRecord)}
              {visibleRows.value.length === 0 && finished.value ? <Empty description="暂无记录" /> : null}
            </section>
          </List>
        </PullRefresh>
      </main>
    );
  },
});
