import { CustomRadio } from "../basic/custom-radio/custom-radio";
import styles from "./header.module.less";
import { projectUpdate } from "@/apis";
import { useChartEditStore } from "@/store/modules/chart-edit-store/chart-edit-store";
import { ComponentCategoryEnum, type CreateComponentType } from "@/store/modules/chart-edit-store/chart-edit-store.d";
import { useChartHistoryStore } from "@/store/modules/chart-history-store/chart-history-store";
import { HistoryStackEnum } from "@/store/modules/chart-history-store/chart-history-store.d";
import { createUuid } from "@/utils";
import { setSessionStorage, StorageEmun, getSessionStorage, clearSessioStorage } from "@/utils/storage";
import {
  Button,
  ExitOutline,
  EnterOutline,
  Icon,
  Select,
  ArrowUndoOutline,
  Trash,
  ArrowRedoOutline,
  EyeOutline,
  SaveOutline,
  useDialog,
  Add,
  useMessage,
  Modal,
  Form,
  FormItem,
  Input,
  Settings,
} from "@ghcloud/visual-view-ui";
import { defineComponent, ref, reactive, computed, type Ref, type VNode } from "vue";
interface ItemType<T> {
  key: T;
  select: Ref<boolean> | boolean;
  title: string;
  icon: any;
}
export const LayoutHeader = defineComponent({
  setup() {
    const chartEditStore = useChartEditStore();
    const chartHistoryStore = useChartHistoryStore();
    const dialogForm = ref();
    const pageModalState = reactive({
      title: "",
      initView: "empty",
    });
    const message = useMessage();
    const dialog = useDialog();
    const visible = ref(false);
    const isEdit = ref(false);
    const formRules = {
      title: [
        {
          required: true,
          message: "请输入页面标题",
          trigger: ["input", "blur"],
        },
      ],
    };
    const isBackStack = computed(() => chartHistoryStore.getBackStack.length > 0);
    // 预览
    const handlePreview = (): void => {
      clearSessioStorage(StorageEmun.CHART_CONFIG);
      setSessionStorage(StorageEmun.CHART_CONFIG, chartEditStore.$state);
      handleSave();
      window.open(`${location.origin}/apps/visual-low-code/render?type=preview`, "_blank");
    };
    const isForwardStack = computed(() => chartHistoryStore.getForwardStack.length > 0);
    // 前进后退按钮
    const historyList = reactive<ItemType<HistoryStackEnum>[]>([
      {
        key: HistoryStackEnum.BACK_STACK,
        // 一定会有初始化画布
        select: isBackStack,
        title: "后退",
        icon: <ArrowUndoOutline />,
      },
      {
        key: HistoryStackEnum.FORWARD_STACK,
        select: isForwardStack,
        title: "前进",
        icon: <ArrowRedoOutline />,
      },
    ]);
    // 历史记录处理
    const clickHistoryHandle = (item: ItemType<HistoryStackEnum>): any => {
      switch (item.key) {
        case HistoryStackEnum.BACK_STACK:
          chartEditStore.setBack();
          break;
        case HistoryStackEnum.FORWARD_STACK:
          chartEditStore.setForward();
          break;
      }
    };
    const selectSlots = {
      action: () => (
        <>
          <div style={{ cursor: "pointer", textAlign: "center" }} class={styles.addPage} onClick={addPage}>
            <Button dashed size="small">
              <Icon>
                <Add />
              </Icon>
              新增页面
            </Button>
          </div>
        </>
      ),
    };
    const handleSave = async (): Promise<void> => {
      // 判断名称是否重复
      const titles = chartEditStore.pages.map((page) => page.title);
      if (new Set(titles).size !== chartEditStore.pages.length) {
        message.warning("页面名称重复");
        return;
      }
      const canvasJson = JSON.stringify({ pages: chartEditStore.getPages });
      const projectId = getSessionStorage(StorageEmun.PROJECTID) as string;
      const modelIds = chartEditStore.getPages
        .map((item) => (item.model ? item.model.id : ""))
        .filter((item) => item !== "")
        .join(",");
      await projectUpdate({ canvasJson, projectId, modelIds });
      message.success("保存成功");
    };
    // Ctrl+s保存
    document.addEventListener("keydown", function setup(event) {
      if (event.ctrlKey && event.code === "KeyS") {
        event.preventDefault();
      }
    });
    document.addEventListener("keydown", function setup(event) {
      if (window.$KeyboardActive?.ctrl && event.key.toLowerCase() === "s") {
        event.preventDefault();
        handleSave();
        window.$KeyboardActive.ctrl = false;
      }
    });
    // 新增页面
    const addPage = (): void => {
      isEdit.value = false;
      visible.value = true;
      pageModalState.title = "";
    };
    const handleSettingPage = (): void => {
      if (!chartEditStore.getCurrentPage) {
        return;
      }
      pageModalState.title = chartEditStore.getCurrentPage.title;
      if (!chartEditStore.getCurrentPage.initView) {
        return;
      }
      pageModalState.initView = chartEditStore.getCurrentPage.initView;
      isEdit.value = true;
      visible.value = true;
    };
    const updateValue = (value: string): void => {
      // 切换页面
      if (value !== chartEditStore.getCurrentPage?.id) {
        chartHistoryStore.clearForwardStack();
        chartHistoryStore.clearBackStack();
      }
      const findPage = chartEditStore.pages.find((page) => page.id === value);
      if (!findPage) {
        return;
      }
      chartEditStore.setActivePage(findPage.id);
      handleSave();
    };
    // 组合组件
    const handleMergeComps = (): void => {
      const xList: number[] = [];
      const yList: number[] = [];
      chartEditStore.getSelectedComps.forEach((comp) => {
        xList.push(comp.styles.x ?? 0);
        yList.push(comp.styles.y ?? 0);
        xList.push(comp.styles.x + (comp.styles.width || 0));
        yList.push(comp.styles.y + comp.styles.height);
      });
      const mixX = Math.min(...xList);
      const mixY = Math.min(...yList);
      const maxX = Math.max(...xList);
      const maxY = Math.max(...yList);
      let width = 0;
      let height = 0;
      // 获取子项最大的宽高
      chartEditStore.getSelectedComps.forEach((comp) => {
        if (comp.styles.x === maxX) {
          width = comp.styles.width;
        }
        if (comp.styles.y === maxY) {
          height = comp.styles.height;
        }
      });
      // 框选的超过1个
      if (chartEditStore.active.targetId.length > 1) {
        // 设置组合组件
        const component = {
          id: createUuid(),
          category: ComponentCategoryEnum.COMBINATION,
          categoryName: "组合组件",
          key: "combination",
          title: "组合组件",
          components: chartEditStore.getSelectedComps ?? [],
          attr: {
            isShareData: false,
          },
          styles: {
            x: mixX,
            y: mixY,
            width: maxX + width - mixX,
            height: maxY + height - mixY,
            show: true,
            zIndex: 100,
          },
        };
        // 获取所有选中的子项组件
        const itemComponentList: CreateComponentType[] = [];
        // 递归判断是组合组件还是普通组件
        const getItemComponentList = (list: CreateComponentType[]): void => {
          const filterItem = (list: CreateComponentType[]): void => {
            for (const item of list) {
              // 普通组件,且不为普通组件的子项时直接渲染
              if (item.category !== ComponentCategoryEnum.COMBINATION && item.key !== "menu-item") {
                itemComponentList.push(item);
              }
              if (item.components) {
                filterItem(item.components);
              }
            }
          };
          filterItem(list);
        };
        if (chartEditStore.getSelectedComps) {
          getItemComponentList(chartEditStore.getSelectedComps);
        }
        // 设置组合后子项的位置
        const setPosition = (list: CreateComponentType[], combine: CreateComponentType): void => {
          list.forEach((comp) => {
            // 普通组件,组件新位置=自身位置 - 组合组件的位置
            if (comp.category !== ComponentCategoryEnum.COMBINATION) {
              comp.styles.x = comp?.styles?.x - combine.styles.x;
              comp.styles.y = comp?.styles?.y - combine.styles.y;
            } else {
              // 组合组件,组件新位置=组合组件位置-最外层组合组件的位置- 自身位置
              if (comp.components) {
                const filterItem = (combine: CreateComponentType): void => {
                  if (combine.components) {
                    combine.components.forEach((item) => {
                      if (item.category !== ComponentCategoryEnum.COMBINATION) {
                        item.styles.x = comp.styles.x - component.styles.x + item.styles.x;
                        item.styles.y = comp.styles.y - component.styles.y + item.styles.y;
                      } else {
                        if (item.components) {
                          filterItem(item);
                        }
                      }
                    });
                  }
                };
                filterItem(comp);
              }
            }
          });
        };
        setPosition(chartEditStore.getSelectedComps, component);
        const targetId = chartEditStore.active.targetId;
        chartEditStore.addComponentList(component);
        // 设置属性为isCombined=true
        component.components.forEach((comp) => {
          comp.styles.isCombined = true;
        });
        chartEditStore.removeComponentList(targetId);
      }
    };
    // 取消组合
    const isCancel = computed(
      () => chartEditStore.getCurrentBlock?.category === ComponentCategoryEnum.COMBINATION && chartEditStore.active.targetId.length === 1,
    );
    const cancelMergeComps = (): void => {
      const targetId = chartEditStore.active.targetId;
      if (isCancel.value) {
        // 组合组件的位置
        const componentLocation = { x: chartEditStore.getCurrentBlock?.styles.x ?? 0, y: chartEditStore.getCurrentBlock?.styles.y ?? 0 };
        // 添加組件
        chartEditStore.getCurrentBlock?.components?.forEach((comp) => {
          // 普通组件,组件新位置=自身位置 + 组合组件的位置
          if (comp.category !== ComponentCategoryEnum.COMBINATION) {
            comp.styles.x = comp.styles.x + componentLocation.x;
            comp.styles.y = comp.styles.y + componentLocation.y;
          } else {
            // 组合组件,组件新位置=自身位置-上级组合组件位置+最外层组合组件位置
            if (comp.components) {
              let fax = componentLocation.x;
              let fay = componentLocation.y;
              const filterItem = (combine: CreateComponentType, fatherX: number, fatherY: number): void => {
                if (combine.components) {
                  combine.components.forEach((item) => {
                    if (item.category !== ComponentCategoryEnum.COMBINATION) {
                      item.styles.x = item.styles.x - combine.styles.x + fatherX;
                      item.styles.y = item.styles.y - combine.styles.y + fatherY;
                    } else {
                      fax += item.styles.x - combine.styles.x;
                      fay += item.styles.y - combine.styles.y;
                      if (item.components) {
                        filterItem(item, fax, fay);
                      }
                    }
                  });
                }
              };
              filterItem(comp, fax, fay);
            }
          }
          // 设置属性为isCombined=false
          comp.styles.isCombined = false;
          chartEditStore.addComponentList(comp);
        });
        // 移除组合组件
        chartEditStore.removeComponentList(targetId);
      }
    };
    // 新增页面及保存页面
    const handleSavePage = async (): Promise<boolean> => {
      if (!dialogForm.value) {
        return false;
      }
      await dialogForm.value.validate();
      const titles = chartEditStore.pages.map((page) => page.title);
      if (titles.includes(pageModalState.title)) {
        message.error("页面名称重复");
        return false;
      }
      if (isEdit.value) {
        const page = chartEditStore.getPages.find((item) => item.id === chartEditStore.active.pageId);
        if (!page) {
          return false;
        }
        page.title = pageModalState.title;
        return true;
      }
      chartEditStore.addPages(pageModalState);
      pageModalState.title = "";
      pageModalState.initView = "empty";
      chartHistoryStore.clearForwardStack();
      chartHistoryStore.clearBackStack();
      handleSave();
      return true;
    };
    const handleClose = (): void => {
      pageModalState.title = "";
      pageModalState.initView = "empty";
    };

    const handleDeletePage = (page: CreateComponentType): void => {
      if (chartEditStore.getPages.length === 1) {
        message.error("当前仅有一个页面无法删除");
        return;
      }
      dialog.warning({
        title: "提示",
        content: `你是否确定删除页面【${page.title}】？`,
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: () => {
          const index = chartEditStore.getPages.findIndex((item) => item.id !== page.id);
          chartEditStore.setActivePage(chartEditStore.getPages[index].id);
          chartEditStore.setPages(chartEditStore.getPages.filter((item) => item.id !== page.id));
          message.success("删除成功");
        },
      });
    };
    const selectRenderOption = ({ node, option }: { node: VNode; option: CreateComponentType }): VNode => (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}> {node}</div>
        <div
          class="delete_icon"
          onClick={() => {
            handleDeletePage(option);
          }}
        >
          <Icon>
            <Trash />
          </Icon>
        </div>
      </div>
    );
    return () => (
      <>
        <div class={styles.wrapper}>
          <div class={styles.projectName}>
            <span style={{ paddingLeft: "20px" }}>{chartEditStore.getProjectName}</span>
          </div>
          <div class={styles.pageName}>
            <div class={styles.pageSelect}>
              {chartEditStore.getCurrentPage ? (
                <Select
                  show-checkmark={false}
                  v-model:value={chartEditStore.getCurrentPage.id}
                  label-field="title"
                  value-field="id"
                  options={chartEditStore.getPages}
                  renderOption={selectRenderOption}
                  v-slots={selectSlots}
                  onUpdateValue={updateValue}
                />
              ) : null}
            </div>
          </div>
          <div class={styles.operateBtn}>
            <Button disabled={chartEditStore.active.targetId.length <= 1} ghost onClick={handleMergeComps}>
              <Icon>
                <EnterOutline />
              </Icon>
              组合
            </Button>
            <Button disabled={!isCancel.value} ghost onClick={cancelMergeComps}>
              <Icon>
                <ExitOutline />
              </Icon>
              取消组合
            </Button>
            <Button ghost onClick={handleSettingPage}>
              <Icon>
                <Settings />
              </Icon>
              页面设置
            </Button>
            {historyList.map((item, index) => (
              <span key={index}>
                <Button
                  ghost
                  disabled={!item.select}
                  onClick={() => {
                    clickHistoryHandle(item);
                  }}
                >
                  <Icon> {item.icon} </Icon>
                  {item.title}
                </Button>
              </span>
            ))}
            <Button ghost onClick={handlePreview}>
              <Icon>
                <EyeOutline />
              </Icon>
              预览
            </Button>
            <Button ghost onClick={handleSave}>
              <Icon>
                <SaveOutline />
              </Icon>
              保存
            </Button>
          </div>
        </div>
        <Modal
          v-model:show={visible.value}
          positiveText="确认"
          preset="dialog"
          negativeText="取消"
          title={isEdit.value ? "设置页面" : "新建页面"}
          onClose={handleClose}
          onNegativeClick={handleClose}
          showIcon={false}
          onPositiveClick={handleSavePage}
        >
          <div class={styles.modal_content}>
            <Form rules={formRules} model={pageModalState} ref={dialogForm}>
              <FormItem label="页面名称" path="title" label-placement="left">
                <Input maxlength={20} v-model:value={pageModalState.title} placeholder="输入标题" />
              </FormItem>
              <FormItem label="初始化组件" path="initView" label-placement="left">
                <CustomRadio v-model:value={pageModalState.initView} disabled={isEdit.value} />
              </FormItem>
            </Form>
          </div>
        </Modal>
      </>
    );
  },
});
