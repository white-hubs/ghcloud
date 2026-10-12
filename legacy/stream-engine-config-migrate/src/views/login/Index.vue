<template>
  <div class="loginCtr">
    <div class="proName">市场业务管理系统</div>
    <div class="proPanel">
      <div class="proPanel-icon">
        <img src="./image/logoIcon.png" alt="" />
      </div>
      <div class="proPanel-form">
        <div class="form-title">登录</div>
        <el-form
          name="custom-validation"
          ref="formRef"
          :model="formState"
          :rules="rules"
          v-bind="layout"
          :layout="'horizontal'"
          labelAlign="right"
        >
          <el-row :gatter="1">
            <el-col :span="24">
              <el-form-item
                label=""
                name="username"
                :wrapper-col="{ span: 24, offset: 0 }"
              >
                <el-input
                  v-model="formState.username"
                  type="text"
                  placeholder="账号"
                  allowClear
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item
                label=""
                name="password"
                :wrapper-col="{ span: 24, offset: 0 }"
              >
                <el-input
                  v-model="formState.password"
                  type="password"
                  placeholder="密码"
                  allowClear
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item :wrapper-col="{ span: 24, offset: 0 }">
                <el-button
                  type="primary"
                  @click="handleFinish"
                  :style="{ width: '100%', height: '42px', marginTop: '20px' }"
                  >登录</el-button
                >
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>
    <div class="copyright"></div>
    <el-dialog
      title="请选择要登录的企业"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      width="700px">
      <div class="dialogContent">
        <div v-for="item in tenantList" :key="item.id" @click="clickTenant(item)">
          <el-card shadow="always" >
              {{item.name}}
          </el-card>
        </div>

      </div>

    </el-dialog>
  </div>
</template>

<script>
import qs from "qs";
export default {
  name: "loginContainer",
  components: {},
  data() {
    return {
      formState: {
        username: "",
        password: "",
        verify: "",
        remberMe: false,
      },
      rules: {
        username: [
          {
            required: true,
            message: "请输入账号",
            trigger: "change",
          },
        ],
        password: [
          {
            required: true,
            message: "请填写密码",
            trigger: "change",
          },
        ],
        verify: [
          {
            required: true,
            message: "请输入验证码",
            trigger: "change",
          },
        ],
      },
      layout: {
        labelCol: {
          span: 4,
        },
        wrapperCol: {
          span: 14,
        },
      },
      dialogVisible:false,
      tenantList:[]
    };
  },
  methods: {
    handleFinish() {
         const params = qs.stringify({
            grant_type: "pwd",
            scope: "select",
            code: "1995",
            // ...model,
            username: this.formState.username,
            password: this.formState.password,
        });
      this.$store.dispatch("user/login", params).then(() => {
        this.getTenantList()
      });
    },
    async getTenantList(){
          const data = await this.$api.getTenant();
          this.tenantList = data
      if (data && data instanceof Array) {
        if (data.length === 0) {
          this.$message.warn("该用户未加入企业");
          sessionStorage.removeItem("token");
          return;
        } else if (data.length === 1) {
          this.$store.commit("user/SET_NOW_ENTERPRISE", JSON.stringify(data[0]));
          this.$router.push({ path: "/" });
        }
        // 多个企业
        else {
          // const index = data.findIndex((item) => item.mainEnterprise);
          // if (index !== -1) {
          //   this.$store.commit(
          //     "user/SET_NOW_ENTERPRISE",
          //     JSON.stringify(data[index])
          //   );
          //   this.$router.push({ path: "/" });
          // } else {
          // }
                      this.dialogVisible = true

        }
      } else {
        this.$message.warn("该用户未加入企业");
      }
    },
    clickTenant(item){
      this.$store.commit("user/SET_NOW_ENTERPRISE", JSON.stringify(item));
                  this.$router.push({ path: "/" });

    }

  },
};
</script>

<style lang="less" scoped>
.proPanel {
  width: 927px;
  height: 500px;
  background: #ffffff;
  box-shadow: 0px 4px 16px 1px rgba(0, 0, 0, 0.05000000074505806);
  border-radius: 0px 0px 0px 0px;
  opacity: 1;
  border: 1px solid #ffffff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  .proPanel-icon {
    width: 408px;
    height: 100%;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .proPanel-form {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .form-title {
      width: 100%;
      font-size: 24px;
      font-weight: 500;
      color: #262626;
      font-family: "PingFang SC-Medium";
      text-align: center;
    }
  }
}
.proName {
  font-family: "PingFang SC-Medium";
  font-size: 36px;
  font-weight: 500;
  color: #000000;
  position: fixed;
  top: calc(50% - 350px);
  left: 50%;
  transform: translate(-50%);
}
.copyright {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%);
  font-size: 12px;
  font-family: PingFang SC-Regular, PingFang SC;
  font-weight: 400;
}
.loginCtr {
  width: 100%;
  height: 100%;
  // background-color: rgba(24, 143, 255, 0.76);
  background: url("/resource/v1/legacy-admin/loginbackground.png") rgba(24, 143, 255, 0.76)
    no-repeat;
  // background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
  form {
    width: 355px;
    height: 360px;
    // flex: 1;
    background-color: #fff;
    border-radius: 7px;
    padding: 20px 38px;
    > div {
      width: 100%;
    }

    :deep(.ant-form-item-control-input) {
      min-height: 40px;
    }
    :deep(.ant-row.ant-form-item) {
      height: 40px;
      margin-bottom: 25px;
      div {
        height: 100%;
        text-align: left;
        > .ant-input-affix-wrapper {
          height: 100%;
        }
      }
    }
  }
  // :deep( .ant-form.ant-form-horizontal) {
  //   width: 100%;
  //   height: 100%;
  // }
}
.identify {
  display: flex;
  justify-content: space-between;
}
.dialogContent{
  max-height: 500px;
  overflow-y: scroll;
  >div{
    display: inline-block;
    width: 200px;
    margin: 10px;
    overflow: hidden;
    cursor: pointer;
  }
}
</style>