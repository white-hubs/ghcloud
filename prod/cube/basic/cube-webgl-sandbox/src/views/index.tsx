import { BuildingStructure } from "./components/building-structure/building-structure";
import "./index.less";
import { CameraPerspective } from "./components/camera-perspective/camera-perspective";
import { ObjectSearch } from "./components/object-search/object-search";
import { cubeWeb3DInstance } from "@ghcloud/cube-visual-sdk";
import { computed, defineComponent, h, onMounted, ref } from "vue";

export const Index = defineComponent({
  setup() {
    const inputFileRef = ref<HTMLInputElement | null>(null);
    const foldStatus = ref(false);
    const showUpload = ref(true);
    const functionName = ref("镜头视角");
    const functionGroup = [
      {
        name: "人物视角",
        children: [
          {
            name: "镜头视角",
            components: <CameraPerspective />,
          },
        ],
      },
      {
        name: "结构对象",
        children: [
          {
            name: "建筑结构",
            components: <BuildingStructure />,
          },
          {
            name: "对象查找",
            components: <ObjectSearch />,
          },
        ],
      },
      {
        name: "用户界面",
        children: [
          {
            name: "标签标记",
            components: <span>标签标记</span>,
          },
        ],
      },
    ];
    const functionComponent = computed(() => {
      let component: JSX.Element = <span>功能未实现</span>;
      functionGroup.forEach((item) => {
        item.children.forEach((child) => {
          if (child.name === functionName.value) {
            component = child.components;
          }
        });
      });
      return component;
    });
    const fileChange = (): void => {
      const file = inputFileRef.value?.files?.[0];
      if (file) {
        showUpload.value = false;
        cubeWeb3DInstance.loadModel(file);
      }
    };

    onMounted(() => {
      cubeWeb3DInstance.setTexturesPath("/resource/v1/cube-webgl-sandbox/textures");
      cubeWeb3DInstance.initScene(document.getElementById("renderCanvas") as HTMLCanvasElement);
    });

    return (): JSX.Element => (
      <>
        <div id="leftPane" class="d-flex flex-column" style={{ left: foldStatus.value ? "-200px" : "0px" }}>
          {/* 折叠开关 */}
          <div
            id="leftSwitch"
            class="d-flex align-items-center justify-content-center"
            onClick={() => {
              foldStatus.value = !foldStatus.value;
            }}
          >
            <i class={`bi bi-chevron-double-${foldStatus.value ? "right" : "left"}`}></i>
          </div>

          {/* 菜单栏标题 */}
          <div class="px-3 pt-1 pb-2">
            <div class="d-flex align-items-center border-bottom pb-1">
              <i class="bi bi-box-fill ms-1 me-2" style="font-size: 1.875rem; color: var(--bs-link-hover-color);"></i>
              <span class="fs-5 fw-semibold" style="color: var(--bs-link-hover-color);">
                WebGL Viewer
              </span>
            </div>
          </div>

          {/* 菜单栏容器 */}
          <div class="flex-fill overflow-y-auto">
            <nav class="px-4 pb-4">
              {functionGroup.map((item) => (
                <ul class="list-unstyled mb-2" key={item.name}>
                  <li>
                    <strong class="d-flex align-items-center fw-semibold">
                      <i class="bi bi-caret-right mx-1"></i>
                      {item.name}
                    </strong>
                    <ul class="list-unstyled fw-normal pb-2 small">
                      {item.children.map((child, index) => (
                        <li key={index}>
                          <span
                            class={`links-link ${child.name === functionName.value ? "active" : ""}`}
                            onClick={() => {
                              functionName.value = child.name;
                            }}
                          >
                            {child.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              ))}
            </nav>
          </div>
        </div>
        <div id="rightPane" class="d-flex flex-column" style={{ right: foldStatus.value ? "-350px" : "0px" }}>
          <div class="px-3 pt-1 pb-2">
            <div class="d-flex align-items-center border-bottom pb-1">
              <i class="bi bi-gear ms-1 me-2" style="font-size: 1.75rem;"></i>
              <span id="funcPaneTitle" class="fs-5 fw-semibold">
                {functionName.value}
              </span>
            </div>
          </div>

          <div class="flex-fill overflow-y-auto px-4 py-3 small">{h(functionComponent.value)}</div>
        </div>

        <div id="playerUI">
          <canvas id="renderCanvas" style="width:100vw;height:100vh"></canvas>
          {showUpload.value && (
            <>
              <button
                id="choose-file"
                class="btn btn-primary"
                onClick={() => {
                  inputFileRef.value?.click();
                }}
              >
                上传模型文件
              </button>
              <input
                id="file-input"
                type="file"
                style="display: none;"
                ref={inputFileRef}
                onChange={fileChange}
                accept=".glb,.gltf"
              ></input>
            </>
          )}
        </div>
      </>
    );
  },
});
