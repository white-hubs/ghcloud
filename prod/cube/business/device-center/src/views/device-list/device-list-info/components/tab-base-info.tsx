import { baseInfoState, type ProductState } from "./base-config";
import { cubeDeviceCenterInternalService } from "@/api/service";
import "@/styles/common.less";
import { logger } from "@/logger";
import { Descriptions, DescriptionsItem, Spin } from "@ghcloud/cube-ui";
import { defineComponent, onMounted, reactive } from "vue";

interface DeviceInfo {
  [key: string]: unknown;
  name: string;
  productName: string;
  nodeTypeName: string;
  deviceNumber: string;
  statusName: string;
  status: number;
  onlineTime: number;
  onlineTimeStr: string;
  remark: string;
  activationTimeStr: string;
  createTimeStr: string;
  // 秘钥
  salt: string;
  // 三方id
  rawDeviceId: string;
  // 物联配置
  config: string;
  product: ProductState;
}
export const TabBaseInfo = defineComponent({
  props: {
    id: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const state = reactive<{
      baseInfo: DeviceInfo;
      loading: boolean;
    }>({
      baseInfo: {
        name: "",
        deviceNumber: "",
        statusName: "",
        status: 0,
        onlineTime: 0,
        onlineTimeStr: "",
        productName: "",
        nodeTypeName: "",
        remark: "",
        activationTimeStr: "",
        createTimeStr: "",
        // 秘钥
        salt: "",
        // 三方id
        rawDeviceId: "",
        // 物联配置
        config: "",
        product: {
          prodCategoryName: "",
          prodCategoryNameWithCascade: "",
          protocolName: "",
          prodBrandName: "",
          prodModel: "",
          prodIconFile: {
            id: "",
            name: "",
            path: "",
          },
          prodPicFile: {
            id: "",
            name: "",
            path: "",
          },
        },
      },
      loading: true,
    });
    const getDeviceInfo = async (): Promise<void> => {
      const data = await cubeDeviceCenterInternalService.getDeviceDetail({ deviceId: props.id });
      state.baseInfo = data as unknown as DeviceInfo;
    };

    onMounted(async () => {
      try {
        state.loading = true;
        await getDeviceInfo();
      } catch (error) {
        logger.error(error);
      } finally {
        state.loading = false;
      }
    });
    return (): JSX.Element => (
      <>
        <Spin spinning={state.loading}>
          <Descriptions class="mt-20px">
            {baseInfoState.map((item) => (
              <DescriptionsItem label={item.label} key={`${item.label}-${item.name}`}>
                {item.render(state.baseInfo[item.name] as ProductState & string)}
              </DescriptionsItem>
            ))}
          </Descriptions>
        </Spin>
      </>
    );
  },
});
