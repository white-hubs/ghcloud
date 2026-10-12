// import iconsVue from '@ant-design/icons-vue';

// let allIcons = [];

import PngIcons from '@/data/png-icons';
const icons = {
  // 'play-circle': {
  //   group: 'web-hq',
  //   type: 'a-icon',
  //   name: 'play-circle',
  // },
  // apple: {
  //   group: 'web-site',
  //   type: 'a-icon',
  //   name: 'apple',
  // },
};
// 导入所有svg文件
// let contexts = require.context('@ant-design/icons/svg/outline', true, /\.svg$/);
// let reg = new RegExp('([^/.]+)[.]');
// contexts.keys().forEach((key) => {
//   const name = reg.exec(key)[1];
//   // const icon = contexts(key);
//   icons[name] = {
//     group: 'web-site',
//     type: 'a-icon',
//     theme: 'outline',
//     name: name,
//   };
// });
// import allVueIcons from '@ant-design/icons/lib/manifest';
import allVueIcons from './antd-icon-manifest';
allVueIcons.outline.forEach((icon) => {
  icons[icon] = {
    group: ['web-site', 'web-hq'],
    type: 'a-icon',
    theme: 'outlined',
    name: icon,
  };
});
// allVueIcons.fill.forEach((icon) => {
//   icons[icon] = {
//     group: 'web-site',
//     type: 'a-icon',
//     theme: 'filled',
//     name: icon,
//   };
// });
// allVueIcons.twotone.forEach((icon) => {
//   icons[icon] = {
//     group: 'web-site',
//     type: 'a-icon',
//     theme: 'twoTone',
//     name: icon,
//   };
// });
PngIcons.forEach((icon) => {
  icons[icon.name] = {
    group: ['web-site', 'web-hq', 'web-app'],
    type: 'image',
    ...icon,
  };
});

export default icons;
