// components类型
export interface CreateComponentType {
  level?: number | string;
  parentId?: number | string;
  id: string;
  category: ComponentCategoryEnum;
  categoryName: string;
  key: string;
  title: string;
  model?: CreateComponentType | null;
  modelNav?: ModelNavType[];
  interactive?: InteractiveForm[];
  attr?: {
    draggable?: boolean;
    isShareData: boolean;
    sourceShareDataId?: number | string | null;
  };
  initView?: string;
  config?: Record<any>;
  styles: {
    x: number;
    y: number;
    height: number;
    width: number;
    show: boolean;
    zIndex?: number;
    isFullScreen?: boolean;
    isCombined?: boolean;
  };
  components?: CreateComponentType[] | null;
}
export interface CopyItemType {
  level?: number | string;
  parentId?: number | string;
  category: ComponentCategoryEnum;
  categoryName: string;
  key: string;
  title: string;
  model?: CreateComponentType | null;
  modelNav?: ModelNavType[];
  interactive?: InteractiveForm[];
  attr?: {
    draggable?: boolean;
    isShareData: boolean;
    sourceShareDataId?: number | string | null;
  };
  initView?: string;
  config?: Record<any>;
  styles?: {
    x: number;
    y: number;
    height: number;
    width: number;
    show: boolean;
    isFullScreen?: boolean;
  };
  components?: CreateComponentType[] | null;
}
// 编辑画布属性
export enum EditCanvasTypeEnum {
  EDIT_LAYOUT_DOM = 'editLayoutDom',
  EDIT_CONTENT_DOM = 'editContentDom',
  OFFSET = 'offset',
  SCALE = 'scale',
  USER_SCALE = 'userScale',
  IS_CREATE = 'isCreate',
  IS_DRAG = 'isDrag',
  IS_SELECT = 'isSelect',
  IS_RIGHT_CLICK = 'isRightClick',
  START_X = 'startX',
  START_Y = 'startY',
  X = 'x',
  Y = 'y',
}
// 页面下拉类型
export interface PageOption {
  label?: string; value?: string;
}
// 编辑区域
export interface EditCanvasType {
  // 编辑区域 DOM
  [EditCanvasTypeEnum.EDIT_LAYOUT_DOM]: HTMLElement | null;
  [EditCanvasTypeEnum.EDIT_CONTENT_DOM]: HTMLElement | null;
  // 偏移大小
  [EditCanvasTypeEnum.OFFSET]: number;
  // 缩放
  [EditCanvasTypeEnum.SCALE]: number;
  // 缩放
  [EditCanvasTypeEnum.USER_SCALE]: number;
  // 锁定缩放
  [EditCanvasTypeEnum.LOCK_SCALE]: boolean;
  // 初始化创建
  [EditCanvasTypeEnum.IS_CREATE]: boolean;
  // 拖拽中
  [EditCanvasTypeEnum.IS_DRAG]: boolean;
  // 右键选择
  [EditCanvasTypeEnum.IS_RIGHT_CLICK]: boolean;
  // 框选中
  [EditCanvasTypeEnum.IS_SELECT]: boolean;
  // 代码编辑中
  [EditCanvasTypeEnum.IS_CODE_EDIT]: boolean;
}
// 操作目标
// export interface TargetChartType {
//   hoverId?: string;
//   selectId: string[];
// }
export interface ActiveType {
  targetId: string[];
  pageId: string;
}
// 鼠标位置
export interface MousePositionType {
  x: number;
  // 开始 X
  [EditCanvasTypeEnum.START_X]: number;
  // 开始 Y
  [EditCanvasTypeEnum.START_Y]: number;
  // X
  [EditCanvasTypeEnum.X]: number;
  // y
  [EditCanvasTypeEnum.Y]: number;
}
export enum ComponentCategoryEnum {
  CHART = 'chart',
  TITLE = 'title',
  MENU_BAR = 'menuBar',
  MODEL = 'model',
  TDCONFIGURATION = '2DConfiguration',
  VERTICALMENU = 'verticalMenu',
  DROPDOWN = 'dropdown',
  PAGE = 'page',
  COMBINATION = 'combination',
  IMAGE = 'image',
  DATE = 'date',
  NOTIFICATIONTOOL = 'notification-tool'
}
export interface ShareDataType {
  id: string;
  data: CreateComponentType;
  quoteNum: number;
  currentItemId: string;
}
// 样式类型
interface ComponentStylesState {
  x?: number;
  y?: number;
  show?: boolean;
  height: number;
  width: number;
}
export interface ModelRouteState {
  id: string;
  level: number;
  name: string;
  serial: string;
  parentId: number;
  url: string;
  directory: string;
  code: string;
  children: ModelRouteState[] ;
}
interface FileObject {
  businessKey: string | null;
  id: string;
  name: string;
  path: string;
  refCount: string;
  size: number;
  suffix: string;
  type: string;
}
// 模型类型
export interface UeModel {
  key?: string;
  file?: FileObject | null;
  id: string;
  modelRoute?: ModelRouteState[];
  modelType?: string;
  modelTypeName?: string;
  name?: string;
}
// 模型目录类型
export interface ModelNavType {
  children?: ModelNavType[] | null;
  id: string; name: string; type: string;parentId: string;
}
export interface TdModelNavType {
  children?: TdModelNavType[] | null;
  code: string;
  directory: string;
  id: string;
  level: number;
  name: string;
  parentId: number;
  serial: number;
  url: string;
}
export interface CameraViewType {
  location?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  springArmLength?: number;
}

export interface InteractiveForm {
  type?: string;
  objectType?: string;
  action?: string;
  tag?: string;
  labelType?: string;
  weather?: string[];
  target?: string[] | string | null;
  id: number | string;
  imgUrl?: string | null;
  imgComp?: string[] | string | null;
  actorName?: number | string | string[] | number[];
  menuId?: number | string;
  cameraView?: CameraViewType;
  navItem?: string;
  floorHeight?: number;
  directory?: string;
  actorIds?: number[] | string[];
  opacity?: boolean;
}
