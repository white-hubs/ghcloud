import replacer from 'webpack-theme-color-replacer/client';
import generate from '@ant-design/colors/lib/generate';

const getAntdSerials = (color) => {
  const lightens = new Array(9).fill().map((t, i) => {
    return replacer.varyColor.lighten(color, i / 10);
  });
  const colorPalettes = generate(color);
  const rgb = replacer.varyColor.toNum3(color.replace('#', '')).join(',');
  return lightens.concat(colorPalettes).concat(rgb);
};
export function changeThemeColor(primaryColor) {
  const options = {
    newColors: getAntdSerials(primaryColor),
    appendToEl: 'head',
  };
  localStorage.setItem('theme_color', primaryColor);
  replacer.changer.changeColor(options);
}

export function initThemeColor() {
  const savedColor = localStorage.getItem('theme_color');
  if (savedColor) {
    changeThemeColor(savedColor);
  }
}
