import { defineComponent } from "vue";

export const ESankey = defineComponent({
  name: "ESankey",
  props: {
    nodes: { type: null, required: true, default: () => [] },
    links: { type: null, required: true, default: () => [] },
  },
  setup(props, { expose }) {
    const sankey = ref();
    onMounted(() => {
      render();
    });

    expose({
      render,
    });

    return (): JSX.Element => <div id="sankey" ref={sankey} style="width:100%;height:100%" />;
  },
});

export default ESankey;
