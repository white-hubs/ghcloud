<!-- 物业收入汇总  -->
<template>
  <SubPanelTemplate>
    <div class="chart">
      <RingChart :pieData="pieData" seriesName="设备类型统计" :total="equipmentData.deviceNum"></RingChart>
    </div>
    <div class="statistic-lenged">
      <div class="statistic-item" v-for="(item, index) in pieData">
        <a-statistic :value="item.value" :valueStyle="statisticStyle">
          <template #title>
            <div class="title flex-start">
              <div class="box" :style="statisticValueStyle(index)"></div>
              <span>{{ item.name }}</span>
            </div>
          </template>
          <template #suffix>
            <span>{{ item.ratio }}</span>
          </template>
        </a-statistic>
      </div>
    </div>
  </SubPanelTemplate>
</template>

<script setup lang="ts">
import { ref, reactive,onMounted, computed} from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import RingChart from '../public/charts/ring/ring.vue';

const pieData = ref([
  {
    name:'水费',
    value:10,
    color:'#328BF7'
  },
  {
    name:'电费',
    value:20,
    color:'#19F8F7'
  },
  {
    name:'修缮费',
    value:30,
    color:'#FFC700'
  },
  {
    name:'物管费',
    value:40,
    color:'#EF424A'
  },
])
let equipmentData = reactive({
    deviceNum: 0,
})
const statisticValueStyle = computed(() => (index) => {
    return {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: pieData[index]?.color
    }
})
const statisticStyle = computed(() => {
    return {
        fontSize: '16px',
        color: '#FFFFFF',
        paddingLeft: '16px'
    }
})
</script>
<style lang="less" scoped>
.chart {
    height: 200px;
}
</style>