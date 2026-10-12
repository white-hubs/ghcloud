import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/merchants",
  },
  {
    path: "/merchants",
    name: "SafetyCreditMerchantList",
    component: async () => {
      const { MerchantList } = await import("./views/merchant/merchant-list");
      return MerchantList;
    },
  },
  {
    path: "/score-models",
    name: "SafetyCreditScoreModelList",
    component: async () => {
      const { ScoreModelList } = await import("./views/s2/score-model-list");
      return ScoreModelList;
    },
  },
  {
    path: "/score-models/versions",
    name: "SafetyCreditScoreModelVersions",
    component: async () => {
      const { ScoreModelVersions } = await import("./views/s2/score-model-versions");
      return ScoreModelVersions;
    },
  },
  {
    path: "/score-logs",
    name: "SafetyCreditScoreLogShell",
    component: async () => {
      const { ScoreLogShell } = await import("./views/s2/score-log-shell");
      return ScoreLogShell;
    },
  },
  {
    path: "/data-sources",
    name: "SafetyCreditDataSourceConfig",
    component: async () => {
      const { DataSourceConfig } = await import("./views/s2/data-source-config");
      return DataSourceConfig;
    },
  },
  {
    path: "/behaviors",
    name: "SafetyCreditBehaviorList",
    component: async () => {
      const { BehaviorList } = await import("./views/s3/behavior-list");
      return BehaviorList;
    },
  },
  {
    path: "/behavior-audits",
    name: "SafetyCreditBehaviorAudit",
    component: async () => {
      const { BehaviorAudit } = await import("./views/s3/behavior-audit");
      return BehaviorAudit;
    },
  },
  {
    path: "/archives",
    name: "SafetyCreditArchiveList",
    component: async () => {
      const { ArchiveList } = await import("./views/s4/archive-list");
      return ArchiveList;
    },
  },
  {
    path: "/archives/:merchantId",
    name: "SafetyCreditArchiveDetail",
    component: async () => {
      const { ArchiveDetail } = await import("./views/s4/archive-detail");
      return ArchiveDetail;
    },
  },
  {
    path: "/rankings",
    name: "SafetyCreditRankingBoard",
    component: async () => {
      const { RankingBoard } = await import("./views/s4/ranking-board");
      return RankingBoard;
    },
  },
  {
    path: "/publicity-config",
    name: "SafetyCreditPublicityConfig",
    component: async () => {
      const { PublicityConfig } = await import("./views/s4/publicity-config");
      return PublicityConfig;
    },
  },
  {
    path: "/checklists",
    name: "SafetyCreditChecklistList",
    component: async () => {
      const { ChecklistList } = await import("./views/s5/checklist-list");
      return ChecklistList;
    },
  },
  {
    path: "/check-quality",
    name: "SafetyCreditCheckQuality",
    component: async () => {
      const { CheckQuality } = await import("./views/s5/check-quality");
      return CheckQuality;
    },
  },
  {
    path: "/check-processing",
    name: "SafetyCreditCheckProcessing",
    component: async () => {
      const { CheckProcessing } = await import("./views/s5/check-processing");
      return CheckProcessing;
    },
  },
  {
    path: "/check-statistics",
    name: "SafetyCreditCheckStatistics",
    component: async () => {
      const { CheckStatistics } = await import("./views/s5/check-statistics");
      return CheckStatistics;
    },
  },
  {
    path: "/benefit-rules",
    name: "SafetyCreditBenefitRuleList",
    component: async () => {
      const { BenefitRuleList } = await import("./views/s6/benefit-rule-list");
      return BenefitRuleList;
    },
  },
  {
    path: "/benefit-records",
    name: "SafetyCreditBenefitRecordList",
    component: async () => {
      const { BenefitRecordList } = await import("./views/s6/benefit-record-list");
      return BenefitRecordList;
    },
  },
];
