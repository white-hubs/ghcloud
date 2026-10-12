import { AttributeTable } from "./components/attribute-table/index";
import { EventTable } from "./components/event-table/index";
import { MethodsTable } from "./components/methods-table/index";
import { ProductInfoTable } from "./components/product-info-table";
import { CubeLayout } from "@ghcloud/cube-app-design";
import { Button, Tabs, TabPane } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";

/** 产品详情 */
export const ProductDetail = defineComponent({
  setup() {
    const { pageTitle } = usePageName();
    const route = useRoute();
    const router = useRouter();
    const { id } = route.query as { id: string };

    /**
     * 返回上一页
     */
    const handleBack = (): void => {
      router.back();
    };

    const slots = {
      "layout-content": (): JSX.Element => (
        <div style={{ minHeight: "500px" }}>
          <Tabs destroyInactiveTabPane>
            <TabPane key="1" tab="产品信息">
              {id && <ProductInfoTable productId={id} />}
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
      ),
      "footer-page": (): JSX.Element => <Button onClick={handleBack}>返回</Button>,
    };

    return (): JSX.Element => <CubeLayout title={pageTitle || "产品详情"} v-slots={slots} />;
  },
});
