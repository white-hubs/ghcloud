import { defineComponent, onMounted, reactive, ref, toRefs } from "vue";
export default defineComponent({
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    const state = reactive({
      selectedValue: null,
    });
    onMounted(() => {
      state.selectedValue = props.value;
    });
    const change = (value) => {
      emit("update:value", state.selectedValue);
    };
    return {
      ...toRefs(state),
      change,
    };
  },
});
