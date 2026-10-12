<template lang="pug">
app-page-layout(title="登录日志详情" show-header fix-header)
  a-spin.abs-center(v-if="!model")
  a-row.p3(:gutter="16" v-else)
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="登录账号")
        span {{model.username}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="登录IP")
        span {{model.ip}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="登录地点")
        span {{model.location}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="浏览器名称")
        span {{model.browserName}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="浏览器版本")
        span {{model.browserVersion}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="操作系统")
        span {{model.os}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="浏览器类型")
        span {{model.device}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="是否成功")
        a-tag(color="#87d068" v-if="model.succeed") 成功
        a-tag(color="#F50" v-else) 失败
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="提示消息")
        span {{model.msg}}
    a-col(:lg="12" :xxl="8")
      app-detail-item(label="访问时间")
        app-date-display(:date="model.loginTime" format="YYYY-MM-DD HH:mm:ss")
</template>
<script>
export default {
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
        this.model = await this.$restful(`/sys/login-logs/${id}`);
      } else {
        this.model = null;
      }
    },
  },
};
</script>
