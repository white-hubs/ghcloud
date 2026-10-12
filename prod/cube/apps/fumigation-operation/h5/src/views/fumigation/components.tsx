import { Tag } from "vant";

import { WORK_STATUS_META, type CheckStatus, type WorkStatus } from "./state";

export const StatusTag = (props: { status: WorkStatus }): JSX.Element => {
  const meta = WORK_STATUS_META[props.status];
  return <Tag type={meta.type}>{meta.label}</Tag>;
};

export const CheckTag = (props: { status: CheckStatus }): JSX.Element => {
  const type = props.status === "passed" ? "success" : props.status === "failed" ? "danger" : "default";
  const label = props.status === "passed" ? "通过" : props.status === "failed" ? "未通过" : "待校验";
  return <Tag type={type}>{label}</Tag>;
};
