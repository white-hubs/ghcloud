import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { geoMercator } from 'd3-geo'
import config from '../config/index'
import { shenzhen } from '../config/index'
export const geoProjection = geoMercator().center(config.center).scale(600).translate([0, 0])
export const center = geoProjection(config.center)
export const centerSZ = geoProjection(shenzhen.center)
export const transfromGeoJSON = data => {
  let worldData = JSON.parse(data)
  let features = worldData.features
  for (let i = 0; i < features.length; i++) {
    const element = features[i]
    if (element.geometry.type === 'Polygon') {
      element.geometry.coordinates = [element.geometry.coordinates]
    }
  }
  return worldData
}

// 导出gltf
export function exportGLTF(input) {
  var gltfExporter = new GLTFExporter()
  var options = {
    trs: false,
    onlyVisible: true,
    truncateDrawRange: true,
    binary: false, //是否导出.gltf的二进制格式.glb  控制导出.gltf还是.glb
    forceIndices: false,
    forcePowerOfTwoTextures: false,
  }
  gltfExporter.parse(
    input,
    function (result) {
      if (result instanceof ArrayBuffer) {
        save(new Blob([result], { type: 'application/octet-stream' }), 'scene.glb')
      } else {
        var output = JSON.stringify(result, null, 2)
        save(new Blob([output], { type: 'text/plain' }), 'scene.gltf')
      }
    },
    options,
  )
}

// 下载
export function save(blob, filename) {
  var link = document.createElement('a')
  link.style.display = 'none'
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
