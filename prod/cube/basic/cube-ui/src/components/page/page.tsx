import { Pagination } from "ant-design-vue/es";
import { defineComponent, onBeforeMount } from "vue";
import { useRoute, useRouter } from "vue-router";

import { readPageQueryValue, writePageQuery } from "./url-query-cache";
interface Props {
  current: number;
  pageSize: number;
  total: number;
  showQuickJumper: boolean;
  showSizeChanger: boolean;
  showTotal: (total: number) => string;
  pageSizeOptions: string[];
  /** 为 false 时不读写 URL 中的 pageNumber/pageSize（弹窗内分页等场景） */
  syncToUrl?: boolean;
  hideOnSinglePage: boolean;
  cachePageQuery?: boolean;
}

export default defineComponent({
  emits: ["pageChange", "showSizeChange"],
  props: [
    "current",
    "pageSize",
    "showQuickJumper",
    "showSizeChanger",
    "showTotal",
    "total",
    "pageSizeOptions",
    "hideOnSinglePage",
    "syncToUrl",
    "cachePageQuery",
  ],
  setup(props: Props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const shouldSyncToUrl = (): boolean => props.syncToUrl !== false && props.cachePageQuery !== false;
    onBeforeMount(() => {
      if (!shouldSyncToUrl()) {
        return;
      }
      const pageNumber = readPageQueryValue("pageNumber", route);
      const pageSize = readPageQueryValue("pageSize", route);
      const nextPageNumber = pageNumber ?? props.current;
      const nextPageSize = pageSize ?? props.pageSize;
      if (nextPageNumber !== props.current || nextPageSize !== props.pageSize) {
        emit("pageChange", nextPageNumber, nextPageSize);
      }
    });
    const onChange = (pageNumber: number, pageSize: number): void => {
      if (shouldSyncToUrl()) {
        writePageQuery(pageNumber, pageSize, router, route);
      }
      emit("pageChange", pageNumber, pageSize);
    };
    const onShowSizeChange = (pageNumber: number, pageSize: number): void => {
      if (shouldSyncToUrl()) {
        writePageQuery(pageNumber, pageSize, router, route);
      }
      emit("showSizeChange", pageNumber, pageSize);
    };
    return (): JSX.Element => {
      const { syncToUrl: _syncToUrl, cachePageQuery: _cachePageQuery, ...paginationProps } = props;
      return (
        <Pagination
          {...paginationProps}
          showSizeChanger={props.showSizeChanger ?? true}
          showQuickJumper={props.showQuickJumper ?? false}
          showTotal={props.showTotal ?? ((total: number): string => `共 ${total} 条数据`)}
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
        />
      );
    };
  },
});
