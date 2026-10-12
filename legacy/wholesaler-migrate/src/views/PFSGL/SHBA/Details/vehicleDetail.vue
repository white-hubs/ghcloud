<template lang="pug">
app-page-layout.no-bg-body(title='车辆备案详情', showHeader, fix-header)
  .my3.px3.abs-fit.overflow-auto
    a-row(:gutter='16')
      a-col(:sm='24')
        div
          app-card(title='基本信息')
            app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="90" :colspans="colspans")
    .footer-btns
      app-link-btn(@click='back')
        a-button 返回
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  name: 'detail',
  components: {},
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      companyData: [],
      fields: [
        {
          name: 'vehiclePlate',
          label: '车牌号',
        },
        {
          name: 'vehicleTypeName',
          label: '车型',
        },
        {
          name: 'color',
          label: '颜色',
        },
        {
          name: 'owner',
          label: '所属人',
        },
        {
          name: 'mobile',
          label: '联系电话',
        },
        {
          name: 'stallName',
          label: '所属档位',
        },
        {
          name: 'companyName',
          label: '所在商户',
        },
        {
          name: 'fileDTOS',
          label: '图片',
          render(h, r, v) {
            // return v?.length ? <app-files-display files={v} /> : '无';
            return v?.length ? (
              <app-imgs-display files={v} useCenterApi={true} />
            ) : (
              '无'
            );
          },
        },
        {
          name: 'createBy',
          label: '创建人',
        },
        {
          name: 'createTime',
          label: '创建时间',
        },
      ],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
    id() {
      const id = this.$route.params.id;
      return id;
    },
  },
  async created() {
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(
        `GET:/project-merchant/wholesaler-vehicle/${id}`,
        // {
        //   projectId: this.project.id,
        // },
      );
    },
    back() {
      this.$back();
    },
  },
};
</script>
<style lang="less" scoped>
.sqxx-container {
  height: 400px;
}

.sbxx-container {
  min-height: 100px;
  background-color: #fff;
}

.table_content {
  padding: 20px;
}

.mt16 {
  margin-top: 16px;
}

.footer-btns {
  margin: 16px 0;
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
