<template lang="pug">
.analysis-card
  .card-title
    div 商户评价标签top10
    div 类型:
      a-select.selectBox(v-model='selectDevice', @change='change()')
        a-select-option(
          :value='item.value',
          v-for='item in DeviceType',
          :key='item.name'
        ) {{ item.name }}
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
      visualMapData: {
        yAxis: [],
      },
      selectDevice: '1',
      DeviceType: [
        { name: '商品质量', value: '1' },
        { name: '诚实守信', value: '2' },
        { name: '环境卫生', value: '3' },
        { name: '服务卫生', value: '4' },
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
      this.$restful(`GET:/project-merchant/stall-score-stat/tag/top10`, {
        ...this.params,
      }).then((res) => {
        let datas = (res[0] && res[0].manageTop10) ? [] : [];
        switch (selectDevice) {
          case '1':
            res.forEach((val) => {
              if (val.type == selectDevice) {
                datas = val.manageTop10 || [];
              }
            });
            break;
          case '2':
            res.forEach((val) => {
              if (val.type == selectDevice) {
                datas = val.manageTop10 || [];
              }
            });
            break;
          case '3':
            res.forEach((val) => {
              if (val.type == selectDevice) {
                datas = val.manageTop10 || [];
              }
            });
            break;
          case '4':
            res.forEach((val) => {
              if (val.type == selectDevice) {
                datas = val.manageTop10 || [];
              }
            });
            break;
        }
        const xAxis = datas.map((item) => item.name);
        const yAxis = [];
        const data = [];
        let max = 0;
        datas.forEach((item, xIndex) => {
          if (max < parseInt(item.count)) {
            max = item.count; ////x轴的范围值
          }
          data.push(item.count);
          yAxis.push(item.count);
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
        case '1':
          this.getChartData('1');
          break;
        case '2':
          this.getChartData('2');
          break;
        case '3':
          this.getChartData('3');
          break;
        case '4':
          this.getChartData('4');
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
