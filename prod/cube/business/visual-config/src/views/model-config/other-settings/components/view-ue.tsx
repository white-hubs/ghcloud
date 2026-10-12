import type { ModelConfig as ModelConfigItf } from "../../model-config-init";
import styles from "./index.module.less";
import { addModel } from "@/api/model";
import { Button, Checkbox, FormItem, InputNumber, message, Modal, Radio, RadioGroup } from "@ghcloud/cube-ui";
import _ from "lodash";
import { defineComponent, onMounted, ref, watch, type PropType } from "vue";
/** 可视化配置大图（MinIO） */
const classicsNav = "/resource/v1/visual-config/classics-nav.png";
const policeNav = "/resource/v1/visual-config/police-nav.png";
const classicsCard = "/resource/v1/visual-config/classics-card.png";
const policeCard = "/resource/v1/visual-config/police-card.png";
import { authStore } from "@/api/auth-store";
import { EnvironmentOutlined } from "@ant-design/icons-vue";
import { CubeMapLeaflet } from "@ghcloud/cube-map-plugins";
import Form from "@ghcloud/cube-ui/src/components/form/form";

export const OtherViewUe = defineComponent({
  props: {
    data: {
      type: Object as PropType<ModelConfigItf>,
      default: () => {
        return {};
      },
    },
  },
  emits: ["getModelData"],
  setup: (props, { emit }) => {
    const ueOther = ref<{
      iconScale: string | number;
      isFilterArea: string;
      navType: string;
      cardType: string;
      deviceStyle: string;
      autoWeather: boolean;
      modelLocation: {
        lng: number;
        lat: number;
      };
    }>({
      iconScale: 0.5,
      isFilterArea: "hide",
      navType: "classicsNav",
      cardType: "classicsCard",
      deviceStyle: "pop",
      autoWeather: false,
      modelLocation: {
        lng: 116.290158,
        lat: 39.894696,
      },
    });
    const tempModelLocation = ref({
      lng: 116.290158,
      lat: 39.894696,
    });
    const modelLocationModalVisible = ref(false);
    const save = async (): Promise<void> => {
      const modelConfig: ModelConfigItf = _.cloneDeep(props.data);
      modelConfig.ue5.iconScale = ueOther.value.iconScale;
      modelConfig.ue5.isFilterArea = ueOther.value.isFilterArea;
      modelConfig.ue5.navType = ueOther.value.navType;
      modelConfig.ue5.cardType = ueOther.value.cardType;
      modelConfig.ue5.deviceStyle = ueOther.value.deviceStyle;
      modelConfig.ue5.autoWeather = ueOther.value.autoWeather;
      modelConfig.ue5.modelLocation = ueOther.value.modelLocation;
      await addModel({ modelConfiguration: JSON.stringify(modelConfig) });
      message.success("保存成功");
      emit("getModelData");
    };
    watch(
      () => props.data,
      () => {
        ueOther.value = {
          iconScale: props.data.ue5.iconScale,
          isFilterArea: props.data.ue5.isFilterArea ?? "hide",
          navType: props.data.ue5.navType ?? "classicsNav",
          cardType: props.data.ue5.cardType ?? "classicsCard",
          deviceStyle: props.data.ue5.deviceStyle ?? "pop",
          autoWeather: props.data.ue5?.autoWeather ?? false,
          modelLocation: props.data.ue5?.modelLocation ?? {
            lng: props.data.ue5?.modelLocation?.lng ?? 0,
            lat: props.data.ue5?.modelLocation?.lat ?? 0,
          },
        };
      },
    );
    const cubeMap = new CubeMapLeaflet(authStore);
    watch(modelLocationModalVisible, async (newVal) => {
      if (!newVal) {
        cubeMap.clearMap();
        return;
      }
      await cubeMap.renderMap("model-location-map-container", {
        center: { lng: ueOther.value.modelLocation.lng, lat: ueOther.value.modelLocation.lat },
      });
      cubeMap.addMarker({
        position: {
          lng: ueOther.value.modelLocation.lng,
          lat: ueOther.value.modelLocation.lat,
        },
      });
      cubeMap.onMapClick = async (event): Promise<void> => {
        cubeMap.clearMap();
        cubeMap.setCenter(event.lng, event.lat);
        cubeMap.addMarker({
          position: {
            lng: event.lng,
            lat: event.lat,
          },
        });
        tempModelLocation.value = {
          lng: event.lng,
          lat: event.lat,
        };
      };
      cubeMap.registerMapClickEvent();
    });
    return (): JSX.Element => (
      <>
        <Form layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          <FormItem label="图标大小：">
            <InputNumber
              class={styles["ue-config-item-content"]}
              stringMode
              precision={1}
              step={0.1}
              placeholder="请输入"
              v-model:value={ueOther.value.iconScale}
            />
          </FormItem>
          <FormItem label="区域设备过滤：">
            <RadioGroup
              value={ueOther.value.isFilterArea}
              onChange={(value: string) => {
                ueOther.value.isFilterArea = value;
              }}
            >
              <Radio value="hide">开启</Radio>
              <Radio value="display">关闭</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="设备详情风格：">
            <RadioGroup
              value={ueOther.value.deviceStyle}
              onChange={(value: string) => {
                ueOther.value.deviceStyle = value;
              }}
            >
              <Radio value="pop">弹窗</Radio>
              <Radio value="panel">面板</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="菜单风格：">
            <RadioGroup
              value={ueOther.value.navType}
              onChange={(value: string) => {
                ueOther.value.navType = value;
              }}
            >
              <Radio value="classicsNav">
                <img class={styles["nav-type-img"]} src={classicsNav} alt="" />
              </Radio>
              <Radio value="policeNav">
                <img class={styles["nav-type-img"]} src={policeNav} alt="" />
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="卡片风格：">
            <RadioGroup
              value={ueOther.value.cardType}
              onChange={(value: string) => {
                ueOther.value.cardType = value;
              }}
            >
              <Radio value="classicsCard">
                <img class={styles["card-type-img"]} src={classicsCard} alt="" />
              </Radio>
              <Radio value="policeCard">
                <img class={styles["card-type-img"]} src={policeCard} alt="" />
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label="自动切换天气：">
            <Checkbox v-model:checked={ueOther.value.autoWeather} />
          </FormItem>
          <FormItem label="模型所在位置：">
            <div class={styles["input-group"]}>
              <InputNumber precision={15} addon-before="经度" v-model:value={ueOther.value.modelLocation.lng} placeholder="请输入经度" />
              <InputNumber precision={15} addon-before="纬度" v-model:value={ueOther.value.modelLocation.lat} placeholder="请输入纬度" />
              <Button
                style={{ width: "60px" }}
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={() => (modelLocationModalVisible.value = true)}
              />
              <Modal
                v-model:visible={modelLocationModalVisible.value}
                title="选择模型所在位置"
                width="1000px"
                destroyOnClose
                onOk={() => {
                  ueOther.value.modelLocation = tempModelLocation.value;
                  modelLocationModalVisible.value = false;
                }}
              >
                <div id="model-location-map-container" style={{ width: "100%", height: "450px" }}></div>
              </Modal>
            </div>
          </FormItem>
        </Form>
        <div class={styles["operation-button"]}>
          <Button class={styles["save-button"]} type="primary" onClick={save}>
            保存
          </Button>
        </div>
      </>
    );
  },
});
