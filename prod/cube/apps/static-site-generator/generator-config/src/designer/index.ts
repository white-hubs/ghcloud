export type {
  ComponentInstance,
  ComponentRegistryItem,
  ComponentSchema,
  DesignerMode,
  DesignerState,
  EditorType,
  LayoutConfig,
  PageContentConfig,
  PropEditorConfig,
  PropSchema,
} from "./types";

export {
  getAllComponents,
  getComponentByName,
  getComponentsByMode,
  getLayoutComponents,
  getSlotComponent,
  hasComponent,
  isLayoutComponent,
  LAYOUT_COMPONENT_NAMES,
} from "./component-registry";

export {
  cloneComponentInstance,
  createComponentInstance,
  formatArrayForEdit,
  getDefaultProps,
  getPropDefaultValue,
  getPropEditorConfig,
  inferEditorType,
  tryParseJson,
  validateInstanceProps,
} from "./schema-utils";

export { PageDesigner } from "./page-designer";
export { ComponentPanel } from "./component-panel";
export { CanvasPanel } from "./canvas-panel";
export { ConfigPanel } from "./config-panel";
export { DynamicForm } from "./dynamic-form";
export { JsonEditorPanel } from "./json-editor-panel";
export { COMPONENT_MAP, getVueComponent } from "./component-map";
