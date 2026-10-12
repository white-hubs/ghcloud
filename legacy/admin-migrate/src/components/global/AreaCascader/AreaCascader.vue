<template lang="pug">
div.areaCas
  a-cascader(
    v-model:value="modelValue"
    :options="areaOpions"
    :displayRender="displayRender"
    @change="change"
    :style="{display:onlyLabel? 'none':''}"
    placeholder="请选择所在地区")
  span(v-if="onlyLabel") {{locationName}}  

</template>
<script lang='jsx'>
import { defineComponent, ref, watch, reactive, toRefs, onMounted } from "vue";
import areaOpions from "./area.json";
export default defineComponent({
  props: {
    areaIds: {
      type: Array,
      default: () => {
        return [];
      },
    },
    value: {
      type: [Array, String, Number],
    },
    fieldNames: {
      type: Object,
      default: () => {
        return { label: "label", value: "value", children: "children" };
      },
    },
    onlyLabel: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const modelValue = ref([]);

    const state = reactive({
      options: [],
      locationName: "",
    });

    const change = (e) => {
      emit("update:value", e);
      emit("change");
    };

    const displayRender = ({ labels }) => {
      emit("getLabel", labels);
      state.locationName = labels.join(" / ");
      return labels.join(" / ");
    };

    onMounted(() => {
      state.options = areaOpions;
    });

    watch(
      () => props.value,
      (n) => {
        modelValue.value = n;
      }
    );

    return {
      modelValue,
      ...toRefs(state),
      displayRender,
      areaOpions,
      change,
    };
  },
});
</script>
<style lang="less" scoped>
.areaCas {
  text-align: left;
}
</style>
