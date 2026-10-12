import { defineStore } from 'pinia'
import { ComponentCategoryEnum } from './chart-edit-store.d'
import type { EditCanvasType, ActiveType, ModelNavType, CreateComponentType, InteractiveForm, MousePositionType, ShareDataType, CopyItemType } from './chart-edit-store.d'
import { useChartHistoryStore } from '../chart-history-store/chart-history-store'
import { type HistoryItemType, HistoryActionTypeEnum } from '../chart-history-store/chart-history-store.d'
import { isString, isArray, createUuid, getComponentListByType } from '@/utils'
import { titleInitConfig, menuBarInitConfig } from '@/setting/design-setting'
import debounce from 'lodash/debounce'
import { popPageComps, pushPageComps } from '@/utils/index'
import _ from 'lodash'
export interface EditStoreState {
  projectName: string;
  editCanvas: EditCanvasType;
  canvasScale: string;
  isDrag: boolean;
  active: ActiveType;
  pages: CreateComponentType[];
  shareData: ShareDataType[];
  mousePosition: MousePositionType;
}
const chartHistoryStore = useChartHistoryStore()
// 编辑区域内容
export const useChartEditStore = defineStore({
  id: 'useChartEditStore',
  state: (): EditStoreState => ({
    projectName: '',
    // 画布属性
    editCanvas: {
      // 编辑区域 Dom
      editLayoutDom: null,
      editContentDom: null,
      // 偏移量
      offset: 20,
      // 系统控制缩放
      scale: 1,
      // 用户控制的缩放
      userScale: 1,
      // 初始化
      isCreate: false,
      // 拖拽中
      isDrag: false,
      // 框选中
      isSelect: false,
      isRightClick: false,
    },
    canvasScale: '16:9',
    // 鼠标定位
    mousePosition: {
      startX: 0,
      startY: 0,
      x: 0,
      y: 0
    },
    // 拖拽中
    isDrag: false,
    // 当前页面和选中项的id
    active: {
      targetId: [],
      pageId: ''
    },
    // 所有页面
    pages: [
    ],
    // 同源数据
    shareData: [],
    // 图表数组
  }),
  getters: {
    getMousePosition (): MousePositionType {
      return this.mousePosition
    },
    getEditCanvas (): EditCanvasType {
      return this.editCanvas
    },
    getCanvasScaleRect (): { width: number; height: number; } {
      const scaleList = this.canvasScale.split(':')
      if (scaleList.length < 2) {
        return {
          width: 1920,
          height: 1080
        }
      } else {
        return {
          width: Number(scaleList[0]) * 120,
          height: Number(scaleList[1]) * 120
        }
      }
    },
    getCurrentMenuBar (): CreateComponentType | undefined {
      if (!this.getCurrentPage?.components) {
        return
      }
      let currentMenuBar
      if (this.getCurrentBlock?.category === ComponentCategoryEnum.MENU_BAR && this.active.targetId[0]) {
        currentMenuBar = this.getCurrentPageComponents.find(item => {
          return item.category === ComponentCategoryEnum.MENU_BAR && item.id === this.active.targetId[0]
        })
      } else {
        currentMenuBar = this.getCurrentPageComponents.find(item => {
          return item.category === ComponentCategoryEnum.MENU_BAR
        })
      }
      return currentMenuBar
    },
    getCurrentPageComponents (): CreateComponentType[] {
      return this.getCurrentPage?.components ?? []
    },
    getAllComponents (): CreateComponentType[] {
      const list: CreateComponentType[] = []
      this.pages.forEach(page => {
        if (page.components) {
          list.splice(0, 0, ...page.components)
        }
      })
      return list
    },
    getCurrentTitle (): CreateComponentType | undefined {
      if (!this.getCurrentPage?.components) {
        return
      }
      return this.getCurrentPage.components.find(item => item.category === ComponentCategoryEnum.TITLE)
    },
    getCurrentBlock (): CreateComponentType | null {
      let curBlock: CreateComponentType
      const getBlock = (comps: CreateComponentType | null): CreateComponentType | null => {
        if (this.getCurrentPage?.model && this.getCurrentPage?.model.id === this.active.targetId[0]) {
          curBlock = this.getCurrentPage.model
          return curBlock
        }
        comps?.components?.forEach(comp => {
          if (comp.id === this.active.targetId[0]) {
            curBlock = comp
          }
          if (comp.components && comp.components.length > 0) {
            getBlock(comp)
          }
        })
        return curBlock
      }
      getBlock(this.getCurrentPage)
      return getBlock(this.getCurrentPage)
    },
    getActivePageModel (): CreateComponentType | null {
      if (!this.getCurrentPage) return null
      return this.getCurrentPage.model as CreateComponentType | null
    },
    // 获取框选的组件
    getSelectedComps (): CreateComponentType[] {
      const selectComps = this.getCurrentPageComponents.filter(comp => {
        return this.active.targetId.some(x => comp.id === x)
      })
      return selectComps
    },
    getActive (): ActiveType {
      return this.active
    },
    getProjectName (): string {
      return this.projectName
    },
    getPages (): CreateComponentType[] {
      return this.pages
    },
    getCurrentPage (): CreateComponentType | null {
      const currentPage = this.pages.find(page => page.id === this.active.pageId)
      if (currentPage) {
        return currentPage
      }
      return null
    },
  },
  actions: {
    setModelNav (list: ModelNavType[]) {
      if (this.getCurrentPage) this.getCurrentPage.modelNav = list
    },
    setDragging (isDrag: boolean) {
      this.isDrag = isDrag
    },
    // * 设置 editCanvas 数据项
    setEditCanvas<T extends keyof EditCanvasType, K extends EditCanvasType[T]>(key: T, value: K) {
      this.editCanvas[key] = value
    },
    // * 设置鼠标位置
    setMousePosition (x?: number, y?: number, startX?: number, startY?: number): void {
      if (x) this.mousePosition.x = x
      if (y) this.mousePosition.y = y
      if (startX) this.mousePosition.startX = startX
      if (startY) this.mousePosition.startY = startY
    },
    // 设置项目id
    setProjectName (projectName: string): void {
      this.projectName = projectName
    },
    // 设置当前页面
    setActivePage (pageId: string): void {
      this.active.pageId = pageId
    },
    // * 设置页面样式属性
    setPageStyle<T extends keyof CSSStyleDeclaration>(key: T, value: string): void {
      const dom = this.getEditCanvas.editContentDom
      if (dom) {
        dom.style[key] = value as never
      }
    },
    // 设置页面
    setPages (pages: CreateComponentType[]): void {
      this.pages = pages
    },
    // 复制组件
    copyComponent (sourceComponent: CreateComponentType | null, isShareData: boolean): void {
      let copyItem: CopyItemType
      const setId = (list: CreateComponentType): void => {
        if (list.components) {
          list.components.forEach(item => {
            item.id = createUuid()
            setId(item)
          })
        }
      }
      // 同源复制
      if (isShareData && sourceComponent?.attr) {
        // 源数据不存在于同源数据中,添加同源数据
        const sourceBlock = this.shareData.find(x => x.id === sourceComponent.id)?.data
        if (!sourceBlock && this.getCurrentBlock?.attr) {
          const shareData = { id: sourceComponent.id, data: sourceComponent, quoteNum: 1, currentItemId: '' }
          this.shareData.push(shareData)
          sourceComponent.attr.isShareData = true
          if (this.getCurrentBlock?.attr?.sourceShareDataId && this.getCurrentBlock?.attr?.sourceShareDataId !== sourceComponent.id) {
            this.shareData.filter(x => x.id === this.getCurrentBlock?.attr?.sourceShareDataId)[0].quoteNum -= 1
          }
        }
        if (sourceComponent.attr.isShareData && sourceBlock) {
          this.shareData.forEach((item, index) => {
            if (item.id === sourceComponent.id) {
              // 源数据存在于同源数据中,同源数据引用+1
              this.shareData[index].quoteNum += 1
            }
            if (item.id === this.getCurrentBlock?.attr?.sourceShareDataId) {
              this.shareData[index].quoteNum -= 1
            }
          })
        }
        const { id, styles, attr, ...filterObj } = Object.assign({}, sourceComponent)
        const cloneFilterObj = _.cloneDeep(filterObj)
        if (cloneFilterObj)setId(cloneFilterObj as CreateComponentType)
        copyItem = Object.assign(_.cloneDeep(cloneFilterObj), { attr: { isShareData: true, sourceShareDataId: sourceComponent.id } })
      }
      // 非同源复制
      if (!isShareData && sourceComponent?.attr) {
        // 当前组件曾经被同源,获取被同源的数据,引用次数减1
        if (this.getCurrentBlock?.attr?.isShareData) {
          this.shareData.forEach((item, index) => {
            if (item.id === this.getCurrentBlock?.attr?.sourceShareDataId || item.id === this.getCurrentBlock?.id) {
              this.shareData[index].quoteNum -= 1
            }
          })
        }
        const { id, styles, attr, ...filterObj } = Object.assign({}, sourceComponent)
        const cloneFilterObj = _.cloneDeep(filterObj)
        if (cloneFilterObj)setId(cloneFilterObj as CreateComponentType)
        copyItem = Object.assign(_.cloneDeep(cloneFilterObj), { attr: { isShareData: false, sourceShareDataId: null } })
      }
      // 如果同源数据引用次数为0,删除同源数据,并将源数据设置为isShareData = false
      this.shareData.forEach((item, index) => {
        if (item.quoteNum === 0) {
          this.shareData.splice(index, 1)
          if (sourceComponent?.attr) {
            sourceComponent.attr.isShareData = false
            sourceComponent.attr.sourceShareDataId = null
          }
        }
      })
      const flattening = (arr: CreateComponentType[] | null | undefined, curId: string | number): void => {
        if (!arr) return
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].id === curId && sourceComponent) {
            const curId = arr[i].id
            const curStyles = arr[i].styles
            arr[i] = Object.assign(copyItem, { id: curId, styles: curStyles })
            if (this.shareData.find(x => x.id === arr[i].id)) {
              arr[i].attr.isShareData = true
            }
            return
          } else {
            flattening(arr[i].components, curId)
          }
        }
      }
      flattening(this.getCurrentPageComponents, this.active.targetId[0])
    },
    // 删除组件时更改shareData
    delShareData (delComp: CreateComponentType): void {
      this.shareData.forEach((curShare, index) => {
        if (curShare.id === delComp.id) {
          // 删除对应的shareData
          this.shareData.splice(index, 1)
          const compList = getComponentListByType(this.getAllComponents, delComp, delComp.category)
          // 改变影响的组件的复制状态
          compList?.forEach(comp => {
            if (!this.shareData.find(x => x.id === comp.id) && !this.shareData.find(x => x.id === comp.attr?.sourceShareDataId) && comp?.attr) {
              comp.attr.isShareData = false
              comp.attr.sourceShareDataId = null
            }
          })
        }
      })
    },
    // 设置同源数据
    setShareData (shareData: ShareDataType[]): void {
      this.shareData = shareData
    },
    // 关联同源数据
    relevanceShareData (targetShare: CreateComponentType | null, sourceShare: CreateComponentType): void {
      this.shareData.forEach((item, index) => {
        if (item.id === targetShare?.id) {
          this.shareData[index].data = sourceShare
        }
      })
    },
    // 同步同源数据
    // 注意:如果同源的数据有子级,那么必须传数据的components[]
    sycShareData (newData: CreateComponentType[] | CreateComponentType): void {
      let curBlock: CreateComponentType
      this.shareData.forEach(x => {
        if ((x.id === this.getCurrentBlock?.id || x.id === this.getCurrentBlock?.attr?.sourceShareDataId) && this.getCurrentBlock?.attr?.isShareData) {
          curBlock = x.data
          const fatherBlock = this.shareData.find(share => share.id === curBlock?.attr?.sourceShareDataId)?.data ?? curBlock
          this.relevanceShareData(fatherBlock, curBlock)
          if (isArray(newData)) {
            x.data.components = newData
          } else {
            if (this.getCurrentBlock?.id === (newData as CreateComponentType).id) {
              x.data.title = (newData as CreateComponentType).title
              x.data.config = (newData as CreateComponentType).config
            }
          }
        }
      })
      this.sycCompData()
    },
    // 同步component数据
    sycCompData (): void {
      this.getAllComponents.forEach(comp => {
        if (comp.attr?.isShareData) {
          const compShare = this.shareData.find(share => comp.id === share.id || comp.attr?.sourceShareDataId === share.id)
          if (compShare) {
            comp.components = compShare.data.components
            comp.title = compShare.data.title
            comp.config = compShare.data.config
          }
        }
      })
    },
    // 设置页面公用的组件
    setCommonComponent (commonComponent: CreateComponentType): void {
      this.pages.forEach(item => {
        item.components?.forEach(component => {
          if (component.id === commonComponent.id) {
            component = commonComponent
          }
        })
      })
    },
    // 新增页面
    addPages (initPageConfig: { title: string; initView: string; }): void {
      const { title, initView } = initPageConfig
      let initComponents: CreateComponentType[] = []
      if (initView === 'empty') {
        initComponents = []
      } else {
        const canvasStyle = this.getCanvasScaleRect
        // 初始化菜单
        const initMenuBar = _.cloneDeep(menuBarInitConfig)
        const menuWidth = ((canvasStyle.width - initMenuBar.styles.width) / 2)
        initMenuBar.styles.x = menuWidth
        initMenuBar.styles.y = canvasStyle.height - initMenuBar.styles.height - 10
        initMenuBar.id = createUuid()
        // 初始化头部
        const initTitle = _.cloneDeep(titleInitConfig)
        initTitle.styles.width = canvasStyle.width
        initTitle.id = createUuid()
        initComponents = [initMenuBar, initTitle]
      }
      const newPage: CreateComponentType = {
        title,
        id: createUuid(),
        components: _.cloneDeep(initComponents),
        model: null,
        category: ComponentCategoryEnum.PAGE,
        categoryName: '页面',
        initView,
        key: 'page',
        styles: {
          x: 0,
          y: 0,
          height: 0,
          width: 0,
          show: true,
        }
      }

      this.pages = [...this.getPages, newPage]
      this.active.pageId = newPage.id
    },
    /**
     *
     * @param componentState 设置初始页面组件
     */
    // 设置当前页面的components
    setCurrentPageComponents (componentState: CreateComponentType[]): void {
      if (this.pages.length === 0) {
        const newPage: CreateComponentType = {
          title: '未命名页面1',
          id: createUuid(),
          components: componentState,
          model: null,
          category: ComponentCategoryEnum.PAGE,
          categoryName: '页面',
          initView: 'init-first',
          key: 'page',
          styles: {
            x: 0,
            y: 0,
            height: 0,
            width: 0,
            show: true
          }
        }
        this.pages = [...this.getPages, newPage]
        this.active.pageId = newPage.id
      } else {
        this.pages = this.pages.map(item => {
          if (item.id === this.active.pageId) {
            item.components = componentState
            return item
          }
          return item
        })
      }
    },
    /**
     * 设置ue5模型
     * @param model 模型数据
     */
    setCurrentPageModel (model: CreateComponentType | null): void {
      this.pages = this.pages.map(item => {
        if (item.id === this.active.pageId) {
          item.model = model
          return item
        }
        return item
      })
    },
    // * 设置页面大小
    setPageSize (scale: number): void {
      // 用户设定大小
      this.setPageStyle('height', `${this.getCanvasScaleRect.height * scale}px`)
      this.setPageStyle('width', `${this.getCanvasScaleRect.width * scale}px`)
    },
    // * 计算缩放
    computedScale (): void {
      if (this.getEditCanvas.editLayoutDom) {
        // 现有展示区域
        const width = this.getEditCanvas.editLayoutDom.clientWidth - this.getEditCanvas.offset * 2 - 5
        const height = this.getEditCanvas.editLayoutDom.clientHeight - this.getEditCanvas.offset * 4
        // 用户设定大小
        const editCanvasWidth = this.getCanvasScaleRect.width
        const editCanvasHeight = this.getCanvasScaleRect.height
        // 需保持的比例
        const baseProportion = parseFloat((editCanvasWidth / editCanvasHeight).toFixed(5))
        const currentRate = parseFloat((width / height).toFixed(5))
        if (currentRate > baseProportion) {
          // 表示更宽
          const scaleWidth = parseFloat(((height * baseProportion) / editCanvasWidth).toFixed(5))
          this.setScale(scaleWidth > 1 ? 1 : scaleWidth)
        } else {
          // 表示更高
          const scaleHeight = parseFloat((width / baseProportion / editCanvasHeight).toFixed(5))
          this.setScale(scaleHeight > 1 ? 1 : scaleHeight)
        }
      } else {
        // (function(){})('请先创建画布，再进行缩放')
      }
    },
    //* * 新增组件列表
    addComponentList (componentInstance: CreateComponentType): void {
      this.setTargetComp(componentInstance.id)
      this.pages.find(page => page.id === this.active.pageId)?.components?.push(componentInstance)
      chartHistoryStore.createStackItem(componentInstance, HistoryActionTypeEnum.ADD, '')
    },
    // 更新组件的大小
    updateBlockSize (block: CreateComponentType) {
      const cloneCurrentPage = _.cloneDeep(this.getCurrentPage)
      const [nodes, index] = deepFind(cloneCurrentPage?.components) ?? []
      if (!nodes) return
      if (index === undefined) return
      nodes[index] = block
      type NodesType = CreateComponentType[] | null | undefined
      function deepFind (nodes: NodesType): [nodes: NodesType, index: number] | undefined {
        if (!nodes) {
          return
        }
        const index = nodes.findIndex(d => d.id === block.id)
        if (index > -1) {
          return [nodes, index]
        }
        for (const node of nodes) {
          const result = deepFind(node.components)
          if (result) {
            return result
          }
        }
      }
      if (cloneCurrentPage?.components) {
        this.setCurrentPageComponents(cloneCurrentPage?.components)
      }
    },
    // 添加交互
    addInteractive (item: InteractiveForm) {
      this.getCurrentBlock?.interactive?.push(item)
    },
    // 删除交互
    deleteInteractive (interactive: InteractiveForm): void {
      if (this.getCurrentBlock?.interactive) {
        this.getCurrentBlock.interactive = this.getCurrentBlock?.interactive.filter((item) => item.id !== interactive.id)
      }
    },
    // 更新交互
    updateInteractive (interactive: InteractiveForm[]): void {
      if (this.getCurrentBlock?.interactive) { this.getCurrentBlock.interactive = interactive }
    },
    // * 监听缩放
    listenerScale () {
      const resize = debounce(() => { this.computedScale() }, 200)
      // 默认执行一次
      resize()
      // 开始监听
      window.addEventListener('resize', () => { resize() })
      // 销毁函数
      const remove = (): void => {
        window.removeEventListener('resize', resize)
      }
      return remove
    },
    /**
      * * 设置缩放
      * @param scale 0~1 number 缩放比例;
      * @param force boolean 强制缩放
      */
    setScale (scale: number): void {
      this.setPageSize(scale)
      this.getEditCanvas.userScale = scale
      this.getEditCanvas.scale = scale
    },

    // * 找到目标 id 数据的下标位置，id可为父级或子集数组（无则返回-1）
    fetchActiveIndex (id?: string): number {
      const targetId = (id ?? (this.getActive.targetId.length && this.getActive.targetId[0])) || undefined
      if (!targetId) {
        return -1
      }
      const targetIndex = this.getCurrentPageComponents.findIndex(e => e.id === targetId)

      // 当前
      if (targetIndex !== -1) {
        return targetIndex
      } else {
        // const length = this.getComponentList.length
        // for (let i = 0; i < length; i++) {
        // if (this.getComponentList[i].isGroup) {
        //   for (const cItem of (this.getComponentList[i] as CreateComponentType).groupList) {
        //     if (cItem.id === targetId) {
        //       return i
        //     }
        //   }
        // }
        // return length
        // }
      }
      return -1
    },
    // * 统一格式化处理入参 id
    idPreFormat (id?: string | string[]) {
      const idArr = []
      if (!id) {
        idArr.push(...this.getActive.targetId)
        return idArr
      }
      if (isString(id)) idArr.push(id)
      if (isArray(id)) idArr.push(...id)
      return idArr
    },
    /**
     * * 新增组件列表
     * @param componentInstance 新图表实例
     * @param isHead 是否头部插入
     * @param isHistory 是否进行记录
     * @returns
     */
    addComponentListForward (
      componentInstance:
      | CreateComponentType
      | CreateComponentType[],
      isHead = false,
      isHistory = false
    ): void {
      if (Array.isArray(componentInstance)) {
        componentInstance.forEach(item => {
          this.addComponentListForward(item, isHead, isHistory)
        })
        return
      }
      if (isHistory) {
        chartHistoryStore.createAddHistory([{ ...componentInstance }])
      }
      if (isHead) {
        this.getCurrentPageComponents.unshift(componentInstance)
        return
      }
      this.getCurrentPageComponents.push(componentInstance)
    },
    // * 删除组件
    removeComponentList (id?: string | string[], isHistory = true): void {
      try {
        const idArr = this.idPreFormat(id)
        const history: CreateComponentType[] = []
        // 遍历所有对象
        if (!idArr.length) return
        idArr.forEach(ids => {
          const index = this.fetchActiveIndex(ids)
          if (index !== -1) {

            // history.push(this.getComponentList[index])
            this.getCurrentPageComponents.splice(index, 1)
          }
        })
        isHistory && chartHistoryStore.createDeleteHistory(history)
      } catch (value) {
      }
    },
    // * 设置目标数据 target
    setTargetComp (targetId?: string | string[], push = false) {
      // 重复选中
      if (this.active.targetId.find((e: string) => e === targetId)) return

      // 无 id 清空
      if (!targetId) {
        this.active.targetId = []
        return
      }
      // 多选
      if (push) {
        // 字符串
        if (isString(targetId)) {
          this.active.targetId.push(targetId)
          return
        }
        // 数组
        if (isArray(targetId)) {
          this.active.targetId.push(...targetId)
        }
      } else {
        // 字符串
        if (isString(targetId)) {
          this.active.targetId = [targetId]
          return
        }
        // 数组
        if (isArray(targetId)) {
          this.active.targetId = targetId
        }
      }
    },
    // * 撤回/前进 目标处理
    setBackAndSetForwardHandle (HistoryItem: HistoryItemType, isForward = false) {
      // 取消选中
      this.setTargetComp()

      // 重新选中
      const historyData = HistoryItem.historyData
      if (isArray(historyData)) {
        // 选中目标元素，支持多个
        historyData.forEach((item: CreateComponentType) => {
          this.setTargetComp(item.id, true)
        })
      }
      // 处理新增类型
      const isAdd = HistoryItem.actionType === HistoryActionTypeEnum.ADD
      const isDel = HistoryItem.actionType === HistoryActionTypeEnum.DELETE
      if (isAdd || isDel) {
        if (((isAdd && isForward) || (isDel && !isForward))) {
          if (isArray(historyData)) {
            historyData.forEach((item: CreateComponentType) => {
              this.addComponentListForward(item)
            })
          }
          return
        }
        if (isArray(historyData)) {
          historyData.forEach((item: CreateComponentType) => {
            this.removeComponentList(item.id, false)
          })

          return
        }
        this.removeComponentList((historyData as CreateComponentType).id, false)

        return
      }

      // 处理移动
      const isMove = HistoryItem.actionType === HistoryActionTypeEnum.MOVE
      if (isMove) {
        // historyData.forEach(item => {
        //   this.resetComponentPosition(item, isForward)
        // })
      }
    },
    // * 撤回
    setBack () {
      try {
        const targetData = chartHistoryStore.backAction()
        if (!targetData) {
          return
        }
        // 如果组件类型为Add,回退后,应该删除组件
        if (targetData.actionType === HistoryActionTypeEnum.ADD && this.getCurrentPage)popPageComps(this.getCurrentPage, targetData)
        // 如果组件类型为Delete,回退后,应该添加组件
        if (targetData.actionType === HistoryActionTypeEnum.DELETE && this.getCurrentPage)pushPageComps(this.getCurrentPage, targetData)
        this.setBackAndSetForwardHandle(targetData)
      } catch (value) {
      }
    },
    // * 前进
    setForward () {
      try {
        const targetData = chartHistoryStore.forwardAction()
        if (!targetData) {
          return
        }
        if (targetData.actionType === HistoryActionTypeEnum.ADD && this.getCurrentPage) pushPageComps(this.getCurrentPage, targetData)
        if (targetData.actionType === HistoryActionTypeEnum.DELETE && this.getCurrentPage)popPageComps(this.getCurrentPage, targetData)
        this.setBackAndSetForwardHandle(targetData, true)
      } catch (value) {
      }
    },
  }
})
