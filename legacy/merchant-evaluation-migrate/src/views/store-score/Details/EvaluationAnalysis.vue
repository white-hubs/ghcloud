<template>
  <div class="box">
    <div class="left">
      <div class="title">商户诚信经营占比分析</div>
      <div class="selectBox">
        <a-select
          v-model="selectDevice"
          @change="change"
          :options="DeviceType"
          :getPopupContainer="(triggerNode) => triggerNode.parentNode"
        >
        </a-select>
      </div>

      <div class="chart-box">
        <a-skeleton
          v-if="pies.list === undefined"
          active
          :paragraph="{ rows: 9 }"
        ></a-skeleton>
        <a-empty v-if="pies.list.length == 0"></a-empty>
        <CircleCenterNoText
          v-else
          :data="pies.list"
          name="评价次数"
          :totalNum="pies.total"
          :center="['30%', '34%']"
        ></CircleCenterNoText>
      </div>
    </div>
    <div class="center">
      <div class="line"></div>
    </div>
    <div class="right">
      <div class="text" v-for="(item, index) in evaluationList" :key="index">
        <div>
          {{ evaluationName }}收到了<span> {{ item.count }} </span>次{{
            item.type
          }}星评价<template v-if="item.tags">
            ，多数采购商表示{{ evaluationName }}：<span
              v-for="(tages, index) in item.tags"
              :key="index"
              >{{ tages }}；</span
            >
          </template>
        </div>
      </div>
    </div>
  </div>
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
        { label: '商品质量', value: 'z_score' },
        { label: '诚实守信', value: 's_score' },
        { label: '服务态度', value: 't_score' },
        { label: '环境卫生', value: 'w_score' },
      ],
      totalArray: [], //所有数组
      evaluationList: [], //评价
      evaluationName: '商品质量', //评价姓名
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
        examineStatus: 1,
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
    this.getevaluation('z_score');
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
          this.getevaluation('z_score');
          this.evaluationName = '商品质量';
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
          this.getevaluation('s_score');
          this.evaluationName = '诚实守信';
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
          this.getevaluation('t_score');
          this.evaluationName = '服务态度';
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
          this.getevaluation('w_score');
          this.evaluationName = '环境卫生';
          break;
      }
    },
    //获取评价
    getevaluation(str) {
      this.$restful(`GET:/project-merchant/stall-score-stat/stall/tag-analysis`, {
        stallId: this.id,
        projectId: this.project.id,
        type: str,
      }).then((res) => {
        this.$nextTick(() => {
          this.evaluationList = res;
        });
      });
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
      height: 50%;
      width: 1px;
      background-color: #ccc;
      margin-top: 30px;
    }
  }
  .right {
    width: 48%;
    height: 100%;
    // background-color: burlywood;
    padding-top: 120px;
    box-sizing: border-box;
    .text {
      margin-bottom: 10px;
      span {
        color: rgb(59, 161, 255);
      }
    }
  }
}
</style>
