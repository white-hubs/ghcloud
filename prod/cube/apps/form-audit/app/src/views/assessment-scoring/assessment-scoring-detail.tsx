import { defineComponent, onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { CubeLayout } from "@ghcloud/cube-app-design";
import type {
  FormAppraisalContentType,
  FormAppraisalRecordDetailItemVO,
  FormAppraisalRecordDetailVO,
} from "@ghcloud/cube-form-audit-service";
import { Button, Space, Spin, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { calcTypeToMethodCode, fromSourceTypeApi } from "../assessment-rules/assessment-rule-api-map";
import { checkSourceKindOptions, getMethodOptionsBySourceKind } from "../assessment-rules/assessment-rule-enums";
import { cubeFormAuditService } from "@/api/service";

import styles from "./assessment-scoring-detail.module.less";

type CategoryVariant = "spot" | "inspection";
type DeductionItemRow = {
  source: string;
  name: string;
  scoreItem: string;
  result: string;
  deduction: string;
};

type BlockTableRow = {
  item: string;
  result: string;
  deduction: string;
  deductionItem: DeductionItemRow;
};

type DetailBlock = {
  content: string;
  standard: string;
  draft: string;
  rows: BlockTableRow[];
};

function formatText(value: unknown): string {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "--";
  }
  return String(value);
}

function buildDeductionItem(detail: FormAppraisalRecordDetailItemVO): DeductionItemRow {
  const sourceKind = detail.sourceType ? fromSourceTypeApi(detail.sourceType) : undefined;
  const source = sourceKind
    ? (checkSourceKindOptions.find((option) => option.value === sourceKind)?.label ?? formatText(detail.sourceType))
    : "--";
  const methodCode = sourceKind ? calcTypeToMethodCode(detail.calcType, sourceKind) : detail.calcType;
  const methodName = sourceKind
    ? (getMethodOptionsBySourceKind(sourceKind).find((option) => option.value === methodCode)?.label ?? formatText(detail.calcType))
    : formatText(detail.calcType);
  const scoreItem = [formatText(detail.fieldName), methodName].filter((item) => item !== "--").join("-") || "--";
  return {
    source,
    name: formatText(detail.sourceRefName),
    scoreItem,
    result: formatText(detail.rawValue),
    deduction: formatNum(detail.finalDeductScore ?? detail.originDeductScore),
  };
}

function formatNum(n: number | undefined | null): string {
  if (n === undefined || n === null || Number.isNaN(Number(n))) {
    return "--";
  }
  return String(n);
}

function getTrimmedText(s: string | undefined | null): string {
  return s?.trim() ? s : "--";
}

function getCategoryType(variant: CategoryVariant): FormAppraisalContentType {
  return variant === "spot" ? "SPOT_CHECK" : "INSPECTION";
}

function getCategoryScore(variant: CategoryVariant, d: FormAppraisalRecordDetailVO): string {
  if (variant === "spot") {
    return formatNum(d.finalSpotCheckScore ?? d.originSpotCheckScore);
  }
  return formatNum(d.finalInspectionScore ?? d.originInspectionScore);
}

function getTotalScore(d: FormAppraisalRecordDetailVO): string {
  return formatNum(d.finalTotalScore ?? d.originTotalScore);
}

function buildCategoryBlocks(variant: CategoryVariant, details: FormAppraisalRecordDetailItemVO[] | undefined): DetailBlock[] {
  if (!Array.isArray(details)) {
    return [];
  }
  const currentType = getCategoryType(variant);
  return details
    .filter((x) => x.contentType === currentType)
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((x) => ({
      content: getTrimmedText(x.contentDesc),
      standard: getTrimmedText(x.standardDesc),
      draft: getTrimmedText(x.sourceRefName),
      rows: [
        {
          item: formatText(x.itemName),
          result: formatText(x.rawValue?.trim() ? x.rawValue : x.matchedRangeText),
          deduction: formatNum(x.finalDeductScore ?? x.originDeductScore),
          deductionItem: buildDeductionItem(x),
        },
      ],
    }));
}

function categoryLabels(variant: CategoryVariant): {
  max: string;
  content: string;
  draft: string;
  itemCol: string;
  resultCol: string;
  score: string;
} {
  if (variant === "spot") {
    return {
      max: "抽查分值",
      content: "抽查内容",
      draft: "抽查底稿",
      itemCol: "抽查项目",
      resultCol: "抽查结果",
      score: "抽查得分",
    };
  }
  return {
    max: "检查分值",
    content: "检查内容",
    draft: "检查底稿",
    itemCol: "检查项目",
    resultCol: "检查结果",
    score: "检查得分",
  };
}

export const AssessmentScoringDetail = defineComponent({
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const { pageTitle } = usePageName();

    const loading = ref(true);
    const detail = ref<FormAppraisalRecordDetailVO | null>(null);

    const title = computed(() => `考核评分详情${pageTitle ? `-${pageTitle}` : ""}`);

    const onBack = (): void => {
      // router.replace({ path: '/assessment-scoring' })
      router.back();
    };

    onMounted(async () => {
      const id = route.params.id ? String(route.params.id) : "";
      if (!id) {
        message.error("缺少记录 ID");
        loading.value = false;
        return;
      }
      loading.value = true;
      try {
        const data = await cubeFormAuditService.getAppraisalRecordDetail(id);
        if (data === null || data === undefined) {
          message.warning("记录不存在或类型不符");
          detail.value = null;
        } else {
          detail.value = data;
        }
      } catch {
        message.error("获取详情失败");
        detail.value = null;
      } finally {
        loading.value = false;
      }
    });

    const renderBlockTable = (block: DetailBlock, variant: CategoryVariant): JSX.Element | null => {
      const { rows } = block;
      if (!Array.isArray(rows) || rows.length === 0) {
        return null;
      }
      const lb = categoryLabels(variant);
      return (
        <div class={styles["block-results"]}>
          {rows.map((row, idx) => {
            const cells = row;
            return (
              <div key={idx} class={styles["block-result-wrap"]}>
                <div class={styles["block-result-row"]}>
                  <span class={styles["block-result-item"]}>
                    {lb.itemCol}：{cells.item}
                  </span>
                  <span class={styles["block-result-item"]}>
                    {lb.resultCol}：{cells.result}
                  </span>
                  <span class={styles["block-result-item"]}>扣分：{cells.deduction}</span>
                </div>
                <div class={styles["deduction-item-wrap"]}>
                  <div class={styles["deduction-item-title"]}>扣分项：</div>
                  <div class={styles["deduction-item-table"]}>
                    <div class={styles["deduction-item-row"]}>
                      <span>来源</span>
                      <span>名称</span>
                      <span>评分项</span>
                      <span>{lb.resultCol}</span>
                      <span>扣分</span>
                    </div>
                    <div class={styles["deduction-item-row"]}>
                      <span>{cells.deductionItem.source}</span>
                      <span>{cells.deductionItem.name}</span>
                      <span>{cells.deductionItem.scoreItem}</span>
                      <span>{cells.deductionItem.result}</span>
                      <span>{cells.deductionItem.deduction}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    const renderBlocks = (variant: CategoryVariant, d: FormAppraisalRecordDetailVO): JSX.Element | null => {
      const lb = categoryLabels(variant);
      const blocks = buildCategoryBlocks(variant, d.details);
      if (!Array.isArray(blocks) || blocks.length === 0) {
        return <div class={styles["empty-hint"]}>暂无明细</div>;
      }
      return (
        <>
          {blocks.map((block, bi) => (
            <div key={bi} class={styles["content-block"]}>
              <div class={styles["block-field"]}>
                <div class={styles["block-label"]}>{lb.content}：</div>
                <div class={styles["block-text"]}>{block.content?.trim() ? block.content : "--"}</div>
              </div>
              <div class={styles["block-field"]}>
                <div class={styles["block-label"]}>评分标准：</div>
                <div class={styles["block-text"]}>{block.standard?.trim() ? block.standard : "--"}</div>
              </div>
              <div class={styles["block-field"]}>
                <div class={styles["block-label"]}>{lb.draft}：</div>
                <div class={styles["block-text"]}>{block.draft?.trim() ? block.draft : "--"}</div>
              </div>
              {renderBlockTable(block, variant)}
            </div>
          ))}
        </>
      );
    };

    const renderCategory = (variant: CategoryVariant, d: FormAppraisalRecordDetailVO): JSX.Element | null => {
      const lb = categoryLabels(variant);
      return (
        <div class={styles["category-wrap"]}>
          <div class={styles["score-head"]}>
            {lb.max}：{getCategoryScore(variant, d)}
          </div>
          {renderBlocks(variant, d)}
          <div class={styles["category-total"]}>
            {lb.score}：{getCategoryScore(variant, d)}
          </div>
        </div>
      );
    };

    const renderBody = (): JSX.Element => {
      if (!detail.value) {
        return (
          <div class={styles["edit-content"]}>
            <div class={styles["empty-hint"]}>暂无考核记录详情</div>
          </div>
        );
      }
      const d = detail.value;
      return (
        <div class={styles["edit-content"]}>
          <div class={styles["section-title"]}>基础信息</div>
          <div class={styles["info-card"]}>
            <div class={styles["info-row"]}>
              <span class={styles["info-label"]}>表单名称：</span>
              <span class={styles["info-value"]}>{getTrimmedText(d.name)}</span>
            </div>
            <div class={styles["info-row"]}>
              <span class={styles["info-label"]}>检查项目：</span>
              <span class={styles["info-value"]}>{getTrimmedText(d.inspectionItem)}</span>
            </div>
            <div class={styles["info-row"]}>
              <span class={styles["info-label"]}>责任部门：</span>
              <span class={styles["info-value"]}>{getTrimmedText(d.responsibleDepartmentNames)}</span>
            </div>
          </div>

          <div class={styles["section-title"]}>考核评分</div>
          {renderCategory("spot", d)}
          {renderCategory("inspection", d)}

          <div class={styles["page-total"]}>
            总得分：
            {getTotalScore(d)}
          </div>
        </div>
      );
    };

    return (): JSX.Element => (
      <CubeLayout
        title={title.value}
        v-slots={{
          "layout-content": (): JSX.Element => (
            <Spin spinning={loading.value}>
              {loading.value ? <div class={styles["edit-content"]} style={{ minHeight: "240px" }} /> : renderBody()}
            </Spin>
          ),
          "footer-page": (): JSX.Element => (
            <Space>
              <Button onClick={onBack}>返回</Button>
            </Space>
          ),
        }}
      />
    );
  },
});
