import { Button, Pagination, Table } from "ant-design-vue";
import type { Key } from "ant-design-vue/es/_util/type";
import { defineComponent, onMounted, ref } from "vue";

import { PermissionDetailModal } from "./components/permission-detail-modal";
import { PermissionSearchForm } from "./components/permission-search-form";
import { createPermissionTableColumns } from "./components/permission-table-columns";
import { usePermissionList } from "./composables/use-permission-list";
import type { PermissionRecord } from "@/types/permission";

import "./permission-list.less";

export default defineComponent({
  name: "PermissionList",
  setup() {
    const {
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
    } = usePermissionList();

    // 弹窗状态
    const modalVisible = ref(false);
    const modalTitle = ref("");
    const modalItems = ref<PermissionRecord["monitorScope"] | PermissionRecord["ownership"]>([]);
    const modalType = ref<"scope" | "ownership">("scope");

    // 显示监控范围详情
    const handleShowScopeDetail = (record: PermissionRecord): void => {
      modalTitle.value = "监控范围详情";
      modalItems.value = record.monitorScope;
      modalType.value = "scope";
      modalVisible.value = true;
    };

    // 显示权限归属详情
    const handleShowOwnershipDetail = (record: PermissionRecord): void => {
      modalTitle.value = "权限归属详情";
      modalItems.value = record.ownership;
      modalType.value = "ownership";
      modalVisible.value = true;
    };

    // 关闭弹窗
    const handleModalClose = (): void => {
      modalVisible.value = false;
    };

    const columns = createPermissionTableColumns({
      onEdit: (record) => goToDetail(record, "edit"),
      onCopy: handleCopy,
      onDetail: (record) => goToDetail(record, "detail"),
      onDelete: handleSingleDelete,
      onShowScopeDetail: handleShowScopeDetail,
      onShowOwnershipDetail: handleShowOwnershipDetail,
    });

    onMounted(() => {
      loadData();
    });

    return () => (
      <div class="permission-list">
        <div class="permission-list__header">
          <div class="permission-list__header-left">
            <PermissionSearchForm
              keyword={searchForm.keyword}
              onSearch={handleSearch}
              onReset={handleReset}
              onUpdateKeyword={(val: string) => {
                searchForm.keyword = val;
              }}
            />
          </div>
          <div class="permission-list__header-right">
            <Button type="primary" onClick={handleAdd}>
              新增
            </Button>
          </div>
        </div>

        <div class="permission-list__table-wrapper">
          <Table
            rowKey="id"
            dataSource={permissions.value}
            columns={columns}
            pagination={false}
            loading={loading.value}
            bordered
            scroll={{ y: "calc(100vh - 400px)", x: "100%" }}
            style={{ borderBottom: "1px solid var(--vm-border)" }}
            rowSelection={{
              selectedRowKeys: selectedRowKeys.value,
              onChange: (keys: Key[]) => {
                selectedRowKeys.value = keys;
              },
            }}
            locale={{ emptyText: "暂无监控权限配置" }}
          />
        </div>

        <div class="permission-list__footer">
          <div class="permission-list__footer-left">
            <Button danger disabled={!selectedRowKeys.value.length} onClick={handleBatchDelete}>
              批量删除
            </Button>
          </div>
          <div class="permission-list__footer-right">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              show-size-changer
              show-total={(totalValue: number) => `共 ${totalValue} 条`}
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
            />
          </div>
        </div>

        <PermissionDetailModal
          visible={modalVisible.value}
          title={modalTitle.value}
          items={modalItems.value}
          type={modalType.value}
          onUpdate:visible={(val: boolean) => {
            modalVisible.value = val;
          }}
          onClose={handleModalClose}
        />
      </div>
    );
  },
});
