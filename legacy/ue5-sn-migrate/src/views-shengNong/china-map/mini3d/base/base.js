import TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'
import { InteractionManager } from '../libs/three.interactive'
import emitter from '../libs/emitter'
import { Animator, Resizer } from '../components'
import bus from "@/utils/bus"
import { marketLocationListCN, marketLocationListSZ, } from '../../config'
import { storeArea } from "@/piniaStore/area"
const piniaStoreArea = storeArea()
class Base {
  constructor(el = '#canvas') {
    // 容器
    this.container = document.querySelector(el)
    this.width = this.container.offsetWidth || window.innerWidth
    this.height = this.container.offsetHeight || window.innerHeight
    // 场景
    this.scene = new THREE.Scene()
    this.camera = this.createCamera()
    this.renderer = this.createRenderer()
    this.animator = new Animator(this)
    this.resizer = new Resizer(this)
    this.emitter = emitter
    this.interactionManager = new InteractionManager(this.renderer, this.camera, this.renderer.domElement)
    this.animator.add(() => this.interactionManager.update())
    this.setRaycaster()
    this.animate()
    this.addEventListener()
  }
  createCamera() {
    let { width, height } = this
    let rate = width / height
    // 设置45°的透视相机,更符合人眼观察
    let camera = new THREE.PerspectiveCamera(45, rate, 0.1, 1500)
    // camera.up.set(0, 0, 1)
    camera.position.set(100, 100, 100)
    camera.lookAt(0, 0, 0)
    return camera
  }
  createRenderer() {
    let { width, height } = this
    let renderer = new THREE.WebGLRenderer({
      antialias: true, // 锯齿
    })
    // 设置canvas的分辨率
    renderer.setPixelRatio(window.devicePixelRatio)
    // 设置canvas 的尺寸大小
    renderer.setSize(width, height)
    // 设置背景色
    renderer.setClearColor(0x000000, 1)
    // 插入到dom中
    this.container.appendChild(renderer.domElement)

    return renderer
  }
  addEventListener() {
    this.resizer.addListenerResize()
  }
  removeEventListener() {
    this.resizer.removeListenerResize()
  }
  start() {
    this.animator.add(() => TWEEN.update())
    this.animator.update()
  }
  stop() {
    TWEEN.removeAll()
    this.animator.stop()
    this.interactionManager.dispose()
  }

  setRaycaster() {
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()
    const onMouseMove = event => {
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
      this.onMouseMoveEvent = event
    }
    window.addEventListener('mousemove', onMouseMove, false)

    //初始化后 鼠标默认坐标是中间 会导致一进来鼠标被视为悬浮在重庆版块里面，所有给他重置掉
    this.mouse.x = 10000000
    
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    // // 通过摄像机和鼠标位置更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera)
    // // 算出射线 与当场景相交的对象有那些
    const intersects = this.raycaster.intersectObjects(this.scene.children, true)

    const isDrillDown = piniaStoreArea.chinaMapDrillDown === 'shenzhen'
    
    const nowHover = intersects.find(item => item.object.material && item.object.material.length === 2)
    if (nowHover?.object?.name) {
      if (!this.lastPick || this.lastPick.object.name !== nowHover.object.name) {
        // 恢复上一次清空的
        if (this.lastPick) {
          this.lastPick.object.material[0].color.set(0x132e56)
          this.lastPick.object.scale.set(1, 1, 1)
        }

        this.lastPick = nowHover
        this.lastPick.object.material[0].color.set('#0f50bc')
        isDrillDown ? this.lastPick.object.scale.set(1, 1, 1) : this.lastPick.object.scale.set(1, 1, 2)

        // const marketList = isDrillDown ? marketLocationListSZ : marketLocationListCN
        const marketList = isDrillDown ? piniaStoreArea.marketDataSZ : piniaStoreArea.marketDataCN
        const areaLabel = marketList.filter(e=>e.province===nowHover?.object?.name)
        bus.emit("chinaMapAreaMouseOver", {
          name: areaLabel.length ? areaLabel[0].name : this.lastPick.object.name,
          event:this.onMouseMoveEvent,
          label: areaLabel
        })
      }
    } else {
      // 恢复上一次清空的
      if (this.lastPick) {
        this.lastPick.object.material[0].color.set(0x132e56)
        this.lastPick.object.scale.set(1, 1, 1)
        this.lastPick = null
        bus.emit("chinaMapAreaMouseLeave")
      }
    }

    window.addEventListener('click', (event)=>{
      if(this.lastPick?.object?.name === '广东省'){
        bus.emit("chinaMapDrillDown")
      }
    }, false)

    this.renderer.render(this.scene, this.camera)
  }
}

export { Base }
