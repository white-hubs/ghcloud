import { defineComponent } from "vue";

import { Page } from "@ghcloud/cube-ui";

export const GPagination = defineComponent({
  props: {
    total: { type: Number, default: 0 },
    current: { type: Number, default: 1 },
    pageSize: { type: Number, default: 10 },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const onChange = (page: number, nextPageSize: number): void => {
      const sizeChanged = nextPageSize !== props.pageSize;
      const nextPage = sizeChanged ? 1 : Math.max(1, page || 1);
      emit("change", nextPage, nextPageSize);
    };
    return (): JSX.Element => (
      <Page
        current={props.current}
        pageSize={props.pageSize}
        total={props.total}
        show-total={(total: number) => `共 ${total} 条`}
        onPageChange={onChange}
      />
    );
  },
});
