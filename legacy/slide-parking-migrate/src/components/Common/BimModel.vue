<template lang="pug">
.app_bim#bim_container
    //- a-button(class="btn" @click="getCamera") 获取视角
    //- .label-container(v-for="(item,i) in areaData[0].children" :key="item.id" :id="'label_'+item.id" v-show="labelShow" @mouseover="mouseOver(i)" @mouseleave="mouseLeave")
    //-     .label_header {{item.name}}
    //-     img(src="../../assets/images/label.png")
    //-     .floor-container(v-show="tabIndex === i && floorShow && item.floors.length")
    //-         .floor-container-header
    //-             span(class="iconfont icon-floor-settings")
    //-             span 楼层选择
    //-         .floor-contaner-content
    //-             .item(v-for="floor in item.floors" :key="item.id" @click="clickFloor(item,floor)") {{floor.name}}
</template>
<script lang="jsx">
import { defineComponent, onMounted, reactive, toRefs, watch } from "vue";
import axios from "axios";
export default defineComponent({
  name: "BimModel",
  props: {
    bimPath: {
      type: String,
      default: "",
    },
    camera: {
      type: [Object, null],
      default: null,
    },
    levelName: {
      type: String,
      default: "",
    },
    isPersonAdded: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      viewerPath: null,
      viewer3D: null,
      drawableContainer: null,
      marker3D: null,
      databagId: null,
      modelId: null,
      selectedElement: null,
      model3D: null,
      walkthrough: null,
    });
    onMounted(() => {
      if (props.bimPath) {
        switchBimModel(props.bimPath);
      }
    });
    watch(
      () => props.bimPath,
      () => {
        switchBimModel(props.bimPath);
      }
    );
    watch(
      () => props.levelName,
      () => {
        if (!state.viewer3D) {
          return;
        }
        if (props.levelName) {
          hideComponents([{ levelName: props.levelName }]);
        } else {
          state.viewer3D.clearIsolation();
        }
      }
    );
    const initBim = (path) => {
      const BimfaceLoaderConfig = new BimfaceSDKLoaderConfig();
      BimfaceLoaderConfig.dataEnvType = BimfaceEnvOption.Local;
      BimfaceLoaderConfig.sdkPath = "./jssdk";
      BimfaceLoaderConfig.path = path;
      BimfaceSDKLoader.load(
        BimfaceLoaderConfig,
        onSDKLoadSucceeded,
        onSDKLoadFailed
      );
    };
    const onSDKLoadSucceeded = (viewMetaData) => {
      if (viewMetaData.viewType === "3DView") {
        const { databagId, modelId } = viewMetaData;
        state.databagId = databagId;
        state.modelId = modelId;
        const view = document.getElementById("bim_container");
        let config = new Glodon.Bimface.Application.WebApplication3DConfig();
        config.domElement = view;
        config.Buttons = [];
        config.backgroundColor = [
          { color: new Glodon.Web.Graphics.Color(25, 28, 33, 0) },
        ];
        let app = new Glodon.Bimface.Application.WebApplication3D(config);
        state.viewer3D = app.getViewer();
        state.viewer3D.addModel(viewMetaData);
        let walkthConfig = new Glodon.Bimface.Plugins.Walkthrough.WalkthroughConfig();
        walkthConfig.viewer = state.viewer3D;
        state.walkthrough = new Glodon.Bimface.Plugins.Walkthrough.Walkthrough(walkthConfig);
        state.viewer3D.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded,
          () => {
            setBimshift(-0.1, false);
            state.viewer3D.hideViewHouse();
            // 二维标签配置类
            let drawableConfig =
              new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
            drawableConfig.viewer = state.viewer3D;
            state.drawableContainer =
              new Glodon.Bimface.Plugins.Drawable.DrawableContainer(
                drawableConfig
              );
            // state.viewer3D.resize(document.documentElement.clientWidth, document.documentElement.clientHeight);
            // 三维标签配置类
            let markerConfig =
              new Glodon.Bimface.Plugins.Marker3D.Marker3DContainerConfig();
            markerConfig.viewer = state.viewer3D;
            state.marker3D =
              new Glodon.Bimface.Plugins.Marker3D.Marker3DContainer(
                markerConfig
              );
            // 从viwer3D中获取模型对象model3D
            state.model3D = state.viewer3D.getModel();
            if(props.isPersonAdded){
              state.viewer3D.setNavigationMode(Glodon.Bimface.Viewer.NavigationMode3D.ThirdPersonRun);
              state.viewer3D.setFlySpeedRate(8);
            }
            state.viewer3D.render();
            if (props.levelName) {
              hideComponents([{ levelName: props.levelName }]);
            }
          }
        );
        state.viewer3D.addEventListener("MouseClicked", (objectdata) => {
          emit("clickedObject", objectdata);
        });
      }
    };
    const setCameraStatus = (camera) => {
      state.viewer3D.setCameraStatus(camera);
      state.viewer3D.render();
    };
    const getCamera = () => {
      let camera = state.viewer3D.getCameraStatus();
      return camera;
    };
    const onSDKLoadFailed = () => {
    };
    const switchBimModel = (path) => {
      if (!path || path === state.viewerPath) {
        return;
      }
      state.viewerPath = path;
      if (state.viewer3D) {
        axios.get(path).then((res) => {
          state.viewer3D.removeView(state.databagId);
          state.viewer3D.addModel(res.data);
          state.databagId = res.data.databagId;
          state.modelId = res.data.modelId;
          state.viewer3D.render();
        });
      } else {
        initBim(path);
      }
    };
    const setBimshift = (exposureShift, lineEnabled) => {
      // 设置曝光度
      state.viewer3D.setExposureShift(exposureShift);
      // 取消轮廓线
      state.viewer3D.setBorderLineEnabled(lineEnabled);
      // state.viewer3D.render();
    };
    // 限制相机选择范围
    const setdegreeRange = () => {
      // 限定角度为15° ~ 90°
      const degreeRange = [Math.PI / 6, Math.PI / 2];
      state.viewer3D.lockAxis(Glodon.Bimface.Viewer.AxisOption.Z, degreeRange);
      // 限定距离0 ~ 1
      state.viewer3D.setMaximalRangeofCamera(0.95);
      state.viewer3D.render();
    };
    // 根据构建id获取包围盒定位
    const zoomToComponents = (element) => {
      state.viewer3D
        .getModel(state.modelId)
        .getComponentProperty(element, (data) => {
          const boundingBox = data.boundingBox;
          // 定位到该包围盒
          state.viewer3D.zoomToBoundingBox(boundingBox);
          state.viewer3D.render();
        });
    };
    // 恢复模型到主视角
    const review = () => {
      state.viewer3D.setView(Glodon.Bimface.Viewer.ViewOption.Home);
    };
    // 添加二维标签
    const add2DLabel = (
      Dom,
      labelData,
      position,
      x = 0,
      y = 0,
      handleClick
    ) => {
      let config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
      config.id = labelData.id;
      config.offsetX = x;
      config.offsetY = y;
      config.content = Dom;
      config.viewer = state.viewer3D;
      config.worldPosition = position;
      let customItem = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);
      customItem.onClick((item) => {
        if (handleClick) handleClick(labelData);
      });
      state.drawableContainer.addItem(customItem);
      state.viewer3D.render();
    };
    //添加三维标签
    const add3DLabel = () => {};
    // 清除指定标签
    const clearDesLabel = (id) => {};
    // 清除所有标签
    const clearItems = () => {
      state.drawableContainer.clear();
    };
    // 根据构建id给构建着色
    const overrideComponentsColorById = (objects, color) => {
      let activeColor = new Glodon.Web.Graphics.Color(color, 0.8);
      state.model3D.overrideComponentsColorById(objects, activeColor);
      state.viewer3D.render();
    };
    // 恢复所有构建颜色
    const overrideAllComponentsColor = () => {
      state.model3D.clearOverrideColorComponents();
      state.viewer3D.render();
    };
    // 模型隔离
    const hideComponents = (levels) => {
      state.viewer3D.isolateComponentsByObjectData(
        levels,
        Glodon.Bimface.Viewer.IsolateOption.HideOthers
      );
      state.viewer3D.render();
    };
     //漫游
    const setKeyFrames = (frames)=>{
      if(frames.length >0 &&state.walkthrough){
        state.walkthrough.setKeyFrames(frames)
        state.walkthrough.play()
      }
    }
    return {
      ...toRefs(state),
      getCamera,
      switchBimModel,
      setCameraStatus,
      zoomToComponents,
      review,
      add2DLabel,
      add3DLabel,
      clearDesLabel,
      clearItems,
      overrideComponentsColorById,
      overrideAllComponentsColor,
      hideComponents,
      setKeyFrames
    };
  },
});
</script>
<style lang="less" scoped>
#bim_container {
  width: 100%;
  height: 100%;
  .bf-tree-toolbar,
  .bf-button {
    display: none;
  }
}
</style>
