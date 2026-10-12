<template lang="pug">
app-page-layout(fix-header)
  div.notice_sett.abs-fit.overflow-auto
    div.config-form-item
      div.config-form-label 通知方式:
      div.config-form-input-wapper
        span(v-if="!startClock.noticeOptions.length") 当前场景未配置可使用的通知方式
        a-checkbox-group( v-else :options="startClock.noticeOptions" v-model:value="startClock.noticeWay")
    div.config-form-item
      div.config-form-label 通知内容:
      div.config-form-input-wapper 【商户名称】营业执照的期限已到期，请及时提醒商户办理并更新经营信息。
    div.config-form-item
      div.config-form-label 通知对象:
      div.config-form-input-wapper
      a-select(
        v-model="userIds"
        mode="multiple"
        :maxTagCount='5'
        placeholder="请选择人员"
        :style="{ minWidth: '300px' }"
      )
        a-select-option(
          v-for='item in userData'
          :key='item.userId'
          :value='item.userId'
          :label='item.name'
        ) {{ item.name }}
      a-button( type='primary' @click='showUserModal')
        span 选择人员
    div.m2
      a-button(type="primary" :loading="loading" @click="handleSubmit") 保存 
  UserModel(ref="userModel",@select-user="handleUser")
</template>

<script>
import UserModel from './modal/user-modal';

export default {
  components: { UserModel },
  data() {
    return {
      userData: [],
      userIds: [],
      loading: false,
      startClock: {
        value: 0,
        noticeWays: [],
        label: 'BUSINESS_TERM_NOTICE',
        sceneCode: 'BUSINESS_TERM_NOTICE',
        noticeOptions: []
      },
    };
  },
  created() {
    this.getData();
  },
  methods: {
    showUserModal(record) {
      this.$refs.userModel.show(record);
    },
    handleUser(val) {
      if (this.userData && this.userData.length > 0) {
        let newDatas = [...this.userData, ...val];
        let obj = {};
        this.userData = newDatas.reduce((cur, next) => {
          obj[next.userId] ? '' : (obj[next.userId] = true && cur.push(next));
          return cur;
        }, []);
      } else {
        this.userData = val;
      }
      this.userIds = this.userData.map((item) => {
        return item.userId;
      });
    },
    async satMsgChannels() {
      const res = await this.$restful(`GET:/message2/sat-msg-channels`);
      return res
    },
    async satMsgSceneReceive(code) {
      const res = await this.$restful(`GET:/message2/sat-msg-scene-receive/code/${code}`);
      return res
    },
    async sceneNotificationMethod(code) {
      const allChannels = await this.satMsgChannels()
      const selectChannels = await this.satMsgSceneReceive(code)
      const filteredData = allChannels.filter(item => selectChannels.channelCodes.includes(item.channelCode))
      return filteredData.map(e => {
        return {
          label: e.channelName,
          value: e.channelCode
        }
      })
    },
    async getData() {
      try {
        this.startClock.noticeOptions = await this.sceneNotificationMethod('BUSINESS_TERM_NOTICE')
        const data = await this.$restful('GET:/bracing/message/getConfigInfo', {
          businessType: 'MERCHANT',
          label: 'BUSINESS_TERM_NOTICE'
        });
        if (data.length > 0) {
          const list = data.filter(e => { return e.sceneCode === 'BUSINESS_TERM_NOTICE' && 'BUSINESS_TERM_NOTICE' }).map(e => {
            this.userIds = e.noticeObjs.length > 0 ? e.noticeObjs[0].objId.split(',') : []
            this.userData = e.noticeObjs.length > 0 ? JSON.parse(e.noticeObjs[0].objInfo) : []
            return {
              ...e,
              label: 'BUSINESS_TERM_NOTICE',
              noticeWay: e.noticeWays.map(e => e.noticeWay),
            }
          })
          this.startClock = { ...this.startClock, ...list[0] }
        } else {
          this.userIds = []
          this.userData = []
          this.startClock = {
            value: 0,
            noticeWays: [],
            label: 'BUSINESS_TERM_NOTICE',
            sceneCode: 'BUSINESS_TERM_NOTICE',
            noticeOptions: []
          }
        }

      } catch (error) {
      }
    },
    async handleSubmit() {
      this.loading = true
      this.$restful(`POST:/bracing/message/addConfig`, {
        businessType: 'MERCHANT',
        sceneConfigDTOS: [
          {
            label: 'BUSINESS_TERM_NOTICE',
            sceneCode: 'BUSINESS_TERM_NOTICE',
            noticeWays: this.startClock.noticeWay.map(ele => { return { noticeWay: ele } }),
            noticeObjs: this.userIds.length > 0 ? [
              {
                objId: this.userIds.join(','),
                objInfo: this.userIds.length > 0 ? JSON.stringify(this.userData.filter(e => this.userIds.includes(e.userId))) : [],
                objType: 'USER'
              }
            ] : []
          }
        ]
      }).then(() => {
        this.$message.success('保存成功!');
        this.getData();
      })
        .finally(() => {
          this.loading = false;
        });
    },
    back() {
      this.$router.push({ path: '' });
    },
  },
};
</script>

<style lang="less" scoped>
// 样式
.config-form-item {
  padding: 12px 24px;
  display: flex;
  align-items: center;
}

.config-form-label {
  min-width: 100px;
  padding-right: 12px;
}

.notice_sett {
  padding: 20px;

  .config_card {
    position: relative;
    border: 1px dashed #d9d9d9;
    margin: 10px;
    padding: 10px;
  }

  .close_icon {
    position: absolute;
    width: 30px;
    text-align: center;
    top: 1px;
    right: 0;
    color: #000;
    cursor: pointer;
  }
}
</style>
<style lang="less">
.notice_sett {
  .ant-form-item {
    display: flex;
    margin: 0 0 10px;
  }

  .ant-form-item-control-wrapper {
    width: 50%;
  }
}
</style>
