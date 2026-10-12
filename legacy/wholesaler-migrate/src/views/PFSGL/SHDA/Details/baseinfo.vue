<template lang="pug">
  div.p8
    div.base-container
      app-card(title="基本信息")
        app-card-base-info(:baseInfo="model" :fields="fields" :colspans="{sm: 24}" :labelWidth="140")
</template>
<script>
import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {},
  props: {
    id: String,
  },
  data() {
    return {
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      fields: [
        // { name: 'code', label: '编号' },
        { name: 'name', label: '商户名称' },
        { name: 'owner', label: '所属人姓名' },
        { 
          name: 'mobile',
          label: '电话号码',
          render(h, r, v) {
            const text = r.mobile ?? '';
            return text || '无';
          }
        },
        {
          name: 'spaces',
          label: '关联空间',
          render(h, r, v) {
            return v?.length ? v.map((item) => item.name).join(', ') : '无';
          },
        },
        {
          name: 'stallName',
          label: '所属档位',
          render(h, r, v) {
            const text = r.stallName ?? '';
            return text || '无';
          },
        },
        {
          name: 'securityFileVOS',
          label: '安全协议',
          render(h, r, v) {
            return v?.length ? (
              <app-files-display class="pt1" files={v} />
            ) : (
              '未签'
            );
          },
        },
        {
          name: 'trainingPhotoFileVOS',
          label: '安全培训照片',
          render(h, r, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
        {
          name: 'companyPhotoFileVOS',
          label: '商户灭火器/消防栓',
          render(h, r, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
        {
          name: 'businessLicenseFileVOS',
          label: '营业执照',
          render(h, r, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
        {
          name: 'longTerm',
          label: '营业期限',
          render(h, r, v) {
            const timeRange = r.startTime && r.endTime ? `${r.startTime} 至 ${r.endTime}` : '';
            const text = r.longTerm ? '长期' : timeRange;
            return text || '无';
          },
        },
        { 
          name: 'introduction',
          label: '经营信息',
          render(h, r, v) {
            const text = r.introduction ?? '';
            return text || '无';
          },
        },
        {
          name: 'companyFileIdsFileVOS',
          label: '附件',
          render(h, r, v) {
            return v?.length ? (
              <app-files-display class="pt1" files={v} />
            ) : (
              '无'
            );
          },
        },
        { 
          name: 'remark',
          label: '备注',
          render(h, r, v) {
            const text = r.remark ?? '';
            return text || '无';
          }
        },
      ],
      loading: false,
    };
  },
  computed: {
    ...mapGetters({
      project: GETTER_PROJECT,
    }),
  },
  async created() {
    this.loadModel(this.id);
  },
  methods: {
    async loadModel(id) {
      this.model = await this.$restful(`GET:/project-merchant/companies/${id}`, {
        projectId: this.project.id,
      });
    },
  },
};
</script>

<style lang="less" scoped>
.base-container,
.flow-container {
  min-height: 100px;
}

.device-container {
  min-height: 100px;
  background-color: #fff;
}

.p8 {
  padding: 0 8px;
}

.footer-btns {
  margin: 16px 0;
}
</style>
