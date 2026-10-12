import interact from 'interactjs'

export interface MetaHumanOptions {
  domStyle: Partial<CSSStyleDeclaration>;
  domClass?: string;
}

/** 基于ThreeJS 实现的数字人 */
export class CubeMetaHuman {
  private static instance: CubeMetaHuman | null
  public static getInstance (options: MetaHumanOptions): CubeMetaHuman {
    if (!CubeMetaHuman.instance) {
      CubeMetaHuman.instance = new CubeMetaHuman(options)
    }
    return CubeMetaHuman.instance
  }

  private readonly options: MetaHumanOptions
  private readonly domElement: HTMLElement // 存储对DOM元素的引用

  private constructor (options: MetaHumanOptions) {
    this.options = options
    this.options.domClass = options.domClass ?? 'cube-meta-human'

    this.domElement = document.createElement('div')
    this.domElement.className = this.options.domClass
    for (const key in this.options.domStyle) {
      this.domElement.style[key] = options.domStyle[key] as unknown as string
    }
    this.domElement.style.position = 'fixed'
    this.domElement.style.zIndex = '999'
    document.body.appendChild(this.domElement)

    interact(`.${this.options.domClass}`)
      .resizable({
        // resize from all edges and corners
        edges: { left: true, right: true, bottom: true, top: true },

        listeners: {
          move (event) {
            const target = event.target
            let x = (parseFloat(target.getAttribute('data-x')) || 0)
            let y = (parseFloat(target.getAttribute('data-y')) || 0)

            // update the element's style
            target.style.width = event.rect.width + 'px'
            target.style.height = event.rect.height + 'px'

            // translate when resizing from top or left edges
            x += event.deltaRect.left
            y += event.deltaRect.top

            target.style.transform = 'translate(' + x + 'px,' + y + 'px)'

            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
            // target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height)
          }
        },
        modifiers: [
          // keep the edges inside the parent
          interact.modifiers.restrictEdges({
            outer: 'parent'
          }),

          // minimum size
          interact.modifiers.restrictSize({
            min: { width: 100, height: 50 }
          })
        ],

        inertia: true
      })
      .draggable({
        listeners: {
          move: (event) => {
            const target = event.target
            // keep the dragged position in the data-x/data-y attributes
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

            // translate the element
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

            // update the posiion attributes
            target.setAttribute('data-x', x)
            target.setAttribute('data-y', y)
          }
        },
        inertia: true,
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
          })
        ]
      })
  }
}
