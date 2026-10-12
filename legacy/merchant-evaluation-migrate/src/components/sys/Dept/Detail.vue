<template lang="pug">
div
  div
    app-detail-item(label="所属部门")
      app-dept-display(:id="model&&model.parentId")
  div
    app-detail-item(label="名称")
      span {{model&&model.name}}
  div
    app-detail-item(label="负责人")
      app-user-display(:id="model&&model.managerId")
  div
    app-detail-item(label="分管领导")
      app-user-display(:id="model&&model.leaderId")
  div
    app-detail-item(label="备注")
      span {{model&&model.remark}}
</template>
<script>
export default {
  props: {
    model: Object,
  },
};
</script>
