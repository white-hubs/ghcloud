<template>
  <transition name="router-fade" mode="out-in">
    <router-view />
  </transition>
</template>

<script>

export default {
  components: {},
  data() {
    return {}
  },
  mounted() {

  },
  methods: {

  }
}
</script>
<style lang="less">
@import "@/assets/global";

#app {
  height: 100%;
  width: 100%;
}

:focus {
  outline: -webkit-focus-ring-color auto 0px;
}

body {
  margin: 0;
  min-width: 500px;
  background-color: #f5f6f6;
}

body,
html {
  margin: 0;
  height: 100%;
}

ul {
  padding: 0;
  margin: 0;

  li {
    list-style-type: none;
  }
}

.ov-tip {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-desc {
  font-size: small;
  color: #5e5e5e;
}

.max-fill {
  width: 100% !important;
}
</style>
