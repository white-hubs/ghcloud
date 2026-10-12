import dayjs from "dayjs";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import type { AreaTree, DeptList } from "@ghcloud/cube-ouaa-service";
import type { CodeStylePage, RiskSourceLedgerVO } from "@ghcloud/cube-risk-management-service";
import {
  Button,
  Form,
  Select,
  FormItem,
  Input,
  PopOver,
  PopConfirm,
  Page,
  SelectOption,
  message,
  Cascader,
  Upload,
  UploadOutlined,
  DatePicker,
} from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { cubeIdentityService, cubeMdataService, cubeOuaaService, cubePropertyService, cubeTypeService } from "@/api/service";
import { Layout } from "@/components/layout/layout";

import style from "./index.module.less";

export const RiskLedger = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const router = useRouter();
    const formState = reactive<{
      status: string | undefined;
      keyword: string | undefined;
      typeCode: string[];
      maintenanceDepId: string | undefined;
      receiveDepId: string | undefined;
      areaId: string[] | undefined;
      receiveUserType: string[] | undefined;
      purchasingDate: string | undefined;
      usageDate: string | undefined;
    }>({
      status: undefined,
      keyword: undefined,
      maintenanceDepId: undefined,
      receiveDepId: undefined,
      areaId: undefined,
      receiveUserType: undefined,
      purchasingDate: undefined,
      usageDate: undefined,
      typeCode: [],
    });
    const tableLoading = ref(false);
    const loadTemplateLoading = ref(false);
    const codeLoading = ref(false);
    const areaOptions = ref<AreaTree[]>([]);
    const riskType = ref([]);
    const selectedRowData = ref<RiskSourceLedgerVO[]>([]);
    const selectedRowKeysData = ref<number[]>([]);
    const pagination = reactive({
      pageSize: 1000,
      pageNumber: 1,
      total: 0,
    });
    const detailsRow = async (record: RiskSourceLedgerVO): Promise<void> => {
      router.push({
        path: "/risk-details",
        query: {
          id: record.id,
        },
      });
    };
    const editRow = (record: RiskSourceLedgerVO): void => {
      router.push({
        path: "/risk-add",
        query: {
          type: "edit",
          id: record.id,
        },
      });
    };
    const getRiskList = async (): Promise<void> => {
      tableLoading.value = true;
      const params = {
        ...formState,
        purchasingDate: formState.purchasingDate ?? undefined,
        usageDate: formState.usageDate ?? undefined,
        areaId: formState?.areaId ? formState.areaId[formState.areaId.length - 1] : undefined,
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        typeCode: formState?.typeCode ? formState.typeCode[formState.typeCode.length - 1] : "",
      };
      const res = await cubePropertyService.riskSourceLedgerPage(params);
      pagination.total = res.total;
      selectedRowData.value = res.records.map((item: RiskSourceLedgerVO, index: number) => {
        return {
          index: index + 1,
          ...item,
        };
      });
      tableLoading.value = false;
    };
    const delRow = async (record: RiskSourceLedgerVO): Promise<void> => {
      if (record.id) {
        await cubePropertyService.riskSourceLedgerDelete([record.id]);
        message.success("删除成功");
        await getRiskList();
      }
    };
    const addRisk = (): void => {
      router.push({
        path: "/risk-add",
        query: {
          type: "add",
        },
      });
    };
    const loadingBatch = ref(false);
    const batchDelete = async (): Promise<void> => {
      loadingBatch.value = true;
      try {
        await cubePropertyService.riskSourceLedgerDelete(selectedRowKeysData.value);
        loadingBatch.value = false;
      } finally {
        loadingBatch.value = false;
      }
      selectedRowKeysData.value.length = 0;
      message.success("删除成功");
      await getRiskList();
    };
    const downloadTemplate = async (): Promise<void> => {
      loadTemplateLoading.value = true;
      const res = await cubePropertyService.getTemplateExcel();
      const blob = new Blob([res], {
        type: "application/xls;charset-UTF-8",
      });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "风险台账模板.xlsx";
      a.style.display = "none";
      a.click();
      URL.revokeObjectURL(blobUrl);
      loadTemplateLoading.value = false;
    };
    const getRiskClassification = async (): Promise<void> => {
      const res = await cubeTypeService.getType({ itemCode: "risk-source-type" });
      riskType.value = res;
    };

    const selectedRowsData = ref<RiskSourceLedgerVO[]>([]);
    const rowSelection = reactive({
      selectedRowKeys: selectedRowKeysData.value,
      preserveSelectedRowKeys: true,
      onChange: (selectedRowKeys: number[], selectedRows: RiskSourceLedgerVO[]) => {
        selectedRowKeysData.value.length = 0;
        selectedRowsData.value.length = 0;
        selectedRowKeysData.value.push(...selectedRowKeys);
        selectedRowsData.value.push(...selectedRows);
      },
    });
    const columns = [
      {
        title: "序号",
        dataIndex: "index",
        align: "center",
        customRender: ({ text }: { text: string; record: { devNum: string; groupId?: string } }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "风险源编码",
        dataIndex: "serialNumber",
        align: "center",
        defaultVisible: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "模型编码",
        dataIndex: "bimCode",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "风险源名称",
        dataIndex: "name",
        defaultVisible: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "风险源分类",
        dataIndex: "typeName",
        defaultVisible: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "所在区域",
        dataIndex: "areaName",
        defaultVisible: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "关联档位",
        dataIndex: "stallName",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "关联现场点",
        dataIndex: "sitePointName",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "详细位置",
        dataIndex: "attribute",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "维护部门",
        dataIndex: "maintenanceDepName",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "使用部门",
        dataIndex: "receiveDepName",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "使用人",
        dataIndex: "receiveUserName",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "使用人类型",
        dataIndex: "receiveUserType",
        defaultVisible: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          let res = "";
          if (!text) {
            res = "--";
          }
          if (text.length) {
            res = text === "MERCHANT" ? "商户" : "市场人员";
          }
          return <PopOver content={res}>{res}</PopOver>;
        },
      },
      {
        title: "联系方式",
        dataIndex: "receiveUserPhone",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "购买日期",
        dataIndex: "purchasingDate",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={dayjs(text).format("YYYY-MM-DD")}>{text ? dayjs(text).format("YYYY-MM-DD") : "--"}</PopOver>;
        },
      },
      {
        title: "到期日期",
        dataIndex: "usageDate",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={dayjs(text).format("YYYY-MM-DD")}>{text ? dayjs(text).format("YYYY-MM-DD") : "--"}</PopOver>;
        },
      },
      {
        title: "状态",
        dataIndex: "status",
        defaultVisible: true,
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text === "EXPIRE" ? "已过期" : "未过期"}>{text === "EXPIRE" ? "已过期" : "未过期"}</PopOver>;
        },
      },
      {
        title: "生产厂家",
        dataIndex: "produceFactory",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "配送公司",
        dataIndex: "deliveryCompany",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "生产厂家地址",
        dataIndex: "produceAddress",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "配送公司地址",
        dataIndex: "deliveryAddress",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text}>{text}</PopOver>;
        },
      },
      {
        title: "最近修改时间",
        dataIndex: "updateTime",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={dayjs(text).format("YYYY-MM-DD")}>{dayjs(text).format("YYYY-MM-DD")}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        align: "center",
        defaultVisible: true,
        width: 200,
        customRender: ({ record }: { record: RiskSourceLedgerVO }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  detailsRow(record);
                }}
              >
                详情
              </Button>
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
          );
        },
      },
    ];
    const deptList = ref<DeptList[]>([]);
    const statusList = ref([
      {
        id: "EXPIRE",
        name: "已过期",
      },
      {
        id: "NORMAL",
        name: "未过期",
      },
    ]);
    const userType: { name: string; id: string }[] = [
      {
        name: "商户",
        id: "MERCHANT",
      },
      {
        name: "市场人员",
        id: "MARKET",
      },
    ];
    const styleRowData = ref<CodeStylePage[]>([]);
    const pageChange = (pageNumber: number): void => {
      pagination.pageNumber = pageNumber || 1;
      selectedRowData.value.length = 0;
      getRiskList();
    };
    const showSizeChange = (current: number, pageNumber: number): void => {
      pagination.pageNumber = 1;
      selectedRowData.value.length = 0;
      pagination.pageSize = pageNumber;
      // getRiskList()
    };
    const resetting = (): void => {
      formState.status = undefined;
      formState.keyword = undefined;
      formState.maintenanceDepId = undefined;
      formState.areaId = undefined;
      formState.receiveDepId = undefined;
      formState.usageDate = undefined;
      formState.receiveUserType = undefined;
      formState.purchasingDate = undefined;
      formState.typeCode = [];
      pagination.pageNumber = 1;
      getRiskList();
    };
    const nameQuery = (): void => {
      pagination.pageNumber = 1;
      getRiskList();
    };

    const getDeptData = async (): Promise<void> => {
      const res = await cubeOuaaService.getDeptList();
      deptList.value = res;
    };
    const getQrcodeStyle = async (): Promise<void> => {
      const res = await cubeIdentityService.codeStylePage({ pageNumber: 1, pageSize: 1000 });
      styleRowData.value = res.records;
    };
    const getAreaData = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree();
      areaOptions.value = res;
    };
    // 上传数据
    const fileUpload = async (options: { file: File; onProgress: (arg0: { percent: number }) => void }): Promise<void> => {
      const file = options.file;
      const progress = { percent: 1 };
      const speed = 100 / (file.size / 65000);
      const intervalId = setInterval(() => {
        if (progress.percent < 100) {
          progress.percent += speed;
          options.onProgress(progress);
        } else {
          clearInterval(intervalId);
        }
      }, 100);
      const formData = new FormData();
      formData.append("file", file);
      cubePropertyService
        .importTemplate(formData as unknown as Record<string, FormData>)
        .then(async () => {
          await getRiskList();
          message.success("导入成功");
        })
        .catch((e) => {
          message.error(e.errorMessage);
        });
    };
    const handleOk = async (): Promise<void> => {
      if (selectedRowKeysData.value.length) {
        const params = {
          entityType: "RISK_SOURCE",
          entityInfo: selectedRowsData.value.map((item: RiskSourceLedgerVO) => {
            return {
              entityId: item.id,
              entityName: item.name,
              serialNumber: item.serialNumber,
            };
          }),
        };
        codeLoading.value = true;
        try {
          const res = await cubeIdentityService.generateBatch(params);
          if (res) {
            saveQrcodeZip(res);
          }
        } catch (error) {
          message.error((error as { errorMessage: string })?.errorMessage ?? "下载失败");
        } finally {
          codeLoading.value = false;
        }
      } else {
        message.warning("请选择要下载的二维码");
      }
    };
    const saveQrcodeZip = (blob: Blob): void => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "二维码.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };
    const scrollY = ref<number>(200);
    const getScrollY = (): void => {
      const ele = document.getElementById("appContainer");
      const height = ele?.clientHeight;
      if (height) {
        scrollY.value = height - 320;
      }
    };
    onMounted(async () => {
      getScrollY();
      await getDeptData();
      await getRiskClassification();
      await getRiskList();
      await getAreaData();
      getQrcodeStyle();
    });

    window.onresize = (): void => {
      getScrollY();
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <div style={{ display: "flex" }}>
            <Button type="primary" onClick={addRisk}>
              新增
            </Button>
            <Button class={style.ml10} loading={codeLoading.value} type="primary" onClick={handleOk}>
              下载二维码
            </Button>
            <Button loading={loadTemplateLoading.value} class={style.ml10} type="primary" onClick={downloadTemplate}>
              下载模板
            </Button>
            <Upload
              name="file"
              showUploadList={false}
              // 限制文件格式
              accept=".xlsx,.xls"
              // 自定义上传行为
              customRequest={fileUpload}
            >
              <Button class={style.ml10} type="primary">
                <UploadOutlined />
                导入
              </Button>
            </Upload>
          </div>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <div class={style.head_search}>
              <Form layout="inline" model={formState} class={style.head_search_form}>
                <FormItem label="风险源分类">
                  <Cascader
                    v-model:value={formState.typeCode}
                    field-names={{ label: "name", value: "code", children: "nextList" }}
                    changeOnSelect
                    options={riskType.value}
                    placeholder="请选择风险源分类"
                  />
                </FormItem>
                <FormItem label="所在区域">
                  <Cascader
                    v-model:value={formState.areaId}
                    changeOnSelect
                    field-names={{ label: "name", value: "id", children: "children" }}
                    options={areaOptions.value}
                    placeholder="请选择区域"
                  />
                </FormItem>
                <FormItem label="维护部门">
                  <Select
                    v-model:value={formState.maintenanceDepId}
                    show-search
                    optionFilterProp="label"
                    placeholder="请选择部门"
                    allowClear
                    style={{ width: "100px" }}
                  >
                    {deptList.value.map((item: { id: string; name: string }) => {
                      return (
                        <SelectOption value={item.id} label={item.name} key={item.name}>
                          {item.name}
                        </SelectOption>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem label="使用部门">
                  <Select
                    v-model:value={formState.receiveDepId}
                    show-search
                    optionFilterProp="label"
                    placeholder="请选择部门"
                    allowClear
                    style={{ width: "100px" }}
                  >
                    {deptList.value.map((item: { id: string; name: string }) => {
                      return (
                        <SelectOption value={item.id} label={item.name} key={item.name}>
                          {item.name}
                        </SelectOption>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem label="状态">
                  <Select style={{ width: "100px" }} show-search optionFilterProp="label" v-model:value={formState.status}>
                    {statusList.value.map((item: { id: string; name: string }) => {
                      return (
                        <SelectOption value={item.id} label={item.name} key={item.name}>
                          {item.name}
                        </SelectOption>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem label="使用人类型">
                  <Select style={{ width: "100px" }} show-search optionFilterProp="label" v-model:value={formState.receiveUserType}>
                    {userType.map((item: { id: string; name: string }) => {
                      return (
                        <SelectOption value={item.id} label={item.name} key={item.name}>
                          {item.name}
                        </SelectOption>
                      );
                    })}
                  </Select>
                </FormItem>
                <FormItem label="购买日期">
                  <DatePicker style={{ width: "150px" }} v-model:value={formState.purchasingDate} />
                </FormItem>
                <FormItem label="到期日期">
                  <DatePicker style={{ width: "150px" }} v-model:value={formState.usageDate} />
                </FormItem>
                <FormItem>
                  <Input v-model:value={formState.keyword} placeholder="编码、名称、使用人、车牌号" />
                </FormItem>
                <FormItem>
                  <Button type="primary" onClick={nameQuery}>
                    查询
                  </Button>
                  <Button class={style.ml10} onClick={resetting}>
                    重置
                  </Button>
                </FormItem>
              </Form>
            </div>
            <AliasTable
              tableCode="RISK_LEDGER"
              applicationCode={__ENV__.applicationCode}
              scrollY={scrollY.value}
              loading={tableLoading.value}
              rowSelection={rowSelection}
              rowKey="id"
              pagination={false}
              columns={columns}
              dataSource={selectedRowData.value}
            />
          </>
        );
      },
      "footer-btn": (): JSX.Element => {
        return (
          <>
            <PopConfirm title="确认删除吗？" onConfirm={batchDelete}>
              <Button loading={loadingBatch.value} disabled={selectedRowKeysData.value.length === 0} danger type="primary">
                批量删除
              </Button>
            </PopConfirm>
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <>
            <Page
              class="pagePosition"
              v-model:current={pagination.pageNumber}
              v-model:pageSize={pagination.pageSize}
              v-model:total={pagination.total}
              onShowSizeChange={showSizeChange}
              onPageChange={pageChange}
            />
          </>
        );
      },
    };
    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} showFooter />
      </>
    );
  },
});
