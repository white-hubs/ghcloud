<template lang="pug">
app-page-layout(title="操作日志详情" show-header fix-header)
  a-spin.abs-center(v-if="!model")
  a-row.p3(:gutter="16" v-else)
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="模块标题")
        span {{model&&model.title}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="业务类型")
        app-enum-display(code="LogBusinessType" :value="model&&model.businessType")
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="方法名称")
        span {{model&&model.method}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="请求方式")
        span {{model&&model.requestMethod}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作终端类别 0=其它,1=PC,2=APP（安卓）,3=APP（苹果）")
        app-enum-display(code="TerminalType" :value="model&&model.terminalType")
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作人员")
        span {{model&&model.username}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="请求URL")
        span {{model&&model.url}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="终端IP")
        span {{model&&model.ip}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作地点")
        span {{model&&model.location}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="请求参数")
        span {{model&&model.params}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作状态")
        LogStatus(v-if="model" :value="model.status")
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作时间")
        app-date-display(:date="model && model.time" format="YYYY-MM-DD HH:mm:yy")
    a-col(:span="24")
      app-detail-item(label="错误消息")
        span {{model&&model.errorMsg}}
</template>
<script>
import LogStatus from './StatusDisplay';
export default {
  components: { LogStatus },
  data() {
    return {
      model: null,
    };
  },
  created() {
    const id = this.$route.params.id;
    this.loadModel(id);
  },
  methods: {
    async loadModel(id) {
      if (id) {
        this.model = await this.$restful(`/sys/operation-logs/${id}`);
      } else {
        this.model = null;
      }
    },
  },
};
</script>
