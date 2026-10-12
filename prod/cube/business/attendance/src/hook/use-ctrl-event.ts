import { onMounted, onBeforeMount, ref } from 'vue'

// interface UseCtrlEvent {
//   scorllY: Ref;
// }
interface Options {
  onKeyDown: () => void;
  onKeyUp: () => void;
}
const options = ref<Options>()
const keydown = (event: KeyboardEvent): void => {
  if (event.key === 'Control') {
    options.value?.onKeyDown()
  }
}

const keyup = (event: KeyboardEvent): void => {
  if (event.key === 'Control') {
    options.value?.onKeyUp()
  }
}

export const useCtrlEvent = (params: Options): void => {
  options.value = params
  onMounted(() => {
    window.addEventListener('keydown', keydown, true)
    window.addEventListener('keyup', keyup, true)
  })

  onBeforeMount(() => {
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('keyup', keydown)
  })
}
