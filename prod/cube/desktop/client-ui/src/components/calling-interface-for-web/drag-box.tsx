import { defineComponent, ref, onMounted } from 'vue';

interface Props{
  initPosition?: { x: number; y: number; };
}

export const DragBox = defineComponent({
  props: ['initPosition'],
  emits: ['drag', 'dragEnd'],
  setup (props: Props, { slots, emit }) {
    const position = ref({ x: 0, y: 0 }); // 记录元素的位置
    const isDragging = ref(false); // 是否正在拖拽
    const offset = ref({ x: 0, y: 0 }); // 记录鼠标按下时的偏移量
    const elementRef = ref<HTMLElement | null>(null); // 引用 DOM 元素

    // 在组件挂载后计算居中位置
    onMounted(() => {
      if (props.initPosition?.x && props.initPosition?.y){
        position.value.x = props.initPosition.x
        position.value.y = props.initPosition.y
        return
      }
      if (elementRef.value) {
        const { width, height } = elementRef.value.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 计算居中位置
        position.value.x = (windowWidth - width) / 2;
        position.value.y = (windowHeight - height) / 2;
      }
    });

    // 鼠标按下事件
    const onMouseDown = (event: MouseEvent): void => {
      isDragging.value = true;
      // 记录鼠标按下时的偏移量
      offset.value.x = event.clientX - position.value.x;
      offset.value.y = event.clientY - position.value.y;

      // 监听鼠标移动和松开事件
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // 鼠标移动事件
    const onMouseMove = (event: MouseEvent): void => {
      if (isDragging.value) {
        // 更新元素位置
        position.value.x = event.clientX - offset.value.x;
        position.value.y = event.clientY - offset.value.y;
        emit('drag')
      }
    };

    // 鼠标松开事件
    const onMouseUp = (): void=> {
      isDragging.value = false;
      // 移除事件监听
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      emit('dragEnd')
    };

    return (): JSX.Element => (
      <div
        ref={elementRef}
        style={{
          position: 'fixed',
          left: `${position.value.x}px`,
          top: `${position.value.y}px`,
          zIndex: 1000,
        }}
        onMousedown={onMouseDown}
      >
        {slots.default?.()}
      </div>
    );
  },
});
