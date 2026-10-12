import { defineComponent, type PropType } from "vue";

import { Tag } from "@ghcloud/cube-ui";

import { OBJECT_STATUS_LABEL } from "@/constants";
import type { ObjectStatus } from "@/types/risk";

const COLOR_MAP: Partial<Record<ObjectStatus, string>> = {
  DRAFT: "processing",
  PENDING_REVIEW: "warning",
  ACTIVE: "success",
  EXECUTING: "orange",
};

export const ObjectStatusTag = defineComponent({
  props: {
    status: { type: String as PropType<ObjectStatus>, required: true },
  },
  setup(props) {
    return (): JSX.Element => <Tag color={COLOR_MAP[props.status] ?? "default"}>{OBJECT_STATUS_LABEL[props.status]}</Tag>;
  },
});
