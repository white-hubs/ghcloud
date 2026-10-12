import { createApp, h } from 'vue'
import { message } from 'ant-design-vue'
import Toast from './index.vue'
const RES = '/resource/v1/command-dispatch-putian-migrate'
const alarmIcon = `${RES}/images/alarm-icon.png`
const topBg = `${RES}/images/toast-bg.png`
export const openMessage = (msg = '报警长时间无人接收，请及时跟进处理', clickFn = () => { }) => {
  let innerText = h('span', { style: { color: '#fff', fontSize: '20px', fontWeight: '400' } }, msg);
  let innerImage = h('img', { style: { width: '40px', height: '40px' }, src: alarmIcon });
  let innerLink = h('div', {
    style: { fontSize: '14px', color: '#2989FF', fontWeight: '400', marginLeft: '22px', cursor: 'pointer' },
  }, '定位');
  let container = h('div', {
    style: {
      background: `url(${topBg}) no-repeat`,
      width: '500px',
      height: '62px',
      backgroundSize: '100% 100%',
      display: 'flex',
      color: '#fff',
      alignItems: 'center',
      cursor: 'pointer'
    },
    onClick: () => {
      message.config({
        getContainer: () => document.body,
      })
      message.destroy()
      clickFn()
    }
  }, [innerImage, innerText])
  message.destroy()
  message.config({
    getContainer: () => document.getElementById('commandDispatch'),
  })
  message.open({
    duration: 10,
    content: container,
    onClose: () => {
      message.destroy()
      message.config({
        getContainer: () => document.body,
      })
    }
  })
  message.config({
    getContainer: () => document.body,
  })
}
let toastCount = -1
let toastMargin = 82
let base64ImageUrl = ''
function getUrlBase64(url) {
  return new Promise((resolve, reject) => {
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    let img = new Image();
    img.crossOrigin = "Anonymous"; //解决Canvas.toDataURL 图片跨域问题
    img.src = url;
    img.onload = function () {
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0, img.width, img.height); //参数可自定义
      const dataURL = canvas.toDataURL("image/png", 1); //获取Base64编码
      resolve(dataURL);
      canvas = null; //清除canvas元素
      img = null; //清除img元素
    };
    img.onerror = function () {
      reject(new Error("Could not load image at " + url));
    };
  });
}
// 获取图片
(async () => {
  base64ImageUrl = await getUrlBase64(topBg);
})()


export const showToast = (msg = '报警长时间无人接收', options = { duration: 10000 }, handler = () => { }) => {
  ++toastCount
  const { duration } = options
  let timer = null
  clearTimeout(timer)
  if (timer) return;
  const div = document.createElement('div')
  const componentInstance = createApp(Toast, {
    msg,
    duration,
    background: base64ImageUrl,
    onLocate: handler,
    onHide: () => {
      toastCount = 0
      componentInstance.unmount(div);
      document.body.removeChild(div);
    },
    top: toastCount * toastMargin + 200
  })

  componentInstance.mount(div)
  document.body.appendChild(div)
  timer = setTimeout(() => {
    componentInstance.unmount(div);
    document.body.removeChild(div);
    toastCount = 0
  }, duration)
}
