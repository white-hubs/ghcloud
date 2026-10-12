const colorMap = {
  qing: '#02C1C2',
  lv: '#83DB42',
  huang: '#FDB02B',
  hong: '#E44355',
  fen: '#DA83C8',
  zi: '#797AF0',
  lan: '#0084FD',
  ding: '#8E92CC',
  hei: '#333333',
  hui: '#999999',
};
export const colorsArr = [
  '#02C1C2',
  '#83DB42',
  '#FDB02B',
  '#E44355',
  'DA83C8',
  '#797AF0',
  '#0084FD',
  '#8E92CC',
  '#333333',
  '#999999',
];

export default colorMap;

export const colors = [
  colorMap.lan,
  colorMap.qing,
  colorMap.lv,
  colorMap.huang,
  colorMap.hong,
  colorMap.fen,
  colorMap.zi,
];
export let theme = 'defalut';
export const setTheme = (_theme = 'defalut') => {
  if (_theme === 'dark') {
    theme = 'dark';
    colorMap.hei = '#FFFFFF';
    colorMap.hui = '#FFFFFF20';
  } else {
    colorMap.hei = '#333333';
    colorMap.hui = '#999999';
    theme = 'defalut';
  }
};
