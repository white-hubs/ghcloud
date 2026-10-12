<template lang="pug">
.analysis-card
  .card-title
    div 商户诚信经营垫底 TOP10
    div 类型:
      a-select.selectBox(v-model='selectDevice' @change='change()')
        a-select-option(
          :value='item.value',
          v-for='item in DeviceType',
          :key='item.name'
        ) {{ item.name }}
  .card-content
    .chart-box
      RankingBar(:data='visualMapData', v-if='visualMapData.yAxis.length > 0')
      a-empty(v-else)
</template>

<script>
import { colors } from '../../colors/colors';
import RankingBar from '../../charts/RankingBarNew';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'CategoryAnalysis',
  components: { RankingBar },
  props: {
    filters: Object,
  },
  data() {
    return {
      colors: colors,
      visualMapData: {
        yAxis: [],
      },
      selectDevice: 'manageTop10',
      DeviceType: [
        { name: '诚信经营', value: 'manageTop10' },
        { name: '商品质量', value: 'qualityTop10' },
        { name: '诚实守信', value: 'honestyTop10' },
        { name: '服务态度', value: 'attitudeTop10' },
        { name: '环境卫生', value: 'envTop10' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return { projectId: this.project?.id, ...this.filters };
    },
  },
  watch: {
    params: 'getChartData',
  },
  created() {
    this.getChartData();
  },
  methods: {
    getChartData(selectDevice) {
      // /sft/electrical-overview/areas-heat
      this.$restful(
        `GET:/project-merchant/stall-score-stat/evaluation/top10?reverseOrder=true`,
        {
          ...this.params,
        },
      ).then((res) => {
        // 匹配不同的图表
        let datas = res.manageTop10 || [];
        switch (selectDevice) {
          case 'manageTop10':
            datas = res.manageTop10 || [];
            break;
          case 'qualityTop10':
            datas = res.qualityTop10 || [];
            break;
          case 'honestyTop10':
            datas = res.honestyTop10 || [];
            break;
          case 'attitudeTop10':
            datas = res.attitudeTop10 || [];
            break;
          case 'envTop10':
            datas = res.envTop10 || [];
            break;
        }

        const xAxis = datas.map((item) => item.name);
        const yAxis = [];
        const data = [];
        let max = 0;
        datas.forEach((item, xIndex) => {
          if (max < parseInt(item.score)) {
            max = item.score; ////x轴的范围值
          }
          data.push(item.score);
          yAxis.push(item.score);
        });

        this.visualMapData = {
          xAxis: xAxis,
          yAxis: yAxis,
          max: max,
          series: [
            {
              // name: tab.label + '数',
              name: 'visualMapData',
              type: 'heatmap',
              data: data,
            },
          ],
        };
      });
    },
    // 切换更改
    change() {
      switch (this.selectDevice) {
        case 'manageTop10':
          this.getChartData('manageTop10');
          break;
        case 'qualityTop10':
          this.getChartData('qualityTop10');
          break;
        case 'honestyTop10':
          this.getChartData('honestyTop10');
          break;
        case 'attitudeTop10':
          this.getChartData('attitudeTop10');
          break;
        case 'envTop10':
          this.getChartData('envTop10');
          break;
      }
    },
    // handleClickArea (areaIds) {
    //   if (areaIds && areaIds.length) {
    //     let url = new URLSearchParams('');
    //     Object.keys(this.filters).forEach((k) => {
    //       if (this.filters[k]) {
    //         url.set(k, this.filters[k]);
    //       }
    //     });
    //     url.set('areaId', areaIds[1]);
    //     this.$openTab({
    //       url: `/fireinsp/records?${url.toString()}`,
    //     });
    //   }
    // },
  },
};
</script>

<style lang="less" scoped>
.analysis-card {
  width: 100%;
  height: 100%;
  .chart-box {
    height: 100%;
    padding: 24px;
  }
}
.selectBox {
  margin-left: 3px;
  width: 110px;
}
</style>
