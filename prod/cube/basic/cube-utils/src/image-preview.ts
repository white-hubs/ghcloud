/**
 * 图片预览组件
 * @param images 图片路径集合
 * @param index 默认显示的图片索引，默认为0
 * @param options 配置选项
 */
export const showImagePreview = (
  images: string[],
  index: number = 0,
  options: {
    closeable?: boolean;
    closeIconPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    showIndex?: boolean;
    swipeDuration?: number;
    onClose?: () => void;
  } = {}
): void => {
  if (images.length === 0) {
    return
  }

  // 确保下标不越界
  if (index >= images.length){
    index = images.length - 1
  }

  // 默认配置
  const defaultOptions = {
    closeable: true,
    closeIconPosition: 'top-right',
    showIndex: true,
    swipeDuration: 300,
    onClose: (): void => {}
  }

  // 合并配置
  const mergedOptions = { ...defaultOptions, ...options }

  createCustomImagePreview(images, index, {
    ...mergedOptions,
    closeIconPosition: mergedOptions.closeIconPosition as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  })
}

/**
 * 关闭图片预览
 */
export const closeImagePreview = (): void => {
  const previewContainer = document.getElementById('gh-image-preview-container')
  if (previewContainer) {
    document.body.removeChild(previewContainer)
  }
}

/**
 * 创建自定义图片预览
 */
const createCustomImagePreview = (
  images: string[],
  currentIndex: number,
  options: {
    closeable: boolean;
    closeIconPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    showIndex: boolean;
    swipeDuration: number;
    onClose: () => void;
  }
): void => {
  // 移除已存在的预览容器
  closeImagePreview()

  // 创建预览容器
  const container = document.createElement('div')
  container.id = 'gh-image-preview-container'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)'
  container.style.zIndex = '9999'
  container.style.display = 'flex'
  container.style.justifyContent = 'center'
  container.style.alignItems = 'center'
  container.style.overflow = 'hidden'
  container.style.touchAction = 'none'

  // 创建图片容器
  const imageContainer = document.createElement('div')
  imageContainer.style.position = 'relative'
  imageContainer.style.width = '100%'
  imageContainer.style.height = '100%'
  imageContainer.style.display = 'flex'
  imageContainer.style.justifyContent = 'center'
  imageContainer.style.alignItems = 'center'
  imageContainer.style.transition = `transform ${options.swipeDuration}ms ease-out`

  // 创建图片元素
  images.forEach((src, idx) => {
    const imgWrapper = document.createElement('div')
    imgWrapper.style.position = 'absolute'
    imgWrapper.style.width = '100%'
    imgWrapper.style.height = '100%'
    imgWrapper.style.display = 'flex'
    imgWrapper.style.justifyContent = 'center'
    imgWrapper.style.alignItems = 'center'
    imgWrapper.style.transform = `translateX(${(idx - currentIndex) * 100}%)`
    imgWrapper.style.transition = `transform ${options.swipeDuration}ms ease-out`

    const img = document.createElement('img')
    img.src = src
    img.style.maxWidth = '90%'
    img.style.maxHeight = '90%'
    img.style.objectFit = 'contain'

    imgWrapper.appendChild(img)
    imageContainer.appendChild(imgWrapper)
  })

  // 创建关闭按钮
  if (options.closeable) {
    const closeBtn = document.createElement('div')
    closeBtn.style.position = 'absolute'
    closeBtn.style.width = '40px'
    closeBtn.style.height = '40px'
    closeBtn.style.borderRadius = '50%'
    closeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    closeBtn.style.display = 'flex'
    closeBtn.style.justifyContent = 'center'
    closeBtn.style.alignItems = 'center'
    closeBtn.style.cursor = 'pointer'
    closeBtn.style.zIndex = '10000'
    closeBtn.style.fontSize = '20px'
    closeBtn.style.color = '#fff'
    closeBtn.innerHTML = '×'

    // 设置关闭按钮位置
    switch (options.closeIconPosition) {
      case 'top-left':
        closeBtn.style.top = '20px'
        closeBtn.style.left = '20px'
        break
      case 'bottom-right':
        closeBtn.style.bottom = '20px'
        closeBtn.style.right = '20px'
        break
      case 'bottom-left':
        closeBtn.style.bottom = '20px'
        closeBtn.style.left = '20px'
        break
      case 'top-right':
      default:
        closeBtn.style.top = '20px'
        closeBtn.style.right = '20px'
        break
    }

    // 添加触摸事件处理
    closeBtn.addEventListener('touchstart', (e) => {
      e.stopPropagation()
    }, { passive: false })

    closeBtn.addEventListener('touchend', (e) => {
      e.stopPropagation()
      e.preventDefault()
      closeImagePreview()
      options.onClose()
    }, { passive: false })

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      closeImagePreview()
      options.onClose()
    })

    container.appendChild(closeBtn)
  }

  // 创建索引指示器
  if (options.showIndex && images.length > 1) {
    const indexIndicator = document.createElement('div')
    indexIndicator.style.position = 'absolute'
    indexIndicator.style.bottom = '20px'
    indexIndicator.style.left = '50%'
    indexIndicator.style.transform = 'translateX(-50%)'
    indexIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
    indexIndicator.style.color = '#fff'
    indexIndicator.style.padding = '5px 10px'
    indexIndicator.style.borderRadius = '15px'
    indexIndicator.style.fontSize = '14px'
    indexIndicator.textContent = `${currentIndex + 1} / ${images.length}`

    container.appendChild(indexIndicator)

    // 更新索引显示
    const updateIndex = (idx: number): void => {
      indexIndicator.textContent = `${idx + 1} / ${images.length}`
    }

    // 监听滑动事件更新索引
    container.addEventListener('swipe', (e: any) => {
      updateIndex(e.detail.currentIndex)
    })
  }

  // 添加到body
  container.appendChild(imageContainer)
  document.body.appendChild(container)

  // 实现滑动功能
  let startX = 0
  let currentX = 0
  let isDragging = false

  // 触摸事件处理
  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX
    isDragging = true
    e.preventDefault()
  }, { passive: false })

  container.addEventListener('touchmove', (e) => {
    if (!isDragging) return

    currentX = e.touches[0].clientX
    const diffX = currentX - startX

    // 计算所有图片的新位置
    const imgWrappers = imageContainer.children
    for (let i = 0; i < imgWrappers.length; i++) {
      const imgWrapper = imgWrappers[i] as HTMLElement
      const translateX = ((i - currentIndex) * 100) + (diffX / container.clientWidth * 100)
      imgWrapper.style.transform = `translateX(${translateX}%)`
      imgWrapper.style.transition = 'none'
    }

    e.preventDefault()
  }, { passive: false })

  container.addEventListener('touchend', (e) => {
    if (!isDragging) return

    const diffX = currentX - startX
    const threshold = container.clientWidth * 0.2 // 20%的阈值

    let newIndex = currentIndex

    if (diffX > threshold && currentIndex > 0) {
      // 向右滑动，显示上一张
      newIndex = currentIndex - 1
    } else if (diffX < -threshold && currentIndex < images.length - 1) {
      // 向左滑动，显示下一张
      newIndex = currentIndex + 1
    }

    // 更新所有图片位置
    const imgWrappers = imageContainer.children
    for (let i = 0; i < imgWrappers.length; i++) {
      const imgWrapper = imgWrappers[i] as HTMLElement
      imgWrapper.style.transform = `translateX(${(i - newIndex) * 100}%)`
      imgWrapper.style.transition = `transform ${options.swipeDuration}ms ease-out`
    }

    // 更新当前索引
    if (newIndex !== currentIndex) {
      currentIndex = newIndex

      // 更新索引显示
      if (options.showIndex) {
        const indexIndicator = container.querySelector('div[style*="border-radius: 15px"]') as HTMLElement
        if (indexIndicator) {
          indexIndicator.textContent = `${currentIndex + 1} / ${images.length}`
        }
      }

      // 触发自定义事件
      container.dispatchEvent(new CustomEvent('swipe', {
        detail: { currentIndex }
      }))
    }

    isDragging = false
    e.preventDefault()
  }, { passive: false })

  // 鼠标事件处理（PC端）
  container.addEventListener('mousedown', (e) => {
    startX = e.clientX
    isDragging = true
    e.preventDefault()
  })

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return

    currentX = e.clientX
    const diffX = currentX - startX

    // 计算所有图片的新位置
    const imgWrappers = imageContainer.children
    for (let i = 0; i < imgWrappers.length; i++) {
      const imgWrapper = imgWrappers[i] as HTMLElement
      const translateX = ((i - currentIndex) * 100) + (diffX / container.clientWidth * 100)
      imgWrapper.style.transform = `translateX(${translateX}%)`
      imgWrapper.style.transition = 'none'
    }

    e.preventDefault()
  })

  container.addEventListener('mouseup', (e) => {
    if (!isDragging) return

    const diffX = currentX - startX
    const threshold = container.clientWidth * 0.2 // 20%的阈值

    let newIndex = currentIndex

    if (diffX > threshold && currentIndex > 0) {
      // 向右滑动，显示上一张
      newIndex = currentIndex - 1
    } else if (diffX < -threshold && currentIndex < images.length - 1) {
      // 向左滑动，显示下一张
      newIndex = currentIndex + 1
    }

    // 更新所有图片位置
    const imgWrappers = imageContainer.children
    for (let i = 0; i < imgWrappers.length; i++) {
      const imgWrapper = imgWrappers[i] as HTMLElement
      imgWrapper.style.transform = `translateX(${(i - newIndex) * 100}%)`
      imgWrapper.style.transition = `transform ${options.swipeDuration}ms ease-out`
    }

    // 更新当前索引
    if (newIndex !== currentIndex) {
      currentIndex = newIndex

      // 更新索引显示
      if (options.showIndex) {
        const indexIndicator = container.querySelector('div[style*="border-radius: 15px"]') as HTMLElement
        if (indexIndicator) {
          indexIndicator.textContent = `${currentIndex + 1} / ${images.length}`
        }
      }

      // 触发自定义事件
      container.dispatchEvent(new CustomEvent('swipe', {
        detail: { currentIndex }
      }))
    }

    isDragging = false
    e.preventDefault()
  })

  // 阻止鼠标离开窗口后还在拖动的情况
  container.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false

      // 恢复原位
      const imgWrappers = imageContainer.children
      for (let i = 0; i < imgWrappers.length; i++) {
        const imgWrapper = imgWrappers[i] as HTMLElement
        imgWrapper.style.transform = `translateX(${(i - currentIndex) * 100}%)`
        imgWrapper.style.transition = `transform ${options.swipeDuration}ms ease-out`
      }
    }
  })

  // 键盘事件处理（PC端）
  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('gh-image-preview-container')) return

    if (e.key === 'Escape' && options.closeable) {
      closeImagePreview()
      options.onClose()
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      // 左箭头，显示上一张
      currentIndex--

      // 更新所有图片位置
      const imgWrappers = imageContainer.children
      for (let i = 0; i < imgWrappers.length; i++) {
        const imgWrapper = imgWrappers[i] as HTMLElement
        imgWrapper.style.transform = `translateX(${(i - currentIndex) * 100}%)`
      }

      // 更新索引显示
      if (options.showIndex) {
        const indexIndicator = container.querySelector('div[style*="border-radius: 15px"]') as HTMLElement
        if (indexIndicator) {
          indexIndicator.textContent = `${currentIndex + 1} / ${images.length}`
        }
      }

      // 触发自定义事件
      container.dispatchEvent(new CustomEvent('swipe', {
        detail: { currentIndex }
      }))
    } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
      // 右箭头，显示下一张
      currentIndex++

      // 更新所有图片位置
      const imgWrappers = imageContainer.children
      for (let i = 0; i < imgWrappers.length; i++) {
        const imgWrapper = imgWrappers[i] as HTMLElement
        imgWrapper.style.transform = `translateX(${(i - currentIndex) * 100}%)`
      }

      // 更新索引显示
      if (options.showIndex) {
        const indexIndicator = container.querySelector('div[style*="border-radius: 15px"]') as HTMLElement
        if (indexIndicator) {
          indexIndicator.textContent = `${currentIndex + 1} / ${images.length}`
        }
      }

      // 触发自定义事件
      container.dispatchEvent(new CustomEvent('swipe', {
        detail: { currentIndex }
      }))
    }
  })
}