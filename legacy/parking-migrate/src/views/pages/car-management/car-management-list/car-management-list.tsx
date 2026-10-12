import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { CubeLayout, useCubeForm, useCubeTable } from "@ghcloud/cube-app-design";
import type { VehicleInfoVO, VehicleTypeVO } from "@ghcloud/cube-parking-lot-service/src/type";
import { Button, PopOver, Page, PopConfirm, message } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeParkingLotService } from "@/api/service";

export const CarManagementList = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const searchParams = reactive({
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      keyword: "",
      vehicleTypeCode: "",
      inBlackList: "",
    });

    const columns = [
      {
        dataIndex: "vehicleNo",
        title: "车牌号",
        align: "center",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "vehicleTypeName",
        title: "车辆类型",
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "customerName",
        title: "车主",
        align: "center",
        width: 100,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "customerMobile",
        title: "联系方式",
        align: "center",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => <PopOver content={text || ""}>{text || "--"}</PopOver>,
      },
      {
        dataIndex: "isBlacklist",
        title: "是否加入黑名单",
        align: "center",
        width: 120,
        ellipsis: true,
        customRender: ({ text }: { text: boolean }) => <span style={{ color: text ? "red" : "green" }}>{text ? "是" : "否"}</span>,
      },
      {
        dataIndex: "updateTime",
        title: "最近驶入时间",
        align: "center",
        width: 150,
        ellipsis: true,
        customRender: ({ text }: { text: string }) => {
          const time = text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "--";
          return <PopOver content={time}>{time}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        fixed: "right",
        width: 180,
        customRender: ({ record }: { record: VehicleInfoVO }) => (
          <>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/parkingSystem/car-management-edit?type=info&id=${record.id}`);
              }}
            >
              详情
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                history.pushState({}, "", `/portal/parkingSystem/car-management-edit?type=edit&id=${record.id}`);
              }}
            >
              编辑
            </Button>
            <PopConfirm
              title="确认删除该车辆？"
              onConfirm={async () => {
                await cubeParkingLotService.deleteVehicle(record?.id as unknown as string);
                message.success("删除成功");
                tableApi.query();
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

    const [CubeTable, tableApi] = useCubeTable({
      columns,
      tableCode,
      rowKey: "id",
      fetchApi: async () => {
        const params = {
          pageNumber: searchParams.pageNumber,
          pageSize: searchParams.pageSize,
          vehicleNo: searchParams.keyword ?? "",
          vehicleTypeCode: searchParams.vehicleTypeCode ?? "",
          inBlackList: searchParams.inBlackList,
        };
        const res = await cubeParkingLotService.getVehiclePageList(params);
        return res;
      },
      fetchLoaded: (data) => {
        searchParams.total = data.total;
      },
    });

    const handleChange = (pageNumber: number, pageSize: number) => {
      searchParams.pageNumber = pageNumber;
      searchParams.pageSize = pageSize;
      tableApi.query();
    };
    const vehicleTypeList = ref<{ label: string | undefined; value: number | undefined }[]>([]);
    const formSchema = [
      {
        component: "Select",
        label: "车辆类型",
        fieldName: "vehicleTypeCode",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            ...vehicleTypeList.value,
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.vehicleTypeCode = value;
            tableApi.query();
          },
        },
      },
      {
        component: "Select",
        label: "是否加入黑名单",
        fieldName: "inBlackList",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            { label: "全部", value: "" },
            { label: "是", value: 1 },
            { label: "否", value: 0 },
          ],
        },
      },
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "车牌号、车主名称",
        },
      },
    ];

    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      schema: formSchema,
      syncStateRef: searchParams,
      onHydratedQuery: () => {
        tableApi.query();
      },
      handleSubmit: (data) => {
        Object.assign(searchParams, data);
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      handleReset: () => {
        searchParams.keyword = "";
        searchParams.vehicleTypeCode = "";
        searchParams.inBlackList = "";
        searchParams.pageNumber = 1;
        tableApi.query();
      },
      showCollapseButton: true,
    });
    const getTypeOptions = async () => {
      try {
        const res = await cubeParkingLotService.getVehicleTypeList();
        vehicleTypeList.value = (res ?? [])?.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
      } catch {}
    };
    onMounted(async () => {
      await getTypeOptions();
      const schema = {
        component: "Select",
        label: "车辆类型",
        fieldName: "vehicleTypeCode",
        defaultValue: "",
        componentProps: {
          allowClear: true,
          options: [
            {
              label: "全部",
              value: "",
            },
            ...vehicleTypeList.value,
          ],
          onChange: (value: string): void => {
            searchParams.pageNumber = 1;
            searchParams.vehicleTypeCode = value;
            tableApi.query();
          },
        },
      };
      formApi.updateFieldSchema(schema);
    });

    const slots = {
      "layout-header": () => (
        <Button
          type="primary"
          onClick={() => {
            history.pushState({}, "", "/portal/parkingSystem/car-management-edit?type=create");
          }}
        >
          新增
        </Button>
      ),
      "layout-content": () => (
        <div>
          <CubeForm />
          <CubeTable />
        </div>
      ),
      "footer-page": () => (
        <Page current={searchParams.pageNumber} pageSize={searchParams.pageSize} total={searchParams.total} onPageChange={handleChange} />
      ),
    };

    return () => <CubeLayout title={pageTitle} v-slots={slots} showTableXScroll />;
  },
});
