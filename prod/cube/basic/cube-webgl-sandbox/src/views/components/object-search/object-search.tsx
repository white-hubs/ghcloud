import { cubeWeb3DInstance } from '@ghcloud/cube-visual-sdk'
import { message } from 'ant-design-vue'
import { computed, defineComponent, ref } from 'vue'

export const ObjectSearch = defineComponent({
  name: 'ObjectSearch',
  setup () {
    const inputName = ref('')
    const inputId = ref('')

    const valueName = ref('')
    const valueId = ref('')
    const bottomInfo = computed(()=>{
      try {
        return JSON.parse(valueId.value ?? "{}")
      } catch {
        return {}
      }
    })

    return (): JSX.Element => (
      <div class="funcPane" style="display: block;">

        <h6 class=""><i class="bi bi-dot"></i>按Name查找对象</h6>
        <div class="px-3 py-3 border rounded">
          <div class="">
            <div class="input-group input-group-sm">
              <label class="input-group-text">Name</label>
              <input id="nameQueryActorInfoName" type="text" class="form-control" v-model={inputName.value} />
              <button id="nameQueryActorInfoClearBtn" type="button" class="btn btn-sm btn-light" title="清除" onClick={()=>{
                inputName.value = ''
                valueName.value = ''
              }}><i class="bi bi-x-lg"></i></button>
              <button id="nameQueryActorInfoBtn" type="button" class="btn btn-sm btn-primary" onClick={()=>{
                if (!inputName.value){
                  return
                }
                valueName.value = ''
                const result = cubeWeb3DInstance.getNodeByName(inputName.value, true)
                if (!result){
                  message.warning('未找到对象')
                  return
                }
                const value = JSON.stringify({
                  id: result?.id,
                  name: result?.name,
                  type: result?.getClassName(),
                  parentId: result?.parent?.id,
                }, null, 2)
                valueName.value = value
              }}>查找</button>
            </div>
          </div>
          <div class="mt-2">
            <textarea id="nameQueryActorInfoValue" class="form-control form-control-sm" rows="8" v-model={valueName.value}></textarea>
          </div>
        </div>
        <h6 class="mt-3"><i class="bi bi-dot"></i>按ID查找对象</h6>
        <div class="px-3 py-3 border rounded">
          <div class="">
            <div class="input-group input-group-sm">
              <label class="input-group-text">ID</label>
              <input id="idQueryActorInfoID" type="text" class="form-control" v-model={inputId.value} />
              <button id="idQueryActorInfoClearBtn" type="button" class="btn btn-sm btn-light" title="清除" onClick={()=>{
                inputId.value = ''
                valueId.value = ''
              }}><i class="bi bi-x-lg"></i></button>
              <button id="idQueryActorInfoBtn" type="button" class="btn btn-sm btn-primary" onClick={()=>{
                if (!inputId.value){
                  return
                }
                valueId.value = ''
                const result = cubeWeb3DInstance.getNodeById(inputId.value)
                if (!result){
                  message.warning('未找到对象')
                  return
                }
                const value = JSON.stringify({
                  id: result?.id,
                  name: result?.name,
                  type: result?.getClassName(),
                  parentId: result?.parent?.id,
                })
                valueId.value = value
              }}>查找</button>
            </div>
          </div>
          <div class="mt-2">
            <textarea id="idQueryActorInfoValue" class="form-control form-control-sm" rows="8" v-model={valueId.value}></textarea>
          </div>
        </div>


        <div id="bottomPane" style={{ transform: Object.keys(bottomInfo.value).length ? 'translate(-50%, 0)' : 'translate(-50%, 150%)' }}>
          <form class="row d-flex flex-nowrap align-items-center m-0 px-3 py-2">
            <div class="col-auto me-2 p-0">
              <div class="input-group input-group-sm">
                <div class="input-group-text">ID</div>
                <input id="currentActorId" type="text" class="form-control" size="20" value={bottomInfo.value?.id ?? ''} readonly />
              </div>
            </div>
            <div class="col-auto me-2 p-0">
              <div class="input-group input-group-sm">
                <div class="input-group-text">Name</div>
                <input id="currentActorName" type="text" class="form-control" size="25" value={bottomInfo.value?.name ?? ''} readonly />
              </div>
            </div>
            <div class="col-auto me-2 p-0">
              <button id="focusCurrentActorBtn" type="button" class="btn btn-sm btn-primary" title="镜头移动并对准目标" onClick={()=>{
                cubeWeb3DInstance.focusCameraOnNodeById(bottomInfo.value?.id ?? '')
              }}><i class="bi bi-geo-alt"></i> 聚焦</button>
            </div>
            <div class="col-auto me-2 p-0">
              <button id="shellCurrentActorBtn" type="button" class="btn btn-sm btn-primary" title="显示对象包围框" onClick={()=>{
                cubeWeb3DInstance.flashBoundingBoxById(bottomInfo.value?.id ?? '')
              }}><i class="bi bi-bounding-box-circles"></i>外框</button>
            </div>
            <div class="col-auto me-0 p-0">
              <button id="deselectCurrentActorBtn" type="button" class="btn btn-sm btn-secondary" title="取消目标的选中状态" onClick={()=>{
                valueId.value = ''
                inputId.value = ''
              }}><i class="bi bi-slash-square"></i> 清除</button>
            </div>
          </form>
        </div>
      </div>
    )
  }
})