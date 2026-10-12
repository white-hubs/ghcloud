<template lang="pug">
.analysis-card
  .card-title
    div 年度安全生产值TOP10
  .card-content
    .chart-box
      RankingBar(:data='visualMapData' v-if=' visualMapData.yAxis.length>0')
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
      visualMapData: { yAxis: [] },
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
    getChartData() {
      // /sft/electrical-overview/areas-heat
      this.$restful(`GET:/project-merchant/stall-score-stat/score/top10`, {
        ...this.params,
      }).then((res) => {
        const datas = res || [];
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
</style>
