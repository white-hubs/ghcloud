import * as THREE from 'three'
import { Component } from '../mini3d/index'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
/**
 * 网格地面
 */
export class Grid extends Component {
  /**
   *
   * @param {*} base this
   * @param {*} config
   *  size: 尺寸,
   *  divisions: 细分数,
   *  colorCenterLine: 中心线颜色,
   *  colorGrid: 网格线颜色,
   *  pointSize: 点大小,
   *  pointColor: 点颜色,
   */
  constructor(base, config = {}) {
    super(base)
    this.config = Object.assign(
      {
        size: 100,
        divisions: 80,
        colorCenterLine: 0x98abbf,
        colorGrid: 0x98abbf,
        pointSize: 0.05,
        pointColor: 0x354658,
        position: new THREE.Vector3(0, 0, 0),
      },
      config,
    )
    this.gridGroup = new THREE.Group()
    this.gridHelper = this.createGrid()
    this.createGridPoint()
  }
  createGrid() {
    const gridHelper = new THREE.GridHelper(
      this.config.size,
      this.config.divisions,
      this.config.colorCenterLine,
      this.config.colorGrid,
    )
    gridHelper.position.copy(this.config.position)
    gridHelper.material.opacity = 0.1
    gridHelper.material.transparent = true
    return gridHelper
  }
  /**
   * 创建网格点
   */
  createGridPoint() {
    let { size, divisions, pointSize, pointColor } = this.config

    let material = new THREE.MeshBasicMaterial({
      color: pointColor,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    // 间距
    let space = size / divisions
    // 偏移
    let offset = size / 2
    let geoArr = []
    for (let i = 0; i < divisions + 1; i++) {
      for (let j = 0; j < divisions + 1; j++) {
        let geometry = new THREE.CircleBufferGeometry(pointSize, 20, 20)
        geometry.rotateX(Math.PI / 2)
        geometry.translate(space * i - offset, 0, space * j - offset)
        geoArr.push(geometry)
      }
    }
    var allGeometry = mergeBufferGeometries(geoArr)
    var mesh = new THREE.Mesh(allGeometry, material)
    mesh.renderOrder = 4
    this.gridGroup.add(mesh)
  }
  join() {
    this.gridGroup.add(this.gridHelper)
    this.base.scene.add(this.gridGroup)
  }
}
