<template lang="pug">
  .fire-stat-analysis
    .flex.align-center.mb3
      .timeItem
        div(v-for='item in selectTime' :key='item.time')
          .title( v-if='currentTime!=item.time' @click='changeTime(item.time)') {{item.text}}
          .selectTime(v-else ) {{item.text}}
      app-search(
        v-model='filters',
        :fields='filterFieleds',
        @search='handleQuickSearch',
        hideKeyword
      )
    //- .dashboard-row(style='height: 550px')
    //-   .dashboard-card.ant-card
    //-     ProductionValue(:filters='filters' ref='table')
    //-   .dashboard-card.ant-card
    //-     ProductionDeduction(:filters='filters')
    .dashboard-row(style='height: 550px')
      .dashboard-card.ant-card
        CommodityQuality(:filters='filters')
      .dashboard-card.ant-card
        HonestToGod(:filters='filters')
    .dashboard-row(style='height: 550px')
      .dashboard-card.ant-card
        ServiceAttitude(:filters='filters')
      .dashboard-card.ant-card
        EnvironmentalHealth(:filters='filters')
  </template>
  <script>
  import ProductionValue from './components/ProductionValue';
  import ProductionDeduction from './components/ProductionDeduction';
  import CommodityQuality from './components/CommodityQuality';
  import HonestToGod from './components/HonestToGod'; //
  import ServiceAttitude from './components/ServiceAttitude';
  import EnvironmentalHealth from './components/EnvironmentalHealth';
  import moment from 'moment';
  import { GETTER_PROJECT,LOAD_CURRENT_PROJECT } from '@store/account';
  import { mapGetters } from 'vuex';
  export default {
    components: {
      ProductionValue,
      ProductionDeduction,
      CommodityQuality,
      HonestToGod,
      ServiceAttitude,
      EnvironmentalHealth,
    },
    data() {
      return {
        loading: false,
        // 筛选
        filters: {
          timeRange: 'all',
          beginTime: null,
          endTime: null,
        },
        filterFieleds: [],
        selectTime: [
          { time: 'today', text: '今天' },
          { time: 'week', text: '本周' },
          { time: 'month', text: '本月' },
          { time: '3months', text: '近3月' }, //season 季
          { time: 'year', text: '今年' },
          { time: 'lastYear', text: '去年' },
          { time: 'all', text: '所有' },
        ],
        currentTime: 'all',
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
    async created() {
      this.initFilters();
    },
    methods: {
      handleQuickSearch() {},
      initFilters() {
        this.filterFieleds = [
          {
            // name: 'timeRange',
            // beginTime: 'beginTime',
            // endTime: 'endTime',
            // placeholder: '请选择时间范围',
            // width: '500px',
            // component: 'AppTimeRangeSelect',
            // options: [
            //   { code: 'today', name: '今天' },
            //   { code: 'week', name: '本周' },
            //   { code: 'month', name: '本月' },
            //   { code: 'year', name: '本年' },
            //   { code: 'all', name: '所有' },
            //   { code: 'custom', name: '自定义时间范围' },
            // ],
            // field: { name: 'code', label: 'name' },
            // onlyDate: true,
            // dateRange: [this.filters.dateRange],
            // allowClear: false,
            // extraProp: {
            //   // onlyCustom: true,
            //   // onlyDate: true,
            //   // showTime: true,
            // },
            name: 'timeRange',
            placeholder: '请选择时间范围',
            width: '500px',
            component: 'AppTimeRangeSelect',
            options: [{ code: 'custom', name: '自定义时间范围' }],
            field: { name: 'code', label: 'name' },
            extraProp: {
              onlyCustom: true, //控制第一次是否执行
              onlyDate: true,
            },
            onChange: (e) => {
              if (Array.isArray(e)) {
                this.filters.timeRange = 'custom';
                this.filters.beginTime =
                  e[0] || moment().format('YYYY-MM-DD 00:00:00');
                this.filters.endTime =
                  e[1] || moment().format('YYYY-MM-DD 23:59:59');
                // this.filters.dateRange =
              } else if (e === 'custom') {
                this.filters.beginTime = moment().format('YYYY-MM-DD 00:00:00');
                this.filters.endTime = moment().format('YYYY-MM-DD 23:59:59');
              } else {
                this.filters.beginTime = null;
                this.filters.endTime = null;
              }
            },
          },
        ];
      },
      //选择时间
      changeTime(time) {
        this.currentTime = time;
        this.filters.timeRange = time;
      },
    },
  };
  </script>
  <style lang="less" scoped>
  .fire-stat-analysis {
    height: 100%;
    overflow: auto;
    background-color: #f0f2f5;
  }
  .timeItem {
    // background-color: yellow;
    // width: 400px;
    // height: 32px;
    display: flex;
    .title,
    .selectTime {
      line-height: 30px;
      border-radius: 2px;
      margin: 0 5px;
      border: 1px solid #d9d9d9;
      padding: 0 8px;
      cursor: pointer;
    }
    .selectTime {
      background-color: #1890ff;
      color: white;
    }
  }
  </style>
  <style lang="less">
  .fire-stat-analysis {
    .dashboard-row {
      display: flex;
      gap: 24px;
      & + .dashboard-row {
        margin-top: 24px;
      }
    }
    .dashboard-card {
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      background-color: #fff;
      border-radius: 2px;
      flex: 1;
      height: 100%;
      width: 100%;
      overflow: hidden;
      .card-title {
        min-height: 57px;
        // margin-bottom: -1px;
        color: rgba(0, 0, 0, 0.85);
        font-weight: 500;
        font-size: 16px;
        padding: 12px 24px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
  </style>
  