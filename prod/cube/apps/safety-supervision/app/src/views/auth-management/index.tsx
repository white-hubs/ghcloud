import { defineComponent, nextTick, onMounted, reactive, ref } from "vue";

import {
  Button,
  DatePicker,
  Form,
  FormItem,
  Image,
  Input,
  InputNumber,
  Modal,
  Page,
  PopConfirm,
  PopOver,
  Switch,
  Table,
  message,
} from "@ghcloud/cube-ui";
import { usePageName, useListQueryCache } from "@ghcloud/cube-utils";
import { Layout, useMapModal } from "@ghcloud/generic-component";

import { StyleModal } from "./components/style-modal";
import Upload from "./upload";
import { addmarket as addMarket, deletemarket as deleteMarket, getmarketlist as getMarketList, putmarket as putMarket } from "@/api/auth";
import "@amap/amap-jsapi-types";

import { useTableScroll } from "@/hook/use-table-scroll";

import "@/styles/monthly-report.less";

export const MonthlyLink = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const { showMapModal } = useMapModal();
    interface MarketType {
      id: string;
      marketName: string;
      marketCode: string;
      marketTenant: string;
      url: string;
      account: string;
      password: string;
      coordinate: string;
      fileIds: string;
      files?: any;
      address: string;
      foundTime: string;
      marketArea: number;
      status: boolean;
    }
    const addMarketData = reactive<MarketType>({
      status: true,
      marketName: "",
      marketCode: "",
      url: "",
      account: "",
      password: "",
      coordinate: "",
      id: "",
      marketTenant: "",
      fileIds: "",
      files: [{ path: "" }],
      address: "",
      foundTime: "",
      marketArea: 0,
    });
    const columns = [
      {
        title: "序号",
        align: "center",
        width: 70,
        customRender: ({ index }: { index: number }): string => `${index + 1}`,
      },
      {
        title: "市场名称",
        dataIndex: "marketName",
        ellipsis: true,
        customRender: ({ text }: { text: string }): JSX.Element => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "经纬度",
        dataIndex: "coordinate",
        key: "coordinate",
        align: "center",
        customRender: ({ text }: { text: string }): JSX.Element => {
          return (
            <PopOver content={text}>
              <span>{text || "--"}</span>
            </PopOver>
          );
        },
      },
      {
        title: "操作",
        align: "center",
        dataIndex: "action",
        customRender: ({ record }: { record: MarketType }): JSX.Element => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  edit(record);
                }}
              >
                编辑
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  set(record);
                }}
              >
                配置
              </Button>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  showStyleModal(record);
                }}
              >
                样式设置
              </Button>
              <PopConfirm
                title="你确定删除当前市场?"
                okText="确定"
                cancelText="取消"
                onConfirm={() => {
                  deleteMarketById(record.id);
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
    const marketCode = async (_rule: string, value: string): Promise<string> => {
      if (value === "") {
        return Promise.reject("请输入市场code");
      } else if (!/\D/.test(value)) {
        return Promise.reject("不能输入纯数字");
      } else {
        return Promise.resolve("");
      }
    };
    const rules = {
      marketName: [{ required: true, message: "请输入市场名称", trigger: "change" }],
      marketArea: [{ required: true, message: "请输入市场面积", trigger: "change" }],
      marketCode: [{ required: true, validator: marketCode, trigger: "change" }],
      marketTenant: [{ required: true, message: "请输入租户", trigger: "change" }],
      fileIds: [{ required: true, message: "请上传文件", trigger: "change" }],
      coordinate: [{ required: true, message: "请输入市场经纬度", trigger: "change" }],
    };
    const setRules = {
      password: [{ required: true, message: "请输入key", trigger: "change" }],
      account: [{ required: true, message: "请输入appid", trigger: "change" }],
      url: [{ required: true, message: "请输入url", trigger: "change" }],
    };
    const edit = (record: MarketType): void => {
      showImg.value = true;
      Object.assign(addMarketData, record);
      addMarketData.fileIds = record.files.length > 0 ? record.files[0].id : "";
      marketVisible.value = true;
      titleMarket.value = "编辑市场";
      nextTick(() => {
        setTimeout(() => {
          uploaddata.value.setlist();
        });
      });
    };
    const set = (record: MarketType): void => {
      Object.assign(addMarketData, record);
      setMarketVisible.value = true;
    };
    const deleteMarketById = async (id: string): Promise<void> => {
      await deleteMarket(id);
      getTableData();
    };
    const loading = ref(false);
    const showImg = ref(true);
    const addLoading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
      keyword: "",
    });
    const queryCache = useListQueryCache({
      defaults: {
        pageNumber: 1,
        pageSize: 10,
        keyword: "",
      },
      getState: () => ({
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        keyword: pagination.value.keyword,
      }),
      setState: (next) => {
        pagination.value.pageNumber = Number(next.pageNumber ?? 1);
        pagination.value.pageSize = Number(next.pageSize ?? 10);
        pagination.value.keyword = (next.keyword as string) ?? "";
      },
    });
    const getTableData = async (): Promise<void> => {
      try {
        const { data } = await getMarketList(pagination.value);
        addLoading.value = false;
        pagination.value.total = data.total;
        dataSource.value = data.records;
        loading.value = true;
      } catch {
      } finally {
        loading.value = false;
      }
    };
    const pageChange = (pageNumber: number, pageSize: number): void => {
      pagination.value.pageNumber = pageNumber || 1;
      pagination.value.pageSize = pageSize;
      getTableData().then(() => {
        queryCache.sync();
      });
    };
    const queryForm = async (): Promise<void> => {
      pagination.value.pageNumber = 1;
      await getTableData();
      await queryCache.sync();
    };
    const reset = async (): Promise<void> => {
      await queryCache.reset();
      await getTableData();
    };
    const { scorllY } = useTableScroll();
    onMounted(async () => {
      await queryCache.hydrateAndQuery(getTableData);
    });
    const marketVisible = ref(false);

    const titleMarket = ref("");
    const uploaddata = ref();
    const addMarketOpen = (): void => {
      Object.assign(addMarketData, {
        marketName: "",
        marketCode: "",
        marketTenant: "",
        url: "",
        account: "",
        password: "",
        coordinate: "",
        fileIds: "",
        files: [],
        address: "",
        foundTime: "",
      });
      titleMarket.value = "新增市场";
      marketVisible.value = true;
      nextTick(() => {
        uploaddata.value.setlist();
      });
    };

    const styleModalRef = ref<{ openModal: (record: unknown) => void }>();
    const showStyleModal = (record: unknown): void => {
      styleModalRef.value?.openModal(record);
    };
    const layoutSlots = {
      "layout-header": (): JSX.Element => {
        return (
          <>
            <Button type="primary" onClick={addMarketOpen}>
              新增
            </Button>
          </>
        );
      },
      "layout-content": (): JSX.Element => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={pagination.value.keyword} placeholder="请输入市场标题" showCount={false} />
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
            <Table
              columns={columns}
              loading={loading.value}
              dataSource={dataSource.value}
              pagination={false}
              size="small"
              scrollY={scorllY.value}
            />
          </>
        );
      },
      "footer-page": (): JSX.Element => {
        return (
          <Page
            v-model:current={pagination.value.pageNumber}
            v-model:pageSize={pagination.value.pageSize}
            v-model:total={pagination.value.total}
            onPageChange={pageChange}
          />
        );
      },
    };
    const formRef = ref();
    const setFormRef = ref();
    const setMarketVisible = ref(false);
    const ok = async (): Promise<void> => {
      formRef.value.validate().then(async () => {
        addLoading.value = true;
        if (titleMarket.value !== "新增市场") {
          putMarket(addMarketData)
            .then(() => {
              marketVisible.value = false;
              getTableData();
            })
            .catch((res) => {
              addLoading.value = false;
              for (const key in res.data.data) {
                message.error(res.data.data[key]);
              }
            });
        } else {
          addMarket(addMarketData)
            .then(() => {
              marketVisible.value = false;
              getTableData();
            })
            .catch((res) => {
              addLoading.value = false;
              for (const key in res.data.data) {
                message.error(res.data.data[key]);
              }
            });
        }
      });
    };
    const setOk = async (): Promise<void> => {
      setFormRef.value.validate().then(async () => {
        await putMarket(addMarketData);
        setMarketVisible.value = false;
        getTableData();
      });
    };
    const cancel = (): void => {
      marketVisible.value = false;
      setMarketVisible.value = false;
    };
    const getPosition = (): void => {
      nextTick(() => {
        const center = addMarketData.coordinate ? addMarketData.coordinate.split(",") : ["114.057939", "22.543527"];
        showMapModal({
          title: "获取经纬度",
          address: addMarketData.address,
          center: {
            lat: Number(center[1]),
            lng: Number(center[0]),
          },
          modalConfirm: (confirmData) => {
            addMarketData.address = confirmData.address;
            addMarketData.coordinate = `${confirmData.lng},${confirmData.lat}`;
          },
        });
      });
    };
    const labelCol = { style: { width: "100px" } };
    const wrapperCol = { span: 20 };

    return (): JSX.Element => (
      <>
        <Layout title={pageTitle} v-slots={layoutSlots} />
        <Modal visible={marketVisible.value} title={titleMarket.value} confirmLoading={addLoading.value} onOk={ok} onCancel={cancel}>
          <Form label-col={labelCol} wrapper-col={wrapperCol} model={addMarketData} rules={rules} ref={formRef} layout="horizontal">
            <FormItem label="市场名称:" name="marketName">
              <Input v-model:value={addMarketData.marketName} maxlength={20} />
            </FormItem>
            <FormItem label="市场code:" name="marketCode">
              <Input v-model:value={addMarketData.marketCode} maxlength={20} />
            </FormItem>
            <FormItem label="租户编号:" name="marketTenant">
              <InputNumber v-model:value={addMarketData.marketTenant} max={999999999} />
            </FormItem>
            <FormItem label="是否开启:">
              <Switch v-model:value={addMarketData.status} />
            </FormItem>
            <FormItem label="市场面积:" name="marketArea">
              <InputNumber v-model:value={addMarketData.marketArea} max={999999} />
            </FormItem>
            <FormItem label="成立时间:">
              <DatePicker v-model:value={addMarketData.foundTime} format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
            </FormItem>
            <FormItem label="市场图片:" name="fileIds">
              <div style="display:flex">
                {showImg.value && titleMarket.value === "编辑市场" ? (
                  <Image src={addMarketData.files[0]?.path} style="width:105px;height:105px" />
                ) : (
                  <span />
                )}
                {marketVisible ? (
                  <Upload
                    v-model:value={addMarketData.fileIds}
                    ref={uploaddata}
                    onChange={() => {
                      showImg.value = false;
                    }}
                  />
                ) : (
                  <span />
                )}
              </div>
            </FormItem>
            <FormItem label="获取经纬度:">
              <Button onClick={getPosition}>获取经纬度</Button>
            </FormItem>
            <FormItem label="经纬度:" name="coordinate">
              <Input v-model:value={addMarketData.coordinate} disabled maxlength={100} showCount={false} />
            </FormItem>
            <FormItem label="市场位置:">
              <Input v-model:value={addMarketData.address} placeholder="请输入市场位置" maxlength={200} />
            </FormItem>
          </Form>
        </Modal>
        <Modal visible={setMarketVisible.value} title={titleMarket.value} onOk={setOk} onCancel={cancel}>
          <Form label-col={labelCol} wrapper-col={wrapperCol} model={addMarketData} rules={setRules} ref={setFormRef}>
            <FormItem label="服务器地址:" name="url">
              <Input v-model:value={addMarketData.url} maxlength={1000} showCount={false} />
            </FormItem>

            <FormItem label="appid:" name="account">
              <Input v-model:value={addMarketData.account} maxlength={1000} showCount={false} />
            </FormItem>
            <FormItem label="key:" name="password">
              <Input v-model:value={addMarketData.password} maxlength={1000} showCount={false} />
            </FormItem>
          </Form>
        </Modal>
        <StyleModal ref={styleModalRef} onEnter={() => getTableData()} />
      </>
    );
  },
});
