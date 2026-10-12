import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

export const SeamlessScroll = defineComponent({
  name: 'SeamlessScroll',
  props: {
    list: {
      type: Array as () => unknown[],
      default: () => [],
    },
    step: {
      type: Number,
      default: 0.5,
    },
    hover: {
      type: Boolean,
      default: true,
    },
    limitScrollNum: {
      type: Number,
      default: 3,
    },
    singleHeight: {
      type: Number,
      default: 0,
    }
  },
  setup (props, { slots }) {
    const containerRef = ref<HTMLElement | null>(null);
    const contentRef = ref<HTMLElement | null>(null);
    const yPos = ref(0);
    const isHover = ref(false);
    let reqId: number | null = null;
    let contentHeight = 0;

    const canScroll = computed(() => {
      return props.list.length >= props.limitScrollNum;
    });

    const start = (): void=> {
      if (!canScroll.value) return;
      if (reqId !== null) cancelAnimationFrame(reqId);

      const animate = (): void=> {
        if (isHover.value && props.hover) {
          reqId = requestAnimationFrame(animate);
          return;
        }

        yPos.value -= props.step;

        // 当滚动距离超过一半高度时（因为我们复制了一份，所以一半就是原始列表高度）
        // 注意：复制的部分是 append 在后面的，所以往下滚（yPos 变负）
        if (Math.abs(yPos.value) >= contentHeight / 2) {
          // 修正误差，而不是直接置0，防止跳动
          // 例如 yPos 是 -100.5，高度一半是 100
          // 我们希望回到 -0.5 的位置
          yPos.value += contentHeight / 2;
        }

        reqId = requestAnimationFrame(animate);
      };

      reqId = requestAnimationFrame(animate);
    };

    const init = (): void=> {
      if (!containerRef.value || !contentRef.value) return;
      contentHeight = contentRef.value.offsetHeight;
      // 初始可能高度为0（display:none 或者未渲染）
      if (contentHeight === 0 && props.list.length > 0) {
        // retry
        setTimeout(init, 100);
        return;
      }
      start();
    };

    watch(() => props.list, () => {
      if (reqId !== null) cancelAnimationFrame(reqId);
      yPos.value = 0;
      nextTick(() => {
        init();
      });
    }, { deep: true, immediate: true });

    let ro: ResizeObserver | null = null;
    onMounted(() => {
      if (contentRef.value) {
        ro = new ResizeObserver(() => {
          // ResizeObserver 回调可能很频繁
          const newHeight = contentRef.value?.offsetHeight || 0;
          if (Math.abs(newHeight - contentHeight) > 1) {
            contentHeight = newHeight;
          }
        });
        ro.observe(contentRef.value);
      }
      init();
    });

    onUnmounted(() => {
      if (reqId !== null) cancelAnimationFrame(reqId);
      if (ro) ro.disconnect();
    });

    return (): JSX.Element => (
      <div
        ref={containerRef}
        style={{ overflow: 'hidden', height: '100%' }}
        onMouseenter={() => isHover.value = true}
        onMouseleave={() => isHover.value = false}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate3d(0, ${yPos.value}px, 0)`,
            // willChange: 'transform' // 某些浏览器可能会导致模糊，视情况而定
          }}
        >
          {props.list.map((item, index) => slots.default?.({ data: item, index }))}
          {canScroll.value && props.list.map((item, index) => slots.default?.({ data: item, index: index + props.list.length }))}
        </div>
      </div>
    );
  }
});
