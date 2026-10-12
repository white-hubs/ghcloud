<template lang="pug">
.analysis-card
  .card-title
    div 环境卫生TOP10
  .card-content
    .chart-box
      RankingBar(:data='visualMapData')
</template>

<script>
import { colors } from '../../colors/colors';
import RankingBar from '../../charts/RankingBar';
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
      visualMapData: {},
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return { projectId: this.project.id, ...this.filters };
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
      this.$restful(`GET:/sft/electrical-overview/areas-heat`, {
        ...this.params,
      }).then((res) => {
        const datas = res.datas || [];
        const xAxis = datas.map((item) => item.name);
        const yAxis = [];
        const data = [];
        let max = 0;
        datas.forEach((item, xIndex) => {
          item.childrenData.forEach((obj, yIndex) => {
            if (yIndex + 1 > yAxis.length) {
              yAxis.push(yIndex);
            }
            max = max < obj.num ? obj.num : max;
            data.push([
              xIndex,
              yIndex,
              obj.num,
              obj,
              { name: item.name, code: item.code },
            ]);
          });
        });
        // 补起
        if (xAxis.length < 18) {
          for (let i = xAxis.length; i < 18; i++) {
            xAxis.push(' ');
          }
        }
        if (yAxis.length < 10) {
          for (let i = yAxis.length; i < 10; i++) {
            yAxis.push(i);
          }
        }
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
