import { cubeDeviceIotCenterService } from "@/api/service";
import { getNodeTypeLabel } from "@/constants/node-type";
import type { ProductDetailModel } from "@ghcloud/cube-iot-center-service";
import { Form, FormItem, Image, Textarea } from "@ghcloud/cube-ui";
import dayjs from "dayjs";
import { defineComponent, onMounted, ref } from "vue";

interface Props {
  productId: string;
}

/** 产品信息展示 */
export const ProductInfoTable = defineComponent({
  props: ["productId"],
  setup(props: Props) {
    const detailData = ref<ProductDetailModel | undefined>();
    const initStatus = ref(false);

    /**
     * 加载产品详情
     */
    const loadProductDetail = async (): Promise<void> => {
      try {
        const res = await cubeDeviceIotCenterService.getProductDetail(props.productId);
        detailData.value = res;
        initStatus.value = true;
      } catch (_ignore) {
        // 静默失败
      }
    };

    onMounted(() => {
      loadProductDetail();
    });

    return (): JSX.Element => (
      <div>
        {initStatus.value && (
          <Form style={{ margin: "10px", display: "flex", flexWrap: "wrap" }} labelCol={{ style: { width: "150px" } }}>
            <div style={{ width: "45%" }}>
              <FormItem label="产品名称">{detailData.value?.prodName ?? "--"}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="产品编号">{props.productId}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="创建时间">
                {(detailData.value as ProductDetailModel & { createTime?: string })?.createTime
                  ? dayjs((detailData.value as ProductDetailModel & { createTime: string }).createTime).format("YYYY-MM-DD HH:mm:ss")
                  : "--"}
              </FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="产品品类">{detailData.value?.prodCategoryName || "--"}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="品牌名称">{detailData.value?.prodBrandName || "--"}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="节点类型">{getNodeTypeLabel(detailData.value?.nodeType)}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="协议插件">{detailData.value?.protocolName || "--"}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="产品型号">{detailData.value?.prodModel || "--"}</FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="产品图标">
                {detailData.value?.iconFileVO ? <Image src={detailData.value.iconFileVO.path} width={80} height={80} /> : "暂无图片"}
              </FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="产品图片">
                {detailData.value?.picFileVO ? <Image src={detailData.value.picFileVO.path} width={80} height={80} /> : "暂无图片"}
              </FormItem>
            </div>
            <div style={{ width: "45%" }}>
              <FormItem label="更新时间">
                {(detailData.value as ProductDetailModel & { updateTime?: string })?.updateTime
                  ? dayjs((detailData.value as ProductDetailModel & { updateTime: string }).updateTime).format("YYYY-MM-DD HH:mm:ss")
                  : "--"}
              </FormItem>
            </div>
            <div style={{ width: "50%" }}>
              <FormItem label="产品描述">
                {detailData.value?.remark ? <Textarea value={detailData.value.remark} bordered={false} readonly showCount={false} /> : "--"}
              </FormItem>
            </div>
          </Form>
        )}
      </div>
    );
  },
});
