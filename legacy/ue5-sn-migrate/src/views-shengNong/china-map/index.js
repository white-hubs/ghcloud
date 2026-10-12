import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { Base, OrbitControls, State, AssetsManager, Plane, getBoundingBox } from './mini3d/index'
import { Grid } from './components/grid'
import { BaseMap } from './components/map'
import { Line } from './components/line'
import { Lights } from './components/lights'
import { Particles } from './components/particles'
import { Wall } from './components/wall'
import { UpShader } from './shader/upShader/index'
import { SpreadShader } from './shader/spreadShader/index'
import { GradientShader } from './shader/gradientShader/index'
import _ from 'lodash'
import { Label2d } from './mini3d/extra/label2d'
import config from './config/index'
import { geoProjection, transfromGeoJSON, center, exportGLTF, centerSZ } from './utils'
import { random } from './utils/utils'
import { marketLocationListCN, marketLocationListSZ, assetsCN, assetsSZ } from './config/index'
import FlyLine from './components/fly-line/fly-line.ts'
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea()

export class Map3d extends Base {
  constructor(el) {
    super(el)
    this.initChina()
    // this.drillDownSZ()
    // piniaStoreArea.chinaMapDrillDown = 'shenzhen'
  }
  initChina() {
    this.poiCenter = center
    this.scene.clear() 
    this.mapdata = assetsCN
    // this.marketLocationList = marketLocationListCN
    this.marketLocationList = piniaStoreArea.marketDataCN
    this.camera.lookAt(...this.poiCenter, 0)
    this.camera.up.set(0, 0, 1)

    this.camera.position.set(80.37185413585975, -543.5700666326945, 496.4242687034793)
    this.renderer.setClearColor(0x191919, 1)
    let ambientLight = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambientLight)
    this.mainMap = {}
    this.assetsManager = new AssetsManager(this, this.mapdata, {
      onProgress: (current, total) => {
      },
      onComplete: () => {
        this.start()
      },
    })
  }
  drillDownSZ() {
    this.scene.clear()
    this.poiCenter = centerSZ
    this.mapdata = assetsSZ
    // this.marketLocationList = marketLocationListSZ
    this.marketLocationList = piniaStoreArea.marketDataSZ

    this.camera.lookAt(...this.poiCenter, 0)
    this.camera.up.set(0, 0, 1)

    this.camera.position.set(72.04140851866956,-111.04353200178,21.532270558793766)

    this.renderer.setClearColor(0x191919, 1)
    let ambientLight = new THREE.AmbientLight(0xffffff)
    this.scene.add(ambientLight)
    this.mainMap = {}
    this.assetsManager = new AssetsManager(this,this.mapdata, {
      onProgress: (current, total) => {
      },
      onComplete: () => {
        this.start()
      },
    })
  }
  start() {
    super.start()
    this.helperTools()
    this.create()
    // this.animator.add(() => {
    // })
  }
  /**
   * 开启辅助工具
   */
  helperTools() {
    // 内存监测
    // let state = new State(this)
    // state.join()
    // 轨道控制器
    let orbit = new OrbitControls(this)
    this.orbitControls.target = new THREE.Vector3(...this.poiCenter, 0)
    orbit.join()
    // 坐标轴辅助
    let axes = new THREE.AxesHelper(0)
    axes.position.set(...this.poiCenter, 0)
    this.scene.add(axes)
  }
  create() {
    // 添加雾
    this.scene.fog = new THREE.Fog(0x191919, 900, 1500)
    // this.createPlane() // 扩散
    this.createGrid()
    this.createWorldMap()
    this.createChinaMap()
    this.createLight()
    this.createRotateBorder()
    this.createLabel()
    this.createWall()
    // this.createBar()
    this.createFlyLine()
    // this.createParticles()
  }
  createGrid() {
    // 添加网格
    let grid = new Grid(this, {
      size: 1500,
      divisions: 50,
      colorCenterLine: 0x98abbf,
      colorGrid: 0x98abbf,
      pointSize: 1,
      pointColor: 0x354658,
      position: new THREE.Vector3(...this.poiCenter, 0),
    })
    grid.gridGroup.rotateX(Math.PI / 2)
    grid.join()
  }
  createWorldMap() {
    try {
      const isDrillDown = piniaStoreArea.chinaMapDrillDown === 'shenzhen'
      let china = new BaseMap(this, {
        data: this.assetsManager.loadedItems.world,
        topFaceMaterial: new THREE.MeshBasicMaterial({
          color: 0x18263b,
          transparent: true,
          opacity: 0.2,
        }),
        sideMaterial: new THREE.MeshBasicMaterial({
          color:  isDrillDown ?  0x071422 : 0x000000,
          transparent: true,
          opacity: 1,
        }),
        depth: isDrillDown ? 0.5 : 1.5,
        renderOrder: 1,
      })
      china.remove()
      china.join()
      let chinaLine = new Line(this, {
        data: this.assetsManager.loadedItems.world,
        material: new THREE.LineBasicMaterial({ color: 0x233341, depthTest: false }),
        renderOrder: 5,
      })
      chinaLine.remove()
      chinaLine.join()
      chinaLine.lineGroup.position.z += 8.31
    } catch (error) {
    }
  }

  createChinaMap() {
    try {
      const sideMaterial = new UpShader(this, {
        start: -20, // 开始点
        end: 60, // 结束点
        height: 40, // 光环高度
        maxTime: 6, // 最大时间
        speed: 8,
        color: new THREE.Color('#1A64E0'), // 颜色
        material: new THREE.MeshLambertMaterial({
          color: 0x011d4d,
          transparent: true,
          opacity: 1,
        }),
      })

      const isDrillDown = piniaStoreArea.chinaMapDrillDown === 'shenzhen'
      // 添加市地图
      let china = new BaseMap(this, {
        data: this.assetsManager.loadedItems.china,
        topFaceMaterial: new THREE.MeshPhongMaterial({
          color: 0x132e56,
          emissive: 0x072534,
          transparent: true,
          opacity: 1,
        }),
        sideMaterial: sideMaterial.getMaterial(),
        renderOrder: 6,
        depth: isDrillDown ? 4 : 12,
        isChina:true
      })
      china.mapGroup.position.z = -3.2
      this.mainMap.coordinates = china.getCoordinates()
      this.mainMap.box = getBoundingBox(china.mapGroup)
      china.remove()
      china.join()

      let chinaLine = new Line(this, {
        data: this.assetsManager.loadedItems.china,
        material: new THREE.LineBasicMaterial({
          color: isDrillDown ? 0x74A8FF : 0x5484D3, // 区域边沿线
          linewidth: 1,
          depthTest: false,
          depthWrite: false,
          transparent: true,
        }),
        renderOrder: 20,
      })
      chinaLine.remove()
      chinaLine.join()
      const postionZ = isDrillDown ? 5.01 : 21.01
      chinaLine.lineGroup.position.z += postionZ
    } catch (error) {
    }
  }
  createLight() {
    const lights = new Lights(this)
    const isDrillDown = piniaStoreArea.chinaMapDrillDown === 'shenzhen'
    isDrillDown ? lights.lights[0].position.set(220, 50, 200) : lights.lights[0].position.set(-450, 200, 200)
    lights.join()
  }
  createRotateBorder() {
    //
    let plane01 = new Plane(this, {
      width: 760,
      needRotate: true,
      rotateSpeed: 0.001,
      material: new THREE.MeshBasicMaterial({
        map: this.assetsManager.loadedItems.rotationBorder1,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      position: new THREE.Vector3(...this.poiCenter, 8.33),
    })
    plane01.mesh.renderOrder = 6
    plane01.join()
    //
    let plane02 = new Plane(this, {
      width: 720,
      needRotate: true,
      rotateSpeed: 0.002,
      material: new THREE.MeshBasicMaterial({
        map: this.assetsManager.loadedItems.rotationBorder2,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
      position: new THREE.Vector3(...this.poiCenter, 8.34),
    })
    plane02.mesh.renderOrder = 6
    plane02.join()
  }
  // 创建市场标签
  createLabel() {
    this.label2d = new Label2d(this)
    this.mainMap.coordinates = this.mainMap.coordinates.map(item => {
      return {
        ...item,
        value: random(10, 100),
      }
    })
    this.marketLocationList.forEach(item => {
      const [x, y] = geoProjection(item.location)
      const imgSrc = window.location.pathname + item.icon
      const className = item.name === '深圳总部' ? 'market-icon main-markert' : 'market-icon'
      const isDrillDown = piniaStoreArea.chinaMapDrillDown === 'shenzhen'
      const postionZ = isDrillDown ? 5.6 : 20.6
      this.createLabelItem(item.name, new THREE.Vector3(x, -y, postionZ), className, imgSrc)
    })
    // this.mainMap.coordinates.forEach(item => {
    //   if (!item.centroid || !item.center) {
    //     return false
    //   }
    //   let [x, y] = geoProjection(item.centroid || item.center)
    //   this.createLabelItem(item.name, new THREE.Vector3(x, -y, 20.6))
    // })
  }
  createLabelItem(name, position, className = 'mapLabel', imgSrc = '') {
    const label = this.label2d.create(name, className)
    const innerHTML = imgSrc ? `<span>${name}</span><img src=${imgSrc} />` : name
    label.show(innerHTML, position)
    this.scene.add(label)
  }

  // 创建透明围墙
  createWall() {
    let data = transfromGeoJSON(this.assetsManager.loadedItems.world)
    let wallData = data.features.filter(item => {
      return item.properties.name === config.wallName || item.properties.nameZh === config.wallName
    })

    wallData[0].geometry.coordinates.map(coords => {
      let coordinates = []
      coords[0].map(cood => {
        let [x, y] = geoProjection(cood)
        coordinates.push(x, -y)
      })
      let wall = new Wall(this, {
        coordinates: coordinates,
        height: 30, //高度
        renderOrder: 10,
        material: new THREE.MeshBasicMaterial({
          color: 0x158ef4,
          side: THREE.DoubleSide,
          transparent: true,
          depthTest: false,
          opacity: 0.4,
        }),
      })
      wall.mesh.position.z += 20.81
      wall.join()
    })
  }
  // 创建波纹shader
  createPlane() {
    //

    let shaderMaterial = new SpreadShader(this, {
      radius: 0.0,
      center: new THREE.Vector3(...this.poiCenter, 0),
      width: 40.0,
      maxTime: 4.0,
      speed: 500.0,
      color: new THREE.Color('rgba(75, 138, 244, 0.8)'),
      material: new THREE.MeshLambertMaterial({
        color: 0x011d4d,
        transparent: true,
        depthWrite: false,
      }),
    })
    let [x0, y0] = this.poiCenter
    let geoArr = []
    let cityBox = {
      min: { x: -354.9753112792969, y: -336.0975341796875, z: 3.9000000953674316 },
      max: { x: 290.02838134765625, y: 295.0726013183594, z: 8.100000381469727 },
    }
    for (let i = 0; i < 50000; i++) {
      let x = random(x0 - 5000, x0 + 5000)
      let y = random(y0 - 5000, y0 + 5000)
      let z = random(1, 5) / 10
      if (x > cityBox.min.x && x < cityBox.max.x && y > cityBox.min.y && y < cityBox.max.y) {
        continue
      }

      let w = random(100, 200) / 10
      let cubeGeo = new THREE.BoxBufferGeometry(w, w, w)
      cubeGeo.rotateX(THREE.MathUtils.degToRad(random(0, 360)))
      cubeGeo.rotateY(THREE.MathUtils.degToRad(random(0, 360)))
      cubeGeo.rotateZ(THREE.MathUtils.degToRad(random(0, 360)))
      cubeGeo.translate(x, y, z + w)
      geoArr.push(cubeGeo)
    }
    var allGeometry = mergeBufferGeometries(geoArr)
    // var cubeMesh = new THREE.Mesh(allGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff })) //网格模型对象
    var cubeMesh = new THREE.Mesh(allGeometry, shaderMaterial.getMaterial()) //网格模型对象
    cubeMesh.position.set(...this.poiCenter, 0)
    this.scene.add(cubeMesh)
    const geo = new THREE.PlaneBufferGeometry(5000, 5000)
    const mesh = new THREE.Mesh(geo, shaderMaterial.getMaterial())
    mesh.renderOrder = -5
    this.scene.add(mesh)
  }
  // 创建柱状图
  createBar() {
    const barGroup = new THREE.Group()
    // 最大高度
    const height = 80.0
    // 渐变材质
    const material = new GradientShader(this, {
      height: height,
      color1: new THREE.Color('#ffffff'),
      color2: new THREE.Color('#00ffff'),
      material: new THREE.MeshBasicMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        opacity: 1,
      }),
    }).getMaterial()

    // 获取z轴的位置
    let { z } = this.mainMap.box.box3.max
    // value最大值
    let cityArea = _.orderBy(this.mainMap.coordinates, ['value'], ['desc'])
    let max = _.maxBy(this.mainMap.coordinates, function (o) {
      return o.value
    }).value
    // 循环创建bar
    cityArea.map((item, index) => {
      if (!item.centroid || !item.center) {
        return false
      }
      // 网格
      let geoHeight = height * (item.value / max)

      const geo = new THREE.BoxBufferGeometry(4, 4, geoHeight)
      // 上移
      geo.translate(0, 0, geoHeight / 2)
      const mesh = new THREE.Mesh(geo, material)
      let areaBar = mesh
      let [x, y] = geoProjection(item.centroid || item.center)
      areaBar.position.set(x, -y, z)
      barGroup.add(areaBar)
      if (index < 3) {
        this.createLabelItem(
          `<span class="sort">${index + 1}</span> ${item.name} ${item.value}`,
          new THREE.Vector3(x, -y, z + geoHeight + 6),
          'barLabel',
        )
      } else {
        this.createLabelItem(`${item.value}`, new THREE.Vector3(x, -y, z + geoHeight + 6), 'barLabel')
      }
    })
    this.scene.add(barGroup)
  }
  createParticles() {
    const particles = new Particles(this, {
      num: 300, // 粒子数量
      range: 1000, // 范围
      material: new THREE.PointsMaterial({
        map: Particles.createTexture(),
        size: 20,
        color: 0x00eeee,
        transparent: true,
        opacity: 1.0,
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    })
    particles.instance.position.set(0, 0, 500)
    particles.join()
  }

  // 飞线
  createFlyLine() {
    const end = this.marketLocationList.find(item=>item.name==='深圳总部').location
    const data= this.marketLocationList.map(item=>{      
      return { begin: item.location, end: end, height: 30 }
    })
    new FlyLine(this.scene, data);
  }
  // 导出模型
  exportModel() {
    exportGLTF(this.scene)
  }
}
