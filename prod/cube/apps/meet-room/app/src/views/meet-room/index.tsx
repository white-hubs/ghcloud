import { MeetRoomModal } from "./meet-room-modal";
import { cubeMeetRoomService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { useTableScroll } from "@/hook/use-table-scroll";
import type { ConferenceInfoVo } from "@ghcloud/cube-meet-room-service";
import type { AreaTree } from "@ghcloud/cube-ouaa-service";
import { Button, Form, FormItem, Input, Page, PopConfirm, PopOver, Switch, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable, AreaCascaderSelect } from "@ghcloud/generic-component";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 会议室 */
export const MeetRoom = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const formState = reactive<{
      name: string | undefined;
      areaName: string | undefined;
      areaId: string | undefined;
    }>({
      name: undefined,
      areaName: "",
      areaId: "",
    });

    const loading = ref(false);
    const dataSource = ref<ConferenceInfoVo[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });
    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const res = await cubeMeetRoomService.getConferencePage({
          areaName: formState.areaName || "",
          name: formState.name || "",
          pageSize: pagination.value.pageSize,
          pageNumber: pagination.value.pageNumber,
        });
        if (res) {
          const { records, total } = res;
          dataSource.value = records?.map((e) => ({
            ...e,
            statusBool: !e.status, // 取反，因为后端定义状态的逻辑是反的
          }));
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
    const handleSwitch = async (enable: boolean, record: ConferenceInfoVo): Promise<void> => {
      const enableNum = enable ? 0 : 1;
      if (!record?.id) {
        return;
      }
      try {
        await cubeMeetRoomService.updateConferenceStatus(record?.id, enableNum);
        message.success("操作成功");
        getTableData();
      } catch {
        record.statusBool = !enable;
      }
    };
    const delRow = async (record: ConferenceInfoVo): Promise<void> => {
      try {
        await cubeMeetRoomService.deleteConference(`${record?.id ?? ""}`);
        message.success("删除成功");
        getTableData();
      } catch {}
    };
    const handleAreaChange = (selectedOptions: AreaTree[]): void => {
      formState.areaName = selectedOptions.map((item) => item.name).join("/");
    };

    const meetRoomModalRef = ref<{ openModal: (record?: ConferenceInfoVo) => void }>();
    const add = (): void => {
      meetRoomModalRef.value?.openModal();
    };
    const editRow = (record: ConferenceInfoVo): void => {
      meetRoomModalRef.value?.openModal(record);
    };
    const columns = [
      {
        title: "会议室名称",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        fixed: "left",
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
        title: "可容纳人数",
        dataIndex: "capacity",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "管理员",
        dataIndex: "administratorsName",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }): JSX.Element => <PopOver content={text || "--"}>{text || "--"}</PopOver>,
      },
      {
        title: "会议设备数",
        dataIndex: "devicesVos",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: ConferenceInfoVo }): JSX.Element => {
          const text = record.devicesVos?.length || "";
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "使用状态",
        dataIndex: "status",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: ConferenceInfoVo }): JSX.Element => (
          <Switch
            v-model:checked={record.statusBool}
            checkedChildren="启用"
            unCheckedChildren="停用"
            onChange={async (e) => handleSwitch(e, record)}
          />
        ),
      },
      {
        title: "操作",
        dataIndex: "action",
        ellipsis: true,
        width: 180,
        customRender: ({ record }: { record: ConferenceInfoVo }): JSX.Element => (
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
            <Button type="primary" onClick={add}>
              新增
            </Button>
          </div>
        </>
      ),
      "layout-content": (): JSX.Element => (
        <>
          <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
            <FormItem label="所属区域" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <AreaCascaderSelect
                v-model:value={formState.areaId}
                onChange={handleAreaChange}
                placeholder="请选择所属区域"
                style={{ minWidth: "160px" }}
              />
            </FormItem>
            <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
              <Input v-model:value={formState.name} placeholder="会议室名称" showCount={false} allowClear />
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
        <MeetRoomModal ref={meetRoomModalRef} onEnter={queryForm} title={pageTitle} labelWidth="100px" />
      </>
    );
  },
});
