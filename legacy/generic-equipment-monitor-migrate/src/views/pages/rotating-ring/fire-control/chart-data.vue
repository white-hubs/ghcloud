<template>
  <div>
    <div class="chartData">
      <div class="water">
        <div v-for="(item,index) in hydraulics" class="chart-item">
          <liquidFillChart :data="item.value" :title="attrData[index]?.attributeName" :max="attrData[index]?.valueMax"></liquidFillChart>
          <span>{{attrData[index]?.attributeName}}：{{item.value}}㎡
            <i v-if="attrData[index]?.attributeUnitName">/{{attrData[index]?.attributeUnitName }}</i>
          </span>
        </div> 
      </div>
    </div>
  </div>
</template>

<script lang="jsx">
import {
  computed,
  defineComponent, getCurrentInstance, onBeforeMount,
  onMounted, reactive, ref, toRefs, watch
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import liquidFillChart from '@/views/pages/components/echart/liquidFillChart.vue'

export default defineComponent({
  components: {
    liquidFillChart
  },
  props: {
    attrData: {
      type: Object,
      default: []
    },
    attributeValue: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      hydraulics: [],
    });
    watch(() => props.attributeValue, (newVal) => {
      for (const key in props.attributeValue) {
        if (key === 'hydraulics') {
          state.hydraulics.push({
            code: key,
            value: props.attributeValue[key] ? parseInt(props.attributeValue[key]) : 0
          })
        }
      }
    }, { immediate: true, deep: true })
    return {
      ...toRefs(state),
    };
  },
});
</script>
<style scoped lang="less">
.chartData {
  .water,.waterLie {
    position: relative;
    width: 100%;
    margin-top: 5px;
    display: flex;
    justify-content: space-between;
    min-height: 300px;
    padding-bottom: 10px;
    .title {
      position: absolute;
      top: 5px;
      left: 5px;
    }
    div {
      position: relative;
      width: 300px;
      height: 300px;
      span {
        position: absolute;
        font-size: 16px;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100%;
        text-align: center;
        i{
          font-style: normal;
        }
      }
      &.box{
        width: 300px;
        height: 300px;
      }
    }
  }
}
</style>
