import { cubeWeb3DInstance } from '@ghcloud/cube-visual-sdk'
import { defineComponent, ref } from 'vue'
import type { ArcRotateCamera } from '@ghcloud/cube-visual-sdk'
import { Space } from '@ghcloud/cube-ui'

export const CameraPerspective = defineComponent({
  name: 'CameraPerspective',
  setup () {
    const cameraViewValue = ref('')
    const getCameraView = (): void => {
      const camera = cubeWeb3DInstance._scene.activeCamera as ArcRotateCamera
      cameraViewValue.value = JSON.stringify({
        target: {
          x: camera.target.x,
          y: camera.target.y,
          z: camera.target.z,
        },
        alpha: camera.alpha,
        beta: camera.beta,
        radius: camera.radius,
      })
    }

    return (): JSX.Element => (
      <div class="funcPane" style="display: block;">
        <h6 class="mt-3"><i class="bi bi-dot"></i>镜头视角</h6>
        <div class="px-3 py-3 border rounded">
          <Space>
            <button id="getCameraViewBtn" type="button" class="btn btn-sm btn-primary" onClick={getCameraView}>获取视角</button>
            <button id="clearCameraViewBtn" type="button" class="btn btn-sm btn-light" onClick={()=>{
              cameraViewValue.value = ''
            }}>清除</button>
          </Space>
          <div class="mt-2">
            <textarea id="cameraViewValue" v-model={cameraViewValue.value} class="form-control form-control-sm" rows="8"></textarea>
          </div>
          <div class="mt-2">
            <Space>
              <button id="changeCameraViewBtn" type="button" class="btn btn-sm btn-success" onClick={()=>{
                cameraViewValue.value && cubeWeb3DInstance.flyTo(JSON.parse(cameraViewValue.value))
              }}>改变视角</button>
              <button id="resetCameraViewBtn" type="button" class="btn btn-sm btn-secondary" onClick={()=>{
                cameraViewValue.value = JSON.stringify(cubeWeb3DInstance._defaultViewAngleParameter)
                cameraViewValue.value && cubeWeb3DInstance.flyTo(JSON.parse(cameraViewValue.value))
              }}>初始视角</button>
            </Space>
          </div>
        </div>
        <h6 class="mt-3"><i class="bi bi-dot"></i>镜头升降</h6>
        <div class="px-3 py-3 border rounded">
          <Space>
            <button id="floorUpBtn" type="button" class="btn btn-sm btn-success" onClick={()=>{
              cubeWeb3DInstance._scene.activeCamera && ((cubeWeb3DInstance._scene.activeCamera as ArcRotateCamera).target.y += 5)
              getCameraView()
            }}>上升</button>
            <button id="floorDownBtn" type="button" class="btn btn-sm btn-light" onClick={()=>{
              cubeWeb3DInstance._scene.activeCamera && ((cubeWeb3DInstance._scene.activeCamera as ArcRotateCamera).target.y -= 5)
              getCameraView()
            }}>下降</button>
          </Space>
        </div>
      </div>
    )
  }
})