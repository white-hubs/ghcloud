export const ASSIST_CONFIRM_RESULT_OPTIONS = [
  { label: "确认告警", value: "CONFIRM_ALARM" },
  { label: "疑似告警", value: "SUSPECTED_ALARM" },
] as const;

export const getAssistConfirmResultText = (value?: string | null): string => {
  if (!value) {
    return "--";
  }
  const option = ASSIST_CONFIRM_RESULT_OPTIONS.find((item) => item.value === value);
  return option?.label ?? "--";
};
