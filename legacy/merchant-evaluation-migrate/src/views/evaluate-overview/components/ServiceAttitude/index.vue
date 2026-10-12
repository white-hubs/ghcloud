<template lang="pug">
.analysis-card
  .card-title
    div 商户诚信经营占比分析
    div 类型:
      a-select.selectBox(v-model='selectDevice', @change='change()')
        a-select-option(
          :value='item.value',
          v-for='item in DeviceType',
          :key='item.name'
        ) {{ item.name }}
  .card-content(style='height: 500px')
    .chart-box
      a-skeleton(
        active,
        :paragraph='{ rows: 9 }',
        v-if='pie.list === undefined'
      )
      a-empty(v-if='pie.list.length == 0')
      CircleCenterNoText(
        v-else,
        :data='pie.list',
        name='评价次数',
        :totalNum='pie.total',
        :center='["30%", "50%"]'
      )
</template>

<script>
import { colors } from '../../colors/colors';
import CircleCenterNoText from '../../charts/CircleCenterNoText';
import moment from 'moment';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'CategoryAnalysis',
  components: { CircleCenterNoText },
  props: {
    filters: Object,
  },
  data() {
    return {
      colors: colors,
      units: [
        //hour、day、month、year
        { code: 'hour', name: '时' },
        { code: 'day', name: '日' },
        { code: 'month', name: '月' },
        { code: 'year', name: '年' },
      ],
      demensionTime: 'hour',
      pie: {
        //
        list: [],
        name: '数量',
      },
      selectDevice: 'z_score',
      DeviceType: [
        { name: '商品质量', value: 'z_score' },
        { name: '诚实守信', value: 's_score' },
        { name: '服务态度', value: 't_score' },
        { name: '环境卫生', value: 'w_score' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        ...this.filters,
        // demensionTime: this.demensionTime,
        projectId: this.project?.id,
      };
    },
  },
  watch: {
    params() {
      setTimeout(() => {
        this.getPieChartData();
      }, 10);
    },
    filters() {
      if (this.filters.beginTime && this.filters.endTime) {
        const diff = moment(this.filters.endTime).diff(
          moment(this.filters.beginTime),
          'hours',
        );
        if (diff > 24 * 3) {
          this.demensionTime = 'day';
          this.units = [
            // { code: 'hour', name: '时' },
            { code: 'day', name: '日' },
            { code: 'month', name: '月' },
            { code: 'year', name: '年' },
          ];
          if (diff > 24 * 30 * 3) {
            this.demensionTime = 'month';
            this.units = [
              // { code: 'hour', name: '时' },
              // { code: 'day', name: '日' },
              { code: 'month', name: '月' },
              { code: 'year', name: '年' },
            ];
          }
          if (diff > 24 * 30 * 3 * 12) {
            this.demensionTime = 'year';
            this.units = [
              // { code: 'hour', name: '时' },
              // { code: 'day', name: '日' },
              // { code: 'month', name: '月' },
              { code: 'year', name: '年' },
            ];
          }
        }
      }
    },
  },
  created() {
    this.getPieChartData('z_score');
  },
  methods: {
    getPieChartData(selectDevice) {
      this.$restful(`GET:/project-merchant/stall-score-stat/honesty/radio`, {
        ...this.params,
        ...this.filters,
      }).then((res) => {
        // 初始化
        this.pie = {
          name: '数量',
          total: res[0].count,
          list: res[0].manageTop10.map((item) => {
            return {
              name: item.name,
              value: item.count,
              ratio: item.radio,
            };
          }),
        };
        // 判断切换
        switch (selectDevice) {
          case 'z_score':
            res.forEach((val) => {
              if (val.name == selectDevice) {
                this.pie = {
                  name: '数量',
                  total: val.count,
                  list: val.manageTop10.map((item) => {
                    return {
                      name: item.name,
                      value: item.count,
                      ratio: item.radio,
                    };
                  }),
                };
              }
            });
            break;
          case 's_score':
            res.forEach((val) => {
              if (val.name == selectDevice) {
                this.pie = {
                  name: '数量',
                  total: val.count,
                  list: val.manageTop10.map((item) => {
                    return {
                      name: item.name,
                      value: item.count,
                      ratio: item.radio,
                    };
                  }),
                };
              }
            });
            break;
          case 't_score':
            res.forEach((val) => {
              if (val.name == selectDevice) {
                this.pie = {
                  name: '数量',
                  total: val.count,
                  list: val.manageTop10.map((item) => {
                    return {
                      name: item.name,
                      value: item.count,
                      ratio: item.radio,
                    };
                  }),
                };
              }
            });
            break;
          case 'w_score':
            res.forEach((val) => {
              if (val.name == selectDevice) {
                this.pie = {
                  name: '数量',
                  total: val.count,
                  list: val.manageTop10.map((item) => {
                    return {
                      name: item.name,
                      value: item.count,
                      ratio: item.radio,
                      riskNum: 0,
                    };
                  }),
                };
              }
            });
            break;
        }
      });
    },
    change() {
      switch (this.selectDevice) {
        case 'z_score':
          this.getPieChartData('z_score');
          break;
        case 's_score':
          this.getPieChartData('s_score');
          break;
        case 't_score':
          this.getPieChartData('t_score');
          break;
        case 'attitudeTop10':
          this.getPieChartData('attitudeTop10');
          break;
        case 'w_score':
          this.getPieChartData('w_score');
          break;
      }
    },
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
  .mini_box {
    height: 100%;
    overflow: hidden;
    gap: 24px;
    .mini_min_box {
      height: 100%;
      flex: 1;
      display: flex;
      flex-direction: column;
      .rank_list {
        flex: 1;
        overflow: auto;
      }
      // gap: 12px;
    }
  }
}
.selectBox {
  margin-left: 3px;
  width: 110px;
}
</style>
