import { AttributeTable } from "./components/attribute-table/attribute-table";
import { EventTable } from "./components/event-table/event-table";
import { MethodsTable } from "./components/methods-table/methods-table";
import styles from "./product-detail.module.less";
import { cubeDeviceCenterInternalService, cubeDeviceCenterService } from "@/api/service";
import type { StatusConfig } from "@/components/business/status-config-form/types";
import { Layout } from "@/components/layout/layout";
import type { Product } from "@ghcloud/cube-iot-center-service";
import { Button, Form, FormItem, Spin, Tabs, TabPane, Image, Textarea, Tag } from "@ghcloud/cube-ui";
import { computed, defineComponent, reactive, ref } from "vue";
import { useRoute } from "vue-router";

/** 产品详情 */
export const ProductDetail = defineComponent({
  setup: () => {
    const detailData = ref<Product | undefined>();
    const formState = reactive<{
      prodName: string;
      prodNumber: string | undefined;
      prodModel: string;
      prodBrandId: string | undefined;
      remark: string;
      prodIcon: { id: string }[];
      prodPic: { id: string }[];
    }>({
      prodName: "",
      prodNumber: "",
      prodModel: "",
      remark: "",
      prodBrandId: undefined,
      prodIcon: [],
      prodPic: [],
    });
    const initStatus = ref(false);
    const { id } = useRoute().query as { id: string };
    const brandOptions = ref<{ label: string; value: string }[]>([]);
    cubeDeviceCenterService.getProductCategoryDetail(id).then((res) => {
      detailData.value = res;
      formState.prodName = res.prodName;
      formState.prodBrandId = res.prodBrandId;
      formState.prodModel = res.prodModel;
      formState.remark = res.remark;
      if (res.prodIconFile) {
        formState.prodIcon = [res.prodIconFile];
      }
      if (res.prodPicFile) {
        formState.prodPic = [res.prodPicFile];
      }
      initStatus.value = true;
    });
    cubeDeviceCenterService.getProductBrandPage({ pageNumber: 1, pageSize: 10000 }).then((res) => {
      brandOptions.value = res.records.map((e) => ({
        label: e.itemLabel,
        value: e.id,
      }));
    });
    const productTagList = ref<{ tagCode: string; tagName: string }[]>([]);
    cubeDeviceCenterInternalService.getProductDeviceTags(id).then((res) => {
      productTagList.value = res;
    });
    const extendConfig = computed(() => {
      const extendConfig = JSON.stringify(JSON.parse(detailData.value?.extendConfig || "{}")?.deviceStatusRules);
      return JSON.parse(extendConfig || "[]") as StatusConfig[];
    });
    const layoutSlots = {
      "layout-content": (): JSX.Element => (
        <Spin spinning={!initStatus.value}>
          <div style="min-height: 500px">
            <div class={styles["top-info"]} id="top-info">
              <div class={styles["top-info-item"]}>产品名称：{detailData.value?.prodName ?? "--"}</div>
              <div class={styles["top-info-item"]}>产品编号：{detailData.value?.prodNumber ?? "--"}</div>
              <div class={styles["top-info-item"]}>创建时间：{detailData.value?.createTimeFormat ?? "--"}</div>
              <div class={styles["top-info-item"]}>关联设备数：{detailData.value?.deviceCount ?? "--"}</div>
            </div>
            <Tabs destroyInactiveTabPane>
              <TabPane key="1" tab="产品信息">
                <Form
                  style={{ margin: "10px", display: "flex", flexWrap: "wrap" }}
                  class={styles["product-info-form"]}
                  labelCol={{ style: { width: "150px" } }}
                >
                  <div style={{ width: "45%" }}>
                    <FormItem label="产品品类">{detailData.value?.prodCategoryName ?? "--"}</FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="品牌名称" name="prodBrandId">
                      {detailData.value?.prodBrandName ?? "--"}
                    </FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="节点类型">{detailData.value?.nodeTypeName ?? "--"}</FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="连网方式">{detailData.value?.accessTypeName ?? "--"}</FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="协议插件">{detailData.value?.protocolName ?? "--"}</FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="产品型号" name="prodModel">
                      {detailData.value?.prodModel ?? "--"}
                    </FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="产品图标">
                      {detailData.value?.prodIconFile ? (
                        <Image src={detailData.value?.prodIconFile?.path} width={80} height={80} />
                      ) : (
                        "暂无图片"
                      )}
                    </FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="产品图片">
                      {detailData.value?.prodPicFile ? (
                        <Image src={detailData.value?.prodPicFile?.path} width={80} height={80} />
                      ) : (
                        "暂无图片"
                      )}
                    </FormItem>
                  </div>
                  <div style={{ width: "45%" }}>
                    <FormItem label="更新时间">{detailData.value?.updateTimeFormat ?? "--"}</FormItem>
                  </div>
                  <div style={{ width: "50%" }}>
                    <FormItem label="产品描述">
                      {detailData.value?.remark ? (
                        <Textarea value={detailData.value?.remark} bordered={false} readonly showCount={false} />
                      ) : (
                        "--"
                      )}
                    </FormItem>
                  </div>
                  <div style={{ width: "100%" }}>
                    <FormItem label="产品标签">
                      {productTagList.value.length === 0
                        ? "暂无数据"
                        : productTagList.value.map((item, index) => (
                            <>
                              <Tag color="blue" key={index} style={{ marginBottom: "10px", padding: "2px 5px" }}>
                                {item.tagName}
                              </Tag>
                            </>
                          ))}
                    </FormItem>
                  </div>
                  <div style={{ width: "40%" }}>
                    <FormItem label="状态规则">
                      {extendConfig.value.length === 0 ? (
                        "暂无数据"
                      ) : (
                        <div class={styles["status-rules"]}>
                          {extendConfig.value?.map((item, index) => {
                            const isOnline = item.status === "on_line";
                            return (
                              <div key={index} class={`${styles["rule-section"]} ${isOnline ? styles["online"] : styles["offline"]}`}>
                                <div class={styles["section-title"]}>
                                  <span class={`${styles["status-dot"]} ${isOnline ? styles["online-dot"] : styles["offline-dot"]}`}></span>
                                  {isOnline ? "在线规则" : "离线规则"}
                                </div>
                                {item.conditions?.rules?.length > 0 ? (
                                  item.conditions?.rules?.map((e, n) => (
                                    <div key={n} class={styles["rule-item"]}>
                                      {e.translation}
                                    </div>
                                  ))
                                ) : (
                                  <span class={styles["no-data"]}>暂无数据</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </FormItem>
                  </div>
                </Form>
              </TabPane>
              <TabPane key="2" tab="属性">
                {id && <AttributeTable id={id} />}
              </TabPane>
              <TabPane key="3" tab="服务">
                {id && <MethodsTable id={id} />}
              </TabPane>
              <TabPane key="4" tab="事件">
                {id && <EventTable id={id} />}
              </TabPane>
            </Tabs>
          </div>
        </Spin>
      ),
      "footer-page": (): JSX.Element => (
        <>
          <Button
            onClick={() => {
              history.back();
            }}
          >
            返回
          </Button>
        </>
      ),
    };
    return (): JSX.Element => (
      <>
        <Layout title="产品详情" v-slots={layoutSlots} />
      </>
    );
  },
});
