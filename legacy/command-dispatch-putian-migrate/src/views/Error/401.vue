<template>
  <div class="errPage-container">
    <a-button icon="el-icon-arrow-left" class="pan-back-btn" @click="back">
      返回
    </a-button>
    <a-row>
      <a-col :span="12">
      
        <h2>你没有权限去该页面</h2>
     
        <ul class="list-unstyled">
         
          <li class="link-type">
            <router-link to="/dashboard"> 回首页 </router-link>
          </li>
       
        </ul>
      </a-col>
      <a-col :span="12">
        <img
          :src="errGif"
          width="313"
          height="428"
          alt="Girl has dropped her ice cream."
        />
      </a-col>
    </a-row>
    <a-modal v-model:visible="dialogVisible" title="随便看">
      <img :src="ewizardClap" class="pan-img" />
    </a-modal>
  </div>
</template>

<script>
const errGif = '/resource/v1/command-dispatch-putian-migrate/401_images/401.gif'

export default {
  name: "Page401",
  data() {
    return {
      errGif: errGif + "?" + +new Date(),
      ewizardClap:
        "https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646",
      dialogVisible: false,
    };
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.replace({ path: "/dashboard" });
      } else {
        this.$history.go(-1);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.errPage-container {
  width: 800px;
  max-width: 100%;
  margin: 100px auto;
  .pan-back-btn {
    background: #008489;
    color: #fff;
    border: none !important;
  }
  .pan-gif {
    margin: 0 auto;
    display: block;
  }
  .pan-img {
    display: block;
    margin: 0 auto;
    width: 100%;
  }
  .text-jumbo {
    font-size: 60px;
    font-weight: 700;
    color: #484848;
  }
  .list-unstyled {
    font-size: 14px;
    li {
      padding-bottom: 5px;
    }
    a {
      color: #008489;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
