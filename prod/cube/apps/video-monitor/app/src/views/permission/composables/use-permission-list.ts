import { message, Modal } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { listAuthGroup, deleteCameraAuth } from "@ghcloud/cube-services-client/video-monitor.client";
import { queryParameter } from "@ghcloud/cube-utils";

/**
 * 权限列表业务逻辑 Composable
 */
import { DEFAULT_PAGINATION } from "@/constants/permission";
import { useAuthRequest } from "@/hooks/auth-request";
import { logger } from "@/logger";
import type { PermissionRecord } from "@/types/permission";
import { mapDeviceAuthToRecord } from "@/utils/permission";

const parsePositiveNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getPermissionBasePath = (): string => location.pathname.replace(/\/permissions(?:\/.*)?$/, "");

export const usePermissionList = () => {
  const router = useRouter();
  const cachedQuery = queryParameter.getQuery();
  const searchForm = reactive({
    keyword: (cachedQuery?.keyword as string) || "",
  });
  const permissions = ref<PermissionRecord[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    current: parsePositiveNumber(cachedQuery?.pageNumber, DEFAULT_PAGINATION.current),
    pageSize: parsePositiveNumber(cachedQuery?.pageSize, DEFAULT_PAGINATION.pageSize),
    total: parsePositiveNumber(cachedQuery?.total, 0),
  });
  const selectedRowKeys = ref<Key[]>([]);
  // 名称缓存，避免重复请求
  const nameCache = ref<Map<string, string>>(new Map());

  const syncQueryCache = (): void => {
    queryParameter.setAddressQuery({
      keyword: searchForm.keyword.trim(),
      pageNumber: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  // 加载列表数据
  const loadData = async (): Promise<void> => {
    loading.value = true;
    try {
      const result = await useAuthRequest(async () =>
        listAuthGroup({
          pageNumber: pagination.current,
          pageSize: pagination.pageSize,
          keyword: searchForm.keyword.trim() || undefined,
        }),
      );
      // 异步映射数据，需要等待所有接口调用完成
      permissions.value = await Promise.all(result.records.map(async (item) => mapDeviceAuthToRecord(item, nameCache.value)));
      pagination.total = result.total;
      syncQueryCache();
    } catch (error) {
      message.error("加载数据失败");
      logger.error("加载数据失败:", error);
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = (): void => {
    pagination.current = 1;
    loadData();
  };

  const handleReset = (): void => {
    searchForm.keyword = "";
    pagination.current = 1;
    selectedRowKeys.value = [];
    loadData();
  };

  const handleAdd = (): void => {
    router.push({ name: "PermissionCreate" });
  };

  const deleteByIds = async (ids: string[]): Promise<void> => {
    if (!ids.length) {
      return;
    }
    try {
      // 批量删除
      await Promise.all(ids.map(async (id) => useAuthRequest(async () => deleteCameraAuth(id))));
      selectedRowKeys.value = [];
      message.success("删除成功");
      await loadData();
    } catch (error) {
      message.error("删除失败");
      logger.error("删除失败:", error);
    }
  };

  const confirmDelete = (ids: string[]): void => {
    if (!ids.length) {
      return;
    }
    Modal.confirm({
      title: "确认删除所选权限？",
      content: "删除后无法恢复，请确认。",
      onOk: async () => deleteByIds(ids),
    });
  };

  const handleSingleDelete = (record: PermissionRecord): void => {
    confirmDelete([record.id]);
  };

  const handleBatchDelete = (): void => {
    const ids = (selectedRowKeys.value as Key[]).map((key) => String(key));
    confirmDelete(ids);
  };

  const handleCopy = (record: PermissionRecord): void => {
    router.push({
      name: "PermissionCreate",
      query: { copyFrom: record.id },
    });
  };

  const goToDetail = (record: PermissionRecord, mode: "detail" | "edit"): void => {
    history.pushState({ current: location.pathname + location.search }, "", `${getPermissionBasePath()}/permissions/${record.id}/${mode}`);
  };

  const handlePaginationChange = (page: number, size?: number): void => {
    pagination.current = page;
    if (size) {
      pagination.pageSize = size;
    }
    loadData();
  };

  return {
    searchForm,
    permissions,
    loading,
    pagination,
    selectedRowKeys,
    loadData,
    handleSearch,
    handleReset,
    handleAdd,
    handleSingleDelete,
    handleBatchDelete,
    handleCopy,
    goToDetail,
    handlePaginationChange,
  };
};
