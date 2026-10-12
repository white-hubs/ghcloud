import { defineComponent, onMounted, ref, type PropType } from "vue";

import { cubeDeviceCenterService, cubeFileService } from "@/infrastructure/api/service";
import { getAssetsImage } from "@/infrastructure/utils/getImage";

import "./info.module.less";

export const Info = defineComponent({
  name: "DeviceBaseInfo",
  props: {
    id: { type: String as PropType<string>, default: "" },
  },
  setup(props) {
    const dataInfo = ref<any>({
      baseArchivesInfo: {
        picture: "",
        code: "",
        area: { name: "" },
        manager: { name: "" },
        department: { name: "" },
        status: { onlineState: false },
      },
      productInfo: {
        productCategory: { name: "" },
        modelName: "",
        path: "",
      },
      expandInfo: {
        factoryInfo: { usefulLife: "" },
      },
    });

    onMounted(async () => {
      if (!props.id) return;
      dataInfo.value = await cubeDeviceCenterService.getDeviceInstanceDetail({ deviceId: props.id });
      if (dataInfo.value?.productInfo?.picture) {
        try {
          const res = await cubeFileService.getFileInfo(dataInfo.value.productInfo.picture);
          dataInfo.value.productInfo.path = res.path;
        } catch {
          // ignore
        }
      }
    });

    return (): JSX.Element => {
      const info = dataInfo.value;
      const online = Boolean(info?.baseArchivesInfo?.status?.onlineState);
      const imageSrc = info?.productInfo?.path || getAssetsImage("overView45.png");

      return (
        <div class="info-content">
          <div class="info">
            <div class="info-img">
              <a-image width="100%" height="100%" src={imageSrc} />
            </div>
            <div class="info-column">
              <div class="info-name">
                <span class="info-label">设备编码:</span>
                <span class="info-value">{info?.baseArchivesInfo?.code || "暂无"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">所属区域:</span>
                <span class="info-value">{info?.baseArchivesInfo?.area?.pathName || "暂无"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">管理人员:</span>
                <span class="info-value">{info?.baseArchivesInfo?.manager?.name || "暂无"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">部门名称:</span>
                <span class="info-value">{info?.baseArchivesInfo?.department?.name || "暂无"}</span>
              </div>
            </div>
            <div class="info-column info-column-wide">
              <div class="info-name">
                <span class="info-label">设备品类:</span>
                <span class="info-value">{info?.productInfo?.productCategory?.name || "暂无"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">设备型号:</span>
                <span class="info-value">{info?.productInfo?.modelName || "暂无"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">设备状态:</span>
                <span class={["info-value", online ? "status-online" : "status-offline"]}>{online ? "在线" : "离线"}</span>
              </div>
              <div class="info-name">
                <span class="info-label">使用寿命:</span>
                <span class="info-value">
                  {info?.expandInfo?.factoryInfo?.usefulLife ? `${info.expandInfo.factoryInfo.usefulLife}月` : "暂无"}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    };
  },
});

export default Info;
