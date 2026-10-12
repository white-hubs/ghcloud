import { defineComponent, onMounted, reactive } from "vue";

import type { GetDictionaryByItem } from "@ghcloud/cube-dictionary-service";
import { Button, message, ExclamationCircleFilled, Upload, Empty } from "@ghcloud/cube-ui";
import { usePageName } from "@ghcloud/cube-utils";

import { cubeDictionaryService, cubeFileService } from "@/apis/service";
import { GLayout } from "@/components/common/layout";

import styles from "./index.module.less";
// 调度中心配置端
const uploadTypeList = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/bmp", "image/webp", "image/svg+xml"];
const dictCode = "COMMAND_DISPATCH_MAP_CONFIG";
export const BackgroundConfig = defineComponent({
  setup: () => {
    const { pageTitle } = usePageName();
    const state = reactive<{
      mapConfig: Record<string, GetDictionaryByItem>;
    }>({
      mapConfig: {
        background: {
          code: "background",
          name: "",
          id: "",
          remarks: "",
          version: "",
          flag: false,
          variable: "",
          itemCode: "",
        },
      },
    });
    const beforeUpload = (file: File): boolean => {
      if (!uploadTypeList.includes(file.type)) {
        message.error("请上传图片文件");
        return false;
      }
      return true;
    };
    const customRequest = async (data: { file: File }): Promise<void> => {
      const result = await cubeFileService.uploadFile({
        businessKey: "mdata",
        file: data.file,
      });
      if (result.path) {
        state.mapConfig.background.variable = result.path;
        // state.imgUrl = result.path
      }
    };
    const layoutSlots = {
      "content-search": (): JSX.Element => (
        <div class={styles.header}>
          <div>
            <span class={styles.title}>调度中心默认背景配置</span>
            <ExclamationCircleFilled />
            支持未对接地图服务的厂家使用默认背景图
          </div>
          <Upload accept={uploadTypeList.join(",")} customRequest={customRequest} beforeUpload={beforeUpload} showUploadList={false}>
            <Button type="primary">上传</Button>
          </Upload>
        </div>
      ),
      "content-table": (): JSX.Element => (
        <div style={{ width: "100%", height: "100%" }}>
          {state.mapConfig.background.variable && <img class={styles.bgImage} src={state.mapConfig.background.variable} alt="" />}
          {!state.mapConfig.background.variable && (
            <div class={styles.empty}>
              <Empty description="暂无背景图" />
            </div>
          )}
        </div>
      ),
      "footer-page": (): JSX.Element => (
        <div class={styles.footer}>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </div>
      ),
    };
    const getDictionary = async (): Promise<void> => {
      try {
        const commandDict = await cubeDictionaryService.getDictionaryItemByCode({
          code: dictCode,
        });
        if (!commandDict) {
          await cubeDictionaryService.addDataDictionaryItem({
            code: dictCode,
            remarks: "调度中心地图配置",
          });
        }
        await initMapConfig();
      } catch {}
    };
    const initMapConfig = async (): Promise<void> => {
      const res = await cubeDictionaryService.getDictionaryByItem({
        itemCode: dictCode,
      });
      let config = !res.length ? initConfig() : res;
      if (!config.some((dict) => dict.code === "background")) {
        const initBg = initConfig().find((item) => item.code === "background") as unknown as GetDictionaryByItem;
        config = [initBg, ...config];
      }
      state.mapConfig = Object.keys(state.mapConfig).reduce(
        (pre, item) => ({
          ...pre,
          [item]: config.find((i) => i.code === item) as unknown as GetDictionaryByItem,
        }),
        {
          ...state.mapConfig,
        },
      );
    };
    const initConfig = (): GetDictionaryByItem[] => {
      const backgroundConfig = {
        id: "",
        name: "背景图",
        code: "background",
        remarks: "",
        flag: false,
        version: "0",
        variable: "",
        itemCode: dictCode,
      };
      const addressConfig = {
        id: "",
        name: "中心坐标",
        code: "lnglat",
        remarks: "",
        version: "0",
        flag: false,
        variable: "116.397428,39.90923",
        itemCode: dictCode,
      };
      const rotationConfig = {
        id: "",
        name: "旋转角度",
        code: "rotation",
        remarks: "",
        version: "0",
        flag: false,
        variable: "0",
        itemCode: dictCode,
      };
      const zoomConfig = {
        id: "",
        name: "放大层级",
        code: "zoom",
        remarks: "",
        flag: false,
        version: "0",
        variable: "14",
        itemCode: dictCode,
      };
      return [backgroundConfig, addressConfig, rotationConfig, zoomConfig];
    };
    onMounted(() => {
      getDictionary();
    });
    const handleSave = async (): Promise<void> => {
      if (!state.mapConfig.background.variable) {
        message.warning("请上传背景图片");
        return;
      }
      try {
        for (const keys of Object.keys(state.mapConfig)) {
          if (!state.mapConfig[keys].id) {
            await cubeDictionaryService.addDataDictionary({
              ...state.mapConfig[keys],
            });
          } else {
            await cubeDictionaryService.updateDataDictionary({
              ...state.mapConfig[keys],
            });
          }
        }
        initMapConfig();
        message.success("保存成功");
      } catch {
        message.error("保存失败");
      }
    };

    onMounted(async () => {});
    return (): JSX.Element => <GLayout title={pageTitle} v-slots={layoutSlots} />;
  },
});
