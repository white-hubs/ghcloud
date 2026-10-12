export class DragElement {
  #operateDragElement;
  #dragElement;
  constructor(element) {
    this.#operateDragElement = element.querySelector('.modal-header')
    this.#operateDragElement.style.cursor = 'move'
    this.#dragElement = element
    this.addEventListenDrag()
  }
  // 获取样式
  getStyle(attr) {
    if (document.body.currentStyle) {
      // 在ie下兼容写法
      return this.#dragElement.currentStyle[attr]
    }
    return window.getComputedStyle(this.#dragElement, null)[attr]
  }
  // 监听拖拽
  addEventListenDrag() {
    this.#operateDragElement.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - this.#operateDragElement.offsetLeft
      const disY = e.clientY - this.#operateDragElement.offsetTop
      const screenWidth = document.body.clientWidth // body当前宽度
      const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)

      const dragDomWidth = this.#dragElement.offsetWidth // 对话框宽度
      const dragDomheight = this.#dragElement.offsetHeight // 对话框高度

      const minDragDomLeft = this.#dragElement.offsetLeft
      const maxDragDomLeft = screenWidth - this.#dragElement.offsetLeft - dragDomWidth

      const minDragDomTop = this.#dragElement.offsetTop
      const maxDragDomTop = screenHeight - this.#dragElement.offsetTop - dragDomheight

      // 获取到的值带px 正则匹配替换
      let styleLeft = this.getStyle('left')
      // 为兼容ie
      if (styleLeft === 'auto') {
        styleLeft = '0px'
      }
      let styleTop = this.getStyle('top')
      if (styleTop === 'auto') {
        styleTop = '0px'
      }

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styleLeft.includes('%')) {
        styleLeft = +document.body.clientWidth * (+styleLeft.replace(/%/g, '') / 100)
        styleTop = +document.body.clientHeight * (+styleTop.replace(/%/g, '') / 100)
      } else {
        styleLeft = +styleLeft.replace(/px/g, '')
        styleTop = +styleTop.replace(/px/g, '')
      }

      document.onmousemove = (e) => {
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY
        // 边界处理
        if (-(left) > minDragDomLeft) {
          left = -(minDragDomLeft)
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
        }

        if (-(top) > minDragDomTop) {
          top = -(minDragDomTop)
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
        }
        this.setElementStyle({
          left: left + styleLeft + 'px',
          top: top + styleTop + 'px'
        })
      }

      document.onmouseup = function (e) {
        document.onmousemove = null
        document.onmouseup = null
      }
    }

    document.onmouseup = function (e) {
      document.onmousemove = null
      document.onmouseup = null
    }
  }
  // 设置元素样式
  setElementStyle(options) {
    if (!options) {
      return
    }
    Object.keys(options).forEach((attr) => {
      let attrValue = options[attr]
      if (attrValue) {
        this.#dragElement.style[attr] = attrValue
      }
    })
  }
}