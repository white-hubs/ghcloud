import {
  PlaneGeometry,
  Mesh,
  RepeatWrapping,
  AmbientLight,
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  Color,
  Float32BufferAttribute,
  PointsMaterial,
  Points,
  BufferGeometry,
  SRGBColorSpace,
  Vector3,
  Sprite,
  SpriteMaterial,
  MeshBasicMaterial,
  AdditiveBlending,
  SphereGeometry,
  Group,
} from "three"
import {
  Mini3d,
  Globe,
  latLongToVector3,
  RippleCirle,
  LabelCanvasSprite,
  transfromMapGeoJSON,
  getBoundBox,
} from "../mini3d"
import { Assets } from "./assets"
import countryFlyLineData from "../components/mapComponents/globe/countryFlyLineData"
import { PathLine } from "../components/mapComponents/globe/PathLine"
import { createCountryMergeSphereLine, checkDistance } from "../components/mapComponents/globe/utils"
import { generateMap } from "../components/mapComponents/globe/CountryMesh"
import { InteractionManager } from "three.interactive"
import gsap from "gsap"
import { ChinaMap } from "../components/mapComponents/map-china"

export class GHChinaMap extends Mini3d {
  constructor(canvas) {
    super(canvas, { isOrthographic: true })

    this.camera.instance.position.set(0, 52.382497908315344, 295.39139106088675)
    this.camera.instance.lookAt(0, 0, 0)
    this.camera.instance.updateProjectionMatrix()
    this.renderer.instance.setClearColor(0x000000, 0)
    this.renderer.postprocessing = false
    this.chinaMap = null

    this.camera.controls.enableZoom = true
    this.camera.controls.enablePan = false
    this.camera.controls.enableRotate = false
    // this.time.on("tick", () => {
    // })
    this.initEnvironment()
    this.initAssets(() => {
      document.querySelector('.progress-bar').className+=' progress-bar-100'
      setTimeout(() => {
        this.chinaMap = new ChinaMap(this)
        this.initModel()
        this.showChinaMap()
        this.addEvent()
        // 触发渲染完成事件
        this.emit("renderCompleted")
        document.querySelector('.progress-bar-box').remove()
      }, 100);
    })
  }

  // 初始化环境灯光
  initEnvironment() {
    let sun = new AmbientLight(0xffffff, 4)
    this.scene.add(sun)
    this.sun = sun
    // 方向光
    let directionalLight = new DirectionalLight(0xffffff, 6)
    directionalLight.position.set(238, 90, -8)
    // 辅助对象
    let directionalLightHelp = new DirectionalLightHelper(directionalLight, 200)
    this.scene.add(directionalLight)
  }
  initAssets(onLoadCallback) {
    let assets = new Assets(onLoadCallback)
    this.assets = assets.instance
  }

  // 模型渲染
  initModel() {
    const earthAtmos = this.assets.getResource("earthAtmos")
    const earthNight = this.assets.getResource("earthNight")
    const earthNormal = this.assets.getResource("earthNormal")
    const earthSpecular = this.assets.getResource("earthSpecular")
    const highLight = this.assets.getResource("highLight")
    highLight.colorSpace = SRGBColorSpace
    earthAtmos.colorSpace = SRGBColorSpace
    this.createStars()

    let wallGroup = this.createChinaWall()
    let { chinaMeshBgMaterial } = this.createChinaMeshBg()
    let { chinaMeshsGroup } = this.createChinaMesh()
    let chinaLine = this.createChinaLine()
    this.chinaLine = chinaLine
    let { chinaTopLine, chinaTopLineMaterial } = this.createTopStorke()
    let rippleGroup = this.createRippleCirle()
    this.rippleGroup = rippleGroup
    wallGroup.add(chinaLine, chinaTopLine)
  }
  // 创建墙
  createChinaWall() {
    let wallGroup = new Group()
    // 路径
    let mapJsonData = this.assets.getResource("chinaStorke")
    mapJsonData = transfromMapGeoJSON(mapJsonData)
    let coordinates = []
    mapJsonData.features[0].geometry.coordinates[0].map((coords) => {
      coords.map((cood) => {
        let { x, y, z } = latLongToVector3(...cood, 110)
        coordinates.push(x, y, z)
      })
    })

    let geoJson = this.assets.getResource("chinaStorke")
    let worldData = transfromMapGeoJSON(geoJson)
    for (let i = 0; i < 40; i++) {
      let line = createCountryMergeSphereLine(100 + i * 0.1, worldData, {
        color: 0x394c67,
        transparent: true,
        opacity: 0.8,
        // opacity: 0.5,
        // depthWrite: false,
        // depthTest: false,
      })
      // line.renderOrder = 2
      wallGroup.add(line)
    }

    let line3 = createCountryMergeSphereLine(104.2, worldData, {
      color: 0xcaeeff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    })
    line3.renderOrder = 100
    this.line3 = line3

    wallGroup.add(line3)
    // this.globe.add(wallGroup)
    this.wallGroup = wallGroup
    wallGroup.scale.set(0.7, 0.7, 0.7)

    return wallGroup
  }
  createChinaMeshBg() {
    let chinaGlow = this.assets.getResource("chinaGlow")
    chinaGlow.wrapS = chinaGlow.wrapT = RepeatWrapping
    chinaGlow.colorSpace = SRGBColorSpace
    let geometry = new SphereGeometry(103.9, 100, 100)
    let chinaMeshBgMaterial = new MeshBasicMaterial({
      // color: 0x37a6ff,
      map: chinaGlow,
      transparent: true,
      side: DoubleSide,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    })
    let mesh = new Mesh(geometry, chinaMeshBgMaterial)
    mesh.renderOrder = 98
    // this.globe.add(mesh)
    return { chinaMeshBgMaterial }
  }
  // 创建中国网格
  createChinaMesh() {
    // 路径
    let mapJsonData = this.assets.getResource("china")
    mapJsonData = transfromMapGeoJSON(mapJsonData)
    let chinaMeshs = generateMap(mapJsonData, 103.92)
    let chinaMeshsGroup = new Group()
    chinaMeshsGroup.add(...chinaMeshs)
    let { boxSize, box3 } = getBoundBox(chinaMeshsGroup)
    let chinaMeshsMaterial = new MeshBasicMaterial({
      color: 0x37a6ff,
      transparent: true,
      side: DoubleSide,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
    })
    let defaultMaterial = chinaMeshsMaterial.clone()
    let lightMaterial = chinaMeshsMaterial.clone()
    let clickMaterial = chinaMeshsMaterial.clone()
    defaultMaterial.opacity = 0
    lightMaterial.opacity = 0.4
    clickMaterial.opacity = 0.5
    lightMaterial.color = new Color("rgb(41,159,255)")
    clickMaterial.color = new Color(0xffffff)
    this.chinaMeshObj = {
      eventElement: [],
      defaultMaterial: defaultMaterial,
      lightMaterial: lightMaterial,
      clickMaterial: clickMaterial,
    }
    chinaMeshsGroup.traverse((obj) => {
      if (obj.isMesh) {
        this.chinaMeshObj.eventElement.push(obj)
        obj.material = chinaMeshsMaterial
        obj.renderOrder = 99
        this.calcUv2(obj.geometry, boxSize.x, boxSize.y, box3.min.x, box3.min.y)
      }
    })
    return { chinaMeshsGroup, chinaMeshsMaterial }
  }

  calcUv2(geometry, width, height, minX, minY) {
    const positionAttribute = geometry.attributes.position
    const uvAttribute = geometry.attributes.uv
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)

      const u = (x - minX) / width
      const v = (y - minY) / height

      uvAttribute.setXY(i, u, v)
    }

    uvAttribute.needsUpdate = true
    geometry.computeVertexNormals()
  }

  // 创建光柱
  createLightPillar(size, color) {
    const group = new Group()
    const texture = this.assets.getResource("lightPillar")
    let rate = 41 / 200 // 图片宽高比
    let height = size / rate // 通过传入的尺寸，计算高度
    const geometry = new PlaneGeometry(size, height)
    geometry.rotateX(Math.PI / 2) //光柱高度方向旋转到z轴上
    geometry.translate(0, 0, height / 2) //平移使光柱底部与XOY平面重合
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
      color: color,
    })
    const mesh = new Mesh(geometry, material)
    mesh.renderOrder = 110
    const mesh2 = mesh.clone()
    mesh2.rotation.z = Math.PI / 2
    group.add(mesh, mesh2)
    return group
  }

  // 创建圆环中心点
  createPointLight(size, color) {
    const texture = this.assets.getResource("pointLight")
    const geometry = new PlaneGeometry(size, size)
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      color: color,
      blending: AdditiveBlending,
    })
    const mesh = new Mesh(geometry, material)
    mesh.renderOrder = 110
    return mesh
  }
  // 创建波动圆环
  createRippleCirle() {
    this.labelMeshObj = {
      eventElement: [],
      defaultColor: new Color("rgb(57,110,224)"),
      lightColor: new Color(0xffff00),
      clickColor: new Color(0x00ffff),
      focusColor: new Color(0xff6666),
    }
    let rippleGroup = new Group()
    rippleGroup.visible = false
    const gData = countryFlyLineData.map((item, index) => ({
      lat: item.centroid[0],
      lng: item.centroid[1],
      color: item.name === "深圳" ? this.labelMeshObj.focusColor : this.labelMeshObj.defaultColor,
      name: item.name,
      adcode: item.adcode,
      // color: colors[index % 3],
    }))

    gData.forEach((data, index) => {
      let R = 105

      let rippleCirle = new RippleCirle(this, {
        number: data.name === "深圳" ? 5 : 3,
        radius: data.name === "深圳" ? 2.5 : 1.5,
        frequency: 2,
        color: data.color,
      })
      rippleCirle.instance.userData = data
      this.labelMeshObj.eventElement.push(rippleCirle.instance)
      rippleCirle.setParent(rippleGroup)
      rippleCirle.instance.traverse((obj) => {
        if (obj.name === "CircleLine") {
          obj.renderOrder = 110
        }
      })
      let p = latLongToVector3(data.lat, data.lng, R)
      rippleCirle.setPosition(new Vector3(p.x, p.y, p.z))
      // mesh姿态设置
      // mesh在球面上的法线方向(球心和球面坐标构成的方向向量)
      var coordVec3 = new Vector3(p.x, p.y, p.z).normalize()
      // mesh默认在XOY平面上，法线方向沿着z轴new THREE.Vector3(0, 0, 1)
      var meshNormal = new Vector3(0, 0, 1)
      // 四元数属性.quaternion表示mesh的角度状态
      //.setFromUnitVectors();计算两个向量之间构成的四元数值
      rippleCirle.instance.quaternion.setFromUnitVectors(meshNormal, coordVec3)

      let point = this.createPointLight(4, data.color)
      rippleCirle.instance.add(point)
      let lightPillar = this.createLightPillar(3, data.color)
      rippleCirle.instance.add(lightPillar)
      rippleCirle.instance.userData = {
        name: data.name,
        adcode: data.adcode,
      }
    })

    return rippleGroup
  }
  removeEvent() {
    // 先销毁
    if (this.interactionManager) {
      this.labelMeshObj.eventElement.map((mesh) => {
        this.interactionManager.remove(mesh)
      })
      this.interactionManager && this.interactionManager.dispose()
    }
  }
  addEvent() {
    this.removeEvent()
    // 交互管理器
    this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)
    this.eventAction()
    this.addLabelEvent()
    this.addChinaMeshEvent()
  }
  eventAction() {
    this.labelEventAction = {
      reset: (mesh) => {
        // 还原颜色

        this.chinaMeshObj.eventElement.map((item) => {
          this.chinaMeshEventAction.reset(item)
        })
      },
      over: (mesh) => {
        // 设置发光颜色

        this.chinaMeshObj.eventElement.map((item) => {
          if (item.userData.adcode === mesh.userData.adcode) {
            this.chinaMeshEventAction.over(item)
          }
        })
      },
      click: (mesh) => {
        // 设置发光颜色
        // mesh.traverse((obj) => {
        //   if (obj.isMesh) {
        //     obj.material.color = this.labelMeshObj.clickColor
        //   }
        // })
      },
    }
    this.chinaMeshEventAction = {
      reset: (mesh) => {
        // 还原颜色
        mesh.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = this.chinaMeshObj.defaultMaterial.clone()
          }
        })
      },
      over: (mesh) => {
        // 设置发光颜色
        mesh.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = this.chinaMeshObj.clickMaterial.clone()
          }
        })
      },
      click: (mesh) => {
        // 设置发光颜色
        mesh.traverse((obj) => {
          if (obj.isMesh) {
            obj.material = this.chinaMeshObj.clickMaterial.clone()
          }
        })
      },
    }
  }
  addLabelEvent() {
    let objectsHover = []

    this.labelMeshObj.eventElement.map((mesh) => {
      this.interactionManager.add(mesh)

      mesh.addEventListener("mousedown", (event) => {
        if (this.clicked) return false
        this.clicked = true
        this.emit("labelClick", event, event.target.userData)
        this.labelEventAction.click(event.target)
      })
      mesh.addEventListener("mouseup", (ev) => {
        this.clicked = false
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!objectsHover.includes(event.target)) {
          objectsHover.push(event.target)
        }
        document.body.style.cursor = "pointer"
        this.labelEventAction.over(event.target)
      })
      mesh.addEventListener("mouseout", (event) => {
        objectsHover = objectsHover.filter((n) => n.userData.name !== event.target.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }
        this.labelEventAction.reset(event.target)
        document.body.style.cursor = "default"
      })
    })
  }
  addChinaMeshEvent() {
    let objectsHover = []

    this.chinaMeshObj.eventElement.map((mesh) => {
      this.interactionManager.add(mesh)

      mesh.addEventListener("mousedown", (event) => {
        if (this.clicked) return false
        this.clicked = true
        this.emit("chinaMeshClick", event, event.target.userData)
        this.chinaMeshEventAction.click(event.target)
      })
      mesh.addEventListener("mouseup", (ev) => {
        this.clicked = false
      })
      mesh.addEventListener("mouseover", (event) => {
        if (!objectsHover.includes(event.target)) {
          objectsHover.push(event.target)
        }
        document.body.style.cursor = "pointer"
        this.chinaMeshEventAction.over(event.target)
      })
      mesh.addEventListener("mouseout", (event) => {
        objectsHover = objectsHover.filter((n) => n.userData.name !== event.target.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }
        this.chinaMeshEventAction.reset(event.target)
        document.body.style.cursor = "default"
      })
    })
  }
  // 创建星空
  createStars() {
    const starsGeometry = [new BufferGeometry(), new BufferGeometry()]
    const vertices1 = []
    const vertices2 = []
    const vertex = new Vector3()
    for (let i = 0; i < 250; i++) {
      vertex.y = Math.random() * 2 - 1
      vertex.z = Math.random() * 2 - 1
      vertex.multiplyScalar(20)

      vertices1.push(vertex.x, vertex.y, vertex.z)
    }
    for (let i = 0; i < 1500; i++) {
      vertex.x = Math.random() * 2 - 1
      vertex.y = Math.random() * 2 - 1
      vertex.z = Math.random() * 2 - 1
      vertex.multiplyScalar(10)

      vertices2.push(vertex.x, vertex.y, vertex.z)
    }

    starsGeometry[0].setAttribute("position", new Float32BufferAttribute(vertices1, 3))
    starsGeometry[1].setAttribute("position", new Float32BufferAttribute(vertices2, 3))
    const starsMaterials = [
      new PointsMaterial({ color: 0x9c9c9c, size: 2, sizeAttenuation: false }),
      new PointsMaterial({ color: 0x9c9c9c, size: 1, sizeAttenuation: false }),
      new PointsMaterial({ color: 0x838383, size: 1, sizeAttenuation: false }),
      new PointsMaterial({ color: 0x5a5a5a, size: 2, sizeAttenuation: false }),
      new PointsMaterial({ color: 0x5a5a5a, size: 1, sizeAttenuation: false }),
    ]
    for (let i = 10; i < 30; i++) {
      const stars = new Points(starsGeometry[i % 2], starsMaterials[i % 6])

      stars.rotation.x = Math.random() * 10
      stars.rotation.y = Math.random() * 10
      stars.rotation.z = Math.random() * 10
      stars.scale.setScalar(i * 10)

      stars.matrixAutoUpdate = false
      stars.updateMatrix()
      this.stars = stars
      this.scene.add(stars)
    }
  }
  createChinaLine() {
    let geoJson = this.assets.getResource("china")
    let worldData = transfromMapGeoJSON(geoJson)
    // 100.08
    let line = createCountryMergeSphereLine(103.91, worldData, {
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      // opacity: 0.2,
      depthWrite: false,
      depthTest: false,
    })
    line.renderOrder = 99
    line.name = "chinaLine"
    // this.globe.add(line)

    return line
  }
  // 创建国家线
  createCountryLine() {
    let geoJson = this.assets.getResource("world")
    let worldData = transfromMapGeoJSON(geoJson)
    let line = createCountryMergeSphereLine(100.1, worldData, {
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })
    this.countryLine = line
    this.globe.add(line)
  }
  // 创建国家贴合标签
  createCountryNameLabel() {
    let coutryNameGroup = new Group()
    // LabelCanvasSprite
    let dataMap = [...countryFlyLineData]
    let labelSprite = new LabelCanvasSprite()
    dataMap.map((item, index) => {
      let R = 105

      let { x, y, z } = latLongToVector3(item.centroid[0], item.centroid[1] - 1, R)
      let label = labelSprite.createSpriteLabel({
        font: "bold 30px 微软雅黑",
        name: item.name,
        position: new Vector3(x, y, z),
        width: 200,
        height: 100,
        scale: 1,
        opacity: 0,
        isSprite: false,
      })
      label.material.depthTest = false
      label.renderOrder = 110
      gsap.to(label.material, { opacity: 1, delay: index / dataMap.length })
      coutryNameGroup.add(label)
    })
    this.globe.add(coutryNameGroup)
  }
  // 设置中国顶部边线
  createTopStorke() {
    // 贴图
    const texture = this.assets.getResource("flowY").clone()
    texture.wrapS = texture.wrapT = RepeatWrapping
    // texture.repeat.set(0.25, 0.25)
    // 路径
    let mapJsonData = this.assets.getResource("chinaStorke")
    mapJsonData = JSON.parse(mapJsonData)

    // 数据
    // 格式 [{geometry: {type: '', coordinates: [[[x,y]]] }}]
    let data = mapJsonData.features.map((path) => {
      return {
        geometry: path.geometry,
      }
    })
    let material = new MeshBasicMaterial({
      color: 0xffffff, //0x2bc4dc,
      map: texture,
      alphaMap: texture,
      fog: false,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
    })
    let pathLine = new PathLine(this, {
      data: data,
      texture: texture,
      renderOrder: 102,
      speed: 0.2,
      radius: 0.2,
      segments: 256 * 10,
      radialSegments: 4,
      globeRadius: 104,
      material: material,
    })
    pathLine.run = false
    // 设置父级
    return { chinaTopLine: pathLine.instance, chinaTopLineMaterial: material }
  }
  showChinaMap() {
    // 中国地图显示
    this.chinaMap.show()
    this.stars.visible = false

    setTimeout(() => {
      this.chinaMap.showLabel()
      this.chinaMap.initAnimate()
    }, 0)
  }

  // 更新
  update() {
    super.update()
    this.stats && this.stats.update()
    this.interactionManager && this.interactionManager.update()
  }
  // 销毁
  destroy() {
    super.destroy()
    this.stats && document.body.removeChild(this.stats.dom)
    this.interactionManager && this.interactionManager.dispose()
    this.chinaMap && this.chinaMap.destroy()
  }
}
