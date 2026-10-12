import { Button, showToast } from "vant";
import type { Router } from "vue-router";

import { HazardActionCode } from "@ghcloud/cube-service-interface/hazard-governance";
import type { HazardLedgerRecordVO } from "@ghcloud/cube-service-interface/hazard-governance";
import { useAuthRequest } from "@ghcloud/cube-services-client/auth-request";
import { urgeHazard } from "@ghcloud/cube-services-client/hazard-governance.client";

const actionText: Record<HazardActionCode, string> = {
  [HazardActionCode.CONFIRM]: "确认属实",
  [HazardActionCode.VIEW]: "查看",
  [HazardActionCode.URGE]: "催办",
  [HazardActionCode.APPROVAL]: "审批",
  [HazardActionCode.FALSE_REPORT]: "误报",
  [HazardActionCode.FILL_PLAN]: "填写方案",
  [HazardActionCode.UPDATE_PROGRESS]: "更新进度",
  [HazardActionCode.ACCEPTANCE]: "验收",
};

const actionCodes = new Set<string>(Object.values(HazardActionCode));

export const normalizeHazardAction = (value: string | undefined): HazardActionCode | undefined => {
  if (!value) {
    return undefined;
  }
  return actionCodes.has(value) ? (value as HazardActionCode) : undefined;
};

interface RenderHazardActionsOptions {
  router: Router;
  openConfirm: (record: HazardLedgerRecordVO) => void;
  openMisreport: (record: HazardLedgerRecordVO) => void;
}

type HazardRecordWithAction = HazardLedgerRecordVO & {
  action?: string | string[];
  actions?: string | string[];
};

export const readHazardActions = (record: { action?: string | string[]; actions?: string | string[] }): string[] => {
  const actionRecord = record as HazardRecordWithAction;
  const rawActions = actionRecord.actions ?? actionRecord.action;
  if (Array.isArray(rawActions)) {
    return rawActions;
  }
  if (typeof rawActions !== "string") {
    return [];
  }
  const trimmed = rawActions.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 非 JSON 字符串继续按逗号拆分。
    }
  }
  return trimmed
    .split(",")
    .map((action) => action.trim())
    .filter(Boolean);
};

export const renderHazardActions = (record: HazardLedgerRecordVO, options: RenderHazardActionsOptions): JSX.Element | null => {
  const handlers: Partial<Record<HazardActionCode, () => void>> = {
    [HazardActionCode.CONFIRM]: () => options.openConfirm(record),
    [HazardActionCode.URGE]: () => {
      void useAuthRequest(() => urgeHazard(record.id))
        .then(() => showToast("已发送催办"))
        .catch((error: unknown) => showToast(error instanceof Error ? error.message : "催办失败，请稍后重试"));
    },
    [HazardActionCode.FALSE_REPORT]: () => options.openMisreport(record),
    [HazardActionCode.FILL_PLAN]: () => {
      void options.router.push({ name: "rectification-form", query: { mode: "plan", id: String(record.id) } });
    },
    [HazardActionCode.UPDATE_PROGRESS]: () => {
      void options.router.push({ name: "rectification-form", query: { mode: "execute", id: String(record.id) } });
    },
    [HazardActionCode.APPROVAL]: () => {
      if (!record.approvalTaskId) {
        showToast("缺少审批任务ID");
        return;
      }
      void options.router.push({
        name: "approval-detail",
        query: {
          id: String(record.id),
          hazardId: String(record.id),
          approvalTaskId: String(record.approvalTaskId),
          taskId: String(record.approvalTaskId),
        },
      });
    },
    [HazardActionCode.ACCEPTANCE]: () => {
      void options.router.push({ name: "acceptance-detail", query: { id: String(record.id) } });
    },
  };

  const actions = Array.from(
    new Set(
      readHazardActions(record)
        .map((action) => normalizeHazardAction(action))
        .filter((action): action is HazardActionCode => Boolean(action))
        .filter((action) => Boolean(handlers[action])),
    ),
  );

  if (actions.length === 0) {
    return null;
  }

  return (
    <div>
      {actions.map((action) => (
        <Button
          key={action}
          size="small"
          type={action === HazardActionCode.FALSE_REPORT ? "danger" : "primary"}
          onClick={(event: MouseEvent) => {
            event.stopPropagation();
            handlers[action]?.();
          }}
        >
          {actionText[action]}
        </Button>
      ))}
    </div>
  );
};
