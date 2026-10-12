<template>
  <div :id="id" class="bim_container" :class="{ hide_tools: hideTools }"></div>
</template>

<script>
export default {
  props: {
    model: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    view: {
      type: Boolean,
      default: () => {
        return true;
      },
    },
    hideTools: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
  },
  data() {
    return {
      viewer3D: null,
      marker3D: null,
      selectedMenu: '',
      bimPath: null,
      //   'unZipFile/1287732811710042113/福田农批（转换文件）/viewToken.json',
      // bimPath:
      //   'unZipFile/1287732811710042113/海吉星-福田农批-交易区一层/viewToken.json',
      databagId: '',
      viewToken: null,
      modelId: null,
      floor: '',
      id: 'bim_container',
      bimLoad: false,
      handleViewAdded: null,
    };
  },
  mounted() {
    // if (this.bimPath) {
    //   this.reload(this.bimPath);
    // }
  },
  beforeDestroy() {
    if (this.viewer3D) {
      this.viewer3D.removeView(this.databagId);
    }
    this.viewer3D = null;
    this.marker3D = null;
  },
  methods: {
    getViewer3D() {
      return this.viewer3D;
    },
    initBim(path) {
      var BimfaceLoaderConfig = new BimfaceSDKLoaderConfig();
      BimfaceLoaderConfig.dataEnvType = BimfaceEnvOption.Local;
      BimfaceLoaderConfig.sdkPath = './Bim/jssdk/';
      BimfaceLoaderConfig.path = '/bimresource/' + path;
      BimfaceSDKLoader.load(
        BimfaceLoaderConfig,
        this.onSDKLoadSucceeded,
        this.onSDKLoadFailed,
      );
    },
    reload(path) {
      if (path === this.bimPath) {
        this.$nextTick(() => {
          this.$emit('onSuccess', this.viewMeteData);
          this.$emit('viewAdded', this.viewMeteData);
          this.handleViewAddedOnce(this.viewMeteData);
        });
      } else {
        if (this.viewer3D && this.databagId) {
          this.viewer3D.removeView(this.databagId);
        }
        this.bimPath = path;
        this.initBim(path);
      }
    },
    onSDKLoadSucceeded(viewMeteData) {
      this.viewMeteData = viewMeteData;
      if (viewMeteData.viewType === '3DView') {
        const { databagId, viewToken, modelId } = viewMeteData;
        this.databagId = databagId;
        this.viewToken = viewToken;
        this.modelId = modelId;

        if (this.viewer3D) {
          this.viewer3D.addModel(viewMeteData);
          return;
        }
        var view = document.getElementById(this.id);
        var config = new Glodon.Bimface.Application.WebApplication3DConfig();
        config.domElement = view;
        var eventManager = Glodon.Bimface.Application.WebApplication3DEvent;
        this.app = new Glodon.Bimface.Application.WebApplication3D(config);
        // this.app.addView(viewMeteData.viewToken);
        window.viewer3D = this.viewer3D = this.app.getViewer();
        this.viewer3D.addModel(viewMeteData);
        // 按需加载 貌似不起作用
        // this.viewer3D.showExclusiveComponentsByObjectData(
        //   [{ specialty: '交易区' }],
        //   () => {},
        //   () => {
        //     this.viewer3D.render();
        //   },
        // );

        // 设置背景透明
        var backGroundColor = new Glodon.Web.Graphics.Color(255, 255, 255, 0);
        this.viewer3D.setBackgroundColor(backGroundColor);
        // 初始化 DrawableContainer 引线标签
        const drawableConfig = new Glodon.Bimface.Plugins.Drawable.DrawableContainerConfig();
        drawableConfig.viewer = this.viewer3D;
        this.drawableContainer = new Glodon.Bimface.Plugins.Drawable.DrawableContainer(
          drawableConfig,
        );
        //三维标签的配置类
        // var markerConfig = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainerConfig();
        // markerConfig.viewer = this.viewer3D;
        // this.marker3D = new Glodon.Bimface.Plugins.Marker3D.Marker3DContainer(
        //   markerConfig,
        // );
        // 设置鼠标左右键
        this.viewer3D.setOrbitButton(Glodon.Bimface.Viewer.OrbitButton.Right);
        // 监听模型加载
        this.viewer3D.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.ViewAdded,
          () => {
            this.viewer3D.hideViewHouse();
            this.viewer3D.setBorderLineEnabled(false);
            // 添加按钮
            this.addButtom(this.app);
            this.bimLoad = true;
            this.$emit('onSuccess', viewMeteData);
            this.$emit('viewAdded', viewMeteData);
            this.handleViewAddedOnce(viewMeteData);
            // 画轨迹线
            // var curve =  this.createCurve()
            // var extObjMng = new Glodon.Bimface.Viewer.ExternalObjectManager(this.viewer3D);
            // extObjMng.clear();
            // extObjMng.addObject("curve", curve);
          },
        );
        // 监听模型移除事件
        this.viewer3D.addEventListener(
          Glodon.Bimface.Viewer.Viewer3DEvent.RemoveView,
          () => {
            this.bimLoad = false;
          },
        );
        // 监听模型点击事件
        this.viewer3D.addEventListener('MouseClicked', (objectdata) => {
          if (objectdata.objectId) {
            this.viewer3D.getComponentProperty(objectdata.objectId, (data) => {
              this.$emit('click', objectdata, data, viewMeteData);
            });
          } else {
            this.$emit('click', objectdata, null, viewMeteData);
          }
        });
        this.viewer3D.addEventListener('MouseDoubleClicked', (objectdata) => {
          if (objectdata.objectId) {
            this.viewer3D.getComponentProperty(objectdata.objectId, (data) => {
              this.$emit('doubleClick', objectdata, data, viewMeteData);
            });
          } else {
            this.$emit('doubleClick', objectdata, null, viewMeteData);
          }
        });
      }
    },
    handleViewAddedOnce(viewMeteData) {
      if (this.handleViewAdded) {
        this.handleViewAdded(viewMeteData);
        this.handleViewAdded = null;
      }
    },
    onSDKLoadFailed(error) {
    },
    // 画轨迹线
    createCurve() {
      let points = [
        {
          x: -67019.52046101454,
          y: -28906.5612656233,
          z: 213434.97955076938,
        },
        {
          x: -48406.75442207669,
          y: -12583.085463329411,
          z: 213885.48257511022,
        },
        {
          x: -20820.499626453806,
          y: 7236.766231013186,
          z: 213952.39014160822,
        },
        {
          x: -20907.567276915684,
          y: -21459.23712282487,
          z: 213135.90929526123,
        },
        {
          x: -48556.06547227933,
          y: -10178.793094698965,
          z: 209998.14737278604,
        },
      ];
      var splineCurve = new Glodon.Bimface.Plugins.Geometry.SplineCurve(points);
      splineCurve.setWidth(10);
      splineCurve.setColor(new Glodon.Web.Graphics.Color(255, 255, 0, 0.6));
      splineCurve.setStyle({
        lineType: 'Dashed',
        lineStyle: {
          // 虚线中单个短划线的长度
          dashLength: 0,
          // 虚线中短划线之间间隙的长度
          gapLength: 0,
        },
      });
      // 样条曲线类型为spline，折线为polyline
      splineCurve.setType('polyline');

      return splineCurve;
    },
    // 模型隔离
    hideComponents(arr, type) {
      let state = type ? type : Glodon.Bimface.Viewer.IsolateOption.HideOthers;
      this.viewer3D.isolateComponentsByObjectData(arr, state);
      this.viewer3D.render();
    },
    setBimshift(exposureShift, lineEnabled) {
      // 设置曝光度
      this.viewer3D.setExposureShift(exposureShift);
      // 取消轮廓线
      this.viewer3D.setBorderLineEnabled(lineEnabled);
    },
    // 设置视角
    setView(view) {
      this.viewer3D.setView(view);
      this.viewer3D.render();
    },
    // 设置相机状态
    setCameraStatus(camera) {
      this.viewer3D.setCameraStatus(camera);
      this.viewer3D.render();
    },
    // 设置半透明
    setBimTransparent(arr) {
      this.viewer3D.transparentComponentsByObjectData(arr);
      this.viewer3D.render();
    },
    // 取消所有构件半透明
    opaqueAllComponents() {
      this.viewer3D.opaqueAllComponents();
      this.viewer3D.render();
    },
    // 构建闪烁
    setBlinkColor(objectArr, setclear) {
      this.viewer3D.enableBlinkComponents(true);
      this.viewer3D.addBlinkComponentsById(objectArr);
      this.viewer3D.setBlinkColor(new Glodon.Web.Graphics.Color('#f5222d', 1));
      this.viewer3D.setBlinkIntervalTime(250);
      if (setclear) {
        setTimeout(() => {
          this.viewer3D.clearBlinkComponentsById(objectArr);
          this.viewer3D.render();
        }, 5000);
      }
      this.viewer3D.render();
    },
    // 添加工具条按钮
    addButtom(app) {
      this.createBtn(
        app,
        '建筑切换',
        '<i class="el-icon-s-grid" style="font-size: 26px;"></i>',
        this.restore,
      );
    },
    // 创建按钮
    createBtn(app, title, html, callback) {
      const toolbar = app.getToolbar('MainToolbar');
      const btnConfig = new Glodon.Bimface.UI.Button.ButtonConfig();
      btnConfig.title = title;
      const btn = new Glodon.Bimface.UI.Button.Button(btnConfig);
      btn.setHtml(html);
      btn.addClassName('btn-test');
      btn.addEventListener('Click', function () {
        if (callback) callback();
      });
      // 设置按钮的位置
      toolbar.insertControl(0, btn);
    },
    // 恢复模型初始状态
    restore() {
      this.$emit('restore');
    },
    // 恢复模型主视角
    review() {
      this.viewer3D.setView(Glodon.Bimface.Viewer.ViewOption.Home);
    },
    // 取消所有隔离
    clearIsolation() {
      this.viewer3D.clearIsolation();
      this.viewer3D.render();
    },
    // 获取视角
    getCameraStatus() {
      return this.viewer3D.getCameraStatus();
    },
    // 缩放到构件
    zoomToComponents(arr) {
      this.viewer3D.clearSelectedComponents();
      this.viewer3D.setSelectedComponentsById(arr);
      this.viewer3D.zoomToSelectedComponents();
    },
    // 添加自定义标签
    addLabel(labelData, Dom, x = 0, y = 0, handleClick) {
      if (labelData && Dom) {
        let config = new Glodon.Bimface.Plugins.Drawable.CustomItemConfig();
        config.offsetX = x;
        config.offsetY = y;
        config.content = Dom;
        config.viewer = this.viewer3D;
        config.worldPosition = labelData.position;
        let customItem = new Glodon.Bimface.Plugins.Drawable.CustomItem(config);
        customItem.onClick((item) => {
          if (handleClick) handleClick(labelData, item);
        });
        // 添加自定义标签
        this.drawableContainer.addItem(customItem);
      }
    },
    //按构件ID给构件着色
    overrideComponentsColorById(arr, color) {
      this.viewer3D.overrideComponentsColorById(arr, color);
      this.viewer3D.render();
    },
  },
};
</script>

<style lang="less" scoped>
.bim_container {
  // width: calc(100% - 500px);
  // height: calc(100% - 280px);
  // position: fixed;
  // top: 0;
  // left: 0;
  width: 100%;
  height: 100%;
}
</style>
<style lang="less">
.hide_tools.bim_container {
  .bf-toolbar.bf-toolbar-bottom {
    display: none;
  }

  .bf-toolbar.bf-tree-toolbar {
    display: none;
  }

  .bf-credit.bf-viewer3d-credit {
    display: none;
  }
}
</style>
