import {
  Fog,
  Group,
  MeshBasicMaterial,
  DirectionalLight,
  DirectionalLightHelper,
  AmbientLight,
  PointLight,
  Vector3,
  PointLightHelper,
  LineBasicMaterial,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  PointsMaterial,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
  NearestFilter,
  BoxGeometry,
  CatmullRomCurve3,
  TubeGeometry,
  QuadraticBezierCurve3,
  SpriteMaterial,
  Sprite,
  LinearFilter,
  NearestMipMapLinearFilter,
  Vector2,
} from "three"
import {
  Mini3d,
  Debug,
  Particles,
  Label3d,
  emptyObject,
  Plane,
  GradientShader,
  getBoundBox,
  transfromMapGeoJSON,
  LabelCanvasSprite,
} from "../../mini3d";
import { ExtrudeMap } from "./map-china/extrudeMap"
import { BaseMap } from "./map-china/baseMap"
import { Line } from "./map-china/line"
import { geoMercator } from "d3-geo"
import provincesData from "./map-china/provincesData"
import { InteractionManager } from "three.interactive"
import { SZMap } from "./map.js"
import gsap from "gsap"
import bus from "@/utils/bus"
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea()
export class ChinaMap {
  constructor(self) {
    this.self = self
    this.assets = self.assets
    this.time = self.time
    this.canvas = self.canvas
    this.camera = self.camera
    this.renderer = self.renderer
    this.scene = self.scene
    this.sizes = self.sizes
    this.run = false
    // 中心坐标
    this.pointCenter = [108.55, 34.32]
    this.flyLineCenter = [114.143142, 22.643377]
    this.depth = 5
    // 层级
    this.toBody = true
    this.zIndex = 1000
    // 是否已经点击
    this.clicked = false
    this.over = false
    this.szmap = null
    this.init()
    // 更新
    this.update()
    this.hide()
  }
  init() {
    // 场景组
    this.sceneGroup = new Group()
    this.sceneGroup.visible = false
    this.labelGroup = new Group()
    this.outsideLabelGroup = new Group()
    this.gqGroup = new Group() // 光圈组
    this.provinceNameGroup = new Group()
    this.label3d = new Label3d(this)
    this.sceneGroup.rotateX(-Math.PI / 2)

    this.sceneGroup.add(this.labelGroup, this.outsideLabelGroup, this.gqGroup, this.provinceNameGroup)
    this.scene.add(this.sceneGroup)
    this.szmap = new SZMap(this.self)
    // 创建底图
    this.createMapBg()
    // 处理地图
    this.createModel()

    // 创建标签
    this.createMapLabel()
    // 创建飞线
    this.createFlyLine()
    // 创建边框
    this.createBorderGlow()
    //
    this.createNanhaiqundao()
    // 云层移动
    this.createMoveCloud()
  }
  show() {
    this.run = true
    this.sceneGroup.visible = true
    this.sceneGroup.scale.set(0, 0, 0)
  }
  showLabel() {
    this.labelGroup.traverse((label) => {
      label.show && label.show()
    })
    this.outsideLabelGroup.traverse((label) => {
      label.show && label.show()
    })
    this.provinceNameGroup.traverse((label) => {
      label.show && label.show()
    })
  }
  hide() {
    this.run = false
    this.sceneGroup.scale.set(0, 0, 0)
    this.sceneGroup.visible = false
    this.labelGroup.traverse((label) => {
      label.hide && label.hide()
    })
    this.outsideLabelGroup.traverse((label) => {
      label.hide && label.hide()
    })
    this.provinceNameGroup.traverse((label) => {
      label.hide && label.hide()
    })
  }
  initAnimate() {
    this.scene.fog = new Fog(0x000000, 1, 250)
    this.scene.background = new Color(0x000000)
    this.camera.setCamera(false)
    this.sceneGroup.position.set(0, 0, 0)
    this.sceneGroup.scale.set(0.9, 0.9, 0.9)
    this.camera.instance.position.set(15.660082227729987, 100.21035750186074, 90.66334819407457)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()
    // this.initEnvironment()
    // 创建时间线
    let tl = gsap.timeline()
    // 相机动画
    tl.addLabel("focusMap", 0)
    tl.addLabel("focusMapOpacity", 2.0)
    tl.addLabel("bar", 3.0)
    this.time.on("tick", () => {
      if (this.run) {
      }
    })
    tl.add(
      gsap.to(this.camera.instance.position, {
        duration: 2.5,
        // x: 7.9054061316192135,
        // y: 73.47690004910885,
        // z: 81.1764201439928,

        // x: 10.85443793911254, y: 85.13443672691018, z: 78.41136065753643,

        x: 15.660082227729987, y: 100.21035750186074, z: 90.66334819407457,
        ease: "circ.out",
      })
    )

    tl.add(
      gsap.to(this.focusMapGroup.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      }),
      "focusMap"
    )
    tl.add(
      gsap.to(this.focusMapGroup.scale, {
        duration: 1,
        x: 1,
        y: 1,
        z: 1,
        ease: "circ.out",
      }),
      "focusMap"
    )

    tl.add(
      gsap.to(this.flyLineGroup.children[0].material, {
        duration: 3,
        opacity: 1,
        ease: "circ.out",
        onStart: () => {
          this.flyLineGroup.visible = true
        },
        onComplete: () => {
          this.flyLineFocusGroup.visible = true
        },
      }),
      "focusMapOpacity"
    )

    this.chinaMesh.mapGroup.traverse((obj) => {
      if (obj.isMesh) {
        tl.add(
          gsap.to(obj.material[0], {
            duration: 1,
            opacity: 1,
            // opacity: 0.2,
            ease: "circ.out",
          }),
          "focusMapOpacity"
        )
        tl.add(
          gsap.to(obj.position, {
            duration: 1,
            x: 0,
            y: 0,
            z: 0,
            ease: "circ.out",
          }),
          "focusMapOpacity"
        )
      }
    })
    tl.add(
      gsap.to(this.focusMapSideMaterial, {
        duration: 1,
        opacity: 1,
        ease: "circ.out",
      }),
      "focusMapOpacity"
    )

    tl.add(
      gsap.to(this.chinaLineMaterial, {
        duration: 0.5,
        delay: 0.3,
        opacity: 0,
      }),
      "focusMapOpacity"
    )
    tl.add(
      gsap.to(this.borderGlow.material, {
        duration: 0.5,
        delay: 0.3,
        opacity: 1,
        onComplete: () => {
          this.createStorke()
          // 添加事件
          this.addEvent()

          this.run = true
        },
      }),
      "focusMapOpacity"
    )
    tl.add(
      gsap.to(this.nanhaiqundao.material, {
        duration: 0.5,
        delay: 0.5,
        opacity: 1,
      }),
      "focusMapOpacity"
    )
    this.allBar.map((item, index) => {
      tl.add(
        gsap.to(item.scale, {
          duration: 0.5,
          delay: 0.05 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        }),
        "bar"
      )
    })
    this.allBarMaterial.map((item, index) => {
      tl.add(
        gsap.to(item, {
          duration: 0.5,
          delay: 0.05 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        }),
        "bar"
      )
    })
    this.allMesh.map((item, index) => {
      tl.add(
        gsap.to(item.material, {
          duration: 1,
          delay: 0.1 * index,
          opacity: 1,
          ease: "circ.out",
        }),
        "bar"
      )
    })

    this.allProvinceNameLabel.map((item, index) => {
      let element = item.element.querySelector(".sz-label-wrap")

      tl.add(
        gsap.to(element, {
          duration: 0.5,
          delay: 0.05 * index,
          translateY: 0,
          opacity: 1,
          ease: "circ.out",
        }),
        "bar"
      )
    })
    this.allGuangquan.map((item, index) => {
      tl.add(
        gsap.to(item.children[0].scale, {
          duration: 0.5,
          delay: 0.05 * index,
          x: item.userData.scale,
          y: item.userData.scale,
          z: item.userData.scale,
          ease: "circ.out",
        }),
        "bar"
      )
      tl.add(
        gsap.to(item.children[1].scale, {
          duration: 0.5,
          delay: 0.05 * index,
          x: item.userData.scale,
          y: item.userData.scale,
          z: item.userData.scale,
          ease: "circ.out",
        }),
        "bar"
      )
    })
  }

  // 初始化环境灯光
  initEnvironment() {
    let sun = new AmbientLight(0xffffff, 2)
    this.scene.add(sun)
    // 方向光
    let directionalLight = new DirectionalLight(0xffffff, 4)
    directionalLight.position.set(-30, 6, -8)
    directionalLight.castShadow = true
    directionalLight.shadow.radius = 20
    directionalLight.shadow.mapSize.width = 1024
    directionalLight.shadow.mapSize.height = 1024
    this.scene.add(directionalLight)

    this.createPointLight({
      color: "#0e81fb",
      intensity: 160,
      distance: 10000,
      x: -3,
      y: 16,
      z: -3,
    })
    this.createPointLight({
      color: "#1f5f7a",
      intensity: 100,
      distance: 100,
      x: -4,
      y: 8,
      z: 43,
    })
  }

  createPointLight(pointParams) {
    // 点光源
    const pointLight = new PointLight(0x1d5e5e, pointParams.intensity, pointParams.distance, 1)
    pointLight.position.set(pointParams.x, pointParams.y, pointParams.z)
    this.scene.add(pointLight)
  }
  // 模型渲染
  createModel() {
    let mapGroup = new Group()
    let focusMapGroup = new Group()
    this.focusMapLightMeshGroup = new Group()
    this.focusMapGroup = focusMapGroup
    // 地图
    let { china, chinaTopLine, chinaMapTopArea } = this.createFocusMap()
    this.chinaMesh = china
    china.setParent(focusMapGroup)
    chinaTopLine.setParent(focusMapGroup)
    chinaMapTopArea.setParent(focusMapGroup)

    focusMapGroup.position.set(0, 0, -5)
    focusMapGroup.scale.set(1, 1, 0)
    focusMapGroup.add(this.focusMapLightMeshGroup)
    mapGroup.add(focusMapGroup)
    // mapGroup.rotateX(-Math.PI / 2);
    mapGroup.position.set(0, 0.2, 0)
    this.sceneGroup.add(mapGroup)
  }

  // 创建焦点地图
  createFocusMap() {
    let mapJsonData = this.assets.getResource("chinaStorke")
    let mapLineJsonData = this.assets.getResource("china")
    let topNormal = this.assets.getResource("topNormal")

    topNormal.wrapS = topNormal.wrapT = RepeatWrapping
    // 地图线
    this.chinaLineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      opacity: 0,
      transparent: true,
      fog: false,
    })
    let [topMaterial, sideMaterial] = this.createFocusMapMaterial()

    this.focusMapTopMaterial = topMaterial
    this.focusMapSideMaterial = sideMaterial

    let china = new ExtrudeMap(this, {
      center: this.pointCenter,
      position: new Vector3(0, 0, 0.06),
      data: mapJsonData,
      depth: this.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      lineMaterial: this.chinaLineMaterial,
      renderOrder: 9,
    })

    // 重新计算uv
    let { boxSize, box3 } = getBoundBox(china.mapGroup)
    this.eventElement = []
    china.mapGroup.children.map((group, index) => {
      group.children.map((mesh) => {
        if (mesh.type === "Mesh") {
          // 重新计算uv
          this.calcUv2(mesh.geometry, boxSize.x, boxSize.y, box3.min.x, box3.min.y)
        }
      })
    })

    // 中国地图线
    this.chinaTopLineMaterial = new LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      depthTest: false,
      fog: false,
    })
    let chinaTopLine = new Line(this, {
      center: this.pointCenter,
      data: mapLineJsonData,
      // 3e4f73
      material: this.chinaTopLineMaterial,
      renderOrder: 11,
    })
    this.chinaTopLine = chinaTopLine
    chinaTopLine.lineGroup.position.z += this.depth + 0.1

    // 顶部map 点击区域
    let chinaMapTopArea = new BaseMap(this, {
      center: this.pointCenter,
      position: new Vector3(0, 0, this.depth),
      data: mapLineJsonData,
      merge: false,
      material: new MeshBasicMaterial({
        color: new Color("rgb(41,159,255)"),
        transparent: true,
        opacity: 0,
        depthTest: false,
      }),
      renderOrder: 10,
    })
    chinaMapTopArea.mapGroup.children.map((group, index) => {
      group.children.map((mesh) => {
        if (mesh.type === "Mesh") {
          mesh.material = mesh.material.clone()
          this.eventElement.push(mesh)
        }
      })
    })
    return {
      china,
      chinaTopLine,
      chinaMapTopArea,
    }
  }

  createLightMesh(userData) {
    // 深圳地图
    let focusMapData = this.assets.getResource("china")
    focusMapData = JSON.parse(focusMapData)
    focusMapData.features = focusMapData.features.filter((item) => item.properties.name === userData.name)
    focusMapData = JSON.stringify(focusMapData)

    let { faceHightMaterial, sideHightMaterial } = this.createLightMaterial()

    let focusLightMap = new ExtrudeMap(this, {
      center: this.pointCenter,
      position: new Vector3(0, 0, this.depth),
      data: focusMapData,
      depth: this.depth / 3,
      topFaceMaterial: faceHightMaterial,
      sideMaterial: sideHightMaterial,
      lineMaterial: new LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        depthTest: false,
        fog: false,
      }),
      renderOrder: 12,
      lineRenderOrder: 13,
    })
    focusLightMap.mapGroup.userData.typeName = "lightMesh"
    let box = getBoundBox(focusLightMap.mapGroup)
    focusLightMap.mapGroup.children.map((group, index) => {
      group.children.map((mesh) => {
        if (mesh.type === "Mesh") {
          this.calcUv2(mesh.geometry, box.boxSize.x, box.boxSize.y, box.box3.min.x, box.box3.min.y)
        }
      })
    })
    return focusLightMap.mapGroup
  }
  createLightMaterial() {
    let topFace = this.assets.getResource("topFace")
    // topFace.colorSpace = SRGBColorSpace
    topFace.wrapS = topFace.wrapT = RepeatWrapping
    topFace.flipY = false
    topFace.repeat.set(1, 1)

    let sideMap = this.assets.getResource("side4")

    let faceHightMaterial = new MeshBasicMaterial({
      map: topFace,
      fog: false,
      transparent: true,
    })
    let sideHightMaterial = new MeshBasicMaterial({
      map: sideMap,
      fog: false,
      transparent: true,
    })

    return { faceHightMaterial, sideHightMaterial }
  }
  // 移除事件
  removeEvent() {
    if (this.interactionManager) {
      ;[...this.eventElement, ...this.labelEventElement].map((mesh) => {
        this.interactionManager.remove(mesh)
      })
      this.interactionManager.dispose()
      this.interactionManager = null
    }
  }
  // 移除高亮网格
  removeLightMesh() {
    if (this.currentSelectMap) {
      this.focusMapLightMeshGroup.traverse((obj) => {
        this.focusMapLightMeshGroup.remove(obj)
        emptyObject(obj)
        this.currentSelectMap = null
      })
    }
  }
  // 添加事件
  addEvent() {
    this.removeEvent()

    // 交互管理器
    if (!this.interactionManager) {
      this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)
    }
    // 创建区域点击事件
    this.createAreaClickEvent()
    // 创建标签点击事件
    this.createLabelClickEvent()
  }
  createAreaClickEvent() {
    let objectsHover = []
    const reset = (mesh) => {
      gsap.to(mesh.material, {
        duration: 0.3,
        opacity: 0,
      })
      this.setFocusLabelMove(mesh.userData.adcode, "down")
      this.setGQMove(mesh.userData.adcode, "down")
      this.setLabelMove(mesh.userData.adcode, "down")
    }
    const move = (mesh) => {
      // 网格移动动画
      gsap.to(mesh.material, {
        duration: 0.3,
        opacity: 0,
      })
      this.setFocusLabelMove(mesh.userData.adcode)
      this.setGQMove(mesh.userData.adcode)
      this.setLabelMove(mesh.userData.adcode)
      mesh.traverse((obj) => {
        if (obj.isMesh) {
          obj.renderOrder = 21
        }
      })
    }
    //
    this.currentSelectMap = null
    const removeAndCreateMesh = (event) => {
      this.removeLightMesh()
      // 点击生成高亮网格
      let mesh = this.createLightMesh(event.target.userData)
      this.currentSelectMap = mesh
      this.focusMapLightMeshGroup.add(mesh)
    }
    this.eventElement.map((mesh) => {
      this.interactionManager.add(mesh)

      mesh.addEventListener("mousedown", (event) => {
        if (!this.run || this.clicked) return false
        this.clicked = true
        removeAndCreateMesh(event)
        this.self.emit("chinaMapClick", event, event.target.userData)
      })
      mesh.addEventListener("mouseup", (ev) => {
        this.clicked = false
      })
      // mesh.addEventListener("mouseover", (event) => {
      //   if (!this.run || this.over) return false
      //   this.over = true
      //   if (!objectsHover.includes(event.target.parent)) {
      //     objectsHover.push(event.target.parent)
      //   }
      //   document.body.style.cursor = "pointer"
      //   removeAndCreateMesh(event)
      //   this.self.emit("chinaMapMouseover", event, event.target.userData)
      // })
      // mesh.addEventListener("mouseout", (event) => {
      //   this.over = false
      //   objectsHover = objectsHover.filter((n) => n.userData.name !== event.target.parent.userData.name)
      //   if (objectsHover.length > 0) {
      //     const mesh = objectsHover[objectsHover.length - 1]
      //   }
      //   // reset(event.target);
      //   document.body.style.cursor = "default"
      //   this.removeLightMesh()
      //   this.self.emit("chinaMapMouseout", event, event.target.userData)
      // })
    })
  }
  /**
   * 设置柱状图移动
   * @param {*} name
   * @param {*} type up-上移  down-下移
   */
  setFocusLabelMove(adcode, type = "up") {
    this.allBar.map((focusLabelGroup) => {
      if (focusLabelGroup.userData.adcode === adcode) {
        gsap.to(focusLabelGroup.position, {
          duration: 0.3,
          z:
            type === "up"
              ? focusLabelGroup.userData.position[2] + this.depth / 2 + 0.3
              : focusLabelGroup.userData.position[2],
        })
      }
    })
  }
  /**
   * 设置光圈移动
   * @param {*} name
   * @param {*} type up-上移  down-下移
   */
  setGQMove(adcode, type = "up") {
    this.allGuangquan.map((group) => {
      if (group.userData.adcode === adcode) {
        gsap.to(group.position, {
          duration: 0.3,
          z: type === "up" ? group.userData.position[2] + this.depth / 2 + 0.3 : group.userData.position[2],
        })
      }
    })
    if (this.flyLineFocusGroup.userData.adcode === adcode) {
      gsap.to(this.flyLineFocusGroup.position, {
        duration: 0.3,
        y:
          type === "up"
            ? this.flyLineFocusGroup.userData.position[1] + this.depth / 2 + 0.3
            : this.flyLineFocusGroup.userData.position[1],
      })
    }
  }
  // 设置标签移动
  setLabelMove(adcode, type = "up") {
    ;[...this.allProvinceLabel, ...this.allProvinceNameLabel].map((label) => {
      if (label.userData.adcode === adcode) {
        gsap.to(label.position, {
          duration: 0.3,
          z: type === "up" ? label.userData.position[2] + this.depth / 2 + 0.3 : label.userData.position[2],
        })
      }
    })
  }

  calcUv2(geometry, width, height, minX, minY) {
    const positionAttribute = geometry.attributes.position
    const uvAttribute = geometry.attributes.uv
    const count = geometry.groups[0].count
    for (let i = 0; i < count; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)

      const u = (x - minX) / width
      const v = (y - minY) / height

      uvAttribute.setXY(i, u, v)
    }

    uvAttribute.needsUpdate = true
    geometry.computeVertexNormals()
  }

  createFocusMapMaterial() {
    let topNormal = this.assets.getResource("topNormal")
    topNormal.wrapS = topNormal.wrapT = RepeatWrapping
    topNormal.colorSpace = SRGBColorSpace

    let topMaterial = new MeshBasicMaterial({
      map: topNormal,
      fog: false,
      transparent: true,
      opacity: 0.2,
      side: DoubleSide,
    })

    let sideMap = this.assets.getResource("side").clone()
    sideMap.wrapS = RepeatWrapping
    sideMap.wrapT = RepeatWrapping
    sideMap.repeat.set(1, 0.05)
    // sideMap.offset.y += 0.01;
    let sideMaterial = new MeshStandardMaterial({
      // color: 0xeeeeee,
      map: sideMap,
      fog: false,
      transparent: true, // 如果设置true,侧栏会出现穿透的问题
      opacity: 0,
      side: DoubleSide,
    })
    // this.debug = new Debug(true)
    // this.debug.instance.add(topNormal)
    this.time.on("tick", () => {
      if (this.run) sideMap.offset.y += 0.002
    })
    sideMaterial.onBeforeCompile1 = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        uColor1: { value: new Color(0x2a6f72) },
        uColor2: { value: new Color(0x2a6f72) },
      }
      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
          attribute float alpha;
          varying vec3 vPosition;
          varying float vAlpha;
          void main() {
            vAlpha = alpha;
            vPosition = position;
        `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
          varying vec3 vPosition;
          varying float vAlpha;
          uniform vec3 uColor1;
          uniform vec3 uColor2;

          void main() {
        `
      )
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        #ifdef OPAQUE
        diffuseColor.a = 1.0;
        #endif

        // https://github.com/mrdoob/three.js/pull/22425
        #ifdef USE_TRANSMISSION
        diffuseColor.a *= transmissionAlpha + 0.1;
        #endif
        vec3 gradient = mix(uColor1, uColor2, vPosition.z/1.2);

        outgoingLight = outgoingLight*gradient;


        gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
        `
      )
    }
    return [topMaterial, sideMaterial]
  }
  // 创建地图标签
  createMapLabel() {
    let self = this
    let data = piniaStoreArea.marketDataCN
    const focusLabelGroup = new Group()
    this.focusLabelGroup = focusLabelGroup

    this.allMesh = []
    this.allBar = []
    this.allBarMaterial = []
    this.allGuangquan = []
    this.allProvinceLabel = []
    this.allProvinceNameLabel = []
    this.labelEventElement = []
    data.map((item, index) => {
      let [x, y] = this.geoProjection(item.centroid)
      const factor = 0.5
      const geoHeight = 0.6
      const finalHeight = item.height / 5 || 3.5
      const barTopZ = this.depth + 0.75 + finalHeight

      // 材质
      let material = new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthTest: false,
        fog: false,
      })
      // 设置渐变材质
      new GradientShader(material, {
        uColor1: getColor(item).uColor1,
        uColor2: getColor(item).uColor2,
        size: geoHeight,
        dir: "y",
      })
      const geo = new BoxGeometry(0.1 * factor, 0.1 * factor, geoHeight)
      geo.translate(0, 0, geoHeight / 2)
      let areaBar = new Mesh(geo, material)
      areaBar.renderOrder = 20
      areaBar.position.set(x, -y, this.depth + 0.75)
      areaBar.scale.set(5, 5, finalHeight / geoHeight)
      let hg = this.createHUIGUANG(finalHeight,
        getColor(item).uColor2,
      )
      areaBar.add(...hg)
      focusLabelGroup.add(areaBar)
      let mesh = this.createLabelIcon(item, new Vector3(x, -y, barTopZ + 1.15))
      this.labelEventElement.push(mesh)
      mesh.renderOrder = 100
      mesh.userData.name = item.name
      mesh.userData.adcode = item.adcode
      mesh.userData.centroid = item.centroid
      mesh.userData.center = item.center
      mesh.scale.set(1.5, 1.5, 1.5)
      this.allMesh.push(mesh)
      focusLabelGroup.add(mesh)
      // 深圳和其他标签颜色
      let color = item.start ? 0xfeb817 : 0xffffff
      let guangQuan = this.createQuan(color)
      guangQuan.position.set(x, -y, this.depth + 0.46)
      guangQuan.userData.name = item.name
      guangQuan.userData.adcode = item.adcode
      guangQuan.userData.scale = item.start ? 1.5 : 1
      guangQuan.userData.position = [x, -y, this.depth + 0.46]
      this.gqGroup.add(guangQuan)
      let nameEmptyLabel = this.labelEmptySprite(item, new Vector3(x + 1.5, -y, barTopZ + 3.15))
      let nameLabel = labelNameStyle(item, index, new Vector3(x, -y, barTopZ + 3.15))
      this.labelEventElement.push(nameEmptyLabel)
      this.labelEventElement.push(nameLabel)
      this.sceneGroup.add(nameEmptyLabel)
      this.allBar.push(mesh)
      this.allBar.push(areaBar)
      this.allBarMaterial.push(material)
      this.allGuangquan.push(guangQuan)
      this.allProvinceNameLabel.push(nameLabel)
    })
    this.sceneGroup.add(focusLabelGroup)
    function getColor(item) {
      return {
        uColor1: item.start ? 0x3F78E4 : item.status === 'close' ? 0x2e60c2 : item?.version?.includes('1.0') ? '0x007E90' : 0x50bbfe,
        uColor2: item.start ? 0xc3d8ff : item.status === 'close' ? 0x5892ff : item?.version?.includes('1.0') ? '0x58DFFF' : 0xc3d8ff,
      }
    }
    // 省份城市标签
    function labelNameStyle(data, index, position) {
      let label = self.label3d.create("", "sz-label", true)
      let labelClass = 'label-default'
      if (data.start) labelClass = "label-zb"
      if (data.status === 'close') labelClass = "label-no"
      if (data?.version?.includes('1.0')) labelClass = "label-v1"

      label.init(
        `<div class="sz-label sz-label-click ${labelClass}" data-adcode="${data.adcode}">
        <div class="sz-label-wrap">
          <div class="squer"></div>
          <div class="name">
          ${data.name}
          </div>
          <div class="number"><span class="value"></span></div>
        </div>
      </div>`,
        position
      )
      self.label3d.setLabelStyle(label, 0.08, "x")
      label.setParent(self.provinceNameGroup)
      label.userData.adcode = data.adcode
      label.userData.name = data.name
      label.userData.position = [position.x, position.y, position.z]
      return label
    }
  }
  // 创建空白标签
  labelEmptySprite(data, position) {
    let transparentTexture = this.assets.getResource("transparentTexture")
    let sprite = new Sprite(
      new SpriteMaterial({
        map: transparentTexture,
        color: 0xffffff,
        opacity: 0,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      })
    )

    const config = {
      baseWidth: 6.4,
      baseHeight: 2.5,
      szWidth: 8,
      scale: 0.6,
      szScale: 0.7,
    }
    const prodConfig = {
      baseWidth: 9.6,
      baseHeight: 2.5,
      szWidth: 8.6,
      scale: 0.5,
      szScale: 0.7,
    }
    const testConfig = {
      baseWidth: 9.6,
      baseHeight: 2.5,
      szWidth: 8.6,
      scale: 0.5,
      szScale: 0.7,
    }
    const env = import.meta.env.MODE
    const isDev = !['production', 'prod'].includes(env)
    // 设置默认基础大小
    const { baseWidth, baseHeight, szWidth, scale, szScale } = isDev ? (env === 'test' ? testConfig : config) : prodConfig
    // 根据文本内容估算大小
    const textContent = data.name || ''
    const estimatedWidth = Math.ceil(textContent.length * 0.9) + 1.4 // 根据文字长度估算宽度
    const isSZ = data.name.includes('总部')
    const labelWidth = isSZ ? szWidth : Math.max(estimatedWidth, baseWidth)  // 确保最小宽度
    // 设置精灵大小
    sprite.scale.set(labelWidth, baseHeight, 1)
    
    // 确保空白标签的位置与实际标签对齐
    sprite.center.set(isSZ ? szScale : scale, 0.5)

    sprite.position.copy(position)
    
    // 保存尺寸信息到userData中
    sprite.userData = {
        ...data,
        position: [position.x, position.y, position.z],
        width: labelWidth,
        height: baseHeight
    }

    // 调试模式
    if (this.debug) {
        sprite.material.opacity = 0.2
        sprite.material.color.setHex(0x00ff00)
    }
    
    return sprite
  }
  createHUIGUANG(h, color) {
    let geometry = new PlaneGeometry(0.1, h)
    geometry.translate(0, h / 2, 0)
    const texture = this.assets.getResource("huiguang")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    let material = new MeshBasicMaterial({
      color: color,
      map: texture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      // depthTest: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.renderOrder = 22
    mesh.rotateX(Math.PI / 2)
    let mesh2 = mesh.clone()
    let mesh3 = mesh.clone()
    mesh2.rotateY((Math.PI / 180) * 60)
    mesh3.rotateY((Math.PI / 180) * 120)
    return [mesh, mesh2, mesh3]
  }
  createLabelClickEvent() {
    this.labelEventElement.forEach((mesh) => {
      this.interactionManager.add(mesh)

      mesh.addEventListener("mousedown", (event) => {
        if (this.clicked) return false
        this.clicked = true
        this.self.emit("chinaMapLabelClick", event, event.target.userData)
      })
      mesh.addEventListener("mouseup", (event) => {
        this.clicked = false
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!this.run || this.over) return false
        this.over = true
        document.body.style.cursor = "pointer"
        this.self.emit("chinaMapLabelMouseover", event, event.target.userData)
      })
      mesh.addEventListener("mouseout", (event) => {
        this.over = false
        document.body.style.cursor = "default"
        this.self.emit("chinaMapLabelMouseout", event, event.target.userData)
      })
    })
  }
  // 创建标签图标
  createLabelIcon(data, position) {
    let icon = this.assets.getResource("point01")
    let icon2 = this.assets.getResource("point02")
    let triangleBlue = this.assets.getResource("triangleBlue")
    let triangleV1 = this.assets.getResource("triangleV1")

    let tagIcon = triangleBlue
    if (data.status === 'close') tagIcon = triangleBlue
    if (data?.version?.includes('1.0')) tagIcon = triangleV1

    icon.colorSpace = icon2.colorSpace = SRGBColorSpace
    let sprite = new Sprite(
      new SpriteMaterial({
        map: tagIcon,
        transparent: true,
        depthTest: false,
        fog: false,
        opacity: 0,
      })
    )

    sprite.scale.set(0, 0, 0)
    sprite.position.copy(position)
    // this.scene.add(sprite)
    this.sceneGroup.add(sprite)
    return sprite
  }
  // 创建标签底座光圈
  createQuan(color = 0xffffff) {
    const guangquan1 = this.assets.getResource("guangquan1")
    const guangquan2 = this.assets.getResource("guangquan2")
    let geometry = new PlaneGeometry(2, 2)

    let material1 = new MeshBasicMaterial({
      color: color,
      map: guangquan1,
      alphaMap: guangquan1,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
    })
    let material2 = new MeshBasicMaterial({
      color: color,
      map: guangquan2,
      alphaMap: guangquan2,
      opacity: 1,
      transparent: true,
      depthTest: false,
      fog: false,
    })
    let mesh1 = new Mesh(geometry, material1)
    let mesh2 = new Mesh(geometry, material2)
    mesh1.renderOrder = 24
    mesh2.renderOrder = 24

    mesh2.position.z -= 0.001
    mesh1.scale.set(0, 0, 0)
    mesh2.scale.set(0, 0, 0)
    this.quanGroup = new Group()
    this.quanGroup.add(mesh1, mesh2)

    this.time.on("tick", (delta) => {
      if (this.run) mesh1.rotation.z += delta * 2
    })
    return this.quanGroup
  }

  // 创建地图背景
  createMapBg() {
    let geometry = new PlaneGeometry(400, 400)
    const texture = this.assets.getResource("chinaMapBg")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      opacity: 1,
      transparent: true,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.scale.set(0.7, 0.7, 0.7)
    mesh.position.set(-8.9, -6.97, 0.05)
    // mesh.position.set(-8.9 + 10, -6.97, 0.05)
    this.sceneGroup.add(mesh)
  }
  // 创建发光边框
  createBorderGlow() {
    let geometry = new PlaneGeometry(129, 129)
    const texture = this.assets.getResource("chinaGlowNew")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      color: 0x009af4,
      opacity: 0,
      fog: false,
      side: DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    })
    let mesh = new Mesh(geometry, material)
    mesh.scale.set(1.13, 1.17, 1.12)
    mesh.position.set(-8.95, -6.49, 5.11)
    // mesh.position.set(-8.95 + 10, -6.49, 5.11)
    mesh.renderOrder = 100
    this.borderGlow = mesh
    this.sceneGroup.add(mesh)
  }
  // 创建
  createNanhaiqundao() {
    let geometry = new PlaneGeometry(17, 23)
    const texture = this.assets.getResource("nanhaiqundao")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      opacity: 0,
      fog: false,
      side: DoubleSide,
      transparent: true,
    })
    let mesh = new Mesh(geometry, material)
    let point = [126.28785174, 21.93199205]
    let [x, y] = this.geoProjection(point)
    mesh.scale.set(0.5, 0.5, 0.5)
    mesh.position.set(x, -y, this.depth)

    this.nanhaiqundao = mesh
    this.sceneGroup.add(mesh)
  }

  // 创建飞线
  createFlyLine() {
    this.flyLineGroup = new Group()
    this.flyLineGroup.visible = false

    this.sceneGroup.add(this.flyLineGroup)

    const texture = this.assets.getResource("flyLine")
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    const tubeRadius = 0.1
    const tubeSegments = 32
    const tubeRadialSegments = 8
    const closed = false
    let [centerX, centerY] = this.geoProjection(this.flyLineCenter)
    let centerPoint = new Vector3(centerX, -centerY, 0)
    const material = new MeshBasicMaterial({
      map: texture,
      alphaMap: texture,
      color: 0xff9800,
      transparent: true,
      fog: false,
      opacity: 0,
      depthTest: false,
      blending: AdditiveBlending,
    })
    this.time.on("tick", () => {
      if (this.run) texture.offset.x -= 0.003
    })
    piniaStoreArea.marketDataCN.map((city) => {
      let [x, y] = this.geoProjection(city.centroid)
      let point = new Vector3(x, -y, 0)
      const center = new Vector3()
      center.addVectors(centerPoint, point).multiplyScalar(0.5)
      center.setZ(15)
      const curve = new QuadraticBezierCurve3(centerPoint, center, point)
      const tubeGeometry = new TubeGeometry(curve, tubeSegments, tubeRadius, tubeRadialSegments, closed)
      const mesh = new Mesh(tubeGeometry, material)
      mesh.position.set(0, 0, this.depth + 0.4)
      mesh.renderOrder = 21
      this.flyLineGroup.add(mesh)
    })
    this.createFlyLineFocus()
  }
  createFlyLineFocus() {
    this.flyLineFocusGroup = new Group()
    this.flyLineFocusGroup.visible = false
    this.sceneGroup.add(this.flyLineFocusGroup)
    let [x, y] = this.geoProjection(this.flyLineCenter)
    this.flyLineFocusGroup.position.set(x, -y, this.depth + 0.47)
    this.flyLineFocusGroup.userData.name = "深圳总部" // 设置光圈的名字
    this.flyLineFocusGroup.userData.adcode = 440000 //设置光圈的adcode
    this.flyLineFocusGroup.userData.position = [x, -y, this.depth + 0.47] //设置光圈的位置

    const flyLineFocus = this.assets.getResource("guangquan1")
    const geometry = new PlaneGeometry(5, 5)
    const material = new MeshBasicMaterial({
      color: 0xff9800,
      map: flyLineFocus,
      alphaMap: flyLineFocus,
      transparent: true,
      fog: false,
      depthTest: false,
    })
    const mesh = new Mesh(geometry, material)
    mesh.renderOrder = 30
    mesh.scale.set(0, 0, 0)
    const mesh2 = mesh.clone()
    mesh2.material = material.clone()
    this.flyLineFocusGroup.add(mesh, mesh2)
    gsap.to(mesh.material, {
      opacity: 0,
      repeat: -1,
      yoyo: false,
      duration: 1,
    })
    gsap.to(mesh.scale, {
      x: 2,
      y: 2,
      z: 2,
      repeat: -1,
      yoyo: false,
      duration: 1,
    })
    gsap.to(mesh2.material, {
      delay: 0.5,
      opacity: 0,
      repeat: -1,
      yoyo: false,
      duration: 1,
    })
    gsap.to(mesh2.scale, {
      delay: 0.5,
      x: 2,
      y: 2,
      z: 2,
      repeat: -1,
      yoyo: false,
      duration: 1,
    })
  }

  // 创建轮廓
  createStorke() {
    if (this.storkeLine) return false
    let mapJsonData = this.assets.getResource("chinaStorke")
    const texture = this.assets.getResource("pathLine").clone()
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)

    this.storkeLine = new Line(this, {
      center: this.pointCenter,
      position: new Vector3(0, 0, this.depth + 0.5),
      data: mapJsonData,
      material: new MeshBasicMaterial({
        color: 0x2bc4dc,
        map: texture,
        alphaMap: texture,
        fog: false,
        transparent: true,
        opacity: 1,
        blending: AdditiveBlending,
      }),
      type: "Line3",
      renderOrder: 101,
    })
    this.sceneGroup.add(this.storkeLine.lineGroup)
    this.time.on("tick", () => {
      if (this.run) texture.offset.x += 0.002
    })
  }

  createMoveCloud() {
    this.moveCloudGroup = new Group()
    this.moveCloudGroup.move = () => {
      this.szmap.show()
      gsap.to(".clouds-wrap .cloud", {
        translateX: "-100%",
        duration: 3,
        stagger: 0.025,
        ease: "power1.inOut",
      })
      gsap.to(this.camera.instance.position, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power1.inOut",
        onStart: () => {
          this.run = false
        },
        onComplete: () => {
          this.hide()
          this.removeLightMesh()
          this.sceneGroup.visible = false
          this.sceneGroup.scale.set(0, 0, 0)
          this.szmap.showLabel()
          setTimeout(() => {
            this.szmap.initAnimate()
          }, 0)
        },
      })
    }
  }
  goBack() {
    gsap.to(".clouds-wrap .cloud", {
      translateX: "-110%",
      duration: 0,
    })
    gsap.to(".clouds-wrap .cloud", {
      translateX: "100%",
      duration: 3,
      stagger: 0.025,
      ease: "power1.inOut",
    })
    gsap.to(this.camera.instance.position, {
      // x: 7.9054061316192135,
      // y: 73.47690004910885,
      // z: 81.1764201439928,
      x: 15.660082227729987, y: 100.21035750186074, z: 90.66334819407457,
      duration: 1.5,
      delay: 1.5,
      ease: "power1.inOut",
      onStart: () => {
        this.sceneGroup.visible = true
        this.sceneGroup.position.set(0, 0, 0)
        this.sceneGroup.scale.set(0.9, 0.9, 0.9)
        this.removeLightMesh()
        this.showLabel()
        this.addEvent();
      },
      onComplete: () => {
        this.camera.instance.near = 1
        this.camera.instance.far = 10000
        this.camera.instance.updateProjectionMatrix()
        this.removeLightMesh()
        this.run = true
      },
    })
    gsap.to(
      { time: 0 },
      {
        time: 1,
        duration: 1.5,

        onComplete: () => {
          this.scene.fog = new Fog(0x000000, 1, 250)
          this.scene.background = new Color(0x000000)
          this.removeLightMesh()
          this.camera.instance.near = 1
          this.camera.instance.far = 10000
          this.camera.instance.updateProjectionMatrix()
          this.szmap.hide()
        },
      }
    )
  }
  geoProjection = (args) => {
    // return geoMercator().center(this.pointCenter).scale(120).translate([10, 0])(args)
    return geoMercator().center(this.pointCenter).scale(120).translate([0, 0])(args)
  }
  // 更新
  update() {
    this.time.on("tick", () => {
      if (this.run) {
        this.interactionManager && this.interactionManager.update()
      }
    })
  }
  // 销毁
  destroy() {
    this.label3d && this.label3d.destroy()
    this.stats && this.stats.dom && document.body.removeChild(this.stats.dom)
    this.interactionManager && this.interactionManager.dispose()
    this.szmap && this.szmap.destroy()
  }
}