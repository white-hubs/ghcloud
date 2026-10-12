import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import type { ProductModel, BuildingDataVo, DeviceDataTypeVo } from "@ghcloud/cube-iot-center-service";
import type { AreaTree } from "@ghcloud/cube-mdata-service";
import type { DeptList } from "@ghcloud/cube-ouaa-service";
import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  PopOver,
  TreeSelect,
  Page,
  Modal,
  Select,
  Image,
  PopConfirm,
  type FormInstance,
} from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { AliasTable, UploadFile } from "@ghcloud/generic-component";

import { cubeDeviceSuperviseService, cubeMdataService, cubeOuaaService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { getBase64 } from "@/utils";

import styles from "./index.module.less";

interface StateVo {
  areaList: AreaTree[];
  dataSource: BuildingDataVo[];
  typeOptions: DeviceDataTypeVo[];
  deptList: DeptList[];
  loading: boolean;
  searchState: {
    keyword: string;
    deptId: string;
    areaId: string;
    type: string;
  };
  page: {
    pageSize: number;
    pageNumber: number;
    total: number;
  };
  imagePreview: boolean;
  imgSrc: string;
  modalState: {
    visible: boolean;
    productOptions: ProductModel[];
    formState: {
      name: string;
      type: null | string;
      areaId: string;
      deptId: string;
      fileIds: { id: string }[];
    };
  };
} // 设备实例列表 - 查询

export const BuildingData = defineComponent({
  // 组件的setup函数
  setup: () => {
    // 使用usePageName函数获取页面名称
    const { pageTitle } = usePageName();
    const formRef = ref<FormInstance>();
    const queryCache = useListQueryCache({
      defaults: {
        type: "",
        deptId: "",
        areaId: "",
        keyword: "",
        pageNumber: 1,
        pageSize: 10,
      },
      getState: () => ({
        type: state.searchState.type,
        deptId: state.searchState.deptId,
        areaId: state.searchState.areaId,
        keyword: state.searchState.keyword,
        pageNumber: state.page.pageNumber,
        pageSize: state.page.pageSize,
      }),
      setState: (next) => {
        state.searchState.type = (next.type as string) ?? "";
        state.searchState.deptId = (next.deptId as string) ?? "";
        state.searchState.areaId = (next.areaId as string) ?? "";
        state.searchState.keyword = (next.keyword as string) ?? "";
        state.page.pageNumber = Number(next.pageNumber ?? 1);
        state.page.pageSize = Number(next.pageSize ?? 10);
      },
    });
    const state = reactive<StateVo>({
      imagePreview: false,
      areaList: [],
      typeOptions: [],
      imgSrc: "",
      deptList: [],
      dataSource: [],
      searchState: {
        keyword: "",
        deptId: "",
        areaId: "",
        type: "",
      },
      loading: false,
      page: {
        pageSize: 10,
        pageNumber: 1,
        total: 0,
      },
      modalState: {
        visible: false,
        productOptions: [],
        formState: {
          name: "",
          type: null,
          areaId: "",
          deptId: "",
          fileIds: [],
        },
      },
    });
    const rules = {
      name: [{ required: true, message: "请输入资料名称" }],
      type: [{ required: true, message: "请选择资料类型" }],
      areaId: [{ required: true, message: "请选择所属区域" }],
      deptId: [{ required: true, message: "请选择所属部门" }],
      fileIds: [{ required: true, message: "请上传文件" }],
    };
    // 获取资料类型
    const getDataType = async (): Promise<void> => {
      try {
        const result = await cubeDeviceSuperviseService.getKnowledgeDataTypeList();
        state.typeOptions = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getRegionTreeList = async (): Promise<void> => {
      try {
        const result = await cubeMdataService.getAreaTree();
        state.areaList = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getDeviceBuildingDataList = async (): Promise<void> => {
      try {
        state.loading = true;
        const result = await cubeDeviceSuperviseService.getDeviceKnowledgeBuildingDataList({
          keyword: state.searchState.keyword,
          pageNumber: state.page.pageNumber,
          pageSize: state.page.pageSize,
          deptId: state.searchState.deptId,
          areaId: state.searchState.areaId,
          type: state.searchState.type,
        });
        state.dataSource = result.records;
        state.page.total = result.total;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      } finally {
        state.loading = false;
      }
    };
    // 获取部门列表
    const getDeptList = async (): Promise<void> => {
      try {
        const result = await cubeOuaaService.getDeptList();
        state.deptList = result;
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };

    const pageChange = (page: number, pageSize: number): void => {
      state.page.pageNumber = page;
      state.page.pageSize = pageSize;
      getDeviceBuildingDataList().then(() => {
        queryCache.sync();
      });
    };
    onMounted(async () => {
      getDataType();
      getDeptList();
      getRegionTreeList();
      await queryCache.hydrateAndQuery(getDeviceBuildingDataList);
    });
    const handleOk = async (): Promise<void> => {
      await formRef.value?.validate();
      const params = {
        ...state.modalState.formState,
        fileIds: state.modalState.formState.fileIds.map((item) => item.id),
      };
      await cubeDeviceSuperviseService.createDeviceKnowledgeBuildingFile(params);
      message.success("上传成功");
      formRef.value?.resetFields();
      state.modalState.visible = false;
      getDeviceBuildingDataList();
    };
    const handleSearch = async (): Promise<void> => {
      state.page.pageNumber = 1;
      await getDeviceBuildingDataList();
      await queryCache.sync();
    };
    const handleReset = async (): Promise<void> => {
      await queryCache.reset();
      await getDeviceBuildingDataList();
    };
    const handlePreview = (record: BuildingDataVo): void => {
      const typeList = ["jpg", "jpeg", "svg", "png", "gif", "tif", "pdf", "PDF"];
      if (!typeList.includes(record.format)) {
        message.error("该文件格式不支持预览");
        return;
      }
      if (record.format.toLowerCase() === "pdf") {
        window.open(record?.fileVO?.path);
        return;
      }
      state.imgSrc = record?.fileVO?.path as unknown as string;
      state.imagePreview = true;
    };

    const handleDownload = async (record: BuildingDataVo): Promise<void> => {
      if (!record.fileVO) return;
      const typeList = ["jpg", "jpeg", "svg", "png", "gif", "tif", "pdf"];
      // 适用于非图片和非pdf格式
      if (!typeList.includes(record?.fileVO?.type)) {
        const a = document.createElement("a");
        a.download = record.name;
        a.style.display = "none";
        a.href = record?.fileVO?.path;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        getBase64(record?.fileVO?.path, record.name);
      }
    };
    watch(
      () => state.modalState.formState.fileIds,
      () => {
        if (state.modalState.formState.fileIds.length) {
          formRef.value?.validateFields(["fileIds"]);
        }
      },
    );
    const handleDelete = async (record: BuildingDataVo): Promise<void> => {
      try {
        await cubeDeviceSuperviseService.deleteDeviceKnowledgeBuildingFile(record.id);
        message.success("删除成功");
        getDeviceBuildingDataList();
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const columns = [
      {
        title: "文档名称",
        dataIndex: "name",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "产品品类",
        dataIndex: "type",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "资料格式",
        dataIndex: "format",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "资料大小",
        dataIndex: "size",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属部门",
        dataIndex: "deptsName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所属区域",
        dataIndex: "areasName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "上传人",
        dataIndex: "submitter",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || ""}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        dataIndex: "action",
        title: "操作",
        slots: {
          customRender: "action",
        },
        fixed: "right",
        customRender: ({ record }: { record: BuildingDataVo }): JSX.Element => {
          return (
            <>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  handleDownload(record);
                }}
              >
                下载
              </Button>
              <Button
                style={{
                  padding: "4px",
                }}
                type="link"
                onClick={() => {
                  handlePreview(record);
                }}
              >
                预览
              </Button>
              <PopConfirm title="是否确认删除?" ok-text="确定" cancel-text="取消" onConfirm={async () => handleDelete(record)}>
                <Button type="link" danger style={{ padding: "4px" }}>
                  删除
                </Button>
              </PopConfirm>
            </>
          );
        },
      },
    ];

    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <Button
            type="primary"
            onClick={() => {
              state.modalState.visible = true;
            }}
          >
            新增
          </Button>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <div class={styles.content}>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem label="资料类型" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Select
                  allowClear
                  v-model:value={state.searchState.type}
                  style={{ width: "200px" }}
                  options={state.typeOptions}
                  fieldNames={{
                    label: "typeName",
                    value: "id",
                  }}
                />
              </FormItem>
              <FormItem label="所属部门" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Select
                  allowClear
                  v-model:value={state.searchState.deptId}
                  style={{ width: "200px" }}
                  options={state.deptList}
                  fieldNames={{
                    label: "name",
                    value: "id",
                  }}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }} label="所属区域">
                <TreeSelect
                  v-model:value={state.searchState.areaId}
                  treeData={state.areaList}
                  fieldNames={{
                    children: "children",
                    label: "name",
                    value: "id",
                  }}
                  style={{ width: "200px" }}
                />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={state.searchState.keyword} placeholder="资料名称" showCount={false} />
              </FormItem>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Button type="primary" onClick={handleSearch}>
                  查询
                </Button>
                <Button style={{ marginLeft: "10px" }} onClick={handleReset}>
                  重置
                </Button>
              </FormItem>
            </Form>
            <AliasTable
              rowKey="id"
              dataSource={state.dataSource}
              columns={columns}
              loading={state.loading}
              applicationCode="KNOWLEDGE_DOCUMENT"
              tableCode="DEVICE_DOCUMENT"
            />
          </div>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-show={state.page.total > 0}
            v-model:current={state.page.pageNumber}
            v-model:pageSize={state.page.pageSize}
            v-model:total={state.page.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    return (): JSX.Element => (
      <Layout v-slots={layoutSlots} class={styles.container} title={pageTitle}>
        <Modal v-model:visible={state.modalState.visible} onOk={handleOk} width="500px" title="新增">
          <Form rules={rules} model={state.modalState.formState} ref={formRef}>
            <FormItem label="文档名称" name="name">
              <Input v-model:value={state.modalState.formState.name} showCount={false} maxlength={500} />
            </FormItem>
            <FormItem label="资料类型" name="type">
              <Select
                v-model:value={state.modalState.formState.type}
                options={state.typeOptions}
                fieldNames={{
                  label: "typeName",
                  value: "id",
                }}
              />
            </FormItem>

            <FormItem label="所属区域" name="areaId">
              <TreeSelect
                treeData={state.areaList}
                v-model:value={state.modalState.formState.areaId}
                fieldNames={{
                  children: "children",
                  label: "name",
                  value: "id",
                }}
                style={{ width: "100%" }}
              />
            </FormItem>
            <FormItem label="所属部门" name="deptId">
              <Select
                v-model:value={state.modalState.formState.deptId}
                options={state.deptList}
                fieldNames={{
                  label: "name",
                  value: "id",
                }}
              />
            </FormItem>
            <FormItem label="上传文件" name="fileIds">
              <UploadFile v-model:value={state.modalState.formState.fileIds} maxCount={1} type="picture-card" showPlaceholder={false} />
            </FormItem>
          </Form>
        </Modal>
        {/* 图片预览 */}
        <Modal v-model:visible={state.imagePreview} centered footer={null} title="图片预览">
          <div class={styles.imgCtr}>
            <Image src={state.imgSrc} width="200" height="200" preview={false} />
          </div>
        </Modal>
      </Layout>
    );
  },
});
