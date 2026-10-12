import gEdit from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/components/global/Common/gEdit";
import { defineComponent, onMounted, reactive, ref, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";

import type { FaultCaseType } from "@ghcloud/cube-maintain-service";
import { Form, FormItem, Input, TreeSelect, Select, Button, message, Image, Tabs, TabPane, Spin } from "@ghcloud/cube-ui";

import { LineModel } from "./line-model";
import { cubeDeviceCenterService, cubeMaintainService } from "@/api/service";
import { Layout } from "@/components/layout/layout";
import { GUpload } from "@/components/upload";

import styles from "./operate.module.less";

export const Operate = defineComponent({
  components: { gEdit },
  // 组件的setup函数
  setup: () => {
    const route = useRoute();
    const router = useRouter();
    const faultFormRef = ref();
    const faultPhenomenonInput = ref();
    const faultReasonInput = ref();
    const treatmentMeasuresInput = ref();
    const applicationCode = JSON.parse(sessionStorage.getItem("GH-currentApplication") ?? "").code;
    const pageTitle = route.query.type === "detail" ? "案例详情" : route.query.type === "add" ? "案例新增" : "案例编辑";
    const faultTypeOptions = ref();
    const productCategoryOptions = ref();
    const rules = {
      name: [{ required: true, message: "请输入类型名称" }],
      faultTypeId: [{ required: true, message: "请选择故障类型" }],
      productCategoryCode: [{ required: true, message: "请选择产品品类" }],
      faultPhenomenon: [{ required: true, message: "请输入现象" }],
      faultReason: [{ required: true, message: "请输入原因" }],
      treatmentMeasures: [{ required: true, message: "请输入处理措施" }],
      files: [{ required: true, message: "请上传附件" }],
    };
    const state = reactive<{
      spinning: boolean;
      formState: FaultCaseType;
      loading: boolean;
      echartsTotal: number;
      activeKey: string;
      lineData: {
        series: { name: string; type: string; stack: string; data: number[] }[];
        xAxisData: string[];
        boundaryGap: boolean;
      };
    }>({
      spinning: false,
      echartsTotal: 0,
      activeKey: "1",
      formState: {
        name: "",
        faultTypeName: "",
        productCategoryCode: "",
        faultPhenomenon: "",
        faultReason: "",
        treatmentMeasures: "",
        files: [],
        fileIds: [],
        id: "",
        faultTypeId: undefined,
        deviceTypeId: "",
        deviceTypeName: "",
        productCategoryName: "",
      },
      lineData: {
        series: [],
        xAxisData: [],
        boundaryGap: true,
      },
      loading: false,
    });
    onMounted(() => {
      getFaultDetail();
      getFaultType();
      getProductCategory();
    });
    const getFaultType = async (): Promise<void> => {
      try {
        const result = await cubeMaintainService.faultTypeList({ applicationCode });
        faultTypeOptions.value = result.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        });
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "请求失败");
      }
    };
    const getProductCategory = async (): Promise<void> => {
      try {
        productCategoryOptions.value = await cubeDeviceCenterService.getIotProductCategoryTree();
      } catch (error) {}
    };
    const getFaultDetail = async (): Promise<void> => {
      try {
        const { name, faultTypeId, faultTypeName, productCategoryCode, faultPhenomenon, faultReason, treatmentMeasures, files } =
          await cubeMaintainService.faultCaseDetail(route.query.id as string);
        state.formState.name = name;
        state.formState.faultTypeId = faultTypeId ?? "";
        state.formState.faultTypeName = faultTypeName;
        state.formState.productCategoryCode = productCategoryCode ?? "";
        state.formState.faultPhenomenon = faultPhenomenon;
        state.formState.faultReason = faultReason;
        state.formState.treatmentMeasures = treatmentMeasures;
        state.formState.fileIds = files.map((item: { id: string }) => item.id);
        state.formState.files = files;
      } catch (error) {}
    };
    const goBack = (): void => {
      // router.push('/faultCase')
      history.back();
    };
    const save = async (): Promise<void> => {
      await faultFormRef.value?.validate();
      state.loading = true;
      const params = {
        ...state.formState,
        id: route.query.id as string,
        applicationCode,
      };
      try {
        if (route.query.type === "add") {
          await cubeMaintainService.faultCaseAdd(params);
          message.success("操作成功");
          router.push("/faultCase");
        } else {
          await cubeMaintainService.faultCaseUpdate(params);
          message.success("操作成功");
          goBack();
        }
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string } }).toJSON();
        message.error(errorMessage || "操作失败");
      } finally {
        state.loading = false;
      }
    };
    const getHtml = async (type: string, e: unknown): Promise<void> => {
      state.formState[type] = e;
      await faultFormRef.value?.validateFields(type);
    };
    const changeFile = (ids: string[]): void => {
      state.formState.fileIds = ids;
    };
    watch(
      () => state.activeKey,
      (n) => {
        if (n === "2") {
          getRecent();
        }
      },
    );
    const getRecent = async (): Promise<void> => {
      state.spinning = true;
      try {
        const { months, total } = await cubeMaintainService.faultRecentMonth(route.query.id as string);
        if (months) {
          state.echartsTotal = total;
          state.lineData.xAxisData = months.map((item: { timeFlag: string }) => item.timeFlag);
          state.lineData.series = [
            {
              name: "频次",
              type: "line",
              stack: "Total",
              data: months.map((item: { num: number }) => item.num),
            },
          ];
        }
        state.spinning = false;
      } catch (e) {}
    };
    const detailDom = (): VNode => {
      return (
        <div>
          <Tabs v-model:activeKey={state.activeKey} style={{ marginBottom: "10px" }}>
            <TabPane key="1" tab="案例详情">
              <div class={styles.title}>案例</div>
              <div class={styles.detail}>
                <div style={{ width: "30%" }}>
                  {" "}
                  <span>案例名称：</span> <span>{state.formState.name || "--"}</span>{" "}
                </div>
                <div style={{ width: "30%" }}>
                  {" "}
                  <span>故障类型：</span> <span>{state.formState.faultTypeName || "--"}</span>{" "}
                </div>
                <div style={{ width: "30%" }}>
                  {" "}
                  <span>产品品类：</span> <span>{state.formState.productCategoryName || "--"}</span>
                </div>
                <div style={{ width: "100%" }}>
                  {" "}
                  <span>现象：</span> <span v-html={state.formState.faultPhenomenon} />{" "}
                </div>
                <div style={{ width: "100%" }}>
                  {" "}
                  <span>原因：</span> <span v-html={state.formState.faultReason} />{" "}
                </div>
                <div style={{ width: "100%" }}>
                  {" "}
                  <span>处理措施：</span> <span v-html={state.formState.treatmentMeasures} />
                </div>
                <div style={{ width: "100%" }}>
                  <span>附件：</span>
                  <div>
                    {state.formState.files.map((x: { endpointPath: string; id: string }) => (
                      <div key={x.id} style={{ marginRight: "10px" }}>
                        <Image width={100} height={100} src={x.endpointPath} key={x.id} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane key="2" tab="频次">
              <Spin spinning={state.spinning}>
                <div class={`${styles.frequency} ${styles["flex-start"]}`}>
                  <div class={styles.total}>
                    <div>
                      <div class={`${styles.title} ${styles.pb2}`}>总数</div>
                      <div class={styles.times}>
                        <span class={styles.num}>{state.echartsTotal}</span>
                        <span class={styles.unit}>次</span>
                      </div>
                    </div>
                  </div>
                  <div class={styles.echartsCtr}>
                    <LineModel data={state.lineData} />
                  </div>
                </div>
              </Spin>
            </TabPane>
          </Tabs>
        </div>
      );
    };
    const editDom = (): VNode => {
      return (
        <Form
          model={state.formState}
          ref={faultFormRef}
          layout="inline"
          style={{ margin: "10px 0 0 0" }}
          rules={rules}
          label-col={{ style: { width: "100px" } }}
        >
          <FormItem label="案例名称" name="name" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
            <Input v-model:value={state.formState.name} placeholder="案例名称" />
          </FormItem>
          <FormItem label="故障类型" name="faultTypeId" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
            <Select
              onChange={(value: string, option) => {
                state.formState.faultTypeName = option.label;
                state.formState.faultTypeId = value as never;
              }}
              v-model:value={state.formState.faultTypeId}
              allowClear
              placeholder="请选择"
              style="width: 180px"
              options={faultTypeOptions.value}
            />
          </FormItem>
          <FormItem label="产品品类" name="productCategoryCode" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
            <TreeSelect
              fieldNames={{ label: "categoryName", value: "categoryCode", children: "children" }}
              v-model:value={state.formState.productCategoryCode}
              style={{ width: "200px" }}
              allow-clear
              isLeaf
              tree-data={productCategoryOptions.value}
              placeholder="请选择"
            />
          </FormItem>
          <FormItem
            label="现象"
            name="faultPhenomenon"
            style={{ width: "100%", paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}
          >
            <g-edit
              id="faultPhenomenon"
              ref={faultPhenomenonInput.value}
              text={state.formState.faultPhenomenon}
              onGetHtml={(e: unknown) => {
                getHtml("faultPhenomenon", e);
              }}
              height="200"
              placeholder="请填写现象"
              style="margin-right: 60px;"
            />
          </FormItem>
          <FormItem label="原因" name="faultReason" style={{ width: "100%", paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
            <g-edit
              id="faultReason"
              ref={faultReasonInput.value}
              text={state.formState.faultReason}
              onGetHtml={(e: unknown) => {
                getHtml("faultReason", e);
              }}
              height="200"
              placeholder="请填写原因"
              style="margin-right: 60px;"
            />
          </FormItem>
          <FormItem
            label="处理措施"
            name="treatmentMeasures"
            style={{ width: "100%", paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}
          >
            <g-edit
              id="treatmentMeasures"
              ref={treatmentMeasuresInput.value}
              text={state.formState.treatmentMeasures}
              onGetHtml={(e: unknown) => {
                getHtml("treatmentMeasures", e);
              }}
              height="200"
              placeholder="请填写处理措施"
              style="margin-right: 60px;"
            />
          </FormItem>
          <FormItem label="附件" name="files" style={{ paddingRight: 0, marginRight: "10px", marginBottom: "10px" }}>
            <GUpload file={state.formState.files} v-model:value={state.formState.files} onChangeFile={changeFile} max={3} />
          </FormItem>
        </Form>
      );
    };
    const layoutSlots = {
      "layout-content": () => {
        return <>{route.query.type === "detail" ? detailDom() : editDom()}</>;
      },
      "footer-page": () => {
        return (
          <>
            <Button onClick={goBack} style="margin-right: 10px">
              返回
            </Button>
            {route.query.type !== "detail" && (
              <Button onClick={save} type="primary">
                保存
              </Button>
            )}
          </>
        );
      },
    };
    return () => <Layout v-slots={layoutSlots} title={pageTitle} />;
  },
});
