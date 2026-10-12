const translations = {
  //属性面板的参数
  Id: 'ID',
  Name: '名称',
  Executable: '是否可执行',
};

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Translate
  template = translations[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    var str = replacements[key];
    if (
      translations[replacements[key]] !== null &&
      translations[replacements[key]] !== 'undefined'
    ) {
      str = translations[replacements[key]];
    }
    return str || '{' + key + '}';
  });
}
