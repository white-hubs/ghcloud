import { type Ref, ref, onMounted, onBeforeMount, nextTick } from 'vue'

interface UseFloorTagPosition {
  tagLeft: Ref;
}

export const useFloorTagPosition = (): UseFloorTagPosition => {
  const tagLeft = ref(0)

  const getTagPosition = (): void => {
    const letPanelDom = document.querySelector('#left-panel')
    const leftContent = letPanelDom ? letPanelDom?.clientWidth ?? 0 : 0
    tagLeft.value = leftContent + 5
  }

  onMounted(() => {
    nextTick(() => {
      getTagPosition()
    })
    window.addEventListener('resize', getTagPosition)
  })

  onBeforeMount(() => {
    window.removeEventListener('resize', getTagPosition)
  })

  return {
    tagLeft,
  }
}
