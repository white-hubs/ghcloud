import * as THREE from 'three'
import { Component } from '../mini3d/index'
export class Lights extends Component {
  constructor(base) {
    super(base)
    const lights = []
    lights[0] = new THREE.PointLight(0xffffff, 10, 500)
    lights[0].name = 'pointLight'
    // lights[1] = new THREE.PointLight(0xffffff, 2, 0)
    // lights[2] = new THREE.PointLight(0xffffff, 2, 0)

    lights[0].position.set(-450, 200, 200)

    // lights[1].position.set(10, 20, 10)
    // lights[2].position.set(10, -20, 10)

    this.lights = lights
  }
  join() {
    const sphereSize = 1
    this.lights.forEach(light => {
      const pointLightHelper = new THREE.PointLightHelper(light, sphereSize)
      this.base.scene.add(pointLightHelper)
    })
    this.base.scene.add(...this.lights)
  }
}
