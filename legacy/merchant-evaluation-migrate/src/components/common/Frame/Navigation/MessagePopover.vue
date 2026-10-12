<template lang="pug">
a-popover(placement="bottom" overlayClassName="navigation-user-popover")
  a-badge(:count="notices.length + messages.length" dot @click="toMsgCenter" @mouseenter="loadMessageImmediately")
    a-icon(type="mail")
  div.msg-popover-head(slot="title")
    div.msg-tab(v-for="(ca, index) in categorys" :key="ca.name" 
    :class="{active: index === selectedCategoryIndex}"
    @click="handClick(index)") {{ ca.label }}    
    //- div.msg-tab 通知
  div.msg-popover-body(slot="content")
    template(v-if="categorys[selectedCategoryIndex].name === 'messages'")
      a-spin(:spinning="messageLoading")
        div.msg-popover-box(v-if="messages && messages.length")
          div.msg-popover-item(v-for="msg in messages" :key="msg.id" @click="markMessageReaded(msg)")
            div.white.flex-between
              span {{ msg.sender }}
              span.gray2.ml1
                app-time-form-now(:value="msg.sendTime")
            div.gray 
              span {{ msg.content }}
        div.msg-popover-nodata(v-else)
          span 暂时没有新的私信
        div.msg-popover-footer
          app-link-btn(:to="'/ywpt/message-center/messages'") 查看全部私信
          app-link-btn(v-if="messages && messages.length" @click="markAllMessageReaded") 标记当前页为已读 
    template(v-else-if="categorys[selectedCategoryIndex].name === 'notices'")
      a-spin(:spinning="noticeLoading")
        div.msg-popover-box(v-if="notices && notices.length")
          div.msg-popover-item(v-for="note in notices" :key="note.id" @click="markNoticeReaded(note)")
            div.white.flex-between
              span {{ note.title }}
              span.gray2.ml1
                app-time-form-now(:value="note.publishTime")
            div.gray 
              span {{ note.content }}
        div.msg-popover-nodata(v-else)
          span 暂时没有新的通知
        div.msg-popover-footer
          app-link-btn(:to="'/ywpt/message-center/notices'") 查看全部通知
          app-link-btn(v-if="notices && notices.length" @click="markAllNoticeReaded") 标记当前页为已读 
</template>
<script>
import { mapGetters } from 'vuex';
import { GETTER_USER, GETTER_PROJECT } from '@store/account';
import _ from 'lodash';
export default {
  data() {
    return {
      categorys: [
        { name: 'messages', label: '私信', api: '' },
        { name: 'notices', label: '通知', api: '' },
      ],
      selectedCategoryIndex: 1,
      messages: [],
      messageLoading: false,
      notices: [],
      noticeLoading: false,
    };
  },
  computed: {
    ...mapGetters({
      user: GETTER_USER,
      project: GETTER_PROJECT,
    }),
  },
  mounted() {
    this.$socket.on('message', (msg) => {
      // this.openNotification(msg);
      this.loadMessage();
    });
    this.$socket.on('notice', (notice) => {
      this.openNotification(notice);
      this.loadNotice();
    });
    this.loadMessage();
    this.loadNotice();
    // this.openNotification({ title: '时代感反馈', content: '哈哈哈哈哈哈' });
  },
  beforeDestroy() {
    this.$socket.off('message');
    this.$socket.off('notice');
  },
  methods: {
    handClick(index) {
      this.selectedCategoryIndex = index;
    },
    loadMessage: _.debounce(
      async function () {
        this.messageLoading = true;
        const res = await this.$restful(`GET:/sys/unread-messages/page`, {
          pageNum: 1,
          pageSize: 5,
          projectId: this.project.id,
          sort: 'sendTime,desc',
          orderby: 'sendTime,desc',
        });
        this.messages = res.records;
        this.messageLoading = false;
      },
      15000,
      { leading: true, trailing: false },
    ),
    async loadMessageImmediately() {
      this.messageLoading = true;
      const res = await this.$concurrentRestful(
        `GET:/sys/unread-messages/page`,
        {
          pageNum: 1,
          pageSize: 5,
          projectId: this.project.id,
          sort: 'sendTime,desc',
          orderby: 'sendTime,desc',
        },
      );
      this.messages = res.records;
      this.messageLoading = false;
    },
    loadNotice: _.debounce(
      async function () {
        this.noticeLoading = true;
        const res = await this.$restful(`GET:/sys/site-msgs/unread/page`, {
          pageNum: 1,
          pageSize: 5,
          projectId: this.project.id,
          sort: 'publishTime,desc',
          orderby: 'publishTime,desc',
        });
        this.notices = res.records;
        this.noticeLoading = false;
      },
      15000,
      { leading: true, trailing: false },
    ),
    // 标记为已读
    markMessageReaded(msg) {
      this.$restful(`PUT:/sys/message/${msg.id}`).then(() => {
        // this.$message.success('标记成功!');
        this.loadMessage();
      });
    },
    markAllMessageReaded() {
      this.messages.forEach((msg) => {
        // this.markMessageReaded(msg.id);
        this.$restful(`PUT:/sys/message/${msg.id}`);
        // this.$message.success('标记成功!');
      });
      this.loadMessage();
    },
    markNoticeReaded(note) {
      this.$restful(`POST:/sys/notice-acks/${note.id}`).then(() => {
        // this.$message.success('标记成功!');
        this.loadNotice();
        // 拼凑路由
        if (note.businessType && note.businessKey) {
          const urlMap = {
            ticketinst: `/ywpt/my-ticket/detail/${note.businessKey}/pending`,
            ticketinstTaskTimeOut: `/ywpt/my-ticket/detail/${note.businessKey}`,
            mainttask: `/ywpt/my-maint-task/detail/${note.businessKey}`,
            insptask: `/ywpt/my-insp-task/detail/${note.businessKey}`,
            campatrol: `/ywpt/patrol-video?id=${note.businessKey}&type=route`,
            appeal: `/ywpt/appeal/detail/${note.businessKey}`,
            fireinspTask: `/fireinsp/handle-task/${note.businessKey}`,
            // 'LINKAGE-EVENT': ``
            'device-limit': `/ywpt/device-book/detail/${note.businessKey}`,
            DeviceOfflineAlarm: `/ywpt/alarm-record-detail/${note.businessKey}`,
            link_alarm: `/ywpt/alarm-record-detail/${note.businessKey}`,
            ElectricalSafeAlarm: `/ywpt/alarm-record-detail/${note.businessKey}`,
          };
          if (urlMap[note.businessType]) {
            this.$router.push({
              path: urlMap[note.businessType],
            });
          }
        }
      });
    },
    markAllNoticeReaded() {
      const promises = [];
      this.notices.forEach((note) => {
        // this.markNoticeReaded(note.id);
        const promise = this.$restful(`POST:/sys/notice-acks/${note.id}`);
        promises.push(promise);
        // this.$message.success('标记成功!');
      });
      Promise.all(promises).then(() => {
        this.loadNotice();
        this.$message.success('标记成功!');
      });
    },
    toMsgCenter() {
      // this.$router.push({ path: '/ywpt/message-center' });
      this.$openMenu('myMessage');
    },
    openNotification(notice) {
      const key = 'notice';
      this.$notification.open({
        key,
        message: notice?.title || '你有新的消息',
        description: notice.name || '',
        onClick: () => {
          // this.markNoticeReaded(notice);
          this.$router.push({ path: '/ywpt/message-center' });
        },
      });
    },
  },
};
</script>
<style lang="less" scoped>
.msg-popover {
  &-head {
    width: 320px;
    margin: -5px -16px -6px;
    background-color: #99d3fc;
    // color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    .msg-tab {
      padding: 5px 16px 6px;
      cursor: pointer;
      color: #222223;
      &.active {
        color: #222223;
        background-color: #8abee3;
      }
    }
  }
  &-body {
    margin: -16px;
    margin-top: -12px;
    background-color: #8abee3;
    color: #222223;
    .msg-popover-box {
      padding: 1rem 0;
    }
    .msg-popover-item {
      font-size: 12px;
      width: 320px;
      padding: 0.75rem 2rem;
      cursor: pointer;
      .flex-between {
        // display: flex;
        // justify-content: space-between;
      }
      .gray {
        color: #383839;
      }
      .gray2 {
        color: #4e4e4f;
      }
      &:hover {
        background-color: fade(#222223, 10%);
      }
    }
    .msg-popover-nodata {
      padding: 4rem 2rem;
      text-align: center;
    }
    .msg-popover-footer {
      padding: 1rem 2rem;
      border-top: 1px solid fade(#222223, 10%);
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
<style lang="less">
.navigation-user-popover {
  .ant-popover-arrow {
    display: none;
  }
}
</style>
