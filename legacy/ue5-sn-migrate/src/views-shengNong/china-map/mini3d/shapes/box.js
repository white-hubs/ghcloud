import { Mesh, MeshBasicMaterial, BoxBufferGeometry, Vector3 } from 'three'
import { Component } from '../components'

class Box extends Component {
  constructor(base, config = {}) {
    super(base)
    const {
      width = 1,
      height = 1,
      depth = 1,
      position = new Vector3(0, 0, 0),
      material = new MeshBasicMaterial({ color: 0xffffff }),
    } = config
    const geometry = new BoxBufferGeometry(width, height, depth)
    const mesh = new Mesh(geometry, material)
    mesh.position.copy(position)
    this.mesh = mesh
  }
  join() {
    this.base.interactionManager.add(this.mesh)
    this.base.scene.add(this.mesh)
    this.mesh.addEventListener('click', () => {
    })
    this.mesh.addEventListener('mousedown', event => {
      event.target.material.color.set(0xff0000)
    })
    this.mesh.addEventListener('mouseup', event => {
      if (event.intersected) {
        event.target.material.color.set(0xffffff)
      }
    })
    this.base.animator.add(() => this.update())
  }
  update() {
    this.mesh.rotation.x += 0.01
  }
}

export { Box }
