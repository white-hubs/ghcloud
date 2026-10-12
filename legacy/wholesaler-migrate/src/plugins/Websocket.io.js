import _ from 'lodash';
import Vue from 'vue';
// import VueSocketIO from 'vue-socket.io';
// import socketio from 'socket.io-client';
import { getToken } from '@/services/AccountService';
export default async () => {
  const token = await getToken();
  // Vue.use(
  //   new VueSocketIO({
  //     debug: true,
  //     connection: socketio(
  //       'ws://', // 只是ws前缀
  //       {
  //         path: '/api/sys/websocket/msg',
  //         transports: ['websocket'],
  //         autoConnect: false,
  //         reconnection: false,
  //         reconnectionDelay: 10000,
  //         upgrade: true,
  //         query: {
  //           token: token.access_token,
  //         },
  //       },
  //     ),
  //     vuex: {},
  //   }),
  // );
  let socket;
  let listeners = {};
  function bindSocketEvent(socket) {
    socket.onopen = () => {
      // 心跳
      setInterval(() => {
        if (socket) {
          socket.send('heartbeat');
        } else {
          reconnect();
        }
      }, 30000);
    };
    socket.onclose = () => {
      socket = null;
      reconnect();
    };
    socket.onerror = (e) => {
      socket = null;
      reconnect();
    };

    // 绑定事件
    socket.on = (eventName, fun) => {
      if (!listeners[eventName]) {
        listeners[eventName] = [];
      }
      if (listeners[eventName].indexOf(fun) === -1) {
        listeners[eventName].push(fun);
      }
    };
    // 解绑事件
    socket.off = (eventName, fun) => {
      if (listeners[eventName]?.length) {
        if (!fun) {
          listeners[eventName] = [];
        } else {
          const index = listeners[eventName].indexOf(fun);
          listeners[eventName].splice(index, 1);
        }
      }
    };
    socket.onmessage = (msg) => {
      // debugger;
      const { event, data, popup } = JSON.parse(msg.data);
      listeners[event]?.forEach((fun) => {
        fun({ ...data, popup });
      });
    };
  }
  function connect() {
    if (Vue.prototype.$socket) {
      Vue.prototype.$socket?.close();
    }
    socket = new WebSocket(
      (location.protocol === 'https:' ? 'wss://' : 'ws://') +
        location.host +
        '/api/sys/websocket/msg?token=' +
        token.access_token,
    );
    bindSocketEvent(socket);
    Vue.prototype.$socket = socket;
  }
  const reconnect = _.debounce(function () {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    try {
      if (Vue.prototype.$socket) {
        Vue.prototype.$socket?.close();
      }
      connect();
    } catch (e) {
    }
  }, 15000);

  connect();
  return socket;
};
