import { defineComponent } from "vue";

import { InspectBusinessType } from "@ghcloud/cube-daily-inspection-service";
import { PopOver } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { filterEmptyValues } from "../../../utils";
interface Props {
  title: string;
  businessType?: InspectBusinessType;
  referType?: string;
}
/** 巡检项表格弹窗 */
export const InspectItemModalTable = defineComponent({
  props: ["title", "businessType", "referType"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const businessType = (): InspectBusinessType => props.businessType ?? InspectBusinessType.SMALL_ENGINEERING;
    const columns = [
      {
        dataIndex: "alias",
        title: "巡检项名称",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "name",
        title: "巡检项内容",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "resultNames",
        title: "巡检结果",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        dataIndex: "referTypeNames",
        title: "适用对象",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
    ];
    const [ItemTable, itemTableApi] = useCubeTable({
      columns,
      rowSelection: "checkbox",
      pagination: {
        current: 1, // 当前页码
        pageSize: 10, // 每页显示条数
        total: 0, // 总条数
        size: "default", // 分页组件大小
        showSizeChanger: true, // 是否允许改变每页显示条数
        showTotal: (total: number) => `总共 ${total} 条数据`,
        onChange: (current: number, pageSize: number) => {
          itemTableApi.setState({
            pagination: {
              ...(itemTableApi.state.pagination as unknown as Record<string, unknown>),
              pageSize,
              current,
            },
          });
          itemTableApi.query();
        },
      },
      fetchApi: async (params?: Record<string, unknown>) => {
        const param = {
          pageNumber: params?.current as number,
          pageSize: params?.pageSize as number,
          keyword: formApi.formValues.keyword as string,
          referType: props.referType ?? businessType(),
          businessType: businessType(),
        };
        return cubeDailyInspectionService.getInspectItemTemplatePage(filterEmptyValues(param));
      },
    });
    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡检项名称",
        },
      },
    ];
    const [CubeForm, formApi] = useCubeForm({
      layout: "horizontal",
      handleSubmit: () => {
        itemTableApi.query();
      },
      handleReset: () => {
        itemTableApi.query();
      },
      schema: searchFormSchema,
      showCollapseButton: true,
    });
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title}`,
      width: "1000px",
      onConfirm: async () => {
        emit("enter", itemTableApi.getSelectedRows());
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
    });
    const openModal = (): void => {
      modalApi.open();
      itemTableApi.query();
    };
    expose({
      openModal,
    });
    const modalSlots = {
      default: (): JSX.Element => {
        return (
          <>
            <CubeForm />
            <ItemTable />
          </>
        );
      },
    };
    return (): JSX.Element => <CubeModal v-slots={modalSlots} />;
  },
});
