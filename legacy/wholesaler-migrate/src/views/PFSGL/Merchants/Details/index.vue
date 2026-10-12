<template lang="pug">
app-page-layout(fix-header)
  a-tabs(:tabBarGutter="36" :tabBarStyle="{padding: '0 12px'}" default-active-key="basic")
    a-tab-pane(key="basic" tab="基础信息")
      div.tab-pane-container
        .px2(style="height: 100%;overflow: auto;")
          a-row(:gutter='16')
            a-col(:sm='12')
              div
                app-card(title='基本信息')
                  app-card-base-info(:baseInfo="model" :fields="fields" :labelWidth="140")
            a-col(:sm='12')
              app-card(title='员工列表')
                div.p2
                  div.user-table-header
                    div.user-name
                      span 姓名
                    div.user-role
                      span 身份
                    div.user-role
                      span 操作
                  div.user-table-body(v-if="model.companyUserDTOS && model.companyUserDTOS.length")
                    div.user-table-row(v-for="user in model.companyUserDTOS" :key="user.id")
                      div.user-name
                        span {{user.nickname}}
                      div.user-role
                        span {{user.owner ? '档主' : '从业人员'}}
                      div.user-role
                        app-link-btn-delete(@confirm="(cb) => handleDelete(user, cb)") 删除
                  a-empty.p2(v-else)
    a-tab-pane(key="appeal" tab="诉求记录")
      div.tab-pane-container
        store(:companyId="id")
</template>
<script>
import store from './store';

import { GETTER_PROJECT } from '@store/account';
import { mapGetters } from 'vuex';
export default {
  components: {
    store,
  },
  data() {
    return {
      tabList: [
        { label: '基础信息', name: 'basic' },
        { label: '诉求记录', name: 'appeal' },
      ],
      colspans: {
        md: 8,
        sm: 12,
      },
      model: {},
      fields: [
        { name: 'name', label: '商户名称' },
        { name: 'owner', label: '所属人姓名' },
        { name: 'mobile', label: '电话号码' },
        {
          name: 'spaces',
          label: '关联空间',
          render(h, r, v) {
            return v?.length ? v.map((item) => item.name).join(', ') : '无';
          },
        },
        {
          name: 'securityFileDTOS',
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
          name: 'trainingPhotoFileDTOS',
          label: '安全培训照片',
          render(h, r, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
        {
          name: 'companyPhotoFileDTOS',
          label: '商户灭火器/消防栓',
          render(h, r, v) {
            return v?.length ? <app-imgs-display files={v} /> : '无';
          },
        },
        { name: 'introduction', label: '经营信息' },
        { name: 'remark', label: '备注' },
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
      this.model = await this.$restful(`GET:/project-merchant/companies/${id}`, {
        projectId: this.project.id,
      });
    },
    async handleDelete(user, cb) {
      await this.$restful(`delete:/centerApi/sys/users/${user.userId}`);
      await this.$restful(`delete:/project-merchant/companies/user`, {
        companyId: user.companyId,
        // stallId: user.stallId,
        userId: user.userId,
      });
      this.$message.success('移除成功!');
      await this.loadModel(this.id);
      cb();
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
.mt16 {
  margin-top: 16px;
}
.footer-btns {
  margin: 16px 0;
}
// 员工列表
.user-table-header,
.user-table-row {
  display: flex;
  align-items: center;
  .user-name,
  .user-role {
    width: 33.333%;
    padding: 8px 12px;
    border-bottom: 1px solid #efefef;
  }
}
.user-table-header {
  > div {
    font-weight: 600;
    background-color: #efefef;
  }
}
</style>
<style lang="less">
.no-bg-body {
  .body {
    background-color: transparent !important;
  }
}
</style>
