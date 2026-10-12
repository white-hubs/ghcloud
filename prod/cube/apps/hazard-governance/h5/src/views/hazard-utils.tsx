import { Tag } from "vant";
import { shallowRef, type Ref, type ShallowRef } from "vue";

import { levelText, statusText, taskStatusText, type HazardLevel, type HazardStatus, type TaskStatus } from "@/domain/hazard";

export const renderLevelTag = (level: HazardLevel): JSX.Element => {
  const type = level === "critical" ? "danger" : level === "major" ? "warning" : "primary";
  return <Tag type={type}>{levelText[level]}</Tag>;
};

export const renderStatusTag = (status: HazardStatus | TaskStatus): JSX.Element => {
  const text = statusText[status as HazardStatus] ?? taskStatusText[status as TaskStatus];
  const type =
    status === "closed" || status === "pendingAcceptance" || status === "check"
      ? "success"
      : status === "falseAlarm"
        ? "default"
        : status === "pendingApproval" || status === "approval"
          ? "primary"
          : "warning";

  return <Tag type={type}>{text}</Tag>;
};

export interface LocalListState<T> {
  rows: Ref<T[]>;
  loading: ShallowRef<boolean>;
  finished: ShallowRef<boolean>;
  refreshing: ShallowRef<boolean>;
  onLoad: () => void;
  onRefresh: () => void;
}

export const useLocalList = <T,>(getSource: () => T[]): LocalListState<T> => {
  const rows = shallowRef<T[]>([]);
  const loading = shallowRef(false);
  const finished = shallowRef(false);
  const refreshing = shallowRef(false);

  const onLoad = (): void => {
    loading.value = true;
    rows.value = getSource();
    finished.value = true;
    loading.value = false;
    refreshing.value = false;
  };

  const onRefresh = (): void => {
    finished.value = false;
    rows.value = [];
    refreshing.value = true;
    onLoad();
  };

  return {
    rows,
    loading,
    finished,
    refreshing,
    onLoad,
    onRefresh,
  };
};
