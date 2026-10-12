<template lang="pug">
  div.worksheet
    .worksheet-main
      app-table-page-layout
        template(#toolbar-left)
          //- app-search(
          //- v-model="filters"
          //- :fields="filterFieleds"
          //-  @search="handleQuickSearch"
          //-   keywordPlaceholder='请输入关键字'
          //- )   
          //- a-button.ml2(@click="$refs.table.reload()") 刷新
        //- template(#toolbar-right)
        //-   a-button(
        //-     type='primary',
        //-     style='margin-left: 10px',
        //-     @click='exportClick'
        //-   ) 导出
        a-table(:columns="columns" :data-source="scoreData" rowKey='name')
          template(slot='score' slot-scope="text, record")
            a-input.score(v-model='record.score' @change='inputChange(record.score)' type='number')
            span.alter(v-if='record.score<=0||record.score>=1') 请输入0-1以内的数值
        div.mt1.p2.bg-white.left
          //- a-button() 取消
          a-button.ml1(type="primary" @click='save' :loading="loading") 保存
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
import moment from 'moment';
export default {
  // name: 'KeepAliveXxxx',
  components: {},
  data() {
    return {
      columns: [
        {
          title: '评价维度',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '权重占比',
          key: 'score',
          width: '70%',
          scopedSlots: { customRender: 'score' },
        },
      ],
      scoreData: [
        { name: '商品质量', score: 0.25, code: 'zRatio' },
        { name: '诚实守信', score: 0.25, code: 'sRatio' },
        { name: '环境卫生', score: 0.25, code: 'wRatio' },
        { name: '服务态度', score: 0.25, code: 'tRatio' },
      ],
      loading: false,
      updateId: '', //修改的时候有否则就没有
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  async created() {
    this.filterFieleds = [
      // {
      //   name: 'deptId',
      //   component: 'app-tree-select',
      //   width: '150px',
      //   uid: 'dept',
      //   placeholder: '选择档位',
      //   api: '/project-merchant/appeals/dept/auth/list',
      //   params: { projectId: this.project.id },
      //   // field:{},
      //   dataFormatter: (data) => {
      //     data[0].selectable = false;
      //     return data;
      //   },
      // },
      // {
      //   name: 'type',
      //   placeholder: '选择年份',
      //   component: 'app-dict-select',
      //   width: '150px',
      //   code: 'appealType',
      // },
      {
        name: 'rate',
        component: 'app-rate-range-select',
        width: '250px',
        uid: 'rate',
        placeholder: '请选择分值范围',
        unit: '',
        onChange: (val) => {
          this.filters.minScore = val[0];
          this.filters.maxScore = val[1];
        },
      },
      {
        name: 'timeYear', //回显的字段名称
        placeholder: '请选择年月',
        width: '200px',
        component: 'AppYearPicker',
        uid: 'timeYear',
        extraProp: {
          onlyCustom: true, //控制第一次是否执行
          onlyDate: true,
        },
      },
      // {
      //     name: 'timeRange',
      //     placeholder: '请选择时间范围',
      //     width: '500px',
      //     component: 'AppTimeRangeSelect',
      //     options: [{ code: 'custom', name: '自定义时间范围' }],
      //     field: { name: 'code', label: 'name'},
      //     extraProp: {
      //       onlyCustom: true,//控制第一次是否执行
      //       onlyDate: true,
      //     },
      // }
    ];
    this.loadCategorys();
  },
  methods: {
    moment,
    async loadCategorys() {
      const cates = await this.$restful('GET:/project-merchant/stall-evaluation-ratio', {
        projectId: this.project?.id,
      });
      if (cates) {
        this.updateId = cates.id;
        this.scoreData = [
          { name: '商品质量', score: cates.zRatio, code: 'zRatio' },
          { name: '诚实守信', score: cates.sRatio, code: 'sRatio' },
          { name: '环境卫生', score: cates.wRatio, code: 'wRatio' },
          { name: '服务态度', score: cates.tRatio, code: 'tRatio' },
        ];
      }
    },
    inputChange(score) {
      // setTimeout(()=>{
      // },3000)
    },
    save() {
      //做总分校验
      this.loading = true;
      let totalScore = 0;
      this.scoreData.map((item) => {
        totalScore = totalScore + parseFloat(item.score);
      });
      if (totalScore == 1) {
        let params = { id: this.updateId, projectId: this.project.id };
        this.scoreData.map((item) => {
          params[item.code] = item.score;
        });
        this.$restful(`POST:/project-merchant/stall-evaluation-ratio`, params)
          .then((res) => {
            (this.loading = false), this.$message.success('修改成功');
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        this.$message.error('总分应该为1');
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.worksheet {
  display: flex;
  height: 100%;
  overflow: hidden;
  flex-direction: column;
  .btn-tabs {
    flex: none;
  }
  .worksheet-main {
    flex: auto;
    overflow: hidden;
    position: relative;
  }
}
.score {
  width: 100px;
}
.alter {
  padding-left: 5px;
  color: rgb(204, 49, 49);
}
</style>
