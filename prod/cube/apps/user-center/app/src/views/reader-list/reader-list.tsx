import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import { Button, Form, FormItem, Input, Page, PopOver, message } from "@ghcloud/cube-ui";
import { queryParameter } from "@ghcloud/cube-utils";
import { AliasTable } from "@ghcloud/generic-component";

import { ReaderInfoModal } from "./reader-info-modal";
import { cubeUserCenterService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { usePageName } from "@/hook/use-page-name";
import { useTableScroll } from "@/hook/use-table-scroll";

/** 读者列表 */
export const ReaderList = defineComponent({
  setup: () => {
    const route = useRoute();
    const tableCode = route.path.replaceAll("/", "");
    const { title: pageTitle } = usePageName();
    const formState = reactive({
      mobile: "",
      keyword: "",
    });
    const genderData: Record<string, unknown> = {
      MALE: "男",
      FEMALE: "女",
      NONE: "保密",
    };
    const columns = [
      {
        title: "姓名",
        dataIndex: "name",
        ellipsis: true,
        width: 180,
        fixed: "left",
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "手机号",
        dataIndex: "mobile",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }) => {
          return <PopOver content={text || "--"}>{text || "--"}</PopOver>;
        },
      },
      {
        title: "性别",
        dataIndex: "gender",
        ellipsis: true,
        width: 180,
        customRender: ({ text }: { text: string }) => {
          const txtVal = genderData[text];
          return <PopOver content={txtVal || "--"}>{txtVal || "--"}</PopOver>;
        },
      },
      {
        title: "操作",
        dataIndex: "action",
        width: 180,
        ellipsis: true,
        customRender: ({ record }: { record: { id: number } }) => {
          return (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  detailRow(record);
                }}
              >
                详情
              </Button>
            </>
          );
        },
      },
    ];

    const loading = ref(false);
    const dataSource = ref<unknown[]>([]);
    const pagination = ref({
      pageSize: 10,
      pageNumber: 1,
      total: 0,
    });

    const writeCache = (): void => {
      const query: Record<string, unknown> = {
        pageNumber: pagination.value.pageNumber,
        pageSize: pagination.value.pageSize,
        keyword: formState.keyword,
        mobile: formState.mobile,
      };
      if (query.pageNumber === 1) delete query.pageNumber;
      if (query.pageSize === 10) delete query.pageSize;
      if (!query.keyword) delete query.keyword;
      if (!query.mobile) delete query.mobile;
      queryParameter.setAddressQuery(query);
    };

    const readCache = (): void => {
      const cache = queryParameter.getQuery() || {};
      if (cache.pageNumber) {
        pagination.value.pageNumber = Number(cache.pageNumber);
      }
      if (cache.pageSize) {
        pagination.value.pageSize = Number(cache.pageSize);
      }
      if (cache.keyword !== undefined) {
        formState.keyword = String(cache.keyword);
      }
      if (cache.mobile !== undefined) {
        formState.mobile = String(cache.mobile);
      }
    };
    readCache();

    const getTableData = async (): Promise<void> => {
      try {
        loading.value = true;
        const params = {
          pageNumber: pagination.value.pageNumber,
          pageSize: pagination.value.pageSize,
          keyword: formState.keyword,
          mobile: formState.mobile,
        };
        const res = await cubeUserCenterService.getRegisterUserPage(params);
        if (res) {
          const { records, total } = res;
          dataSource.value = records;
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
      writeCache();
    };

    const queryForm = (): void => {
      pagination.value.pageNumber = 1;
      getTableData();
      writeCache();
    };
    const reset = (): void => {
      formState.keyword = "";
      formState.mobile = "";
      pagination.value.pageNumber = 1;
      pagination.value.pageSize = 10;
      getTableData();
      queryParameter.setAddressQuery({});
    };
    const readerInfoModalRef = ref<{ openModal: (row: Record<string, unknown>) => void }>();
    const detailRow = (record: { id: number }): void => {
      readerInfoModalRef.value?.openModal(record);
    };
    const { scrollY } = useTableScroll();
    onMounted(() => {
      getTableData();
    });
    const layoutSlots = {
      "layout-content": () => {
        return (
          <>
            <Form layout="inline" style={{ margin: "10px 0 0 0" }}>
              <FormItem label="姓名" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.keyword} placeholder="请输入姓名" showCount={false} />
              </FormItem>
              <FormItem label="手机号" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
                <Input v-model:value={formState.mobile} placeholder="请输入手机号" showCount={false} />
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
              scrollY={scrollY.value}
              tableCode={tableCode}
              applicationCode={__ENV__.applicationCode}
            />
          </>
        );
      },
      "footer-page": () => {
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
    return () => (
      <>
        <Layout title={pageTitle ?? "读者列表"} v-slots={layoutSlots} />
        <ReaderInfoModal ref={readerInfoModalRef} />
      </>
    );
  },
});
