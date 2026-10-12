import type { ComponentInternalInstance } from 'vue'

const modalMap = new Map()

export const setModalMap = (id: string, modalInstance: ComponentInternalInstance): void => {
  modalMap.set(id, modalInstance)
}

export const removeModalMap = (id: string): void => {
  modalMap.delete(id)
}

/** 关闭所有弹窗 */
export const closeAllModal = (): void => {
  modalMap.forEach((modalInstance) => {
    modalInstance.exposed.close()
  })
}

/** 关闭某个弹窗  */
export const closeModal = (id: string): void => {
  if (!id) {
    return
  }

  const modalInstance = modalMap.get(id)
  if (modalInstance) {
    modalInstance.exposed.close()
  } else {
  }
}