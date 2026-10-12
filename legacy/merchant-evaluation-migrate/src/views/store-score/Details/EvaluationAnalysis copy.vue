<template lang="pug">
.box
  .left
    .title 商户诚信经营占比分析
    div
      a-select.selectBox(v-model='selectDevice', @change='change()')
        a-select-option(
          :value='item.value',
          v-for='item in DeviceType',
          :key='item.name'
        ) {{ item.name }}
    //- .card-content(style="height: 500px")
    .chart-box
      a-skeleton(
        active,
        :paragraph='{ rows: 9 }',
        v-if='pies.list === undefined'
      )
      a-empty(v-if='pies.list.length == 0')
      CircleCenterNoText(
        v-else,
        :data='pies.list',
        name='评价次数',
        :totalNum='pies.total',
        :center='["30%", "34%"]'
      )
	span kajdi
</template>
<script>
import { colors } from '../colors/colors';
import CircleCenterNoText from '../charts/CircleCenterNoText';
import moment from 'moment';
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'CategoryAnalysis',
  components: { CircleCenterNoText },
  props: {
    id: String,
  },
  data() {
    return {
      colors: colors,
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
      totalArray: [], //所有数组
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    params() {
      return {
        timeRange: 'all',
        stallId: this.id,
        // demensionTime: this.demensionTime,
        projectId: this.project.id,
      };
    },
    pies() {
      return this.pie;
    },
  },
  watch: {
    params() {
      setTimeout(() => {
        this.getPieChartData();
      }, 10);
    },
  },
  created() {
    this.getPieChartData();
  },
  methods: {
    getPieChartData() {
      this.$restful(`GET:/project-merchant/stall-score-stat/honesty/radio`, {
        ...this.params,
      }).then((res) => {
        this.totalArray = res;
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
      });
    },
    // 切换
    change() {
      switch (this.selectDevice) {
        case 'z_score':
          var result = this.totalArray.filter((val) => val.name == 'z_score');
          this.pie = {
            name: '数量',
            total: result[0].count,
            list: result[0].manageTop10.map((item) => {
              return {
                name: item.name,
                value: item.count,
                ratio: item.radio,
              };
            }),
          };
          break;
        case 's_score':
          var result1 = this.totalArray.filter((val) => val.name == 's_score');
          this.pie = {
            name: '数量',
            total: result1[0].count,
            list: result1[0].manageTop10.map((item) => {
              return {
                name: item.name,
                value: item.count,
                ratio: item.radio,
              };
            }),
          };
          break;
        case 't_score':
          var result2 = this.totalArray.filter((val) => val.name == 't_score');
          this.pie = {
            name: '数量',
            total: result2[0].count,
            list: result2[0].manageTop10.map((item) => {
              return {
                name: item.name,
                value: item.count,
                ratio: item.radio,
              };
            }),
          };
          break;
        case 'w_score':
          var result3 = this.totalArray.filter((val) => val.name == 'w_score');
          this.pie = {
            name: '数量',
            total: result3[0].count,
            list: result3[0].manageTop10.map((item) => {
              return {
                name: item.name,
                value: item.count,
                ratio: item.radio,
              };
            }),
          };
          break;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .left {
    width: 48%;
    height: 100%;
    // background-color: pink;
    .chart-box {
      width: 100%;
      height: 400px;
    }
    .title {
      font-size: 18px;
      text-align: center;
      margin-top: 20px;
    }
    .selectBox {
      margin: 20px 0 0 450px;
    }
  }
  .center {
    width: 4%;
    height: 100%;
    // background-color: antiquewhite;
    .line {
      height: 60%;
      width: 3px;
      background-color: red;
    }
  }
  .right {
    width: 48%;
    height: 100%;
    background-color: burlywood;
  }
}
</style>
