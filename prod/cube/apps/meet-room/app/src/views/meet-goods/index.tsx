import { MeetGoodsModal } from "./meet-room-modal";
import { cubeMeetRoomService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import type { ConferenceGoods } from "@ghcloud/cube-meet-room-service";
import { AntModal, Button, Form, FormItem, Input, Page, PopConfirm, PopOver, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 会议物品 */
export const MeetGoods = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive<{
      goodsName: string | undefined;
    }>({
      goodsName: undefined,
    });

    const loading = ref(false);
    const dataSource = ref<ConferenceGoods[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeMeetRoomService.getMeetGoodsPage({
          goodsName: formState.goodsName || "",
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records ?? [];
          pagination.value.total = total;
        }
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData();
    };

    const selectedRowKeysData = ref<string[]>([]);
    const rowSelection = ref({
      onChange: (selectedRowKeys: string[]) => {
        selectedRowKeysData.value = selectedRowKeys;
      },
    });
    const deleteLoading = ref(false);
    const handleBatchDelete = (): void => {
      AntModal.confirm({
        centered: true,
        content: "确定要删除当前选中?",
        async onOk() {
          try {
            deleteLoading.value = true;
            await cubeMeetRoomService.batchDeleteMeetGoods({
              ids: selectedRowKeysData.value,
            });
            message.success("删除成功");
            getTableData();
          } catch {
          } finally {
            deleteLoading.value = false;
            AntModal.destroyAll();
          }
        },
        onCancel() {
          AntModal.destroyAll();
        },
      });
    };
    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
    };
    const reset = (): void => {
      for (const key in formState) {
        (formState as Record<string, unknown>)[key] = undefined;
      }
      dataSource.value = [];
      queryForm();
    };
    onMounted(() => {
      queryForm();
    });
    const { scrollY } = useTableScroll();
    const delRow = async (record: ConferenceGoods): Promise<void> => {
      try {
        await cubeMeetRoomService.deleteMeetGoods(`${record?.id ?? ""}`);
        message.success("删除成功");
        getTableData();
      } catch {}
    };

    const meetGoodsModalRef = ref<{ openModal: (record?: ConferenceGoods) => void }>();
    const add = (): void => {
      meetGoodsModalRef.value?.openModal();
    };
    const editRow = (record: ConferenceGoods): void => {
      meetGoodsModalRef.value?.openModal(record);
    };
    const columns = [
      {
        title: "序号",
        width: 70,
        align: "center",
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "物品名称",
        dataIndex: "goodsName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "说明",
        dataIndex: "illustrate",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "所属区域",
        dataIndex: "areaName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "操作",
        dataIndex: "action",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: ConferenceGoods }): JSX.Element => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                editRow(record);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该项？"
              onConfirm={() => {
                delRow(record);
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </PopConfirm>
          </>
        ),
      },
    ];
    const layoutSlots = {
      "layout-header": (): JSX.Element => (
        <>
          <div>
            <Button
              style="margin-right: 10px"
              danger
              type="primary"
              onClick={handleBatchDelete}
              loading={deleteLoading.value}
              disabled={!selectedRowKeysData.value.length}
            >
              批量删除
            </Button>
            <Button type="primary" onClick={add}>
              新增
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.goodsName} placeholder="会议室物品名称" showCount={false} allowClear />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Button type="primary" onClick={queryForm}>
                查询
              </Button>
              <Button style={{ marginLeft: "10px" }} onClick={reset}>
                重置
              </Button>
            </FormItem>
          </Form>
          <AliasTable
            rowKey="id"
            rowSelection={rowSelection.value}
            columns={columns}
            loading={loading.value}
            dataSource={dataSource.value}
            pagination={false}
            scrollY={scrollY.value}
            tableCode={tableCode}
            applicationCode={__ENV__.applicationCode}
          />
        </>
      ),
      "footer-page": (): JSX.Element => (
        <Page
          v-model:current={pagination.value.pageNumber}
          v-model:pageSize={pagination.value.pageSize}
          v-model:total={pagination.value.total}
          onPageChange={pageChange}
        />
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <MeetGoodsModal ref={meetGoodsModalRef} onEnter={queryForm} title={pageTitle} labelWidth="100px" />
      </>
    );
  },
});
