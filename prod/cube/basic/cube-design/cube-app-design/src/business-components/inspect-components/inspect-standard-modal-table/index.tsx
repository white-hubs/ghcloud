import { defineComponent, ref } from "vue";

import { InspectBusinessType } from "@ghcloud/cube-daily-inspection-service";
import { PopOver, message } from "@ghcloud/cube-ui";

import { cubeDailyInspectionService } from "../../../api/service";
import { useCubeForm } from "../../../base-components/cube-form/use-form";
import { useCubeModal } from "../../../base-components/cube-modal/use-modal";
import { useCubeTable } from "../../../base-components/cube-table/use-table";
import { filterEmptyValues } from "../../../utils";
interface Props {
  title: string;
  businessType?: InspectBusinessType;
  targetCategory?: string;
}
/** 巡检标准表格弹窗 */
export const InspectStandardModalTable = defineComponent({
  props: ["title", "businessType", "targetCategory"],
  emits: ["enter", "cancel"],
  setup(props: Props, { emit, expose }) {
    const targetType = ref();
    const targetCategory = ref<string>(props.targetCategory ?? InspectBusinessType.SMALL_ENGINEERING);
    const businessType = (): InspectBusinessType => props.businessType ?? InspectBusinessType.SMALL_ENGINEERING;
    const columns = [
      {
        dataIndex: "name",
        title: "巡检标准",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
    ];
    const searchFormSchema = [
      {
        component: "Input",
        label: "",
        fieldName: "keyword",
        componentProps: {
          placeholder: "巡检标准名称",
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
      fetchApi: async () => {
        const params = {
          pageNumber: 1,
          pageSize: 10,
          keyword: formApi.formValues.keyword as string,
          businessType: businessType(),
        };
        return cubeDailyInspectionService.getInspectStandardPage(filterEmptyValues(params));
      },
    });
    const saveLoading = ref(false);
    const handleOk = async (): Promise<void> => {
      try {
        const params = {
          standardIds: itemTableApi.getSelectedRowKeys(),
          targetType: targetType.value + "",
          targetCategory: targetCategory.value,
          businessType: businessType(),
        };
        await cubeDailyInspectionService.relatedInspectStandard(params);
        message.success("操作成功");
      } catch (error) {
        message.error((error as { errorMessage: string })?.errorMessage ?? "操作失败");
      } finally {
        saveLoading.value = false;
      }
    };
    const [CubeModal, modalApi] = useCubeModal({
      title: `${props.title ?? "关联巡检标准"}`,
      width: "1000px",
      onConfirm: async () => {
        await handleOk();
        emit("enter", itemTableApi.getSelectedRows());
        modalApi.close();
      },
      onCancel: () => {
        emit("cancel");
        modalApi.close();
      },
    });
    const getData = async (): Promise<void> => {
      try {
        const params = {
          targetType: targetType.value,
          targetCategory: targetCategory.value,
          businessType: businessType(),
        };
        const res = await cubeDailyInspectionService.getInspectStandardList(params);
        if (res) {
          itemTableApi.setSelectedRowKeys(res?.map((item) => (item as { id: string })?.id));
        }
      } catch {}
    };
    const openModal = (type: string, name: string, category?: string): void => {
      targetType.value = type;
      targetCategory.value = category ?? props.targetCategory ?? InspectBusinessType.SMALL_ENGINEERING;
      getData();
      modalApi.setState({ title: `关联巡检标准-${name}` });
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
